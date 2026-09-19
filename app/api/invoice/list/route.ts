import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { prisma } from "@/app/lib/prisma/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        memberships: {
          where: { status: "ACTIVE" },
          take: 1,
        },
      },
    });

    const targetCompanyId =
      session.user.activeCompanyId ||
      session.user.companyId ||
      user?.memberships?.[0]?.companyId ||
      null;

    if (!targetCompanyId) {
      return NextResponse.json({ success: true, orders: [], nextCursor: null, hasMore: false });
    }

    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit") || searchParams.get("step") || "20";
    const limit = Math.min(Math.max(1, parseInt(limitParam, 10) || 20), 50);
    const cursor = searchParams.get("cursor");

    const rawOrders = await prisma.order.findMany({
      where: { companyId: targetCompanyId },
      orderBy: [
        { createdAt: "desc" },
        { id: "desc" },
      ],
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = rawOrders.length > limit;
    const orders = hasMore ? rawOrders.slice(0, limit) : rawOrders;
    const nextCursor = hasMore && orders.length > 0 ? orders[orders.length - 1].id : null;

    const formattedOrders = orders.map((o) => ({
      id: o.id,
      reference: o.reference,
      invoiceNumber: o.invoiceNumber,
      orderType: o.orderType,
      amountKobo: o.amountKobo,
      amountNaira: Math.round(o.amountKobo / 100),
      originalAmountNaira: o.originalAmountKobo ? Math.round(o.originalAmountKobo / 100) : null,
      discountNaira: o.discountKobo ? Math.round(o.discountKobo / 100) : 0,
      status: o.status,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      customerEmail: o.customerEmail,
      notes: o.notes,
      createdAt: o.createdAt.toISOString(),
      checkoutUrl: `/checkout/${o.id}`,
    }));

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      nextCursor,
      hasMore,
      limit,
    });
  } catch (error) {
    console.error("[InvoiceListAPI] Error:", error);
    return NextResponse.json({ error: "Failed to list invoices" }, { status: 500 });
  }
}
