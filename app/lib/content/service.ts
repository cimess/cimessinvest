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
import { SiteConfig, SectionContent } from "./types";
import { api } from "../utils/apiClient";

// Site Config resolver calling /api/user/settings endpoint
export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const res = await api.get("/api/user/settings");
    const data = res.data?.siteSetting || res.data?.user || res.data;
    return resolveSiteConfigFallback({
      brandName: data?.companyName || data?.brandName,
      whatsappNumber: data?.whatsappNumber || data?.phone,
      ...data,
    });
  } catch {
    return resolveSiteConfigFallback(DEFAULT_SITE_CONFIG);
  }
}


function resolveSiteConfigFallback(config: Partial<SiteConfig>): SiteConfig {
  const brandName = config.brandName || process.env.NEXT_PUBLIC_BRAND_NAME || "Ti Stiches" || "cimessinvest";
  const whatsappNumber = config.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "0000000";

  return {
    ...DEFAULT_SITE_CONFIG,
    ...config,
    brandName,
    whatsappNumber,
    fonts: { ...DEFAULT_SITE_CONFIG.fonts, ...config.fonts },
    colors: { ...DEFAULT_SITE_CONFIG.colors, ...config.colors }
  };
}

export async function getSectionContent<T>(
  endpoint: string, 
  defaultData: T
): Promise<{ data: T; isHidden: boolean }> {
  try {
    const res = await api.get(`/content/${endpoint}`);
    const payload: SectionContent<T> = res.data;

    if (payload.mode === "hidden") {
      return { data: defaultData, isHidden: true };
    }

    if (payload.mode === "add" && Array.isArray(defaultData) && Array.isArray(payload.data)) {
      return { data: [...defaultData, ...payload.data] as unknown as T, isHidden: false };
    }

    if (payload.mode === "replace" && payload.data) {
      return { data: payload.data, isHidden: false };
    }

    return { data: defaultData, isHidden: false };
  } catch {
    return { data: defaultData, isHidden: false };
  }
}

export const getHeroContent = () => getSectionContent("hero", DEFAULT_HERO_DATA);
export const getStatementContent = () => getSectionContent("statement", DEFAULT_STATEMENT_DATA);
export const getDesignerContent = () => getSectionContent("designer", DEFAULT_DESIGNER_DATA);
export const getFeaturedContent = () => getSectionContent("featured", DEFAULT_FEATURED_ITEMS);
export const getProcessContent = () => getSectionContent("process", DEFAULT_PROCESS_STEPS);
export const getTestimonialsContent = () => getSectionContent("testimonials", DEFAULT_TESTIMONIALS);
export const getCollectionsContent = () => getSectionContent("collections", DEFAULT_COLLECTIONS);
