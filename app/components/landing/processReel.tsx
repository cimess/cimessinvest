"use client";

import Image from "next/image";
import { ProcessStep } from "@/app/lib/content/types";

export default function ProcessReel({ steps }: { steps: ProcessStep[] }) {
  return (
    <section className="py-24 sm:py-32 bg-[var(--color-primary,#1A1A1A)] text-[var(--color-bg,#F5F0EB)] border-t border-zinc-800">
      <div className="app-max-width app-x-padding">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs uppercase tracking-[0.3em] text-[var(--color-accent,#C9A96E)] font-semibold block">
            Craftsmanship Workflow
          </span>
          <h2 className="text-3xl sm:text-5xl font-heading text-[var(--color-bg,#F5F0EB)]">
            The Bespoke Journey
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-bg,#F5F0EB)]/70 font-light leading-relaxed">
            From initial sketch and fabric selection to final fitting, witness the meticulous process behind every garment.
          </p>
        </div>

        {/* 3 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-zinc-900 border border-zinc-800 p-6 flex flex-col space-y-4 rounded-none">
              <div className="relative aspect-[4/3] w-full overflow-hidden border border-zinc-800">
                <Image src={step.image} alt={step.title} fill className="object-cover" />
              </div>
              <span className="text-xs font-mono font-bold text-[var(--color-accent,#C9A96E)]">
                STEP 0{idx + 1}
              </span>
              <h3 className="text-xl font-heading font-semibold text-[var(--color-bg,#F5F0EB)]">
                {step.title}
              </h3>
              <p className="text-xs text-[var(--color-bg,#F5F0EB)]/70 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
