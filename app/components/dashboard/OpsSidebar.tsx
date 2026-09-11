"use client";

import { Activity, ClipboardList, Coins, Bell, LineChart, LayoutDashboard, Settings, LogOut } from "lucide-react";
import { moduleHref, modulesForRole } from "../../lib/modules";
import type { ModuleItem } from "../../lib/modules";
import { useRouter, usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const groupIcon: Record<ModuleItem["group"], React.ReactNode> = {
  Shop: <ClipboardList className="w-4 h-4 text-[#C9A96E]" strokeWidth={1.5} />,
  Collections: <Activity className="w-4 h-4 text-[#C9A96E]" strokeWidth={1.5} />,
  Payments: <Coins className="w-4 h-4 text-[#C9A96E]" strokeWidth={1.5} />,
  Analytics: <LineChart className="w-4 h-4 text-[#C9A96E]" strokeWidth={1.5} />,
  Notifications: <Bell className="w-4 h-4 text-[#C9A96E]" strokeWidth={1.5} />,
  Settings: <Settings className="w-4 h-4 text-[#C9A96E]" strokeWidth={1.5} />,
};

export function OpsSidebar({
  collapsed = false,
  onToggleCollapse,
  onCloseMobile,
}: {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
}) {
  const navigate = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const companyName = (session?.user as any)?.companyName?.trim() || "cimessinvest";

  const role = (session?.user as any)?.role || "ADMIN";
  const userRole = role.toLowerCase();
  const items = modulesForRole(userRole);

  const grouped = items.reduce((acc, m) => {
    (acc[m.group] ||= []).push(m);
    return acc;
  }, {} as Record<ModuleItem["group"], ModuleItem[]>);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const handleLogout = async () => {
    onCloseMobile?.();
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <aside
      className={`h-full bg-[#1A1A1A] backdrop-blur-xl border-r border-[#C9A96E]/20 ${
        collapsed ? "w-20" : "w-72"
      } transition-all duration-300 ease-in-out font-body text-[#F5F0EB] flex flex-col justify-between`}
    >
      <div className="flex-1 flex flex-col min-h-0">
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#C9A96E]/20 shrink-0">
          <button
            className="flex items-center gap-3 min-w-0 cursor-pointer text-left"
            onClick={() => {
              navigate.push("/");
              onCloseMobile?.();
            }}
          >
            {!collapsed && (
              <div className="min-w-0">
                <p className="font-brand text-xs tracking-[0.25em] text-[#C9A96E] font-bold uppercase truncate">
                  CIMESSINVEST
                </p>
                <p className="text-[11px] text-[#E0D5C9]/80 truncate font-medium">
                  {companyName}
                </p>
              </div>
            )}
          </button>

          {onToggleCollapse && (
            <button
              className="hidden lg:inline-flex p-2 rounded-lg text-[#E0D5C9]/60 hover:text-[#C9A96E] hover:bg-white/5 transition-colors"
              onClick={onToggleCollapse}
              aria-label="Toggle sidebar"
            >
              <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="p-3 overflow-y-auto flex-1 scrollbar-hide space-y-6">
          {(Object.entries(grouped) as Array<[ModuleItem["group"], ModuleItem[]]>).map(([group, mods]) => (
            <div key={group}>
              {/* Group Label */}
              <div
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A96E]/80 flex items-center gap-2 ${
                  collapsed ? "justify-center" : ""
                }`}
              >
                <span>{groupIcon[group]}</span>
                {!collapsed && <span>{group}</span>}
              </div>

              {/* Group Modules */}
              <ul className="mt-1 space-y-1">
                {mods.map((m) => {
                  const href = moduleHref(userRole, m.path);
                  const active = isActive(href);
                  return (
                    <li key={m.key}>
                      <button
                        onClick={() => {
                          navigate.push(href);
                          onCloseMobile?.();
                        }}
                        title={collapsed ? m.label : undefined}
                        className={`w-full h-10 px-3 rounded-lg flex items-center gap-3 text-xs transition-colors cursor-pointer ${
                          active
                            ? "bg-[#C9A96E]/15 border border-[#C9A96E]/40 text-[#C9A96E] font-semibold"
                            : "text-[#E0D5C9]/70 hover:text-[#C9A96E] hover:bg-white/5"
                        } ${collapsed ? "justify-center" : ""}`}
                      >
                        <span className="w-4 h-4 flex items-center justify-center text-[#C9A96E]">
                          {groupIcon[m.group]}
                        </span>
                        {!collapsed && <span className="tracking-wide truncate">{m.label}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Logout Footer Button */}
      <div className="p-3 border-t border-[#C9A96E]/20 bg-[#161616] shrink-0">
        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={`w-full h-10 px-3 rounded-lg flex items-center gap-3 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-all cursor-pointer ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="w-4 h-4 shrink-0 text-red-400" strokeWidth={1.5} />
          {!collapsed && <span className="tracking-wide uppercase text-[11px]">Logout Account</span>}
        </button>
      </div>
    </aside>
  );
}
