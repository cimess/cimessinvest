import React from "react";
import { ALL_TEMPLATES, getTemplateBySlug, getTemplatesBySubType } from "./registry";
import { TemplateDefinition, IndustryType, BlockInstance, StorefrontSlots } from "./types";
import { fashionStoreTailorV1, tailorComponentMap, TailorStorefront } from "./fashion/store/tailor/v1";
import { gymStoreFitnessV1, gymComponentMap, GymStorefront } from "./gym/store/fitness/v1";

/**
 * Registry of live React component maps keyed by template slug.
 * Allows the storefront engine to dynamically resolve React components per template.
 */
const TEMPLATE_COMPONENT_MAPS: Record<string, Record<string, React.ComponentType<any>>> = {
  [fashionStoreTailorV1.slug]: tailorComponentMap,
  [gymStoreFitnessV1.slug]: gymComponentMap,
};

/**
 * Master Self-Contained Storefront Component Map.
 * Maps template slugs directly to their self-contained landing/storefront components.
 */
const STOREFRONT_COMPONENT_MAP: Record<
  string,
  React.ComponentType<{ slots?: StorefrontSlots }>
> = {
  [fashionStoreTailorV1.slug]: TailorStorefront,
  [gymStoreFitnessV1.slug]: GymStorefront,
};

/**
 * Resolves the self-contained storefront component for a given template slug.
 * Defaults to the flagship TailorStorefront if unmapped.
 */
export function resolveStorefrontComponent(
  templateSlug?: string | null
): React.ComponentType<{ slots?: StorefrontSlots }> {
  if (!templateSlug) return TailorStorefront;
  return STOREFRONT_COMPONENT_MAP[templateSlug] || TailorStorefront;
}

/**
 * Resolves the default master template for a given industry.
 * Falls back to the flagship Fashion Atelier template if none is registered yet.
 */
export function getDefaultTemplateForIndustry(industry?: string | null): TemplateDefinition {
  if (!industry) return fashionStoreTailorV1;

  const normalized = industry.toUpperCase() as IndustryType;
  if (normalized === "FITNESS_GYM") return gymStoreFitnessV1;
  const match = ALL_TEMPLATES.find((tpl) => tpl.industry === normalized);
  return match || fashionStoreTailorV1;
}

/**
 * Resolves the active template for a merchant/company following the user's exact hierarchy:
 * 1. User Chosen Template:
 *    - First checks if user/company chose a template (`activeTemplateSlug` or `activeTemplateId`).
 *    - If chosen (and registered in the code or available), returns that template.
 * 2. Fallback Hierarchy (if user did not choose a template):
 *    - Check `industry` (e.g. "FITNESS_GYM", "FASHION_ATELIER", "FASHION_BOUTIQUE")
 *    - Check `brand` / category (e.g. "gym", "fashion")
 *    - Check `subBrand` / `subType` (e.g. "fitness", "tailor", "boutique")
 *    - Returns the default template component for that hierarchy.
 * 3. Absolute Fallback: Default flagship tailor template (`fashionStoreTailorV1`).
 */
export function resolveTemplateForCompany(company?: {
  activeTemplateId?: string | null;
  activeTemplateSlug?: string | null;
  industry?: string | null;
  brandCategory?: string | null;
  brandSubType?: string | null;
  subType?: string | null;
}): TemplateDefinition {
  if (!company) return fashionStoreTailorV1;

  // Step 1: User Chosen Template
  const chosenSlug = company.activeTemplateSlug || company.activeTemplateId;
  if (chosenSlug) {
    const chosen = getTemplateBySlug(chosenSlug);
    if (chosen) return chosen;
  }

  // Step 2: Check subBrand / subType
  const subType = company.brandSubType || company.subType;
  if (subType) {
    const subTypeMatch = getTemplatesBySubType(subType);
    if (subTypeMatch.length > 0) return subTypeMatch[0];
  }

  // Step 3: Check industry
  if (company.industry) {
    const industryNormalized = company.industry.toUpperCase() as IndustryType;
    if (industryNormalized === "FITNESS_GYM") return gymStoreFitnessV1;
    const match = ALL_TEMPLATES.find((tpl) => tpl.industry === industryNormalized);
    if (match) return match;
  }

  // Step 4: Check brand / category
  if (company.brandCategory) {
    const brandLower = company.brandCategory.toLowerCase();
    if (brandLower.includes("gym") || brandLower.includes("fitness")) return gymStoreFitnessV1;
    if (brandLower.includes("fashion") || brandLower.includes("tailor")) return fashionStoreTailorV1;
  }

  // Absolute fallback
  return fashionStoreTailorV1;
}

/**
 * Resolves a specific React component by type name from a template's component catalog.
 * e.g., ("fashion-store-tailor-v1", "FeaturedGrid") -> FeaturedGrid React component
 */
export function getComponentForTemplate(
  templateSlug: string,
  componentType: string
): React.ComponentType<any> | null {
  const componentMap =
    TEMPLATE_COMPONENT_MAPS[templateSlug] || TEMPLATE_COMPONENT_MAPS[fashionStoreTailorV1.slug];
  if (!componentMap) return null;

  return componentMap[componentType] || null;
}

/**
 * Extracts and normalizes component props from a dynamic BlockInstance.
 */
export function resolveComponentProps(
  section: BlockInstance,
  context?: {
    brandName?: string;
    whatsappNumber?: string;
    companySlug?: string;
  }
) {
  return {
    id: section.id,
    copy: section.copy || {},
    media: section.media || {},
    layout: section.layout || {},
    styleTokens: section.styleTokens || {},
    dataBinding: section.dataBinding || {},
    context,
  };
}
