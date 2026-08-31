"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/app/lib/utils/apiClient";
import Link from "next/link";
import { HardDrive, AlertTriangle, CheckCircle, ShieldAlert, Sparkles } from "lucide-react";

export default function UserSettingsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [storageInfo, setStorageInfo] = useState<{
    usedMB: number;
    limitMB: number;
    remainingMB: number;
    usedPercentage: number;
  }>({
    usedMB: 0,
    limitMB: 500,
    remainingMB: 500,
    usedPercentage: 0,
  });

  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
    planSelected: "STARTER",
    paymentVerified: false,
    subscription_status: "ACTIVE",
    primaryColor: "#1A1A1A",
    accentColor: "#C9A96E",
    backgroundColor: "#F5F0EB",
    whatsappNumber: "",
  });

  const loadUserSettings = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.get<{
        success?: boolean;
        user?: {
          companyName?: string;
          email?: string;
          phone?: string;
          planSelected?: string;
          paymentVerified?: boolean;
          subscription_status?: string;
        };
        storage?: {
          storageUsedMB: number;
          storageLimitMB: number;
          remainingStorageMB: number;
          usedPercentage: number;
        };
        siteSetting?: {
          companyName?: string;
          whatsappNumber?: string;
          primaryColor?: string;
          accentColor?: string;
          backgroundColor?: string;
        };
      }>("/api/user/settings");

      if (res && res.data) {
        const u = res.data.user || {};
        const s = res.data.siteSetting || {};
        const st = res.data.storage || { storageUsedMB: 0, storageLimitMB: 500, remainingStorageMB: 500, usedPercentage: 0 };

        setStorageInfo({
          usedMB: st.storageUsedMB,
          limitMB: st.storageLimitMB,
          remainingMB: st.remainingStorageMB,
          usedPercentage: st.usedPercentage,
        });

        setFormData({
          companyName: u.companyName || s.companyName || "",
          email: u.email || "",
          phone: u.phone || s.whatsappNumber || "",
          planSelected: u.planSelected || "STARTER",
          paymentVerified: u.paymentVerified || false,
          subscription_status: u.subscription_status || "ACTIVE",
          primaryColor: s.primaryColor || "#1A1A1A",
          accentColor: s.accentColor || "#C9A96E",
          backgroundColor: s.backgroundColor || "#F5F0EB",
          whatsappNumber: s.whatsappNumber || u.phone || "",
        });
      }
    } catch (err: unknown) {
      console.warn("Could not load settings from server:", err);
      setFormData((prev) => ({
        ...prev,
        companyName: session?.user?.name || "Ti Stiches Atelier",
        email: session?.user?.email || "manager@tistiches.com",
        phone: "+234 800 000 0000",
        whatsappNumber: "+234 800 000 0000",
      }));
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    const loadData = setTimeout(() => {
      loadUserSettings();
    }, 300);
    return () => clearTimeout(loadData);
  }, [loadUserSettings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const payload = {
        companyName: formData.companyName,
        phone: formData.phone,
        whatsappNumber: formData.whatsappNumber || formData.phone,
        primaryColor: formData.primaryColor,
        accentColor: formData.accentColor,
        backgroundColor: formData.backgroundColor,
      };

      const res = await api.put<{
        success?: boolean;
        message?: string;
      }>("/api/user/settings", payload);

      if (res.data?.success) {
        setSuccessMsg("Account and theme settings saved successfully!");
      } else {
        throw new Error("Failed to update settings.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to save changes.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleResetThemeColors = async () => {
    const defaultColors = {
      primaryColor: "#1A1A1A",
      accentColor: "#C9A96E",
      backgroundColor: "#F5F0EB",
    };

    setFormData((prev) => ({
      ...prev,
      ...defaultColors,
    }));

    setResetting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await api.put<{ success?: boolean }>("/api/user/settings", {
        ...formData,
        ...defaultColors,
      });

      if (res.data?.success) {
        setSuccessMsg("Theme colors restored to factory defaults (#1A1A1A, #C9A96E, #F5F0EB)!");
      } else {
        throw new Error("Failed to update settings.");
      }
    } catch (err: unknown) {
      console.error("Theme reset error:", err);
      setErrorMsg("Failed to reset theme colors.");
    } finally {
      setResetting(false);
    }
  };

  const isInactive = formData.subscription_status === "INACTIVE";

  return (
    <div className="p-4 max-w-4xl text-white space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl font-bold">Shop & Account Settings</h1>
          <p className="text-xs text-gray-400">Configure profile identity, plan details, storage capacity, and theme colors.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadUserSettings}
            disabled={loading || resetting}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs text-gray-200 rounded border border-zinc-700 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Loading..." : "Reload"}
          </button>
          <button
            type="button"
            onClick={handleResetThemeColors}
            disabled={resetting || saving || loading}
            className="px-3 py-1.5 bg-red-950 hover:bg-red-900 border border-red-800 text-xs text-red-300 rounded cursor-pointer disabled:opacity-50"
          >
            {resetting ? "Resetting..." : "Reset Theme Colors"}
          </button>
        </div>
      </div>

      {/* Subscription Inactive Banner */}
      {isInactive && (
        <div className="p-4 bg-amber-950/60 border border-amber-500/50 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-amber-200">Subscription Status: INACTIVE</h3>
              <p className="text-xs text-amber-300/80">Your public storefront is currently locked. Renew your subscription to restore storefront access.</p>
            </div>
          </div>
          <Link
            href="/dashboard/manager/payment"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider rounded transition-colors shrink-0"
          >
            Activate Subscription &rarr;
          </Link>
        </div>
      )}

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

      {/* Section 0: Subscription & Storage Quota Banner */}
      <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-lg space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-semibold text-gray-200">
              Subscription & Cloud Storage Usage
            </h2>
          </div>
          <span className={`px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase rounded ${
            isInactive ? "bg-red-950 text-red-300 border border-red-800" : "bg-emerald-950 text-emerald-300 border border-emerald-800"
          }`}>
            {formData.subscription_status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Plan Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>Active Plan:</span>
              <strong className="text-white uppercase tracking-wider font-semibold">{formData.planSelected}</strong>
              {formData.paymentVerified && (
                <CheckCircle className="w-4 h-4 text-emerald-400 inline" />
              )}
            </div>
            <p className="text-xs text-gray-400">
              Allocated Limit: <strong className="text-amber-400">{storageInfo.limitMB} MB</strong>
            </p>
            <p className="text-xs text-gray-400">
              Used Space: <strong className="text-white">{storageInfo.usedMB} MB</strong> ({storageInfo.usedPercentage}%)
            </p>
          </div>

          {/* Storage Progress Bar */}
          <div className="space-y-2 bg-zinc-950 p-4 rounded border border-zinc-800">
            <div className="flex justify-between text-xs text-gray-300 font-medium">
              <span>Storage Quota</span>
              <span className={storageInfo.usedPercentage >= 80 ? "text-amber-400 font-bold" : "text-gray-400"}>
                {storageInfo.usedMB} MB / {storageInfo.limitMB} MB ({storageInfo.usedPercentage}%)
              </span>
            </div>

            <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  storageInfo.usedPercentage >= 90
                    ? "bg-red-500"
                    : storageInfo.usedPercentage >= 80
                    ? "bg-amber-400"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(100, storageInfo.usedPercentage)}%` }}
              />
            </div>

            {storageInfo.usedPercentage >= 80 && (
              <p className="text-[11px] text-amber-400 flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Storage is {storageInfo.usedPercentage}% full. Upgrade your plan to prevent upload limits.
              </p>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: Profile & Contact */}
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded space-y-4">
          <h2 className="text-sm font-semibold text-gray-200 border-b border-zinc-800 pb-2">
            Profile & Contact Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs text-gray-400 font-medium">Brand / Company Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
                placeholder="Ti Stiches Atelier"
                className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-gray-400 font-medium">Account Email</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded text-xs text-gray-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-gray-400 font-medium">Primary Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                placeholder="+234 800 000 0000"
                className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-gray-400 font-medium">WhatsApp Business Number</label>
              <input
                type="text"
                value={formData.whatsappNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    whatsappNumber: e.target.value,
                    phone: e.target.value,
                  })
                }
                required
                placeholder="+234 800 000 0000"
                className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Theme Colors */}
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h2 className="text-sm font-semibold text-gray-200">
              Site Color Theme
            </h2>
            <button
              type="button"
              onClick={handleResetThemeColors}
              className="text-[11px] text-amber-500 hover:underline"
            >
              Reset to #1A1A1A / #C9A96E / #F5F0EB
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Primary Color */}
            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded space-y-2">
              <label className="block text-xs text-gray-400 font-medium">Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-full p-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* Accent Color */}
            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded space-y-2">
              <label className="block text-xs text-gray-400 font-medium">Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="w-full p-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* Background Color */}
            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded space-y-2">
              <label className="block text-xs text-gray-400 font-medium">Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.backgroundColor}
                  onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                  className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.backgroundColor}
                  onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                  className="w-full p-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-white font-mono"
                />
              </div>
            </div>
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
