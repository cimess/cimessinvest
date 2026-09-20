"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { buildWhatsAppUrl } from "@/app/lib/utils/whatsapp";
import { isImageUrl } from "@/app/lib/utils/media";
import { TAILOR_V1_ASSETS } from "../assets";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface HeroSectionProps {
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
  styleTokens?: {
    themeMode?: "DARK" | "LIGHT";
    height?: "FULL_VIEWPORT" | "MEDIUM";
  };
  context?: {
    brandName?: string;
    whatsappNumber?: string;
  };
}

export default function HeroSection({ copy, media, context }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const headline = copy?.headline || context?.brandName || "TI STICHES BESPOKE";
  const subheadline = copy?.subheadline || "Heritage Native Wear & Bespoke Tailoring";
  const ctaLabel = copy?.ctaLabel || "Book a Fitting";
  
  // Strictly enforce video format. If an image is provided, fall back to default template video
  const rawMediaSrc = media?.mediaSrc;
  const mediaSrc =
    rawMediaSrc && !isImageUrl(rawMediaSrc)
      ? rawMediaSrc
      : TAILOR_V1_ASSETS.hero.video;
  const posterSrc = media?.posterSrc || TAILOR_V1_ASSETS.hero.poster;
  const whatsappNumber = context?.whatsappNumber || "0000000";

  const whatsappUrl = buildWhatsAppUrl(
    whatsappNumber,
    `Hello, I am inquiring from the ${headline} hero section to book a private fitting.`
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Initial Load Entrance Animation
      gsap.fromTo(
        contentRef.current?.children || [],
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.2, ease: "power3.out" }
      );

      // 2. Parallax Media Zoom on Scroll
      if (mediaRef.current) {
        gsap.to(mediaRef.current, {
          scale: 1.15,
          opacity: 0.4,
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

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, [mediaSrc]);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen min-h-[650px] flex items-center justify-center overflow-hidden bg-[var(--color-primary,#1A1A1A)]"
    >
      <div ref={mediaRef} className="absolute inset-0 w-full h-full">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          poster={posterSrc}
          className="w-full h-full object-cover opacity-60"
        >
          <source src={mediaSrc} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary,#1A1A1A)] via-transparent to-[var(--color-primary,#1A1A1A)]/50" />
      </div>

      {/* Content Overlay */}
      <div
        ref={contentRef}
        className="relative z-10 app-max-width app-x-padding text-center flex flex-col items-center max-w-4xl mx-auto"
      >
        <span className="text-xs uppercase tracking-[0.3em] text-[var(--color-accent,#C9A96E)] font-semibold mb-4 drop-shadow">
          Haute Couture & Heritage
        </span>
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading text-[#F5F0EB] mb-6 leading-tight drop-shadow-md">
          {headline}
        </h1>
        <p className="text-base sm:text-xl text-[#E0D5C9] font-light max-w-2xl mb-10 leading-relaxed font-body">
          {subheadline}
        </p>
        <div className="flex flex-col sm:flex-row gap-5 items-center">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 text-xs font-semibold tracking-[0.2em] uppercase bg-[var(--color-accent,#C9A96E)] text-[#1A1A1A] hover:bg-[#F5F0EB] hover:text-[#1A1A1A] transition-all duration-300 shadow-xl border border-[var(--color-accent,#C9A96E)] cursor-pointer"
          >
            {ctaLabel}
          </a>
          <a
            href="#featured"
            className="px-8 py-4 text-xs font-semibold tracking-[0.2em] uppercase bg-transparent text-[#F5F0EB] hover:bg-white/10 transition-all duration-300 border border-[#E0D5C9]/40 cursor-pointer"
          >
            Explore Lookbook
          </a>
        </div>
      </div>
    </section>
  );
}
