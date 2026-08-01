import React from "react";
import {
  LayoutDashboard,
  FilePlus2,
  Eye,
  Download,
  Settings,
} from "lucide-react";

const TABS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "create",    label: "Create",    icon: FilePlus2 },
  { key: "preview",   label: "Preview",   icon: Eye },
  { key: "export",    label: "Export",    icon: Download },
  { key: "settings",  label: "Settings",  icon: Settings },
];

export default function BottomNavigation({ activeTab, onTabChange, active, navigate, onSelect }) {
  const currentActive = activeTab || active || "dashboard";
  const handleNavigation = (tabKey) => {
    if (typeof onTabChange === "function") {
      onTabChange(tabKey);
    } else if (typeof navigate === "function") {
      navigate(tabKey);
    } else if (typeof onSelect === "function") {
      onSelect(tabKey);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-[env(safe-area-inset-bottom,8px)] pt-2 print:hidden">
      <nav
        className="pointer-events-auto max-w-md mx-auto mx-3 sm:mx-auto bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-1.5 transition-all duration-300"
      >
        <div className="flex items-center justify-between">
          {TABS.map(({ key, label, icon: Icon }) => {
            const isActive = currentActive === key;
            return (
              <button
                key={key}
                onClick={() => handleNavigation(key)}
                className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all duration-200 cursor-pointer select-none group relative ${
                  isActive
                    ? "text-blue-600 font-extrabold"
                    : "text-slate-500 hover:text-slate-800 active:scale-95"
                }`}
                aria-label={label}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-blue-50/80 rounded-2xl -z-10 animate-in fade-in zoom-in-95 duration-200 border border-blue-100/60" />
                )}
                <div className={`p-1 rounded-xl transition-transform duration-200 ${isActive ? "scale-110 text-blue-600" : "group-hover:scale-105"}`}>
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                </div>
                <span
                  className={`text-[10px] sm:text-[11px] tracking-tight leading-tight mt-0.5 ${
                    isActive ? "font-black text-blue-600" : "font-semibold text-slate-500"
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
