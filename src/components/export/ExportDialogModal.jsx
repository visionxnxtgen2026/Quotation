import React, { useState } from "react";
import {
  FileText, FileCode, Table, Image as ImageIcon, Globe,
  Check, X, Download
} from "lucide-react";

export default function ExportDialogModal({
  isOpen,
  onClose,
  onExport,
  isExporting = false
}) {
  const [selectedFormat, setSelectedFormat] = useState(() => {
    return localStorage.getItem("lastExportFormat") || "pdf";
  });

  if (!isOpen) return null;

  const formatOptions = [
    {
      id: "pdf",
      name: "📄 PDF Document",
      ext: ".pdf",
      badge: "Print-Ready",
      badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
      desc: "Print-ready • Best for clients • Preserves layout exactly • Supports multiple pages",
      icon: <FileText size={24} className="text-blue-600" />,
      disabled: false,
    },
    {
      id: "docx",
      name: "📝 Microsoft Word (.docx)",
      ext: ".docx",
      badge: "Editable",
      badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
      desc: "Editable document • Ideal for making changes later • Preserves headings, tables and formatting",
      icon: <FileCode size={24} className="text-indigo-600" />,
      disabled: false,
    },
    {
      id: "xlsx",
      name: "📊 Excel Spreadsheet (.xlsx)",
      ext: ".xlsx",
      badge: "Coming Soon",
      badgeBg: "bg-slate-100 text-slate-500 border-slate-200",
      desc: "Tabular data export for financial accounting and Tally Prime import",
      icon: <Table size={24} className="text-slate-400" />,
      disabled: true,
    },
    {
      id: "png",
      name: "📷 High-Res Image (.png)",
      ext: ".png",
      badge: "Coming Soon",
      badgeBg: "bg-slate-100 text-slate-500 border-slate-200",
      desc: "PNG image capture for quick social messaging & WhatsApp attachments",
      icon: <ImageIcon size={24} className="text-slate-400" />,
      disabled: true,
    },
    {
      id: "html",
      name: "🌐 HTML Document (.html)",
      ext: ".html",
      badge: "Coming Soon",
      badgeBg: "bg-slate-100 text-slate-500 border-slate-200",
      desc: "Web-ready responsive HTML file for browser embedding & email newsletters",
      icon: <Globe size={24} className="text-slate-400" />,
      disabled: true,
    },
  ];

  const handleSelect = (id, disabled) => {
    if (disabled) return;
    setSelectedFormat(id);
    localStorage.setItem("lastExportFormat", id);
  };

  const handleConfirmExport = () => {
    if (!selectedFormat || isExporting) return;
    onExport(selectedFormat);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
              <Download size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base leading-tight">Export Quotation</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Choose the format in which you want to export this quotation.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body: Selectable Format Cards */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {formatOptions.map((opt) => {
            const isSelected = selectedFormat === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => handleSelect(opt.id, opt.disabled)}
                className={`relative rounded-2xl p-4 border transition-all flex items-start gap-4 ${
                  opt.disabled
                    ? "bg-slate-50/50 border-slate-200/60 opacity-60 cursor-not-allowed"
                    : isSelected
                    ? "bg-gradient-to-r from-blue-50/60 via-white to-white border-blue-600 ring-2 ring-blue-100 shadow-sm cursor-pointer"
                    : "bg-white border-slate-200/90 hover:border-blue-300 hover:bg-slate-50/50 cursor-pointer"
                }`}
              >
                <div className="shrink-0 mt-0.5">{opt.icon}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-extrabold text-slate-900 text-sm">{opt.name}</h4>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${opt.badgeBg}`}>
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">{opt.desc}</p>
                </div>

                {/* Check Mark Indicator */}
                {!opt.disabled && (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isSelected ? "bg-blue-600 text-white" : "border border-slate-300 bg-white"
                  }`}>
                    {isSelected && <Check size={14} />}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmExport}
            disabled={!selectedFormat || isExporting}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
              !selectedFormat || isExporting
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white active:scale-95"
            }`}
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download size={14} />
                <span>Export</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
