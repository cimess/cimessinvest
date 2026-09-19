import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { prisma } from "@/app/lib/prisma/prisma";
import { triggerMerchantSupportReport } from "@/app/api/workers/emailWorker";
import { TicketCategory } from "@/app/generated/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { category, subject, description, orderReference } = body;

    if (!category || !subject || !description) {
      return NextResponse.json(
        { error: "Category, subject, and detailed description are required." },
        { status: 400 }
      );
    }

    // 1. Locate User and Company
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        memberships: {
          where: { status: "ACTIVE" },
          include: { company: true },
        },
      },
    });

    const targetCompanyId =
      session.user.activeCompanyId ||
      session.user.companyId ||
      user?.memberships?.[0]?.company?.id ||
      null;

    const company = targetCompanyId
      ? await prisma.company.findUnique({ where: { id: targetCompanyId } })
      : null;

    // Optional order reference link
    let linkedOrderId: string | null = null;
    if (orderReference) {
      const order = await prisma.order.findFirst({
        where: {
          OR: [
            { reference: orderReference },
            { invoiceNumber: orderReference },
            { id: orderReference },
          ],
        },
      });
      if (order) {
        linkedOrderId = order.id;
      }
    }

    const ticketNumber = `REP-${Math.floor(1000 + Math.random() * 9000)}`;

    const validCategory: TicketCategory = [
      "PAYMENT_ISSUE",
      "UI_BUG",
      "FEATURE_REQUEST",
      "GENERAL_FEEDBACK",
      "OTHER",
    ].includes(category)
      ? (category as TicketCategory)
      : "PAYMENT_ISSUE";

    // 2. Create PlatformTicket
    const ticket = await prisma.platformTicket.create({
      data: {
        ticketNumber,
        type: "MERCHANT_SUPPORT",
        category: validCategory,
        status: "PENDING",
        companyId: targetCompanyId,
        orderId: linkedOrderId,
        orderReference: orderReference || null,
        submitterEmail: session.user.email,
        submitterName: user?.fullName || session.user.name || "Store Owner",
        submitterPhone: user?.phone || null,
        role: "MERCHANT",
        subject: subject.trim(),
        description: description.trim(),
      },
    });

    // 3. Dispatch Acknowledgment Email
    triggerMerchantSupportReport({
      toEmail: session.user.email,
      merchantName: user?.fullName || session.user.name || "Store Partner",
      storeName: company?.name || "Merchant Store",
      ticketNumber,
      category: validCategory,
      subjectLine: subject.trim(),
      description: description.trim(),
    }).catch((err) => console.error("[MerchantReportAPI] Email acknowledgment error:", err));

    return NextResponse.json({
      success: true,
      ticketNumber,
      message: "Report submitted successfully. Our engineering and payment operations team has received your ticket.",
      ticket,
    });
  } catch (error) {
    console.error("[MerchantReportAPI] Error:", error);
    return NextResponse.json(
      { error: "Internal server error submitting merchant report." },
      { status: 500 }
    );
  }
}
