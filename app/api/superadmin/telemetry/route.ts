import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { isSuperAdmin } from "@/app/lib/auth/superadmin";
import { prisma } from "@/app/lib/prisma/prisma";

/**
 * GET /api/superadmin/telemetry
 * Returns zero-knowledge platform health, atelier quotas, and recent Paystack transactions.
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

    // 1. Platform-wide metric aggregates
    const [
      totalAteliers,
      activeSubscriptions,
      storageAggregate,
      trafficAggregate,
      ateliers,
      recentTransactions,
    ] = await Promise.all([
      prisma.user.count({ where: { role: { not: "SUPERADMIN" } } }),
      prisma.user.count({ where: { subscription_status: "ACTIVE" } }),
      prisma.user.aggregate({
        _sum: { storageUsed: true, storageLimit: true },
      }),
      prisma.user.aggregate({
        _sum: { monthlyVisits: true, trafficLimit: true },
      }),
      prisma.user.findMany({
        where: { role: { not: "SUPERADMIN" } },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          companyName: true,
          email: true,
          planSelected: true,
          subscription_status: true,
          paymentVerified: true,
          storageUsed: true,
          storageLimit: true,
          monthlyVisits: true,
          trafficLimit: true,
          createdAt: true,
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

    const formattedAteliers = ateliers.map((a) => {
      const storageUsed = a.storageUsed || 0;
      const storageLimit = a.storageLimit || 500;
      const storagePercent = Math.min(100, Math.round((storageUsed / storageLimit) * 100));

      const visits = a.monthlyVisits || 0;
      const trafficLimit = a.trafficLimit || 2000;
      const trafficPercent = Math.min(100, Math.round((visits / trafficLimit) * 100));

      return {
        id: a.id,
        companyName: a.companyName,
        email: a.email,
        planSelected: a.planSelected,
        subscription_status: a.subscription_status,
        paymentVerified: a.paymentVerified,
        storageUsedMB: storageUsed,
        storageLimitMB: storageLimit,
        storagePercent,
        monthlyVisits: visits,
        trafficLimit,
        trafficPercent,
        createdAt: a.createdAt.toISOString(),
      };
    });

    const formattedTransactions = recentTransactions.map((tx) => ({
      id: tx.id,
      reference: tx.reference,
      companyName: tx.user?.companyName || "Atelier",
      amountNGN: tx.amount / 100,
      planSelected: tx.planSelected,
      status: tx.status,
      createdAt: tx.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      telemetry: {
        totalAteliers,
        activeSubscriptions,
        totalStorageUsedMB: storageAggregate._sum.storageUsed || 0,
        totalStorageLimitMB: storageAggregate._sum.storageLimit || 0,
        totalMonthlyVisits: trafficAggregate._sum.monthlyVisits || 0,
        ateliers: formattedAteliers,
        recentTransactions: formattedTransactions,
      },
    });
  } catch (error) {
    console.error("[SuperadminTelemetryAPI] GET error:", error);
    return NextResponse.json({ error: "Failed to retrieve telemetry" }, { status: 500 });
  }
}
