import React, { useState, useEffect, useRef, useMemo } from "react";
import MobileHeader from "../../components/mobile/MobileHeader";
import TemplateSelector from "../../components/theme/TemplateSelector";
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
import {
  CorporateBlueTemplate,
  MinimalWhiteTemplate,
  ConstructionTemplate,
  LuxuryGoldTemplate,
  PaintContractorTemplate,
  ModernGradientTemplate,
  ExecutiveProposalTemplate,
  InvoiceHybridTemplate,
  ClassicBusinessTemplate,
  CreativeStudioTemplate
} from "../../components/theme/PDFTemplatesCollection";
import { ExcelNativeTemplate, WordNativeTemplate, ImageNativeTemplate } from "../../components/theme/NativeFormatPreviews";

import QuotationTemplate from "../../components/quotation/QuotationTemplate";
import NativeExportShareSheet from "../../components/export/NativeExportShareSheet";
import { admobManager } from "../../utils/admobManager";
import { localDB } from "../../utils/localDB";
import { normalizeQuotationData } from "../../utils/quotationMapper";
import { getTemplateDetails, getDefaultTemplateForFormat } from "../../utils/templateRegistry";
import { Download, Edit3, AlertCircle, Share2 } from "lucide-react";

// Master Shared Renderer
const TemplateComponent = QuotationTemplate;

export default function Preview({
  goBack, goToDashboard, goToCreate, goToExport,
  goToStorage, goToSettings, goToHelp, quotationId
}) {
  const [quotationData, setQuotationData] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState("pdf");
  const [selectedTemplate, setSelectedTemplate] = useState("modern-proposal");
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);

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
      data = localDB.getDraft ? localDB.getDraft() : null;
    }
    if (!data) {
      const list = localDB.getQuotations();
      if (list && list.length > 0) data = list[0];
    }
    
    if (data) {
      const activeCompany = localDB.getCompanyProfile() || {};
      if (data.projectDetails && !data.projectDetails.companyLogo && activeCompany.companyLogo) {
        data.projectDetails.companyLogo = activeCompany.companyLogo;
      }
      setQuotationData(data);
      const fmt = data.format || localStorage.getItem("activeExportFormat") || "pdf";
      const tpl = data.template || localStorage.getItem("activeExportTemplate") || "modern-proposal";
      setSelectedFormat(fmt);
      setSelectedTemplate(tpl);
    }
  };

  useEffect(() => {
    loadLatestQuotation();

    const handleDataUpdate = () => {
      loadLatestQuotation();
    };

    window.addEventListener("quotationDataUpdated", handleDataUpdate);
    window.addEventListener("storage", handleDataUpdate);

    return () => {
      window.removeEventListener("quotationDataUpdated", handleDataUpdate);
      window.removeEventListener("storage", handleDataUpdate);
    };
  }, [quotationId]);

  // Handle format and template change -> persist immediately in draft & storage
  const handleFormatSelect = (fmtId) => {
    setSelectedFormat(fmtId);
    const defaultTpl = getDefaultTemplateForFormat(fmtId);
    const targetTplId = defaultTpl ? defaultTpl.id : selectedTemplate;
    setSelectedTemplate(targetTplId);
    persistTemplateSelection(fmtId, targetTplId);
  };

  const handleTemplateSelect = (tplId) => {
    setSelectedTemplate(tplId);
    persistTemplateSelection(selectedFormat, tplId);
  };

  const persistTemplateSelection = (fmtId, tplId) => {
    localStorage.setItem("activeExportFormat", fmtId);
    localStorage.setItem("activeExportTemplate", tplId);
    
    if (!quotationData) return;
    const updated = { ...quotationData, format: fmtId, template: tplId };
    setQuotationData(updated);
    if (localDB.saveDraft) {
      localDB.saveDraft(updated);
    } else {
      localStorage.setItem("previewDraft", JSON.stringify(updated));
    }
    if (quotationId) {
      localDB.saveQuotation(updated);
    }
  };

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

  // Two-Finger Pinch Zoom Gestures
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
    setUserZoom((prev) => (prev > 1.1 ? 1.0 : 1.5));
  };

  const handleExportClick = () => {
    admobManager.showInterstitial("Export Quotation");
    if (goToExport) goToExport();
  };

  const handleEditClick = () => {
    let targetStep = 1;
    if (quotationData && typeof quotationData.savedStep === "number") {
      targetStep = quotationData.savedStep;
    } else {
      try {
        const d = localStorage.getItem("previewDraft");
        if (d) {
          const parsed = JSON.parse(d);
          if (parsed.savedStep) targetStep = parsed.savedStep;
        }
      } catch (e) {}
    }
    if (goToCreate) goToCreate(targetStep);
  };

  const TemplateComponent = QuotationTemplate;
  const effectiveScale = scale * userZoom;

  return (
    <div className="bg-slate-100 min-h-screen font-sans pb-44 relative overflow-x-hidden select-none">
      <MobileHeader
        title="Quotation Preview"
        onBack={handleEditClick}
      />

      {/* ── 2-STEP TEMPLATE SELECTOR (Format Tabs + Template Strip) ── */}
      <TemplateSelector
        selectedFormat={selectedFormat}
        selectedTemplate={selectedTemplate}
        onSelectFormat={handleFormatSelect}
        onSelectTemplate={handleTemplateSelect}
        onEdit={handleEditClick}
        onExport={handleExportClick}
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
          selectedFormat === "xlsx" ? (
            <div className="w-full max-w-4xl mx-auto px-2 sm:px-4">
              <ExcelNativeTemplate data={mappedData} />
            </div>
          ) : selectedFormat === "docx" ? (
            <div className="w-full max-w-4xl mx-auto px-2 sm:px-4">
              <WordNativeTemplate data={mappedData} />
            </div>
          ) : selectedFormat === "png" ? (
            <div className="w-full max-w-4xl mx-auto px-2 sm:px-4">
              <ImageNativeTemplate data={mappedData}>
                <div
                  className="relative overflow-hidden rounded-xl shadow-md border border-slate-200 bg-white"
                  style={{
                    width: `${794 * effectiveScale}px`,
                    height:
                      typeof scaledHeight === "string" && scaledHeight.endsWith("px")
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
                    <TemplateComponent data={mappedData} templateKey={selectedTemplate} />
                  </div>
                </div>
              </ImageNativeTemplate>
            </div>
          ) : (
            /* 📄 PDF NATIVE PRINTABLE TEMPLATE VIEW */
            <div
              className="relative overflow-hidden rounded-2xl shadow-md border border-slate-200 bg-white transition-all duration-75"
              style={{
                width: `${794 * effectiveScale}px`,
                height:
                  typeof scaledHeight === "string" && scaledHeight.endsWith("px")
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
                <TemplateComponent data={mappedData} templateKey={selectedTemplate} />
              </div>
            </div>
          )
        ) : (
          <div className="w-full bg-white rounded-2xl p-8 text-center border-2 border-dashed border-slate-200 my-6 shadow-2xs">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={24} />
            </div>
            <p className="text-sm font-black text-slate-800 mb-1">No quotation data available.</p>
            <p className="text-xs text-slate-500 mb-4">Please create and save a quotation before opening Preview.</p>
            <button
              onClick={handleEditClick}
              className="bg-blue-600 text-white text-xs font-bold px-6 py-3 rounded-xl cursor-pointer shadow-md shadow-blue-600/20 active:scale-98 transition-transform"
            >
              + Create Quotation
            </button>
          </div>
        )}
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="fixed bottom-15 left-0 right-0 w-full z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 flex items-center gap-3 print:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <button
          onClick={handleEditClick}
          className="flex-1 h-13 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-100 transition-colors"
        >
          <Edit3 size={15} /> Edit Details
        </button>
        <button
          onClick={handleExportClick}
          className="flex-1 h-13 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer hover:bg-blue-700 transition-colors"
        >
          <Download size={15} /> Export {selectedFormat.toUpperCase()}
        </button>
      </div>

      {/* Native Mobile Share Sheet Bottom Sheet */}
      <NativeExportShareSheet
        isOpen={isShareSheetOpen}
        onClose={() => setIsShareSheetOpen(false)}
        quotationData={mappedData}
        pdfElementRef={templateRef}
      />
    </div>
  );
}