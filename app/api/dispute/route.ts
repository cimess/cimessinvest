import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma/prisma";
import { triggerDisputeCustomerAlert, triggerDisputeMerchantAlert } from "@/app/api/workers/emailWorker";
import { TicketCategory } from "@/app/generated/prisma";

// GET /api/dispute: Query order details by id, reference, or invoiceNumber for dispute preview
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const identifier = (
      searchParams.get("orderId") ||
      searchParams.get("ref") ||
      searchParams.get("reference") ||
      searchParams.get("invoice") ||
      ""
    ).trim();

    if (!identifier) {
      return NextResponse.json(
        { error: "Order ID, Reference, or Invoice Number is required." },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: identifier },
          { reference: identifier },
          { invoiceNumber: identifier },
        ],
      },
      include: {
        company: {
          include: {
            siteSetting: true,
            members: {
              where: { role: "OWNER" },
              include: { user: true },
            },
          },
        },
        disputeTickets: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found in system records." }, { status: 404 });
    }

    const createdAtMs = new Date(order.createdAt).getTime();
    const ageMs = Date.now() - createdAtMs;
    const window24hMs = 24 * 60 * 60 * 1000;
    const isWithin24Hours = ageMs <= window24hMs;
    const remainingMinutes = Math.max(0, Math.floor((window24hMs - ageMs) / (60 * 1000)));
    const remainingHoursFormatted = (remainingMinutes / 60).toFixed(1);

    const isPaid = order.status === "COMPLETED";
    const isAlreadyDisputed = order.settlementStatus === "HELD_DISPUTED";
    const isSettled = order.settlementStatus === "SETTLED";
    const isRefunded = order.settlementStatus === "REFUNDED";

    const isEligible = isPaid && !isAlreadyDisputed && !isRefunded && isWithin24Hours;

    const rawItems = Array.isArray(order.items) ? (order.items as any[]) : [];
    const storeName = order.company?.siteSetting?.companyName || order.company?.name || "Merchant Store";

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        reference: order.reference,
        invoiceNumber: order.invoiceNumber,
        amountNaira: Math.round(order.amountKobo / 100),
        status: order.status,
        settlementStatus: order.settlementStatus,
        createdAt: order.createdAt,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        itemsCount: rawItems.length,
        items: rawItems.map((item: any, idx: number) => ({
          name: item.name || item.title || `Item #${idx + 1}`,
          quantity: Number(item.quantity) || 1,
        })),
        store: {
          name: storeName,
          slug: order.company?.slug,
          whatsappNumber: order.company?.siteSetting?.whatsappNumber,
        },
      },
      protectionWindow: {
        isWithin24Hours,
        remainingHoursFormatted,
        isEligible,
        isAlreadyDisputed,
        isSettled,
        isRefunded,
        activeTicketNumber: order.disputeTickets?.[0]?.ticketNumber || null,
      },
    });
  } catch (error) {
    console.error("[DisputeAPI GET] Error:", error);
    return NextResponse.json(
      { error: "Internal server error looking up order for dispute." },
      { status: 500 }
    );
  }
}

// POST /api/dispute: Submit a buyer dispute & freeze merchant pending funds
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderIdentifier,
      customerEmail,
      customerName,
      customerPhone,
      category,
      subject,
      description,
    } = body;

    if (!orderIdentifier || !customerEmail || !description) {
      return NextResponse.json(
        { error: "Order identifier, customer email, and issue description are required." },
        { status: 400 }
      );
    }

    // 1. Locate Order
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderIdentifier },
          { reference: orderIdentifier },
          { invoiceNumber: orderIdentifier },
        ],
      },
      include: {
        company: {
          include: {
            siteSetting: true,
            members: {
              where: { role: "OWNER" },
              include: { user: true },
            },
          },
        },
        disputeTickets: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (order.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Disputes can only be filed on paid and completed orders." },
        { status: 400 }
      );
    }

    if (order.settlementStatus === "HELD_DISPUTED") {
      const existingTicket = order.disputeTickets?.[0]?.ticketNumber;
      return NextResponse.json(
        {
          error: `A dispute (#${existingTicket || "DSP"}) is already active for this order. Funds are currently frozen.`,
        },
        { status: 400 }
      );
    }

    if (order.settlementStatus === "REFUNDED") {
      return NextResponse.json(
        { error: "This order has already been refunded." },
        { status: 400 }
      );
    }

    // 2. Verify 24-Hour Protection Window
    const ageMs = Date.now() - new Date(order.createdAt).getTime();
    const window24hMs = 24 * 60 * 60 * 1000;
    if (ageMs > window24hMs) {
      return NextResponse.json(
        {
          error:
            "The 24-Hour Buyer Protection window for this order has elapsed. Funds have automatically settled to the merchant's commercial bank account and can no longer be held by the platform.",
        },
        { status: 400 }
      );
    }

    // 3. Atomically Freeze Funds in Merchant DB Ledger & Update Order Status
    const merchantNetKobo = order.merchantNetKobo || order.amountKobo;
    const ticketNumber = `DSP-${Math.floor(1000 + Math.random() * 9000)}`;

    const validCategory: TicketCategory = [
      "UNFULFILLED_ORDER",
      "DEFECTIVE_PRODUCT",
      "FRAUD_SUSPICION",
      "PAYMENT_ISSUE",
      "OTHER",
    ].includes(category)
      ? (category as TicketCategory)
      : "UNFULFILLED_ORDER";

    const [updatedOrder, createdTicket] = await prisma.$transaction([
      // Mark Order as HELD_DISPUTED
      prisma.order.update({
        where: { id: order.id },
        data: {
          settlementStatus: "HELD_DISPUTED",
        },
      }),

      // Create PlatformTicket
      prisma.platformTicket.create({
        data: {
          ticketNumber,
          type: "CUSTOMER_DISPUTE",
          category: validCategory,
          status: "PENDING",
          companyId: order.companyId,
          orderId: order.id,
          orderReference: order.reference,
          submitterEmail: customerEmail.trim(),
          submitterName: customerName?.trim() || order.customerName,
          submitterPhone: customerPhone?.trim() || order.customerPhone,
          role: "CUSTOMER",
          subject: subject?.trim() || `Dispute on Order #${order.invoiceNumber || order.reference}`,
          description: description.trim(),
        },
      }),

      // Move merchant balance from pending to disputed
      prisma.company.update({
        where: { id: order.companyId },
        data: {
          pendingBalanceKobo: { decrement: merchantNetKobo },
          disputedBalanceKobo: { increment: merchantNetKobo },
        },
      }),
    ]);

    // 4. Trigger Email Alerts to Both Customer and Merchant
    const storeName = order.company?.siteSetting?.companyName || order.company?.name || "Merchant Store";
    const amountNaira = Math.round(order.amountKobo / 100);

    // Customer Email
    triggerDisputeCustomerAlert({
      toEmail: customerEmail.trim(),
      customerName: customerName?.trim() || order.customerName || "Valued Customer",
      ticketNumber,
      orderReference: order.reference,
      storeName,
      amountNaira,
      disputeReason: description.trim(),
    }).catch((err) => console.error("[DisputeAPI] Customer email dispatch error:", err));

    // Merchant Email
    const ownerUser = order.company?.members?.[0]?.user;
    const merchantEmail = ownerUser?.email;
    if (merchantEmail) {
      triggerDisputeMerchantAlert({
        toEmail: merchantEmail,
        merchantName: ownerUser?.fullName || storeName,
        storeName,
        ticketNumber,
        orderReference: order.reference,
        amountNaira,
        customerName: customerName?.trim() || order.customerName || "Customer",
        disputeReason: description.trim(),
      }).catch((err) => console.error("[DisputeAPI] Merchant email alert error:", err));
    }

    return NextResponse.json({
      success: true,
      ticketNumber,
      orderReference: order.reference,
      message: `Buyer protection activated. Payout of ₦${amountNaira.toLocaleString()} for order #${order.reference} has been frozen in escrow.`,
      ticket: createdTicket,
    });
  } catch (error) {
    console.error("[DisputeAPI POST] Error:", error);
    return NextResponse.json(
      { error: "Internal server error filing customer dispute." },
      { status: 500 }
    );
  }
}
