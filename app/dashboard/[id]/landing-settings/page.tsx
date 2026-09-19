"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "@/app/lib/utils/apiClient";
import { isImageUrl, validateHeroMediaUrl } from "@/app/lib/utils/media";
import Image from "next/image";
import Link from "next/link";
import {
  Trash2,
  Loader2,
  Layers,
  Check,
  Sparkles,
  LayoutTemplate,
  Palette,
  Grid3X3,
  Columns,
  ExternalLink,
  Save,
  RefreshCw,
  Sliders,
  Scissors,
  Dumbbell,
  Video,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShoppingBag,
  MapPin,
  Clock,
  Building2,
  Search,
  Phone,
} from "lucide-react";

export default function LandingSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [deletingTarget, setDeletingTarget] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Merchant & Company Metadata
  const [companyInfo, setCompanyInfo] = useState<{
    id: string;
    name: string;
    slug: string;
    industry: string;
    brandSubType?: string;
    activeTemplateId?: string;
    activeTemplateSlug?: string;
  } | null>(null);

  const [brandSubType, setBrandSubType] = useState<string>("tailor");

  // Template & Layout State
  const [activeTemplateSlug, setActiveTemplateSlug] = useState<string>("fashion-store-tailor-v1");
  const [availableTemplates, setAvailableTemplates] = useState<Array<{
    slug: string;
    name: string;
    industry: string;
    subType?: string;
    brandVibe: string;
    description?: string;
    thumbnailUrl?: string;
    theme: {
      primary: string;
      accent: string;
      background: string;
      surface?: string;
      gradients?: {
        supportsGradient: boolean;
        defaultGradient: string;
        presets: Array<{
          id: string;
          name: string;
          css: string;
          startColor: string;
          endColor: string;
          angle: number;
        }>;
      };
    };
    pagesCount: number;
    componentsCount: number;
    gridConstraints: {
      supportsGrid: boolean;
      minColumns: number;
      maxColumns: number;
      defaultColumns: number;
      allowedColumns: number[];
    };
  }>>([]);
  const [switchingTemplate, setSwitchingTemplate] = useState(false);
  const [templateSuccessMsg, setTemplateSuccessMsg] = useState<string | null>(null);
  const [templateErrorMsg, setTemplateErrorMsg] = useState<string | null>(null);

  // Grid Columns State (2, 3, or 4 columns)
  const [gridColumns, setGridColumns] = useState<number>(3);

  // Scoped Color & Gradient State
  const [colors, setColors] = useState({
    primary: "#1A1A1A",
    accent: "#C9A96E",
    background: "#F5F0EB",
  });
  const [activeGradientCss, setActiveGradientCss] = useState<string>("");
  const [gradientAngle, setGradientAngle] = useState<number>(135);

  // Industry-Specific Media & Store Location Form Data
  const [formData, setFormData] = useState({
    companyName: "",
    whatsappNumber: "",
    physicalAddress: "",
    city: "Lagos",
    state: "Lagos State",
    country: "Nigeria",
    openingHours: "Mo-Sa 09:00-18:00",
    heroVideoUrl: "",
    tailorBioImage: "",
    tailorBioText: "",
    heroGridImages: ["", "", "", ""],
    rawMaterialImages: ["", "", ""],
    showDefaultImages: true,
    appendDefaults: false,
    removeAllDefaults: false,
  });

  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);

  // Resolve Active Template Object
  const currentTemplate = useMemo(() => {
    return (
      availableTemplates.find((t) => t.slug === activeTemplateSlug) ||
      availableTemplates[0] ||
      null
    );
  }, [availableTemplates, activeTemplateSlug]);

  // Strictly isolate templates to the merchant's exact brand vertical (e.g. tailor, fitness)
  const brandFilteredTemplates = useMemo(() => {
    return availableTemplates.filter(
      (t) => (t.subType || "").toLowerCase() === brandSubType.toLowerCase()
    );
  }, [availableTemplates, brandSubType]);

  // Load Combined Company, Layout, and Landing Media Settings
  const loadAllSettings = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Fetch company & template settings
      const compRes = await api.get<{
        success?: boolean;
        company?: any;
        siteSetting?: any;
        currentGridColumns?: number;
        availableTemplates?: Array<any>;
      }>("/api/company/settings");

      if (compRes.data?.company) {
        setCompanyInfo(compRes.data.company);
        const resolvedSlug =
          compRes.data.company.activeTemplateSlug ||
          compRes.data.company.activeTemplateId ||
          (compRes.data.company.industry === "FITNESS_GYM"
            ? "gym-store-fitness-v1"
            : compRes.data.company.industry === "FASHION_BOUTIQUE"
            ? "fashion-store-boutique-v1"
            : "fashion-store-tailor-v1");
        setActiveTemplateSlug(resolvedSlug);
      }

      if ((compRes.data as any)?.brandSubType) {
        setBrandSubType((compRes.data as any).brandSubType);
      } else if (compRes.data?.company?.brandSubType) {
        setBrandSubType(compRes.data.company.brandSubType);
      }

      if (compRes.data?.availableTemplates) {
        setAvailableTemplates(compRes.data.availableTemplates);
      }

      if (compRes.data?.currentGridColumns) {
        setGridColumns(compRes.data.currentGridColumns);
      }

      if (compRes.data?.siteSetting) {
        const s = compRes.data.siteSetting;
        setColors({
          primary: s.primaryColor || "#1A1A1A",
          accent: s.accentColor || "#C9A96E",
          background: s.backgroundColor || "#F5F0EB",
        });
      }

      // 2. Fetch landing media assets
      const mediaRes = await api.get<{
        success?: boolean;
        siteSetting?: {
          heroVideoUrl?: string;
          tailorBioImage?: string;
          tailorBioText?: string;
          heroGridImages?: string[];
          rawMaterialImages?: string[];
          showDefaultImages?: boolean;
          appendDefaults?: boolean;
          removeAllDefaults?: boolean;
          primaryColor?: string;
          accentColor?: string;
          backgroundColor?: string;
        };
      }>("/api/user/settings");

      if (mediaRes.data?.siteSetting) {
        const s = mediaRes.data.siteSetting as any;
        setFormData({
          companyName: s.companyName || compRes.data?.company?.name || "",
          whatsappNumber: s.whatsappNumber || "",
          physicalAddress: s.physicalAddress || "",
          city: s.city || "Lagos",
          state: s.state || "Lagos State",
          country: s.country || "Nigeria",
          openingHours: s.openingHours || "Mo-Sa 09:00-18:00",
          heroVideoUrl: s.heroVideoUrl || "",
          tailorBioImage: s.tailorBioImage || "",
          tailorBioText: s.tailorBioText || "",
          heroGridImages:
            Array.isArray(s.heroGridImages) && s.heroGridImages.length === 4
              ? s.heroGridImages
              : ["", "", "", ""],
          rawMaterialImages:
            Array.isArray(s.rawMaterialImages) && s.rawMaterialImages.length === 3
              ? s.rawMaterialImages
              : ["", "", ""],
          showDefaultImages:
            typeof s.showDefaultImages === "boolean" ? s.showDefaultImages : true,
          appendDefaults:
            typeof s.appendDefaults === "boolean" ? s.appendDefaults : false,
          removeAllDefaults:
            typeof s.removeAllDefaults === "boolean" ? s.removeAllDefaults : false,
        });

        if (s.primaryColor) {
          setColors((prev) => ({
            ...prev,
            primary: s.primaryColor || prev.primary,
            accent: s.accentColor || prev.accent,
            background: s.backgroundColor || prev.background,
          }));
        }
      }
    } catch (err: unknown) {
      console.warn("Error loading settings:", err);
      setErrorMsg("Failed to load storefront settings from server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllSettings();
  }, [loadAllSettings]);

  // Handle Switching Master Template
  const handleSwitchTemplate = async (templateSlug: string) => {
    setSwitchingTemplate(true);
    setTemplateSuccessMsg(null);
    setTemplateErrorMsg(null);

    try {
      const res = await api.patch<{ success?: boolean; message?: string }>(
        "/api/company/settings",
        {
          templateSlug,
          resetPagesWithTemplate: true,
        }
      );

      if (res?.data?.success) {
        setActiveTemplateSlug(templateSlug);
        setTemplateSuccessMsg(
          `Storefront layout updated to "${templateSlug}". Theme colors & default pages synchronized!`
        );
        loadAllSettings();
      } else {
        throw new Error("Failed to update layout.");
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } }; message?: string };
      setTemplateErrorMsg(axiosErr?.response?.data?.error || "Failed to switch storefront layout.");
    } finally {
      setSwitchingTemplate(false);
    }
  };

  // Upload Asset to Cloudinary
  const handleUploadLandingAsset = async (
    file: File,
    targetKey: "heroVideo" | "tailorBioImage" | "heroGrid" | "rawMaterial",
    gridIndex?: number
  ) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    // STRICT VALIDATION: Hero must strictly be a video file. Images are rejected.
    if (targetKey === "heroVideo") {
      if (file.type.startsWith("image/") || !file.type.startsWith("video/")) {
        setErrorMsg("Hero background requires a video file (MP4, WebM). Images are strictly prohibited as hero background.");
        return;
      }
    } else {
      if (!file.type.startsWith("image/")) {
        setErrorMsg("Showcase and portrait media slots require an image file.");
        return;
      }
    }

    const targetId = gridIndex !== undefined ? `${targetKey}-${gridIndex}` : targetKey;
    const resourceType = targetKey === "heroVideo" ? "video" : "image";

    try {
      setUploadingTarget(targetId);

      const signRes = await api.post<{
        signature: string;
        timestamp: number;
        cloudName: string;
        apiKey: string;
        folder: string;
        resourceType?: string;
      }>("/api/cloudinary/sign", {
        targetKey,
        resourceType,
        fileType: file.type,
        fileSize: file.size,
      });

      if (!signRes?.data || !signRes.data.signature) {
        throw new Error("Failed to obtain upload signature.");
      }

      const { signature, timestamp, apiKey, cloudName, folder } = signRes.data;

      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("api_key", apiKey);
      uploadData.append("timestamp", timestamp.toString());
      uploadData.append("signature", signature);
      uploadData.append("folder", folder);

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

      const uploadReq = await fetch(cloudinaryUrl, {
        method: "POST",
        body: uploadData,
      });

      if (!uploadReq.ok) {
        const errJson = await uploadReq.json().catch(() => ({}));
        throw new Error(errJson.error?.message || "Cloudinary upload failed.");
      }

      const uploadedJson = await uploadReq.json();
      const secureUrl = uploadedJson.secure_url;

      if (!secureUrl) {
        throw new Error("No URL returned from upload server.");
      }

      setFormData((prev) => {
        if (targetKey === "heroVideo") return { ...prev, heroVideoUrl: secureUrl };
        if (targetKey === "tailorBioImage") return { ...prev, tailorBioImage: secureUrl };
        if (targetKey === "heroGrid" && gridIndex !== undefined) {
          const updatedGrid = [...prev.heroGridImages];
          updatedGrid[gridIndex] = secureUrl;
          return { ...prev, heroGridImages: updatedGrid };
        }
        if (targetKey === "rawMaterial" && gridIndex !== undefined) {
          const updatedRaw = [...prev.rawMaterialImages];
          updatedRaw[gridIndex] = secureUrl;
          return { ...prev, rawMaterialImages: updatedRaw };
        }
        return prev;
      });

      setSuccessMsg("Asset uploaded successfully! Click Save All Settings to persist.");
    } catch (err: unknown) {
      console.error("Asset upload error:", err);
      const msg = err instanceof Error ? err.message : "Upload failed.";
      setErrorMsg(msg);
    } finally {
      setUploadingTarget(null);
    }
  };

  // Delete Individual Media Asset
  const handleDeleteLandingAsset = async (
    targetKey: "heroVideo" | "tailorBioImage" | "heroGrid" | "rawMaterial",
    gridIndex?: number
  ) => {
    let urlToDelete = "";
    let resourceType: "image" | "video" = "image";
    const targetId = gridIndex !== undefined ? `${targetKey}-${gridIndex}` : targetKey;

    if (targetKey === "heroVideo") {
      urlToDelete = formData.heroVideoUrl;
      resourceType = "video";
    } else if (targetKey === "tailorBioImage") {
      urlToDelete = formData.tailorBioImage;
      resourceType = "image";
    } else if (targetKey === "heroGrid" && gridIndex !== undefined) {
      urlToDelete = formData.heroGridImages[gridIndex] || "";
      resourceType = "image";
    } else if (targetKey === "rawMaterial" && gridIndex !== undefined) {
      urlToDelete = formData.rawMaterialImages[gridIndex] || "";
      resourceType = "image";
    }

    if (!urlToDelete) return;

    if (!window.confirm("Delete this media asset and reset to default?")) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setDeletingTarget(targetId);

    try {
      const delRes = await api.post<{ success?: boolean; error?: string }>(
        "/api/media/delete",
        { url: urlToDelete, resourceType }
      );

      if (!delRes?.data?.success) {
        throw new Error(delRes?.data?.error || "Failed to delete asset.");
      }

      setFormData((prev) => {
        if (targetKey === "heroVideo") return { ...prev, heroVideoUrl: "" };
        if (targetKey === "tailorBioImage") return { ...prev, tailorBioImage: "" };
        if (targetKey === "heroGrid" && gridIndex !== undefined) {
          const updatedGrid = [...prev.heroGridImages];
          updatedGrid[gridIndex] = "";
          return { ...prev, heroGridImages: updatedGrid };
        }
        if (targetKey === "rawMaterial" && gridIndex !== undefined) {
          const updatedRaw = [...prev.rawMaterialImages];
          updatedRaw[gridIndex] = "";
          return { ...prev, rawMaterialImages: updatedRaw };
        }
        return prev;
      });

      setSuccessMsg("Asset removed! Click Save All Settings to commit.");
    } catch (err: unknown) {
      console.error("Deletion error:", err);
      const msg = err instanceof Error ? err.message : "Failed to delete asset.";
      setErrorMsg(msg);
    } finally {
      setDeletingTarget(null);
    }
  };

  // Save All Settings (Colors, Grid columns, and Media slots)
  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    // Validate that hero video is not an image URL
    if (formData.heroVideoUrl && formData.heroVideoUrl.trim() !== "") {
      const heroCheck = validateHeroMediaUrl(formData.heroVideoUrl);
      if (!heroCheck.valid) {
        setErrorMsg(heroCheck.error || "Hero background must strictly be a video (MP4, WebM).");
        setSaving(false);
        return;
      }
    }

    try {
      // 1. Save Company Layout, Theme colors & Grid Columns
      await api.patch("/api/company/settings", {
        primaryColor: colors.primary,
        accentColor: colors.accent,
        backgroundColor: colors.background,
        gridColumns,
      });

      // 2. Save Media slots to /api/user/settings
      await api.put("/api/user/settings", {
        ...formData,
        primaryColor: colors.primary,
        accentColor: colors.accent,
        backgroundColor: colors.background,
      });

      setSuccessMsg("All storefront settings, colors, and layout rules saved successfully!");
    } catch (err: any) {
      console.error("Save error:", err);
      const apiMsg = err?.response?.data?.error || (err instanceof Error ? err.message : null);
      setErrorMsg(apiMsg || "Failed to save storefront settings.");
    } finally {
      setSaving(false);
    }
  };

  // Reset Media Settings
  const handleResetSettings = async () => {
    if (!window.confirm("Reset all custom uploaded media to platform defaults?")) return;

    setResetting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await api.post<{ success?: boolean; message?: string }>(
        "/api/user/settings/reset",
        {},
        { timeout: 30000 }
      );
      if (res?.data?.success) {
        setSuccessMsg(res.data.message || "Reset complete! Defaults restored.");
        setFormData((prev) => ({
          ...prev,
          heroVideoUrl: "",
          tailorBioImage: "",
          tailorBioText: "",
          heroGridImages: ["", "", "", ""],
          rawMaterialImages: ["", "", ""],
          showDefaultImages: true,
          appendDefaults: false,
          removeAllDefaults: false,
        }));
      }
    } catch (err: unknown) {
      console.error("Reset error:", err);
      setErrorMsg("Failed to reset settings.");
    } finally {
      setResetting(false);
    }
  };

  const isGymTemplate =
    activeTemplateSlug.startsWith("gym-") ||
    brandSubType === "fitness" ||
    companyInfo?.industry === "FITNESS_GYM";

  const isBoutiqueTemplate =
    activeTemplateSlug.includes("boutique") ||
    brandSubType === "boutique" ||
    companyInfo?.industry === "FASHION_BOUTIQUE";

  const isTailorTemplate = !isGymTemplate && !isBoutiqueTemplate;

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto text-white space-y-8 animate-fadeIn">
      {/* ========================================================================= */}
      {/* 1. HEADER & ACTIVE STOREFRONT STATUS                                      */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#C9A96E]">
              Storefront Architecture Studio
            </span>
            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-white/10 text-zinc-300">
              {companyInfo?.industry === "FITNESS_GYM" ? "Fitness & Gym" : "Fashion & Atelier"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {companyInfo?.name || "Merchant Storefront"}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Configure your active master template, responsive grid amounts, theme colors & gradients.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/"
            target="_blank"
            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <span>View Live Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={loadAllSettings}
            disabled={loading}
            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 rounded-lg border border-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#C9A96E]" : ""}`} />
            <span>Sync</span>
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving || loading}
            className="px-4 py-2 bg-[#C9A96E] hover:bg-white text-black text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-all shadow-lg shadow-[#C9A96E]/20 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Saving Changes..." : "Save All Settings"}</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-950/40 border border-red-500/40 text-red-300 text-xs rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MASTER TEMPLATE SWITCHER (ATELIER VS. GYM)                              */}
      {/* ========================================================================= */}
      <div className="p-6 bg-[#141418] border border-zinc-800 rounded-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C9A96E]/15 border border-[#C9A96E]/30 flex items-center justify-center text-[#C9A96E]">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Storefront Layout & Active Template
              </h2>
              <p className="text-xs text-zinc-400">
                Choose the structural vibe that governs your store's sections, typography, and customer experience.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#C9A96E]/15 text-[#C9A96E] border border-[#C9A96E]/30 self-start sm:self-auto">
            Active: {activeTemplateSlug}
          </span>
        </div>

        {templateSuccessMsg && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs rounded-lg">
            {templateSuccessMsg}
          </div>
        )}
        {templateErrorMsg && (
          <div className="p-3 bg-red-950/40 border border-red-500/40 text-red-300 text-xs rounded-lg">
            {templateErrorMsg}
          </div>
        )}

        {/* Brand Vertical Isolation Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-accent,#C9A96E)]/15 border border-[var(--color-accent,#C9A96E)]/30 flex items-center justify-center text-[var(--color-accent,#C9A96E)] shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Storefront Template Component</h3>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-white/10 text-zinc-300">
                  {brandSubType === "fitness" ? "Fitness & Gym" : "Tailor Atelier"}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Each template is a self-contained storefront component. Template switching is strictly limited to templates designed for your brand.
              </p>
            </div>
          </div>
          <span className="text-[10px] text-zinc-400 uppercase tracking-widest px-3 py-1 rounded-md bg-black/40 border border-zinc-800 self-start sm:self-auto shrink-0">
            {brandFilteredTemplates.length} Registered for {brandSubType === "fitness" ? "Gym" : "Tailor"}
          </span>
        </div>

        {brandFilteredTemplates.length <= 1 ? (
          <div className="space-y-4">
            <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center gap-3 text-xs text-zinc-300">
              <Sparkles className="w-4 h-4 text-[var(--color-accent,#C9A96E)] shrink-0" />
              <span>
                Currently active default template for your <strong>{brandSubType === "fitness" ? "Fitness & Gym" : "Tailor Atelier"}</strong> brand. When additional templates are created for your brand vertical, they will automatically appear here for 1-click switching.
              </span>
            </div>

            {/* Single Active Template Component Showcase */}
            {brandFilteredTemplates.map((tpl) => {
              const cardThumb =
                tpl.thumbnailUrl ||
                (tpl.subType === "fitness" || tpl.industry === "FITNESS_GYM"
                  ? "/bg-img/showcase2.jpeg"
                  : "/bg-img/showcase1.jpg");

              return (
                <div
                  key={tpl.slug}
                  className="max-w-xl rounded-2xl p-5 border bg-[#1A1A22] border-[var(--color-accent,#C9A96E)] shadow-xl shadow-[var(--color-accent,#C9A96E)]/10 ring-1 ring-[var(--color-accent,#C9A96E)]/50 space-y-4"
                >
                  <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-black border border-white/5">
                    <Image
                      src={cardThumb}
                      alt={tpl.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase text-[var(--color-accent,#C9A96E)]">
                      {tpl.subType === "fitness" ? (
                        <>
                          <Dumbbell className="w-3.5 h-3.5" />
                          <span>Fitness & Gym</span>
                        </>
                      ) : (
                        <>
                          <Scissors className="w-3.5 h-3.5" />
                          <span>Tailor Atelier</span>
                        </>
                      )}
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold uppercase">
                      <Check className="w-3.5 h-3.5 stroke-[3]" /> Active Template Component
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white">{tpl.name}</h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      {tpl.description ||
                        (tpl.subType === "fitness"
                          ? "High-energy athletic conditioning, strength training, and fitness facility template with membership tiers, coach profiles, and WhatsApp bookings."
                          : "Flagship luxury African bespoke fashion atelier template featuring cinematic GSAP scrolling, lookbook catalog, and WhatsApp concierge.")}
                    </p>
                  </div>

                  {/* Template Specs */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/60 text-center">
                    <div className="p-2 bg-white/5 rounded-lg">
                      <span className="text-[10px] text-zinc-500 block uppercase">Pages</span>
                      <span className="text-xs font-bold text-zinc-300">{tpl.pagesCount} Core</span>
                    </div>
                    <div className="p-2 bg-white/5 rounded-lg">
                      <span className="text-[10px] text-zinc-500 block uppercase">Grid Limit</span>
                      <span className="text-xs font-bold text-zinc-300">2–4 Cols</span>
                    </div>
                    <div className="p-2 bg-white/5 rounded-lg flex flex-col items-center justify-center">
                      <span className="text-[10px] text-zinc-500 block uppercase">Palette</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{ backgroundColor: tpl.theme.primary }}
                          title={`Primary: ${tpl.theme.primary}`}
                        />
                        <span
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{ backgroundColor: tpl.theme.accent }}
                          title={`Accent: ${tpl.theme.accent}`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider rounded-xl bg-zinc-800 text-emerald-400 flex items-center justify-center gap-2 border border-emerald-500/20">
                      <Check className="w-4 h-4 stroke-[3]" /> Currently Active
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Dynamic Grid of Available Brand Templates (When more than 1 exist for this brand) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {brandFilteredTemplates.map((tpl) => {
              const isActive = activeTemplateSlug === tpl.slug;
              const cardThumb =
                tpl.thumbnailUrl ||
                (tpl.subType === "fitness" || tpl.industry === "FITNESS_GYM"
                  ? "/bg-img/showcase2.jpeg"
                  : "/bg-img/showcase1.jpg");

              return (
                <div
                  key={tpl.slug}
                  className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                    isActive
                      ? "bg-[#1A1A22] border-[var(--color-accent,#C9A96E)] shadow-xl shadow-[var(--color-accent,#C9A96E)]/10 ring-1 ring-[var(--color-accent,#C9A96E)]/50"
                      : "bg-black/30 border-zinc-800/80 hover:border-zinc-700"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-black border border-white/5">
                      <Image
                        src={cardThumb}
                        alt={tpl.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase text-[var(--color-accent,#C9A96E)]">
                        {tpl.subType === "fitness" ? (
                          <>
                            <Dumbbell className="w-3.5 h-3.5" />
                            <span>Fitness & Gym</span>
                          </>
                        ) : (
                          <>
                            <Scissors className="w-3.5 h-3.5" />
                            <span>Tailor Atelier</span>
                          </>
                        )}
                      </div>
                      {isActive && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold uppercase">
                          <Check className="w-3.5 h-3.5 stroke-[3]" /> Active
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-white">{tpl.name}</h4>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                        {tpl.description ||
                          (tpl.subType === "fitness"
                            ? "High-energy athletic conditioning, strength training, and fitness facility template with membership tiers, coach profiles, and WhatsApp bookings."
                            : "Flagship luxury African bespoke fashion atelier template featuring cinematic GSAP scrolling, lookbook catalog, and WhatsApp concierge.")}
                      </p>
                    </div>

                    {/* Template Specs */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/60 text-center">
                      <div className="p-2 bg-white/5 rounded-lg">
                        <span className="text-[10px] text-zinc-500 block uppercase">Pages</span>
                        <span className="text-xs font-bold text-zinc-300">{tpl.pagesCount} Core</span>
                      </div>
                      <div className="p-2 bg-white/5 rounded-lg">
                        <span className="text-[10px] text-zinc-500 block uppercase">Grid Limit</span>
                        <span className="text-xs font-bold text-zinc-300">2–4 Cols</span>
                      </div>
                      <div className="p-2 bg-white/5 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-[10px] text-zinc-500 block uppercase">Palette</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span
                            className="w-3 h-3 rounded-full border border-white/20"
                            style={{ backgroundColor: tpl.theme.primary }}
                            title={`Primary: ${tpl.theme.primary}`}
                          />
                          <span
                            className="w-3 h-3 rounded-full border border-white/20"
                            style={{ backgroundColor: tpl.theme.accent }}
                            title={`Accent: ${tpl.theme.accent}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5">
                    <button
                      type="button"
                      disabled={switchingTemplate || isActive}
                      onClick={() => handleSwitchTemplate(tpl.slug)}
                      className={`w-full py-3 px-4 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
                        isActive
                          ? "bg-zinc-800 text-zinc-400 cursor-default"
                          : "bg-[var(--color-accent,#C9A96E)] hover:bg-white text-black cursor-pointer shadow-lg shadow-[var(--color-accent,#C9A96E)]/20"
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" /> Currently Active
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" /> Switch to {tpl.name}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. RESPONSIVE GRID LAYOUT CONTROLLER (2, 3, OR 4 COLUMNS)                */}
      {/* ========================================================================= */}
      <div className="p-6 bg-[#141418] border border-zinc-800 rounded-2xl space-y-6">
        <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-4">
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Columns className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Component Grid Amount & Responsive Guardrail
            </h2>
            <p className="text-xs text-zinc-400">
              Configure how many product or showcase cards display per row on desktop (Min: 2, Max: 4).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Column Toggle Options */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase text-zinc-300 block">
              Select Desktop Grid Layout
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[2, 3, 4].map((cols) => (
                <button
                  key={cols}
                  type="button"
                  onClick={() => setGridColumns(cols)}
                  className={`p-3 rounded-xl border text-center font-bold text-sm transition-all cursor-pointer ${
                    gridColumns === cols
                      ? "bg-[#C9A96E]/20 border-[#C9A96E] text-white shadow-lg shadow-[#C9A96E]/10"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <span className="block text-base">{cols}</span>
                  <span className="text-[10px] text-zinc-400 block font-normal">Columns</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
              Mobile screens automatically collapse to single column cards so your imagery stays sharp and unobstructed.
            </p>
          </div>

          {/* Visual Grid Layout Representation */}
          <div className="lg:col-span-2 p-5 bg-black/40 border border-zinc-800/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-2">
              <span className="font-semibold uppercase tracking-wider">
                Live Layout Preview ({gridColumns} Columns)
              </span>
              <span className="text-emerald-400 font-bold">Responsive Validated</span>
            </div>
            <div
              className={`grid gap-2.5 transition-all duration-300 ${
                gridColumns === 2
                  ? "grid-cols-2"
                  : gridColumns === 4
                  ? "grid-cols-4"
                  : "grid-cols-3"
              }`}
            >
              {Array.from({ length: gridColumns * 2 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 rounded-lg bg-zinc-800/60 border border-zinc-700/40 flex flex-col items-center justify-center text-[10px] text-zinc-400 font-mono transition-all"
                >
                  <span className="font-bold text-zinc-300">Item #{i + 1}</span>
                  <span className="text-[9px] text-zinc-500">1/{gridColumns} width</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. TEMPLATE-SCOPED COLOR & GRADIENT STUDIO                                */}
      {/* ========================================================================= */}
      <div className="p-6 bg-[#141418] border border-zinc-800 rounded-2xl space-y-6">
        <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-4">
          <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Template Color Palette & Gradient Studio
            </h2>
            <p className="text-xs text-zinc-400">
              Customize primary brand colors, accent highlights, or apply template-scoped gradient presets.
            </p>
          </div>
        </div>

        {/* Color Hex & Native Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Primary Color */}
          <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-2">
            <span className="text-[11px] font-bold uppercase text-zinc-400 block">
              Primary Brand
            </span>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={colors.primary}
                onChange={(e) => setColors((prev) => ({ ...prev, primary: e.target.value }))}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={colors.primary}
                onChange={(e) => setColors((prev) => ({ ...prev, primary: e.target.value }))}
                className="flex-1 px-3 py-2 bg-black border border-zinc-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#C9A96E]"
              />
            </div>
          </div>

          {/* Accent Color */}
          <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-2">
            <span className="text-[11px] font-bold uppercase text-zinc-400 block">
              Accent Highlight
            </span>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={colors.accent}
                onChange={(e) => setColors((prev) => ({ ...prev, accent: e.target.value }))}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={colors.accent}
                onChange={(e) => setColors((prev) => ({ ...prev, accent: e.target.value }))}
                className="flex-1 px-3 py-2 bg-black border border-zinc-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#C9A96E]"
              />
            </div>
          </div>

          {/* Background Color */}
          <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-2">
            <span className="text-[11px] font-bold uppercase text-zinc-400 block">
              Store Background
            </span>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={colors.background}
                onChange={(e) => setColors((prev) => ({ ...prev, background: e.target.value }))}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={colors.background}
                onChange={(e) => setColors((prev) => ({ ...prev, background: e.target.value }))}
                className="flex-1 px-3 py-2 bg-black border border-zinc-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#C9A96E]"
              />
            </div>
          </div>
        </div>

        {/* Template Gradient Presets */}
        {currentTemplate?.theme?.gradients?.presets && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase text-zinc-300 block">
                Template Gradient Presets ({currentTemplate.name})
              </label>
              <span className="text-[11px] text-zinc-400">Click preset to apply</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {currentTemplate.theme.gradients.presets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setActiveGradientCss(preset.css);
                    setColors((prev) => ({
                      ...prev,
                      primary: preset.startColor,
                      accent: preset.endColor,
                    }));
                  }}
                  className="p-3 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-black/40 text-left space-y-2 transition-all cursor-pointer group"
                >
                  <div
                    className="h-10 w-full rounded-lg border border-white/10 group-hover:scale-105 transition-transform"
                    style={{ background: preset.css }}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">{preset.name}</span>
                    <span className="text-[10px] text-zinc-500">{preset.angle}°</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Gradient Angle Slider & Preview */}
            <div className="p-4 bg-black/40 border border-zinc-800/80 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-300">
                <span className="font-semibold uppercase tracking-wider">Dynamic Angle Slider</span>
                <span className="font-mono text-[#C9A96E]">{gradientAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={gradientAngle}
                onChange={(e) => {
                  const angle = Number(e.target.value);
                  setGradientAngle(angle);
                  setActiveGradientCss(
                    `linear-gradient(${angle}deg, ${colors.primary} 0%, ${colors.accent} 100%)`
                  );
                }}
                className="w-full accent-[#C9A96E] cursor-pointer"
              />
              <div
                className="h-12 w-full rounded-lg border border-white/10 flex items-center justify-center text-xs font-bold uppercase tracking-widest text-white shadow-inner"
                style={{
                  background:
                    activeGradientCss ||
                    `linear-gradient(${gradientAngle}deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
                }}
              >
                Active Gradient Preview
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. INDUSTRY-SPECIFIC CONTENT & MEDIA CUSTOMIZATION                        */}
      {/* ========================================================================= */}
      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* Store Physical Location & Google SEO Grounding */}
        <div className="p-6 bg-[#141418] border border-zinc-800 rounded-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-4">
            <div className="w-9 h-9 rounded-xl bg-[#C9A96E]/15 border border-[#C9A96E]/30 flex items-center justify-center text-[#C9A96E]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Store Physical Location & Local SEO Grounding
              </h2>
              <p className="text-xs text-zinc-400">
                Crawlers (Googlebot, Bingbot) index these real database details for queries like &quot;best tailor in nigeria&quot; and &quot;gym around lagos&quot;.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Brand Display Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#C9A96E]" />
                <span>Brand Display Name</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Atelier Adeleke"
                value={formData.companyName}
                onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                className="w-full px-4 py-2.5 bg-black/50 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#C9A96E]"
              />
            </div>

            {/* WhatsApp Business Contact */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-[#C9A96E]" />
                <span>WhatsApp Business Contact</span>
              </label>
              <input
                type="tel"
                placeholder="e.g. 09065440424 or +234..."
                value={formData.whatsappNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
                className="w-full px-4 py-2.5 bg-black/50 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#C9A96E]"
              />
            </div>

            {/* Physical Address */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#C9A96E]" />
                <span>Workshop / Gym Physical Address</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Plot 14 Admiralty Way, Lekki Phase 1"
                value={formData.physicalAddress}
                onChange={(e) => setFormData((prev) => ({ ...prev, physicalAddress: e.target.value }))}
                className="w-full px-4 py-2.5 bg-black/50 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#C9A96E]"
              />
            </div>

            {/* Opening Hours */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#C9A96E]" />
                <span>Business Opening Hours</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Mo-Sa 09:00-18:00 (Mon - Sat: 9:00 AM - 6:00 PM)"
                value={formData.openingHours}
                onChange={(e) => setFormData((prev) => ({ ...prev, openingHours: e.target.value }))}
                className="w-full px-4 py-2.5 bg-black/50 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#C9A96E]"
              />
            </div>

            {/* City & State */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 block">City / Town</label>
              <input
                type="text"
                placeholder="e.g. Lagos, Ikeja, Abuja"
                value={formData.city}
                onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                className="w-full px-4 py-2.5 bg-black/50 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#C9A96E]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 block">State</label>
              <input
                type="text"
                placeholder="e.g. Lagos State, FCT, Rivers"
                value={formData.state}
                onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                className="w-full px-4 py-2.5 bg-black/50 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#C9A96E]"
              />
            </div>
          </div>

        </div>

        <div className="p-6 bg-[#141418] border border-zinc-800 rounded-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                {isGymTemplate
                  ? "Gym & Equipment Media Showcase"
                  : isBoutiqueTemplate
                  ? "Fashion House & Runway Media Showcase"
                  : "Bespoke Tailoring & Lookbook Media"}
              </h2>
              <p className="text-xs text-zinc-400">
                {isGymTemplate
                  ? "Upload photos of training facilities, barbells, trainer portrait, and virtual tour video."
                  : isBoutiqueTemplate
                  ? "Upload runway drops, creative director portrait, luxury textiles, and collection video."
                  : "Upload bespoke garment photos, tailor portrait, fabrics, and hero video."}
              </p>
            </div>
          </div>

          {/* Hero Video Slot - Strictly Video */}
          <div className="space-y-3 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Video className="w-4 h-4 text-[#C9A96E]" />
                <span>
                  {isGymTemplate
                    ? "Gym Virtual Tour Video"
                    : isBoutiqueTemplate
                    ? "Runway / Campaign Video"
                    : "Hero Background Video"}
                </span>
                <span className="text-[10px] text-zinc-500 font-normal uppercase tracking-wider ml-1">
                  (Strictly Video • MP4/WebM)
                </span>
              </label>

              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-medium rounded-lg cursor-pointer transition-colors border border-zinc-700 w-fit">
                {uploadingTarget === "heroVideo" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C9A96E]" />
                ) : (
                  <Upload className="w-3.5 h-3.5 text-[#C9A96E]" />
                )}
                <span>{uploadingTarget === "heroVideo" ? "Uploading Video..." : "Upload Hero Video"}</span>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/*"
                  disabled={uploadingTarget === "heroVideo"}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadLandingAsset(file, "heroVideo");
                  }}
                />
              </label>
            </div>

            <p className="text-[11px] text-zinc-400">
              The hero section exclusively renders high-definition looping video. Image files and image URLs are strictly rejected.
            </p>

            {/* Video Preview Player */}
            {formData.heroVideoUrl && !isImageUrl(formData.heroVideoUrl) && (
              <div className="relative rounded-xl overflow-hidden bg-black border border-zinc-800 max-w-lg">
                <video
                  src={formData.heroVideoUrl}
                  controls
                  playsInline
                  muted
                  className="w-full h-48 object-cover bg-black"
                />
                <div className="p-3 flex items-center justify-between bg-zinc-900/90 border-t border-zinc-800">
                  <div className="flex items-center gap-2 overflow-hidden mr-3">
                    <Video className="w-3.5 h-3.5 text-[#C9A96E] shrink-0" />
                    <span className="text-zinc-400 font-mono text-[11px] truncate">
                      {formData.heroVideoUrl}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteLandingAsset("heroVideo")}
                    disabled={deletingTarget === "heroVideo"}
                    className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-medium shrink-0 cursor-pointer transition-colors disabled:opacity-50"
                  >
                    {deletingTarget === "heroVideo" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    <span>{deletingTarget === "heroVideo" ? "Deleting..." : "Delete Video"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Image Rejection Warning if user entered an image URL */}
            {formData.heroVideoUrl && isImageUrl(formData.heroVideoUrl) && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-200">Image URL Detected & Prohibited</p>
                  <p className="text-red-400/90 text-[11px] mt-0.5">
                    The hero section strictly requires video media. Images cannot be used as hero background media. Please upload or link an MP4 or WebM video file.
                  </p>
                </div>
              </div>
            )}

            {/* URL Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-400">
                Or paste a direct Video URL (MP4 / WebM):
              </label>
              <input
                type="url"
                placeholder="https://res.cloudinary.com/.../video/upload/v1/video.mp4"
                value={formData.heroVideoUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, heroVideoUrl: e.target.value }))}
                className="w-full px-4 py-2.5 bg-black/50 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#C9A96E]"
              />
            </div>
          </div>

          {/* Bio Section: Tailor vs. Head Coach vs. Fashion House Director */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 block">
                {isGymTemplate
                  ? "Head Coach / Trainer Portrait"
                  : isBoutiqueTemplate
                  ? "Creative Director / Head of Maison Portrait"
                  : "Lead Tailor / Designer Portrait"}
              </label>
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-black border border-zinc-800 shrink-0">
                  {formData.tailorBioImage ? (
                    <Image
                      src={formData.tailorBioImage}
                      alt="Bio"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
                      <ImageIcon className="w-6 h-6" />
                      <span className="text-[10px] mt-1">Empty</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 rounded-lg cursor-pointer transition-colors border border-zinc-700">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Portrait</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadLandingAsset(file, "tailorBioImage");
                      }}
                    />
                  </label>
                  {formData.tailorBioImage && (
                    <button
                      type="button"
                      onClick={() => handleDeleteLandingAsset("tailorBioImage")}
                      disabled={deletingTarget === "tailorBioImage"}
                      className="text-[11px] text-red-400 hover:text-red-300 block cursor-pointer"
                    >
                      Delete Portrait
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 block">
                {isGymTemplate
                  ? "Training Philosophy & Coach Bio"
                  : isBoutiqueTemplate
                  ? "Maison Heritage & Design Philosophy"
                  : "Artisan Philosophy & Bio Text"}
              </label>
              <textarea
                rows={4}
                value={formData.tailorBioText}
                onChange={(e) => setFormData((prev) => ({ ...prev, tailorBioText: e.target.value }))}
                placeholder={
                  isGymTemplate
                    ? "Our coaching methodology builds functional power, athletic resilience, and peak longevity..."
                    : isBoutiqueTemplate
                    ? "Maison haute couture ready-to-wear exploring sculptural African silhouettes..."
                    : "Every bespoke garment is crafted with ancestral African stitching precision..."
                }
                className="w-full p-3 bg-black/50 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#C9A96E]"
              />
            </div>
          </div>

          {/* 4 Showcase Grid Images */}
          <div className="space-y-3 pt-4 border-t border-zinc-800/60">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300 block">
                {isGymTemplate
                  ? "Gym Equipment & Facility Showcase (4 Slots)"
                  : isBoutiqueTemplate
                  ? "Seasonal Runway & Ready-to-Wear Vitrine (4 Slots)"
                  : "Curated Lookbook Showcase Bento Grid (4 Slots)"}
              </label>
              <span className="text-[11px] text-zinc-500">
                Rendered across your {gridColumns}-column desktop layout
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {formData.heroGridImages.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black border border-zinc-800 group"
                >
                  {imgUrl ? (
                    <>
                      <Image
                        src={imgUrl}
                        alt={`Grid Slot ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteLandingAsset("heroGrid", idx)}
                        disabled={deletingTarget === `heroGrid-${idx}`}
                        className="absolute top-2 right-2 p-1.5 bg-red-950/80 hover:bg-red-800 text-red-300 rounded-lg backdrop-blur-sm cursor-pointer transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-zinc-900/60 transition-colors text-zinc-500">
                      <Upload className="w-4 h-4" />
                      <span className="text-[10px] font-medium">Slot #{idx + 1}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadLandingAsset(file, "heroGrid", idx);
                        }}
                      />
                    </label>
                  )}
                  {uploadingTarget === `heroGrid-${idx}` && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-xs text-white">
                      <Loader2 className="w-5 h-5 animate-spin text-[#C9A96E]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Demo Fallback Toggles */}
          <div className="space-y-2 pt-4 border-t border-zinc-800/60">
            <label className="text-xs font-semibold text-zinc-300 block">
              Fallback & Catalog Display Rules
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-400">
                <input
                  type="checkbox"
                  checked={formData.showDefaultImages}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, showDefaultImages: e.target.checked }))
                  }
                  className="w-4 h-4 rounded border-zinc-700 bg-black text-[#C9A96E] focus:ring-0"
                />
                <span>Show curated template demo assets when custom slots are empty</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-400">
                <input
                  type="checkbox"
                  checked={formData.appendDefaults}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, appendDefaults: e.target.checked }))
                  }
                  className="w-4 h-4 rounded border-zinc-700 bg-black text-[#C9A96E] focus:ring-0"
                />
                <span>Append custom uploads alongside platform collection defaults</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-800">
          <button
            type="button"
            onClick={handleResetSettings}
            disabled={resetting || saving || loading}
            className="px-4 py-2.5 bg-red-950/40 hover:bg-red-900/40 border border-red-800/50 text-xs text-red-300 rounded-xl cursor-pointer transition-colors"
          >
            {resetting ? "Resetting Media..." : "Reset Media to Platform Defaults"}
          </button>

          <button
            type="submit"
            disabled={saving || loading}
            className="w-full sm:w-auto px-6 py-3 bg-[#C9A96E] hover:bg-white text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-[#C9A96E]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving All Changes..." : "Save All Storefront Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
