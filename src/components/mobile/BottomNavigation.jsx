import React, { memo } from "react";
import {
  LayoutGrid,
  FilePlus,
  Eye,
  Download,
  Settings,
} from "lucide-react";

const TABS = [
  { key: "dashboard",  label: "Dashboard",  icon: LayoutGrid },
  { key: "create",     label: "Create",     icon: FilePlus },
  { key: "preview",    label: "Preview",    icon: Eye },
  { key: "export",     label: "Export",     icon: Download },
  { key: "settings",   label: "Settings",   icon: Settings },
];

function BottomNavigation({ activeTab, onTabChange, active, navigate, onSelect }) {
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
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-auto print:hidden">
      <nav className="w-full bg-[#0F172A] border-t border-slate-800/80 shadow-[0_-8px_30px_rgba(0,0,0,0.35)] pt-2 pb-[max(8px,env(safe-area-inset-bottom))] px-2 transition-all duration-300">
        <div className="flex items-center justify-between max-w-lg mx-auto h-[58px]">
          {TABS.map(({ key, label, icon: Icon }) => {
            const isActive = currentActive === key;
            return (
              <button
                key={key}
                onClick={() => handleNavigation(key)}
                className="flex flex-col items-center justify-center flex-1 h-full py-1 cursor-pointer select-none group relative transition-all duration-200"
                aria-label={label}
              >
                {/* Active Squircle Chip / Icon Wrapper */}
                <div
                  className={`w-11 h-8 rounded-[12px] flex items-center justify-center transition-all duration-250 ${
                    isActive
                      ? "bg-blue-600/25 border border-blue-500/30 text-blue-400 shadow-xs shadow-blue-500/20 scale-105"
                      : "bg-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon
                    size={19}
                    strokeWidth={isActive ? 2.3 : 1.8}
                    className="transition-colors duration-200"
                  />
                </div>

                {/* Text Label */}
                <span
                  className={`text-[11px] tracking-tight leading-tight mt-1 transition-colors duration-200 ${
                    isActive ? "font-bold text-blue-400" : "font-medium text-slate-400"
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

export default memo(BottomNavigation);
