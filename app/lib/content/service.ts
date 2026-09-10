import { 
  DEFAULT_SITE_CONFIG, 
  DEFAULT_HERO_DATA, 
  DEFAULT_STATEMENT_DATA, 
  DEFAULT_DESIGNER_DATA, 
  DEFAULT_FEATURED_ITEMS, 
  DEFAULT_PROCESS_STEPS, 
  DEFAULT_TESTIMONIALS, 
  DEFAULT_COLLECTIONS 
} from "./defaults";
import { SiteConfig, FeaturedItem } from "./types";
import { getCachedBrandConfig } from "@/app/lib/cache/brandCache";
import { prisma } from "@/app/lib/prisma/prisma";

// Site Config resolver using direct cached DB data (no SSR HTTP 401s)
export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const cached = await getCachedBrandConfig();
    const siteSetting = cached.siteSetting;

    return {
      ...DEFAULT_SITE_CONFIG,
      brandName: cached.brandName || DEFAULT_SITE_CONFIG.brandName,
      whatsappNumber: cached.whatsappNumber || DEFAULT_SITE_CONFIG.whatsappNumber,
      colors: {
        ...DEFAULT_SITE_CONFIG.colors,
        primary: siteSetting?.primaryColor || DEFAULT_SITE_CONFIG.colors.primary,
        accent: siteSetting?.accentColor || DEFAULT_SITE_CONFIG.colors.accent,
        background: siteSetting?.backgroundColor || DEFAULT_SITE_CONFIG.colors.background,
      }
    };
  } catch (err) {
    console.warn("Failed to load cached brand config, using default:", err);
    return DEFAULT_SITE_CONFIG;
  }
}

export interface GetCollectionsOptions {
  cursor?: string;
  limit?: number;
  group?: string;
  category?: string;
  placement?: string;
}

export interface CollectionsResult {
  items: FeaturedItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Direct Server Data Resolver for Collections Catalog
 * Handles DB images, placement filtering ("both" | "collection"),
 * cursor-based pagination (take + 1 pattern), and respects dashboard site settings.
 */
export async function getCollectionsItems(options?: GetCollectionsOptions): Promise<CollectionsResult> {
  const limit = Math.min(Math.max(1, options?.limit ?? 24), 100);
  const cursor = options?.cursor;
  const group = options?.group;
  const category = options?.category;
  const placement = options?.placement;

  try {
    const where: any = {
      AND: [
        placement
          ? { OR: [{ placement }, { placement: "both" }, { placement: null }] }
          : { OR: [{ placement: "both" }, { placement: "collection" }, { placement: null }] },
      ],
    };

    if (group && group !== "All") {
      where.AND.push({ group });
    }

    if (category && category !== "All") {
      where.AND.push({ category: { equals: category, mode: "insensitive" } });
    }

    const [dbImages, siteSetting] = await Promise.all([
      prisma.image.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      }).catch((err) => {
        console.error("Error fetching image catalog from database:", err);
        return [];
      }),
      prisma.siteSetting.findFirst().catch(() => null),
    ]);

    const hasMore = dbImages.length > limit;
    const pageRows = hasMore ? dbImages.slice(0, limit) : dbImages;
    const nextCursor = hasMore && pageRows.length > 0 ? pageRows[pageRows.length - 1].id : null;

    const formattedDbItems: FeaturedItem[] = pageRows.map((img: any) => ({
      id: img.id,
      title: img.title || "Bespoke Design",
      category: img.category,
      group: img.group || "Native",
      placement: img.placement || "both",
      image: img.url,
    }));

    const showDefaultImages = siteSetting?.showDefaultImages ?? true;
    const appendDefaults = siteSetting?.appendDefaults ?? false;
    const removeAllDefaults = siteSetting?.removeAllDefaults ?? false;

    // Only inject default fallback items on the first page (when no cursor is supplied)
    if (!cursor) {
      if (removeAllDefaults || !showDefaultImages) {
        return { items: formattedDbItems, nextCursor, hasMore };
      }

      if (appendDefaults) {
        return {
          items: [...formattedDbItems, ...DEFAULT_FEATURED_ITEMS],
          nextCursor,
          hasMore,
        };
      }

      const finalItems =
        formattedDbItems.length > 0 ? [...formattedDbItems, ...DEFAULT_FEATURED_ITEMS] : DEFAULT_FEATURED_ITEMS;
      return { items: finalItems, nextCursor, hasMore };
    }

    return { items: formattedDbItems, nextCursor, hasMore };
  } catch (error) {
    console.error("Error retrieving collection items:", error);
    return {
      items: cursor ? [] : DEFAULT_FEATURED_ITEMS,
      nextCursor: null,
      hasMore: false,
    };
  }
}

export const getHeroContent = async () => ({ data: DEFAULT_HERO_DATA, isHidden: false });
export const getStatementContent = async () => ({ data: DEFAULT_STATEMENT_DATA, isHidden: false });
export const getDesignerContent = async () => ({ data: DEFAULT_DESIGNER_DATA, isHidden: false });
export const getFeaturedContent = async () => ({ data: DEFAULT_FEATURED_ITEMS, isHidden: false });
export const getProcessContent = async () => ({ data: DEFAULT_PROCESS_STEPS, isHidden: false });
export const getTestimonialsContent = async () => ({ data: DEFAULT_TESTIMONIALS, isHidden: false });
export const getCollectionsContent = async () => ({ data: DEFAULT_COLLECTIONS, isHidden: false });
