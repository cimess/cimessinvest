"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { StorefrontSlots } from "@/templates/types";
import { tailorThemeV1 } from "./theme";
import HeroSection from "./components/HeroSection";
import BrandStatement from "./components/BrandStatement";
import FeaturedGrid from "./components/FeaturedGrid";
import DesignerStory from "./components/DesignerStory";
import ProcessReel from "./components/ProcessReel";
import Testimonials from "./components/Testimonials";
import CtaSection from "./components/CtaSection";
import { buildWhatsAppUrl } from "@/app/lib/utils/whatsapp";
import BrandLogo from "@/app/components/shared/brandLogo";
import { TAILOR_V1_ASSETS } from "./assets";

export interface TailorStorefrontProps {
  slots?: StorefrontSlots;
}

export default function TailorStorefront({ slots }: TailorStorefrontProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const brandName = slots?.brandName?.trim() || "TI STICHES BESPOKE";
  const whatsappNumber = slots?.whatsappNumber || "0000000";
  const primaryColor = slots?.colors?.primary || tailorThemeV1.primary;
  const accentColor = slots?.colors?.accent || tailorThemeV1.accent;
  const backgroundColor = slots?.colors?.background || tailorThemeV1.background;

  const whatsappUrl = buildWhatsAppUrl(
    whatsappNumber,
    `Hello ${brandName}, I would like to book a private bespoke fitting consultation.`
  );

  // 1. Featured Items Slot Resolution
  // Use merchant-uploaded grid items if provided; otherwise fall back to template's static catalog
  const gridWithCustomUploads = TAILOR_V1_ASSETS.catalog.slice(0, 4).map((defaultItem, idx) => {
    const customImg = slots?.heroGridImages?.[idx];
    if (customImg && customImg.trim() !== "") {
      return {
        ...defaultItem,
        id: `hero-grid-${idx}`,
        image: customImg,
      };
    }
    return defaultItem;
  });

  const customProducts = (slots?.customProducts || []).map((p) => ({
    id: p.id,
    title: p.title,
    category: p.category || "Native",
    group: p.group || "Native",
    image: p.image,
    placement: "both" as const,
  }));

  let displayFeaturedItems = TAILOR_V1_ASSETS.catalog;

  if (slots?.removeAllDefaults) {
    displayFeaturedItems = customProducts.length > 0 ? customProducts : gridWithCustomUploads;
  } else if (slots?.appendDefaults) {
    displayFeaturedItems = [...customProducts, ...gridWithCustomUploads, ...TAILOR_V1_ASSETS.catalog.slice(4)];
  } else if (customProducts.length > 0 || slots?.heroGridImages?.some((img) => img && img.trim() !== "")) {
    displayFeaturedItems = customProducts.length > 0 ? [...customProducts, ...gridWithCustomUploads] : gridWithCustomUploads;
  }

  // 2. Process Steps Slot Resolution
  const displayProcessSteps = TAILOR_V1_ASSETS.process.map((step, idx) => {
    const customImg = slots?.rawMaterialImages?.[idx];
    return customImg && customImg.trim() !== "" ? { ...step, image: customImg } : step;
  });

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-300"
      style={
        {
          backgroundColor,
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

      {/* ------------------------------------------------------------- */}
      {/* 1. SELF-CONTAINED TAILOR ATELIER NAVBAR                        */}
      {/* ------------------------------------------------------------- */}
      <header
        data-lenis-prevent
        className="fixed top-0 left-0 right-0 z-50 pointer-events-auto bg-[var(--color-bg,#F5F0EB)]/95 backdrop-blur-md border-b border-[#E0D5C9]/40"
      >
        <nav className="app-max-width app-x-padding h-20 flex items-center justify-between relative">
          {/* Touch Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden relative z-50 p-4 -ml-2 text-[var(--color-primary,#1A1A1A)] hover:text-[var(--color-accent,#C9A96E)] focus:outline-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>

          {/* Brand Logo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none md:static md:justify-start md:flex-initial">
            <div className="pointer-events-auto">
              <BrandLogo name={brandName} />
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-10 text-sm tracking-widest uppercase font-medium text-[var(--color-primary,#1A1A1A)] relative z-10">
            <Link href={slots?.homeUrl || "/"} className="hover:text-[var(--color-accent,#C9A96E)] transition-colors">
              Home
            </Link>
            <Link href={slots?.storeUrl || "/store"} className="hover:text-[var(--color-accent,#C9A96E)] transition-colors">
              Store
            </Link>
            <Link href="/login" className="hover:text-[var(--color-accent,#C9A96E)] transition-colors">
              Sign In
            </Link>
          </div>

          {/* Desktop WhatsApp Fitting CTA */}
          <div className="hidden md:flex items-center space-x-4 relative z-10">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 text-xs tracking-widest uppercase bg-[var(--color-primary,#1A1A1A)] text-[var(--color-bg,#F5F0EB)] hover:bg-[var(--color-accent,#C9A96E)] hover:text-[var(--color-primary,#1A1A1A)] transition-colors duration-300 font-semibold"
            >
              Book Fitting
            </a>
          </div>
        </nav>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[var(--color-bg,#F5F0EB)] border-b border-[#E0D5C9] px-6 py-8 space-y-5">
            <Link
              href={slots?.homeUrl || "/"}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base tracking-widest uppercase font-medium text-[var(--color-primary,#1A1A1A)]"
            >
              Home
            </Link>
            <Link
              href={slots?.storeUrl || "/store"}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base tracking-widest uppercase font-medium text-[var(--color-primary,#1A1A1A)]"
            >
              Store
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base tracking-widest uppercase font-medium text-[var(--color-primary,#1A1A1A)]"
            >
              Sign In
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center py-3 text-xs tracking-widest uppercase bg-[var(--color-primary,#1A1A1A)] text-[var(--color-bg,#F5F0EB)] font-semibold"
            >
              Book Fitting on WhatsApp
            </a>
          </div>
        )}
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. STOREFRONT SECTIONS (SLOTTED WITH MERCHANT OVERRIDES)        */}
      {/* ------------------------------------------------------------- */}

      {/* Section 1: Hero */}
      <HeroSection
        id="tailor-hero"
        copy={{
          headline: brandName.toUpperCase(),
          subheadline: "Heritage Native Wear & Bespoke Tailoring",
          ctaLabel: "Book Your Fitting",
        }}
        media={{
          mediaType: "video",
          mediaSrc: slots?.heroVideoUrl || TAILOR_V1_ASSETS.hero.video,
          posterSrc: TAILOR_V1_ASSETS.hero.poster,
        }}
        context={{
          brandName,
          whatsappNumber,
        }}
      />

      {/* Section 2: Statement */}
      <BrandStatement
        id="tailor-statement"
        copy={{
          title: "The Atelier Vision",
          statement: "Where African heritage architecture meets the precision of modern haute couture.",
          subtitle: "Every stitch tells a story of identity, luxury, and timeless craftsmanship.",
        }}
      />

      {/* Section 3: Featured Grid (Slotted Columns & Media) */}
      <FeaturedGrid
        id="tailor-grid"
        copy={{
          headline: "Signature Collections",
          description: "Every garment represents hundreds of hours of precision tailoring, hand embroidery, and luxury fabric selection.",
          ctaLabel: "View Full Archive",
        }}
        layout={{
          columns: slots?.gridColumns || 3,
          maxItems: 8,
        }}
        dataBinding={{
          items: displayFeaturedItems,
        }}
        context={{
          whatsappNumber,
        }}
      />

      {/* Section 4: Designer Story */}
      <DesignerStory
        id="tailor-story"
        copy={{
          name: brandName,
          title: "The Legacy & Craft",
          bioParagraphs: slots?.bioText ? [slots.bioText] : undefined,
        }}
        media={{
          image: slots?.bioImage || TAILOR_V1_ASSETS.showcase.designer,
        }}
      />

      {/* Section 5: Process Reel */}
      <ProcessReel
        id="tailor-process"
        copy={{
          headline: "The Bespoke Atelier Process",
          subtitle: "From raw loomed fabric to sovereign ceremonial attire.",
        }}
        dataBinding={{
          steps: displayProcessSteps,
        }}
      />

      {/* Section 6: Testimonials */}
      <Testimonials
        id="tailor-testimonials"
        copy={{
          headline: "Patronage & Acclaim",
        }}
      />

      {/* Section 7: Final CTA */}
      <CtaSection
        id="tailor-cta"
        copy={{
          headline: "Commission Your Bespoke Piece",
          subheadline: "Connect directly with our master artisan to schedule your private fitting consultation.",
          buttonLabel: "Start WhatsApp Consultation",
        }}
        context={{
          whatsappNumber,
        }}
      />

      {/* ------------------------------------------------------------- */}
      {/* 3. SELF-CONTAINED TAILOR ATELIER FOOTER                       */}
      {/* ------------------------------------------------------------- */}
      <footer className="bg-[#1A1A1A] text-[#F5F0EB] border-t border-[#C9A96E]/20 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b border-white/10">
            {/* Column 1: Brand & Atelier Vision */}
            <div className="lg:col-span-5 space-y-6">
              <BrandLogo name={brandName} className="text-[#F5F0EB]" />
              <p className="text-xs sm:text-sm text-[#E0D5C9] font-light leading-relaxed max-w-sm">
                Crafting architectural West African native wear and haute couture garments for royal ceremonial occasions, galas, and milestone moments.
              </p>
              <div className="pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 text-xs font-bold tracking-[0.2em] uppercase bg-[#C9A96E] text-[#1A1A1A] hover:bg-[#F5F0EB] transition-colors duration-300"
                >
                  Inquire via WhatsApp
                </a>
              </div>
            </div>

            {/* Column 2: Collections */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-xs uppercase tracking-[0.3em] text-[#C9A96E] font-semibold">
                Collections
              </h4>
              <ul className="space-y-3 text-xs tracking-wider uppercase text-[#E0D5C9]">
                <li>
                  <Link href="/collections" className="hover:text-[#C9A96E] transition-colors">
                    Agbada Heritage
                  </Link>
                </li>
                <li>
                  <Link href="/collections" className="hover:text-[#C9A96E] transition-colors">
                    Sculpted Kaftan
                  </Link>
                </li>
                <li>
                  <Link href="/collections" className="hover:text-[#C9A96E] transition-colors">
                    Executive Senator
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact & Atelier */}
            <div className="lg:col-span-4 space-y-4">
              <h4 className="text-xs uppercase tracking-[0.3em] text-[#C9A96E] font-semibold">
                Atelier Studio
              </h4>
              <p className="text-xs text-[#E0D5C9] font-light leading-relaxed">
                By Private Appointment Only. Available globally for bespoke consultations and traveling artisan fittings.
              </p>
              <p className="text-xs text-[#C9A96E] font-medium pt-2">
                WhatsApp: {whatsappNumber}
              </p>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#E0D5C9]/60 font-light gap-4">
            <p>&copy; {new Date().getFullYear()} {brandName}. All rights reserved.</p>
            <p className="tracking-widest uppercase text-[10px]">
              Powered by cimessinvest
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
