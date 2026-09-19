// =============================================================================
// UNIVERSAL TEMPLATE & SDUI COMPONENT SPECIFICATION
// =============================================================================

export type IndustryType =
  | "FASHION_ATELIER"
  | "FASHION_BOUTIQUE"
  | "FITNESS_GYM"
  | "EDITORIAL_BLOG"
  | "FOOD_BEVERAGE"
  | "GENERAL_RETAIL";

export type StoreCategory = "store" | "marketplace" | "portfolio" | "editorial";

// -----------------------------------------------------------------------------
// COLOR & GRADIENT SYSTEM
// -----------------------------------------------------------------------------

export interface GradientPreset {
  id: string;
  name: string;
  css: string; // e.g. "linear-gradient(135deg, #1A1A1A 0%, #2A2421 100%)"
  startColor: string;
  endColor: string;
  angle: number; // in degrees (0-360)
}

export interface ColorSystemConfig {
  primary: string; // Hex e.g. "#1A1A1A"
  accent: string; // Hex e.g. "#C9A96E"
  background: string; // Hex e.g. "#F5F0EB"
  surface: string; // Hex e.g. "#FFFFFF"
  textPrimary: string; // Hex e.g. "#1A1A1A"
  textSecondary: string; // Hex e.g. "#6B5E54"
  gradients: {
    supportsGradient: boolean;
    defaultGradient: string;
    presets: GradientPreset[];
  };
}

// -----------------------------------------------------------------------------
// COMPONENT LAYOUT CONSTRAINTS & EDITABLE FIELDS
// -----------------------------------------------------------------------------

export interface GridConstraints {
  supportsGrid: boolean;
  minColumns: number; // e.g. 2
  maxColumns: number; // e.g. 4
  defaultColumns: number; // e.g. 3
  allowedColumns: number[]; // [2, 3, 4] -> Prevents broken responsive columns
}

export type FieldType =
  | "TEXT"
  | "TEXTAREA"
  | "NUMBER"
  | "SELECT"
  | "COLOR_HEX"
  | "GRADIENT"
  | "MEDIA_IMAGE"
  | "MEDIA_VIDEO"
  | "BOOLEAN";

export interface ComponentFieldDefinition {
  name: string;
  label: string;
  type: FieldType;
  default: any;
  options?: (string | number)[]; // For SELECT type
  min?: number;
  max?: number;
  description?: string;
}

export interface ComponentDefinition {
  type: string; // e.g. "FeaturedGrid", "HeroSection"
  name: string; // e.g. "Signature Collections Bento Grid"
  category: "hero" | "statement" | "catalog" | "story" | "process" | "testimonials" | "cta" | "form";
  isEditable: boolean;
  gridConfig?: GridConstraints;
  editableFields: ComponentFieldDefinition[];
  defaultProps: Record<string, any>;
}

// -----------------------------------------------------------------------------
// TEMPLATE & PAGE DEFINITIONS
// -----------------------------------------------------------------------------

export interface BlockInstance {
  id: string;
  type: string;
  version: number;
  copy: Record<string, any>;
  media?: Record<string, any>;
  dataBinding?: Record<string, any>;
  styleTokens?: Record<string, any>;
  layout?: Record<string, any>;
  fallback?: Record<string, any>;
}

export interface TemplatePageDefinition {
  slug: string; // "home", "collections", "checkout", etc.
  title: string;
  isSystem: boolean;
  version: number;
  sections: BlockInstance[];
}

// -----------------------------------------------------------------------------
// TEMPLATE SEO CONTRACT (Search Engine Optimization & Schema.org Grounding)
// -----------------------------------------------------------------------------

export interface TemplateSeoContract {
  schemaType: "ClothingStore" | "ExerciseGym" | "LocalBusiness";
  category: string;
  defaultTitlePattern: string; // e.g. "{name} | Bespoke Tailoring & Native Wear in {city}, {country}"
  defaultDescriptionPattern: string; // e.g. "{name} is a premier atelier in {city}, {state} specializing in bespoke native wear and agbada."
  targetKeywords: string[]; // e.g. ["best tailor in nigeria", "tailor in lagos", "bespoke native wear"]
  offerCatalogName: string; // e.g. "Haute Couture & Tailored Garments"
  priceRange?: string; // e.g. "₦₦₦"
}

export interface TemplateDefinition {
  id: string; // "fashion-store-tailor-v1"
  slug: string; // unique slug for URLs / database
  name: string; // Display name e.g. "Atelier Editorial"
  industry: IndustryType;
  storeCategory: StoreCategory;
  subType: string; // "tailor", "boutique", "streetwear"
  version: number;
  description: string;
  thumbnailUrl: string;
  brandVibe: string; // "ROYAL_LUXURY", "MINIMAL", etc.
  theme: ColorSystemConfig;
  components: ComponentDefinition[];
  pages: TemplatePageDefinition[];
  seo: TemplateSeoContract;
}

// -----------------------------------------------------------------------------
// DYNAMIC MERCHANT STOREFRONT SLOTS
// -----------------------------------------------------------------------------

export interface StorefrontSlots {
  brandName?: string;
  whatsappNumber?: string;
  heroVideoUrl?: string | null;
  heroGridImages?: string[];
  gridColumns?: number; // 2, 3, or 4
  bioImage?: string | null;
  bioText?: string | null;
  rawMaterialImages?: string[];
  customProducts?: Array<{
    id: string;
    title: string;
    category?: string | null;
    group?: string;
    image: string;
  }>;
  showDefaultImages?: boolean;
  appendDefaults?: boolean;
  removeAllDefaults?: boolean;
  colors?: {
    primary?: string;
    accent?: string;
    background?: string;
  };
  homeUrl?: string;
  storeUrl?: string;
}
