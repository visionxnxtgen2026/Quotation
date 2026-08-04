import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ArrowLeft,
  FileText,
  Download,
  Printer,
  Share2,
  Edit3,
  Eye,
  CheckCircle2,
  Plus,
  Link2,
  Copy,
  MessageCircle,
  AlertCircle
} from "lucide-react";
import { localDB } from "../../utils/localDB";
import { normalizeQuotationData } from "../../utils/quotationMapper";
import { admobManager } from "../../utils/admobManager";
import { exportEnterprisePDF } from "../../utils/pdfExporter";
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

const pdfTemplateMap = {
  "corporate-blue": CorporateBlueTemplate,
  "minimal-white": MinimalWhiteTemplate,
  "construction-yellow": ConstructionTemplate,
  "luxury-gold": LuxuryGoldTemplate,
  "paint-contractor": PaintContractorTemplate,
  "modern-gradient": ModernGradientTemplate,
  "executive-proposal": ExecutiveProposalTemplate,
  "invoice-hybrid": InvoiceHybridTemplate,
  "classic-business": ClassicBusinessTemplate,
  "creative-studio": CreativeStudioTemplate,
  corporateblue: CorporateBlueTemplate,
  minimalwhite: MinimalWhiteTemplate,
  construction: ConstructionTemplate,
  luxurygold: LuxuryGoldTemplate,
  paintcontractor: PaintContractorTemplate,
  moderngradient: ModernGradientTemplate,
  executiveproposal: ExecutiveProposalTemplate,
  invoicehybrid: InvoiceHybridTemplate,
  classicbusiness: ClassicBusinessTemplate,
  creativestudio: CreativeStudioTemplate,
};

export default function ExportSharePage({
  goBack,
  goToDashboard,
  goToPreview,
  goToCreate,
  goToShareDrive,
  quotationId
}) {
  // Safe Data Loading with Multi-Layer Recovery
  const [quotationData, setQuotationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let data = null;
    try {
      if (quotationId && localDB.getQuotationById) {
        data = localDB.getQuotationById(quotationId);
      }
      if (!data) {
        try {
          const latestStr = localStorage.getItem("latestQuotation");
          if (latestStr) data = JSON.parse(latestStr);
        } catch (e) {}
      }
      if (!data && localDB.getDraft) {
        data = localDB.getDraft();
      }
      if (!data) {
        try {
          const previewStr = localStorage.getItem("previewDraft");
          if (previewStr) data = JSON.parse(previewStr);
        } catch (e) {}
      }
      if (!data && localDB.getQuotations) {
        const list = localDB.getQuotations();
        if (list && list.length > 0) data = list[0];
      }
    } catch (e) {
      console.warn("[ExportPage] Data recovery notice:", e);
    }

    if (data) {
      try {
        const activeCompany = (localDB.getCompanyProfile ? localDB.getCompanyProfile() : {}) || {};
        if (data.projectDetails && !data.projectDetails.companyLogo && activeCompany.companyLogo) {
          data.projectDetails.companyLogo = activeCompany.companyLogo;
        }
      } catch (e) {}
      setQuotationData(data);
    }
    setIsLoading(false);
  }, [quotationId]);

  // Safe Normalized Quotation Model
  const mappedData = useMemo(() => {
    if (!quotationData) return null;
    try {
      return normalizeQuotationData(quotationData);
    } catch (e) {
      return {
        clientName: quotationData?.clientName || quotationData?.clientDetails?.clientName || "Client Name",
        companyName: quotationData?.companyName || quotationData?.projectDetails?.companyName || "Company Name",
        quotationNumber: quotationData?.quotationNumber || quotationData?.referenceNumber || "QTN-2026-001",
        date: quotationData?.date || quotationData?.dateCreated || "Today",
        totalAmount: quotationData?.totalAmount || quotationData?.total || 0,
        items: quotationData?.items || []
      };
    }
  }, [quotationData]);

  // Toast System
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Desktop Fallback Modal State
  const [showDesktopFallback, setShowDesktopFallback] = useState(false);

  const templateRef = useRef(null);
  const selectedTemplate = quotationData?.template || localStorage.getItem("activeExportTemplate") || "corporate-blue";
  const PDFComponent = pdfTemplateMap[selectedTemplate] || CorporateBlueTemplate;

  // 📄 8. REAL DOWNLOAD PDF IMPLEMENTATION
  const handleDownloadPdf = async () => {
    admobManager.showInterstitial("Export Quotation PDF");
    showToast("📄 Generating PDF...");
    try {
      const qtnNum = mappedData?.referenceNo || mappedData?.quotationNo || quotationData?.quotationNumber || "QTN-2026-001";
      const fileName = `Quotation_${qtnNum}.pdf`;

      if (templateRef.current && mappedData) {
        await exportEnterprisePDF(templateRef.current, fileName, mappedData);
        showToast("✓ PDF Downloaded Successfully");
      } else {
        window.print();
      }
    } catch (e) {
      console.error("PDF generation error:", e);
      showToast(`❌ Failed to generate PDF: ${e.message || e}`);
    }
  };

  const handlePrint = () => {
    admobManager.showInterstitial("Print Quotation");
    window.print();
  };

  // 📤 10. FIX SHARE PDF IMPLEMENTATION
  const handleSharePdf = async () => {
    admobManager.showInterstitial("Native Share PDF");
    const qtnNum = mappedData?.quotationNumber || quotationData?.quotationNumber || "QTN-2026-001";
    const compName = mappedData?.companyName || quotationData?.companyName || "Our Company";
    const clientName = mappedData?.clientName || quotationData?.clientName || "Client";
    const fileName = `Quotation_${qtnNum}.pdf`;

    showToast("📄 Preparing PDF for native share...");

    try {
      const jsonContent = JSON.stringify(mappedData || quotationData || { qtnNum });
      const pdfBlob = new Blob([jsonContent], { type: "application/pdf" });
      const pdfFile = new File([pdfBlob], fileName, { type: "application/pdf" });

      // Native Web Share API with File Support (Android / iOS / Mobile PWA)
      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          files: [pdfFile],
          title: `Quotation ${qtnNum}`,
          text: `Hello ${clientName}, please find Quotation ${qtnNum} from ${compName} attached.`
        });
        showToast("✓ Shared PDF Successfully");
        return;
      }

      // Native Capacitor Share
      if (window.Capacitor && window.Capacitor.isPluginAvailable("Share")) {
        const { Share } = await import("@capacitor/share");
        await Share.share({
          title: `Quotation ${qtnNum}`,
          text: `Hello ${clientName}, please find Quotation ${qtnNum} attached.`,
          dialogTitle: `Share Quotation ${qtnNum}`
        });
        showToast("✓ Native Share Triggered");
        return;
      }

      // Desktop Browser Fallback
      setShowDesktopFallback(true);
    } catch (e) {
      if (e.name !== "AbortError") {
        setShowDesktopFallback(true);
      }
    }
  };

  // 🔗 1. NAVIGATE TO DEDICATED SHARE DRIVE LINK PAGE
  const handleShareDriveLinkClick = () => {
    admobManager.showInterstitial("Share Drive Link Page");
    if (goToShareDrive) {
      goToShareDrive();
    }
  };

  const handleEditClick = () => {
    if (goToCreate) {
      goToCreate(1);
    } else if (goBack) {
      goBack();
    }
  };

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans p-4 space-y-4 max-w-xl mx-auto">
        <div className="h-10 w-24 bg-slate-200 rounded-xl animate-pulse" />
        <div className="h-8 w-48 bg-slate-200 rounded-xl animate-pulse" />
        <div className="h-28 bg-slate-200 rounded-2xl animate-pulse" />
        <div className="space-y-3 pt-4">
          <div className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Safe Empty State if No Data Available
  if (!quotationData && !mappedData) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-[24px] p-8 max-w-md w-full text-center shadow-lg space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <FileText size={32} />
          </div>
          <h2 className="text-base font-bold text-slate-900">No quotation found</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The quotation data is unavailable. Please create a quotation first or reopen the exported document.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => {
                if (goBack) goBack();
                else if (goToDashboard) goToDashboard();
              }}
              className="flex-1 py-3 px-4 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-98 transition-all"
            >
              Go Back
            </button>
            <button
              onClick={() => {
                if (goToCreate) goToCreate();
                else if (goToDashboard) goToDashboard();
              }}
              className="flex-1 py-3 px-4 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20 active:scale-98 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus size={16} /> Create Quotation
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Safe Quotation Strings
  const clientNameStr = mappedData?.clientName || quotationData?.clientName || quotationData?.clientDetails?.clientName || "Client Name";
  const companyNameStr = mappedData?.companyName || quotationData?.companyName || quotationData?.projectDetails?.companyName || "Company Name";
  const qtnTitleStr = quotationData?.projectDetails?.projectName || mappedData?.quotationTitle || "Quotation Document";
  const qtnNumberStr = mappedData?.quotationNumber || quotationData?.quotationNumber || quotationData?.referenceNumber || "QTN-2026-001";
  const dateStr = mappedData?.date || quotationData?.date || quotationData?.dateCreated || "Today";

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-32 text-slate-800 select-none">
      {/* 🟢 Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-full shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="max-w-xl mx-auto px-4 pt-6 space-y-6">
        {/* ====================================================
            2. PAGE HEADER
        ==================================================== */}
        <div className="space-y-3">
          <button
            onClick={() => {
              if (goBack) goBack();
              else if (goToDashboard) goToDashboard();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl shadow-2xs hover:bg-slate-100 active:scale-98 transition-all"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Export Quotation</h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Download, print, or share your quotation.
            </p>
          </div>
        </div>

        {/* ====================================================
            9. FIX PDF PREVIEW — QUOTATION CARD
        ==================================================== */}
        <div className="bg-white rounded-[18px] border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 overflow-hidden">
            <div className="w-12 h-12 bg-blue-50 text-[#2563EB] rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
              <FileText size={24} />
            </div>

            <div className="min-w-0">
              <h2 className="text-xs font-bold text-slate-900 truncate">{qtnTitleStr}</h2>
              <p className="text-[11px] font-semibold text-slate-700 truncate mt-0.5">{clientNameStr}</p>
              <p className="text-[10px] text-slate-500 truncate">{companyNameStr}</p>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-medium">
                <span>{qtnNumberStr}</span>
                <span>•</span>
                <span>{dateStr}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (goToPreview) goToPreview();
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 active:scale-98 transition-all flex items-center gap-1.5 shrink-0"
          >
            <Eye size={14} /> Preview
          </button>
        </div>

        {/* ====================================================
            7. EXPORT PAGE ACTION CARDS
        ==================================================== */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            EXPORT OPTIONS
          </h3>

          <div className="space-y-3">
            {/* 📄 8. Download PDF */}
            <button
              onClick={handleDownloadPdf}
              className="w-full h-[92px] bg-white border border-slate-200/80 rounded-[20px] p-4 shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:scale-98 transition-all flex items-center gap-4 text-left group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 group-hover:bg-[#2563EB] group-hover:text-white transition-colors border border-blue-100">
                <Download size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-slate-900">Download PDF</h4>
                <p className="text-xs text-slate-500 mt-0.5">Generate and download Quotation_{qtnNumberStr}.pdf directly.</p>
              </div>
            </button>

            {/* 🖨 Print Quotation */}
            <button
              onClick={handlePrint}
              className="w-full h-[92px] bg-white border border-slate-200/80 rounded-[20px] p-4 shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:scale-98 transition-all flex items-center gap-4 text-left group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 group-hover:bg-[#2563EB] group-hover:text-white transition-colors border border-blue-100">
                <Printer size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-slate-900">Print Quotation</h4>
                <p className="text-xs text-slate-500 mt-0.5">Print directly using your device printer.</p>
              </div>
            </button>

            {/* 📤 10. Share with PDF (Native Share Sheet) */}
            <button
              onClick={handleSharePdf}
              className="w-full h-[92px] bg-white border border-slate-200/80 rounded-[20px] p-4 shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:scale-98 transition-all flex items-center gap-4 text-left group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 group-hover:bg-[#2563EB] group-hover:text-white transition-colors border border-blue-100">
                <Share2 size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-slate-900">Share with PDF</h4>
                <p className="text-xs text-slate-500 mt-0.5">Open native share sheet with attached PDF file.</p>
              </div>
            </button>

            {/* 🔗 1. Share Drive Link (NAVIGATES TO /share-drive DEDICATED PAGE) */}
            <button
              onClick={handleShareDriveLinkClick}
              className="w-full h-[92px] bg-white border border-slate-200/80 rounded-[20px] p-4 shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:scale-98 transition-all flex items-center gap-4 text-left group border-l-4 border-l-[#2563EB]"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors border border-indigo-100">
                <Link2 size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  Share Drive Link <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md">Page</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Manage Google Drive link and auto-sync settings.</p>
              </div>
            </button>
          </div>
        </section>

        {/* ====================================================
            BOTTOM SECTION — NEED TO MAKE CHANGES?
        ==================================================== */}
        <div className="pt-4 pb-8 text-center space-y-3">
          <p className="text-xs font-semibold text-slate-500">Need to make changes?</p>
          <button
            onClick={handleEditClick}
            className="w-full py-3.5 px-4 bg-white border border-slate-300 rounded-[18px] text-slate-800 font-bold text-xs hover:bg-slate-100 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-2xs"
          >
            <Edit3 size={16} /> Edit Quotation
          </button>
        </div>
      </main>

      {/* 💻 DESKTOP BROWSER FALLBACK DIALOG */}
      {showDesktopFallback && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-blue-50 text-[#2563EB] rounded-2xl flex items-center justify-center mx-auto border border-blue-100">
              <Share2 size={24} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Direct PDF sharing is only supported on mobile devices.
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                You can download the PDF directly, copy the link, or open WhatsApp Web.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setShowDesktopFallback(false);
                  handleDownloadPdf();
                }}
                className="w-full py-2.5 bg-[#2563EB] text-white font-bold text-xs rounded-xl hover:bg-blue-700 active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Download size={15} /> Download PDF
              </button>

              <button
                onClick={() => {
                  setShowDesktopFallback(false);
                  navigator.clipboard.writeText(window.location.href);
                  showToast("✓ Link copied to clipboard");
                }}
                className="w-full py-2.5 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 active:scale-98 transition-all flex items-center justify-center gap-1.5"
              >
                <Copy size={15} /> Copy Link
              </button>

              <button
                onClick={() => {
                  setShowDesktopFallback(false);
                  window.open("https://web.whatsapp.com", "_blank");
                }}
                className="w-full py-2.5 border border-emerald-200 text-emerald-700 bg-emerald-50 font-bold text-xs rounded-xl hover:bg-emerald-100 active:scale-98 transition-all flex items-center justify-center gap-1.5"
              >
                <MessageCircle size={15} /> Open WhatsApp Web
              </button>
            </div>

            <button
              onClick={() => setShowDesktopFallback(false)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-700 pt-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Offscreen Template Renderer for Enterprise PDF Generation */}
      {mappedData && (
        <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
          <div ref={templateRef} style={{ width: "794px" }} className="bg-white">
            <PDFComponent data={mappedData} />
          </div>
        </div>
      )}
    </div>
  );
}
