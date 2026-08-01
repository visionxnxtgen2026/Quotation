import React from "react";
import {
  LayoutDashboard,
  FilePlus,
  Database,
  Settings,
} from "lucide-react";

const TABS = [
  { key: "dashboard", label: "Home",    icon: LayoutDashboard },
  { key: "create",    label: "Create",  icon: FilePlus },
  { key: "storage",   label: "Storage", icon: Database },
  { key: "settings",  label: "Settings",icon: Settings },
];

export default function BottomNav({ active, navigate }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 print:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around h-14">
        {TABS.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => navigate(key)}
              className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors cursor-pointer select-none relative"
              aria-label={label}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                className={isActive ? "text-blue-600" : "text-slate-400"}
              />
              <span
                className={`text-[10px] font-bold tracking-wide ${
                  isActive ? "text-blue-600" : "text-slate-400"
                }`}
              >
                {label}
              </span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
