"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Tag,
  Image as ImageIcon,
  Filter,
  Check,
  ExternalLink,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  CloudUpload,
  Database,
  Lock,
  Layers,
  Sparkle,
} from "lucide-react";
import Image from "next/image";
import { api } from "@/app/lib/utils/apiClient";
import {
  WEAR_GROUPS,
  WearGroupId,
  PlacementOption,
  PLACEMENT_OPTIONS,
  resolveGroupForCategory,
} from "@/app/lib/content/categories";

interface CollectionItem {
  id: string;
  title: string;
  category: string;
  group?: string;
  placement?: string;
  type: string;
  url: string;
  createdAt: string;
  isStatic?: boolean;
}

type UploadStep =
  | "IDLE"
  | "SIGNING"
  | "UPLOADING_CLOUDINARY"
  | "SAVING_DB"
  | "SUCCESS"
  | "ERROR";

const INITIAL_ITEMS: CollectionItem[] = [
  {
    id: "1",
    title: "Royal Agbada Ensemble",
    category: "Agbada",
    group: "Native",
    placement: "both",
    url: "/bg-img/native1.jpeg",
    type: "image",
    createdAt: "2026-08-20",
    isStatic: true,
  },
  {
    id: "2",
    title: "Sculpted Kaftan",
    category: "Kaftan",
    group: "Native",
    placement: "both",
    url: "/bg-img/native2.jpeg",
    type: "image",
    createdAt: "2026-08-21",
    isStatic: true,
  },
  {
    id: "3",
    title: "Imperial Senator Suit",
    category: "Senator Suit",
    group: "Native",
    placement: "both",
    url: "/bg-img/native3.jpeg",
    type: "image",
    createdAt: "2026-08-22",
    isStatic: true,
  },
  {
    id: "4",
    title: "Hand-Embroidered Buba",
    category: "Buba & Sokoto",
    group: "Native",
    placement: "both",
    url: "/bg-img/native7.jpeg",
    type: "image",
    createdAt: "2026-08-23",
    isStatic: true,
  },
  {
    id: "5",
    title: "Luxury Tailored Joggers",
    category: "Joggers & Sweats",
    group: "Modern",
    placement: "both",
    url: "/bg-img/native5.jpeg",
    type: "image",
    createdAt: "2026-08-24",
    isStatic: true,
  },
];

export default function CollectionsPage() {
  const [items, setItems] = useState<CollectionItem[]>(INITIAL_ITEMS);
  const [filterGroup, setFilterGroup] = useState<"All" | WearGroupId>("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State for Adding New Item
  const [title, setTitle] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<WearGroupId>("Native");
  const [category, setCategory] = useState("Agbada");
  const [isCustomTag, setIsCustomTag] = useState(false);
  const [customTag, setCustomTag] = useState("");
  const [placement, setPlacement] = useState<PlacementOption>("both");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Upload Progress & State Handling
  const [uploadStep, setUploadStep] = useState<UploadStep>("IDLE");
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Item Deletion Loading State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [settingsRes, collectionsRes] = await Promise.all([
          api.get("/api/user/settings").catch(() => ({ data: {} })),
          api.get("/api/collections?page=1&limit=20").catch(() => ({ data: { items: [], hasMore: false } })),
        ]);

        const siteSetting = settingsRes.data?.siteSetting || {};
        const dbItems: CollectionItem[] = collectionsRes.data?.items || [];
        const hasMoreData = collectionsRes.data?.hasMore ?? false;

        const { showDefaultImages = true, appendDefaults = false, removeAllDefaults = false } = siteSetting;

        let finalItems: CollectionItem[] = [];

        if (removeAllDefaults || !showDefaultImages) {
          finalItems = dbItems;
        } else if (appendDefaults) {
          finalItems = hasMoreData ? dbItems : [...dbItems, ...INITIAL_ITEMS];
        } else {
          finalItems = dbItems.length > 0 ? dbItems : INITIAL_ITEMS;
        }

        setItems(finalItems);
        setHasMore(hasMoreData);
      } catch (err) {
        console.error("Failed to load initial catalog data:", err);
        setItems(INITIAL_ITEMS);
      }
    }

    loadData();
  }, []);

  const handleLoadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await api.get(`/api/collections?page=${nextPage}&limit=20`);
      const data = res.data;

      const settingsRes = await api.get("/api/user/settings").catch(() => ({ data: {} }));
      const siteSetting = settingsRes.data?.siteSetting || {};
      const { appendDefaults = false, removeAllDefaults = false, showDefaultImages = true } = siteSetting;

      let newItems = [...items, ...data.items];

      if (!data.hasMore && appendDefaults && !removeAllDefaults && showDefaultImages) {
        newItems = [...newItems, ...INITIAL_ITEMS];
      }

      setItems(newItems);
      setPage(nextPage);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error("Failed to load more items:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !title.trim()) {
      setUploadError("Please select a media file and enter an item title.");
      return;
    }

    const finalCategory = isCustomTag && customTag.trim() ? customTag.trim() : category;

    setUploadError(null);
    const isVideo = selectedFile.type.startsWith("video/");
    const resourceType = isVideo ? "video" : "image";
    const maxAllowedSize = isVideo ? 80 * 1024 * 1024 : 10 * 1024 * 1024;

    if (selectedFile.size > maxAllowedSize) {
      setUploadError(
        `File is too large! Maximum limit is ${isVideo ? "80MB for videos" : "10MB for images"}.`,
      );
      return;
    }

    try {
      // STEP 1: Request HMAC Signature from Server
      setUploadStep("SIGNING");
      setUploadMessage("Step 1/3: Authorizing secure signature with Cloud server...");

      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceType, fileSize: selectedFile.size }),
      });

      if (!signRes.ok) {
        const err = await signRes.json();
        throw new Error(err.error || "Failed to authorize upload signature.");
      }

      const { signature, timestamp, apiKey, cloudName, folder } = await signRes.json();

      // STEP 2: Direct Binary Upload to Cloudinary CDN
      setUploadStep("UPLOADING_CLOUDINARY");
      setUploadMessage(`Step 2/3: Uploading ${isVideo ? "video" : "image"} directly to Cloud CDN server...`);

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        { method: "POST", body: formData },
      );
      const cloudinaryData = await uploadRes.json();

      if (!uploadRes.ok || !cloudinaryData.secure_url) {
        throw new Error(cloudinaryData.error?.message || "Upload rejected.");
      }

      // STEP 3: Persist Metadata to Database
      setUploadStep("SAVING_DB");
      setUploadMessage("Step 3/3: Synchronizing asset metadata into database storage...");

      const dbRes = await api.post("/api/collections", {
        url: cloudinaryData.secure_url,
        title: title.trim(),
        category: finalCategory,
        group: selectedGroup,
        placement: placement,
        size: cloudinaryData.bytes,
        type: cloudinaryData.resource_type,
      });

      const savedItem = await dbRes.data;

      // STEP 4: Success Transition
      setUploadStep("SUCCESS");
      setUploadMessage("Asset successfully published to your catalog!");

      setTimeout(() => {
        setItems((prev) => [
          {
            id: savedItem.id,
            title: savedItem.title || title.trim(),
            category: savedItem.category || finalCategory,
            group: savedItem.group || selectedGroup,
            placement: savedItem.placement || placement,
            type: savedItem.type || resourceType,
            url: savedItem.url || cloudinaryData.secure_url,
            createdAt: new Date().toISOString().split("T")[0],
          },
          ...prev,
        ]);
        setIsModalOpen(false);
        setTitle("");
        setCustomTag("");
        setIsCustomTag(false);
        setSelectedFile(null);
        setUploadStep("IDLE");
      }, 1500);
    } catch (err: unknown) {
      console.error("Upload workflow failed:", err);
      setUploadStep("ERROR");
      setUploadError(
        err instanceof Error ? err.message : "Failed to upload asset.",
      );
    }
  };

  const handleDeleteItem = async (
    id: string,
    url: string,
    type?: string,
    isStatic?: boolean,
  ) => {
    if (isStatic) {
      alert("Default showcase items cannot be deleted directly from here. Manage defaults in Landing Settings.");
      return;
    }

    if (!confirm("Are you sure you want to delete this piece? This action cannot be undone.")) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await api.delete("/api/media/delete", {
        data: { id, url, resourceType: type || "image" },
      });

      if (res.data?.success) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      } else {
        throw new Error(res.data?.error || "Deletion unsuccessful.");
      }
    } catch (err) {
      console.error("Delete asset failed:", err);
      alert("Asset deletion failed. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyLink = (id: string, itemUrl: string) => {
    navigator.clipboard.writeText(itemUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter items by Group and Subcategory Tag
  const filteredItems = items.filter((item) => {
    const itemGroup = resolveGroupForCategory(item.category, item.group);
    if (filterGroup !== "All" && itemGroup !== filterGroup) {
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

  // Available subcategory tags for the current group filter
  const availableTags =
    filterGroup === "All"
      ? Array.from(new Set(items.map((i) => i.category)))
      : WEAR_GROUPS[filterGroup].tags;

  const isUploading =
    uploadStep === "SIGNING" ||
    uploadStep === "UPLOADING_CLOUDINARY" ||
    uploadStep === "SAVING_DB";

  return (
    <div className="p-6 sm:p-10 space-y-8 bg-[#1A1A1A] min-h-screen text-[#F5F0EB] font-body">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#C9A96E]/20 pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#C9A96E] font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A96E]" />
            Catalog Gallery
          </span>
          <h1 className="text-3xl font-heading text-[#F5F0EB] mt-1 font-bold">
            Collections Catalog
          </h1>
          <p className="text-xs text-[#E0D5C9]/60 font-light mt-1">
            Upload and organize bespoke Nigerian native and modern streetwear designs.
          </p>
        </div>

        <button
          onClick={() => {
            setIsModalOpen(true);
            setUploadStep("IDLE");
            setUploadError(null);
          }}
          className="px-5 py-2.5 bg-[#C9A96E] text-[#1A1A1A] text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#F5F0EB] transition-colors flex items-center space-x-2 self-start sm:self-auto rounded cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Item</span>
        </button>
      </div>

      {/* Main Group Filter Tabs (All / Native Wears / Modern Wears) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <Layers className="w-4 h-4 text-[#C9A96E] mr-1 shrink-0" />
          <span className="text-xs uppercase tracking-wider text-[#C9A96E] font-semibold mr-2">
            Collection Group:
          </span>
          <div className="flex items-center gap-2">
            {(["All", "Native", "Modern"] as const).map((groupKey) => {
              const label =
                groupKey === "All"
                  ? "All Collections"
                  : WEAR_GROUPS[groupKey].label;
              const isSelected = filterGroup === groupKey;
              return (
                <button
                  key={groupKey}
                  onClick={() => {
                    setFilterGroup(groupKey);
                    setSelectedCategory("All");
                  }}
                  className={`px-4 py-2 rounded text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#C9A96E] text-[#1A1A1A] shadow-md shadow-[#C9A96E]/20"
                      : "bg-white/5 text-[#E0D5C9]/70 hover:bg-white/10 hover:text-[#F5F0EB]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Subcategory Tag Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide pt-1">
          <Filter className="w-3.5 h-3.5 text-[#C9A96E]/70 mr-1 shrink-0" />
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-3 py-1 rounded-full text-[11px] font-medium tracking-wide transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === "All"
                ? "bg-[#C9A96E]/20 border border-[#C9A96E] text-[#C9A96E] font-bold"
                : "bg-white/5 border border-white/10 text-[#E0D5C9]/60 hover:border-[#C9A96E]/40 hover:text-[#C9A96E]"
            }`}
          >
            All Subcategories
          </button>
          {availableTags.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? "bg-[#C9A96E]/20 border border-[#C9A96E] text-[#C9A96E] font-bold"
                  : "bg-white/5 border border-white/10 text-[#E0D5C9]/60 hover:border-[#C9A96E]/40 hover:text-[#C9A96E]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredItems.map((item) => {
          const itemGroup = resolveGroupForCategory(item.category, item.group);
          const placementDisplay =
            item.placement === "story"
              ? "Story Only"
              : item.placement === "collection"
              ? "Collection Only"
              : "Collection & Story";

          return (
            <div
              key={item.id}
              className="group relative bg-black/40 border border-[#C9A96E]/20 rounded-lg overflow-hidden transition-all duration-300 hover:border-[#C9A96E]/60 hover:shadow-xl hover:shadow-[#C9A96E]/5 flex flex-col"
            >
              {/* Image Preview Container */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/60">
                <Image
                  src={item.url}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />

                {/* Deleting Overlay Spinner */}
                {deletingId === item.id && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center space-y-2 p-4 text-center">
                    <Loader2 className="w-8 h-8 text-red-400 animate-spin" />
                    <span className="text-[11px] font-mono text-red-300">
                      Removing from Cloud CDN & Database...
                    </span>
                  </div>
                )}

                {/* Category & Group Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                  <span className="bg-[#1A1A1A]/85 backdrop-blur-md px-2.5 py-1 rounded border border-[#C9A96E]/40 text-[10px] uppercase font-bold tracking-wider text-[#C9A96E] flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5" />
                    {item.category}
                  </span>
                  <span className="bg-black/80 px-2 py-0.5 rounded text-[9px] uppercase tracking-wider text-white/70 w-fit">
                    {itemGroup === "Native" ? "Native Wear" : "Modern Wear"}
                  </span>
                </div>

                {/* Placement Badge on Top Right */}
                <div className="absolute top-3 right-3 z-10 sm:group-hover:opacity-0 sm:transition-opacity">
                  <span className="bg-black/75 backdrop-blur-md px-2 py-1 rounded border border-white/20 text-[9px] uppercase tracking-wider text-[#F5F0EB]/90 flex items-center gap-1 font-mono">
                    <Sparkle className="w-2.5 h-2.5 text-[#C9A96E]" />
                    {placementDisplay}
                  </span>
                </div>

                {/* Action Buttons: Visible on Mobile Touch Devices, Hover on Desktop */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20 sm:inset-0 sm:bg-black/60 sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity sm:duration-300 sm:items-center sm:justify-center sm:gap-3">
                  <button
                    onClick={() => handleCopyLink(item.id, item.url)}
                    title="Copy Media URL"
                    className="p-2 sm:p-2.5 bg-[#1A1A1A]/90 text-[#C9A96E] rounded-full border border-[#C9A96E]/40 hover:bg-[#C9A96E] hover:text-[#1A1A1A] transition-colors"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    ) : (
                      <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    )}
                  </button>
                  <button
                    onClick={() =>
                      handleDeleteItem(item.id, item.url, item.type, item.isStatic)
                    }
                    disabled={deletingId === item.id}
                    title="Delete Item"
                    className="p-2 sm:p-2.5 bg-red-950/90 text-red-400 rounded-full border border-red-500/40 hover:bg-red-600 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>

              {/* Item Meta Details */}
              <div className="p-4 flex items-center justify-between gap-2 mt-auto">
                <div className="space-y-0.5 min-w-0">
                  <h3 className="text-sm font-semibold text-[#F5F0EB] tracking-wide truncate">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-[#E0D5C9]/50 font-light">
                    <span>{placementDisplay}</span>
                    <span>•</span>
                    <span>{item.createdAt}</span>
                  </div>
                </div>
                {/* Direct Touch Delete Button for Mobile Below Card */}
                <button
                  type="button"
                  onClick={() =>
                    handleDeleteItem(item.id, item.url, item.type, item.isStatic)
                  }
                  disabled={deletingId === item.id}
                  className="sm:hidden p-2 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded border border-red-800/40 shrink-0"
                  title="Delete item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="pt-8 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-8 py-3 bg-[#1A1A1A] border border-[#C9A96E] text-[#C9A96E] text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#C9A96E] hover:text-[#1A1A1A] transition-colors rounded disabled:opacity-50 flex items-center space-x-2 mx-auto"
          >
            {loadingMore && <Loader2 className="w-4 h-4 animate-spin text-[#C9A96E]" />}
            <span>{loadingMore ? "Loading Items..." : "Load More Items"}</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="p-12 text-center border border-dashed border-[#C9A96E]/30 rounded-lg space-y-3">
          <ImageIcon className="w-10 h-10 text-[#C9A96E]/40 mx-auto" />
          <p className="text-sm text-[#E0D5C9]/70 font-light">
            No items found for the selected &quot;{filterGroup}&quot; - &quot;{selectedCategory}&quot; filter.
          </p>
        </div>
      )}

      {/* Add Item Modal with Placement & Categories */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1A1A1A] border border-[#C9A96E]/30 w-full max-w-lg p-6 rounded-lg space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-[#C9A96E]/20 pb-4">
              <h2 className="text-lg font-bold text-[#F5F0EB] tracking-wide flex items-center gap-2">
                <CloudUpload className="w-5 h-5 text-[#C9A96E]" />
                <span>Add New Catalog Item</span>
              </h2>
              {!isUploading && (
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-[#E0D5C9]/60 hover:text-[#C9A96E] text-sm"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Error Alert inside Modal */}
            {uploadError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Live Progress Bar & Rolling Steps Indicator */}
            {isUploading && (
              <div className="p-4 bg-black/60 border border-[#C9A96E]/30 rounded-lg space-y-3">
                <div className="flex items-center space-x-3">
                  <Loader2 className="w-6 h-6 text-[#C9A96E] animate-spin shrink-0" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-[#F5F0EB]">Cloud Exchange in Progress</p>
                    <p className="text-[11px] text-[#C9A96E] font-mono">{uploadMessage}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-[10px] font-mono text-center">
                  <div
                    className={`p-1.5 rounded flex items-center justify-center space-x-1 ${
                      uploadStep === "SIGNING"
                        ? "bg-[#C9A96E]/20 text-[#C9A96E] font-bold border border-[#C9A96E]/40"
                        : "bg-white/5 text-white/40"
                    }`}
                  >
                    <Lock className="w-3 h-3" />
                    <span>1. Sign</span>
                  </div>
                  <div
                    className={`p-1.5 rounded flex items-center justify-center space-x-1 ${
                      uploadStep === "UPLOADING_CLOUDINARY"
                        ? "bg-[#C9A96E]/20 text-[#C9A96E] font-bold border border-[#C9A96E]/40"
                        : "bg-white/5 text-white/40"
                    }`}
                  >
                    <CloudUpload className="w-3 h-3" />
                    <span>2. Cloud CDN</span>
                  </div>
                  <div
                    className={`p-1.5 rounded flex items-center justify-center space-x-1 ${
                      uploadStep === "SAVING_DB"
                        ? "bg-[#C9A96E]/20 text-[#C9A96E] font-bold border border-[#C9A96E]/40"
                        : "bg-white/5 text-white/40"
                    }`}
                  >
                    <Database className="w-3 h-3" />
                    <span>3. Database</span>
                  </div>
                </div>
              </div>
            )}

            {/* Success State Notification Banner */}
            {uploadStep === "SUCCESS" && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                <p className="text-xs font-bold text-emerald-300">{uploadMessage}</p>
              </div>
            )}

            <form onSubmit={handleAddItem} className="space-y-4">
              {/* Item Title */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#C9A96E] mb-1">
                  Item Title
                </label>
                <input
                  type="text"
                  required
                  disabled={isUploading || uploadStep === "SUCCESS"}
                  placeholder="e.g. Royal Agbada Ensemble or Luxury Joggers"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-10 px-3 bg-black/60 border border-white/10 rounded text-xs text-[#F5F0EB] focus:outline-none focus:border-[#C9A96E] disabled:opacity-50"
                />
              </div>

              {/* Media File */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#C9A96E] mb-1">
                  Media File (Image / Video)
                </label>
                <input
                  type="file"
                  required
                  disabled={isUploading || uploadStep === "SUCCESS"}
                  accept="image/*,video/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-[#F5F0EB] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#C9A96E] file:text-[#1A1A1A] hover:file:bg-[#F5F0EB] disabled:opacity-50"
                />
              </div>

              {/* Group Selector (Native vs Modern) */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#C9A96E] mb-1.5">
                  Garment Group
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGroup("Native");
                      setCategory("Agbada");
                      setIsCustomTag(false);
                    }}
                    className={`py-2 px-3 rounded text-xs font-bold uppercase tracking-wider border transition-all text-center cursor-pointer ${
                      selectedGroup === "Native"
                        ? "bg-[#C9A96E] text-[#1A1A1A] border-[#C9A96E]"
                        : "bg-black/50 text-[#E0D5C9]/70 border-white/10 hover:border-white/30"
                    }`}
                  >
                    Native Wears
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGroup("Modern");
                      setCategory("Joggers & Sweats");
                      setIsCustomTag(false);
                    }}
                    className={`py-2 px-3 rounded text-xs font-bold uppercase tracking-wider border transition-all text-center cursor-pointer ${
                      selectedGroup === "Modern"
                        ? "bg-[#C9A96E] text-[#1A1A1A] border-[#C9A96E]"
                        : "bg-black/50 text-[#E0D5C9]/70 border-white/10 hover:border-white/30"
                    }`}
                  >
                    Modern Wears
                  </button>
                </div>
              </div>

              {/* Subcategory / Tag Selection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs uppercase tracking-widest text-[#C9A96E]">
                    Style / Category Tag
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomTag(!isCustomTag)}
                    className="text-[10px] text-[#C9A96E] hover:underline"
                  >
                    {isCustomTag ? "Choose from list" : "+ Add custom tag"}
                  </button>
                </div>

                {isCustomTag ? (
                  <input
                    type="text"
                    required
                    placeholder="Enter custom tag (e.g. Ankara Blazer, Kimono)"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    className="w-full h-10 px-3 bg-black/60 border border-[#C9A96E]/50 rounded text-xs text-[#F5F0EB] focus:outline-none focus:border-[#C9A96E]"
                  />
                ) : (
                  <select
                    value={category}
                    disabled={isUploading || uploadStep === "SUCCESS"}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 px-3 bg-black/60 border border-white/10 rounded text-xs text-[#F5F0EB] focus:outline-none focus:border-[#C9A96E] disabled:opacity-50"
                  >
                    {WEAR_GROUPS[selectedGroup].tags.map((tag) => (
                      <option key={tag} value={tag} className="bg-[#1A1A1A] text-white">
                        {tag}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Where to Display / Placement Selector */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#C9A96E] mb-1.5">
                  Display Placement
                </label>
                <div className="space-y-2">
                  {PLACEMENT_OPTIONS.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-start gap-3 p-2.5 rounded border cursor-pointer transition-all ${
                        placement === opt.id
                          ? "bg-[#C9A96E]/15 border-[#C9A96E] text-white"
                          : "bg-black/40 border-white/10 text-white/70 hover:border-white/20"
                      }`}
                    >
                      <input
                        type="radio"
                        name="placement"
                        value={opt.id}
                        checked={placement === opt.id}
                        onChange={() => setPlacement(opt.id)}
                        className="mt-0.5 accent-[#C9A96E]"
                      />
                      <div className="text-xs">
                        <span className="font-semibold block text-[#F5F0EB]">
                          {opt.label}
                        </span>
                        <span className="text-[11px] text-[#E0D5C9]/60 font-light block">
                          {opt.description}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#E0D5C9]/70 hover:text-white disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || uploadStep === "SUCCESS"}
                  className="px-6 py-2.5 bg-[#C9A96E] text-[#1A1A1A] font-bold text-xs uppercase tracking-wider hover:bg-[#F5F0EB] transition-colors rounded disabled:opacity-50 flex items-center space-x-2 cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#1A1A1A]" />
                      <span>Exchanging...</span>
                    </>
                  ) : (
                    <span>Save Item</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
