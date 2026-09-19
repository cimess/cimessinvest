import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma/prisma";
import { checkRateLimit } from "@/app/lib/security/rateLimiter";

export async function POST(req: NextRequest) {
  try {
    // 0. Rate limiting to prevent card-testing attacks (max 15 checkouts per 10 minutes per IP)
    const rateLimit = await checkRateLimit(req, {
      keyPrefix: "checkout-init",
      limit: 15,
      windowMs: 10 * 60 * 1000,
      customMessage: "Too many checkout attempts. Please wait a few minutes before trying again.",
    });
    if (!rateLimit.success && rateLimit.response) {
      return rateLimit.response;
    }

    const body = await req.json();
    const { orderId, customerEmail, customerName, customerPhone, deliveryAddress, items } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
    }

    // 1. Fetch Order with Merchant Company
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        company: {
          include: { siteSetting: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (order.status === "COMPLETED") {
      return NextResponse.json(
        { error: "This order has already been paid and fulfilled." },
        { status: 400 }
      );
    }

    // 2. Update Customer Details and Items (if recommended items were added)
    let currentAmountKobo = order.amountKobo;

    const updateData: Record<string, any> = {};
    if (customerEmail) updateData.customerEmail = customerEmail.trim();
    if (customerName) updateData.customerName = customerName.trim();
    if (customerPhone) updateData.customerPhone = customerPhone.trim();

    if (Array.isArray(items) && items.length > 0) {
      const recalculatedKobo = items.reduce((sum: number, it: any) => {
        const price = Number(it.price) || 0;
        const qty = Number(it.quantity) || 1;
        return sum + Math.round(price * qty * 100);
      }, 0);
      if (recalculatedKobo > 0) {
        currentAmountKobo = recalculatedKobo;
        updateData.items = items;
        updateData.amountKobo = recalculatedKobo;
        updateData.originalAmountKobo = recalculatedKobo;
      }
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.order.update({
        where: { id: order.id },
        data: updateData,
      });
    }

    const payEmail = customerEmail?.trim() || order.customerEmail || "customer@store.local";
    const baseUrl = process.env.NEXTAUTH_URL || "https://cimessinvest.com";
    const callbackUrl = `${baseUrl}/checkout/${order.id}`;

    // 3. Initialize Paystack Split Payment
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: "Payment gateway is not configured on the server." },
        { status: 500 }
      );
    }

    const paystackPayload: Record<string, any> = {
      email: payEmail,
      amount: currentAmountKobo,
      reference: order.reference,
      callback_url: callbackUrl,
      metadata: {
        orderId: order.id,
        companyId: order.companyId,
        orderType: order.orderType,
        customerName: customerName || order.customerName,
        customerPhone: customerPhone || order.customerPhone,
        deliveryAddress: deliveryAddress || null,
      },
    };

    // Automated Split Charge if Merchant has Subaccount configured
    if (order.company.paystackSubaccountCode) {
      paystackPayload.subaccount = order.company.paystackSubaccountCode;
      paystackPayload.bearer = "subaccount";
    }

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paystackPayload),
    });

    const paystackData = await paystackRes.json();
    if (!paystackData.status || !paystackData.data?.authorization_url) {
      console.error("[CheckoutInitAPI] Paystack Initialize failed:", paystackData);
      return NextResponse.json(
        { error: paystackData.message || "Failed to initialize payment gateway." },
        { status: 400 }
      );
    }

    const authorizationUrl = paystackData.data.authorization_url;
    const accessCode = paystackData.data.access_code;

    // 4. Update Order with Paystack Access Code
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paystackAccessCode: accessCode,
      },
    });

    return NextResponse.json({
      success: true,
      authorization_url: authorizationUrl,
      access_code: accessCode,
      reference: order.reference,
    });
  } catch (error) {
    console.error("Initialize Order Payment Error:", error);
    return NextResponse.json({ error: "Failed to initialize payment." }, { status: 500 });
  }
}
