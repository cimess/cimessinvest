/**
 * Tailor Template v1 (Atelier Haute Couture) - Scoped Static Assets Manifest.
 * Standardized path: public/templates/fashion/store/tailor/v1/
 */

const BASE_PATH = "/templates/fashion/store/tailor/v1";

export const TAILOR_V1_ASSETS = {
  basePath: BASE_PATH,
  hero: {
    video: `${BASE_PATH}/video/hero.mp4`,
    poster: `${BASE_PATH}/images/hero-poster.jpg`,
  },
  showcase: {
    designer: `${BASE_PATH}/images/designer.jpeg`,
    thumbnail: `${BASE_PATH}/images/thumbnail.jpg`,
  },
  catalog: [
    {
      id: "1",
      title: "Royal Agbada Ensemble",
      category: "Agbada",
      group: "Native",
      placement: "both" as const,
      image: `${BASE_PATH}/catalog/native1.jpeg`,
    },
    {
      id: "2",
      title: "Sculpted Kaftan",
      category: "Kaftan",
      group: "Native",
      placement: "both" as const,
      image: `${BASE_PATH}/catalog/native2.jpeg`,
    },
    {
      id: "3",
      title: "Imperial Senator Suit",
      category: "Senator Suit",
      group: "Native",
      placement: "both" as const,
      image: `${BASE_PATH}/catalog/native3.jpeg`,
    },
    {
      id: "4",
      title: "Hand-Embroidered Buba",
      category: "Buba & Sokoto",
      group: "Native",
      placement: "both" as const,
      image: `${BASE_PATH}/catalog/native7.jpeg`,
    },
    {
      id: "5",
      title: "Grand Aso-Oke Agbada",
      category: "Aso-Oke / Kembe",
      group: "Native",
      placement: "both" as const,
      image: `${BASE_PATH}/catalog/native5.jpeg`,
    },
    {
      id: "6",
      title: "Luxury Tailored Joggers",
      category: "Joggers & Sweats",
      group: "Modern",
      placement: "both" as const,
      image: `${BASE_PATH}/catalog/native12.jpg`,
    },
    {
      id: "7",
      title: "Urban Street Hoodie",
      category: "Hoodies & Sweatshirts",
      group: "Modern",
      placement: "both" as const,
      image: `${BASE_PATH}/catalog/native8.jpg`,
    },
    {
      id: "8",
      title: "Minimalist Graphic Tee",
      category: "T-Shirts & Tops",
      group: "Modern",
      placement: "both" as const,
      image: `${BASE_PATH}/catalog/native9.jpg`,
    },
  ],
  process: [
    {
      stepNumber: "01",
      title: "Fabric Selection",
      description: "Sourcing premium silk, wool, and handloomed Aso-Oke fabrics.",
      image: `${BASE_PATH}/process/raw1.jpg`,
    },
    {
      stepNumber: "02",
      title: "Bespoke Measurement",
      description: "Creating custom architectural patterns fitted specifically to your frame.",
      image: `${BASE_PATH}/process/raw2.jpg`,
    },
    {
      stepNumber: "03",
      title: "Artisanal Stitching",
      description: "Hand-embroidery and precision tailoring by master craftspeople.",
      image: `${BASE_PATH}/process/raw3.jpg`,
    },
    {
      stepNumber: "04",
      title: "Private Fitting",
      description: "Refining every detail until the silhouette reaches absolute perfection.",
      image: `${BASE_PATH}/process/raw4.jpg`,
    },
  ],
};

export default TAILOR_V1_ASSETS;
