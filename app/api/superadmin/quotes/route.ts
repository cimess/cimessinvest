import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { isSuperAdmin } from "@/app/lib/auth/superadmin";
import { prisma } from "@/app/lib/prisma/prisma";

/**
 * GET /api/superadmin/quotes
 * Lists all active and claimed custom enterprise quotes.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!isSuperAdmin(session)) {
      return NextResponse.json(
        { error: "Forbidden: Superadmin access required" },
        { status: 403 }
      );
    }

    const quotes = await prisma.customPlanQuote.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            companyName: true,
            email: true,
            planSelected: true,
            subscription_status: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      quotes: quotes.map((q) => ({
        id: q.id,
        userId: q.userId,
        companyName: q.user?.companyName || "Unknown Company",
        email: q.user?.email || "unknown@user.com",
        plan: q.plan,
        authorizedAmountNGN: q.authorizedAmountKobo / 100,
        authorizedStorageMB: q.authorizedStorageMB,
        authorizedTrafficLimit: q.authorizedTrafficLimit,
        notes: q.notes,
        status: q.status,
        createdAt: q.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[SuperadminQuotesAPI] GET error:", error);
    return NextResponse.json({ error: "Failed to retrieve quotes" }, { status: 500 });
  }
}

/**
 * POST /api/superadmin/quotes
 * Issues or updates a custom negotiated enterprise quote for an atelier.
 */
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
    const {
      userId,
      authorizedAmountNGN,
      authorizedStorageMB,
      authorizedTrafficLimit,
      notes,
    } = body;

    if (!userId || !authorizedAmountNGN || !authorizedStorageMB) {
      return NextResponse.json(
        { error: "Missing required fields: userId, authorizedAmountNGN, and authorizedStorageMB are required." },
        { status: 400 }
      );
    }

    // Verify user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, companyName: true, email: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: `Atelier with ID "${userId}" not found.` }, { status: 404 });
    }

    const amountKobo = Math.round(Number(authorizedAmountNGN) * 100);
    const storageMB = Math.round(Number(authorizedStorageMB));
    const trafficLimit = authorizedTrafficLimit ? Math.round(Number(authorizedTrafficLimit)) : null;

    // Expire any existing active APPROVED quotes for this user
    await prisma.customPlanQuote.updateMany({
      where: { userId, status: "APPROVED" },
      data: { status: "EXPIRED" },
    });

    // Create fresh APPROVED quote
    const newQuote = await prisma.customPlanQuote.create({
      data: {
        userId,
        plan: "ENTERPRISE",
        authorizedAmountKobo: amountKobo,
        authorizedStorageMB: storageMB,
        authorizedTrafficLimit: trafficLimit,
        notes: notes ? String(notes).trim() : null,
        status: "APPROVED",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Authorized custom quote generated for ${targetUser.companyName}.`,
        quote: {
          id: newQuote.id,
          userId: targetUser.id,
          companyName: targetUser.companyName,
          email: targetUser.email,
          authorizedAmountNGN: newQuote.authorizedAmountKobo / 100,
          authorizedStorageMB: newQuote.authorizedStorageMB,
          authorizedTrafficLimit: newQuote.authorizedTrafficLimit,
          status: newQuote.status,
          createdAt: newQuote.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[SuperadminQuotesAPI] POST error:", error);
    return NextResponse.json({ error: "Failed to create custom quote" }, { status: 500 });
  }
}
