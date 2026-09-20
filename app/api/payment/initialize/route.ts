import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { initializePaystackTransaction, PaidPlanType } from "@/app/api/service/payment.service";
import { prisma } from "@/app/lib/prisma/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    const { planSelected, callbackUrl, email } = body;

    let userId = session?.user?.id;
    let userEmail = session?.user?.email;
    let userRole = (session?.user?.role || "").toUpperCase();

    if (!userId && email) {
      const foundUser = await prisma.user.findFirst({
        where: { email: { equals: email.trim(), mode: "insensitive" } },
        select: { id: true, email: true, role: true },
      });
      if (foundUser) {
        userId = foundUser.id;
        userEmail = foundUser.email;
        userRole = (foundUser.role || "ADMIN").toUpperCase();
      }
    }

    if (!userId || !userEmail) {
      return NextResponse.json(
        { message: "Authentication required to initialize subscription." },
        { status: 401 }
      );
    }

    if (userRole === "MANAGER") {
      return NextResponse.json(
        { message: "Forbidden: Store managers are not permitted to manage billing or initiate payments." },
        { status: 403 }
      );
    }

    const validPlans: PaidPlanType[] = ["STARTER", "PROFESSIONAL", "ENTERPRISE"];
    const plan: PaidPlanType = validPlans.includes((planSelected || "").toUpperCase() as PaidPlanType)
      ? ((planSelected || "").toUpperCase() as PaidPlanType)
      : "STARTER";

    // If request is explicitly for trial activation (e.g., onboarding 14-day trial)
    if (body.trial === true || body.activateTrial === true) {
      const isPro = plan === "PROFESSIONAL";
      const storageLimit = isPro ? 2000 : 500;
      const trafficLimit = isPro ? 15000 : 2000;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          planSelected: plan,
          storageLimit,
          trafficLimit,
        },
        select: {
          id: true,
          email: true,
          planSelected: true,
          storageLimit: true,
          trafficLimit: true,
          subscription_status: true,
        },
      });

      const targetCompanyId =
        session?.user?.activeCompanyId ||
        session?.user?.companyId;

      let updatedCompany = null;
      if (targetCompanyId) {
        updatedCompany = await prisma.company.update({
          where: { id: targetCompanyId },
          data: {
            planSelected: plan as any,
            storageLimit,
            trafficLimit,
          },
        }).catch(() => null);
      } else {
        const membership = await prisma.companyMember.findFirst({
          where: { userId, status: "ACTIVE" },
          select: { companyId: true },
        });
        if (membership?.companyId) {
          updatedCompany = await prisma.company.update({
            where: { id: membership.companyId },
            data: {
              planSelected: plan as any,
              storageLimit,
              trafficLimit,
            },
          }).catch(() => null);
        }
      }

      return NextResponse.json({
        success: true,
        plan,
        trial: true,
        message: `${plan === "PROFESSIONAL" ? "Professional" : "Starter"} plan activated successfully.`,
        user: updatedUser,
        company: updatedCompany,
      });
    }

    // 1. Check if an approved CustomPlanQuote exists for this user (Superadmin authorized deal)
    let authorizedCustomAmountKobo: number | undefined;
    let authorizedCustomStorageMB: number | undefined;

    if (plan === "ENTERPRISE") {
      const activeQuote = await prisma.customPlanQuote.findFirst({
        where: { userId, status: "APPROVED" },
        orderBy: { createdAt: "desc" },
      });

      if (activeQuote) {
        authorizedCustomAmountKobo = activeQuote.authorizedAmountKobo;
        authorizedCustomStorageMB = activeQuote.authorizedStorageMB;
      }
    }

    const paymentInitResult = await initializePaystackTransaction({
      userId,
      email: userEmail,
      planSelected: plan,
      customAmountKobo: authorizedCustomAmountKobo,
      customStorageMB: authorizedCustomStorageMB,
      callbackUrl,
    });
if(paymentInitResult && paymentInitResult.success){
    return NextResponse.json({
      success: true,
      message: "Payment initialization successful.",
      authorization_url: paymentInitResult.authorization_url,
      reference: paymentInitResult.reference,
      access_code: paymentInitResult.access_code,
    });
  }
  return NextResponse.json({ message: "Unable to initialize transaction" }, { status: 400 });

  } catch (error) {
    // 1. Log full critical/Prisma stack trace in server console
    console.error("Payment Initialization Error:", error);

    if (error instanceof Error) {
      // 2. Identify if it's a Prisma database error or critical system error
      const isPrismaError =
        error.name.includes("Prisma") ||
        ("code" in error && typeof (error as {code: string}).code === "string" && (error as {code: string}).code.startsWith("P"));

      if (isPrismaError) {
        return NextResponse.json(
          { message: "A database error occurred. Please try again later." },
          { status: 500 }
        );
      }

      // 3. Return user-friendly validation error (e.g. Downgrade Prevention) with HTTP 400
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    // 4. Fallback for unexpected error types
    return NextResponse.json(
      { message: "An unexpected error occurred during payment initialization." },
      { status: 500 }
    );
  }
}
