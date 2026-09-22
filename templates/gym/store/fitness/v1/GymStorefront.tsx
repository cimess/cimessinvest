"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, Dumbbell } from "lucide-react";
import { StorefrontSlots } from "@/templates/types";
import { gymThemeV1 } from "./theme";
import HeroSection from "./components/HeroSection";
import BrandStatement from "./components/BrandStatement";
import FeaturedGrid from "./components/FeaturedGrid";
import TrainerStory from "./components/TrainerStory";
import MembershipPlans from "./components/MembershipPlans";
import Testimonials from "./components/Testimonials";
import CtaSection from "./components/CtaSection";
import { buildWhatsAppUrl } from "@/app/lib/utils/whatsapp";
import { GYM_V1_ASSETS } from "./assets";

export interface GymStorefrontProps {
  slots?: StorefrontSlots;
}

export default function GymStorefront({ slots }: GymStorefrontProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const brandName = slots?.brandName?.trim() || "IRONCORE ATHLETIC";
  const whatsappNumber = slots?.whatsappNumber || "0000000";
  const primaryColor = slots?.colors?.primary || gymThemeV1.primary;
  const accentColor = slots?.colors?.accent || gymThemeV1.accent;
  const backgroundColor = slots?.colors?.background || gymThemeV1.background;

  const whatsappUrl = buildWhatsAppUrl(
    whatsappNumber,
    `Hello ${brandName}, I would like to claim my complimentary day pass and fitness assessment.`
  );

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
      {/* 1. SELF-CONTAINED GYM & FITNESS NAVBAR                         */}
      {/* ------------------------------------------------------------- */}
      <header
        data-lenis-prevent
        className="fixed top-0 left-0 right-0 z-50 pointer-events-auto bg-[#0C0D10]/95 backdrop-blur-md border-b border-zinc-800"
      >
        <nav className="app-max-width app-x-padding h-20 flex items-center justify-between relative">
          {/* Touch Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden relative z-50 p-4 -ml-2 text-white hover:text-[#E63946] focus:outline-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>

          {/* Gym Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-zinc-700 bg-zinc-900 flex items-center justify-center shrink-0 shadow-lg">
              <img
                src={slots?.bioImage || "/bg-img/native10.jpg"}
                alt={brandName}
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/bg-img/native10.jpg";
                }}
              />
            </div>
            <span className="font-heading font-black text-xl tracking-wider text-white uppercase">
              {brandName}
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-10 text-sm tracking-widest uppercase font-bold text-zinc-300 relative z-10">
            <a href="#featured" className="hover:text-[#E63946] transition-colors">
              Disciplines
            </a>
            <a href="#membership" className="hover:text-[#E63946] transition-colors">
              Memberships
            </a>
            <Link href="/login" className="hover:text-[#E63946] transition-colors">
              Member Portal
            </Link>
          </div>

          {/* Desktop WhatsApp Free Pass CTA */}
          <div className="hidden md:flex items-center space-x-4 relative z-10">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 text-xs tracking-widest uppercase bg-[#E63946] text-white hover:bg-white hover:text-black transition-colors duration-300 font-extrabold rounded-lg shadow-lg shadow-[#E63946]/20"
            >
              Claim Free Pass
            </a>
          </div>
        </nav>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0C0D10] border-b border-zinc-800 px-6 py-8 space-y-5">
            <a
              href="#featured"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base tracking-widest uppercase font-bold text-white"
            >
              Disciplines
            </a>
            <a
              href="#membership"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base tracking-widest uppercase font-bold text-white"
            >
              Memberships
            </a>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base tracking-widest uppercase font-bold text-white"
            >
              Member Portal
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center py-3 text-xs tracking-widest uppercase bg-[#E63946] text-white font-bold rounded-lg"
            >
              Claim Free Pass on WhatsApp
            </a>
          </div>
        )}
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. GYM STOREFRONT SECTIONS (SLOTTED WITH MERCHANT OVERRIDES)   */}
      {/* ------------------------------------------------------------- */}

      {/* Hero Section */}
      <HeroSection
        id="gym-hero"
        copy={{
          headline: `FORGE WITH ${brandName.toUpperCase()}`,
          subheadline:
            "Elite strength training, functional conditioning, and high-performance athletic coaching designed to push your physical limits.",
          ctaLabel: "Claim Free Day Pass",
        }}
        media={{
          mediaType: "video",
          mediaSrc: slots?.heroVideoUrl || GYM_V1_ASSETS.hero.video,
          posterSrc: GYM_V1_ASSETS.hero.poster,
        }}
        context={{
          brandName,
          whatsappNumber,
        }}
      />

      {/* Brand Statement */}
      <BrandStatement
        id="gym-statement"
        copy={{
          title: "THE IRONCORE STANDARD",
          statement:
            "We do not sell casual workouts. We build discipline, functional power, and peak physical longevity.",
          subtitle: "World-class biomechanics, Olympic barbells, and science-backed conditioning.",
        }}
      />

      {/* Disciplines / Equipment Grid (Slotted Columns) */}
      <FeaturedGrid
        id="gym-grid"
        copy={{
          headline: "High-Performance Training Disciplines",
          description: "Engineered programs led by certified strength specialists.",
          ctaLabel: "View All Disciplines",
        }}
        layout={{
          columns: slots?.gridColumns || 3,
          maxItems: 6,
        }}
        context={{
          brandName,
          whatsappNumber,
        }}
        storeSlug={slots?.storeUrl}
      />

      {/* Trainer Story */}
      <TrainerStory
        id="gym-trainer"
        copy={{
          name: slots?.brandName ? `Head Coach (${slots.brandName})` : "Coach Marcus Vance",
          title: "Head of Human Performance & Strength",
          bioParagraphs: slots?.bioText ? [slots.bioText] : undefined,
        }}
        media={{
          image: slots?.bioImage || GYM_V1_ASSETS.showcase.trainer,
        }}
      />

      {/* Membership Plans */}
      <MembershipPlans
        id="gym-membership"
        copy={{
          headline: "Membership Access Tiers",
          subheadline: "Transparent pricing. Zero hidden contracts. Unlimited access to greatness.",
        }}
        context={{
          whatsappNumber,
        }}
      />

      {/* Member Testimonials */}
      <Testimonials
        id="gym-testimonials"
        copy={{
          headline: "Member Triumphs & Transformations",
        }}
      />

      {/* Final Call to Action */}
      <CtaSection
        id="gym-cta"
        copy={{
          headline: "Start Your Transformation Today",
          subheadline:
            "Book your complimentary physical assessment and private facility walkthrough with our head coach.",
          buttonLabel: "Claim Free Pass on WhatsApp",
        }}
        context={{
          whatsappNumber,
        }}
      />

      {/* ------------------------------------------------------------- */}
      {/* 3. SELF-CONTAINED GYM ATHLETIC FOOTER                          */}
      {/* ------------------------------------------------------------- */}
      <footer className="bg-[#0C0D10] text-[#F3F4F6] border-t border-zinc-800 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b border-zinc-800">
            {/* Column 1: Brand & Philosophy */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#E63946] flex items-center justify-center text-white">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <span className="font-heading font-black text-xl tracking-wider text-white uppercase">
                  {brandName}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed max-w-sm">
                Engineered physical evolution, Olympic weightlifting platforms, functional conditioning, and elite human performance.
              </p>
              <div className="pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 text-xs font-bold tracking-[0.2em] uppercase bg-[#E63946] text-white hover:bg-white hover:text-black transition-colors duration-300 rounded-lg"
                >
                  Claim Free Pass via WhatsApp
                </a>
              </div>
            </div>

            {/* Column 2: Disciplines */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-xs uppercase tracking-[0.3em] text-[#E63946] font-bold">
                Disciplines
              </h4>
              <ul className="space-y-3 text-xs tracking-wider uppercase text-zinc-400">
                <li>Hypertrophy & Strength</li>
                <li>Metabolic Conditioning</li>
                <li>Olympic Barbell Club</li>
                <li>Athletic Mobility & Rehab</li>
              </ul>
            </div>

            {/* Column 3: Facility Hours */}
            <div className="lg:col-span-4 space-y-4">
              <h4 className="text-xs uppercase tracking-[0.3em] text-[#E63946] font-bold">
                Facility Access
              </h4>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                Monday – Friday: 05:00 – 22:00<br />
                Saturday – Sunday: 07:00 – 20:00<br />
                VIP 24/7 Keycard Access Available
              </p>
              <p className="text-xs text-[#E63946] font-bold pt-2">
                WhatsApp Desk: {whatsappNumber}
              </p>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 font-light gap-4">
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
