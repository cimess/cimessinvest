import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { isSuperAdmin } from "@/app/lib/auth/superadmin";
import { prisma } from "@/app/lib/prisma/prisma";
import { revalidateBrandCache } from "@/app/lib/cache/brandCache";

export async function GET() {
  try {
    const session = await auth();
    if (!isSuperAdmin(session)) {
      return NextResponse.json(
        { error: "Forbidden: Superadmin access required" },
        { status: 403 }
      );
    }

    const appeals = await prisma.appealRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        company: {
          select: { id: true, name: true, slug: true, status: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      appeals,
    });
  } catch (error) {
    console.error("[SuperadminAppealsAPI] GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch appeals" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!isSuperAdmin(session)) {
      return NextResponse.json(
        { error: "Forbidden: Superadmin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { appealId, action, reviewNote } = body;

    if (!appealId || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid request. appealId and action ('APPROVE' | 'REJECT') are required." },
        { status: 400 }
      );
    }

    const appeal = await prisma.appealRequest.findUnique({
      where: { id: appealId },
      include: { company: true },
    });

    if (!appeal) {
      return NextResponse.json({ error: "Appeal request not found" }, { status: 404 });
    }

    const newStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";

    // Update appeal record
    const updatedAppeal = await prisma.appealRequest.update({
      where: { id: appealId },
      data: {
        status: newStatus,
        reviewedBy: session?.user?.email || "SUPERADMIN",
        reviewNote: reviewNote || null,
      },
    });

    // If approved, reactivate the company storefront!
    if (action === "APPROVE") {
      await prisma.company.update({
        where: { id: appeal.companyId },
        data: { status: "ACTIVE" },
      });
      await revalidateBrandCache();
    }

    return NextResponse.json({
      success: true,
      message: `Appeal has been ${newStatus.toLowerCase()}.`,
      appeal: updatedAppeal,
    });
  } catch (error) {
    console.error("[SuperadminAppealsAPI] POST Error:", error);
    return NextResponse.json({ error: "Failed to process appeal" }, { status: 500 });
  }
}
