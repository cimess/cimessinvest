export type WearGroupId = "Native" | "Modern";
export type PlacementOption = "both" | "collection" | "story";

export interface WearCategoryTag {
  id: string;
  label: string;
  group: WearGroupId;
}

export interface WearGroupDefinition {
  id: WearGroupId;
  label: string;
  tagline: string;
  tags: string[];
}

export const WEAR_GROUPS: Record<WearGroupId, WearGroupDefinition> = {
  Native: {
    id: "Native",
    label: "Native Wears",
    tagline: "Bespoke Nigerian Traditional & Heritage Tailoring",
    tags: [
      "Agbada",
      "Senator Suit",
      "Kaftan",
      "Buba & Sokoto",
      "Isiagu",
      "Dashiki",
      "Aso-Oke / Kembe"
    ],
  },
  Modern: {
    id: "Modern",
    label: "Modern Wears",
    tagline: "Contemporary Streetwear, Athleisure & Urban Silhouettes",
    tags: [
      "Joggers & Sweats",
      "T-Shirts & Tops",
      "Hoodies & Sweatshirts",
      "Cargo Pants & Shorts",
      "Jackets & Overshirts",
      "Casual & Resort Shirts",
      "Skirts & Casual"
    ],
  },
};

export const ALL_CATEGORY_TAGS: string[] = [
  ...WEAR_GROUPS.Native.tags,
  ...WEAR_GROUPS.Modern.tags,
];

export const PLACEMENT_OPTIONS: { id: PlacementOption; label: string; description: string }[] = [
  {
    id: "both",
    label: "Both (Collection & Story)",
    description: "Visible in the Collections archive and featured on the Landing Page Story."
  },
  {
    id: "collection",
    label: "Collection Page Only",
    description: "Appears only in the /collections archive."
  },
  {
    id: "story",
    label: "Story (Landing Page) Only",
    description: "Featured exclusively on the homepage editorial story."
  },
];

export function resolveGroupForCategory(category: string, explicitGroup?: string | null): WearGroupId {
  if (explicitGroup === "Modern" || explicitGroup === "Native") {
    return explicitGroup;
  }
  const lowerCat = category.toLowerCase();
  const isModern = WEAR_GROUPS.Modern.tags.some(t => t.toLowerCase() === lowerCat || lowerCat.includes(t.toLowerCase())) ||
    ["jogger", "tshirt", "t-shirt", "hoodie", "cargo", "jacket", "skirt", "sweat"].some(kw => lowerCat.includes(kw));

  return isModern ? "Modern" : "Native";
}
