import { NextResponse } from "next/server";
import { finalizeTransactionVerification } from "@/app/api/service/payment.service";
import { checkUserStorage } from "@/app/api/workers/storageWorker";
import { prisma } from "@/app/lib/prisma/prisma";
import { auth } from "@/app/auth";
import { getSafeErrorMessage } from "@/app/lib/utils/errorHandler";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized: Active session required" }, { status: 401 });
    }

    const userRole = (session?.user?.role || "").toUpperCase();
    if (userRole === "MANAGER") {
      return NextResponse.json(
        { error: "Forbidden: Store managers are not authorized to check payment transactions." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json({ error: "Transaction reference is required" }, { status: 400 });
    }

    // 1. Fetch transaction record
    const transaction = await prisma.transaction.findUnique({
      where: { reference },
      include: { user: true },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction reference not found" }, { status: 404 });
    }

    // Ownership check: Requester must own this transaction or be a Superadmin
    const currentUserId = session.user.id;
    const currentUserEmail = session.user.email;
    const isSuperAdmin = (session.user.role || "").toUpperCase() === "SUPERADMIN";
    const isOwner = transaction.userId === currentUserId || transaction.user?.email === currentUserEmail;

    if (!isOwner && !isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden: You do not own this transaction" }, { status: 403 });
    }

    // 2. Edge Case A Handling: If status is PENDING, run on-the-fly verification fallback
    let verification = null;
    if (transaction.status !== "COMPLETED") {
      verification = await finalizeTransactionVerification(reference);
    }

    const isPaid = transaction.status === "COMPLETED" || verification?.success === true;

    if (!isPaid) {
      const isFailed = transaction.status === "FAILED" || verification?.status === "FAILED";
      if (isFailed) {
        return NextResponse.json(
          {
            success: false,
            status: "FAILED",
            message: verification?.message || "Payment transaction failed, was cancelled, or timed out. Please try again.",
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          status: "PENDING",
          message: verification?.message || "Payment verification in progress. Please wait...",
        },
        { status: 200 }
      );
    }

    // 3. Retrieve storage metrics (preserves used storage and displays extended limit)
    const storageStats = await checkUserStorage(transaction.userId, false);

    return NextResponse.json({
      success: true,
      status: "APPROVED",
      message: "Payment verified successfully. Subscription active and storage extended.",
      transaction: {
        reference: transaction.reference,
        amount: transaction.amount / 100, // converted from kobo to NGN
        planSelected: transaction.planSelected,
        status: "COMPLETED",
      },
      plan: {
        selected: transaction.planSelected,
        status: "ACTIVE",
      },
      storage: {
        limitMB: storageStats.storageLimitMB,
        usedMB: storageStats.storageUsedMB,
        remainingMB: storageStats.remainingStorageMB,
        usedPercentage: storageStats.usedPercentage,
        formatted: storageStats.formatted,
      },
    });
  } catch (error) {
    console.error("Check Status API Error:", error);
    const safeError = getSafeErrorMessage(error, "Internal server error checking payment status");
    return NextResponse.json(
      { success: false, error: safeError.message },
      { status: safeError.statusCode }
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}
