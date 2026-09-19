import { TemplatePageDefinition } from "@/templates/types";

export const gymEquipmentsPageV1: TemplatePageDefinition = {
  slug: "equipments",
  title: "Facility & Disciplines",
  isSystem: false,
  version: 1,
  sections: [
    {
      id: "gym_equipments_hero",
      type: "BrandStatement",
      version: 1,
      copy: {
        title: "FACILITY ARSENAL",
        statement:
          "Engineered for serious athletes: calibrated kilo plates, competition racks, and state-of-the-art conditioning turf.",
        subtitle:
          "Every barbell, dumbbell, and machine is chosen to maximize biomechanical output and ensure joint longevity.",
      },
    },
    {
      id: "gym_equipments_grid",
      type: "FeaturedGrid",
      version: 1,
      copy: {
        headline: "Arsenal & Training Stations",
        description: "Explore our specialized weightlifting, powerlifting, and sprint zones.",
        ctaLabel: "Reserve Station",
      },
      layout: {
        columns: 3,
        maxItems: 12,
      },
    },
    {
      id: "gym_equipments_pricing",
      type: "MembershipPlans",
      version: 1,
      copy: {
        headline: "Access Passes & Facility Membership",
        subheadline: "Single sessions, open gym passes, and unlimited monthly tiers.",
      },
    },
    {
      id: "gym_equipments_cta",
      type: "CtaSection",
      version: 1,
      copy: {
        headline: "Experience The Facility In Person",
        subheadline: "Schedule your facility orientation and complimentary trial pass today.",
        buttonLabel: "Schedule Facility Walkthrough",
      },
    },
  ],
};
