import { prisma } from "@/app/lib/prisma/prisma";
import { triggerTrafficWarning80, triggerTrafficLimit100 } from "@/app/api/workers/emailWorker";

// Fixed Monthly Traffic Limits by Plan (in Page Views / Visits)
export const PLAN_TRAFFIC_LIMITS: Record<string, number> = {
  FREE_TRIAL: 2000,
  STARTER: 2000,
  PROFESSIONAL: 15000,
  ENTERPRISE: 50000, // Fallback default if custom quote does not specify
};

export interface TrafficQuotaStatus {
  userId: string;
  email: string;
  companyName: string;
  planSelected: string;
  monthlyVisits: number;
  trafficLimit: number;
  remainingVisits: number;
  usedPercentage: number;
  isNearLimit: boolean; // True if >= 80%
  isCapped: boolean; // True if >= 100%
  lastTrafficReset: Date;
}

export interface CompanyTrafficQuotaStatus {
  companyId: string;
  companyName: string;
  companySlug: string;
  planSelected: string;
  monthlyVisits: number;
  trafficLimit: number;
  remainingVisits: number;
  usedPercentage: number;
  isNearLimit: boolean;
  isCapped: boolean;
  lastTrafficReset: Date;
}

/**
 * Checks a Company tenant's monthly traffic usage against its assigned quota.
 * Automatically handles 30-day rolling cycle resets.
 */
export async function checkCompanyTrafficQuota(companyId: string): Promise<CompanyTrafficQuotaStatus> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      name: true,
      slug: true,
      planSelected: true,
      monthlyVisits: true,
      trafficLimit: true,
      trafficNotified80: true,
      trafficNotified100: true,
      lastTrafficReset: true,
    },
  });

  if (!company) {
    throw new Error(`Company workspace with ID "${companyId}" not found.`);
  }

  const now = new Date();
  const lastReset = company.lastTrafficReset || new Date();
  const daysSinceReset = (now.getTime() - new Date(lastReset).getTime()) / (1000 * 60 * 60 * 24);

  let currentVisits = company.monthlyVisits || 0;
  let lastResetDate = lastReset;

  // Auto-reset counter if 30 days have elapsed
  if (daysSinceReset >= 30) {
    currentVisits = 0;
    lastResetDate = now;

    await prisma.company.update({
      where: { id: companyId },
      data: {
        monthlyVisits: 0,
        trafficNotified80: false,
        trafficNotified100: false,
        lastTrafficReset: now,
      },
    });
  }

  const planLimit = company.trafficLimit || PLAN_TRAFFIC_LIMITS[company.planSelected] || 2000;
  const remainingVisits = Math.max(0, planLimit - currentVisits);
  const rawPercentage = planLimit > 0 ? (currentVisits / planLimit) * 100 : 0;
  const usedPercentage = Math.min(100, Math.round(rawPercentage));
  const isNearLimit = usedPercentage >= 80;
  const isCapped = currentVisits >= planLimit;

  return {
    companyId: company.id,
    companyName: company.name || "Unknown Brand",
    companySlug: company.slug,
    planSelected: company.planSelected,
    monthlyVisits: currentVisits,
    trafficLimit: planLimit,
    remainingVisits,
    usedPercentage,
    isNearLimit,
    isCapped,
    lastTrafficReset: lastResetDate,
  };
}

/**
 * Records a page visit for a Company tenant and triggers alerts at 80% and 100%.
 */
export async function recordCompanyVisit(companyId: string): Promise<CompanyTrafficQuotaStatus> {
  const updatedCompany = await prisma.company.update({
    where: { id: companyId },
    data: {
      monthlyVisits: { increment: 1 },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      planSelected: true,
      monthlyVisits: true,
      trafficLimit: true,
      trafficNotified80: true,
      trafficNotified100: true,
      lastTrafficReset: true,
      members: {
        where: { role: "OWNER" },
        include: { user: { select: { id: true, email: true, companyName: true } } },
        take: 1,
      },
    },
  });

  // Asynchronously record into AnalyticsMetrics for historical breakdown (monthly/yearly)
  (async () => {
    try {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

      const existingRecord = await prisma.analyticsMetrics.findFirst({
        where: {
          companyId,
          date: { gte: today, lt: tomorrow },
        },
      });

      if (existingRecord) {
        await prisma.analyticsMetrics.update({
          where: { id: existingRecord.id },
          data: { pageViews: { increment: 1 } },
        });
      } else {
        await prisma.analyticsMetrics.create({
          data: {
            companyId,
            date: today,
            pageViews: 1,
            whatsappClicks: 0,
          },
        });
      }
    } catch (e) {
      console.error("[TrafficWorker] AnalyticsMetrics daily recording failed:", e);
    }
  })();

  const currentVisits = updatedCompany.monthlyVisits;
  const planLimit = updatedCompany.trafficLimit || PLAN_TRAFFIC_LIMITS[updatedCompany.planSelected] || 2000;
  const remainingVisits = Math.max(0, planLimit - currentVisits);
  const rawPercentage = planLimit > 0 ? (currentVisits / planLimit) * 100 : 0;
  const usedPercentage = Math.min(100, Math.round(rawPercentage));
  const isNearLimit = usedPercentage >= 80;
  const isCapped = currentVisits >= planLimit;

  const ownerUser = updatedCompany.members[0]?.user;

  // Automated Alert: 80% Quota Trigger
  if (usedPercentage >= 80 && !updatedCompany.trafficNotified80 && !isCapped && ownerUser) {
    await prisma.company.update({
      where: { id: companyId },
      data: { trafficNotified80: true },
    });

    triggerTrafficWarning80({
      userId: ownerUser.id,
      toEmail: ownerUser.email,
      userName: updatedCompany.name || ownerUser.companyName || ownerUser.email,
      monthlyVisits: currentVisits,
      trafficLimit: planLimit,
      usedPercentage,
    }).catch((err) => console.error("[TrafficWorker] 80% email trigger failed:", err));
  }

  // Automated Alert: 100% Quota Cap Trigger
  if (isCapped && !updatedCompany.trafficNotified100 && ownerUser) {
    await prisma.company.update({
      where: { id: companyId },
      data: { trafficNotified100: true },
    });

    triggerTrafficLimit100({
      userId: ownerUser.id,
      toEmail: ownerUser.email,
      userName: updatedCompany.name || ownerUser.companyName || ownerUser.email,
      monthlyVisits: currentVisits,
      trafficLimit: planLimit,
      usedPercentage,
    }).catch((err) => console.error("[TrafficWorker] 100% email trigger failed:", err));
  }

  return {
    companyId: updatedCompany.id,
    companyName: updatedCompany.name || "Unknown Brand",
    companySlug: updatedCompany.slug,
    planSelected: updatedCompany.planSelected,
    monthlyVisits: currentVisits,
    trafficLimit: planLimit,
    remainingVisits,
    usedPercentage,
    isNearLimit,
    isCapped,
    lastTrafficReset: updatedCompany.lastTrafficReset,
  };
}

/**
 * Checks a user's monthly traffic usage, delegating to Company if available.
 */
export async function checkTrafficQuota(userId: string): Promise<TrafficQuotaStatus> {
  const membership = await prisma.companyMember.findFirst({
    where: { userId },
    select: { companyId: true },
  });

  if (membership?.companyId) {
    const companyStatus = await checkCompanyTrafficQuota(membership.companyId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    return {
      userId,
      email: user?.email || "",
      companyName: companyStatus.companyName,
      planSelected: companyStatus.planSelected,
      monthlyVisits: companyStatus.monthlyVisits,
      trafficLimit: companyStatus.trafficLimit,
      remainingVisits: companyStatus.remainingVisits,
      usedPercentage: companyStatus.usedPercentage,
      isNearLimit: companyStatus.isNearLimit,
      isCapped: companyStatus.isCapped,
      lastTrafficReset: companyStatus.lastTrafficReset,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      companyName: true,
      planSelected: true,
      monthlyVisits: true,
      trafficLimit: true,
      trafficNotified80: true,
      trafficNotified100: true,
      lastTrafficReset: true,
    },
  });

  if (!user) {
    throw new Error(`User with ID "${userId}" not found.`);
  }

  const now = new Date();
  const lastReset = user.lastTrafficReset || new Date();
  const daysSinceReset = (now.getTime() - new Date(lastReset).getTime()) / (1000 * 60 * 60 * 24);

  let currentVisits = user.monthlyVisits || 0;
  let lastResetDate = lastReset;

  if (daysSinceReset >= 30) {
    currentVisits = 0;
    lastResetDate = now;

    await prisma.user.update({
      where: { id: userId },
      data: {
        monthlyVisits: 0,
        trafficNotified80: false,
        trafficNotified100: false,
        lastTrafficReset: now,
      },
    });
  }

  const planLimit = user.trafficLimit || PLAN_TRAFFIC_LIMITS[user.planSelected] || 2000;
  const remainingVisits = Math.max(0, planLimit - currentVisits);
  const rawPercentage = planLimit > 0 ? (currentVisits / planLimit) * 100 : 0;
  const usedPercentage = Math.min(100, Math.round(rawPercentage));
  const isNearLimit = usedPercentage >= 80;
  const isCapped = currentVisits >= planLimit;

  return {
    userId: user.id,
    email: user.email,
    companyName: user.companyName || "Unknown Brand",
    planSelected: user.planSelected,
    monthlyVisits: currentVisits,
    trafficLimit: planLimit,
    remainingVisits,
    usedPercentage,
    isNearLimit,
    isCapped,
    lastTrafficReset: lastResetDate,
  };
}

/**
 * Increments an atelier's visit count, delegating to Company if available.
 */
export async function recordAtelierVisit(userId: string): Promise<TrafficQuotaStatus> {
  const membership = await prisma.companyMember.findFirst({
    where: { userId },
    select: { companyId: true },
  });

  if (membership?.companyId) {
    const companyStatus = await recordCompanyVisit(membership.companyId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    return {
      userId,
      email: user?.email || "",
      companyName: companyStatus.companyName,
      planSelected: companyStatus.planSelected,
      monthlyVisits: companyStatus.monthlyVisits,
      trafficLimit: companyStatus.trafficLimit,
      remainingVisits: companyStatus.remainingVisits,
      usedPercentage: companyStatus.usedPercentage,
      isNearLimit: companyStatus.isNearLimit,
      isCapped: companyStatus.isCapped,
      lastTrafficReset: companyStatus.lastTrafficReset,
    };
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      monthlyVisits: { increment: 1 },
    },
    select: {
      id: true,
      email: true,
      companyName: true,
      planSelected: true,
      monthlyVisits: true,
      trafficLimit: true,
      trafficNotified80: true,
      trafficNotified100: true,
      lastTrafficReset: true,
    },
  });

  const currentVisits = updatedUser.monthlyVisits;
  const planLimit = updatedUser.trafficLimit || PLAN_TRAFFIC_LIMITS[updatedUser.planSelected] || 2000;
  const remainingVisits = Math.max(0, planLimit - currentVisits);
  const rawPercentage = planLimit > 0 ? (currentVisits / planLimit) * 100 : 0;
  const usedPercentage = Math.min(100, Math.round(rawPercentage));
  const isNearLimit = usedPercentage >= 80;
  const isCapped = currentVisits >= planLimit;

  if (usedPercentage >= 80 && !updatedUser.trafficNotified80 && !isCapped) {
    await prisma.user.update({
      where: { id: userId },
      data: { trafficNotified80: true },
    });

    triggerTrafficWarning80({
      userId: updatedUser.id,
      toEmail: updatedUser.email,
      userName: updatedUser.companyName || updatedUser.email,
      monthlyVisits: currentVisits,
      trafficLimit: planLimit,
      usedPercentage,
    }).catch((err) => console.error("[TrafficWorker] 80% email trigger failed:", err));
  }

  if (isCapped && !updatedUser.trafficNotified100) {
    await prisma.user.update({
      where: { id: userId },
      data: { trafficNotified100: true },
    });

    triggerTrafficLimit100({
      userId: updatedUser.id,
      toEmail: updatedUser.email,
      userName: updatedUser.companyName || updatedUser.email,
      monthlyVisits: currentVisits,
      trafficLimit: planLimit,
      usedPercentage,
    }).catch((err) => console.error("[TrafficWorker] 100% email trigger failed:", err));
  }

  return {
    userId: updatedUser.id,
    email: updatedUser.email,
    companyName: updatedUser.companyName || "Unknown Brand",
    planSelected: updatedUser.planSelected,
    monthlyVisits: currentVisits,
    trafficLimit: planLimit,
    remainingVisits,
    usedPercentage,
    isNearLimit,
    isCapped,
    lastTrafficReset: updatedUser.lastTrafficReset,
  };
}

// -----------------------------------------------------------------------------
// In-Memory Batched Traffic Analytics Buffer (High-Performance Edge Resilience)
// -----------------------------------------------------------------------------
const visitBuffer = new Map<string, number>();
let flushTimeout: NodeJS.Timeout | null = null;

export async function bufferCompanyVisit(companyId: string): Promise<void> {
  const current = visitBuffer.get(companyId) || 0;
  visitBuffer.set(companyId, current + 1);

  if (current + 1 >= 20) {
    await flushVisitBuffer();
  } else if (!flushTimeout) {
    flushTimeout = setTimeout(() => {
      flushVisitBuffer().catch((err) => console.error("[TrafficWorker] Buffered flush error:", err));
    }, 10000);
  }
}

export async function flushVisitBuffer(): Promise<void> {
  if (flushTimeout) {
    clearTimeout(flushTimeout);
    flushTimeout = null;
  }

  const entries = Array.from(visitBuffer.entries());
  visitBuffer.clear();

  for (const [companyId, count] of entries) {
    try {
      await prisma.company.update({
        where: { id: companyId },
        data: { monthlyVisits: { increment: count } },
      });

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

      const metric = await prisma.analyticsMetrics.findFirst({
        where: { companyId, date: { gte: today, lt: tomorrow } },
      });

      if (metric) {
        await prisma.analyticsMetrics.update({
          where: { id: metric.id },
          data: { pageViews: { increment: count } },
        });
      } else {
        await prisma.analyticsMetrics.create({
          data: {
            companyId,
            date: today,
            pageViews: count,
            whatsappClicks: 0,
          },
        });
      }
    } catch (e) {
      console.error(`[TrafficWorker] Failed to flush visits for company ${companyId}:`, e);
    }
  }
}
