import { prisma } from "@/app/lib/prisma/prisma";
import Navbar from "@/app/components/layout/navbar";
import HeroSection from "@/app/components/landing/heroSection";
import BrandStatement from "@/app/components/landing/brandStatement";
import FeaturedGrid from "@/app/components/landing/featuredGrid";
import DesignerStory from "@/app/components/landing/designerStory";
import ProcessReel from "@/app/components/landing/processReel";
import Testimonials from "@/app/components/landing/testimonials";
import CtaSection from "@/app/components/landing/ctaSection";
import Footer from "@/app/components/layout/footer";
import { Lock } from "lucide-react";

import {
  DEFAULT_SITE_CONFIG,
  DEFAULT_HERO_DATA,
  DEFAULT_STATEMENT_DATA,
  DEFAULT_DESIGNER_DATA,
  DEFAULT_FEATURED_ITEMS,
  DEFAULT_PROCESS_STEPS,
  DEFAULT_TESTIMONIALS,
} from "@/app/lib/content/defaults";

export const revalidate = 0;

export default async function Home() {
  // 1. Fetch site setting & owner user status
  const siteSetting = await prisma.siteSetting.findFirst().catch(() => null);
  const userOwner = await prisma.user.findFirst().catch(() => null);

  // 2. Access Control: If subscription is INACTIVE, lock public page
  if (userOwner && userOwner.subscription_status === "INACTIVE") {
    return (
      <main className="min-h-screen bg-[#1A1A1A] text-[#F5F0EB] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-[#242424] border border-[#C9A96E]/30 rounded-xl p-8 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/40 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-[#C9A96E]" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#C9A96E] font-semibold block mb-2">
              SHOWCASE OFFLINE
            </span>
            <h1 className="text-3xl font-heading font-bold text-[#F5F0EB]">Page Not Available</h1>
          </div>
          <p className="text-sm text-[#E0D5C9]/80 font-light leading-relaxed">
            This storefront is currently inactive. If you are the store manager, please log into your dashboard to activate or renew your subscription.
          </p>
          <div className="pt-2 flex flex-col gap-3">
            <a
              href="mailto:support@cimessinvest.com"
              className="w-full py-3 bg-[#C9A96E] text-[#1A1A1A] font-bold text-xs tracking-widest uppercase rounded hover:bg-[#F5F0EB] transition-colors inline-block"
            >
              Contact Admin
            </a>
            <a
              href="/login"
              className="w-full py-3 bg-white/5 border border-white/10 text-[#F5F0EB] font-semibold text-xs tracking-wider uppercase rounded hover:border-[#C9A96E] transition-colors inline-block"
            >
              Manager Dashboard Login
            </a>
          </div>
        </div>
      </main>
    );
  }

  const collectionsFromDb = await prisma.image
    .findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    })
    .catch(() => []);

  // 3. Theme colors & Site details
  const primaryColor = siteSetting?.primaryColor || "#1A1A1A";
  const accentColor = siteSetting?.accentColor || "#C9A96E";
  const backgroundColor = siteSetting?.backgroundColor || "#F5F0EB";
  const whatsappNumber = siteSetting?.whatsappNumber || DEFAULT_SITE_CONFIG.whatsappNumber;
  const brandName = siteSetting?.companyName || DEFAULT_SITE_CONFIG.brandName;

  // 4. Dynamic Hero Video / Image
  const heroData = {
    ...DEFAULT_HERO_DATA,
    headline: siteSetting?.companyName ? `${siteSetting.companyName.toUpperCase()}` : DEFAULT_HERO_DATA.headline,
    mediaSrc: siteSetting?.heroVideoUrl || DEFAULT_HERO_DATA.mediaSrc,
    mediaType: siteSetting?.heroVideoUrl ? ("video" as const) : DEFAULT_HERO_DATA.mediaType,
  };

  // 5. Featured items (Hero Grid + Catalog Items)
  const gridWithDefaults = DEFAULT_FEATURED_ITEMS.slice(0, 4).map((defaultItem, idx) => {
    const customImg = siteSetting?.heroGridImages?.[idx];
    if (customImg && customImg.trim() !== "") {
      return {
        ...defaultItem,
        id: `hero-grid-${idx}`,
        image: customImg,
      };
    }
    return defaultItem;
  });

  const dbFormatted = collectionsFromDb.map((item) => ({
    id: item.id,
    title: item.title || "Custom Native Wear",
    category: item.category,
    image: item.url,
  }));

  let featuredItems: typeof DEFAULT_FEATURED_ITEMS = [];

  if (siteSetting?.removeAllDefaults || siteSetting?.showDefaultImages === false) {
    featuredItems = dbFormatted.length > 0 ? dbFormatted : gridWithDefaults;
  } else if (siteSetting?.appendDefaults) {
    featuredItems = [...gridWithDefaults, ...dbFormatted, ...DEFAULT_FEATURED_ITEMS.slice(4)];
  } else {
    featuredItems = dbFormatted.length > 0 ? [...gridWithDefaults, ...dbFormatted] : gridWithDefaults;
  }

  // 6. Designer Story (Tailor Bio)
  const designerData = {
    ...DEFAULT_DESIGNER_DATA,
    name: brandName,
    image: siteSetting?.tailorBioImage || DEFAULT_DESIGNER_DATA.image,
    bioParagraphs: siteSetting?.tailorBioText
      ? [siteSetting.tailorBioText]
      : DEFAULT_DESIGNER_DATA.bioParagraphs,
  };

  // 7. Raw Material Images
  const processSteps = DEFAULT_PROCESS_STEPS.map((step, idx) => {
    const rawImg = siteSetting?.rawMaterialImages?.[idx];
    return rawImg && rawImg.trim() !== "" ? { ...step, image: rawImg } : step;
  });

  return (
    <main
      className="min-h-screen flex flex-col transition-colors duration-300"
      style={
        {
          backgroundColor: backgroundColor,
          color: primaryColor,
          "--color-primary": primaryColor,
          "--color-accent": accentColor,
          "--color-bg": backgroundColor,
        } as React.CSSProperties
      }
    >
      <style>{`
        :root {
          --color-primary: ${primaryColor} !important;
          --color-accent: ${accentColor} !important;
          --color-bg: ${backgroundColor} !important;
        }
      `}</style>

      {/* 1. Header / Navbar */}
      <Navbar
        brandName={brandName}
        whatsappNumber={whatsappNumber}
        ctaLabel={DEFAULT_SITE_CONFIG.ctaLabel}
      />

      {/* 2. Hero Section */}
      <HeroSection
        data={heroData}
        whatsappNumber={whatsappNumber}
        ctaLabel={DEFAULT_SITE_CONFIG.ctaLabel}
      />

      {/* 3. Atelier Brand Statement */}
      <BrandStatement data={DEFAULT_STATEMENT_DATA} />

      {/* 4. Featured Collections Grid */}
      <FeaturedGrid
        items={featuredItems}
        whatsappNumber={whatsappNumber}
      />

      {/* 5. Designer Story */}
      <DesignerStory data={designerData} />

      {/* 6. Bespoke Creation Process Reel */}
      <ProcessReel steps={processSteps} />

      {/* 7. Client Testimonials */}
      <Testimonials items={DEFAULT_TESTIMONIALS} />

      {/* 8. Call to Action Banner */}
      <CtaSection
        brandName={brandName}
        whatsappNumber={whatsappNumber}
        ctaLabel={DEFAULT_SITE_CONFIG.ctaLabel}
      />

      {/* 9. Footer */}
      <Footer />
    </main>
  );
}
