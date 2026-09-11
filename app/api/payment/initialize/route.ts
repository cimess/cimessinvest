import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { initializePaystackTransaction, PlanType } from "@/app/api/service/payment.service";


export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized user session" }, { status: 401 });
    }

    const body = await req.json();
    const { planSelected, callbackUrl } = body;

    const validPlans: PlanType[] = ["STARTER", "PROFESSIONAL", "ENTERPRISE"];
    const plan: PlanType = validPlans.includes((planSelected || "").toUpperCase())
      ? (planSelected.toUpperCase() as PlanType)
      : "STARTER";

    // 1. Check if an approved CustomPlanQuote exists for this user (Superadmin authorized deal)
    let authorizedCustomAmountKobo: number | undefined;
    let authorizedCustomStorageMB: number | undefined;

    if (plan === "ENTERPRISE") {
      const { prisma } = await import("@/app/lib/prisma/prisma");
      const activeQuote = await prisma.customPlanQuote.findFirst({
        where: { userId: session.user.id, status: "APPROVED" },
        orderBy: { createdAt: "desc" },
      });

      if (activeQuote) {
        authorizedCustomAmountKobo = activeQuote.authorizedAmountKobo;
        authorizedCustomStorageMB = activeQuote.authorizedStorageMB;
      }
    }

    const paymentInitResult = await initializePaystackTransaction({
      userId: session.user.id,
      email: session.user.email || "",
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
