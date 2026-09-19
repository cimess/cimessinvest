import { prisma } from "@/app/lib/prisma/prisma";

export const DEFAULT_PLATFORM_FEE_PERCENT = 5.0;

/**
 * Fetch the current platform fee percentage.
 * Defaults to 5.0% if not yet configured in the database.
 */
export async function getPlatformFeePercent(): Promise<number> {
  try {
    const config = await prisma.platformConfig.findUnique({
      where: { id: "default" },
    });
    return typeof config?.platformFeePercent === "number"
      ? config.platformFeePercent
      : DEFAULT_PLATFORM_FEE_PERCENT;
  } catch (error) {
    console.error("[PlatformConfig] Error querying platform fee percent, falling back to default:", error);
    return DEFAULT_PLATFORM_FEE_PERCENT;
  }
}

/**
 * Update the platform fee percentage and optionally sync all existing
 * Paystack merchant subaccounts with the new percentage charge.
 */
export async function updatePlatformFeePercent(
  newPercent: number,
  options: { syncPaystack?: boolean } = { syncPaystack: false }
) {
  if (typeof newPercent !== "number" || isNaN(newPercent) || newPercent < 0 || newPercent > 50) {
    throw new Error("Platform fee percentage must be a valid number between 0% and 50%.");
  }

  // 1. Upsert PlatformConfig in DB
  const updatedConfig = await prisma.platformConfig.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      platformFeePercent: Number(newPercent.toFixed(2)),
    },
    update: {
      platformFeePercent: Number(newPercent.toFixed(2)),
    },
  });

  let syncedCount = 0;
  let failedCount = 0;

  // 2. Optionally batch-update Paystack Subaccounts
  if (options.syncPaystack && process.env.PAYSTACK_SECRET_KEY) {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const companies = await prisma.company.findMany({
      where: {
        paystackSubaccountCode: { not: null },
      },
      select: {
        id: true,
        name: true,
        paystackSubaccountCode: true,
      },
    });

    for (const comp of companies) {
      const code = comp.paystackSubaccountCode;
      if (!code || code.startsWith("SUB_STUB") || !code.startsWith("ACCT_")) {
        // Skip local mock stubs or invalid codes
        continue;
      }

      try {
        const paystackRes = await fetch(`https://api.paystack.co/subaccount/${code}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            percentage_charge: updatedConfig.platformFeePercent,
          }),
        });

        const paystackData = await paystackRes.json();
        if (paystackData.status) {
          syncedCount++;
        } else {
          console.warn(`[PlatformConfig] Failed syncing subaccount ${code} for company ${comp.name}:`, paystackData.message);
          failedCount++;
        }
      } catch (err) {
        console.error(`[PlatformConfig] Network error syncing subaccount ${code}:`, err);
        failedCount++;
      }
    }
  }

  return {
    config: updatedConfig,
    syncedCount,
    failedCount,
  };
}
