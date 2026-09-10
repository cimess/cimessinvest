export interface FontConfig {
  brandFont: string;    // Default: "Bodoni Moda"
  headingFont: string;  // Default: "Cormorant Garamond"
  bodyFont: string;     // Default: "Jost"
}

export interface ColorConfig {
  primary: string;         // Default: "#1A1A1A" (rich black)
  accent: string;          // Default: "#C9A96E" (muted gold)
  background: string;      // Default: "#F5F0EB" (warm cream)
  surface: string;         // Default: "#FFFFFF"
  textPrimary: string;     // Default: "#1A1A1A"
  textSecondary: string;   // Default: "#6B5E54"
}

export interface SiteConfig {
  brandName: string;         // Default: "cimessinvest"
  whatsappNumber: string;    // Default: "0000000"
  whatsappMessage: string;   // Default: "Hello, I'd like to book a fitting"
  ctaLabel: string;          // Default: "Book Your Fitting"
  fonts: FontConfig;
  colors: ColorConfig;
}

export interface SectionContent<T> {
  mode: "replace" | "add" | "hidden";
  data: T;
}

// Hero Section
export interface HeroData {
  mediaType: "video" | "image";
  mediaSrc: string;
  posterSrc?: string;
  headline?: string;
  subheadline?: string;
}

// Brand Statement Section
export interface StatementData {
  title?: string;
  statement: string;
  subtitle?: string;
}

// Designer Bio Section
export interface DesignerData {
  name: string;
  title: string;
  image: string;
  bioParagraphs: string[];
}

// Featured Bento Grid Item
export interface FeaturedItem {
  id: string;
  title: string;
  category: string;
  group?: string;
  placement?: string;
  image: string;
}

// Atelier Process Step
export interface ProcessStep {
  stepNumber: string;
  title: string;
  description: string;
  image: string;
}

// Testimonials / Press Item
export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role?: string;
}

// Collection Data Model
export interface Collection {
  slug: string;
  name: string;
  category: string;
  description: string;
  coverImage: string;
  images: string[];
}
