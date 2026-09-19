import { ComponentDefinition } from "@/templates/types";

export const tailorComponentSchemas: ComponentDefinition[] = [
  // 1. Cinematic Hero Section
  {
    type: "HeroSection",
    name: "Cinematic Hero Banner",
    category: "hero",
    isEditable: true,
    editableFields: [
      {
        name: "headline",
        label: "Main Headline",
        type: "TEXT",
        default: "TI STICHES BESPOKE",
      },
      {
        name: "subheadline",
        label: "Subheadline / Brand Tagline",
        type: "TEXT",
        default: "Heritage Native Wear & Bespoke Tailoring",
      },
      {
        name: "mediaType",
        label: "Background Media Type",
        type: "SELECT",
        options: ["video"],
        default: "video",
      },
      {
        name: "mediaSrc",
        label: "Media URL",
        type: "MEDIA_VIDEO",
        default: "/bg-img/video1.mp4",
      },
      {
        name: "posterSrc",
        label: "Video Poster / Fallback Image",
        type: "MEDIA_IMAGE",
        default: "/bg-img/showcase1.jpg",
      },
    ],
    defaultProps: {
      headline: "TI STICHES BESPOKE",
      subheadline: "Heritage Native Wear & Bespoke Tailoring",
      mediaType: "video",
      mediaSrc: "/bg-img/video1.mp4",
      posterSrc: "/bg-img/showcase1.jpg",
    },
  },

  // 2. Brand Statement
  {
    type: "BrandStatement",
    name: "Atelier Vision Statement",
    category: "statement",
    isEditable: true,
    editableFields: [
      {
        name: "title",
        label: "Eyebrow Badge",
        type: "TEXT",
        default: "The Atelier Vision",
      },
      {
        name: "statement",
        label: "High-Impact Statement",
        type: "TEXTAREA",
        default: "Where African heritage architecture meets the precision of modern haute couture.",
      },
      {
        name: "subtitle",
        label: "Secondary Paragraph",
        type: "TEXTAREA",
        default: "Every stitch tells a story of identity, luxury, and timeless craftsmanship.",
      },
    ],
    defaultProps: {
      title: "The Atelier Vision",
      statement: "Where African heritage architecture meets the precision of modern haute couture.",
      subtitle: "Every stitch tells a story of identity, luxury, and timeless craftsmanship.",
    },
  },

  // 3. Featured Grid (With strict layout guardrails)
  {
    type: "FeaturedGrid",
    name: "Curated Garment Grid",
    category: "catalog",
    isEditable: true,
    gridConfig: {
      supportsGrid: true,
      minColumns: 2,
      maxColumns: 4,
      defaultColumns: 3,
      allowedColumns: [2, 3, 4], // Enforces 2, 3, or 4 columns max so UI is never distorted
    },
    editableFields: [
      {
        name: "headline",
        label: "Section Title",
        type: "TEXT",
        default: "Signature Collections",
      },
      {
        name: "columns",
        label: "Desktop Grid Columns (2, 3, or 4)",
        type: "SELECT",
        options: [2, 3, 4],
        default: 3,
        description: "Choose 2, 3, or 4 columns. Mobile screens adapt automatically.",
      },
      {
        name: "maxItems",
        label: "Max Display Count",
        type: "NUMBER",
        min: 4,
        max: 16,
        default: 8,
      },
      {
        name: "ctaLabel",
        label: "Archive Button Label",
        type: "TEXT",
        default: "View Full Archive",
      },
    ],
    defaultProps: {
      headline: "Signature Collections",
      columns: 3,
      maxItems: 8,
      ctaLabel: "View Full Archive",
    },
  },

  // 4. Designer Story
  {
    type: "DesignerStory",
    name: "Artisan Heritage Story",
    category: "story",
    isEditable: true,
    editableFields: [
      {
        name: "name",
        label: "Artisan / Designer Name",
        type: "TEXT",
        default: "Master Artisan",
      },
      {
        name: "title",
        label: "Role / Credential",
        type: "TEXT",
        default: "Creative Director",
      },
      {
        name: "image",
        label: "Portrait Image",
        type: "MEDIA_IMAGE",
        default: "/bg-img/showcase2.jpeg",
      },
      {
        name: "bioText",
        label: "Origin Biography",
        type: "TEXTAREA",
        default:
          "Born out of a reverence for traditional West African textiles and modern architectural silhouettes, our atelier creates bespoke garments that command presence.",
      },
    ],
    defaultProps: {
      name: "Master Artisan",
      title: "Creative Director",
      image: "/bg-img/showcase2.jpeg",
      bioText:
        "Born out of a reverence for traditional West African textiles and modern architectural silhouettes, our atelier creates bespoke garments that command presence.",
    },
  },

  // 5. Process Reel
  {
    type: "ProcessReel",
    name: "Behind The Scenes Craftsmanship",
    category: "process",
    isEditable: true,
    editableFields: [
      {
        name: "headline",
        label: "Section Title",
        type: "TEXT",
        default: "The Bespoke Atelier Process",
      },
      {
        name: "subtitle",
        label: "Subtitle",
        type: "TEXT",
        default: "From raw loomed fabric to sovereign ceremonial attire.",
      },
    ],
    defaultProps: {
      headline: "The Bespoke Atelier Process",
      subtitle: "From raw loomed fabric to sovereign ceremonial attire.",
    },
  },

  // 6. Testimonials
  {
    type: "Testimonials",
    name: "Client Endorsements & Press",
    category: "testimonials",
    isEditable: true,
    editableFields: [
      {
        name: "headline",
        label: "Section Title",
        type: "TEXT",
        default: "Patronage & Acclaim",
      },
    ],
    defaultProps: {
      headline: "Patronage & Acclaim",
    },
  },

  // 7. WhatsApp / Fitting CTA
  {
    type: "CtaSection",
    name: "Private Fitting Concierge",
    category: "cta",
    isEditable: true,
    editableFields: [
      {
        name: "headline",
        label: "Invitation Headline",
        type: "TEXT",
        default: "Commission Your Sovereign Silhouette",
      },
      {
        name: "subheadline",
        label: "Description",
        type: "TEXTAREA",
        default:
          "Private appointments are held at our atelier or via virtual measurement consultation. Reserve your bespoke fitting today.",
      },
      {
        name: "buttonLabel",
        label: "CTA Button Text",
        type: "TEXT",
        default: "Book Your Fitting",
      },
    ],
    defaultProps: {
      headline: "Commission Your Sovereign Silhouette",
      subheadline:
        "Private appointments are held at our atelier or via virtual measurement consultation. Reserve your bespoke fitting today.",
      buttonLabel: "Book Your Fitting",
    },
  },

  // 8. Collection Lookbook Catalog
  {
    type: "CollectionCatalog",
    name: "Interactive Lookbook & Garment Archive",
    category: "catalog",
    isEditable: true,
    gridConfig: {
      supportsGrid: true,
      minColumns: 2,
      maxColumns: 4,
      defaultColumns: 3,
      allowedColumns: [2, 3, 4], // Enforces layout integrity
    },
    editableFields: [
      {
        name: "headline",
        label: "Archive Title",
        type: "TEXT",
        default: "The Curated Lookbook & Garment Archive",
      },
      {
        name: "subheadline",
        label: "Archive Description",
        type: "TEXTAREA",
        default:
          "Explore handcrafted ceremonial attire, bespoke native wear, and modern silhouettes engineered for nobility.",
      },
      {
        name: "columns",
        label: "Grid Columns (Desktop)",
        type: "SELECT",
        options: [2, 3, 4],
        default: 3,
        description: "Choose between 2, 3, or 4 columns for your lookbook archive.",
      },
      {
        name: "emptyText",
        label: "No Items Message",
        type: "TEXT",
        default: "No bespoke pieces found in this category.",
      },
    ],
    defaultProps: {
      headline: "The Curated Lookbook & Garment Archive",
      subheadline:
        "Explore handcrafted ceremonial attire, bespoke native wear, and modern silhouettes engineered for nobility.",
      columns: 3,
      emptyText: "No bespoke pieces found in this category.",
    },
  },
];

