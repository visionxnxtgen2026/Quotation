import React from "react";
import { ArrowRight, Loader2 } from "lucide-react";

export default function ExportActionCard({ icon, iconBg = "bg-blue-50 text-blue-600", title, desc, onClick, isLoading, disabled }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`w-full bg-white border border-slate-100 rounded-3xl p-4 flex items-center gap-4 text-left shadow-xs transition-all cursor-pointer ${
        disabled ? "opacity-50 cursor-not-allowed" : "active:scale-[0.99] active:bg-slate-50"
      }`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {isLoading ? <Loader2 size={20} className="animate-spin" /> : icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-900">{title}</p>
        <p className="text-[11px] text-slate-400 font-medium mt-0.5">{desc}</p>
      </div>
      <ArrowRight size={16} className="text-slate-300 shrink-0" />
    </button>
  );
}
