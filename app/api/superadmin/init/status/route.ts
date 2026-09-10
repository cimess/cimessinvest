import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/superadmin/init/status
 * Determines whether a Superadmin account has already been bootstrapped and locked.
 */
export async function GET() {
  try {
    const superadmin = await prisma.user.findFirst({
      where: { role: "SUPERADMIN" },
      select: { id: true, email: true, createdAt: true },
    });

    if (superadmin) {
      return NextResponse.json({
        initialized: true,
        email: superadmin.email,
      });
    }

    const initEmail = process.env.SUPERADMIN_INIT_EMAIL || null;

    return NextResponse.json({
      initialized: false,
      email: initEmail,
    });
  } catch (error: unknown) {
    console.error("[Superadmin Init Status Error]:", error);
    return NextResponse.json(
      { error: "Failed checking superadmin status" },
      { status: 500 }
    );
  }
}
