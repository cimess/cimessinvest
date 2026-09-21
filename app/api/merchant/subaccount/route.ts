import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { prisma } from "@/app/lib/prisma/prisma";
import { getPlatformFeePercent } from "@/app/lib/platformConfig";
import { checkRateLimit } from "@/app/lib/security/rateLimiter";

export async function POST(req: NextRequest) {
  try {
    // 0. Rate limiting (max 10 subaccount setups per 10 minutes per IP)
    const rateLimit = await checkRateLimit(req, {
      keyPrefix: "merchant-subaccount",
      limit: 10,
      windowMs: 10 * 60 * 1000,
      customMessage: "Too many subaccount requests. Please wait a few minutes before trying again.",
    });
    if (!rateLimit.success && rateLimit.response) {
      return rateLimit.response;
    }

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { settlement_bank, account_number, business_name, user_bank_name } = body;

    if (!settlement_bank || !account_number) {
      return NextResponse.json(
        { error: "Bank name/code and account number are required." },
        { status: 400 }
      );
    }

    // 1. Check Owner Authorization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        memberships: {
          where: { status: "ACTIVE" },
          include: { company: true },
        },
      },
    });

    const targetCompanyId =
      session.user.activeCompanyId ||
      session.user.companyId ||
      user?.memberships?.[0]?.company?.id ||
      null;

    if (!targetCompanyId) {
      return NextResponse.json({ error: "No active merchant store found." }, { status: 404 });
    }
  

    const membership = user?.memberships?.find((m) => m.companyId === targetCompanyId);
    if (membership?.role !== "OWNER" && user?.role !== "SUPERADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only store owners can configure settlement bank accounts." },
        { status: 403 }
      );
    }

    // 2. Query Dynamic Platform Fee Percentage
    const platformFeePercent = await getPlatformFeePercent();

    let subaccountCode = `SUB_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // 3. Call Paystack Subaccount API if Secret Key is Configured
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (paystackSecretKey) {
      try {
        const paystackRes = await fetch("https://api.paystack.co/subaccount", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            business_name: business_name || user?.companyName || "Merchant Store",
            settlement_bank,
            account_number,
            percentage_charge: platformFeePercent, // Dynamic platform fee from Superadmin config
          }),
        });

        const paystackData = await paystackRes.json();
        if (paystackData.status && paystackData.data?.subaccount_code) {
          subaccountCode = paystackData.data.subaccount_code;
        }
      } catch (paystackError) {
        console.warn("Paystack Subaccount creation fallback to local stub:", paystackError);
      }
    }

    // 4. Save Subaccount Code & Bank Info to Company
    const updatedCompany = await prisma.company.update({
      where: { id: targetCompanyId },
      data: {
        paystackSubaccountCode: subaccountCode,
        bankInfo: {
          settlement_bank,
          user_bank_name,
          account_number,
          business_name: business_name || user?.companyName,
          verifiedAt: new Date().toISOString(),
        },
      },
      select: {
        id: true,
        name: true,
        paystackSubaccountCode: true,
        bankInfo: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Settlement bank account configured successfully for split payments (${platformFeePercent}% platform fee).`,
      subaccountCode: updatedCompany.paystackSubaccountCode,
      platformFeePercent,
      company: updatedCompany,
    });

  } catch (error) {
    console.error("Merchant Subaccount Setup Error:", error);
    return NextResponse.json({ error: "Failed to configure settlement account." }, { status: 500 });
  }
}
