"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface BrandStatementProps {
  id?: string;
  copy?: {
    title?: string;
    statement?: string;
    subtitle?: string;
  };
}

export default function BrandStatement({ copy }: BrandStatementProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  const title = copy?.title || "The Atelier Vision";
  const statement =
    copy?.statement || "Where African heritage architecture meets the precision of modern haute couture.";
  const subtitle =
    copy?.subtitle || "Every stitch tells a story of identity, luxury, and timeless craftsmanship.";

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (textRef.current) {
        gsap.fromTo(
          textRef.current,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-24 sm:py-32 bg-[var(--color-bg,#F5F0EB)] text-[var(--color-primary,#1A1A1A)] border-b border-[#E0D5C9]/40"
    >
      <div className="app-max-width app-x-padding text-center max-w-4xl mx-auto">
        {title && (
          <span className="text-xs uppercase tracking-[0.3em] text-[var(--color-accent,#C9A96E)] font-semibold block mb-6">
            {title}
          </span>
        )}
        <h2
          ref={textRef}
          className="text-2xl sm:text-4xl md:text-5xl font-heading leading-tight text-[var(--color-primary,#1A1A1A)] mb-8 font-normal"
        >
          {`"${statement}"`}
        </h2>
        {subtitle && (
          <p className="text-sm sm:text-base text-[var(--color-primary,#1A1A1A)]/70 font-body tracking-wider uppercase">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
