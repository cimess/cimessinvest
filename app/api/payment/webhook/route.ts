import { NextResponse } from "next/server";
import { verifyPaystackSignature, finalizeTransactionVerification } from "@/app/api/service/payment.service";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    // 1. Edge Case B: Verify Cryptographic HMAC Signature
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
        // Finalize transaction and expand cumulative storage limit
        await finalizeTransactionVerification(reference);
      }
    }

    return NextResponse.json({ status: "success", message: "Webhook processed" }, { status: 200 });
  } catch (error) {
    console.error("Paystack Webhook Error:", error);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }
}
