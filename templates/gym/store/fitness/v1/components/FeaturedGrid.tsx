"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, MessageCircle, Activity, Dumbbell, Flame } from "lucide-react";
import { buildWhatsAppUrl } from "@/app/lib/utils/whatsapp";

export interface GymFeaturedGridProps {
  id?: string;
  copy?: {
    headline?: string;
    description?: string;
    ctaLabel?: string;
  };
  layout?: {
    columns?: number; // 2, 3, or 4
    maxItems?: number;
  };
  dataBinding?: {
    items?: Array<{
      id: string;
      title: string;
      category?: string | null;
      image: string;
      description?: string;
      intensity?: string;
    }>;
  };
  context?: {
    brandName?: string;
    whatsappNumber?: string;
  };
  storeSlug?: string;
}

const DEFAULT_GYM_DISCIPLINES = [
  {
    id: "discipline-1",
    title: "Hypertrophy & Strength",
    category: "Powerlifting",
    image: "/bg-img/showcase1.jpg",
    description: "Periodized compound lifting designed to maximize muscle fiber recruitment and tendon strength.",
    intensity: "High Intensity",
  },
  {
    id: "discipline-2",
    title: "Metabolic Conditioning",
    category: "HIIT / Engine",
    image: "/bg-img/showcase2.jpeg",
    description: "High-output sprint intervals, rowers, air bikes, and functional sled pushes.",
    intensity: "Max VO2 Capacity",
  },
  {
    id: "discipline-3",
    title: "Olympic Barbell Club",
    category: "Weightlifting",
    image: "/bg-img/native1.jpeg",
    description: "Precision coaching on Snatch, Clean & Jerk, mobility, and explosive bar acceleration.",
    intensity: "Technical & Explosive",
  },
  {
    id: "discipline-4",
    title: "Athletic Mobility & Rehab",
    category: "Recovery",
    image: "/bg-img/native2.jpeg",
    description: "Soft tissue restoration, dynamic hip openers, and injury prevention protocols.",
    intensity: "Restorative",
  },
];

export default function GymFeaturedGrid({
  id,
  copy,
  layout,
  dataBinding,
  context,
  storeSlug,
}: GymFeaturedGridProps) {
  const headline = copy?.headline || "High-Performance Training Disciplines";
  const description =
    copy?.description ||
    "Engineered programs led by certified strength specialists to transform your power, speed, and endurance.";
  const ctaLabel = copy?.ctaLabel || "View Full Schedule";
  const whatsappNumber = context?.whatsappNumber || "2348000000000";

  // Strict Grid Guardrails: Clamped between 2 and 4 columns max
  const rawColumns = layout?.columns ?? 3;
  const clampedColumns = Math.max(2, Math.min(4, Number(rawColumns) || 3));

  const gridClass =
    clampedColumns === 2
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2"
      : clampedColumns === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  const items =
    dataBinding?.items && dataBinding.items.length > 0
      ? dataBinding.items
      : DEFAULT_GYM_DISCIPLINES;

  return (
    <section id={id || "programs"} className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0D0D10] text-[#F4F4F5]">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800 pb-8">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--color-accent,#CCFF00)] font-bold">
              Core Disciplines
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white uppercase">
              {headline}
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 font-light leading-relaxed">
              {description}
            </p>
          </div>

          <a
            href="#membership"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-accent,#CCFF00)] hover:text-white transition-colors"
          >
            <span>{ctaLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Dynamic Responsive Grid (Strictly 2, 3, or 4 columns) */}
        <div className={`grid gap-8 ${gridClass}`}>
          {items.map((item) => {
            const whatsappUrl = buildWhatsAppUrl(
              whatsappNumber,
              `Hello, I would like to inquire about joining the "${item.title}" training program.`
            );

            return (
              <div
                key={item.id}
                className="group relative flex flex-col bg-[#16161B] rounded-xl overflow-hidden border border-zinc-800/80 hover:border-[var(--color-accent,#CCFF00)]/60 transition-all duration-500 shadow-xl"
              >
                {/* Image Container */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                  <Image
                    src={item.image || "/bg-img/showcase1.jpg"}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#16161B] via-transparent to-transparent" />

                  {/* Category Pill */}
                  {item.category && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold bg-black/80 text-[var(--color-accent,#CCFF00)] border border-[var(--color-accent,#CCFF00)]/30 rounded">
                      {item.category}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col justify-between flex-1 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-[var(--color-accent,#CCFF00)] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-zinc-400 font-light leading-relaxed">
                      {item.description || "Structured programming tailored to progressive physical development."}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-zinc-400 inline-flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-[var(--color-accent,#CCFF00)]" />
                      {item.intensity || "High Intensity"}
                    </span>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-[var(--color-accent,#CCFF00)]/15 hover:bg-[var(--color-accent,#CCFF00)] text-[var(--color-accent,#CCFF00)] hover:text-black rounded transition-all"
                      title="Inquire via WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
