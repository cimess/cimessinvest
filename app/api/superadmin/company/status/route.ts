import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { isSuperAdmin } from "@/app/lib/auth/superadmin";
import { prisma } from "@/app/lib/prisma/prisma";
import { revalidateBrandCache } from "@/app/lib/cache/brandCache";

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
    const { companyId, status } = body;

    const validStatuses = ["ACTIVE", "SUSPENDED", "TRIAL_EXPIRED", "ARCHIVED"];
    if (!companyId || !status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Valid companyId and status ('ACTIVE' | 'SUSPENDED') are required." },
        { status: 400 }
      );
    }

    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: { status },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
      },
    });

    await revalidateBrandCache();

    return NextResponse.json({
      success: true,
      message: `Company '${updatedCompany.name}' status changed to ${updatedCompany.status}.`,
      company: updatedCompany,
    });
  } catch (error) {
    console.error("[SuperadminCompanyStatusAPI] Error:", error);
    return NextResponse.json({ error: "Failed to update company status" }, { status: 500 });
  }
}
