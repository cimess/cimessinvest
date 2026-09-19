import { auth } from "@/app/auth";
import { prisma } from "@/app/lib/prisma/prisma";
import { MemberRole, MemberStatus, CompanyStatus } from "@/app/generated/prisma";
import { NextResponse } from "next/server";

export class RbacError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 403) {
    super(message);
    this.name = "RbacError";
    this.statusCode = statusCode;
  }
}

export interface AuthenticatedCompanyContext {
  userId: string;
  userEmail: string;
  companyId: string;
  companyName: string;
  companySlug: string;
  memberRole: MemberRole;
  company: {
    id: string;
    name: string;
    slug: string;
    industry: string;
    status: CompanyStatus;
    planSelected: string;
    trafficLimit: number;
    monthlyVisits: number;
    storageLimit: number;
    storageUsed: number;
  };
}

/**
 * Validates that the current user has an ACTIVE membership in the target company
 * and holds one of the required roles. Prevents stale JWT exploitation.
 */
export async function requireActiveCompanyMember(
  explicitCompanyId?: string | null,
  allowedRoles?: MemberRole[]
): Promise<AuthenticatedCompanyContext> {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    throw new RbacError("Unauthorized access. Please log in.", 401);
  }

  // Allow SUPERADMIN to bypass company membership checks if needed
  if (session.user.role === "SUPERADMIN" || session.user.platformRole === "SUPERADMIN") {
    const targetCompanyId =
      explicitCompanyId ||
      session.user.activeCompanyId ||
      session.user.companyId;

    if (targetCompanyId) {
      const company = await prisma.company.findUnique({
        where: { id: targetCompanyId },
        select: {
          id: true,
          name: true,
          slug: true,
          industry: true,
          status: true,
          planSelected: true,
          trafficLimit: true,
          monthlyVisits: true,
          storageLimit: true,
          storageUsed: true,
        },
      });

      if (company) {
        return {
          userId: session.user.id,
          userEmail: session.user.email,
          companyId: company.id,
          companyName: company.name,
          companySlug: company.slug,
          memberRole: MemberRole.OWNER,
          company: company as any,
        };
      }
    }
  }

  // Resolve target company ID
  const targetCompanyId =
    explicitCompanyId ||
    session.user.activeCompanyId ||
    session.user.companyId;

  if (!targetCompanyId) {
    // If no companyId in session, check if user has any active membership
    const firstMembership = await prisma.companyMember.findFirst({
      where: {
        userId: session.user.id,
        status: MemberStatus.ACTIVE,
      },
      include: {
        company: true,
      },
    });

    if (!firstMembership) {
      throw new RbacError("No company workspace is associated with this account.", 403);
    }

    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(firstMembership.role)) {
      throw new RbacError(
        `Forbidden: Role "${firstMembership.role}" lacks permission for this action. Required: ${allowedRoles.join(", ")}`,
        403
      );
    }

    return {
      userId: session.user.id,
      userEmail: session.user.email,
      companyId: firstMembership.company.id,
      companyName: firstMembership.company.name,
      companySlug: firstMembership.company.slug,
      memberRole: firstMembership.role,
      company: firstMembership.company as any,
    };
  }

  // Query live database membership directly to eliminate stale token window
  const membership = await prisma.companyMember.findUnique({
    where: {
      companyId_userId: {
        companyId: targetCompanyId,
        userId: session.user.id,
      },
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          industry: true,
          status: true,
          planSelected: true,
          trafficLimit: true,
          monthlyVisits: true,
          storageLimit: true,
          storageUsed: true,
        },
      },
    },
  });

  if (!membership) {
    throw new RbacError("You are not a member of this company workspace.", 403);
  }

  if (membership.status !== MemberStatus.ACTIVE) {
    throw new RbacError("Your membership in this company is deactivated or suspended.", 403);
  }

  if (membership.company.status === CompanyStatus.SUSPENDED) {
    throw new RbacError("This company account has been suspended. Please file an appeal.", 403);
  }

  if (membership.company.status === CompanyStatus.ARCHIVED) {
    throw new RbacError("This company workspace has been archived.", 403);
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
    throw new RbacError(
      `Forbidden: Role "${membership.role}" lacks permission for this action. Required: ${allowedRoles.join(", ")}`,
      403
    );
  }

  return {
    userId: session.user.id,
    userEmail: session.user.email,
    companyId: membership.company.id,
    companyName: membership.company.name,
    companySlug: membership.company.slug,
    memberRole: membership.role,
    company: membership.company as any,
  };
}

/**
 * Helper to produce uniform JSON response from RbacError
 */
export function handleRbacError(error: unknown) {
  if (error instanceof RbacError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }
  const err = error as Error;
  return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
}
