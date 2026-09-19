"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Filter, MessageCircle, X, Sparkles, Eye, ArrowUpRight } from "lucide-react";
import { buildWhatsAppUrl } from "@/app/lib/utils/whatsapp";
import { resolveGroupForCategory } from "@/app/lib/content/categories";
import { DEFAULT_FEATURED_ITEMS } from "@/app/lib/content/defaults";

export interface CollectionCatalogProps {
  id?: string;
  copy?: {
    headline?: string;
    subheadline?: string;
    filterLabel?: string;
    emptyText?: string;
  };
  layout?: {
    columns?: number; // Guardrail: 2, 3, or 4
    itemsPerPage?: number;
  };
  dataBinding?: {
    items?: Array<{
      id: string;
      title: string;
      category?: string | null;
      group?: string;
      image: string;
      description?: string;
      fabric?: string;
    }>;
  };
  context?: {
    brandName?: string;
    whatsappNumber?: string;
    companySlug?: string;
  };
}

export default function CollectionCatalog({
  id,
  copy,
  layout,
  dataBinding,
  context,
}: CollectionCatalogProps) {
  const brandName = context?.brandName || "Atelier";
  const whatsappNumber = context?.whatsappNumber || "2348000000000";
  const headline = copy?.headline || "The Curated Lookbook & Garment Archive";
  const subheadline =
    copy?.subheadline ||
    "Explore handcrafted ceremonial attire, bespoke native wear, and modern silhouettes engineered for nobility.";
  const emptyText = copy?.emptyText || "No bespoke pieces found in this category.";

  // Layout Guardrail: Clamp columns strictly between 2 and 4
  const rawColumns = layout?.columns ?? 3;
  const clampedColumns = Math.max(2, Math.min(4, Number(rawColumns) || 3));

  const gridClass =
    clampedColumns === 2
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2"
      : clampedColumns === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  // Catalog Items
  const items = useMemo(() => {
    if (dataBinding?.items && dataBinding.items.length > 0) {
      return dataBinding.items;
    }
    return DEFAULT_FEATURED_ITEMS.map((item, idx) => ({
      ...item,
      category: item.category || (idx % 2 === 0 ? "Agbada" : "Senator"),
      fabric: "Handloomed Silk & Wool Blend",
      description: "Handcrafted with artisanal embroidery, tailored for ceremonies and executive distinction.",
    }));
  }, [dataBinding?.items]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ["All", ...Array.from(set)];
  }, [items]);

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedGarment, setSelectedGarment] = useState<(typeof items)[0] | null>(null);

  // Filter items
  const filteredItems = useMemo(() => {
    if (activeCategory === "All") return items;
    return items.filter(
      (item) => item.category?.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [items, activeCategory]);

  return (
    <section id={id || "collection-catalog"} className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-bg,#141414)] text-[#F5F0EB]">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent,#C9A96E)]/10 border border-[var(--color-accent,#C9A96E)]/30 text-[var(--color-accent,#C9A96E)] text-xs font-semibold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Lookbook</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-heading font-bold tracking-tight text-[#F5F0EB]">
            {headline}
          </h2>
          <p className="text-sm sm:text-base text-[#E0D5C9]/70 font-light leading-relaxed">
            {subheadline}
          </p>
        </div>

        {/* Category Filter Navigation */}
        <div className="flex items-center justify-center flex-wrap gap-2 pt-2">
          {categories.map((cat) => {
            const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-xs uppercase tracking-widest font-medium rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-[var(--color-accent,#C9A96E)] text-[var(--color-primary,#1A1A1A)] font-bold shadow-lg shadow-[var(--color-accent,#C9A96E)]/20 scale-105"
                    : "bg-[#242424] text-[#E0D5C9]/70 hover:text-[#F5F0EB] hover:bg-[#2E2E2E] border border-white/5"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Interactive Garment Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-[#1D1D1D]/40 rounded-2xl border border-white/5">
            <Filter className="w-10 h-10 text-[var(--color-accent,#C9A96E)]/40 mx-auto mb-3" />
            <p className="text-sm text-[#E0D5C9]/60">{emptyText}</p>
          </div>
        ) : (
          <div className={`grid ${gridClass} gap-6 sm:gap-8`}>
            {filteredItems.map((item) => {
              const whatsappInquiryUrl = buildWhatsAppUrl(
                whatsappNumber,
                `Hello ${brandName}, I am admiring the "${item.title}" (${item.category || "Bespoke Design"}) from your lookbook archive and would like to inquire about fabric availability and consultation.`
              );

              return (
                <div
                  key={item.id}
                  className="group relative bg-[#1E1E1E] rounded-xl overflow-hidden border border-white/10 hover:border-[var(--color-accent,#C9A96E)]/50 transition-all duration-500 flex flex-col justify-between shadow-xl"
                >
                  {/* Image Container with Zoom Effect */}
                  <div
                    onClick={() => setSelectedGarment(item)}
                    className="relative aspect-[3/4] w-full overflow-hidden bg-black/40 cursor-pointer"
                  >
                    <Image
                      src={item.image || "/bg-img/showcase1.jpg"}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Category Tag */}
                    {item.category && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold bg-black/60 backdrop-blur-md text-[var(--color-accent,#C9A96E)] border border-[var(--color-accent,#C9A96E)]/30 rounded">
                        {item.category}
                      </span>
                    )}

                    {/* Quick View Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-[2px]">
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-accent,#C9A96E)] text-[var(--color-primary,#1A1A1A)] text-xs uppercase tracking-wider font-bold rounded shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                        <Eye className="w-3.5 h-3.5" />
                        Inspect Details
                      </span>
                    </div>
                  </div>

                  {/* Garment Details & Actions */}
                  <div className="p-5 flex flex-col justify-between flex-1 gap-4">
                    <div>
                      <h3 className="font-heading text-lg font-bold text-[#F5F0EB] tracking-wide group-hover:text-[var(--color-accent,#C9A96E)] transition-colors">
                        {item.title}
                      </h3>
                      {item.fabric && (
                        <p className="text-xs text-[#E0D5C9]/60 font-light mt-1 line-clamp-1">
                          {item.fabric}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                      <button
                        onClick={() => setSelectedGarment(item)}
                        className="text-xs text-[#E0D5C9]/80 hover:text-[#F5F0EB] inline-flex items-center gap-1 transition-colors"
                      >
                        <span>Specifications</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>

                      <a
                        href={whatsappInquiryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[var(--color-accent,#C9A96E)]/10 hover:bg-[var(--color-accent,#C9A96E)] text-[var(--color-accent,#C9A96E)] hover:text-[var(--color-primary,#1A1A1A)] border border-[var(--color-accent,#C9A96E)]/40 rounded text-xs font-semibold tracking-wider uppercase transition-all"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Inquire</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Garment Inspection Detail Modal */}
        {selectedGarment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="relative max-w-2xl w-full bg-[#1E1E1E] border border-[var(--color-accent,#C9A96E)]/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
              {/* Close Button */}
              <button
                onClick={() => setSelectedGarment(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white/80 hover:text-white hover:bg-black/90 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Image */}
              <div className="relative w-full md:w-1/2 aspect-[3/4] md:aspect-auto min-h-[300px] bg-black">
                <Image
                  src={selectedGarment.image || "/bg-img/showcase1.jpg"}
                  alt={selectedGarment.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Modal Content */}
              <div className="p-6 md:p-8 flex flex-col justify-between w-full md:w-1/2 space-y-6">
                <div className="space-y-3">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[var(--color-accent,#C9A96E)] font-bold">
                    {selectedGarment.category || "Atelier Archive"}
                  </span>
                  <h3 className="text-2xl font-heading font-bold text-[#F5F0EB]">
                    {selectedGarment.title}
                  </h3>
                  {selectedGarment.fabric && (
                    <div className="text-xs text-[#E0D5C9]/70 bg-white/5 p-2 rounded border border-white/5">
                      <span className="text-[var(--color-accent,#C9A96E)] font-medium">Fabric: </span>
                      {selectedGarment.fabric}
                    </div>
                  )}
                  <p className="text-xs text-[#E0D5C9]/80 font-light leading-relaxed">
                    {selectedGarment.description ||
                      "Each piece is exclusively handcrafted upon order. Patterns are drafted to individual body measurements, with personalized motif embroidery."}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/10">
                  <a
                    href={buildWhatsAppUrl(
                      whatsappNumber,
                      `Hello ${brandName}, I would like to book a private consultation for the "${selectedGarment.title}".`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-[var(--color-accent,#C9A96E)] text-[var(--color-primary,#1A1A1A)] font-bold text-xs uppercase tracking-widest rounded flex items-center justify-center gap-2 hover:bg-[#F5F0EB] transition-colors shadow-lg"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Inquire via WhatsApp</span>
                  </a>
                  <button
                    onClick={() => setSelectedGarment(null)}
                    className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white/80 text-xs font-semibold uppercase tracking-wider rounded transition-colors"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
