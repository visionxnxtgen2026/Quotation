import React, { useState, useMemo, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import MobileHeader from "../../components/mobile/MobileHeader";
import { localDB } from "../../utils/localDB";
import { normalizeQuotationData } from "../../utils/quotationMapper";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { googleDriveProvider, triggerAutoSync } from "../../utils/googleDriveProvider";

// Template renderers (off-screen PDF capture)
import EnterpriseQuotationLayout from "../../components/theme/EnterpriseQuotationLayout.jsx";
import ClassicTemplate from "../../components/theme/ClassicTemplate.jsx";
import ModernTemplate from "../../components/theme/ModernTemplate.jsx";
import CorporateTemplate from "../../components/theme/CorporateTemplate.jsx";
import CompactTemplate from "../../components/theme/CompactTemplate.jsx";
import CreativeTemplate from "../../components/theme/CreativeTemplate.jsx";
import GroupedTemplate from "../../components/theme/GroupedTemplate.jsx";
import ObsidianTemplate from "../../components/theme/ObsidianTemplate.jsx";
import SovereignTemplate from "../../components/theme/SovereignTemplate.jsx";
import ExecutiveTemplate from "../../components/theme/ExecutiveTemplate.jsx";
import BusinessProTemplate from "../../components/theme/BusinessProTemplate.jsx";
import EnterpriseTemplate from "../../components/theme/EnterpriseTemplate.jsx";
import ContractorTemplate from "../../components/theme/ContractorTemplate.jsx";
import SignatureTemplate from "../../components/theme/SignatureTemplate.jsx";

// Export flow components
import ExportFormatSheet from "../../components/export/ExportFormatSheet.jsx";
import ExportLoadingScreen from "../../components/export/ExportLoadingScreen.jsx";
import ExportSuccessScreen from "../../components/export/ExportSuccessScreen.jsx";

/**
 * Export page — 3-step premium export flow
 *
 *  Phase 1: "selecting"  → ExportFormatSheet bottom sheet opens immediately
 *  Phase 2: "generating" → ExportLoadingScreen fullscreen overlay
 *  Phase 3: "success"    → ExportSuccessScreen with all sharing actions
 */
export default function Export({
  goBack, goToPreview, goToDashboard,
  quotationId,
}) {
  const { isOnline } = useNetworkStatus();

  // ── Phase state machine ──────────────────────────────────────────────────
  // "selecting" | "generating" | "success"
  const [phase, setPhase] = useState("selecting");
  const [sheetOpen, setSheetOpen] = useState(true);

  // Generated file state
  const [exportedBlob, setExportedBlob] = useState(null);
  const [exportedFilename, setExportedFilename] = useState("");
  const [activeFormatId, setActiveFormatId] = useState("pdf");
  const [activeFormatLabel, setActiveFormatLabel] = useState("PDF");

  // Google Drive state
  const [isUploadingDrive, setIsUploadingDrive] = useState(false);
  const [driveResult, setDriveResult] = useState(() => {
    if (quotationId) {
      const q = localDB.getQuotationById(quotationId);
      return q?.driveUrl ? { driveUrl: q.driveUrl } : null;
    }
    return null;
  });

  const pdfContainerRef = useRef(null);
  const selectedTemplate = localStorage.getItem("selectedTemplate") || "classic";

  // ── Quotation data ───────────────────────────────────────────────────────
  const quotationData = useMemo(() => {
    let data = null;
    if (quotationId) data = localDB.getQuotationById(quotationId);
    if (!data) {
      const draft = localStorage.getItem("previewDraft");
      if (draft) { try { data = JSON.parse(draft); } catch {} }
    }
    if (!data) {
      const list = localDB.getQuotations();
      if (list?.length > 0) data = list[0];
    }
    return data;
  }, [quotationId]);

  const mappedData = useMemo(() => normalizeQuotationData(quotationData), [quotationData]);

  const refNo = mappedData?.quotationNo || mappedData?.referenceNo || "QTN-2026";
  const baseFilename = `Quotation_${refNo.replace(/[^a-zA-Z0-9-]/g, "_")}`;

  // ── Off-screen template renderer ────────────────────────────────────────
  const RenderSelectedTemplate = () => {
    if (!mappedData) return null;
    const props = { data: mappedData };
    switch (selectedTemplate) {
      case "modern":      return <ModernTemplate {...props} />;
      case "compact":     return <CompactTemplate {...props} />;
      case "creative":    return <CreativeTemplate {...props} />;
      case "grouped":     return <GroupedTemplate {...props} />;
      case "obsidian":    return <ObsidianTemplate {...props} />;
      case "sovereign":   return <SovereignTemplate {...props} />;
      case "executive":   return <ExecutiveTemplate {...props} />;
      case "businesspro": return <BusinessProTemplate {...props} />;
      case "contractor":  return <ContractorTemplate {...props} />;
      case "signature":   return <SignatureTemplate {...props} />;
      case "corporate":
      case "enterprise":
      case "classic":
      default: return <EnterpriseQuotationLayout {...props} />;
    }
  };

  // ── Core export engine ───────────────────────────────────────────────────
  const runExport = async (formatId, fmt) => {
    const pdfFilename = `${baseFilename}.pdf`;

    if (formatId === "pdf" || formatId === "multi_pdf") {
      const element = pdfContainerRef.current || document.getElementById("quotation-pdf-container");
      if (!element) throw new Error("PDF container not found");
      const { exportEnterprisePDF } = await import("../../utils/pdfExporter.js");
      const { pdf, cleanBase64 } = await exportEnterprisePDF(element, pdfFilename, mappedData || {});
      const blob = pdf.output("blob");
      return { blob, filename: pdfFilename, cleanBase64 };
    }

    if (formatId === "docx") {
      const element = pdfContainerRef.current || document.getElementById("quotation-pdf-container");
      const docxFilename = `${baseFilename}.docx`;
      const { WordGenerator } = await import("../../utils/exportService.js");
      const result = await WordGenerator.generate(element, docxFilename, mappedData || {});
      return { blob: result.blob, filename: result.filename };
    }

    if (formatId === "png") {
      const element = pdfContainerRef.current || document.getElementById("quotation-pdf-container");
      if (!element) throw new Error("Container not found");
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      const pngBlob = await new Promise((res) => canvas.toBlob(res, "image/png", 1.0));
      return { blob: pngBlob, filename: `${baseFilename}.png` };
    }

    throw new Error(`Format "${formatId}" is not yet supported.`);
  };

  // ── Handle format selected → start generation ────────────────────────────
  const handleGenerate = async (formatId, fmt) => {
    setSheetOpen(false);
    setActiveFormatId(formatId);
    setActiveFormatLabel(fmt?.label || "PDF");

    // Small delay to let sheet close before showing loader
    setTimeout(async () => {
      setPhase("generating");

      // Ensure the loading screen shows for at least 1.8s (UX polish)
      const minLoadMs = 1800;
      const startTime = Date.now();

      try {
        const result = await runExport(formatId, fmt);

        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minLoadMs - elapsed);

        setTimeout(() => {
          setExportedBlob(result.blob);
          setExportedFilename(result.filename);

          // Also trigger auto-sync for PDF
          if ((formatId === "pdf" || formatId === "multi_pdf") && result.cleanBase64) {
            triggerAutoSync("export", { fileName: result.filename, pdfBlob: result.cleanBase64 });
          }

          setPhase("success");
        }, remaining);
      } catch (err) {
        console.error("[Export Error]:", err);
        setPhase("selecting");
        setSheetOpen(true);
        // show inline error (brief flash on sheet re-open)
      }
    }, 260);
  };

  // ── Google Drive upload ───────────────────────────────────────────────────
  const handleGoogleDrive = async () => {
    if (!isOnline || isUploadingDrive || !exportedBlob) return;
    setIsUploadingDrive(true);
    const qId = quotationId || mappedData?.id || `QTN-${Date.now()}`;
    try {
      const reader = new FileReader();
      const b64 = await new Promise((res) => {
        reader.onloadend = () => res(reader.result.split(",")[1]);
        reader.readAsDataURL(exportedBlob);
      });
      localDB.updateBackupStatus(qId, { uploadStatus: "Uploading" });
      const up = await googleDriveProvider.uploadPdf({ fileName: exportedFilename, pdfBlob: b64 });
      localDB.updateBackupStatus(qId, {
        uploadStatus: "Uploaded",
        driveFileId: up.fileId,
        driveUrl: up.driveUrl,
        syncDate: up.uploadedAt,
        folderPath: up.folderPath,
      });
      setDriveResult({ driveUrl: up.driveUrl, folderPath: up.folderPath });
    } catch (err) {
      console.error("[Drive upload error]:", err);
    } finally {
      setIsUploadingDrive(false);
    }
  };

  const handleGenerateAnother = () => {
    setExportedBlob(null);
    setExportedFilename("");
    setPhase("selecting");
    setSheetOpen(true);
  };

  const handleClose = () => {
    setSheetOpen(false);
    setTimeout(() => goBack?.(), 300);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* Off-screen PDF render container — always mounted */}
      <div
        id="quotation-pdf-container"
        ref={pdfContainerRef}
        style={{
          position: "fixed",
          left: "-9999px",
          top: "0px",
          width: "794px",
          backgroundColor: "#ffffff",
          zIndex: -100,
        }}
      >
        <RenderSelectedTemplate />
      </div>

      {/* ─── Phase: selecting — show base page + bottom sheet ─── */}
      {(phase === "selecting") && (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
          <MobileHeader
            title="Export Quotation"
            onBack={handleClose}
            right={
              <button onClick={goToPreview} className="text-xs font-bold text-blue-600 cursor-pointer">
                Preview
              </button>
            }
          />

          {/* Neutral base — just a clean centered prompt */}
          <div className="flex-1 flex flex-col items-center justify-center px-8 gap-4 pb-16">
            <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center border border-blue-100">
              <span className="text-4xl">📤</span>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-black text-slate-900">Export Quotation</h2>
              <p className="text-sm text-slate-500 font-medium mt-1.5 max-w-xs">
                Choose an export format to generate your document.
              </p>
            </div>
          </div>

          <ExportFormatSheet
            isOpen={sheetOpen}
            onClose={handleClose}
            onGenerate={handleGenerate}
          />
        </div>
      )}

      {/* ─── Phase: generating — fullscreen loading ─── */}
      <AnimatePresence>
        {phase === "generating" && (
          <ExportLoadingScreen formatLabel={activeFormatLabel} />
        )}
      </AnimatePresence>

      {/* ─── Phase: success — full success screen ─── */}
      {phase === "success" && (
        <ExportSuccessScreen
          formatId={activeFormatId}
          blob={exportedBlob}
          filename={exportedFilename}
          mappedData={mappedData}
          isOnline={isOnline}
          onGenerateAnother={handleGenerateAnother}
          onBack={handleClose}
          onGoogleDrive={handleGoogleDrive}
          isUploadingDrive={isUploadingDrive}
          driveResult={driveResult}
        />
      )}
    </>
  );
}