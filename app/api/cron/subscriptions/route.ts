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

    // Protect Cron route (fail closed if CRON_SECRET is not configured or token mismatches)
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
      },
    });

    let emailsSent = 0;
    let expiredDeactivated = 0;

    for (const user of activeUsers) {
      // Calculate 30-day subscription cycle from latest completed payment or account creation
      const lastTransaction = user.transactions[0] || null;

      const subStartDate = lastTransaction ? lastTransaction.createdAt : user.updatedAt;
      const subEndDate = new Date(subStartDate);
      subEndDate.setDate(subEndDate.getDate() + 30);

      const diffMs = subEndDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const formattedEndDate = subEndDate.toISOString().split("T")[0];

      // 1. Subscription 1-Week Warning (7 days left)
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
      
      // 2. Subscription Has Ended (0 days or past due) -> Deactivate & Send Expiry Notice
      if (daysRemaining <= 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: { subscription_status: "INACTIVE" },
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
