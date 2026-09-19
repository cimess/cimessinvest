import React from "react";
import HeroSection from "./HeroSection";
import BrandStatement from "./BrandStatement";
import FeaturedGrid from "./FeaturedGrid";
import TrainerStory from "./TrainerStory";
import MembershipPlans from "./MembershipPlans";
import Testimonials from "./Testimonials";
import CtaSection from "./CtaSection";
import { gymComponentSchemas } from "./schemas";

export {
  HeroSection,
  BrandStatement,
  FeaturedGrid,
  TrainerStory,
  MembershipPlans,
  Testimonials,
  CtaSection,
  gymComponentSchemas,
};

/**
 * Live React component dictionary for Gym Store Fitness V1.
 */
export const gymComponentMap: Record<string, React.ComponentType<any>> = {
  HeroSection,
  BrandStatement,
  FeaturedGrid,
  TrainerStory,
  MembershipPlans,
  Testimonials,
  CtaSection,
};

export default gymComponentMap;
