import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { isSuperAdmin } from "@/app/lib/auth/superadmin";
import { getPlatformFeePercent, updatePlatformFeePercent } from "@/app/lib/platformConfig";

/**
 * GET /api/superadmin/config
 * Retrieves the platform configuration including the active platform fee percentage.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!isSuperAdmin(session)) {
      return NextResponse.json(
        { error: "Forbidden: Superadmin access required." },
        { status: 403 }
      );
    }

    const platformFeePercent = await getPlatformFeePercent();

    return NextResponse.json({
      success: true,
      config: {
        platformFeePercent,
      },
    });
  } catch (error) {
    console.error("[SuperadminConfig] Error fetching platform config:", error);
    return NextResponse.json(
      { error: "Failed to retrieve platform configuration." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/superadmin/config
 * Updates the platform fee percentage and optionally synchronizes existing Paystack subaccounts.
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!isSuperAdmin(session)) {
      return NextResponse.json(
        { error: "Forbidden: Superadmin access required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { platformFeePercent, syncExistingSubaccounts = false } = body;

    if (
      typeof platformFeePercent !== "number" ||
      isNaN(platformFeePercent) ||
      platformFeePercent < 0 ||
      platformFeePercent > 50
    ) {
      return NextResponse.json(
        { error: "Invalid platform fee percentage. Must be a number between 0% and 50%." },
        { status: 400 }
      );
    }

    const result = await updatePlatformFeePercent(platformFeePercent, {
      syncPaystack: Boolean(syncExistingSubaccounts),
    });

    let syncMsg = "";
    if (syncExistingSubaccounts) {
      syncMsg = ` Synchronized ${result.syncedCount} Paystack subaccount(s).`;
      if (result.failedCount > 0) {
        syncMsg += ` (${result.failedCount} subaccount syncs failed/skipped).`;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Platform fee updated to ${result.config.platformFeePercent}%.${syncMsg}`,
      config: {
        platformFeePercent: result.config.platformFeePercent,
        updatedAt: result.config.updatedAt,
      },
      syncStats: {
        syncedCount: result.syncedCount,
        failedCount: result.failedCount,
      },
    });
  } catch (error: any) {
    console.error("[SuperadminConfig] Error updating platform config:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update platform configuration." },
      { status: 500 }
    );
  }
}
