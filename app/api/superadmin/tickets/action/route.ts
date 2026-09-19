import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { prisma } from "@/app/lib/prisma/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, platformRole: true },
    });

    const isSuperAdmin =
      user?.platformRole === "SUPERADMIN" ||
      user?.role === "SUPERADMIN" ||
      (session.user as any)?.role === "SUPERADMIN";

    if (!isSuperAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Superadmin access required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { ticketId, action, note } = body;

    if (!ticketId || !action) {
      return NextResponse.json(
        { error: "Ticket ID and action type are required." },
        { status: 400 }
      );
    }

    const ticket = await prisma.platformTicket.findUnique({
      where: { id: ticketId },
      include: { company: true, order: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    }

    const company = ticket.company;
    const order = ticket.order;

    // Action 1: Suspend Merchant Store
    if (action === "SUSPEND_MERCHANT") {
      if (!company) {
        return NextResponse.json({ error: "No company associated with this ticket." }, { status: 400 });
      }

      await prisma.$transaction([
        prisma.company.update({
          where: { id: company.id },
          data: { status: "SUSPENDED" },
        }),
        prisma.platformTicket.update({
          where: { id: ticket.id },
          data: {
            adminNotes: note
              ? `${ticket.adminNotes || ""}\n[SUSPENDED] ${note}`.trim()
              : `${ticket.adminNotes || ""}\nStore suspended by superadmin.`.trim(),
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: `Merchant store "${company.name}" has been suspended. Storefront access and payouts are blocked.`,
      });
    }

    // Action 2: Unsuspend Merchant Store
    if (action === "UNSUSPEND_MERCHANT") {
      if (!company) {
        return NextResponse.json({ error: "No company associated with this ticket." }, { status: 400 });
      }

      await prisma.company.update({
        where: { id: company.id },
        data: { status: "ACTIVE" },
      });

      return NextResponse.json({
        success: true,
        message: `Merchant store "${company.name}" has been restored to ACTIVE.`,
      });
    }

    // Action 3: Resolve Dispute & Release Payout to Merchant
    if (action === "RELEASE_PAYOUT") {
      if (!order || !company) {
        return NextResponse.json({ error: "No order or company attached to this dispute." }, { status: 400 });
      }

      const netKobo = order.merchantNetKobo || order.amountKobo;

      await prisma.$transaction([
        prisma.platformTicket.update({
          where: { id: ticket.id },
          data: {
            status: "RESOLVED",
            resolvedBy: session.user.email,
            adminNotes: note ? `${ticket.adminNotes || ""}\n[RELEASED] ${note}`.trim() : ticket.adminNotes,
          },
        }),
        prisma.order.update({
          where: { id: order.id },
          data: {
            settlementStatus: "SETTLED",
            settledAt: new Date(),
          },
        }),
        prisma.company.update({
          where: { id: company.id },
          data: {
            disputedBalanceKobo: { decrement: netKobo },
            settledBalanceKobo: { increment: netKobo },
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: `Dispute ${ticket.ticketNumber} resolved. Held funds of ₦${Math.round(netKobo / 100).toLocaleString()} cleared to merchant settled balance.`,
      });
    }

    // Action 4: Dismiss / Reject Dispute (Return to Pending 24H)
    if (action === "REJECT_DISPUTE") {
      if (!order || !company) {
        return NextResponse.json({ error: "No order or company attached to this dispute." }, { status: 400 });
      }

      const netKobo = order.merchantNetKobo || order.amountKobo;

      await prisma.$transaction([
        prisma.platformTicket.update({
          where: { id: ticket.id },
          data: {
            status: "REJECTED",
            resolvedBy: session.user.email,
            adminNotes: note ? `${ticket.adminNotes || ""}\n[REJECTED] ${note}`.trim() : ticket.adminNotes,
          },
        }),
        prisma.order.update({
          where: { id: order.id },
          data: {
            settlementStatus: "PENDING_24H",
          },
        }),
        prisma.company.update({
          where: { id: company.id },
          data: {
            disputedBalanceKobo: { decrement: netKobo },
            pendingBalanceKobo: { increment: netKobo },
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: `Dispute ${ticket.ticketNumber} rejected. Funds returned to merchant pending balance.`,
      });
    }

    // Action 5: Execute Paystack Refund to Buyer
    if (action === "REFUND_ORDER") {
      if (!order || !company) {
        return NextResponse.json({ error: "No order or company attached to this dispute." }, { status: 400 });
      }

      const secretKey = process.env.PAYSTACK_SECRET_KEY;
      let paystackRefundSuccess = false;
      let paystackMessage = "";

      if (secretKey && order.reference) {
        try {
          const refundRes = await fetch("https://api.paystack.co/refund", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${secretKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              transaction: order.reference,
              amount: order.amountKobo, // in kobo
              merchant_note: `Buyer dispute ${ticket.ticketNumber} refund authorized by Superadmin.`,
            }),
          });
          const refundData = await refundRes.json();
          if (refundData.status) {
            paystackRefundSuccess = true;
            paystackMessage = refundData.message || "Refund queued on Paystack.";
          } else {
            paystackMessage = refundData.message || "Paystack refund request returned error.";
          }
        } catch (err: any) {
          paystackMessage = err.message || "Failed to contact Paystack refund endpoint.";
        }
      } else {
        paystackMessage = "Simulated refund: PAYSTACK_SECRET_KEY not set.";
        paystackRefundSuccess = true;
      }

      const netKobo = order.merchantNetKobo || order.amountKobo;

      await prisma.$transaction([
        prisma.platformTicket.update({
          where: { id: ticket.id },
          data: {
            status: "RESOLVED",
            refundStatus: paystackRefundSuccess ? "SUCCESS" : "QUEUED",
            resolvedBy: session.user.email,
            adminNotes: `${ticket.adminNotes || ""}\n[REFUND] ${paystackMessage} ${note || ""}`.trim(),
          },
        }),
        prisma.order.update({
          where: { id: order.id },
          data: {
            settlementStatus: "REFUNDED",
          },
        }),
        prisma.company.update({
          where: { id: company.id },
          data: {
            disputedBalanceKobo: { decrement: netKobo },
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: `Refund initiated for Order #${order.reference}. Merchant dispute balance reduced. ${paystackMessage}`,
      });
    }

    // Action 6: Mark General Support Report as Resolved
    if (action === "RESOLVE_SUPPORT") {
      await prisma.platformTicket.update({
        where: { id: ticket.id },
        data: {
          status: "RESOLVED",
          resolvedBy: session.user.email,
          adminNotes: note ? `${ticket.adminNotes || ""}\n[RESOLVED] ${note}`.trim() : ticket.adminNotes,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Support ticket ${ticket.ticketNumber} marked as RESOLVED.`,
      });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error("[SuperadminTicketActionAPI] Error:", error);
    return NextResponse.json(
      { error: "Internal server error performing ticket action." },
      { status: 500 }
    );
  }
}
