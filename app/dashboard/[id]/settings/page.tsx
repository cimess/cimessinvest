"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/app/lib/utils/apiClient";
import Link from "next/link";
import { 
  HardDrive, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  Sparkles,
  Users,
  UserPlus,
  Copy,
  Trash2,
  Check,
  ExternalLink,
  Loader2,
  ShieldCheck,
  UserCheck
} from "lucide-react";

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

  // Team Management State
  const [teamStats, setTeamStats] = useState<{
    planSelected: string;
    currentManagersCount: number;
    maxManagersAllowed: number;
    totalSeats: number;
    currentSeatsUsed: number;
    canAddManager: boolean;
  } | null>(null);
  const [managers, setManagers] = useState<Array<{
    id: string;
    companyName: string;
    email: string;
    phone: string;
    role: string;
    createdAt: string;
  }>>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState<string | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [deletingManagerId, setDeletingManagerId] = useState<string | null>(null);

  const loadTeamData = useCallback(async () => {
    const role = ((session?.user as any)?.role || "").toUpperCase();
    if (role !== "ADMIN") return;

    setLoadingTeam(true);
    try {
      const res = await api.get<{
        success: boolean;
        stats: any;
        managers: any[];
      }>("/api/team");
      if (res?.data?.success) {
        setTeamStats(res.data.stats);
        setManagers(res.data.managers || []);
      }
    } catch (err) {
      console.warn("Could not load team data:", err);
    } finally {
      setLoadingTeam(false);
    }
  }, [session]);

  const handleGenerateInvite = async () => {
    setGeneratingInvite(true);
    setErrorMsg(null);
    try {
      const res = await api.post<{ success: boolean; invite: { inviteUrl: string } }>("/api/team/invite");
      if (res?.data?.success && res.data.invite?.inviteUrl) {
        setGeneratedInviteUrl(res.data.invite.inviteUrl);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || "Failed to generate invite link.");
    } finally {
      setGeneratingInvite(false);
    }
  };

  const handleRemoveManager = async (managerId: string) => {
    if (!confirm("Are you sure you want to remove this manager? They will immediately lose access to the dashboard.")) {
      return;
    }
    setDeletingManagerId(managerId);
    setErrorMsg(null);
    try {
      const res = await api.delete<{ success: boolean }>("/api/team", { data: { managerId } });
      if (res?.data?.success) {
        setManagers((prev) => prev.filter((m) => m.id !== managerId));
        if (teamStats) {
          setTeamStats({
            ...teamStats,
            currentManagersCount: Math.max(0, teamStats.currentManagersCount - 1),
            currentSeatsUsed: Math.max(1, teamStats.currentSeatsUsed - 1),
            canAddManager: true,
          });
        }
        setSuccessMsg("Manager removed successfully.");
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || "Failed to remove manager.");
    } finally {
      setDeletingManagerId(null);
    }
  };

  const handleCopyInvite = () => {
    if (generatedInviteUrl) {
      navigator.clipboard.writeText(generatedInviteUrl);
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 2500);
    }
  };

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
        companyName: session?.user?.name || "cimessinvest",
        email: session?.user?.email || "manager@cimessinvest.com",
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
      loadTeamData();
    }, 300);
    return () => clearTimeout(loadData);
  }, [loadUserSettings, loadTeamData]);

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
                placeholder="cimessinvest"
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

      {/* ========================================================= */}
      {/* TEAM & STORE MANAGERS (ADMINISTRATOR EXCLUSIVE)           */}
      {/* ========================================================= */}
      {((session?.user as any)?.role || "").toUpperCase() === "ADMIN" && (
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg space-y-4 font-body">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" />
                <span>Atelier Team & Store Managers</span>
              </h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Invite trusted staff members to curate collections and update showcase designs under your subscription.
              </p>
            </div>

            {/* Generate Invite Link Button */}
            <div>
              {teamStats && teamStats.canAddManager ? (
                <button
                  type="button"
                  onClick={handleGenerateInvite}
                  disabled={generatingInvite}
                  className="px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {generatingInvite ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Generate Invite Link</span>
                    </>
                  )}
                </button>
              ) : (
                <Link
                  href="/dashboard/1/payment"
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-amber-400 rounded text-xs font-medium flex items-center gap-1.5 transition-all border border-amber-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Upgrade Plan for More Seats</span>
                </Link>
              )}
            </div>
          </div>

          {/* Quota & Plan Capacity Alert */}
          {teamStats && (
            <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-zinc-200">
                    {teamStats.planSelected} Plan Capacity:
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {teamStats.currentManagersCount} / {teamStats.maxManagersAllowed === 999999 ? "Unlimited" : `${teamStats.maxManagersAllowed} Managers`}
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    ({teamStats.currentSeatsUsed} / {teamStats.totalSeats === 999999 ? "∞" : teamStats.totalSeats} Total Seats)
                  </span>
                </div>
                {teamStats.planSelected === "STARTER" && (
                  <p className="text-[11px] text-zinc-400 mt-1">
                    The Starter plan includes 1 Admin seat. To invite store managers to assist with uploads and branding, upgrade to <span className="text-amber-400 font-medium">Professional</span> (up to 4 managers).
                  </p>
                )}
                {teamStats.planSelected === "PROFESSIONAL" && (
                  <p className="text-[11px] text-zinc-400 mt-1">
                    You have used {teamStats.currentManagersCount} of your 4 included manager seats.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Generated Invite Link Banner */}
          {generatedInviteUrl && (
            <div className="p-3.5 bg-amber-950/20 border border-amber-500/40 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-amber-300 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Single-Use Manager Invitation Link Generated (Valid 7 Days)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setGeneratedInviteUrl(null)}
                  className="text-[11px] text-zinc-400 hover:text-white cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedInviteUrl}
                  className="flex-1 p-2 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-200 font-mono select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyInvite}
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded flex items-center gap-1 transition-all cursor-pointer shrink-0"
                >
                  {copiedInvite ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-zinc-400">
                Send this link to your staff member. Once they register, they will inherit your brand assets and become an active Store Manager.
              </p>
            </div>
          )}

          {/* Active Managers Roster */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Active Store Managers ({managers.length})
            </h3>

            {loadingTeam ? (
              <div className="p-6 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                <span>Loading team roster...</span>
              </div>
            ) : managers.length === 0 ? (
              <div className="p-6 bg-zinc-950/60 border border-zinc-800/80 rounded-lg text-center">
                <Users className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-xs text-zinc-400 font-medium">No managers invited yet</p>
                <p className="text-[11px] text-zinc-500 mt-1 max-w-sm mx-auto">
                  {teamStats && !teamStats.canAddManager
                    ? "Upgrade to Professional to invite staff members to your workspace."
                    : "Generate an invite link above to onboard staff members as Store Managers."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="border-b border-zinc-800 bg-zinc-900/50 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    <tr>
                      <th className="px-4 py-2.5">Manager</th>
                      <th className="px-4 py-2.5">Email</th>
                      <th className="px-4 py-2.5">Phone</th>
                      <th className="px-4 py-2.5">Joined</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {managers.map((mgr) => (
                      <tr key={mgr.id} className="hover:bg-zinc-900/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-white flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center text-[10px] font-bold">
                            {mgr.companyName.charAt(0).toUpperCase()}
                          </span>
                          <span>{mgr.companyName}</span>
                        </td>
                        <td className="px-4 py-3 text-zinc-400 font-mono text-[11px]">{mgr.email}</td>
                        <td className="px-4 py-3 text-zinc-400 text-[11px]">{mgr.phone}</td>
                        <td className="px-4 py-3 text-zinc-500 text-[11px]">
                          {new Date(mgr.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveManager(mgr.id)}
                            disabled={deletingManagerId === mgr.id}
                            className="p-1.5 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
                            title="Remove Manager"
                          >
                            {deletingManagerId === mgr.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
