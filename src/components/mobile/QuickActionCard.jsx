import React from "react";
import { ArrowRight } from "lucide-react";

export default function QuickActionCard({ icon, iconBg = "bg-blue-50 text-blue-600", title, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 text-left shadow-xs hover:border-blue-200 active:scale-[0.99] transition-all cursor-pointer group"
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{title}</p>
        <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">{subtitle}</p>
      </div>
      <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 shrink-0 transition-all group-hover:translate-x-0.5" />
    </button>
  );
}
