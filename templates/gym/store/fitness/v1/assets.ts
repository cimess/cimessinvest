/**
 * Gym & Fitness Template v1 (IronCore Athletic Performance) - Scoped Static Assets Manifest.
 * Standardized path: public/templates/gym/store/fitness/v1/
 *
 * NOTE: Currently unpopulated as requested ("for gym we dont have any let it be that way when i add images for that we use it").
 * To add assets in the future:
 * 1. Place videos into public/templates/gym/store/fitness/v1/video/
 * 2. Place images into public/templates/gym/store/fitness/v1/images/
 * 3. Place catalog / discipline media into public/templates/gym/store/fitness/v1/catalog/
 * 4. Update the respective paths below.
 */

const BASE_PATH = "/templates/gym/store/fitness/v1";

export const GYM_V1_ASSETS = {
  basePath: BASE_PATH,
  hero: {
    video: `${BASE_PATH}/video/hero.mp4`,
    poster: `${BASE_PATH}/images/hero-poster.jpg`,
  },
  showcase: {
    trainer: `${BASE_PATH}/images/trainer.jpg`,
    thumbnail: `${BASE_PATH}/images/thumbnail.jpg`,
  },
  catalog: [
    {
      id: "discipline-1",
      title: "Hypertrophy & Strength",
      category: "Powerlifting",
      image: `${BASE_PATH}/catalog/discipline-1.jpg`,
      description: "Periodized compound lifting designed to maximize muscle fiber recruitment and tendon strength.",
      intensity: "High Intensity",
    },
    {
      id: "discipline-2",
      title: "Metabolic Conditioning",
      category: "HIIT / Engine",
      image: `${BASE_PATH}/catalog/discipline-2.jpg`,
      description: "High-output sprint intervals, rowers, air bikes, and functional sled pushes.",
      intensity: "Max VO2 Capacity",
    },
    {
      id: "discipline-3",
      title: "Olympic Barbell Club",
      category: "Weightlifting",
      image: `${BASE_PATH}/catalog/discipline-3.jpg`,
      description: "Precision coaching on Snatch, Clean & Jerk, mobility, and explosive bar acceleration.",
      intensity: "Technical & Explosive",
    },
    {
      id: "discipline-4",
      title: "Athletic Mobility & Rehab",
      category: "Recovery",
      image: `${BASE_PATH}/catalog/discipline-4.jpg`,
      description: "Soft tissue restoration, dynamic hip openers, and injury prevention protocols.",
      intensity: "Restorative",
    },
  ],
  process: [] as Array<{
    stepNumber: string;
    title: string;
    description: string;
    image: string;
  }>,
};

export default GYM_V1_ASSETS;
