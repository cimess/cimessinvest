"use client";

import { useState } from "react";
import Image from "next/image";
import { FeaturedItem } from "@/app/lib/content/types";
import { buildWhatsAppUrl } from "@/app/lib/utils/whatsapp";

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
          <p className="text-xs sm:text-sm text-[var(--color-primary,#1A1A1A)]/70 max-w-md mt-4 md:mt-0 font-light leading-relaxed">
            Every garment represents hundreds of hours of precision tailoring, hand embroidery, and luxury fabric selection.
          </p>
        </div>

        {/* 4-Item Showcase Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.slice(0, 4).map((item) => (
            <div
              key={item.id}
              className="group relative bg-[var(--color-primary,#1A1A1A)] overflow-hidden shadow-lg border border-[#E0D5C9]/20 cursor-pointer"
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
              </div>

              {/* Item Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10 flex flex-col justify-end">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[var(--color-accent,#C9A96E)] font-semibold mb-1">
                  {item.category}
                </span>
                <h3 className="text-lg font-heading tracking-wide mb-3 group-hover:text-[var(--color-accent,#C9A96E)] transition-colors">
                  {item.title}
                </h3>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInquire(item);
                  }}
                  className="w-full py-2 text-[11px] font-semibold tracking-widest uppercase border border-[var(--color-accent,#C9A96E)]/60 text-[var(--color-accent,#C9A96E)] hover:bg-[var(--color-accent,#C9A96E)] hover:text-[var(--color-primary,#1A1A1A)] transition-all cursor-pointer"
                >
                  Inquire Item
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Light Modal Preview for Selected Item */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-[var(--color-primary,#1A1A1A)] border border-[var(--color-accent,#C9A96E)]/40 p-6 max-w-lg w-full text-white rounded space-y-4"
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
                className="flex-1 py-2 bg-[var(--color-accent,#C9A96E)] text-[var(--color-primary,#1A1A1A)] font-bold text-xs uppercase tracking-widest rounded"
              >
                Order via WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 border border-zinc-700 text-xs uppercase text-gray-400 rounded"
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
