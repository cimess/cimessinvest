"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/app/lib/utils/whatsapp";
import { resolveGroupForCategory } from "@/app/lib/content/categories";
import { TAILOR_V1_ASSETS } from "../assets";

export interface FeaturedGridProps {
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
      group?: string;
      image: string;
    }>;
  };
  context?: {
    whatsappNumber?: string;
    companySlug?: string;
  };
  storeSlug?: string;
}

export default function FeaturedGrid({ copy, layout, dataBinding, context, storeSlug }: FeaturedGridProps) {
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const headline = copy?.headline || "Signature Collections";
  const description =
    copy?.description ||
    "Every garment represents hundreds of hours of precision tailoring, hand embroidery, and luxury fabric selection.";
  const ctaLabel = copy?.ctaLabel || "View All";
  const whatsappNumber = context?.whatsappNumber || "0000000";

  // Strict Grid Guardrails: Clamped between 2 and 4 columns max
  const rawColumns = layout?.columns ?? 3;
  const clampedColumns = Math.max(2, Math.min(4, Number(rawColumns) || 3));

  const gridClass =
    clampedColumns === 2
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2"
      : clampedColumns === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"; // default 3

  const items = (dataBinding?.items && dataBinding.items.length > 0)
    ? dataBinding.items
    : TAILOR_V1_ASSETS.catalog;

  const maxItems = Math.max(4, Math.min(16, layout?.maxItems || 8));
  const displayItems = items.slice(0, maxItems);

  const handleInquire = (item: any) => {
    const storeLink = typeof window !== 'undefined' ? window.location.href : '';
    // Use encodeURIComponent to ensure symbols like & and ? don't break the WhatsApp URL structure
    const text = encodeURIComponent(
      `Hello, I am interested in inquiring about the bespoke "${item.title}" (${item.category || "Couture"}).\n\n🔗 ${storeLink}`
    );
    const url = buildWhatsAppUrl(whatsappNumber, text);
    window.open(url, "_blank");
  };


  return (
    <section id="featured" className="py-24 sm:py-32 bg-[var(--color-bg,#F5F0EB)] text-[var(--color-primary,#1A1A1A)]">
      <div className="app-max-width app-x-padding">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-[#E0D5C9]/40 pb-8">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--color-accent,#C9A96E)] font-semibold block mb-3">
              Curated Masterpieces
            </span>
            <h2 className="text-3xl sm:text-5xl font-heading text-[var(--color-primary,#1A1A1A)]">
              {headline}
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4 md:mt-0">
            <p className="text-xs sm:text-sm text-[var(--color-primary,#1A1A1A)]/70 max-w-md font-light leading-relaxed">
              {description}
            </p>
            <Link
              href="/collections"
              className="hidden sm:inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-accent,#C9A96E)] hover:text-[var(--color-primary,#1A1A1A)] transition-colors shrink-0"
            >
              <span>{ctaLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Dynamic Responsive Grid (Strictly 2, 3, or 4 columns) */}
        <div className={`grid gap-8 ${gridClass}`}>
          {displayItems.map((item) => {
            const itemGroup = resolveGroupForCategory(item.category || "", item.group);
            const categorySlug = encodeURIComponent(
              (item.category || "bespoke").toLowerCase().replace(/\s+/g, "-")
            );

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group relative flex flex-col bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-[#E0D5C9]/60 cursor-pointer"
              >
                {/* Image Frame */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 text-[10px] uppercase tracking-widest font-bold bg-[#1A1A1A]/80 text-[#F5F0EB] backdrop-blur-sm border border-white/10">
                      {item.category || "Bespoke"}
                    </span>
                  </div>

                  {/* Group Tag */}
                  <div className="absolute top-4 right-4 z-10">
                    <span className="px-2.5 py-0.5 text-[9px] uppercase tracking-wider font-semibold bg-[var(--color-accent,#C9A96E)] text-[#1A1A1A]">
                      {itemGroup}
                    </span>
                  </div>

                  {/* Hover Inquire Button */}
                  <div className="absolute bottom-4 left-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInquire(item);
                      }}
                      className="w-full py-2.5 bg-[var(--color-accent,#C9A96E)] text-[#1A1A1A] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#F5F0EB] transition-colors shadow-lg"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Inquire Fitting</span>
                    </button>
                  </div>
                </div>

                {/* Card Meta */}
                <div className="p-5 flex flex-col justify-between flex-grow bg-white">
                  <div>
                    <h3 className="font-heading text-lg text-[var(--color-primary,#1A1A1A)] group-hover:text-[var(--color-accent,#C9A96E)] transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                  </div>
                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-widest">
                      Custom Bespoke
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                      }}
                      className="text-xs font-semibold text-[var(--color-accent,#C9A96E)] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile View All */}
        <div className="mt-12 text-center sm:hidden">
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-accent,#C9A96E)] hover:text-[var(--color-primary,#1A1A1A)] transition-colors"
          >
            <span>{ctaLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Light Modal Preview for Selected Item */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-[var(--color-primary,#1A1A1A)] border border-[var(--color-accent,#C9A96E)]/40 p-6 max-w-lg w-full text-white rounded space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[3/4] w-full rounded overflow-hidden">
              <Image src={selectedItem.image} alt={selectedItem.title} fill className="object-cover" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-[var(--color-accent,#C9A96E)]">
                {selectedItem.category}
              </span>
              <h3 className="text-xl font-heading font-bold">{selectedItem.title}</h3>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  handleInquire(selectedItem);
                }}
                className="flex-1 py-3 bg-[var(--color-accent,#C9A96E)] text-[var(--color-primary,#1A1A1A)] font-bold text-xs uppercase tracking-widest rounded cursor-pointer"
              >
                Inquire via WhatsApp
              </button>
              <button
                type="button"
                onClick={() => {
                   window.location.href = "/store";
                }}
                className="flex-1 py-3 bg-[var(--color-accent,#C9A96E)] text-[var(--color-primary,#1A1A1A)] font-bold text-xs uppercase tracking-widest rounded cursor-pointer"
              >
                Visit Store
              </button>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-3 border border-zinc-700 text-xs uppercase text-gray-400 rounded cursor-pointer hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
