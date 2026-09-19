"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { buildWhatsAppUrl } from "@/app/lib/utils/whatsapp";
import { isImageUrl } from "@/app/lib/utils/media";
import { GYM_V1_ASSETS } from "../assets";
import { Zap } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface GymHeroSectionProps {
  id?: string;
  copy?: {
    headline?: string;
    subheadline?: string;
    ctaLabel?: string;
  };
  media?: {
    mediaType?: "video";
    mediaSrc?: string;
    posterSrc?: string;
  };
  context?: {
    brandName?: string;
    whatsappNumber?: string;
  };
}

export default function GymHeroSection({ copy, media, context }: GymHeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const headline = copy?.headline || "FORGE YOUR ULTIMATE PHYSIQUE";
  const subheadline =
    copy?.subheadline ||
    "Elite strength training, functional conditioning, and high-performance athletic coaching designed to push your physical limits.";
  const ctaLabel = copy?.ctaLabel || "Claim Free Day Pass";
  
  // Strictly enforce video format. If an image is provided, fall back to master gym hero video
  const rawMediaSrc = media?.mediaSrc;
  const mediaSrc =
    rawMediaSrc && !isImageUrl(rawMediaSrc)
      ? rawMediaSrc
      : GYM_V1_ASSETS.hero.video || "/bg-img/video1.mp4";
  const posterSrc = media?.posterSrc || "/templates/gym/store/fitness/v1/images/hero-poster.jpg";
  const whatsappNumber = context?.whatsappNumber || "2348000000000";

  const whatsappUrl = buildWhatsAppUrl(
    whatsappNumber,
    `Hello, I would like to claim my free day pass and schedule an introductory training session at your facility.`
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current?.children || [],
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power3.out" }
      );

      if (mediaRef.current) {
        gsap.to(mediaRef.current, {
          scale: 1.15,
          opacity: 0.35,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen min-h-[650px] flex items-center justify-center overflow-hidden bg-[#0A0A0C] text-[#F4F4F5]"
    >
      {/* Background Media - Strictly Video */}
      <div ref={mediaRef} className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={posterSrc}
          className="w-full h-full object-cover opacity-50 filter brightness-90"
        >
          <source src={mediaSrc} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-transparent to-[#0A0A0C]/70" />
      </div>

      {/* Hero Content Overlay */}
      <div
        ref={contentRef}
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-accent,#CCFF00)]/15 border border-[var(--color-accent,#CCFF00)]/40 text-[var(--color-accent,#CCFF00)] text-xs font-bold uppercase tracking-[0.25em] mb-6">
          <Zap className="w-3.5 h-3.5" />
          <span>High Performance Training Facility</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#F4F4F5] uppercase mb-6 leading-tight max-w-4xl">
          {headline}
        </h1>

        <p className="text-sm sm:text-lg text-zinc-300 font-light max-w-2xl mb-10 leading-relaxed">
          {subheadline}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 text-xs font-bold tracking-widest uppercase bg-[var(--color-accent,#CCFF00)] text-[#0A0A0C] hover:bg-white hover:text-black transition-all duration-300 shadow-xl rounded font-sans"
          >
            {ctaLabel}
          </a>
          <a
            href="#programs"
            className="px-8 py-4 text-xs font-bold tracking-widest uppercase bg-transparent text-[#F4F4F5] hover:bg-white/10 transition-all duration-300 border border-zinc-700 rounded"
          >
            Explore Disciplines
          </a>
        </div>
      </div>
    </section>
  );
}
