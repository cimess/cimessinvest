import { prisma } from "@/app/lib/prisma/prisma";
import { triggerStorageWarning80 } from "@/app/api/workers/emailWorker";

export interface StorageStatus {
  userId: string;
  email: string;
  companyName: string;
  planSelected: string;
  storageUsedMB: number;
  storageLimitMB: number;
  remainingStorageMB: number;
  usedPercentage: number;
  isExceeded: boolean;
  isNearLimit: boolean; // True if >= 90% space used
  formatted: {
    used: string;
    limit: string;
    remaining: string;
    percentage: string;
  };
}

export interface UploadCheckResult {
  allowed: boolean;
  fileSizeMB: number;
  remainingMB: number;
  message?: string;
}

export interface DowngradeCheckResult {
  eligible: boolean;
  storageUsedMB: number;
  targetLimitMB: number;
  message?: string;
}

/**
 * Checks a user's storage usage, limit, and remaining capacity.
 * 
 * @param userId - ID of the user to check
 * @param syncWithMediaTable - If true, recalculates total bytes from the Image table and updates User.storageUsed in DB
 */
export async function checkUserStorage(
  userId: string,
  syncWithMediaTable: boolean = false
): Promise<StorageStatus> {
  // 1. Fetch user storage info from DB
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      companyName: true,
      planSelected: true,
      storageUsed: true,
      storageLimit: true,
    },
  });

  if (!user) {
    throw new Error(`User with ID "${userId}" not found.`);
  }

  let storageUsedMB = user.storageUsed ?? 0;
  const storageLimitMB = user.storageLimit ?? 500; // Default limit fallback (500 MB)

  // 2. Optionally synchronize by summing actual asset sizes in the Image table
  if (syncWithMediaTable) {
    const aggregateResult = await prisma.image.aggregate({
      _sum: {
        size: true, // size stored in bytes
      },
    });

    const totalBytes = aggregateResult._sum.size ?? 0;
    // Convert Bytes to MB (1 MB = 1024 * 1024 Bytes)
    storageUsedMB = Math.ceil(totalBytes / (1024 * 1024));

    // Persist recalculated storage back to User model
    await prisma.user.update({
      where: { id: userId },
      data: { storageUsed: storageUsedMB },
    });
  }

  // 3. Compute remaining space & metrics
  const remainingStorageMB = Math.max(0, storageLimitMB - storageUsedMB);
  const rawPercentage = storageLimitMB > 0 ? (storageUsedMB / storageLimitMB) * 100 : 0;
  const usedPercentage = Math.min(100, Number(rawPercentage.toFixed(2)));

  const isExceeded = storageUsedMB >= storageLimitMB;
  const isNearLimit = usedPercentage >= 90;

  // 4. Trigger Email Alert Worker if storage is 80%+ full
  if (usedPercentage >= 80) {
    triggerStorageWarning80({
      userId: user.id,
      toEmail: user.email,
      userName: user.companyName || user.email,
      storageUsedMB,
      storageLimitMB,
      usedPercentage,
    }).catch((err) => console.error("[StorageWorker] Warning email trigger failed:", err));
  }

  return {
    userId: user.id,
    email: user.email,
    companyName: user.companyName,
    planSelected: user.planSelected,
    storageUsedMB,
    storageLimitMB,
    remainingStorageMB,
    usedPercentage,
    isExceeded,
    isNearLimit,
    formatted: {
      used: `${storageUsedMB} MB`,
      limit: `${storageLimitMB} MB`,
      remaining: `${remainingStorageMB} MB`,
      percentage: `${usedPercentage}%`,
    },
  };
}

/**
 * Worker helper to verify if an incoming upload fits within remaining storage quota.
 * 
 * @param userId - ID of the uploading user
 * @param newFileSizeBytes - Size of the file being uploaded in Bytes
 */
export async function canUserUpload(
  userId: string,
  newFileSizeBytes: number
): Promise<UploadCheckResult> {
  const stats = await checkUserStorage(userId);
  const fileSizeMB = Number((newFileSizeBytes / (1024 * 1024)).toFixed(2));

  if (stats.isExceeded) {
    return {
      allowed: false,
      fileSizeMB,
      remainingMB: stats.remainingStorageMB,
      message: `Storage quota exceeded (${stats.formatted.used} / ${stats.formatted.limit}). Upgrade your plan to upload more assets.`,
    };
  }

  if (fileSizeMB > stats.remainingStorageMB) {
    return {
      allowed: false,
      fileSizeMB,
      remainingMB: stats.remainingStorageMB,
      message: `File size (${fileSizeMB} MB) exceeds remaining storage quota (${stats.formatted.remaining}).`,
    };
  }

  return {
    allowed: true,
    fileSizeMB,
    remainingMB: stats.remainingStorageMB,
  };
}

/**
 * Worker check to prevent users from tricking the system by switching to a plan
 * whose storage capacity is lower than their current used storage.
 * 
 * @param userId - ID of the user trying to change plan
 * @param targetPlanLimitMB - The storage limit of the plan they want to switch to
 */
export async function validatePlanDowngradeEligibility(
  userId: string,
  targetPlanLimitMB: number
): Promise<DowngradeCheckResult> {
  const stats = await checkUserStorage(userId, true);

  if (stats.storageUsedMB > targetPlanLimitMB) {
    return {
      eligible: false,
      storageUsedMB: stats.storageUsedMB,
      targetLimitMB: targetPlanLimitMB,
      message: `Cannot switch to this plan: Your current storage usage (${stats.formatted.used}) exceeds the target plan limit (${targetPlanLimitMB} MB). Please delete uploaded assets to free up space before changing plans.`,
    };
  }

  return {
    eligible: true,
    storageUsedMB: stats.storageUsedMB,
    targetLimitMB: targetPlanLimitMB,
  };
}
