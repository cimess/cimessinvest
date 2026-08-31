"use client";

import Image from "next/image";
import { DesignerData } from "@/app/lib/content/types";

export default function DesignerStory({ data }: { data: DesignerData }) {
  return (
    <section className="py-24 sm:py-32 bg-[var(--color-primary,#1A1A1A)] text-[var(--color-bg,#F5F0EB)] overflow-hidden">
      <div className="app-max-width app-x-padding">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Image Container */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[3/4] w-full border border-[var(--color-accent,#C9A96E)]/30 p-3 bg-zinc-900">
              <div className="relative w-full h-full overflow-hidden">
                <Image
                  src={data.image}
                  alt={data.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
            </div>
          </div>

          {/* Text Story Content */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--color-accent,#C9A96E)] font-semibold block">
              Atelier Philosophy
            </span>
            <h2 className="text-3xl sm:text-5xl font-heading text-[var(--color-bg,#F5F0EB)] leading-tight">
              {data.title || "The Legacy & Craft"}
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-[var(--color-bg,#F5F0EB)]/80 font-light leading-relaxed">
              {data.bioParagraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-heading font-bold text-[var(--color-accent,#C9A96E)]">
                  {data.name}
                </h4>
                <span className="text-xs text-[var(--color-bg,#F5F0EB)]/60 uppercase tracking-widest block">
                  Master Tailor & Founder
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
