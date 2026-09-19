import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { prisma } from "@/app/lib/prisma/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Locate User & Company
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

    const company = await prisma.company.findUnique({
      where: { id: targetCompanyId },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found." }, { status: 404 });
    }

    // 2. Automated 24-Hour Settlement Auto-Sweep (Reconcile pending orders older than 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const maturedOrders = await prisma.order.findMany({
      where: {
        companyId: company.id,
        status: "COMPLETED",
        settlementStatus: "PENDING_24H",
        createdAt: { lte: twentyFourHoursAgo },
      },
      select: {
        id: true,
        merchantNetKobo: true,
      },
    });

    let autoSettledKobo = 0;
    if (maturedOrders.length > 0) {
      const orderIds = maturedOrders.map((o) => o.id);
      autoSettledKobo = maturedOrders.reduce((sum, o) => sum + (o.merchantNetKobo || 0), 0);

      // Transition matured orders to SETTLED
      await prisma.order.updateMany({
        where: { id: { in: orderIds } },
        data: {
          settlementStatus: "SETTLED",
          settledAt: new Date(),
        },
      });

      // Atomically reduce pendingBalance and increment settledBalance on the DB
      await prisma.company.update({
        where: { id: company.id },
        data: {
          pendingBalanceKobo: { decrement: autoSettledKobo },
          settledBalanceKobo: { increment: autoSettledKobo },
        },
      });
    }

    // 3. Compute Real Today's Sales (Since 00:00:00 today)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayOrdersAgg = await prisma.order.aggregate({
      where: {
        companyId: company.id,
        status: "COMPLETED",
        createdAt: { gte: startOfToday },
      },
      _sum: { merchantNetKobo: true },
    });

    const realTodaySalesKobo = todayOrdersAgg._sum.merchantNetKobo || 0;

    // Refresh company record from DB
    const currentCompany = await prisma.company.findUnique({
      where: { id: company.id },
    });

    if (!currentCompany) {
      return NextResponse.json({ error: "Company lookup failed." }, { status: 500 });
    }

    // Synchronize todaySalesKobo on the DB if needed
    if (currentCompany.todaySalesKobo !== realTodaySalesKobo) {
      await prisma.company.update({
        where: { id: company.id },
        data: { todaySalesKobo: realTodaySalesKobo },
      });
    }

    // Count open disputes and pending orders
    const [pendingCount, disputedCount] = await Promise.all([
      prisma.order.count({
        where: {
          companyId: company.id,
          status: "COMPLETED",
          settlementStatus: "PENDING_24H",
        },
      }),
      prisma.order.count({
        where: {
          companyId: company.id,
          settlementStatus: "HELD_DISPUTED",
        },
      }),
    ]);

    // 4. Live Paystack Subaccount & Settlement Verification
    let paystackSubaccountData: any = null;
    let paystackSettlements: any[] = [];
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const subaccountCode = currentCompany.paystackSubaccountCode;

    if (secretKey && subaccountCode) {
      try {
        // Fetch subaccount details
        const subRes = await fetch(`https://api.paystack.co/subaccount/${encodeURIComponent(subaccountCode)}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${secretKey}` },
          next: { revalidate: 30 },
        });
        const subJson = await subRes.json();
        if (subJson.status && subJson.data) {
          paystackSubaccountData = subJson.data;
        }

        // Fetch settlement payouts for this subaccount
        const settleRes = await fetch(
          `https://api.paystack.co/settlement?subaccount=${encodeURIComponent(subaccountCode)}&perPage=10`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${secretKey}` },
            next: { revalidate: 60 },
          }
        );
        const settleJson = await settleRes.json();
        if (settleJson.status && Array.isArray(settleJson.data)) {
          paystackSettlements = settleJson.data;
        }
      } catch (paystackErr) {
        console.warn("[MerchantBalanceAPI] Paystack API sync warning:", paystackErr);
      }
    }

    // Fallback bank info from stored JSON if Paystack API was unavailable
    const storedBankInfo = (currentCompany.bankInfo as any) || {};

    return NextResponse.json({
      success: true,
      balances: {
        todaySalesNaira: Math.round(realTodaySalesKobo / 100),
        pendingSettlementNaira: Math.max(0, Math.round(currentCompany.pendingBalanceKobo / 100)),
        settledBankNaira: Math.round(currentCompany.settledBalanceKobo / 100),
        disputedNaira: Math.round(currentCompany.disputedBalanceKobo / 100),
        pendingCount,
        disputedCount,
        autoSettledTodayNaira: Math.round(autoSettledKobo / 100),
      },
      subaccount: {
        code: subaccountCode || null,
        bankName:
          paystackSubaccountData?.settlement_bank ||
          storedBankInfo.bank_name ||
          storedBankInfo.settlement_bank ||
          null,
        accountNumber:
          paystackSubaccountData?.account_number ||
          storedBankInfo.account_number ||
          null,
        businessName:
          paystackSubaccountData?.business_name ||
          storedBankInfo.business_name ||
          currentCompany.name,
        percentageCharge:
          paystackSubaccountData?.percentage_charge ??
          storedBankInfo.percentage_charge ??
          5,
        isActive: paystackSubaccountData?.active ?? Boolean(subaccountCode),
        isLive: paystackSubaccountData?.is_verified ?? true,
      },
      paystackSettlements: paystackSettlements.map((s) => ({
        id: s.id,
        settlementDate: s.settlement_date,
        totalAmountNaira: Math.round((s.total_amount || 0) / 100),
        status: s.status,
      })),
    });
  } catch (error) {
    console.error("[MerchantBalanceAPI] Error:", error);
    return NextResponse.json(
      { error: "Internal server error fetching merchant balance." },
      { status: 500 }
    );
  }
}
