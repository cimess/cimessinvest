import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { prisma } from "@/app/lib/prisma/prisma";
import { createManagerInvite, getAdminTeamStats } from "@/app/api/workers/teamWorker";
import { getSafeErrorMessage } from "@/app/lib/utils/errorHandler";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user?.role || "").toUpperCase();

    if (!session || userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only atelier administrators can invite team managers." },
        { status: 403 }
      );
    }

    const adminId = session.user.id;
    const invite = await createManagerInvite(adminId);

    const baseUrl = process.env.NEXTAUTH_URL || "https://cimessinvest.com";
    const inviteUrl = `${baseUrl.replace(/\/$/, "")}/invite/${invite.token}`;

    return NextResponse.json({
      success: true,
      invite: {
        id: invite.id,
        token: invite.token,
        inviteUrl,
        expiresAt: invite.expiresAt,
        companyName: invite.admin.companyName,
      },
    });
  } catch (error) {
    console.error("Team Invite API Error:", error);
    const safeError = getSafeErrorMessage(error, "Failed to generate manager invite link.");
    return NextResponse.json(
      { error: safeError.message },
      { status: safeError.statusCode }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    const userRole = (session?.user?.role || "").toUpperCase();

    if (!session || userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only atelier administrators can view invites." },
        { status: 403 }
      );
    }

    const adminId = session.user.id;
    const stats = await getAdminTeamStats(adminId);

    const activeInvites = await prisma.invite.findMany({
      where: {
        adminId,
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
    const safeError = getSafeErrorMessage(error, "Failed to retrieve pending invites.");
    return NextResponse.json(
      { error: safeError.message },
      { status: safeError.statusCode }
    );
  }
}
