import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companySlug, items, notes, customerName, customerEmail, customerPhone } = body;

    if (!companySlug || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Invalid order payload. Store and items are required." },
        { status: 400 }
      );
    }

    // 1. Find Company
    const company = await prisma.company.findUnique({
      where: { slug: companySlug.toLowerCase().trim() },
    });

    if (!company || company.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Store not found or currently unavailable." },
        { status: 404 }
      );
    }

    // 2. Calculate Total Amount
    const totalAmountKobo = items.reduce((sum: number, item: any) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 1;
      return sum + Math.round(price * qty * 100);
    }, 0);

    const reference = `ORD_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // 3. Create Order
    const order = await prisma.order.create({
      data: {
        companyId: company.id,
        reference,
        orderType: "CATALOG",
        amountKobo: totalAmountKobo,
        originalAmountKobo: totalAmountKobo,
        discountKobo: 0,
        shippingKobo: 0,
        status: "PENDING",
        customerEmail: customerEmail?.trim() || "guest@checkout.local",
        customerName: customerName?.trim() || null,
        customerPhone: customerPhone?.trim() || null,
        items,
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      reference: order.reference,
      checkoutUrl: `/checkout/${order.id}`,
    });
  } catch (error) {
    console.error("Create Checkout Order Error:", error);
    return NextResponse.json(
      { error: "Failed to initialize checkout order." },
      { status: 500 }
    );
  }
}
