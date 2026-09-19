import { TemplatePageDefinition } from "@/templates/types";

export const gymHomePageV1: TemplatePageDefinition = {
  slug: "home",
  title: "Home",
  isSystem: true,
  version: 1,
  sections: [
    {
      id: "gym_home_hero",
      type: "HeroSection",
      version: 1,
      copy: {
        headline: "FORGE YOUR ULTIMATE PHYSIQUE",
        subheadline:
          "Elite strength training, functional conditioning, and high-performance athletic coaching designed to push your physical limits.",
        ctaLabel: "Claim Free Day Pass",
      },
      media: {
        mediaType: "video",
        mediaSrc: "/bg-img/video1.mp4",
        posterSrc: "/bg-img/showcase1.jpg",
      },
      styleTokens: {
        themeMode: "DARK",
        height: "FULL_VIEWPORT",
      },
    },
    {
      id: "gym_home_statement",
      type: "BrandStatement",
      version: 1,
      copy: {
        title: "THE IRONCORE STANDARD",
        statement:
          "We do not sell casual workouts. We build discipline, functional power, and peak physical longevity.",
        subtitle:
          "World-class biomechanics, Olympic barbells, and science-backed conditioning.",
      },
    },
    {
      id: "gym_home_featured",
      type: "FeaturedGrid",
      version: 1,
      copy: {
        headline: "High-Performance Training Disciplines",
        description: "Engineered programs led by certified strength specialists.",
        ctaLabel: "View All Disciplines",
      },
      layout: {
        columns: 3, // Guardrail: 2, 3, or 4
        maxItems: 6,
      },
    },
    {
      id: "gym_home_story",
      type: "TrainerStory",
      version: 1,
      copy: {
        name: "Coach Marcus Vance",
        title: "Head of Human Performance & Strength",
        bioParagraphs: [
          "Former Olympic weightlifting coach with over 15 years developing professional athletes, competitive lifters, and dedicated fitness enthusiasts.",
          "Our methodology combines heavy compound lifts, neuromuscular speed training, and personalized nutritional tracking to guarantee tangible physical evolution.",
        ],
      },
      media: {
        image: "/bg-img/showcase2.jpeg",
      },
    },
    {
      id: "gym_home_pricing",
      type: "MembershipPlans",
      version: 1,
      copy: {
        headline: "Membership Access Tiers",
        subheadline: "Transparent pricing. Zero hidden contracts. Unlimited access to greatness.",
      },
    },
    {
      id: "gym_home_testimonials",
      type: "Testimonials",
      version: 1,
      copy: {
        headline: "Member Triumphs & Transformations",
      },
    },
    {
      id: "gym_home_cta",
      type: "CtaSection",
      version: 1,
      copy: {
        headline: "Start Your Transformation Today",
        subheadline:
          "Book your complimentary physical assessment and private facility walkthrough with our head coach.",
        buttonLabel: "Claim Free Pass on WhatsApp",
      },
    },
  ],
};
