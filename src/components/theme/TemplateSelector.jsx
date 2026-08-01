import React, { useState, useRef, useEffect } from "react";
import { Layout, Printer, Download, Edit3, Check, Share2, ChevronDown } from "lucide-react";
import {
  TEMPLATE_REGISTRY,
  OUTPUT_FORMATS,
  getTemplateOutputFormat,
  setTemplateOutputFormat,
} from "./templateUtils.js";

export default function TemplateSelector({ selected, onSelect, onPrint, onExport, onEdit, isExporting }) {
  // Current output format for the active template
  const [outputFormat, setOutputFormat] = useState(() => getTemplateOutputFormat(selected || "classic"));
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const formatMenuRef = useRef(null);

  // Keep format state in sync when selected template changes
  useEffect(() => {
    setOutputFormat(getTemplateOutputFormat(selected));
    setShowFormatMenu(false);
  }, [selected]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (formatMenuRef.current && !formatMenuRef.current.contains(e.target)) {
        setShowFormatMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleFormatChange = (formatId) => {
    setTemplateOutputFormat(selected, formatId);
    setOutputFormat(formatId);
    setShowFormatMenu(false);
    // Notify parent so Export.jsx can immediately reflect the change
    if (typeof onExport === "function") {
      // Dispatch a custom event so Export.jsx re-reads format without a prop chain
      window.dispatchEvent(new CustomEvent("templateFormatChanged", { detail: { templateId: selected, formatId } }));
    }
  };

  const currentFmt = OUTPUT_FORMATS.find((f) => f.id === outputFormat) || OUTPUT_FORMATS[0];
  const enabledFormats = OUTPUT_FORMATS.filter((f) => f.enabled);
  const disabledFormats = OUTPUT_FORMATS.filter((f) => !f.enabled);

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-3 flex flex-col xl:flex-row items-center justify-between shadow-xs sticky top-0 z-30 print:hidden gap-3 transition-all">

      {/* 📑 TEMPLATE SWITCHER TABS */}
      <div className="flex items-center gap-2.5 w-full xl:w-auto overflow-hidden">
        <div className="flex items-center gap-2 text-slate-400 border-r border-slate-200 pr-3 shrink-0">
          <Layout size={15} className="text-slate-600" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 hidden md:inline-block">
            Template
          </span>
        </div>

        {/* Scrollable tab strip */}
        <div className="flex bg-slate-100/80 p-1 rounded-xl gap-1 overflow-x-auto border border-slate-200/60 w-full snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {TEMPLATE_REGISTRY.map((t) => {
            const isSelected = selected === t.id;
            const fmt = OUTPUT_FORMATS.find((f) => f.id === getTemplateOutputFormat(t.id));
            return (
              <button
                key={t.id}
                onClick={() => onSelect(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all duration-200 flex items-center justify-center gap-1.5 shrink-0 snap-center cursor-pointer min-w-[100px] ${
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
                  <Check size={12} className="text-slate-900 shrink-0 stroke-[3]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ⚙️ ACTION BUTTONS */}
      <div className="flex items-center justify-between w-full xl:w-auto xl:justify-end gap-2 shrink-0">

        {/* Secondary buttons */}
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
            title="Print"
          >
            <Printer size={14} />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>

        <div className="w-px h-6 bg-slate-200 hidden sm:block" />

        {/* OUTPUT FORMAT SELECTOR + EXPORT BUTTON — combined pill group */}
        <div className="flex items-stretch rounded-xl overflow-visible shadow-xs border border-slate-900/90 bg-slate-900">

          {/* Export trigger */}
          <button
            onClick={onExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 text-white text-xs font-bold tracking-wide transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer rounded-l-xl hover:bg-slate-800"
            title={`Export as ${currentFmt.label}`}
          >
            {isExporting ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
            ) : (
              <>
                <Download size={14} className="hidden sm:block shrink-0" />
                <Share2 size={14} className="sm:hidden shrink-0" />
              </>
            )}
            <span className="hidden sm:inline">
              {isExporting ? "Exporting..." : `Export as ${currentFmt.label}`}
            </span>
            <span className="sm:hidden">
              {isExporting ? "..." : currentFmt.icon}
            </span>
          </button>

          {/* Divider */}
          <div className="w-px bg-white/20 my-1.5" />

          {/* Format dropdown trigger */}
          <div className="relative" ref={formatMenuRef}>
            <button
              onClick={() => setShowFormatMenu((v) => !v)}
              disabled={isExporting}
              className="flex items-center gap-1 px-2.5 py-2 text-white/80 hover:text-white hover:bg-slate-800 transition-all cursor-pointer rounded-r-xl disabled:opacity-50 h-full"
              title="Change output format"
              aria-label="Change output format"
            >
              <span className="text-xs font-semibold">{currentFmt.icon}</span>
              <ChevronDown
                size={12}
                className={`transition-transform duration-200 ${showFormatMenu ? "rotate-180" : ""}`}
              />
            </button>

            {/* Format dropdown menu */}
            {showFormatMenu && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl z-[200] overflow-hidden">
                {/* Header */}
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Output Format</p>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">Choose file type for export</p>
                </div>

                {/* Enabled formats */}
                <div className="py-1.5">
                  {enabledFormats.map((fmt) => {
                    const isActive = outputFormat === fmt.id;
                    return (
                      <button
                        key={fmt.id}
                        onClick={() => handleFormatChange(fmt.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                          isActive
                            ? "bg-blue-50 text-blue-700"
                            : "hover:bg-slate-50 text-slate-800"
                        }`}
                      >
                        <span className="text-base leading-none">{fmt.icon}</span>
                        <div className="flex-1">
                          <p className={`text-xs font-bold ${isActive ? "text-blue-700" : "text-slate-900"}`}>
                            {fmt.label}
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium mt-0.5">{fmt.desc}</p>
                        </div>
                        {isActive && (
                          <Check size={14} className="text-blue-600 shrink-0 stroke-[2.5]" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Disabled / Coming Soon formats */}
                {disabledFormats.length > 0 && (
                  <>
                    <div className="border-t border-slate-100 mx-3" />
                    <div className="py-1.5 pb-2">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4 py-1">
                        Coming Soon
                      </p>
                      {disabledFormats.map((fmt) => (
                        <div
                          key={fmt.id}
                          className="flex items-center gap-3 px-4 py-2 opacity-40 cursor-not-allowed"
                        >
                          <span className="text-base leading-none">{fmt.icon}</span>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-slate-500">{fmt.label}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{fmt.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}