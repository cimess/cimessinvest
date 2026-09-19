import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma/prisma";
import { verifyPaystackSignature, finalizeTransactionVerification } from "@/app/api/service/payment.service";
import { fulfillPaidOrder } from "@/app/api/service/orderPayment.service";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    // 1. Verify Cryptographic HMAC Signature
    const isValidSignature = verifyPaystackSignature(rawBody, signature);
    if (!isValidSignature) {
      console.warn("Unauthorized webhook attempt: Signature mismatch.");
      return NextResponse.json({ error: "Invalid cryptographic signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // 2. Process charge.success event
    if (event === "charge.success") {
      const reference = payload.data?.reference;

      if (reference) {
        // Disambiguate: Storefront Order / Negotiated Invoice vs. SaaS Subscription
        if (reference.startsWith("ORD_") || reference.startsWith("INV_")) {
          // A. Process Storefront Order / Quick Invoice Payment & Credit Merchant Ledger
          await fulfillPaidOrder(reference);
          console.log(`[Webhook] Order ${reference} fulfilled successfully with merchant ledger credit.`);
        } else {
          // B. Process SaaS Subscription Upgrade
          await finalizeTransactionVerification(reference);
          console.log(`[Webhook] SaaS Subscription ${reference} verified successfully.`);
        }
      }
    }

    return NextResponse.json({ status: "success", message: "Webhook processed" }, { status: 200 });
  } catch (error) {
    console.error("Paystack Webhook Error:", error);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }
}
