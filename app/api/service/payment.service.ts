import { prisma } from "@/app/lib/prisma/prisma";
import crypto from "crypto";
import { validatePlanDowngradeEligibility } from "@/app/api/workers/storageWorker";
import { triggerPaymentReceiptEmail } from "@/app/api/workers/emailWorker";
import { PaymentGatewayError, AppValidationError } from "@/app/lib/utils/errorHandler";

export type PaidPlanType = "STARTER" | "PROFESSIONAL" | "ENTERPRISE";
export type PlanType = PaidPlanType | "FREE_TRIAL";

// Fixed Storage Limits by Plan (in MB)
export const PLAN_STORAGE_LIMITS: Record<PlanType, number> = {
  FREE_TRIAL: 100,
  STARTER: 500,
  PROFESSIONAL: 2000,
  ENTERPRISE: 10000, // Default Enterprise limit fallback if customStorageMB is not provided
};

// Plan Pricing in Kobo (1 NGN = 100 Kobo)
export const PLAN_PRICES_KOBO: Record<PlanType, number> = {
  FREE_TRIAL: 0,
  STARTER: 200000,       // ₦2,000
  PROFESSIONAL: 1000000, // ₦10,000
  ENTERPRISE: 5000000,   // Default ₦50,000 fallback
};

/**
 * 1. Initialize a Paystack Transaction with Custom Enterprise Support & Downgrade Prevention
 */
export async function initializePaystackTransaction({
  userId,
  email,
  planSelected,
  customAmountKobo,
  customStorageMB,
  callbackUrl,
}: {
  userId: string;
  email: string;
  planSelected: PaidPlanType;
  customAmountKobo?: number;
  customStorageMB?: number;
  callbackUrl?: string;
}) {
  // Determine target plan storage limit
  const targetStorageLimitMB =
    planSelected === "ENTERPRISE" && customStorageMB
      ? customStorageMB
      : PLAN_STORAGE_LIMITS[planSelected] || 500;

  // Prevent Downgrade Abuse: Check if current storage usage exceeds the target plan's limit
  const downgradeCheck = await validatePlanDowngradeEligibility(userId, targetStorageLimitMB);
  if (!downgradeCheck.eligible) {
    throw new AppValidationError(
      downgradeCheck.message || "Storage limit exceeded for the selected plan."
    );
  }

  // Determine final payment amount in Kobo (dynamic for Enterprise if customAmountKobo passed)
  const amount =
    planSelected === "ENTERPRISE" && customAmountKobo
      ? customAmountKobo
      : PLAN_PRICES_KOBO[planSelected] || PLAN_PRICES_KOBO.STARTER;

  const reference = `CMS-REF-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

  // Save Pending Transaction in DB
  await prisma.transaction.create({
    data: {
      userId,
      reference,
      amount,
      planSelected,
      customStorageMB: planSelected === "ENTERPRISE" && customStorageMB ? customStorageMB : null,
      status: "PENDING",
    },
  });

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new PaymentGatewayError("Paystack secret key is not configured.");
  }

    // 1. Map Paystack Plan Codes from environment variables
  const planCodes: Record<"STARTER" | "PROFESSIONAL", string | undefined> = {
    STARTER: process.env.PAYSTACK_PLAN_STARTER,
    PROFESSIONAL: process.env.PAYSTACK_PLAN_PROFESSIONAL,
  };

  // 2. If it's a fixed plan (STARTER or PROFESSIONAL), verify the plan exists
  if (planSelected !== "ENTERPRISE") {
    const planCode = planCodes[planSelected];
    const isConfigured = Boolean(planCode && planCode.startsWith("PLN_") );

    if (!isConfigured) {
      const planName = planSelected === "STARTER" ? "Starter" : "Professional";
      throw new PaymentGatewayError(
        `The ${planName} subscription plan is not active yet. Please contact support or try again later.`
      );
    }
  }

  // 3. Prepare Paystack Payload
  const paystackBody: Record<string, unknown> = {
    email,
    amount,
    reference,
    callback_url:
      callbackUrl ||
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard/payment/callback`,
    metadata: {
      platform: "cimessinvest",
      userId,
      planSelected,
      customStorageMB,
    },
  };

  // 4. Custom Enterprise (Amount Only) vs. Fixed Subscription Plan
  if (planSelected === "ENTERPRISE") {
    if (!amount || amount <= 0) {
      throw new PaymentGatewayError("Invalid payment amount for Custom Enterprise plan.");
    }
    // Dynamic pricing: ensure NO plan is attached so Paystack charges ONLY the custom amount
    delete paystackBody.plan;
  } else {
    paystackBody.plan = planCodes[planSelected];
  }


  const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(paystackBody),
  });

  const data = await paystackRes.json();
  if (data.status) {
    await prisma.transaction.update({
      where: { reference },
      data: { paystackAccessCode: data.data.access_code },
    });
    return {
      success: true,
      authorization_url: data.data.authorization_url,
      reference,
      access_code: data.data.access_code,
    };
  }

  console.error("Paystack initialization failed:", data);
  const paystackErrorMessage =
    process.env.NODE_ENV === "development"
      ? (data.message || "Failed to initialize Paystack transaction.")
      : (data.message || "Payment initialization failed. Please try again.");

  throw new PaymentGatewayError(paystackErrorMessage);
}


/**
 * 2. Cryptographic Webhook Signature Verification (Edge Case B)
 */
export function verifyPaystackSignature(rawBody: string, signature: string | null): boolean {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) return true; // Sandbox bypass
  if (!signature) return false;

  const hash = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");
  return hash === signature;
}

/**
 * 3. Verify Transaction & Extend User Capacity (Edge Case A & Webhook handler)
 */
export async function finalizeTransactionVerification(reference: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { reference },
    include: { user: true },
  });

  if (!transaction) {
    return { success: false, message: "Transaction record not found." };
  }

  // Already completed
  if (transaction.status === "COMPLETED") {
    return {
      success: true,
      status: "COMPLETED",
      user: transaction.user,
      planSelected: transaction.planSelected,
      storageLimitMB: transaction.user.storageLimit,
    };
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  let isVerifiedOnPaystack = true;

  // On-the-Fly Server Verification Call to Paystack (Edge Case A Fallback)
  if (secretKey) {
    try {
      const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
        signal: AbortSignal.timeout(3000),
      });

      const data = await paystackRes.json();

      // 1. Transaction succeeded on Paystack
      if (data.status && data.data?.status === "success") {
        isVerifiedOnPaystack = true;
      } else if (
        data.status &&
        (data.data?.status === "failed" || data.data?.status === "abandoned" || data.data?.status === "reversed")
      ) {
        // 2. Explicit failure, abandonment, or reversal from Paystack -> Update DB to FAILED
        await prisma.transaction.update({
          where: { reference },
          data: { status: "FAILED" },
        });

        return {
          success: false,
          status: "FAILED",
          message: data.data?.gateway_response || data.message || `Payment ${data.data?.status || "failed"}.`,
        };
      } else if (!data.status) {
        // 3. Paystack returned false (reference not found on gateway or expired session)
        const ageMs = Date.now() - new Date(transaction.createdAt).getTime();
        if (ageMs > 15 * 60 * 1000) {
          await prisma.transaction.update({
            where: { reference },
            data: { status: "FAILED" },
          });

          return {
            success: false,
            status: "FAILED",
            message: data.message || "Payment session expired or not found on Paystack.",
          };
        }

        return { success: false, status: "PENDING", message: data.message || "Transaction not yet verified." };
      } else {
        // Still pending / ongoing on Paystack
        return { success: false, status: "PENDING", message: "Transaction pending authorization on Paystack." };
      }
    } catch (fetchErr) {
      console.error(`[PaymentService] Verification fetch error for ${reference}:`, fetchErr);
      const ageMs = Date.now() - new Date(transaction.createdAt).getTime();
      // If checkout session is older than 30 minutes, mark as FAILED
      if (ageMs > 30 * 60 * 1000) {
        await prisma.transaction.update({
          where: { reference },
          data: { status: "FAILED" },
        });
        return {
          success: false,
          status: "FAILED",
          message: "Payment session expired after 30+ minutes.",
        };
      }
      return { success: false, status: "PENDING", message: "Temporary gateway verification error." };
    }
  }

  if (!isVerifiedOnPaystack) {
    return { success: false, status: "PENDING", message: "Transaction pending or not verified." };
  }

  // Update DB Transaction Status to COMPLETED
  await prisma.transaction.update({
    where: { reference },
    data: { status: "COMPLETED" },
  });

  // Expand User Fixed Storage Limit (uses custom storage if Enterprise negotiated, else plan limit)
  let newStorageLimitMB = (PLAN_STORAGE_LIMITS as Record<string, number>)[transaction.planSelected] || 500;
  if (transaction.planSelected === "ENTERPRISE" && transaction.customStorageMB) {
    newStorageLimitMB = transaction.customStorageMB;
  }

  // Plan traffic defaults
  const planTrafficLimits: Record<string, number> = {
    STARTER: 2000,
    PROFESSIONAL: 15000,
    ENTERPRISE: 50000,
  };
  let newTrafficLimit = planTrafficLimits[transaction.planSelected] || 2000;

  // Check if user has an approved custom quote to claim
  const activeQuote = await prisma.customPlanQuote.findFirst({
    where: { userId: transaction.userId, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
  });

  if (activeQuote) {
    if (activeQuote.authorizedTrafficLimit) {
      newTrafficLimit = activeQuote.authorizedTrafficLimit;
    }
    await prisma.customPlanQuote.update({
      where: { id: activeQuote.id },
      data: { status: "CLAIMED" },
    });
  }

  const updatedUser = await prisma.user.update({
    where: { id: transaction.userId },
    data: {
      paymentVerified: true,
      subscription_status: "ACTIVE",
      planSelected: transaction.planSelected,
      storageLimit: newStorageLimitMB,
      trafficLimit: newTrafficLimit,
      trafficNotified80: false,
      trafficNotified100: false,
    },
  });

  // Also update merchant active Company so profile updates immediately across the platform
  const activeMembership = await prisma.companyMember.findFirst({
    where: { userId: transaction.userId, status: "ACTIVE" },
    select: { companyId: true },
  });

  if (activeMembership?.companyId) {
    await prisma.company.update({
      where: { id: activeMembership.companyId },
      data: {
        planSelected: transaction.planSelected as any,
        subscription_status: "ACTIVE",
        storageLimit: newStorageLimitMB,
        trialEndsAt:null,
        trafficLimit: newTrafficLimit,
      },
    });
  }

  // Dispatch Platform Payment Invoice Email
  const amountFormatted = `₦${(transaction.amount / 100).toLocaleString()}`;
  const dateFormatted = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  triggerPaymentReceiptEmail({
    userId: updatedUser.id,
    toEmail: updatedUser.email,
    userName: updatedUser.companyName || updatedUser.email,
    planName: transaction.planSelected,
    amountFormatted,
    reference: transaction.reference,
    transactionDate: dateFormatted,
    storageLimitMB: newStorageLimitMB,
  }).catch((err) => console.error("[PaymentService] Failed sending payment receipt email:", err));

  return {
    success: true,
    status: "COMPLETED",
    user: updatedUser,
    planSelected: transaction.planSelected,
    storageLimitMB: newStorageLimitMB,
  };
}

export interface ReconciliationResult {
  totalPendingChecked: number;
  completed: Array<{ reference: string; userEmail: string; plan: string }>;
  failed: Array<{ reference: string; reason: string }>;
  stillPending: Array<{ reference: string; ageMinutes: number }>;
}

/**
 * Reconciles all lingering PENDING transactions against Paystack.
 * Automatically completes valid transactions and marks failed/abandoned/expired ones as FAILED.
 */
export async function reconcilePendingTransactions(maxAgeHours: number = 72): Promise<ReconciliationResult> {
  const cutoffDate = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);

  const pendingTransactions = await prisma.transaction.findMany({
    where: {
      status: "PENDING",
      createdAt: { gte: cutoffDate },
    },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  const result: ReconciliationResult = {
    totalPendingChecked: pendingTransactions.length,
    completed: [],
    failed: [],
    stillPending: [],
  };

  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  for (const tx of pendingTransactions) {
    const ageMs = Date.now() - new Date(tx.createdAt).getTime();
    const ageMinutes = Math.round(ageMs / (60 * 1000));

    // Allow user 10 minutes from initialization to finish paying
    if (ageMinutes < 10) {
      result.stillPending.push({ reference: tx.reference, ageMinutes });
      continue;
    }

    if (!secretKey) {
      // Sandbox fallback: mark older than 30 mins as FAILED
      if (ageMinutes >= 30) {
        await prisma.transaction.update({
          where: { id: tx.id },
          data: { status: "FAILED" },
        });
        result.failed.push({ reference: tx.reference, reason: "Sandbox expired checkout" });
      } else {
        result.stillPending.push({ reference: tx.reference, ageMinutes });
      }
      continue;
    }

    try {
      const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(tx.reference)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
        signal: AbortSignal.timeout(3000),
      });

      const data = await paystackRes.json();

      if (data.status && data.data?.status === "success") {
        // Succeeded on Paystack! Finalize in DB and activate user
        await finalizeTransactionVerification(tx.reference);
        result.completed.push({
          reference: tx.reference,
          userEmail: tx.user.email,
          plan: tx.planSelected,
        });
      } else if (
        data.status &&
        (data.data?.status === "failed" || data.data?.status === "abandoned" || data.data?.status === "reversed")
      ) {
        // Explicit failure, abandoned modal, or reversal
        await prisma.transaction.update({
          where: { id: tx.id },
          data: { status: "FAILED" },
        });
        result.failed.push({
          reference: tx.reference,
          reason: data.data?.gateway_response || `Paystack reported ${data.data?.status}`,
        });
      } else if (!data.status) {
        // Paystack reference not found (never initiated or expired)
        if (ageMinutes >= 20) {
          await prisma.transaction.update({
            where: { id: tx.id },
            data: { status: "FAILED" },
          });
          result.failed.push({
            reference: tx.reference,
            reason: data.message || "Reference not found on Paystack (expired session)",
          });
        } else {
          result.stillPending.push({ reference: tx.reference, ageMinutes });
        }
      } else {
        // Still marked as ongoing / pending on Paystack
        // If older than 30 minutes, Paystack checkout session has expired
        if (ageMinutes >= 30) {
          await prisma.transaction.update({
            where: { id: tx.id },
            data: { status: "FAILED" },
          });
          result.failed.push({
            reference: tx.reference,
            reason: "Checkout session expired after 30+ minutes without completion",
          });
        } else {
          result.stillPending.push({ reference: tx.reference, ageMinutes });
        }
      }
    } catch (err: any) {
      console.error(`[Reconciliation] Error verifying ${tx.reference}:`, err);
      if (ageMinutes >= 30) {
        await prisma.transaction.update({
          where: { id: tx.id },
          data: { status: "FAILED" },
        });
        result.failed.push({ reference: tx.reference, reason: "Gateway unreachable; timed out after 30m" });
      } else {
        result.stillPending.push({ reference: tx.reference, ageMinutes });
      }
    }
  }

  return result;
}
