import { ColorSystemConfig } from "@/templates/types";

export const gymThemeV1: ColorSystemConfig = {
  primary: "#0A0A0C", // Deep athletic obsidian
  accent: "#CCFF00", // High-energy electric neon lime
  background: "#111114", // Charcoal gym floor dark
  surface: "#18181D", // Elevated card surface
  textPrimary: "#F4F4F5", // High-contrast crisp white
  textSecondary: "#A1A1AA", // Muted athletic grey
  gradients: {
    supportsGradient: true,
    defaultGradient: "linear-gradient(135deg, #0A0A0C 0%, #1A1A22 100%)",
    presets: [
      {
        id: "neon-velocity",
        name: "Neon Velocity",
        css: "linear-gradient(135deg, #CCFF00 0%, #10B981 100%)",
        startColor: "#CCFF00",
        endColor: "#10B981",
        angle: 135,
      },
      {
        id: "iron-forge",
        name: "Iron Forge",
        css: "linear-gradient(180deg, #18181D 0%, #0A0A0C 100%)",
        startColor: "#18181D",
        endColor: "#0A0A0C",
        angle: 180,
      },
      {
        id: "cyber-pulse",
        name: "Cyber Pulse",
        css: "linear-gradient(90deg, #3B82F6 0%, #CCFF00 100%)",
        startColor: "#3B82F6",
        endColor: "#CCFF00",
        angle: 90,
      },
      {
        id: "midnight-titan",
        name: "Midnight Titan",
        css: "linear-gradient(135deg, #09090B 0%, #27272A 100%)",
        startColor: "#09090B",
        endColor: "#27272A",
        angle: 135,
      },
    ],
  },
};
