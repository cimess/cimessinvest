import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma/prisma";
import {
  createCompanyMemberInvite,
  getCompanyTeamStats,
} from "@/app/api/workers/teamWorker";
import { requireActiveCompanyMember, handleRbacError } from "@/app/lib/auth/rbac";
import { MemberRole } from "@/app/generated/prisma";
import { getSafeErrorMessage } from "@/app/lib/utils/errorHandler";

export async function POST(req: Request) {
  try {
    const ctx = await requireActiveCompanyMember(null, [MemberRole.OWNER]);

    const invite = await createCompanyMemberInvite(
      ctx.companyId,
      ctx.userId,
      MemberRole.MANAGER
    );

    const baseUrl = process.env.NEXTAUTH_URL || "https://cimessinvest.com";
    const inviteUrl = `${baseUrl.replace(/\/$/, "")}/invite/${invite.token}`;

    return NextResponse.json({
      success: true,
      invite: {
        id: invite.id,
        token: invite.token,
        inviteUrl,
        expiresAt: invite.expiresAt,
        companyName: ctx.companyName,
      },
    });
  } catch (error) {
    console.error("Team Invite API Error:", error);
    const rbacResponse = handleRbacError(error);
    if (rbacResponse.status !== 500) return rbacResponse;

    const safeError = getSafeErrorMessage(error, "Failed to generate manager invite link.");
    return NextResponse.json(
      { error: safeError.message },
      { status: safeError.statusCode }
    );
  }
}

export async function GET() {
  try {
    const ctx = await requireActiveCompanyMember(null, [MemberRole.OWNER]);

    const stats = await getCompanyTeamStats(ctx.companyId);

    const activeInvites = await prisma.invite.findMany({
      where: {
        companyId: ctx.companyId,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "https://cimessinvest.com";
    const formattedInvites = activeInvites.map((inv) => ({
      id: inv.id,
      token: inv.token,
      inviteUrl: `${baseUrl.replace(/\/$/, "")}/invite/${inv.token}`,
      expiresAt: inv.expiresAt,
      createdAt: inv.createdAt,
    }));

    return NextResponse.json({
      success: true,
      stats,
      invites: formattedInvites,
    });
  } catch (error) {
    console.error("Team Invites GET Error:", error);
    const rbacResponse = handleRbacError(error);
    if (rbacResponse.status !== 500) return rbacResponse;

    const safeError = getSafeErrorMessage(error, "Failed to retrieve pending invites.");
    return NextResponse.json(
      { error: safeError.message },
      { status: safeError.statusCode }
    );
  }
}
