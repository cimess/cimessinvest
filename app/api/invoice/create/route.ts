import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { prisma } from "@/app/lib/prisma/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      items,
      amountKobo,
      originalAmountKobo,
      discountKobo = 0,
      shippingKobo = 0,
      notes,
    } = body;

    if (!amountKobo || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Negotiated amount and item details are required." },
        { status: 400 }
      );
    }
    if (!customerEmail || !customerName) {
      return NextResponse.json(
        { error: "Customer details are required." },
        { status: 400 }
      );
    }

    // 1. Resolve Active Merchant Company
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

    if (!targetCompanyId) {
      return NextResponse.json({ error: "No active merchant store found." }, { status: 404 });
    }

    const company = await prisma.company.findUnique({
      where: { id: targetCompanyId },
      include: { siteSetting: true },
    });

    if (!company) {
      return NextResponse.json({ error: "Store not found." }, { status: 404 });
    }

    // 2. Generate Unique Invoice Number & Reference
    const invoiceNum = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
    const reference = `INV_${company.slug.toUpperCase()}_${Date.now()}`;

    // 3. Create Negotiated Order Record
    const order = await prisma.order.create({
      data: {
        companyId: company.id,
        reference,
        invoiceNumber: invoiceNum,
        orderType: "INVOICE",
        amountKobo,
        originalAmountKobo: originalAmountKobo || amountKobo,
        discountKobo,
        shippingKobo,
        status: "PENDING",
        customerEmail: customerEmail?.trim() ||"N/A",
        customerName: customerName?.trim() || null,
        customerPhone: customerPhone?.trim() || null,
        items,
        notes: notes?.trim() || null,
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "https://cimessinvest.com";
    const checkoutUrl = `${baseUrl}/checkout/${order.id}`;

    // 4. Pre-formatted WhatsApp Message for Merchant to Send to Buyer
    const storeName = company.siteSetting?.companyName || company.name;
    const finalNaira = Math.round(amountKobo / 100).toLocaleString();
    const discountNote = discountKobo > 0 ? ` (Includes ₦${Math.round(discountKobo / 100).toLocaleString()} negotiated discount)` : "";
    
    const whatsappShareText = `Hello ${customerName || "Customer"}, here is your custom payment link for your order with ${storeName}:\n\n*Amount:* ₦${finalNaira}${discountNote}\n*Invoice Ref:* ${invoiceNum}\n\n👉 Complete payment securely here:\n${checkoutUrl}\n\nThank you for your business!`;

    return NextResponse.json({
      success: true,
      orderId: order.id,
      invoiceNumber: invoiceNum,
      reference: order.reference,
      checkoutUrl,
      whatsappShareText,
    });
  } catch (error) {
    console.error("Create Quick Invoice Error:", error);
    return NextResponse.json({ error: "Failed to generate quick invoice." }, { status: 500 });
  }
}
