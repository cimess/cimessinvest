import { TemplatePageDefinition } from "@/templates/types";
import { TAILOR_V1_ASSETS } from "../assets";

export const tailorHomePageV1: TemplatePageDefinition = {
  slug: "home",
  title: "Home",
  isSystem: true,
  version: 1,
  sections: [
    {
      id: "tailor_home_hero",
      type: "HeroSection",
      version: 1,
      copy: {
        headline: "TI STICHES BESPOKE",
        subheadline: "Heritage Native Wear & Bespoke Tailoring",
      },
      media: {
        mediaType: "video",
        mediaSrc: TAILOR_V1_ASSETS.hero.video,
        posterSrc: TAILOR_V1_ASSETS.hero.poster,
      },
      styleTokens: {
        themeMode: "DARK",
        height: "FULL_VIEWPORT",
      },
    },
    {
      id: "tailor_home_statement",
      type: "BrandStatement",
      version: 1,
      copy: {
        title: "The Atelier Vision",
        statement: "Where African heritage architecture meets the precision of modern haute couture.",
        subtitle: "Every stitch tells a story of identity, luxury, and timeless craftsmanship.",
      },
    },
    {
      id: "tailor_home_featured",
      type: "FeaturedGrid",
      version: 1,
      copy: {
        headline: "Signature Collections",
        ctaLabel: "View Full Archive",
      },
      layout: {
        columns: 3, // Default 3 columns, editable to 2 or 4
        maxItems: 8,
      },
      dataBinding: {
        source: "PRODUCTS",
        filterCategory: "all",
      },
    },
    {
      id: "tailor_home_story",
      type: "DesignerStory",
      version: 1,
      copy: {
        name: "Master Artisan",
        title: "Creative Director",
        bioParagraphs: [
          "Born out of a reverence for traditional West African textiles and modern architectural silhouettes, our atelier creates bespoke garments that command presence.",
          "Each piece is handcrafted over hundreds of hours using hand-woven fabrics, intricate embroidery, and tailored precision designed for royalty.",
        ],
      },
      media: {
        image: TAILOR_V1_ASSETS.showcase.designer,
      },
    },
    {
      id: "tailor_home_process",
      type: "ProcessReel",
      version: 1,
      copy: {
        headline: "The Bespoke Atelier Process",
        subtitle: "From raw loomed fabric to sovereign ceremonial attire.",
      },
      dataBinding: {
        steps: TAILOR_V1_ASSETS.process,
      },
    },
    {
      id: "tailor_home_testimonials",
      type: "Testimonials",
      version: 1,
      copy: {
        headline: "Patronage & Acclaim",
      },
      dataBinding: {
        items: [
          {
            id: "1",
            quote: "The attention to detail and fit is unmatched. It feels like wearing artwork.",
            author: "Oluwaseun A.",
            role: "Private Collector",
          },
          {
            id: "2",
            quote: "Wore my ceremonial Agbada for my wedding. The presence it gave me was unforgettable.",
            author: "Emeka O.",
            role: "Groom",
          },
          {
            id: "3",
            quote: "Bespoke tailoring at its absolute peak. Modern yet rooted in tradition.",
            author: "Dr. K. Mensah",
            role: "Executive",
          },
        ],
      },
    },
    {
      id: "tailor_home_cta",
      type: "CtaSection",
      version: 1,
      copy: {
        headline: "Commission Your Sovereign Silhouette",
        subheadline:
          "Private appointments are held at our atelier or via virtual measurement consultation. Reserve your bespoke fitting today.",
        buttonLabel: "Book Your Fitting",
        whatsappMessage: "Hello, I would like to inquire about booking a private fitting for your bespoke native collection.",
      },
    },
  ],
};
