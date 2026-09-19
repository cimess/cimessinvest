import { TemplatePageDefinition } from "@/templates/types";

export const tailorCollectionsPageV1: TemplatePageDefinition = {
  slug: "collections",
  title: "Collections & Lookbook",
  isSystem: false,
  version: 1,
  sections: [
    {
      id: "tailor_collections_hero",
      type: "BrandStatement",
      version: 1,
      copy: {
        title: "The Atelier Lookbook",
        statement: "Masterpiece ensembles engineered for presence, ceremony, and legacy.",
        subtitle: "Explore our archive of traditional Agbada, sculpted kaftans, and imperial senator suits.",
      },
    },
    {
      id: "tailor_collections_catalog",
      type: "CollectionCatalog",
      version: 1,
      copy: {
        headline: "The Curated Lookbook & Garment Archive",
        subheadline:
          "Explore handcrafted ceremonial attire, bespoke native wear, and modern silhouettes engineered for nobility.",
        emptyText: "No bespoke pieces found in this category.",
      },
      layout: {
        columns: 3, // Guardrail: 2, 3, or 4 columns
        itemsPerPage: 24,
      },
      dataBinding: {
        source: "PRODUCTS",
        filterCategory: "all",
      },
    },
    {
      id: "tailor_collections_cta",
      type: "CtaSection",
      version: 1,
      copy: {
        headline: "Request A Bespoke Commission",
        subheadline: "Every garment can be customized with personalized embroidery and measurement fitting.",
        buttonLabel: "Consult with Artisan",
      },
    },
  ],
};
