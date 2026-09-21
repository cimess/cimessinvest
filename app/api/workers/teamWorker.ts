import { prisma } from "@/app/lib/prisma/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { MemberRole, MemberStatus } from "@/app/generated/prisma";

// Total workspace seats allowed per subscription tier (including Owner)
export const PLAN_TEAM_LIMITS: Record<string, number> = {
  FREE_TRIAL: 2, // 1 Owner + 1 Manager/Staff during 14-day trial
  STARTER: 1, // Owner only (0 extra seats)
  PROFESSIONAL: 5, // 1 Owner + up to 4 Managers/Staff
  ENTERPRISE: 999999, // Unlimited seats
};

// Extra manager/staff seats allowed per subscription tier
export const PLAN_MANAGER_LIMITS: Record<string, number> = {
  FREE_TRIAL: 1,
  STARTER: 0,
  PROFESSIONAL: 4,
  ENTERPRISE: 999999,
};

export interface TeamQuotaCheckResult {
  allowed: boolean;
  currentUsersCount: number;
  maxLimit: number;
  planSelected: string;
  assignedRole: "ADMIN" | "USER" | "MANAGER";
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
 * Worker check to ensure email addresses are strictly unique across all users.
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
 * Multi-Tenant Registration Check:
 * In Stage 2+, registration is open for any new brand/company tenant.
 */
export async function checkAdminRegistrationEligibility(): Promise<{
  allowed: boolean;
  message?: string;
}> {
  return { allowed: true };
}

/**
 * Retrieves the current team capacity, members used, and plan details for a Company.
 */
export async function getCompanyTeamStats(companyId: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      name: true,
      slug: true,
      planSelected: true,
      status: true,
    },
  });

  if (!company) {
    throw new Error(`Company workspace with ID "${companyId}" not found.`);
  }

  const [currentMembersCount, currentManagersCount, pendingInvitesCount] = await Promise.all([
    prisma.companyMember.count({
      where: {
        companyId,
        status: MemberStatus.ACTIVE,
      },
    }),
    prisma.companyMember.count({
      where: {
        companyId,
        role: MemberRole.MANAGER,
        status: MemberStatus.ACTIVE,
      },
    }),
    prisma.invite.count({
      where: {
        companyId,
        used: false,
        expiresAt: { gt: new Date() },
      },
    }),
  ]);

  const plan = (company.planSelected || "FREE_TRIAL") as string;
  const maxManagersAllowed = PLAN_MANAGER_LIMITS[plan] ?? 1;
  const totalSeats = PLAN_TEAM_LIMITS[plan] ?? 2;
  const currentSeatsUsed = currentMembersCount + pendingInvitesCount;
  const canAddManager = currentSeatsUsed < totalSeats && currentManagersCount < maxManagersAllowed;

  return {
    company,
    planSelected: plan,
    currentMembersCount,
    currentManagersCount,
    pendingInvitesCount,
    maxManagersAllowed,
    totalSeats,
    currentSeatsUsed,
    canAddManager,
  };
}

/**
 * Creates a secure, single-use invite token scoped to a Company tenant.
 */
export async function createCompanyMemberInvite(
  companyId: string,
  inviterUserId: string,
  role: MemberRole = MemberRole.MANAGER
) {
  const stats = await getCompanyTeamStats(companyId);
  if (!stats.canAddManager) {
    throw new Error(
      `Team seat capacity reached (${stats.currentSeatsUsed}/${stats.totalSeats} seats) for the ${stats.planSelected} plan. Upgrade your subscription plan to invite more team members.`
    );
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7-day token expiration

  const invite = await prisma.invite.create({
    data: {
      token,
      companyId,
      inviterId: inviterUserId,
      role,
      expiresAt,
      used: false,
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return invite;
}

/**
 * Validates whether an invitation token is active, unused, and within company capacity.
 */
export async function validateCompanyInviteToken(token: string) {
  if (!token || typeof token !== "string") {
    return { valid: false, error: "Invite token is required." };
  }

  const invite = await prisma.invite.findUnique({
    where: { token },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          planSelected: true,
          status: true,
        },
      },
      inviter: {
        select: {
          id: true,
          fullName: true,
          companyName: true,
          email: true,
        },
      },
      admin: {
        select: {
          id: true,
          companyName: true,
          email: true,
          planSelected: true,
        },
      },
    },
  });

  if (!invite) {
    return { valid: false, error: "Invalid invitation link." };
  }

  if (invite.used) {
    return { valid: false, error: "This invitation link has already been used." };
  }

  if (new Date() > new Date(invite.expiresAt)) {
    return { valid: false, error: "This invitation link has expired. Please request a new invite." };
  }

  const companyId = invite.companyId;
  const companyName = invite.company?.name || invite.admin?.companyName || "Your Company";

  if (companyId) {
    const stats = await getCompanyTeamStats(companyId);
    if (!stats.canAddManager && stats.currentMembersCount >= stats.totalSeats) {
      return {
        valid: false,
        error: `Workspace has reached maximum team seat capacity (${stats.currentMembersCount}/${stats.totalSeats}). The atelier owner must upgrade their subscription.`,
      };
    }
  }

  return {
    valid: true,
    invite,
    company: invite.company,
    companyName,
  };
}

/**
 * Atomically consumes an invite token and registers a new CompanyMember.
 */
export async function joinCompanyMemberWithInvite({
  token,
  name,
  email,
  phone,
  password,
}: {
  token: string;
  name: string;
  email: string;
  phone: string;
  password: string;
}) {
  const validation = await validateCompanyInviteToken(token);
  if (!validation.valid || !validation.invite) {
    throw new Error(validation.error || "Invalid invitation.");
  }

  const invite = validation.invite;
  const trimmedEmail = email.trim().toLowerCase();

  const emailCheck = await checkEmailUniqueness(trimmedEmail);
  if (!emailCheck.isUnique) {
    throw new Error("An account with this email address already exists. Please log in.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const authorizationKey = `CMS-MBR-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;

  const result = await prisma.$transaction(async (tx) => {
    // Re-verify invite inside transaction
    const currentInvite = await tx.invite.findUnique({
      where: { token },
    });

    if (!currentInvite || currentInvite.used || new Date() > new Date(currentInvite.expiresAt)) {
      throw new Error("Invitation is no longer valid.");
    }

    const companyId = currentInvite.companyId;

    if (companyId) {
      const currentCount = await tx.companyMember.count({
        where: { companyId, status: MemberStatus.ACTIVE },
      });
      const company = await tx.company.findUnique({
        where: { id: companyId },
        select: { planSelected: true },
      });
      const maxAllowed = PLAN_TEAM_LIMITS[company?.planSelected || "FREE_TRIAL"] ?? 2;
      if (currentCount >= maxAllowed) {
        throw new Error("Workspace team seat capacity reached.");
      }
    }

    // Mark invite as used
    await tx.invite.update({
      where: { id: currentInvite.id },
      data: { used: true },
    });

    // Create User
    const user = await tx.user.create({
      data: {
        fullName: name.trim(),
        companyName: validation.companyName,
        email: trimmedEmail,
        phone: phone.trim(),
        password: hashedPassword,
        authorizationKey,
        role: "MANAGER",
        planSelected: (invite.company?.planSelected || "FREE_TRIAL") as any,
        storageUsed: 0,
        storageLimit: 0,
      },
      select: {
        id: true,
        fullName: true,
        companyName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    // If companyId is present, create CompanyMember join record
    if (companyId) {
      await tx.companyMember.create({
        data: {
          companyId,
          userId: user.id,
          role: invite.role || MemberRole.MANAGER,
          status: MemberStatus.ACTIVE,
        },
      });
    }

    return user;
  });

  return result;
}

/**
 * Removes a member from a company workspace.
 */
export async function removeCompanyMember(
  companyId: string,
  targetMemberId: string,
  requestingUserId: string
) {
  // Verify requesting user is OWNER of this company
  const requester = await prisma.companyMember.findUnique({
    where: {
      companyId_userId: {
        companyId,
        userId: requestingUserId,
      },
    },
  });

  if (!requester || requester.role !== MemberRole.OWNER) {
    throw new Error("Forbidden: Only the workspace owner can remove team members.");
  }

  // Delete membership
  await prisma.companyMember.delete({
    where: { id: targetMemberId },
  });

  return { success: true, removedMemberId: targetMemberId };
}

// ============================================================================
// LEGACY BACKWARDS-COMPATIBILITY BRIDGES
// ============================================================================

export async function getAdminTeamStats(adminId: string) {
  // Resolve user to their first company if one exists
  const membership = await prisma.companyMember.findFirst({
    where: { userId: adminId, role: MemberRole.OWNER },
    select: { companyId: true },
  });

  if (membership?.companyId) {
    const companyStats = await getCompanyTeamStats(membership.companyId);
    return {
      admin: {
        id: adminId,
        companyName: companyStats.company.name,
        planSelected: companyStats.planSelected,
        role: "ADMIN",
      },
      planSelected: companyStats.planSelected,
      currentManagersCount: companyStats.currentManagersCount,
      maxManagersAllowed: companyStats.maxManagersAllowed,
      totalSeats: companyStats.totalSeats,
      currentSeatsUsed: companyStats.currentSeatsUsed,
      canAddManager: companyStats.canAddManager,
    };
  }

  // Fallback to legacy User queries
  const admin = await prisma.user.findUnique({
    where: { id: adminId },
    select: {
      id: true,
      companyName: true,
      email: true,
      planSelected: true,
      paymentVerified: true,
      role: true,
    },
  });

  if (!admin) {
    throw new Error("Admin workspace not found.");
  }

  const currentManagersCount = await prisma.user.count({
    where: {
      role: "MANAGER",
      adminId: admin.id,
    },
  });

  const plan = admin.planSelected || "STARTER";
  const maxManagersAllowed = PLAN_MANAGER_LIMITS[plan] ?? 0;
  const totalSeats = PLAN_TEAM_LIMITS[plan] ?? 1;
  const currentSeatsUsed = 1 + currentManagersCount;
  const canAddManager = currentManagersCount < maxManagersAllowed;

  return {
    admin,
    planSelected: plan,
    currentManagersCount,
    maxManagersAllowed,
    totalSeats,
    currentSeatsUsed,
    canAddManager,
  };
}

export async function createManagerInvite(adminId: string) {
  const membership = await prisma.companyMember.findFirst({
    where: { userId: adminId, role: MemberRole.OWNER },
    select: { companyId: true },
  });

  if (membership?.companyId) {
    const invite = await createCompanyMemberInvite(membership.companyId, adminId, MemberRole.MANAGER);
    return {
      ...invite,
      admin: {
        id: adminId,
        companyName: invite.company?.name || "Your Company",
      },
    };
  }

  // Legacy fallback
  const stats = await getAdminTeamStats(adminId);
  if (!stats.canAddManager) {
    throw new Error(
      `Team seat capacity reached (${stats.currentManagersCount}/${stats.maxManagersAllowed} managers) for the ${stats.planSelected} plan.`
    );
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  return prisma.invite.create({
    data: {
      token,
      adminId: stats.admin.id,
      expiresAt,
      used: false,
    },
    include: {
      admin: {
        select: {
          id: true,
          companyName: true,
        },
      },
    },
  });
}

export async function validateInviteToken(token: string) {
  return validateCompanyInviteToken(token);
}

export async function joinManagerWithInvite(params: {
  token: string;
  name: string;
  email: string;
  phone: string;
  password: string;
}) {
  return joinCompanyMemberWithInvite(params);
}

export async function removeManager(adminId: string, managerId: string) {
  const manager = await prisma.user.findFirst({
    where: {
      id: managerId,
      adminId,
      role: "MANAGER",
    },
  });

  if (!manager) {
    throw new Error("Manager not found in your workspace.");
  }

  await prisma.user.delete({
    where: { id: managerId },
  });

  return { success: true, deletedManagerId: managerId };
}
