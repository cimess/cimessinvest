import { NextRequest, NextResponse } from "next/server";
import { reconcilePendingTransactions } from "@/app/api/service/payment.service";

/**
 * GET /api/cron/payment-reconciliation
 * Vercel Cron Job endpoint running periodically to:
 * 1. Discover all lingering PENDING transactions created during payment checkouts.
 * 2. Query Paystack verify endpoint.
 * 3. Finalize any transactions that actually succeeded on Paystack.
 * 4. Clean up and mark all failed, abandoned, or timed-out transactions as FAILED in the database.
 */
export async function GET(req: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get("authorization");

    // Secure Cron endpoint against unauthorized invocations
    // Fail closed if CRON_SECRET is configured and auth header doesn't match
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
    }

    // In production without CRON_SECRET, reject for safety
    if (!cronSecret && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "CRON_SECRET is not configured on server." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const maxAgeHours = Number(searchParams.get("maxAgeHours")) || 72;

    const result = await reconcilePendingTransactions(maxAgeHours);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: `Reconciliation finished. ${result.totalPendingChecked} pending transactions inspected. ${result.completed.length} completed, ${result.failed.length} marked as failed.`,
      metrics: {
        totalPendingChecked: result.totalPendingChecked,
        completedCount: result.completed.length,
        failedCount: result.failed.length,
        stillPendingCount: result.stillPending.length,
      },
      details: {
        completed: result.completed,
        failed: result.failed,
        stillPending: result.stillPending,
      },
    });
  } catch (error: unknown) {
    console.error("[VercelCron] Payment reconciliation error:", error);
    const msg = error instanceof Error ? error.message : "Cron execution error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
