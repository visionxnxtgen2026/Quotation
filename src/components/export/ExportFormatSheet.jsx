import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ChevronRight } from "lucide-react";

const FORMATS = [
  {
    id: "pdf",
    icon: "📄",
    label: "PDF Document",
    desc: "High quality printable PDF",
    badge: "Recommended",
    badgeColor: "bg-blue-50 text-blue-700",
    enabled: true,
  },
  {
    id: "docx",
    icon: "📝",
    label: "Word Document",
    desc: "Editable .docx file",
    badge: "DOCX",
    badgeColor: "bg-indigo-50 text-indigo-700",
    enabled: true,
  },
  {
    id: "png",
    icon: "🖼",
    label: "PNG Image",
    desc: "Single image snapshot",
    badge: "Image",
    badgeColor: "bg-purple-50 text-purple-700",
    enabled: true,
  },
  {
    id: "multi_pdf",
    icon: "📑",
    label: "Multi‑Page PDF",
    desc: "One page per section",
    badge: "Multi‑page",
    badgeColor: "bg-emerald-50 text-emerald-700",
    enabled: true,
  },
  {
    id: "xlsx",
    icon: "📊",
    label: "Excel Spreadsheet",
    desc: "Quotation data sheet",
    badge: "Coming Soon",
    badgeColor: "bg-slate-100 text-slate-400",
    enabled: false,
  },
];

export default function ExportFormatSheet({ isOpen, onClose, onGenerate }) {
  const [selected, setSelected] = useState("pdf");

  const handleGenerate = () => {
    const fmt = FORMATS.find((f) => f.id === selected);
    if (fmt && fmt.enabled) onGenerate(selected, fmt);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: "100%", opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 340, mass: 0.9 }}
            className="fixed bottom-0 left-0 right-0 z-[100] bg-white rounded-t-[28px] shadow-2xl"
            style={{ maxHeight: "90vh", overflowY: "auto" }}
          >
            {/* Handle pill */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-200" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-4 pb-2">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Export Quotation</h2>
                <p className="text-sm text-slate-500 font-medium mt-0.5">Choose the format you want to export.</p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer shrink-0 mt-0.5"
              >
                <X size={16} className="text-slate-600" />
              </button>
            </div>

            {/* Format List */}
            <div className="px-5 pt-3 pb-2 space-y-2.5">
              {FORMATS.map((fmt, i) => {
                const isSelected = selected === fmt.id;
                return (
                  <motion.button
                    key={fmt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.22 }}
                    onClick={() => fmt.enabled && setSelected(fmt.id)}
                    disabled={!fmt.enabled}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                      !fmt.enabled
                        ? "opacity-45 cursor-not-allowed border-slate-100 bg-slate-50"
                        : isSelected
                        ? "border-blue-500 bg-blue-50/60 shadow-sm"
                        : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50 cursor-pointer"
                    }`}
                    style={isSelected ? {} : {}}
                  >
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-colors ${
                        isSelected ? "bg-blue-100" : "bg-slate-100"
                      }`}
                    >
                      {fmt.icon}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-sm font-bold ${
                            isSelected ? "text-blue-900" : "text-slate-900"
                          }`}
                        >
                          {fmt.label}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${fmt.badgeColor}`}>
                          {fmt.badge}
                        </span>
                      </div>
                      <p
                        className={`text-xs font-medium mt-0.5 ${
                          isSelected ? "text-blue-600" : "text-slate-500"
                        }`}
                      >
                        {fmt.desc}
                      </p>
                    </div>

                    {/* Radio indicator */}
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-500"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            key="check"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 22 }}
                          >
                            <Check size={13} className="text-white stroke-[3]" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Generate Button */}
            <div className="px-5 pt-4 pb-10">
              <motion.button
                onClick={handleGenerate}
                whileTap={{ scale: 0.97 }}
                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-2xl py-4 text-base font-black tracking-wide flex items-center justify-center gap-2.5 shadow-lg shadow-blue-500/25 transition-colors cursor-pointer"
              >
                <span>Generate Export</span>
                <ChevronRight size={18} className="stroke-[2.5]" />
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
