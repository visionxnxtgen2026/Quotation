import React, { useState, useEffect, useRef, useMemo } from "react";
import MobileHeader from "../../components/mobile/MobileHeader";
import EnterpriseQuotationLayout from "../../components/theme/EnterpriseQuotationLayout";
import ClassicTemplate from "../../components/theme/ClassicTemplate";
import ModernTemplate from "../../components/theme/ModernTemplate";
import CorporateTemplate from "../../components/theme/CorporateTemplate";
import CompactTemplate from "../../components/theme/CompactTemplate";
import CreativeTemplate from "../../components/theme/CreativeTemplate";
import GroupedTemplate from "../../components/theme/GroupedTemplate";
import ObsidianTemplate from "../../components/theme/ObsidianTemplate";
import SovereignTemplate from "../../components/theme/SovereignTemplate";
import ExecutiveTemplate from "../../components/theme/ExecutiveTemplate";
import BusinessProTemplate from "../../components/theme/BusinessProTemplate";
import EnterpriseTemplate from "../../components/theme/EnterpriseTemplate";
import ContractorTemplate from "../../components/theme/ContractorTemplate";
import SignatureTemplate from "../../components/theme/SignatureTemplate";

import { admobManager } from "../../utils/admobManager";
import { localDB } from "../../utils/localDB";
import { normalizeQuotationData } from "../../utils/quotationMapper";
import {
  Download, Edit3, Share2, Layers, CheckCircle2, AlertCircle, ZoomIn, ZoomOut, RotateCcw
} from "lucide-react";

// Template Map Dictionary with Safe Fallbacks
const templateMap = {
  classic: EnterpriseQuotationLayout,
  enterprise: EnterpriseQuotationLayout,
  corporate: EnterpriseQuotationLayout,
  modern: ModernTemplate,
  compact: CompactTemplate,
  creative: CreativeTemplate,
  grouped: GroupedTemplate,
  obsidian: ObsidianTemplate,
  sovereign: SovereignTemplate,
  executive: ExecutiveTemplate,
  business: BusinessProTemplate,
  businesspro: BusinessProTemplate,
  contractor: ContractorTemplate,
  signature: SignatureTemplate,
};

const TEMPLATE_LIST = [
  { id: "classic",     name: "Classic" },
  { id: "modern",      name: "Modern" },
  { id: "corporate",   name: "Corporate" },
  { id: "compact",     name: "Compact" },
  { id: "creative",    name: "Creative" },
  { id: "grouped",     name: "Grouped" },
  { id: "executive",   name: "Executive" },
  { id: "businesspro", name: "Business Pro" },
  { id: "enterprise",  name: "Enterprise" },
  { id: "contractor",  name: "Contractor" },
  { id: "signature",   name: "Signature" },
  { id: "obsidian",    name: "Obsidian" },
  { id: "sovereign",   name: "Sovereign" },
];

export default function Preview({
  goBack, goToDashboard, goToCreate, goToExport,
  goToStorage, goToSettings, goToHelp, quotationId
}) {
  const [quotationData, setQuotationData] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [showTemplateSheet, setShowTemplateSheet] = useState(false);

  const [scale, setScale] = useState(0.48);
  const [userZoom, setUserZoom] = useState(1);
  const [scaledHeight, setScaledHeight] = useState("auto");
  const wrapperRef = useRef(null);
  const templateRef = useRef(null);
  const touchStartDistRef = useRef(0);
  const initialZoomRef = useRef(1);

  const loadLatestQuotation = () => {
    let data = null;
    if (quotationId) {
      data = localDB.getQuotationById(quotationId);
    }
    if (!data) {
      const draft = localStorage.getItem("previewDraft");
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          if (parsed && (parsed.clientName || parsed.projectDetails?.clientName || parsed.rateSections?.length > 0)) {
            data = parsed;
          }
        } catch (e) {
          console.error("Error reading preview draft:", e);
        }
      }
    }
    if (!data) {
      const list = localDB.getQuotations();
      if (list && list.length > 0) data = list[0];
    }
    setQuotationData(data);
  };

  useEffect(() => {
    loadLatestQuotation();
    const savedTheme = localStorage.getItem("selectedTemplate") || "classic";
    if (templateMap[savedTheme]) {
      setSelectedTemplate(savedTheme);
    }

    const handleDataUpdate = () => {
      console.log("[Preview] Real-time quotation data update event received.");
      loadLatestQuotation();
    };

    window.addEventListener("quotationDataUpdated", handleDataUpdate);
    window.addEventListener("storage", handleDataUpdate);

    return () => {
      window.removeEventListener("quotationDataUpdated", handleDataUpdate);
      window.removeEventListener("storage", handleDataUpdate);
    };
  }, [quotationId]);

  // Unified Data Mapping Model using Centralized Normalizer
  const mappedData = useMemo(() => {
    return normalizeQuotationData(quotationData);
  }, [quotationData]);

  // Dynamic Base Scale Calculation
  useEffect(() => {
    const updateScale = () => {
      if (wrapperRef.current) {
        const containerWidth = wrapperRef.current.clientWidth - 16;
        const templateWidth = 794;
        const newScale = Math.min(1, Math.max(0.32, containerWidth / templateWidth));
        setScale(newScale);

        if (templateRef.current) {
          const fullHeight = templateRef.current.scrollHeight;
          setScaledHeight(`${fullHeight * newScale + 24}px`);
        }
      }
    };

    updateScale();
    const timer = setTimeout(updateScale, 150);
    window.addEventListener("resize", updateScale);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateScale);
    };
  }, [mappedData, selectedTemplate]);

  // Two-Finger Pinch Zoom Gestures inside Preview Document
  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistRef.current = dist;
      initialZoomRef.current = userZoom;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches.length === 2 && touchStartDistRef.current > 0) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / touchStartDistRef.current;
      const newZoom = Math.min(2.8, Math.max(1.0, initialZoomRef.current * factor));
      setUserZoom(newZoom);
    }
  };

  const handleDoubleTapReset = () => {
    setUserZoom(prev => (prev > 1.1 ? 1.0 : 1.5));
  };

  const handleExportClick = () => {
    admobManager.showInterstitial("Export PDF");
    goToExport();
  };

  // Safe Fallback: Defaults to ClassicTemplate if theme key is missing or undefined
  const TemplateComponent = templateMap[selectedTemplate] || ClassicTemplate;
  const effectiveScale = scale * userZoom;

  return (
    <div className="bg-slate-100 min-h-screen font-sans pb-44 relative overflow-x-hidden select-none">
      <MobileHeader
        title="Quotation Preview"
        onBack={goBack || goToDashboard}
        right={
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowTemplateSheet(true)}
              className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center cursor-pointer shrink-0 active:scale-95 transition-all"
              title="Select Document Theme"
              aria-label="Theme"
            >
              <Layers size={18} className="text-blue-600" />
            </button>
            <button
              onClick={handleExportClick}
              className="px-3.5 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm active:bg-blue-700 cursor-pointer shrink-0 transition-all"
            >
              <Download size={15} className="shrink-0" />
              <span>Export</span>
            </button>
          </div>
        }
      />

      {/* 100% Mobile Responsive Document Viewport Container */}
      <div
        ref={wrapperRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onDoubleClick={handleDoubleTapReset}
        className="w-full max-w-full flex justify-center px-2 py-3 overflow-x-auto box-border allow-pinch-zoom touch-pan-x touch-pan-y"
      >
        {mappedData ? (
          <div
            className="relative overflow-hidden rounded-2xl shadow-md border border-slate-200 bg-white transition-all duration-75"
            style={{
              width: `${794 * effectiveScale}px`,
              height: typeof scaledHeight === "string" && scaledHeight.endsWith("px")
                ? `${parseFloat(scaledHeight) * userZoom}px`
                : scaledHeight,
            }}
          >
            <div
              ref={templateRef}
              style={{
                width: "794px",
                transform: `scale(${effectiveScale})`,
                transformOrigin: "top left",
              }}
              className="bg-white text-slate-900 font-sans p-1"
            >
              <TemplateComponent data={mappedData} />
            </div>
          </div>
        ) : (
          <div className="w-full bg-white rounded-2xl p-8 text-center border-2 border-dashed border-slate-200 my-6 shadow-2xs">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={24} />
            </div>
            <p className="text-sm font-black text-slate-800 mb-1">No quotation data available.</p>
            <p className="text-xs text-slate-500 mb-4">Please create and save a quotation before opening Preview.</p>
            <button
              onClick={goToCreate}
              className="bg-blue-600 text-white text-xs font-bold px-6 py-3 rounded-xl cursor-pointer shadow-md shadow-blue-600/20 active:scale-98 transition-transform"
            >
              + Create Quotation
            </button>
          </div>
        )}
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="fixed bottom-15 left-0 right-0 w-full z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 flex items-center gap-3 print:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <button onClick={goToCreate} className="flex-1 h-13 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer">
          <Edit3 size={15} /> Edit
        </button>
        <button onClick={handleExportClick} className="flex-1 h-13 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer">
          <Download size={15} /> Export PDF
        </button>
      </div>

      {/* Template Chooser Material Sheet */}
      {showTemplateSheet && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setShowTemplateSheet(false)} />
          <div className="relative bg-white rounded-t-3xl p-5 shadow-2xl space-y-3 max-h-[70vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-2" />
            <p className="font-bold text-slate-900 text-sm">Select Document Theme</p>
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {TEMPLATE_LIST.map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTemplate(t.id);
                    localStorage.setItem("selectedTemplate", t.id);
                    setShowTemplateSheet(false);
                  }}
                  className={`p-3 rounded-xl border text-xs font-bold text-left flex items-center justify-between cursor-pointer ${
                    selectedTemplate === t.id ? "bg-blue-50 border-blue-600 text-blue-700" : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  {t.name}
                  {selectedTemplate === t.id && <CheckCircle2 size={14} className="text-blue-600 shrink-0" />}
                </button>
              ))}
            </div>
            <button onClick={() => setShowTemplateSheet(false)} className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer mt-3">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}