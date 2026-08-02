import React from "react";
import { Layout, Edit3, Check, FileText, FileCode, Sheet, Image as ImageIcon, Download } from "lucide-react";
import {
  FORMAT_TYPES,
  getTemplatesByFormat,
  getTemplateDetails,
  getDefaultTemplateForFormat,
} from "../../utils/templateRegistry.js";

export default function TemplateSelector({
  selectedTemplate = "modern-proposal",
  selectedFormat = "pdf",
  onSelectFormat,
  onSelectTemplate,
  onEdit,
  onExport,
  isExporting = false,
}) {
  const currentFormatObj = FORMAT_TYPES.find((f) => f.id === selectedFormat) || FORMAT_TYPES[0];
  const activeTemplates = getTemplatesByFormat(selectedFormat);
  const currentTemplateObj = getTemplateDetails(selectedTemplate);

  const getFormatIcon = (fmtId) => {
    switch (fmtId) {
      case "docx":
        return <FileCode size={14} className="text-blue-500" />;
      case "xlsx":
        return <Sheet size={14} className="text-emerald-500" />;
      case "png":
        return <ImageIcon size={14} className="text-purple-500" />;
      case "pdf":
      default:
        return <FileText size={14} className="text-red-500" />;
    }
  };

  const handleFormatChange = (fmtId) => {
    if (onSelectFormat) onSelectFormat(fmtId);
    const firstTpl = getDefaultTemplateForFormat(fmtId);
    if (onSelectTemplate && firstTpl) {
      onSelectTemplate(firstTpl.id);
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-3 flex flex-col xl:flex-row items-center justify-between shadow-xs sticky top-0 z-30 print:hidden gap-3 transition-all">
      {/* ── 1. STEP 1 & STEP 2 TEMPLATE SWITCHER ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full xl:w-auto">
        
        {/* Step 1: Format Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shrink-0">
          {FORMAT_TYPES.map((fmt) => {
            const isFmtSelected = selectedFormat === fmt.id;
            return (
              <button
                key={fmt.id}
                onClick={() => handleFormatChange(fmt.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isFmtSelected
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
                title={fmt.description}
              >
                {getFormatIcon(fmt.id)}
                <span>{fmt.label}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden md:block w-px h-6 bg-slate-200 shrink-0" />

        {/* Step 2: PDF Template Gallery Strip (ONLY shown for PDF format) */}
        {selectedFormat === "pdf" ? (
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-0.5">
            {activeTemplates.map((t) => {
              const isSelected = selectedTemplate === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onSelectTemplate(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 shrink-0 snap-center cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-xs font-bold border border-slate-800"
                      : "bg-slate-100/70 text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 border border-slate-200/60"
                  }`}
                  title={t.subtitle || t.name}
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${t.color} shrink-0 ${
                      isSelected ? "ring-2 ring-white/50" : "opacity-80"
                    }`}
                  />
                  <span className="truncate">{t.name}</span>
                  {t.industry && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-normal ${isSelected ? "bg-white/20 text-slate-200" : "bg-slate-200 text-slate-600"}`}>
                      {t.industry.split('&')[0].trim()}
                    </span>
                  )}
                  {isSelected && <Check size={12} className="text-white shrink-0 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {selectedFormat === "docx" && "Native Editable Word Document (.docx)"}
              {selectedFormat === "xlsx" && "Native Microsoft Excel Spreadsheet (.xlsx)"}
              {selectedFormat === "png" && "High-Resolution Image Snapshot (.png)"}
            </span>
          </div>
        )}
      </div>

      {/* ── 2. EDIT DETAILS & ONE-CLICK EXPORT BUTTON ── */}
      <div className="flex items-center justify-between w-full xl:w-auto xl:justify-end gap-2 shrink-0">
        <button
          onClick={onEdit}
          className="p-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-all border border-slate-200 bg-white shadow-xs cursor-pointer flex items-center gap-1.5 text-xs font-semibold px-3"
          title="Edit Details"
        >
          <Edit3 size={14} />
          <span>Edit Details</span>
        </button>

        {/* Primary 1-Click Instant Export Button */}
        <button
          onClick={onExport}
          disabled={isExporting}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title={`Generate ${currentFormatObj.name}`}
        >
          <Download size={14} />
          <span>Export {currentFormatObj.label}</span>
        </button>
      </div>
    </div>
  );
}