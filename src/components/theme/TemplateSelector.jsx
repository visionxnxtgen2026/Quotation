import React from "react";
import { Layout, Printer, Download, Edit3, Check, Share2 } from "lucide-react";

export default function TemplateSelector({ selected, onSelect, onPrint, onExport, onEdit, isExporting }) {
  const templates = [
    { id: "classic",     name: "Classic",      color: "bg-slate-700" },
    { id: "modern",      name: "Modern",       color: "bg-blue-600" },
    { id: "corporate",   name: "Corporate",    color: "bg-slate-900" },
    { id: "compact",     name: "Compact",      color: "bg-emerald-600" },
    { id: "creative",    name: "Creative",     color: "bg-purple-600" },
    { id: "grouped",     name: "Grouped",      color: "bg-rose-600" },
    { id: "obsidian",    name: "Obsidian",     color: "bg-amber-500" },
    { id: "sovereign",   name: "Sovereign",    color: "bg-red-700" },
    { id: "executive",   name: "Executive",    color: "bg-blue-900" },
    { id: "businesspro", name: "Business Pro", color: "bg-slate-800" },
    { id: "enterprise",  name: "Enterprise",   color: "bg-amber-600" },
    { id: "contractor",  name: "Contractor",   color: "bg-emerald-800" },
    { id: "signature",   name: "Signature",    color: "bg-yellow-600" },
  ];

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-col xl:flex-row items-center justify-between shadow-xs sticky top-0 z-30 print:hidden gap-4 transition-all">

      {/* 📑 TEMPLATE SWITCHER TABS */}
      <div className="flex items-center gap-3 w-full xl:w-auto overflow-hidden">
        
        <div className="flex items-center gap-2 text-slate-400 border-r border-slate-200 pr-3.5 shrink-0">
          <Layout size={16} className="text-slate-700" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 hidden md:inline-block">
            Template
          </span>
        </div>

        {/* Scrollable equal-width tab grid */}
        <div className="flex bg-slate-100/80 p-1 rounded-xl gap-1 overflow-x-auto border border-slate-200/60 w-full snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {templates.map((t) => {
            const isSelected = selected === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onSelect(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all duration-200 flex items-center justify-center gap-2 shrink-0 snap-center cursor-pointer min-w-[105px] ${
                  isSelected
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${t.color} shrink-0 transition-transform ${
                    isSelected ? "scale-125 shadow-xs" : "opacity-60"
                  }`}
                />
                <span className="truncate">{t.name}</span>
                {isSelected && (
                  <Check size={13} className="text-slate-900 shrink-0 stroke-[3]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ⚙️ ACTION BUTTONS */}
      <div className="flex items-center justify-between w-full xl:w-auto xl:justify-end gap-3 shrink-0">
        
        <div className="flex items-center gap-1.5">
          <button
            onClick={onEdit}
            className="p-2.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-all border border-slate-200 bg-white shadow-xs active:scale-95 cursor-pointer flex items-center gap-1.5 text-xs font-semibold px-3"
            title="Edit Details"
          >
            <Edit3 size={14} />
            <span className="hidden sm:inline">Edit</span>
          </button>

          <button
            onClick={onPrint}
            className="p-2.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-all border border-slate-200 bg-white shadow-xs active:scale-95 cursor-pointer flex items-center gap-1.5 text-xs font-semibold px-3"
            title="Print Preview"
          >
            <Printer size={14} />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>

        <div className="w-px h-6 bg-slate-200 hidden sm:block" />

        <button
          onClick={onExport}
          disabled={isExporting}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg text-xs font-semibold tracking-wide flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto cursor-pointer"
        >
          {isExporting ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
          ) : (
            <>
              <Download size={14} className="hidden sm:block" />
              <Share2 size={14} className="sm:hidden" />
            </>
          )}
          <span className="hidden sm:inline">{isExporting ? "Exporting..." : "Export & Share"}</span>
          <span className="sm:hidden">{isExporting ? "Exporting..." : "Share"}</span>
        </button>

      </div>

    </div>
  );
}