import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma/prisma";
import { checkRateLimit } from "@/app/lib/security/rateLimiter";

export async function POST(req: NextRequest) {
  try {
    // 0. Rate limiting (max 5 appeals per 10 minutes per IP)
    const rateLimit = await checkRateLimit(req, {
      keyPrefix: "appeal-submission",
      limit: 5,
      windowMs: 10 * 60 * 1000,
      customMessage: "Too many appeal submissions. Please wait before submitting another appeal.",
    });
    if (!rateLimit.success && rateLimit.response) {
      return rateLimit.response;
    }

    const body = await req.json();
    const { storeSlugOrName, contactInfo, reason } = body;

    if (!storeSlugOrName || !reason) {
      return NextResponse.json(
        { error: "Store name/slug and detailed reason are required." },
        { status: 400 }
      );
    }

    const cleanIdentifier = storeSlugOrName.trim().toLowerCase();

    // Find the company by slug or name
    const company = await prisma.company.findFirst({
      where: {
        OR: [
          { slug: cleanIdentifier },
          { name: { equals: storeSlugOrName.trim(), mode: "insensitive" } },
        ],
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Store could not be identified. Please verify the store slug or business name." },
        { status: 404 }
      );
    }

    // Create the Appeal Request
    const appeal = await prisma.appealRequest.create({
      data: {
        companyId: company.id,
        reason: reason.trim(),
        contactInfo: contactInfo?.trim() || null,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Appeal request submitted successfully. Platform administrators will review your ticket within 24 hours.",
      ticketId: appeal.id,
    });
  } catch (error) {
    console.error("[AppealAPI] Error:", error);
    return NextResponse.json({ error: "Failed to submit appeal request." }, { status: 500 });
  }
}
