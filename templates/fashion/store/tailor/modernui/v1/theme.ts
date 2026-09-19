import { ColorSystemConfig } from "../../../../../types";

export const tailorModernUiThemeV1: ColorSystemConfig = {
  primary: "#111114", // Pitch graphite
  accent: "#E2D9D0", // Muted linen champagne
  background: "#18181D", // Dark contemporary studio
  surface: "#222228", // Elevated slate surface
  textPrimary: "#FAF8F5", // Crisp ecru
  textSecondary: "#A19E98", // Editorial muted grey
  gradients: {
    supportsGradient: true,
    defaultGradient: "linear-gradient(135deg, #111114 0%, #282830 100%)",
    presets: [
      {
        id: "modern-linen",
        name: "Linen & Graphite",
        css: "linear-gradient(135deg, #111114 0%, #2A2A34 100%)",
        startColor: "#111114",
        endColor: "#2A2A34",
        angle: 135,
      },
      {
        id: "sandstone-editorial",
        name: "Sandstone Editorial",
        css: "linear-gradient(135deg, #24242A 0%, #E2D9D0 100%)",
        startColor: "#24242A",
        endColor: "#E2D9D0",
        angle: 135,
      },
      {
        id: "midnight-slate",
        name: "Midnight Slate",
        css: "linear-gradient(180deg, #0A0A0D 0%, #1A1A22 100%)",
        startColor: "#0A0A0D",
        endColor: "#1A1A22",
        angle: 180,
      },
    ],
  },
};

export default tailorModernUiThemeV1;
