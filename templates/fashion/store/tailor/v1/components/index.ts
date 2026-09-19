import React from "react";
import HeroSection from "./HeroSection";
import BrandStatement from "./BrandStatement";
import FeaturedGrid from "./FeaturedGrid";
import DesignerStory from "./DesignerStory";
import ProcessReel from "./ProcessReel";
import Testimonials from "./Testimonials";
import CtaSection from "./CtaSection";
import CollectionCatalog from "./CollectionCatalog";
import { tailorComponentSchemas } from "./schemas";

export {
  HeroSection,
  BrandStatement,
  FeaturedGrid,
  DesignerStory,
  ProcessReel,
  Testimonials,
  CtaSection,
  CollectionCatalog,
  tailorComponentSchemas,
};

/**
 * React Component Map for Fashion Store Tailor V1.
 * Resolves block type strings (e.g. "FeaturedGrid") to live React components.
 */
export const tailorComponentMap: Record<string, React.ComponentType<any>> = {
  HeroSection,
  BrandStatement,
  FeaturedGrid,
  DesignerStory,
  ProcessReel,
  Testimonials,
  CtaSection,
  CollectionCatalog,
};

export default tailorComponentMap;

