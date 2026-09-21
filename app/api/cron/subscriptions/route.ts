import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma/prisma";
import { triggerSubscriptionDueEmail } from "@/app/api/workers/emailWorker";

/**
 * GET /api/cron/subscriptions
 * Vercel Cron Job endpoint running daily to process subscription expiry checks & warnings.
 */
export async function GET(req: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get("authorization");

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
    }

    const now = new Date();

    const activeUsers = await prisma.user.findMany({
      where: { subscription_status: "ACTIVE" },
      select: {
        id: true,
        email: true,
        companyName: true,
        planSelected: true,
        updatedAt: true,
        transactions: {
          where: { status: "COMPLETED" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
        memberships: {
          where: { status: "ACTIVE" },
          take: 1,
          select: {
            companyId: true,
            company: {
              select: {
                id: true,
                trialEndsAt: true,
                planSelected: true,
              },
            },
          },
        },
      },
    });

    let emailsSent = 0;
    let expiredDeactivated = 0;

    for (const user of activeUsers) {
      const lastTransaction = user.transactions[0] || null;
      const membership = user.memberships[0] || null;
      const company = membership?.company || null;

      const isTrial = user.planSelected === "FREE_TRIAL";

      const subEndDate =
        isTrial && company?.trialEndsAt
          ? new Date(company.trialEndsAt)
          : (() => {
              const startDate = lastTransaction ? lastTransaction.createdAt : user.updatedAt;
              const endDate = new Date(startDate);
              endDate.setDate(endDate.getDate() + 30);
              return endDate;
            })();

      const diffMs = subEndDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const formattedEndDate = subEndDate.toISOString().split("T")[0];

      if (daysRemaining === 7) {
        await triggerSubscriptionDueEmail({
          userId: user.id,
          toEmail: user.email,
          userName: user.companyName || user.email,
          daysRemaining: 7,
          renewalDate: formattedEndDate,
          planName: user.planSelected,
        });

        emailsSent++;
      }

      if (daysRemaining <= 0) {
        await prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: user.id },
            data: { subscription_status: "INACTIVE" },
          });

          if (membership?.companyId) {
            await tx.company.update({
              where: { id: membership.companyId },
              data: {
                subscription_status: "INACTIVE",
                status: isTrial ? "TRIAL_EXPIRED" : "SUSPENDED",
              },
            });
          }
        });

        await triggerSubscriptionDueEmail({
          userId: user.id,
          toEmail: user.email,
          userName: user.companyName || user.email,
          daysRemaining: 0,
          renewalDate: formattedEndDate,
          planName: user.planSelected,
        });

        expiredDeactivated++;
        emailsSent++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cron check completed. ${emailsSent} emails sent, ${expiredDeactivated} subscriptions set to INACTIVE.`,
      activeUsersChecked: activeUsers.length,
      emailsSent,
      expiredDeactivated,
    });
  } catch (error: unknown) {
    console.error("[VercelCron] Subscription worker check error:", error);
    const msg = error instanceof Error ? error.message : "Cron execution error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
