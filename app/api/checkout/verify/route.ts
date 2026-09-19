import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma/prisma";
import { fulfillPaidOrder } from "@/app/api/service/orderPayment.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    const orderId = searchParams.get("orderId");

    if (!reference && !orderId) {
      return NextResponse.json(
        { error: "Reference or Order ID is required." },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(reference ? [{ reference }] : []),
          ...(orderId ? [{ id: orderId }] : []),
        ],
      },
      include: {
        company: {
          include: { siteSetting: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // If already marked completed in DB
    if (order.status === "COMPLETED") {
      return NextResponse.json({
        success: true,
        isPaid: true,
        order: {
          id: order.id,
          reference: order.reference,
          invoiceNumber: order.invoiceNumber,
          status: order.status,
          settlementStatus: order.settlementStatus,
          amountNaira: Math.round(order.amountKobo / 100),
        },
      });
    }

    // Verify on Paystack Gateway
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (secretKey && order.reference) {
      const paystackRes = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(order.reference)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${secretKey}`,
          },
        }
      );

      const paystackData = await paystackRes.json();

      if (paystackData.status && paystackData.data?.status === "success") {
        // Fulfill and credit the merchant company ledger
        const fulfillment = await fulfillPaidOrder(order.reference);
        return NextResponse.json({
          success: true,
          isPaid: true,
          order: {
            id: fulfillment.order.id,
            reference: fulfillment.order.reference,
            invoiceNumber: fulfillment.order.invoiceNumber,
            status: fulfillment.order.status,
            settlementStatus: fulfillment.order.settlementStatus,
            amountNaira: Math.round(fulfillment.order.amountKobo / 100),
          },
        });
      } else if (paystackData.data?.status === "failed") {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "FAILED" },
        });
        return NextResponse.json({
          success: false,
          isPaid: false,
          status: "FAILED",
          message: paystackData.data?.gateway_response || "Payment transaction failed.",
        });
      }
    }

    return NextResponse.json({
      success: true,
      isPaid: false,
      status: order.status,
      settlementStatus: order.settlementStatus,
    });
  } catch (error) {
    console.error("[CheckoutVerifyAPI] Error verifying payment:", error);
    return NextResponse.json(
      { error: "Internal server error verifying payment." },
      { status: 500 }
    );
  }
}
