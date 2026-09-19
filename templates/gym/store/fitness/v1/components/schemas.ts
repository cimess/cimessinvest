import { ComponentDefinition } from "@/templates/types";

export const gymComponentSchemas: ComponentDefinition[] = [
  // 1. Hero Section
  {
    type: "HeroSection",
    name: "High-Energy Athletic Hero",
    category: "hero",
    isEditable: true,
    editableFields: [
      {
        name: "headline",
        label: "Headline",
        type: "TEXT",
        default: "FORGE YOUR ULTIMATE PHYSIQUE",
      },
      {
        name: "subheadline",
        label: "Subheadline",
        type: "TEXTAREA",
        default:
          "Elite strength training, conditioning, and high-performance athletic coaching designed to push your limits.",
      },
      {
        name: "ctaLabel",
        label: "Primary CTA Label",
        type: "TEXT",
        default: "Claim Free Day Pass",
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
    ],
    defaultProps: {
      headline: "FORGE YOUR ULTIMATE PHYSIQUE",
      subheadline:
        "Elite strength training, conditioning, and high-performance athletic coaching designed to push your limits.",
      ctaLabel: "Claim Free Day Pass",
      mediaType: "video",
      mediaSrc: "/bg-img/video1.mp4",
      posterSrc: "/bg-img/showcase1.jpg",
    },
  },

  // 2. Gym Ethos / Brand Statement
  {
    type: "BrandStatement",
    name: "Training Ethos & Mission",
    category: "statement",
    isEditable: true,
    editableFields: [
      {
        name: "title",
        label: "Ethos Title",
        type: "TEXT",
        default: "THE IRONCORE STANDARD",
      },
      {
        name: "statement",
        label: "Core Philosophy",
        type: "TEXTAREA",
        default:
          "We do not sell casual workouts. We build discipline, functional power, and peak physical longevity.",
      },
      {
        name: "subtitle",
        label: "Mission Subtitle",
        type: "TEXT",
        default: "World-class biomechanics, Olympic barbells, and science-backed conditioning.",
      },
    ],
    defaultProps: {
      title: "THE IRONCORE STANDARD",
      statement:
        "We do not sell casual workouts. We build discipline, functional power, and peak physical longevity.",
      subtitle: "World-class biomechanics, Olympic barbells, and science-backed conditioning.",
    },
  },

  // 3. Featured Programs & Equipment Grid (Enforcing 2 to 4 column constraints)
  {
    type: "FeaturedGrid",
    name: "Programs & Equipment Showcase",
    category: "catalog",
    isEditable: true,
    gridConfig: {
      supportsGrid: true,
      minColumns: 2,
      maxColumns: 4,
      defaultColumns: 3,
      allowedColumns: [2, 3, 4], // Strict guardrail against UI distortion
    },
    editableFields: [
      {
        name: "headline",
        label: "Grid Headline",
        type: "TEXT",
        default: "High-Performance Training Disciplines",
      },
      {
        name: "description",
        label: "Description",
        type: "TEXTAREA",
        default: "Engineered programs led by certified strength specialists.",
      },
      {
        name: "columns",
        label: "Columns (Desktop)",
        type: "SELECT",
        options: [2, 3, 4],
        default: 3,
        description: "Choose between 2, 3, or 4 columns.",
      },
      {
        name: "ctaLabel",
        label: "Explore Button Label",
        type: "TEXT",
        default: "View All Disciplines",
      },
    ],
    defaultProps: {
      headline: "High-Performance Training Disciplines",
      description: "Engineered programs led by certified strength specialists.",
      columns: 3,
      maxItems: 6,
      ctaLabel: "View All Disciplines",
    },
  },

  // 4. Head Coach / Trainer Bio
  {
    type: "TrainerStory",
    name: "Head Coach & Director Profile",
    category: "story",
    isEditable: true,
    editableFields: [
      {
        name: "name",
        label: "Head Coach Name",
        type: "TEXT",
        default: "Coach Marcus Vance",
      },
      {
        name: "title",
        label: "Credentials / Role",
        type: "TEXT",
        default: "Head of Human Performance & Strength",
      },
      {
        name: "bioText",
        label: "Coach Bio",
        type: "TEXTAREA",
        default:
          "Former Olympic weightlifting coach with over 15 years developing professional athletes and fitness enthusiasts.",
      },
    ],
    defaultProps: {
      name: "Coach Marcus Vance",
      title: "Head of Human Performance & Strength",
      image: "/bg-img/showcase2.jpeg",
      bioParagraphs: [
        "Former Olympic weightlifting coach with over 15 years developing professional athletes and fitness enthusiasts.",
        "Our methodology combines heavy compound lifts, neuromuscular speed training, and personalized nutritional tracking.",
      ],
    },
  },

  // 5. Membership Tier Plans
  {
    type: "MembershipPlans",
    name: "Membership & Tier Pricing",
    category: "catalog",
    isEditable: true,
    gridConfig: {
      supportsGrid: true,
      minColumns: 2,
      maxColumns: 4,
      defaultColumns: 3,
      allowedColumns: [2, 3, 4],
    },
    editableFields: [
      {
        name: "headline",
        label: "Pricing Headline",
        type: "TEXT",
        default: "Membership Access Tiers",
      },
      {
        name: "subheadline",
        label: "Pricing Subtitle",
        type: "TEXT",
        default: "Transparent pricing. Zero hidden contracts. Unlimited access to greatness.",
      },
    ],
    defaultProps: {
      headline: "Membership Access Tiers",
      subheadline: "Transparent pricing. Zero hidden contracts. Unlimited access to greatness.",
    },
  },

  // 6. Athlete Testimonials
  {
    type: "Testimonials",
    name: "Athlete & Member Transformations",
    category: "testimonials",
    isEditable: true,
    editableFields: [
      {
        name: "headline",
        label: "Section Headline",
        type: "TEXT",
        default: "Member Triumphs & Transformations",
      },
    ],
    defaultProps: {
      headline: "Member Triumphs & Transformations",
    },
  },

  // 7. Call To Action Banner
  {
    type: "CtaSection",
    name: "Trial Pass Enrollment Banner",
    category: "cta",
    isEditable: true,
    editableFields: [
      {
        name: "headline",
        label: "Banner Headline",
        type: "TEXT",
        default: "Start Your Transformation Today",
      },
      {
        name: "subheadline",
        label: "Banner Subtitle",
        type: "TEXTAREA",
        default: "Book your complimentary assessment and facility walkthrough with our head coach.",
      },
      {
        name: "buttonLabel",
        label: "Button Label",
        type: "TEXT",
        default: "Claim Day Pass via WhatsApp",
      },
    ],
    defaultProps: {
      headline: "Start Your Transformation Today",
      subheadline: "Book your complimentary assessment and facility walkthrough with our head coach.",
      buttonLabel: "Claim Day Pass via WhatsApp",
    },
  },
];
