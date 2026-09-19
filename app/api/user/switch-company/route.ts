import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { prisma } from "@/app/lib/prisma/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { companyId } = body;

    if (!companyId || typeof companyId !== "string") {
      return NextResponse.json({ error: "companyId is required." }, { status: 400 });
    }

    // Verify active membership in target company
    const membership = await prisma.companyMember.findUnique({
      where: {
        companyId_userId: {
          companyId,
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
          },
        },
      },
    });

    if (!membership || membership.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Forbidden: You do not have an active membership in this company." },
        { status: 403 }
      );
    }

    if (membership.company.status === "SUSPENDED" || membership.company.status === "ARCHIVED") {
      return NextResponse.json(
        { error: `This company account is currently ${membership.company.status.toLowerCase()}. Please contact support.` },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Switched active company to ${membership.company.name}.`,
      activeCompany: {
        id: membership.company.id,
        name: membership.company.name,
        slug: membership.company.slug,
        industry: membership.company.industry,
        role: membership.role,
        planSelected: membership.company.planSelected,
      },
    });
  } catch (error) {
    console.error("[SwitchCompany] Error:", error);
    return NextResponse.json({ error: "Failed to switch company" }, { status: 500 });
  }
}
