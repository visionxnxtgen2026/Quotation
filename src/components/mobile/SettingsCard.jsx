import React from "react";

export default function SettingsCard({ title, subtitle, icon, iconBg = "bg-blue-50 text-blue-600", children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
      {(title || subtitle) && (
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
          {icon && (
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
              {icon}
            </div>
          )}
          <div>
            {title && <p className="text-xs font-bold text-slate-900">{title}</p>}
            {subtitle && <p className="text-[11px] text-slate-500 font-medium">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
