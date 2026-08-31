import { prisma } from "@/app/lib/prisma/prisma";

export const PLAN_TEAM_LIMITS: Record<string, number> = {
  STARTER: 1,
  PROFESSIONAL: 5,
  ENTERPRISE: 999999, // Unlimited
};

export interface TeamQuotaCheckResult {
  allowed: boolean;
  currentUsersCount: number;
  maxLimit: number;
  planSelected: string;
  assignedRole: "ADMIN" | "USER";
  message?: string;
}

export interface EmailUniquenessResult {
  isUnique: boolean;
  user?: {
    id: string;
    email: string;
    resetToken: string | null;
    resetTokenExpiry: Date | null;
  };
  hasActiveOtp: boolean;
}

/**
 * Worker check to ensure email addresses are strictly unique across users.
 */
export async function checkEmailUniqueness(email: string): Promise<EmailUniquenessResult> {
  const trimmedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findFirst({
    where: {
      email: { equals: trimmedEmail, mode: "insensitive" },
    },
    select: {
      id: true,
      email: true,
      resetToken: true,
      resetTokenExpiry: true,
    },
  });

  if (!user) {
    return { isUnique: true, hasActiveOtp: false };
  }

  const hasActiveOtp = Boolean(
    user.resetToken &&
      user.resetTokenExpiry &&
      new Date() < new Date(user.resetTokenExpiry)
  );

  return {
    isUnique: false,
    user,
    hasActiveOtp,
  };
}

/**
 * Upgraded Worker Check for Role Assignment and Plan Team Member Limits:
 * 1. Queries if an ADMIN user already exists.
 * 2. If NO ADMIN exists (first user), assigns ADMIN role and allows creation automatically.
 * 3. If an ADMIN exists, assigns USER role (Team Member), checks the active Admin's subscription plan,
 *    and verifies whether team capacity permits adding new users.
 */
export async function checkTeamMemberLimitAndRole(): Promise<TeamQuotaCheckResult> {
  // Query if any user with ADMIN role exists
  const adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true, planSelected: true, paymentVerified: true },
    orderBy: { createdAt: "asc" },
  });

  const totalUsersCount = await prisma.user.count();

  // If no Admin exists (or 0 users), this account becomes the primary ADMIN
  if (!adminUser || totalUsersCount === 0) {
    return {
      allowed: true,
      currentUsersCount: totalUsersCount,
      maxLimit: 1,
      planSelected: "STARTER",
      assignedRole: "ADMIN",
    };
  }

  // An Admin exists: new user takes the USER (Team Member) role
  const assignedRole = "USER";
  const adminPlan = adminUser.planSelected || "STARTER";
  const maxLimit = PLAN_TEAM_LIMITS[adminPlan] ?? 1;

  if (totalUsersCount >= maxLimit) {
    return {
      allowed: false,
      currentUsersCount: totalUsersCount,
      maxLimit,
      planSelected: adminPlan,
      assignedRole,
      message: `Team seat capacity reached (${totalUsersCount}/${maxLimit} users) for the ${adminPlan} plan. Please contact your workspace administrator to upgrade.`,
    };
  }

  return {
    allowed: true,
    currentUsersCount: totalUsersCount,
    maxLimit,
    planSelected: adminPlan,
    assignedRole,
  };
}
