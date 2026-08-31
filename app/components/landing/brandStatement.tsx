"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { StatementData } from "@/app/lib/content/types";

gsap.registerPlugin(ScrollTrigger);

export default function BrandStatement({ data }: { data: StatementData }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-24 sm:py-32 bg-[var(--color-bg,#F5F0EB)] text-[var(--color-primary,#1A1A1A)] border-b border-[#E0D5C9]/40"
    >
      <div className="app-max-width app-x-padding text-center max-w-4xl mx-auto">
        {data.title && (
          <span className="text-xs uppercase tracking-[0.3em] text-[var(--color-accent,#C9A96E)] font-semibold block mb-6">
            {data.title}
          </span>
        )}
        <h2
          ref={textRef}
          className="text-2xl sm:text-4xl md:text-5xl font-heading leading-tight text-[var(--color-primary,#1A1A1A)] mb-8 font-normal"
        >
          {`"${data.statement}"`}
        </h2>
        {data.subtitle && (
          <p className="text-sm sm:text-base text-[var(--color-primary,#1A1A1A)]/70 font-body tracking-wider uppercase">
            {data.subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
