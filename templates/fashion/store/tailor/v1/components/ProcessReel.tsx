"use client";

import Image from "next/image";
import { TAILOR_V1_ASSETS } from "../assets";

export interface ProcessReelProps {
  id?: string;
  copy?: {
    headline?: string;
    subtitle?: string;
  };
  dataBinding?: {
    steps?: Array<{
      stepNumber: string;
      title: string;
      description: string;
      image: string;
    }>;
  };
}

export default function ProcessReel({ copy, dataBinding }: ProcessReelProps) {
  const headline = copy?.headline || "The Bespoke Atelier Process";
  const subtitle = copy?.subtitle || "From raw loomed fabric to sovereign ceremonial attire.";
  const steps = (dataBinding?.steps && dataBinding.steps.length > 0)
    ? dataBinding.steps
    : TAILOR_V1_ASSETS.process;

  return (
    <section className="py-24 sm:py-32 bg-[var(--color-bg,#F5F0EB)] text-[var(--color-primary,#1A1A1A)] border-t border-[#E0D5C9]/40">
      <div className="app-max-width app-x-padding">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs uppercase tracking-[0.3em] text-[var(--color-accent,#C9A96E)] font-semibold block mb-3">
            Sovereign Craftsmanship
          </span>
          <h2 className="text-3xl sm:text-5xl font-heading text-[var(--color-primary,#1A1A1A)] mb-4">
            {headline}
          </h2>
          <p className="text-sm sm:text-base text-[var(--color-primary,#1A1A1A)]/70 font-light leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div
              key={step.stepNumber}
              className="flex flex-col bg-white border border-[#E0D5C9]/60 p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100 mb-6">
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
                <span className="absolute top-3 left-3 bg-[#1A1A1A] text-[var(--color-accent,#C9A96E)] text-xs font-bold px-2.5 py-1">
                  {step.stepNumber}
                </span>
              </div>
              <h3 className="font-heading text-xl text-[var(--color-primary,#1A1A1A)] mb-2">
                {step.title}
              </h3>
              <p className="text-xs text-[var(--color-primary,#1A1A1A)]/70 leading-relaxed font-light">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
