export const SUPPORTED_FONTS: Record<string, { family: string; category: "serif" | "sans-serif"; googleFontParam: string }> = {
  "Bodoni Moda": { family: "'Bodoni Moda', serif", category: "serif", googleFontParam: "Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900" },
  "Cinzel": { family: "'Cinzel', serif", category: "serif", googleFontParam: "Cinzel:wght@400..900" },
  "Cormorant Garamond": { family: "'Cormorant Garamond', serif", category: "serif", googleFontParam: "Cormorant+Garamond:ital,wght@0,400..700;1,400..700" },
  "Playfair Display": { family: "'Playfair Display', serif", category: "serif", googleFontParam: "Playfair+Display:ital,wght@0,400..900;1,400..900" },
  "Prata": { family: "'Prata', serif", category: "serif", googleFontParam: "Prata" },
  "Jost": { family: "'Jost', sans-serif", category: "sans-serif", googleFontParam: "Jost:ital,wght@0,300..800;1,300..800" },
  "Inter": { family: "'Inter', sans-serif", category: "sans-serif", googleFontParam: "Inter:wght@300..700" },
  "DM Sans": { family: "'DM Sans', sans-serif", category: "sans-serif", googleFontParam: "DM+Sans:ital,wght@0,300..800;1,300..800" },
};

export function getFontFamilyString(fontName: string, fallback: string): string {
  return SUPPORTED_FONTS[fontName]?.family || fallback;
}
