"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HeroData } from "@/app/lib/content/types";
import { buildWhatsAppUrl } from "@/app/lib/utils/whatsapp";
import { isImageUrl } from "@/app/lib/utils/media";

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  data: HeroData;
  whatsappNumber: string;
  ctaLabel: string;
}

export default function HeroSection({ data, whatsappNumber, ctaLabel }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const whatsappUrl = buildWhatsAppUrl(
    whatsappNumber,
    "Hello, I am inquiring from your website hero section to book a private fitting."
  );

  const rawMediaSrc = data.mediaSrc;
  const mediaSrc = rawMediaSrc && !isImageUrl(rawMediaSrc) ? rawMediaSrc : "/bg-img/video1.mp4";

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

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen min-h-[650px] flex items-center justify-center overflow-hidden bg-[var(--color-primary,#1A1A1A)]"
    >
      <div ref={mediaRef} className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={data.posterSrc}
          className="w-full h-full object-cover opacity-60"
        >
          <source src={mediaSrc} type="video/mp4" />
        </video>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary,#1A1A1A)] via-black/40 to-black/60" />

      <div ref={contentRef} className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
        <span className="text-xs uppercase tracking-[0.3em] text-[var(--color-accent,#C9A96E)] font-semibold mb-4">
          Bespoke Native Atelier
        </span>

        <h1
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-[0.2em] uppercase text-[var(--color-bg,#F5F0EB)] mb-6 drop-shadow-lg"
          style={{ fontFamily: "var(--font-brand)" }}
        >
          {data.headline}
        </h1>

        <p className="text-base sm:text-xl text-[var(--color-bg,#F5F0EB)]/80 font-light max-w-2xl mb-10 tracking-wide leading-relaxed font-heading">
          {data.subheadline}
        </p>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-8 py-4 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase bg-[var(--color-accent,#C9A96E)] text-[var(--color-primary,#1A1A1A)] hover:bg-[var(--color-bg,#F5F0EB)] hover:text-[var(--color-primary,#1A1A1A)] transition-all duration-300 shadow-xl border border-[var(--color-accent,#C9A96E)] cursor-pointer"
        >
          {ctaLabel}
        </a>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center opacity-70 animate-bounce">
        <span className="text-[10px] tracking-widest uppercase text-[var(--color-bg,#F5F0EB)] mb-2 font-mono">Scroll</span>
        <div className="w-0.5 h-6 bg-[var(--color-accent,#C9A96E)]" />
      </div>
    </section>
  );
}
