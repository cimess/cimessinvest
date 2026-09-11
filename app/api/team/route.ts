import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { prisma } from "@/app/lib/prisma/prisma";
import { getAdminTeamStats, removeManager } from "@/app/api/workers/teamWorker";
import { getSafeErrorMessage } from "@/app/lib/utils/errorHandler";
import { SAFE_USER_SELECT } from "@/app/lib/prisma/projections";

export async function GET() {
  try {
    const session = await auth();
    const userRole = (session?.user?.role || "").toUpperCase();

    if (!session || userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only workspace administrators can view team details." },
        { status: 403 }
      );
    }

    const adminId = session.user.id;
    const stats = await getAdminTeamStats(adminId);

    const managers = await prisma.user.findMany({
      where: {
        adminId,
        role: "MANAGER",
      },
      select: SAFE_USER_SELECT,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      stats,
      managers,
    });
  } catch (error) {
    console.error("Team GET Error:", error);
    const safeError = getSafeErrorMessage(error, "Failed to fetch workspace team details.");
    return NextResponse.json(
      { error: safeError.message },
      { status: safeError.statusCode }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user?.role || "").toUpperCase();

    if (!session || userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only workspace administrators can remove team members." },
        { status: 403 }
      );
    }

    const adminId = session.user.id;
    const body = await req.json();
    const { managerId } = body;

    if (!managerId) {
      return NextResponse.json({ error: "Missing managerId parameter." }, { status: 400 });
    }

    const result = await removeManager(adminId, managerId);

    return NextResponse.json({
      success: true,
      message: "Manager removed successfully from workspace.",
      deletedManagerId: result.deletedManagerId,
    });
  } catch (error) {
    console.error("Team DELETE Error:", error);
    const safeError = getSafeErrorMessage(error, "Failed to remove manager.");
    return NextResponse.json(
      { error: safeError.message },
      { status: safeError.statusCode }
    );
  }
}
