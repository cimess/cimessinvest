import { prisma } from "@/app/lib/prisma/prisma";
import { getPlatformFeePercent } from "@/app/lib/platformConfig";
import { triggerOrderPaidReceiptEmail } from "@/app/api/workers/emailWorker";

/**
 * Fulfill an Order after successful Paystack payment.
 * Idempotent: Can be called by Paystack Webhook or Checkout Verification Callback.
 * Atomically updates order, stock, and the merchant's financial ledger in the database.
 */
export async function fulfillPaidOrder(orderIdOrReference: string) {
  // 1. Locate Order
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { id: orderIdOrReference },
        { reference: orderIdOrReference },
      ],
    },
    include: {
      company: {
        include: { siteSetting: true },
      },
    },
  });

  if (!order) {
    throw new Error(`Order not found for identifier: ${orderIdOrReference}`);
  }

  // Idempotency: If already fulfilled, return existing order
  if (order.status === "COMPLETED") {
    return { alreadyCompleted: true, order };
  }

  // 2. Atomic Stock Decrement for Catalog Products
  if (Array.isArray(order.items)) {
    for (const item of order.items as any[]) {
      if (item.id) {
        const qty = Number(item.quantity) || 1;
        await prisma.product.updateMany({
          where: { id: item.id, stock: { gte: qty } },
          data: { stock: { decrement: qty } },
        }).catch(() => null);
      }
    }
  }

  // 3. Calculate Platform Split Fee
  const feePercent = await getPlatformFeePercent();
  const platformFeeKobo = Math.round(order.amountKobo * (feePercent / 100));
  const merchantNetKobo = Math.max(0, order.amountKobo - platformFeeKobo);

  // 4. Update Order Status to COMPLETED with 24H Pending Settlement
  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "COMPLETED",
      settlementStatus: "PENDING_24H",
      merchantNetKobo,
      platformFeeKobo,
    },
  });

  // 5. Directly Credit Merchant Company Balance on DB (Financial Ledger)
  await prisma.company.update({
    where: { id: order.companyId },
    data: {
      pendingBalanceKobo: { increment: merchantNetKobo },
      todaySalesKobo: { increment: merchantNetKobo },
      lastSalesDate: new Date(),
    },
  });

  console.log(`[OrderPaymentService] Order ${order.reference} fulfilled. Credited ₦${(merchantNetKobo / 100).toLocaleString()} to company ${order.companyId}.`);

  // 6. Dispatch Customer Paid Receipt Email
  if (order.customerEmail && order.customerEmail.includes("@")) {
    const storeName = order.company?.siteSetting?.companyName || order.company?.name || "Merchant Store";
    const baseUrl = process.env.NEXTAUTH_URL || "https://cimessinvest.com";
    const rawItems = Array.isArray(order.items) ? (order.items as any[]) : [];
    const formattedItems = rawItems.map((item: any, idx: number) => ({
      name: item.name || item.title || `Item #${idx + 1}`,
      quantity: Number(item.quantity) || 1,
      priceNaira: item.price ? Math.round(Number(item.price)) : Math.round(order.amountKobo / 100),
    }));

    triggerOrderPaidReceiptEmail({
      toEmail: order.customerEmail,
      customerName: order.customerName || "Valued Customer",
      customerPhone: order.customerPhone || undefined,
      orderReference: order.reference,
      invoiceNumber: order.invoiceNumber,
      storeName,
      orderType: order.orderType,
      amountNaira: Math.round(order.amountKobo / 100),
      originalAmountNaira: order.originalAmountKobo ? Math.round(order.originalAmountKobo / 100) : null,
      discountNaira: order.discountKobo ? Math.round(order.discountKobo / 100) : 0,
      shippingNaira: Math.round(order.shippingKobo / 100),
      items: formattedItems,
      notes: order.notes,
      paymentDate: new Date().toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      checkoutUrl: `${baseUrl}/checkout/${order.id}`,
      whatsappNumber: order.company?.siteSetting?.whatsappNumber || null,
    }).catch((emailErr) => console.error("[OrderPaymentService] Failed sending order paid receipt email:", emailErr));
  }

  return { success: true, order: updatedOrder, merchantNetKobo };
}
