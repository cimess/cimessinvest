import { 
  SiteConfig, 
  HeroData, 
  StatementData, 
  DesignerData, 
  FeaturedItem, 
  ProcessStep, 
  TestimonialItem, 
  Collection 
} from "./types";

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  brandName: process.env.NEXT_PUBLIC_BRAND_NAME || "cimessinvest",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "0000000",
  whatsappMessage: "Hello, I would like to inquire about booking a private fitting for your native collection.",
  ctaLabel: "Book Your Fitting",
  fonts: {
    brandFont: "Bodoni Moda",
    headingFont: "Cormorant Garamond",
    bodyFont: "Jost"
  },
  colors: {
    primary: "#1A1A1A",
    accent: "#C9A96E",
    background: "#F5F0EB",
    surface: "#FFFFFF",
    textPrimary: "#1A1A1A",
    textSecondary: "#6B5E54"
  }
};

export const DEFAULT_HERO_DATA: HeroData = {
  mediaType: "video",
  mediaSrc: "/bg-img/video1.mp4",
  posterSrc: "/bg-img/showcase1.jpg",
  headline: DEFAULT_SITE_CONFIG.brandName,
  subheadline: "Heritage Native Wear & Bespoke Tailoring"
};

export const DEFAULT_STATEMENT_DATA: StatementData = {
  title: "The Atelier Vision",
  statement: "Where African heritage architecture meets the precision of modern haute couture.",
  subtitle: "Every stitch tells a story of identity, luxury, and timeless craftsmanship."
};

export const DEFAULT_DESIGNER_DATA: DesignerData = {
  name: "Master Artisan",
  title: "Creative Director",
  image: "/bg-img/showcase2.jpeg",
  bioParagraphs: [
    "Born out of a reverence for traditional West African textiles and modern architectural silhouettes, our atelier creates bespoke garments that command presence.",
    "Each piece is handcrafted over hundreds of hours using hand-woven fabrics, intricate embroidery, and tailored precision designed for royalty."
  ]
};

export const DEFAULT_FEATURED_ITEMS: FeaturedItem[] = [
  { id: "1", title: "Royal Agbada Ensemble", category: "Agbada", group: "Native", placement: "both", image: "/bg-img/native1.jpeg" },
  { id: "2", title: "Sculpted Kaftan", category: "Kaftan", group: "Native", placement: "both", image: "/bg-img/native2.jpeg" },
  { id: "3", title: "Imperial Senator Suit", category: "Senator Suit", group: "Native", placement: "both", image: "/bg-img/native3.jpeg" },
  { id: "4", title: "Hand-Embroidered Buba", category: "Buba & Sokoto", group: "Native", placement: "both", image: "/bg-img/native7.jpeg" },
  { id: "5", title: "Grand Aso-Oke Agbada", category: "Aso-Oke / Kembe", group: "Native", placement: "both", image: "/bg-img/native5.jpeg" },
  { id: "6", title: "Luxury Tailored Joggers", category: "Joggers & Sweats", group: "Modern", placement: "both", image: "/bg-img/native12.jpg" },
  { id: "7", title: "Urban Street Hoodie", category: "Hoodies & Sweatshirts", group: "Modern", placement: "both", image: "/bg-img/native8.jpg" },
  { id: "8", title: "Minimalist Graphic Tee", category: "T-Shirts & Tops", group: "Modern", placement: "both", image: "/bg-img/native9.jpg" }
];

export const DEFAULT_PROCESS_STEPS: ProcessStep[] = [
  { stepNumber: "01", title: "Fabric Selection", description: "Sourcing premium silk, wool, and handloomed Aso-Oke fabrics.", image: "/bg-img/raw1.jpg" },
  { stepNumber: "02", title: "Bespoke Measurement", description: "Creating custom architectural patterns fitted specifically to your frame.", image: "/bg-img/raw2.jpg" },
  { stepNumber: "03", title: "Artisanal Stitching", description: "Hand-embroidery and precision tailoring by master craftspeople.", image: "/bg-img/raw3.jpg" },
  { stepNumber: "04", title: "Private Fitting", description: "Refining every detail until the silhouette reaches absolute perfection.", image: "/bg-img/raw4.jpg" }
];

export const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  { id: "1", quote: "The attention to detail and fit is unmatched. It feels like wearing artwork.", author: "Oluwaseun A.", role: "Private Collector" },
  { id: "2", quote: "Wore my ceremonial Agbada for my wedding. The presence it gave me was unforgettable.", author: "Emeka O.", role: "Groom" },
  { id: "3", quote: "Bespoke tailoring at its absolute peak. Modern yet rooted in tradition.", author: "Dr. K. Mensah", role: "Executive" }
];

export const DEFAULT_COLLECTIONS: Collection[] = [
  {
    slug: "agbada-heritage",
    name: "Agbada Heritage",
    category: "Ceremonial",
    description: "Grand multi-piece traditional gowns designed for significant milestone events.",
    coverImage: "/bg-img/native1.jpeg",
    images: ["/bg-img/native1.jpeg", "/bg-img/native5.jpeg", "/bg-img/native8.jpg", "/bg-img/native12.jpg"]
  },
  {
    slug: "modern-kaftan",
    name: "Modern Kaftan",
    category: "Signature",
    description: "Clean lines and draped luxury for contemporary formal gatherings.",
    coverImage: "/bg-img/native2.jpeg",
    images: ["/bg-img/native2.jpeg", "/bg-img/native6.jpeg", "/bg-img/native9.jpg", "/bg-img/native13.jpg"]
  },
  {
    slug: "executive-senator",
    name: "Executive Senator",
    category: "Tailored",
    description: "Crisp, structured two-piece ensembles built for boardrooms and galas.",
    coverImage: "/bg-img/native3.jpeg",
    images: ["/bg-img/native3.jpeg", "/bg-img/native7.jpeg", "/bg-img/native1.jpeg", "/bg-img/native8.jpg"]
  }
];
