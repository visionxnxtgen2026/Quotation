import React, { useState } from "react";
import MobileHeader from "../../components/mobile/MobileHeader";
import {
  FORMAT_TYPES,
  TEMPLATE_COLLECTIONS,
} from "../../utils/templateRegistry";
import { Check, Sparkles, FileText, FileCode, Sheet, Image as ImageIcon } from "lucide-react";

export default function ExportTemplatesScreen({ onBack }) {
  const [activeFormat, setActiveFormat] = useState("pdf");

  const getFormatIcon = (fmtId) => {
    switch (fmtId) {
      case "docx":
        return <FileCode size={18} className="text-blue-600" />;
      case "xlsx":
        return <Sheet size={18} className="text-emerald-600" />;
      case "png":
        return <ImageIcon size={18} className="text-purple-600" />;
      case "pdf":
      default:
        return <FileText size={18} className="text-red-600" />;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-24">
      <MobileHeader title="Export Templates" onBack={onBack} />

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Sparkles size={140} />
          </div>
          <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-[11px] font-bold rounded-full border border-blue-400/30 uppercase tracking-wider">
            Template Architecture
          </span>
          <h1 className="text-2xl font-black mt-2 tracking-tight">Export Template Collections</h1>
          <p className="text-sm text-slate-300 font-medium mt-1 max-w-xl">
            Independent template collections built natively for every export format (PDF, Word, Excel, and Image).
          </p>
        </div>

        {/* Format Selection Tabs */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs gap-1 overflow-x-auto">
          {FORMAT_TYPES.map((fmt) => {
            const isSelected = activeFormat === fmt.id;
            return (
              <button
                key={fmt.id}
                onClick={() => setActiveFormat(fmt.id)}
                className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {getFormatIcon(fmt.id)}
                <span>{fmt.name}</span>
              </button>
            );
          })}
        </div>

        {/* Template Grid for Active Format */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              {FORMAT_TYPES.find((f) => f.id === activeFormat)?.name} Templates
            </h2>
            <span className="text-xs font-semibold text-slate-400">
              {TEMPLATE_COLLECTIONS[activeFormat]?.length || 0} Available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEMPLATE_COLLECTIONS[activeFormat]?.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-3.5 h-3.5 rounded-full ${tpl.color} shadow-xs`} />
                      <h3 className="text-base font-bold text-slate-900">{tpl.name}</h3>
                    </div>
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold text-[10px] uppercase tracking-wider rounded-md border border-slate-200">
                      {tpl.format.toUpperCase()} ONLY
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium">{tpl.subtitle}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                  <span className="text-[11px] font-mono text-slate-400">ID: {tpl.id}</span>
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                    <Check size={14} /> Registered
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
