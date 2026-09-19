import { TemplateDefinition } from "@/templates/types";
import { gymThemeV1 } from "./theme";
import { gymComponentSchemas, gymComponentMap } from "./components";
import { gymHomePageV1 } from "./pages/home";
import { gymEquipmentsPageV1 } from "./pages/equipments";
import GymStorefront from "./GymStorefront";
import { GYM_V1_ASSETS } from "./assets";

export { gymComponentMap, GymStorefront };

export const gymStoreFitnessV1: TemplateDefinition = {
  id: "gym-store-fitness-v1",
  slug: "gym-store-fitness-v1",
  name: "IronCore Athletic Performance",
  industry: "FITNESS_GYM",
  storeCategory: "store",
  subType: "fitness",
  version: 1,
  description:
    "High-energy athletic conditioning, strength training, and fitness facility template with membership tiers, coach profiles, and WhatsApp bookings.",
  thumbnailUrl: GYM_V1_ASSETS.showcase.thumbnail,
  brandVibe: "INDUSTRIAL",
  theme: gymThemeV1,
  components: gymComponentSchemas,
  pages: [gymHomePageV1, gymEquipmentsPageV1],
  seo: {
    schemaType: "ExerciseGym",
    category: "Athletic Performance & Fitness Gym",
    defaultTitlePattern: "{name} | Elite Fitness Gym & Training in {city}, {country}",
    defaultDescriptionPattern:
      "{name} is a high-performance gym in {city}, {state}, Nigeria offering strength conditioning, olympic lifting, personal coaching, and athletic training.",
    targetKeywords: [
      "gym around lagos",
      "best gym in nigeria",
      "fitness centre lagos",
      "gym in ikeja lagos",
      "personal trainer lagos",
      "strength conditioning nigeria",
      "gym membership lagos",
      "crossfit gym lagos",
      "bodybuilding gym nigeria",
      "weight loss gym lagos",
    ],
    offerCatalogName: "Gym Memberships & Training Programs",
    priceRange: "₦₦₦",
  },
};

export default gymStoreFitnessV1;
