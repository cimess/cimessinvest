import { prisma } from "@/app/lib/prisma/prisma";
import { triggerTrafficWarning80, triggerTrafficLimit100 } from "@/app/api/workers/emailWorker";

// Fixed Monthly Traffic Limits by Plan (in Page Views / Visits)
export const PLAN_TRAFFIC_LIMITS: Record<string, number> = {
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

/**
 * Checks a user's monthly traffic usage against their assigned quota.
 * Automatically handles 30-day rolling cycle resets.
 */
export async function checkTrafficQuota(userId: string): Promise<TrafficQuotaStatus> {
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
  let notified80 = user.trafficNotified80;
  let notified100 = user.trafficNotified100;
  let lastResetDate = lastReset;

  // 1. Auto-reset counter if 30 days have elapsed
  if (daysSinceReset >= 30) {
    currentVisits = 0;
    notified80 = false;
    notified100 = false;
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
    companyName: user.companyName,
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
 * Increments an atelier's visit count and triggers automated email alerts
 * at 80% and 100% capacity (with cycle-aware duplicate suppression).
 */
export async function recordAtelierVisit(userId: string): Promise<TrafficQuotaStatus> {
  // 1. Atomically increment visits
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

  const quota = await checkTrafficQuota(userId);

  // 2. Automated 80% Warning Trigger
  if (quota.usedPercentage >= 80 && quota.usedPercentage < 100 && !updatedUser.trafficNotified80) {
    await prisma.user.update({
      where: { id: userId },
      data: { trafficNotified80: true },
    });

    triggerTrafficWarning80({
      userId: quota.userId,
      toEmail: quota.email,
      userName: quota.companyName || quota.email,
      monthlyVisits: quota.monthlyVisits,
      trafficLimit: quota.trafficLimit,
      usedPercentage: quota.usedPercentage,
      planName: quota.planSelected,
    }).catch((err) => console.error("[TrafficWorker] Failed sending 80% warning email:", err));
  }

  // 3. Automated 100% Cap Trigger
  if (quota.isCapped && !updatedUser.trafficNotified100) {
    await prisma.user.update({
      where: { id: userId },
      data: { trafficNotified100: true },
    });

    triggerTrafficLimit100({
      userId: quota.userId,
      toEmail: quota.email,
      userName: quota.companyName || quota.email,
      monthlyVisits: quota.monthlyVisits,
      trafficLimit: quota.trafficLimit,
      usedPercentage: 100,
      planName: quota.planSelected,
    }).catch((err) => console.error("[TrafficWorker] Failed sending 100% limit email:", err));
  }

  return quota;
}
