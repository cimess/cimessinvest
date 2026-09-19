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

export interface CompanyStorageStatus {
  companyId: string;
  companyName: string;
  planSelected: string;
  storageUsedMB: number;
  storageLimitMB: number;
  remainingStorageMB: number;
  usedPercentage: number;
  isExceeded: boolean;
  isNearLimit: boolean;
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
 * Checks a Company tenant's storage usage, limit, and remaining capacity.
 *
 * @param companyId - ID of the Company
 * @param syncWithMediaTable - If true, recalculates total bytes from Image table (excluding platform assets)
 */
export async function checkCompanyStorage(
  companyId: string,
  syncWithMediaTable: boolean = false
): Promise<CompanyStorageStatus> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      name: true,
      planSelected: true,
      storageUsed: true,
      storageLimit: true,
      members: {
        where: { role: "OWNER" },
        include: {
          user: {
            select: { id: true, email: true, companyName: true },
          },
        },
        take: 1,
      },
    },
  });

  if (!company) {
    throw new Error(`Company workspace with ID "${companyId}" not found.`);
  }

  let storageUsedMB = company.storageUsed ?? 0;
  const storageLimitMB = company.storageLimit ?? 1024;

  if (syncWithMediaTable) {
    const aggregateResult = await prisma.image.aggregate({
      where: {
        companyId: company.id,
        isPlatformAsset: false,
      },
      _sum: {
        size: true, // in bytes
      },
    });

    const totalBytes = aggregateResult._sum.size ?? 0;
    storageUsedMB = Math.ceil(totalBytes / (1024 * 1024));

    await prisma.company.update({
      where: { id: company.id },
      data: { storageUsed: storageUsedMB },
    });
  }

  const remainingStorageMB = Math.max(0, storageLimitMB - storageUsedMB);
  const rawPercentage = storageLimitMB > 0 ? (storageUsedMB / storageLimitMB) * 100 : 0;
  const usedPercentage = Math.min(100, Number(rawPercentage.toFixed(2)));

  const isExceeded = storageUsedMB >= storageLimitMB;
  const isNearLimit = usedPercentage >= 90;

  // Trigger 80% warning email to Company Owner if threshold reached
  const ownerUser = company.members[0]?.user;
  if (usedPercentage >= 80 && ownerUser) {
    triggerStorageWarning80({
      userId: ownerUser.id,
      toEmail: ownerUser.email,
      userName: company.name || ownerUser.companyName || ownerUser.email,
      storageUsedMB,
      storageLimitMB,
      usedPercentage,
    }).catch((err) => console.error("[StorageWorker] Warning email trigger failed:", err));
  }

  return {
    companyId: company.id,
    companyName: company.name || "Unknown Brand",
    planSelected: company.planSelected,
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
 * Checks a user's storage usage, resolving to their Company workspace if available.
 * 
 * @param userId - ID of the user to check
 * @param syncWithMediaTable - If true, recalculates total bytes from the Image table
 */
export async function checkUserStorage(
  userId: string,
  syncWithMediaTable: boolean = false
): Promise<StorageStatus> {
  // Check if user belongs to a company
  const membership = await prisma.companyMember.findFirst({
    where: { userId },
    select: { companyId: true },
  });

  if (membership?.companyId) {
    const companyStatus = await checkCompanyStorage(membership.companyId, syncWithMediaTable);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    return {
      userId,
      email: user?.email || "",
      companyName: companyStatus.companyName,
      planSelected: companyStatus.planSelected,
      storageUsedMB: companyStatus.storageUsedMB,
      storageLimitMB: companyStatus.storageLimitMB,
      remainingStorageMB: companyStatus.remainingStorageMB,
      usedPercentage: companyStatus.usedPercentage,
      isExceeded: companyStatus.isExceeded,
      isNearLimit: companyStatus.isNearLimit,
      formatted: companyStatus.formatted,
    };
  }

  // 1. Fetch user storage info from DB (resolving manager to admin if applicable)
  let user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      companyName: true,
      planSelected: true,
      storageUsed: true,
      storageLimit: true,
      role: true,
      adminId: true,
    },
  });

  if (!user) {
    throw new Error(`User with ID "${userId}" not found.`);
  }

  if (user.role === "MANAGER" && user.adminId) {
    const adminUser = await prisma.user.findUnique({
      where: { id: user.adminId },
      select: {
        id: true,
        email: true,
        companyName: true,
        planSelected: true,
        storageUsed: true,
        storageLimit: true,
        role: true,
        adminId: true,
      },
    });
    if (adminUser) {
      user = adminUser;
    }
  }

  let storageUsedMB = user.storageUsed ?? 0;
  const storageLimitMB = user.storageLimit ?? 500;

  if (syncWithMediaTable) {
    const aggregateResult = await prisma.image.aggregate({
      where: {
        OR: [
          { adminId: user.id },
          { adminId: null },
        ],
      },
      _sum: {
        size: true,
      },
    });

    const totalBytes = aggregateResult._sum.size ?? 0;
    storageUsedMB = Math.ceil(totalBytes / (1024 * 1024));

    await prisma.user.update({
      where: { id: user.id },
      data: { storageUsed: storageUsedMB },
    });
  }

  const remainingStorageMB = Math.max(0, storageLimitMB - storageUsedMB);
  const rawPercentage = storageLimitMB > 0 ? (storageUsedMB / storageLimitMB) * 100 : 0;
  const usedPercentage = Math.min(100, Number(rawPercentage.toFixed(2)));

  const isExceeded = storageUsedMB >= storageLimitMB;
  const isNearLimit = usedPercentage >= 90;

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
    companyName: user.companyName || "Unknown Brand",
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
 * Validates whether a file upload fits within the remaining storage quota.
 */
export async function canUploadFile(
  entityId: string,
  fileSizeBytes: number,
  isCompany: boolean = false
): Promise<UploadCheckResult> {
  const fileSizeMB = Math.ceil(fileSizeBytes / (1024 * 1024));
  const storage = isCompany
    ? await checkCompanyStorage(entityId)
    : await checkUserStorage(entityId);

  if (storage.isExceeded) {
    return {
      allowed: false,
      fileSizeMB,
      remainingMB: storage.remainingStorageMB,
      message: `Upload blocked: Storage limit reached (${storage.formatted.used} / ${storage.formatted.limit}). Upgrade your plan for more space.`,
    };
  }

  if (fileSizeMB > storage.remainingStorageMB) {
    return {
      allowed: false,
      fileSizeMB,
      remainingMB: storage.remainingStorageMB,
      message: `Upload blocked: File size (${fileSizeMB} MB) exceeds remaining space (${storage.remainingStorageMB} MB).`,
    };
  }

  return {
    allowed: true,
    fileSizeMB,
    remainingMB: storage.remainingStorageMB,
  };
}

/**
 * Validates whether a plan downgrade is permissible given current storage usage.
 */
export async function canDowngradeStorage(
  entityId: string,
  targetLimitMB: number,
  isCompany: boolean = false
): Promise<DowngradeCheckResult> {
  const storage = isCompany
    ? await checkCompanyStorage(entityId, true)
    : await checkUserStorage(entityId, true);

  if (storage.storageUsedMB > targetLimitMB) {
    return {
      eligible: false,
      storageUsedMB: storage.storageUsedMB,
      targetLimitMB,
      message: `Cannot downgrade: Current usage (${storage.storageUsedMB} MB) exceeds target limit (${targetLimitMB} MB). Please delete files first.`,
    };
  }

  return {
    eligible: true,
    storageUsedMB: storage.storageUsedMB,
    targetLimitMB,
  };
}

// Backwards-compatibility aliases
export const canUserUpload = canUploadFile;
export const validatePlanDowngradeEligibility = canDowngradeStorage;
