import { Prisma } from "@/app/generated/prisma";

/**
 * Whitelist of safe, non-sensitive User fields for frontend consumption.
 * Explicitly excludes: password (bcrypt hash), authorizationKey, resetToken, resetTokenExpiry.
 */
export const SAFE_USER_SELECT = {
  id: true,
  companyName: true,
  email: true,
  phone: true,
  role: true,
  adminId: true,
  paymentVerified: true,
  planSelected: true,
  subscription_status: true,
  storageUsed: true,
  storageLimit: true,
  createdAt: true,
} as const satisfies Prisma.UserSelect;

export type SafeUser = Prisma.UserGetPayload<{ select: typeof SAFE_USER_SELECT }>;

/**
 * Whitelist of safe SiteSetting fields for public and dashboard display.
 */
export const SAFE_SITE_SETTING_SELECT = {
  id: true,
  primaryColor: true,
  accentColor: true,
  backgroundColor: true,
  showDefaultImages: true,
  appendDefaults: true,
  removeAllDefaults: true,
  whatsappNumber: true,
  companyName: true,
  heroVideoUrl: true,
  tailorBioText: true,
  tailorBioImage: true,
  heroGridImages: true,
  rawMaterialImages: true,
} as const satisfies Prisma.SiteSettingSelect;

export type SafeSiteSetting = Prisma.SiteSettingGetPayload<{ select: typeof SAFE_SITE_SETTING_SELECT }>;
