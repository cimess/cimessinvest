"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { 
  Bell, 
  CheckCheck, 
  MessageSquare, 
  ShieldCheck, 
  Info, 
  Trash2, 
  Sparkles, 
  RefreshCw,
  ExternalLink,
  Tag
} from "lucide-react";
import axios from "axios";
import { api } from "@/app/lib/utils/apiClient";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "whatsapp" | "system" | "license";
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export default function NotificationsDashboardPage() {
  const { data: session } = useSession();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "whatsapp" | "system" | "license">("all");
  const [error, setError] = useState<string | null>(null);

  const authorizationKey = (session?.user as any)?.authorizationKey || "[ENCRYPTION_KEY]";
  const companyName = (session?.user as any)?.companyName || "cimessinvest";
  const email = session?.user?.email || "manager@cimessinvest.com";

  // Fetch Notifications from External API
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_EXTERNAL_API_URL || "https://api.example.com";

      // --- UNCOMMENT REAL API POST CALL WHEN ENDPOINT IS LIVE ---
      /*
      const response = await api.post(`${apiUrl}/notifications/list`, {
        authorisedKey: authorizationKey,
        data: {
          companyName,
          email,
        }
      });

      if (response.data && response.data.success) {
        setNotifications(response.data.notifications);
        return;
      }
      */
      throw new Error("External API not connected yet");
    } catch (err) {
      if (err instanceof axios.AxiosError) {
        console.warn("External API fetch notice:", err.response?.data?.message);
      }
      setError("Displaying atelier notifications log.");

      // Default Demonstration Notifications
      setNotifications([
        {
          id: "notif-1",
          title: "New WhatsApp Fitting Inquiry",
          message: "Client 'Chief O. Adeleke' inquired about the Royal Agbada Ensemble (Silk Velvet).",
          type: "whatsapp",
          isRead: false,
          createdAt: "10 mins ago",
          actionUrl: "https://wa.me/2340000000000",
        },
        {
          id: "notif-2",
          title: "Atelier License Key Verified",
          message: "Your external authorization key has been successfully verified with the primary server.",
          type: "license",
          isRead: false,
          createdAt: "2 hours ago",
        },
        {
          id: "notif-3",
          title: "Catalog Item Added",
          message: "New design added to the 'Ceremonial' collection successfully.",
          type: "system",
          isRead: true,
          createdAt: "Yesterday",
        },
        {
          id: "notif-4",
          title: "WhatsApp Consultation Request",
          message: "Dr. Amara Nwosu requested pricing details for Sculpted Kaftans.",
          type: "whatsapp",
          isRead: true,
          createdAt: "2 days ago",
          actionUrl: "https://wa.me/2340000000000",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [authorizationKey, companyName, email]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotifications();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchNotifications]);

  // Mark single item as read
  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );
  };

  // Mark all items as read
  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  // Delete notification
  const handleDeleteNotif = (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  // Filtered notifications list
  const filteredNotifications = notifications.filter(
    (n) => filter === "all" || n.type === filter
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="p-6 sm:p-10 space-y-8 bg-[#1A1A1A] min-h-screen text-[#F5F0EB] font-body">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#C9A96E]/20 pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#C9A96E] font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A96E]" />
            Activity Stream
          </span>
          <h1 className="text-3xl font-heading text-[#F5F0EB] mt-1 font-bold flex items-center gap-3">
            <span>Notifications & Alerts</span>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#C9A96E] text-[#1A1A1A] text-xs font-bold font-mono">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-xs text-[#E0D5C9]/60 font-light mt-1">
            Real-time updates on WhatsApp client inquiries, system status, and portal licenses.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-3.5 py-2 bg-white/5 border border-white/10 text-[#E0D5C9] text-xs font-semibold hover:border-[#C9A96E]/50 hover:text-[#C9A96E] transition-colors flex items-center space-x-1.5 rounded cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Read</span>
            </button>
          )}

          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="px-4 py-2 bg-[#C9A96E] text-[#1A1A1A] text-xs font-bold uppercase tracking-wider hover:bg-[#F5F0EB] transition-colors flex items-center space-x-2 rounded cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {(["all", "whatsapp", "system", "license"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              filter === tab
                ? "bg-[#C9A96E] text-[#1A1A1A] font-bold shadow-md shadow-[#C9A96E]/20"
                : "bg-white/5 border border-white/10 text-[#E0D5C9]/70 hover:text-[#C9A96E] hover:border-[#C9A96E]/40"
            }`}
          >
            {tab === "whatsapp" ? "WhatsApp Leads" : tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center border border-[#C9A96E]/20 rounded-lg text-[#E0D5C9]/60">
            <RefreshCw className="w-6 h-6 animate-spin text-[#C9A96E] mx-auto mb-2" />
            <p className="text-xs">Fetching recent notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-[#C9A96E]/30 rounded-lg space-y-2">
            <Bell className="w-8 h-8 text-[#C9A96E]/40 mx-auto" />
            <p className="text-sm text-[#E0D5C9]/70 font-light">
              No notifications found in this category.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-5 rounded-lg border transition-all flex items-start justify-between gap-4 ${
                notif.isRead
                  ? "bg-black/20 border-white/5 opacity-75"
                  : "bg-black/60 border-[#C9A96E]/40 shadow-lg shadow-[#C9A96E]/5"
              }`}
            >
              <div className="flex items-start space-x-4">
                {/* Icon Badge */}
                <div className="p-2.5 rounded bg-white/5 border border-white/10 shrink-0 mt-0.5">
                  {notif.type === "whatsapp" && (
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                  )}
                  {notif.type === "license" && (
                    <ShieldCheck className="w-4 h-4 text-[#C9A96E]" />
                  )}
                  {notif.type === "system" && (
                    <Info className="w-4 h-4 text-sky-400" />
                  )}
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-[#F5F0EB]">
                      {notif.title}
                    </h3>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#C9A96E] animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-[#E0D5C9]/80 font-light leading-relaxed">
                    {notif.message}
                  </p>
                  <div className="flex items-center space-x-3 pt-1 text-[10px] text-[#E0D5C9]/50">
                    <span>{notif.createdAt}</span>
                    <span>•</span>
                    <span className="uppercase font-semibold text-[#C9A96E]">
                      {notif.type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0">
                {notif.actionUrl && (
                  <a
                    href={notif.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded border border-emerald-500/20 transition-colors"
                    title="Open Action Link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    title="Mark as Read"
                    className="p-2 text-[#C9A96E] hover:bg-[#C9A96E]/10 rounded border border-[#C9A96E]/20 transition-colors cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => handleDeleteNotif(notif.id)}
                  title="Delete Notification"
                  className="p-2 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
