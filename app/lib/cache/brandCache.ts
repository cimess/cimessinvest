import { unstable_cache, revalidateTag, revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma/prisma";
import { DEFAULT_SITE_CONFIG } from "@/app/lib/content/defaults";

export interface CachedBrandConfig {
  brandName: string;
  whatsappNumber: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  companyName: string | null;
  phone: string | null;
  siteSetting: {
    id: string;
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    showDefaultImages: boolean;
    appendDefaults: boolean;
    removeAllDefaults: boolean;
    whatsappNumber: string | null;
    companyName: string | null;
    heroVideoUrl: string | null;
    tailorBioText: string | null;
    tailorBioImage: string | null;
    heroGridImages: string[];
    rawMaterialImages: string[];
  } | null;
}

/**
 * High-Performance Cached Fetcher for Brand Details & Site Settings.
 * Cached in RAM via Next.js Data Cache with tag 'brand-config'.
 */
export const getCachedBrandConfig = unstable_cache(
  async (): Promise<CachedBrandConfig> => {
    try {
      const [siteSetting, userOwner] = await Promise.all([
        prisma.siteSetting.findFirst().catch(() => null),
        prisma.user.findFirst({ where: { role: { not: "SUPERADMIN" } } }).catch(() => null),
      ]);

      const brandName =
        siteSetting?.companyName?.trim() ||
        userOwner?.companyName?.trim() ||
        DEFAULT_SITE_CONFIG.brandName;

      const whatsappNumber =
        siteSetting?.whatsappNumber?.trim() ||
        userOwner?.phone?.trim() ||
        DEFAULT_SITE_CONFIG.whatsappNumber;

      return {
        brandName,
        whatsappNumber,
        primaryColor: siteSetting?.primaryColor || "#1A1A1A",
        accentColor: siteSetting?.accentColor || "#C9A96E",
        backgroundColor: siteSetting?.backgroundColor || "#F5F0EB",
        companyName: siteSetting?.companyName || userOwner?.companyName || null,
        phone: siteSetting?.whatsappNumber || userOwner?.phone || null,
        siteSetting: siteSetting
          ? {
              id: siteSetting.id,
              primaryColor: siteSetting.primaryColor,
              accentColor: siteSetting.accentColor,
              backgroundColor: siteSetting.backgroundColor,
              showDefaultImages: siteSetting.showDefaultImages,
              appendDefaults: siteSetting.appendDefaults,
              removeAllDefaults: siteSetting.removeAllDefaults,
              whatsappNumber: siteSetting.whatsappNumber,
              companyName: siteSetting.companyName,
              heroVideoUrl: siteSetting.heroVideoUrl,
              tailorBioText: siteSetting.tailorBioText,
              tailorBioImage: siteSetting.tailorBioImage,
              heroGridImages: siteSetting.heroGridImages || [],
              rawMaterialImages: siteSetting.rawMaterialImages || [],
            }
          : null,
      };
    } catch (error) {
      console.error("[BrandCache] Failed to load brand config:", error);
      return {
        brandName: DEFAULT_SITE_CONFIG.brandName,
        whatsappNumber: DEFAULT_SITE_CONFIG.whatsappNumber,
        primaryColor: "#1A1A1A",
        accentColor: "#C9A96E",
        backgroundColor: "#F5F0EB",
        companyName: null,
        phone: null,
        siteSetting: null,
      };
    }
  },
  ["brand-config-cache-v1"],
  {
    tags: ["brand-config"],
    revalidate: 3600, // Fallback TTL of 1 hour if not revalidated manually
  }
);

/**
 * Triggers clean revalidation of brand config cache across all pages & endpoints.
 */
export async function revalidateBrandCache() {
  try {
    revalidateTag("brand-config", { expire: 0 });
    revalidatePath("/", "layout");
    revalidatePath("/api/brand");
    revalidatePath("/api/user/settings");
  } catch (error) {
    console.error("[BrandCache] Revalidation error:", error);
  }
}
