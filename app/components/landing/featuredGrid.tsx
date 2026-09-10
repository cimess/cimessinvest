"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle, ExternalLink } from "lucide-react";
import { FeaturedItem } from "@/app/lib/content/types";
import { buildWhatsAppUrl } from "@/app/lib/utils/whatsapp";
import { resolveGroupForCategory } from "@/app/lib/content/categories";

export default function FeaturedGrid({
  items,
  whatsappNumber,
}: {
  items: FeaturedItem[];
  whatsappNumber: string;
}) {
  const [selectedItem, setSelectedItem] = useState<FeaturedItem | null>(null);

  const handleInquire = (item: FeaturedItem) => {
    const text = `Hello, I am interested in inquiring about the bespoke "${item.title}" (${item.category}).`;
    const url = buildWhatsAppUrl(whatsappNumber, text);
    window.open(url, "_blank");
  };

  const showcaseItems = items.slice(0, 8);

  return (
    <section className="py-24 sm:py-32 bg-[var(--color-bg,#F5F0EB)] text-[var(--color-primary,#1A1A1A)]">
      <div className="app-max-width app-x-padding">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-[#E0D5C9]/40 pb-8">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--color-accent,#C9A96E)] font-semibold block mb-3">
              Curated Masterpieces
            </span>
            <h2 className="text-3xl sm:text-5xl font-heading text-[var(--color-primary,#1A1A1A)]">
              Signature Collections
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4 md:mt-0">
            <p className="text-xs sm:text-sm text-[var(--color-primary,#1A1A1A)]/70 max-w-md font-light leading-relaxed">
              Every garment represents hundreds of hours of precision tailoring, hand embroidery, and luxury fabric selection.
            </p>
            <Link
              href="/collections"
              className="hidden sm:inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-accent,#C9A96E)] hover:text-[var(--color-primary,#1A1A1A)] transition-colors shrink-0"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Dynamic Showcase Grid (Up to 8 items) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {showcaseItems.map((item) => {
            const itemGroup = resolveGroupForCategory(item.category, item.group);
            const categorySlug = encodeURIComponent(
              item.category.toLowerCase().replace(/\s+/g, "-")
            );
            const detailUrl = `/image/${categorySlug}/${item.id}?img=${encodeURIComponent(item.image)}`;

            return (
              <div
                key={item.id}
                className="group relative bg-[var(--color-primary,#1A1A1A)] overflow-hidden shadow-lg border border-[#E0D5C9]/20 cursor-pointer flex flex-col"
                onClick={() => setSelectedItem(item)}
              >
                {/* Image Container */}
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  {/* Group & Tag Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                    <span className="bg-[#1A1A1A]/90 backdrop-blur-md px-2 py-0.5 rounded text-[9px] uppercase tracking-wider text-[var(--color-accent,#C9A96E)] font-bold">
                      {item.category}
                    </span>
                    <span className="bg-black/80 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider text-white/70 w-fit">
                      {itemGroup === "Native" ? "Native" : "Modern"}
                    </span>
                  </div>
                </div>

                {/* Item Info Overlay */}
                <div className="p-5 text-white z-10 flex flex-col flex-1 justify-between bg-[var(--color-primary,#1A1A1A)]">
                  <div>
                    <h3 className="text-base font-heading tracking-wide mb-3 group-hover:text-[var(--color-accent,#C9A96E)] transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInquire(item);
                      }}
                      className="flex-1 py-2 text-[11px] font-semibold tracking-widest uppercase border border-[var(--color-accent,#C9A96E)]/60 text-[var(--color-accent,#C9A96E)] hover:bg-[var(--color-accent,#C9A96E)] hover:text-[var(--color-primary,#1A1A1A)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>Inquire</span>
                    </button>

                    <Link
                      href={detailUrl}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 border border-white/10 text-white/70 hover:border-[var(--color-accent,#C9A96E)] hover:text-[var(--color-accent,#C9A96E)] transition-colors"
                      title="View Details"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Collections Button */}
        <div className="mt-14 text-center">
          <Link
            href="/collections"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--color-primary,#1A1A1A)] border border-[var(--color-accent,#C9A96E)] text-[var(--color-accent,#C9A96E)] hover:bg-[var(--color-accent,#C9A96E)] hover:text-[var(--color-primary,#1A1A1A)] transition-all font-bold text-xs uppercase tracking-[0.25em] shadow-lg hover:shadow-xl"
          >
            <span>Explore Full Bespoke Portfolio</span>
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
                onClick={() => handleInquire(selectedItem)}
                className="flex-1 py-3 bg-[var(--color-accent,#C9A96E)] text-[var(--color-primary,#1A1A1A)] font-bold text-xs uppercase tracking-widest rounded cursor-pointer"
              >
                Order via WhatsApp
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
