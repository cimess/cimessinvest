import { TemplateDefinition, IndustryType } from "./types";
import { fashionStoreTailorV1 } from "./fashion/store/tailor/v1";
import { gymStoreFitnessV1 } from "./gym/store/fitness/v1";

/**
 * Master Platform Template Registry (Managed exclusively by SuperAdmin).
 * To add a new template in the future:
 * 1. Create a folder under `templates/[industry]/[storeType]/[subType]/v[N]/`
 * 2. Export the TemplateDefinition
 * 3. Add it to this ALL_TEMPLATES array
 * Any new template registered here will automatically become available for switching within its brand vertical!
 */
export const ALL_TEMPLATES: TemplateDefinition[] = [
  fashionStoreTailorV1,
  gymStoreFitnessV1,
];

export function getTemplateBySlug(slug: string): TemplateDefinition | undefined {
  return ALL_TEMPLATES.find((tpl) => tpl.slug === slug);
}

export function getTemplatesByIndustry(industry: IndustryType): TemplateDefinition[] {
  return ALL_TEMPLATES.filter((tpl) => tpl.industry === industry);
}

export function getTemplatesBySubType(subType: string): TemplateDefinition[] {
  return ALL_TEMPLATES.filter(
    (tpl) => tpl.subType.toLowerCase() === subType.toLowerCase()
  );
}

export function getAllActiveTemplateSlugs(): string[] {
  return ALL_TEMPLATES.map((tpl) => tpl.slug);
}
