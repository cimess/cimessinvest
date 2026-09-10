"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Filter, Layers, MessageCircle, ExternalLink, Sparkles } from "lucide-react";
import { FeaturedItem } from "@/app/lib/content/types";
import { WEAR_GROUPS, WearGroupId, resolveGroupForCategory } from "@/app/lib/content/categories";
import { buildWhatsAppUrl } from "@/app/lib/utils/whatsapp";

interface CollectionCatalogProps {
  items: FeaturedItem[];
  initialNextCursor?: string | null;
  initialHasMore?: boolean;
  whatsappNumber: string;
  brandName: string;
}

export default function CollectionCatalog({
  items,
  initialNextCursor = null,
  initialHasMore = false,
  whatsappNumber,
  brandName,
}: CollectionCatalogProps) {
  const [catalogItems, setCatalogItems] = useState<FeaturedItem[]>(items);
  const [cursor, setCursor] = useState<string | null>(initialNextCursor);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  const [selectedGroup, setSelectedGroup] = useState<"All" | WearGroupId>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeItem, setActiveItem] = useState<FeaturedItem | null>(null);

  // Group items and filter
  const filteredItems = useMemo(() => {
    return catalogItems.filter((item) => {
      const itemGroup = resolveGroupForCategory(item.category, item.group);

      if (selectedGroup !== "All" && itemGroup !== selectedGroup) {
        return false;
      }

      if (
        selectedCategory !== "All" &&
        item.category.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }

      return true;
    });
  }, [catalogItems, selectedGroup, selectedCategory]);

  // Dynamically determine available subcategories based on current group
  const availableCategories = useMemo(() => {
    if (selectedGroup === "All") {
      const set = new Set<string>();
      catalogItems.forEach((item) => set.add(item.category));
      return Array.from(set);
    }
    return WEAR_GROUPS[selectedGroup].tags;
  }, [catalogItems, selectedGroup]);

  // Load next batch via cursor-based seek
  const handleLoadMore = async () => {
    if (!cursor || loadingMore || !hasMore) return;
    setLoadingMore(true);

    try {
      const params = new URLSearchParams({
        cursor,
        limit: "24",
      });

      const res = await fetch(`/api/collections?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load more items");

      const data = await res.json();
      if (data.items && Array.isArray(data.items)) {
        const formattedNewItems: FeaturedItem[] = data.items.map((img: any) => ({
          id: img.id,
          title: img.title || "Bespoke Design",
          category: img.category,
          group: img.group || "Native",
          placement: img.placement || "both",
          image: img.url,
        }));

        setCatalogItems((prev) => {
          const existingIds = new Set(prev.map((i) => i.id));
          const uniqueNew = formattedNewItems.filter((i) => !existingIds.has(i.id));
          return [...prev, ...uniqueNew];
        });

        setCursor(data.nextCursor ?? null);
        setHasMore(Boolean(data.hasMore));
      }
    } catch (err) {
      console.error("[Catalog] Error loading next page of designs:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleInquire = (item: FeaturedItem) => {
    const text = `Hello ${brandName}, I am interested in ordering/inquiring about the bespoke "${item.title}" (${item.category}).`;
    const url = buildWhatsAppUrl(whatsappNumber, text);
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-12">
      {/* Filter Bar */}
      <div className="bg-[#1F1F1F] border border-[#C9A96E]/20 p-6 rounded-xl shadow-xl space-y-6">
        {/* Tier 1: Main Group Tabs (Native vs Modern vs All) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#C9A96E]" />
            <span className="text-xs uppercase tracking-[0.25em] text-[#C9A96E] font-bold">
              Collections Classification:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(["All", "Native", "Modern"] as const).map((groupKey) => {
              const isSelected = selectedGroup === groupKey;
              const label =
                groupKey === "All"
                  ? "All Designs"
                  : WEAR_GROUPS[groupKey].label;

              return (
                <button
                  key={groupKey}
                  onClick={() => {
                    setSelectedGroup(groupKey);
                    setSelectedCategory("All");
                  }}
                  className={`px-5 py-2.5 rounded text-xs font-bold tracking-widest uppercase transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#C9A96E] text-[#1A1A1A] shadow-lg shadow-[#C9A96E]/20"
                      : "bg-white/5 border border-white/10 text-[#E0D5C9]/80 hover:bg-white/10 hover:text-[#F5F0EB]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tier 2: Subcategory / Tag Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <Filter className="w-3.5 h-3.5 text-[#C9A96E]/60 mr-1 shrink-0" />
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === "All"
                ? "bg-[#C9A96E]/20 border border-[#C9A96E] text-[#C9A96E] font-bold"
                : "bg-white/5 border border-white/10 text-[#E0D5C9]/60 hover:border-[#C9A96E]/40 hover:text-[#C9A96E]"
            }`}
          >
            All Subcategories ({filteredItems.length})
          </button>
          {availableCategories.map((cat) => {
            const isCatActive = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                  isCatActive
                    ? "bg-[#C9A96E]/20 border border-[#C9A96E] text-[#C9A96E] font-bold"
                    : "bg-white/5 border border-white/10 text-[#E0D5C9]/60 hover:border-[#C9A96E]/40 hover:text-[#C9A96E]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Garments */}
      {filteredItems.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-[#C9A96E]/30 rounded-xl space-y-4 bg-[#1F1F1F]/40">
          <Sparkles className="w-10 h-10 text-[#C9A96E]/40 mx-auto" />
          <h3 className="text-xl font-heading text-[#F5F0EB]">No Designs Found</h3>
          <p className="text-xs text-[#E0D5C9]/70 font-light max-w-md mx-auto">
            No items are currently listed under this selection. Switch filters or view all collections.
          </p>
          <button
            onClick={() => {
              setSelectedGroup("All");
              setSelectedCategory("All");
            }}
            className="px-5 py-2.5 bg-[#C9A96E] text-[#1A1A1A] font-bold text-xs uppercase tracking-wider rounded cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredItems.map((item) => {
            const itemGroup = resolveGroupForCategory(item.category, item.group);
            const categorySlug = encodeURIComponent(
              item.category.toLowerCase().replace(/\s+/g, "-")
            );
            const detailUrl = `/image/${categorySlug}/${item.id}?img=${encodeURIComponent(item.image)}`;

            return (
              <div
                key={item.id}
                className="group relative bg-[#242424] border border-[#C9A96E]/20 rounded-lg overflow-hidden shadow-lg hover:border-[#C9A96E]/70 transition-all duration-500 flex flex-col"
              >
                {/* Image Container */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/60">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-70 group-hover:opacity-40 transition-opacity duration-300" />

                  {/* Category & Group Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                    <span className="bg-[#1A1A1A]/90 backdrop-blur-md px-2.5 py-1 rounded border border-[#C9A96E]/40 text-[10px] uppercase font-bold tracking-wider text-[#C9A96E]">
                      {item.category}
                    </span>
                    <span className="bg-black/75 px-2 py-0.5 rounded text-[9px] uppercase tracking-wider text-white/80 w-fit">
                      {itemGroup === "Native" ? "Native Wear" : "Modern Wear"}
                    </span>
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-5 flex flex-col flex-1 justify-between bg-[#242424]">
                  <div>
                    <h3 className="text-lg font-heading text-[#F5F0EB] group-hover:text-[#C9A96E] transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-[#E0D5C9]/60 font-light mt-1">
                      Bespoke handcrafted design
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 mt-4 border-t border-white/10 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleInquire(item)}
                      className="flex-1 py-2.5 bg-[#C9A96E] text-[#1A1A1A] font-bold text-[11px] uppercase tracking-wider hover:bg-[#F5F0EB] transition-colors rounded flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Inquire</span>
                    </button>

                    <Link
                      href={detailUrl}
                      className="p-2.5 bg-white/5 border border-white/10 text-[#F5F0EB] hover:border-[#C9A96E] hover:text-[#C9A96E] transition-colors rounded"
                      title="View Lookbook Details"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Action / Archive Completion */}
      {hasMore && (
        <div className="pt-10 pb-6 text-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-8 py-3.5 bg-gradient-to-r from-[#C9A96E] to-[#DFBA73] hover:from-[#DFBA73] hover:to-[#C9A96E] text-[#141414] font-bold text-xs uppercase tracking-[0.25em] rounded-full shadow-lg shadow-[#C9A96E]/20 hover:shadow-[#C9A96E]/35 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingMore ? (
              <>
                <div className="w-4 h-4 border-2 border-[#141414] border-t-transparent rounded-full animate-spin" />
                <span>Retrieving Archive...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#141414]" />
                <span>Explore More Bespoke Pieces</span>
              </>
            )}
          </button>
        </div>
      )}

      {!hasMore && catalogItems.length > 0 && (
        <div className="pt-12 pb-4 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-[#C9A96E]/80 text-xs tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A96E]" />
            <span>Complete Haute Couture Archive Displayed ({catalogItems.length} Pieces)</span>
          </div>
        </div>
      )}
    </div>
  );
}
