import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { isSuperAdmin } from "@/app/lib/auth/superadmin";
import { prisma } from "@/app/lib/prisma/prisma";
import { getPlatformFeePercent } from "@/app/lib/platformConfig";

/**
 * GET /api/superadmin/telemetry
 * Returns zero-knowledge platform health, multi-tenant directory, GMV, SaaS revenue, and appeals.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!isSuperAdmin(session)) {
      return NextResponse.json(
        { error: "Forbidden: Superadmin access required" },
        { status: 403 }
      );
    }

    // 1. Multi-Tenant Aggregates & Ledgers
    const [
      totalCompanies,
      activeCompanies,
      suspendedCompanies,
      orderGMVAggregate,
      subTxAggregate,
      legacyTxAggregate,
      companies,
      pendingAppeals,
      recentOrders,
      recentTransactions,
    ] = await Promise.all([
      prisma.company.count(),
      prisma.company.count({ where: { status: "ACTIVE" } }),
      prisma.company.count({ where: { status: "SUSPENDED" } }),
      prisma.order.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amountKobo: true, platformFeeKobo: true, merchantNetKobo: true },
      }),
      prisma.subscriptionTransaction.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.company.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          members: {
            where: { role: "OWNER" },
            include: {
              user: { select: { email: true, phone: true } },
            },
            take: 1,
          },
          _count: {
            select: {
              products: true,
              orders: true,
            },
          },
        },
      }),
      prisma.appealRequest.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          company: {
            select: { id: true, name: true, slug: true, status: true },
          },
        },
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          company: {
            select: { name: true, slug: true },
          },
        },
      }),
      prisma.transaction.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { companyName: true },
          },
        },
      }),
    ]);

    const platformGMVKobo = orderGMVAggregate._sum.amountKobo || 0;
    const platformFeeKobo = orderGMVAggregate._sum.platformFeeKobo || 0;
    const saasRevenueKobo = (subTxAggregate._sum.amount || 0) + (legacyTxAggregate._sum.amount || 0);

    const formattedCompanies = companies.map((comp) => {
      const storageUsed = comp.storageUsed || 0;
      const storageLimit = comp.storageLimit || 1024;
      const storagePercent = Math.min(100, Math.round((storageUsed / storageLimit) * 100));

      const visits = comp.monthlyVisits || 0;
      const trafficLimit = comp.trafficLimit || 2000;
      const trafficPercent = Math.min(100, Math.round((visits / trafficLimit) * 100));

      const owner = comp.members[0]?.user;

      return {
        id: comp.id,
        name: comp.name,
        slug: comp.slug,
        industry: comp.industry,
        status: comp.status,
        planSelected: comp.planSelected,
        ownerEmail: owner?.email || "N/A",
        ownerPhone: owner?.phone || "N/A",
        storageUsedMB: storageUsed,
        storageLimitMB: storageLimit,
        storagePercent,
        monthlyVisits: visits,
        trafficLimit,
        trafficPercent,
        productCount: comp._count.products,
        orderCount: comp._count.orders,
        paystackSubaccountCode: comp.paystackSubaccountCode,
        createdAt: comp.createdAt.toISOString(),
      };
    });

    const formattedAppeals = pendingAppeals.map((app) => ({
      id: app.id,
      companyId: app.companyId,
      companyName: app.company.name,
      companySlug: app.company.slug,
      companyStatus: app.company.status,
      reason: app.reason,
      contactInfo: app.contactInfo,
      status: app.status,
      reviewedBy: app.reviewedBy,
      reviewNote: app.reviewNote,
      createdAt: app.createdAt.toISOString(),
    }));

    const formattedRecentOrders = recentOrders.map((ord) => ({
      id: ord.id,
      reference: ord.reference,
      invoiceNumber: ord.invoiceNumber,
      companyName: ord.company.name,
      companySlug: ord.company.slug,
      amountNGN: ord.amountKobo / 100,
      status: ord.status,
      orderType: ord.orderType,
      customerName: ord.customerName,
      customerPhone: ord.customerPhone,
      createdAt: ord.createdAt.toISOString(),
    }));

    const formattedTransactions = recentTransactions.map((tx) => ({
      id: tx.id,
      reference: tx.reference,
      companyName: tx.user?.companyName || "Merchant",
      amountNGN: tx.amount / 100,
      planSelected: tx.planSelected,
      status: tx.status,
      createdAt: tx.createdAt.toISOString(),
    }));

    const platformFeePercent = await getPlatformFeePercent();

    return NextResponse.json({
      success: true,
      telemetry: {
        // High-level KPIs
        totalCompanies,
        activeCompanies,
        suspendedCompanies,
        platformGMVNGN: Math.round(platformGMVKobo / 100),
        platformFeeNGN: Math.round(platformFeeKobo / 100),
        platformFeePercent,
        saasRevenueNGN: Math.round(saasRevenueKobo / 100),
        pendingAppealsCount: pendingAppeals.filter((a) => a.status === "PENDING").length,

        // Detailed Lists
        companies: formattedCompanies,
        appeals: formattedAppeals,
        recentOrders: formattedRecentOrders,
        recentTransactions: formattedTransactions,
      },
    });
  } catch (error) {
    console.error("[SuperadminTelemetryAPI] GET error:", error);
    return NextResponse.json({ error: "Failed to retrieve telemetry" }, { status: 500 });
  }
}
