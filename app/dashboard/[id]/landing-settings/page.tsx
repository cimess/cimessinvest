"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/app/lib/utils/apiClient";
import Image from "next/image";
import { Trash2, Loader2 } from "lucide-react";

export default function LandingSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [deletingTarget, setDeletingTarget] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
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

  const loadLandingSettings = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.get<{
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
        };
      }>("/api/user/settings");

      if (res && res.data?.siteSetting) {
        const s = res.data.siteSetting;
        setFormData({
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
      }
    } catch (err: unknown) {
      console.warn("Could not load landing page settings:", err);
      setErrorMsg("Failed to load settings from server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadData = setTimeout(() => {
      loadLandingSettings();
    }, 300);
    return () => clearTimeout(loadData);
  }, [loadLandingSettings]);

  const handleUploadLandingAsset = async (
    file: File,
    targetKey: "heroVideo" | "tailorBioImage" | "heroGrid" | "rawMaterial",
    gridIndex?: number
  ) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const isVideo = file.type.startsWith("video/");
    const targetId = gridIndex !== undefined ? `${targetKey}-${gridIndex}` : targetKey;

    try {
      setUploadingTarget(targetId);

      const signRes = await api.post<{
        signature: string;
        timestamp: number;
        cloudName: string;
        apiKey: string;
        folder: string;
      }>("/api/cloudinary/sign", {
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

      const resourceType = isVideo ? "video" : "image";
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

      setSuccessMsg("Uploaded! Click Save Settings to apply.");
    } catch (err: unknown) {
      console.error("Asset upload error:", err);
      const msg = err instanceof Error ? err.message : "Upload failed.";
      setErrorMsg(msg);
    } finally {
      setUploadingTarget(null);
    }
  };

  /**
   * Delete an individual uploaded asset via /api/media/delete route
   */
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

    if (
      !window.confirm(
        "Are you sure you want to delete this specific media file from Cloudinary and reset this slot to default?"
      )
    ) {
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setDeletingTarget(targetId);

    try {
      // Call unified /api/media/delete route
      const delRes = await api.post<{ success?: boolean; error?: string }>(
        "/api/media/delete",
        { url: urlToDelete, resourceType }
      );

      if (!delRes?.data?.success) {
        throw new Error(delRes?.data?.error || "Failed to delete asset from Cloudinary.");
      }

      // Update state slot
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

      setSuccessMsg("Asset deleted! Click Save Settings to persist changes.");
    } catch (err: unknown) {
      console.error("Individual deletion error:", err);
      const msg = err instanceof Error ? err.message : "Failed to delete asset.";
      setErrorMsg(msg);
    } finally {
      setDeletingTarget(null);
    }
  };

  const handleSaveLandingSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await api.put<{
        success?: boolean;
        siteSetting?: Record<string, unknown>;
      }>("/api/user/settings", formData);

      if (res?.data && (res.data.success || res.data.siteSetting)) {
        setSuccessMsg("Landing settings saved successfully!");
      } else {
        throw new Error("Server responded with error.");
      }
    } catch (err: unknown) {
      console.error("Error saving settings:", err);
      setErrorMsg("Failed to save landing page settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete all uploaded landing media (hero video, grid images, bio photo, raw materials) from cloud storage and reset settings to default?"
      )
    ) {
      return;
    }

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
        setSuccessMsg(
          res.data.message ||
            "Reset complete! All custom media deleted from cloud storage."
        );
        setFormData({
          heroVideoUrl: "",
          tailorBioImage: "",
          tailorBioText: "",
          heroGridImages: ["", "", "", ""],
          rawMaterialImages: ["", "", ""],
          showDefaultImages: true,
          appendDefaults: false,
          removeAllDefaults: false,
        });
      } else {
        throw new Error("Failed to reset settings.");
      }
    } catch (err: unknown) {
      console.error("Reset error:", err);
      setErrorMsg("Failed to reset settings to defaults.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl text-white space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-xl font-bold">Landing Page Settings</h1>
          <p className="text-xs text-gray-400">Configure media links, grid images, and catalog rules.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadLandingSettings}
            disabled={loading || resetting}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs text-gray-200 rounded border border-gray-700 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Loading..." : "Reload"}
          </button>
          <button
            type="button"
            onClick={handleResetSettings}
            disabled={resetting || loading || saving}
            className="px-3 py-1.5 bg-red-950 hover:bg-red-900 border border-red-800 text-xs text-red-300 rounded cursor-pointer disabled:opacity-50"
          >
            {resetting ? "Resetting & Deleting Cloud Files..." : "Reset All to Default"}
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-3 bg-green-900/40 border border-green-700 text-green-300 text-xs rounded">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-red-900/40 border border-red-700 text-red-300 text-xs rounded">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSaveLandingSettings} className="space-y-6">
        {/* Section 1: Hero & Bio Media */}
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded space-y-4">
          <h2 className="text-sm font-semibold text-gray-200 border-b border-zinc-800 pb-2">
            Hero & Tailor Bio Media
          </h2>

          {/* Hero Video */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs text-gray-400 font-medium">Hero Video URL</label>
              {formData.heroVideoUrl && (
                <button
                  type="button"
                  onClick={() => handleDeleteLandingAsset("heroVideo")}
                  disabled={deletingTarget === "heroVideo"}
                  className="px-2.5 py-1 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 text-xs rounded cursor-pointer disabled:opacity-50 flex items-center gap-1"
                >
                  {deletingTarget === "heroVideo" ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                  <span>Delete Video</span>
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder="Paste video URL"
              value={formData.heroVideoUrl}
              onChange={(e) => setFormData({ ...formData, heroVideoUrl: e.target.value })}
              className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
            />
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-gray-500">Upload Video File:</span>
              <input
                type="file"
                accept="video/*"
                disabled={uploadingTarget === "heroVideo"}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUploadLandingAsset(f, "heroVideo");
                }}
                className="text-xs text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-zinc-800 file:text-gray-200 hover:file:bg-zinc-700 cursor-pointer"
              />
              {uploadingTarget === "heroVideo" && <span className="text-xs text-yellow-500">Uploading...</span>}
            </div>
            {formData.heroVideoUrl && (
              <p className="text-[11px] text-zinc-500 truncate pt-1">Current: {formData.heroVideoUrl}</p>
            )}
          </div>

          {/* Tailor Bio Image & Text */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs text-gray-400 font-medium">Tailor Bio Image URL</label>
                {formData.tailorBioImage && (
                  <button
                    type="button"
                    onClick={() => handleDeleteLandingAsset("tailorBioImage")}
                    disabled={deletingTarget === "tailorBioImage"}
                    className="px-2.5 py-1 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 text-xs rounded cursor-pointer disabled:opacity-50 flex items-center gap-1"
                  >
                    {deletingTarget === "tailorBioImage" ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                    <span>Delete Image</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="Paste image URL"
                value={formData.tailorBioImage}
                onChange={(e) => setFormData({ ...formData, tailorBioImage: e.target.value })}
                className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
              />
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-gray-500">Upload Image:</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingTarget === "tailorBioImage"}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUploadLandingAsset(f, "tailorBioImage");
                  }}
                  className="text-xs text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-zinc-800 file:text-gray-200 hover:file:bg-zinc-700 cursor-pointer"
                />
                {uploadingTarget === "tailorBioImage" && <span className="text-xs text-yellow-500">Uploading...</span>}
              </div>
              {formData.tailorBioImage && (
                <div className="flex items-center gap-2 pt-1">
                  <Image src={formData.tailorBioImage} alt="Bio Preview" width={32} height={32} className="object-cover rounded border border-zinc-800" />
                  <p className="text-[11px] text-zinc-500 truncate flex-1">{formData.tailorBioImage}</p>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-gray-400 font-medium">Tailor Bio Narrative Text</label>
              <textarea
                rows={3}
                value={formData.tailorBioText}
                onChange={(e) => setFormData({ ...formData, tailorBioText: e.target.value })}
                placeholder="Write tailor bio..."
                className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Hero Grid Images */}
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded space-y-4">
          <h2 className="text-sm font-semibold text-gray-200 border-b border-zinc-800 pb-2">
            Hero Showcase Grid Images (4 Slots)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((idx) => {
              const currentUrl = formData.heroGridImages[idx] || "";
              const isUploading = uploadingTarget === `heroGrid-${idx}`;
              const isDeleting = deletingTarget === `heroGrid-${idx}`;
              return (
                <div key={idx} className="p-2 bg-zinc-950 border border-zinc-800/80 rounded space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-400 font-medium">Grid Slot #{idx + 1}</label>
                      {currentUrl && (
                        <Image src={currentUrl} alt={`Slot ${idx+1}`} width={32} height={32} className="object-cover rounded border border-zinc-800" />
                      )}
                    </div>
                    {currentUrl && (
                      <button
                        type="button"
                        onClick={() => handleDeleteLandingAsset("heroGrid", idx)}
                        disabled={isDeleting}
                        className="px-2 py-1 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 text-xs rounded cursor-pointer disabled:opacity-50 flex items-center gap-1"
                      >
                        {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder={`Image URL for Slot #${idx + 1}`}
                    value={currentUrl}
                    onChange={(e) => {
                      const updated = [...formData.heroGridImages];
                      updated[idx] = e.target.value;
                      setFormData({ ...formData, heroGridImages: updated });
                    }}
                    className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-500">Choose File:</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploading}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUploadLandingAsset(f, "heroGrid", idx);
                      }}
                      className="text-xs text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-zinc-800 file:text-gray-200 hover:file:bg-zinc-700 cursor-pointer"
                    />
                    {isUploading && <span className="text-xs text-yellow-500">Uploading...</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Raw Materials */}
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded space-y-4">
          <h2 className="text-sm font-semibold text-gray-200 border-b border-zinc-800 pb-2">
            Raw Materials & Craftsmanship Gallery (3 Slots)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((idx) => {
              const currentUrl = formData.rawMaterialImages[idx] || "";
              const isUploading = uploadingTarget === `rawMaterial-${idx}`;
              const isDeleting = deletingTarget === `rawMaterial-${idx}`;
              return (
                <div key={idx} className="p-2 bg-zinc-950 border border-zinc-800/80 rounded space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-400 font-medium">Material #{idx + 1}</label>
                      {currentUrl && (
                        <Image src={currentUrl} alt={`Material ${idx+1}`} width={32} height={32} className="object-cover rounded border border-zinc-800" />
                      )}
                    </div>
                    {currentUrl && (
                      <button
                        type="button"
                        onClick={() => handleDeleteLandingAsset("rawMaterial", idx)}
                        disabled={isDeleting}
                        className="px-2 py-1 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 text-xs rounded cursor-pointer disabled:opacity-50 flex items-center gap-1"
                      >
                        {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder={`Material #${idx + 1} URL`}
                    value={currentUrl}
                    onChange={(e) => {
                      const updated = [...formData.rawMaterialImages];
                      updated[idx] = e.target.value;
                      setFormData({ ...formData, rawMaterialImages: updated });
                    }}
                    className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-500">Choose File:</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploading}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUploadLandingAsset(f, "rawMaterial", idx);
                      }}
                      className="text-xs text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-zinc-800 file:text-gray-200 hover:file:bg-zinc-700 cursor-pointer"
                    />
                    {isUploading && <span className="text-xs text-yellow-500">Uploading...</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Catalog Rules */}
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded space-y-3">
          <h2 className="text-sm font-semibold text-gray-200 border-b border-zinc-800 pb-2">
            Catalog Default Display Rules
          </h2>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showDefaultImages}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    showDefaultImages: e.target.checked,
                    removeAllDefaults: e.target.checked ? false : formData.removeAllDefaults,
                  })
                }
                className="rounded border-zinc-700 bg-zinc-950 text-amber-500 focus:ring-0"
              />
              <span>Show platform default catalog images</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.appendDefaults}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    appendDefaults: e.target.checked,
                    removeAllDefaults: e.target.checked ? false : formData.removeAllDefaults,
                  })
                }
                className="rounded border-zinc-700 bg-zinc-950 text-amber-500 focus:ring-0"
              />
              <span>Append platform defaults after custom uploaded images</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.removeAllDefaults}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    removeAllDefaults: e.target.checked,
                    showDefaultImages: e.target.checked ? false : formData.showDefaultImages,
                    appendDefaults: e.target.checked ? false : formData.appendDefaults,
                  })
                }
                className="rounded border-zinc-700 bg-zinc-950 text-red-500 focus:ring-0"
              />
              <span className="text-red-400">Remove all platform default images</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2 flex items-center justify-between">
          <button
            type="submit"
            disabled={saving || resetting}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs rounded cursor-pointer disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
