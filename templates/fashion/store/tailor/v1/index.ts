import { TemplateDefinition } from "@/templates/types";
import { tailorThemeV1 } from "./theme";
import { tailorComponentSchemas, tailorComponentMap } from "./components";
import { tailorHomePageV1 } from "./pages/home";
import { tailorCollectionsPageV1 } from "./pages/collections";
import TailorStorefront from "./TailorStorefront";
import { TAILOR_V1_ASSETS } from "./assets";

export { tailorComponentMap, TailorStorefront };

export const fashionStoreTailorV1: TemplateDefinition = {
  id: "fashion-store-tailor-v1",
  slug: "fashion-store-tailor-v1",
  name: "Atelier Haute Couture",
  industry: "FASHION_ATELIER",
  storeCategory: "store",
  subType: "tailor",
  version: 1,
  description:
    "Flagship luxury African bespoke fashion atelier template featuring cinematic GSAP scrolling, lookbook catalog, and WhatsApp concierge.",
  thumbnailUrl: TAILOR_V1_ASSETS.showcase.thumbnail,
  brandVibe: "ROYAL_LUXURY",
  theme: tailorThemeV1,
  components: tailorComponentSchemas,
  pages: [tailorHomePageV1, tailorCollectionsPageV1],
  seo: {
    schemaType: "ClothingStore",
    category: "Bespoke Tailoring & Haute Couture Atelier",
    defaultTitlePattern: "{name} | Bespoke Tailoring & Native Wear in {city}, {country}",
    defaultDescriptionPattern:
      "{name} is an elite bespoke atelier in {city}, {state}, Nigeria specializing in custom agbada, senator wear, wedding kaftans, and luxury tailoring.",
    targetKeywords: [
      "best tailor in nigeria",
      "tailor in lagos",
      "bespoke tailor nigeria",
      "bespoke native wear lagos",
      "agbada designer nigeria",
      "wedding agbada tailor",
      "senator suit maker lagos",
      "luxury african menswear",
      "custom kaftan tailor",
      "aso-ebi designer lagos",
    ],
    offerCatalogName: "Haute Couture & Tailored Garments",
    priceRange: "₦₦₦",
  },
};


export default fashionStoreTailorV1;
