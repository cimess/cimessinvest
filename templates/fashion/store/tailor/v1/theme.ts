import { ColorSystemConfig } from "@/templates/types";

export const tailorThemeV1: ColorSystemConfig = {
  primary: "#1A1A1A",
  accent: "#C9A96E",
  background: "#F5F0EB",
  surface: "#FFFFFF",
  textPrimary: "#1A1A1A",
  textSecondary: "#6B5E54",
  gradients: {
    supportsGradient: true,
    defaultGradient: "linear-gradient(135deg, #1A1A1A 0%, #2A2421 100%)",
    presets: [
      {
        id: "royal-onyx",
        name: "Royal Onyx",
        css: "linear-gradient(135deg, #1A1A1A 0%, #2E2620 100%)",
        startColor: "#1A1A1A",
        endColor: "#2E2620",
        angle: 135,
      },
      {
        id: "imperial-gold",
        name: "Imperial Gold",
        css: "linear-gradient(135deg, #2A2421 0%, #C9A96E 100%)",
        startColor: "#2A2421",
        endColor: "#C9A96E",
        angle: 135,
      },
      {
        id: "velvet-dusk",
        name: "Velvet Dusk",
        css: "linear-gradient(180deg, #141414 0%, #1F1B18 100%)",
        startColor: "#141414",
        endColor: "#1F1B18",
        angle: 180,
      },
      {
        id: "warm-cream",
        name: "Artisan Cream",
        css: "linear-gradient(135deg, #F5F0EB 0%, #E8DFD5 100%)",
        startColor: "#F5F0EB",
        endColor: "#E8DFD5",
        angle: 135,
      },
    ],
  },
};
