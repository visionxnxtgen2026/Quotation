import React, { useState, useEffect, useRef } from "react";
import MobileHeader from "../../components/mobile/MobileHeader";
import TemplateSelector from "../../components/theme/TemplateSelector";
import {
  ExcelNativeTemplate,
  WordNativeTemplate,
  ImageNativeTemplate
} from "../../components/theme/NativeFormatPreviews";
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

import { localDB } from "../../utils/localDB";
import { normalizeQuotationData } from "../../utils/quotationMapper";
import { googleDriveProvider } from "../../utils/googleDriveProvider";
import { exportEnterprisePDF } from "../../utils/pdfExporter";
import {
  Download, Share2, Copy, Check, MessageSquare, Mail, QrCode,
  Cloud, CloudUpload, Lock, Globe, FileText, Sheet, FileCode,
  Image as ImageIcon, Loader2, ExternalLink, Printer
} from "lucide-react";

import QuotationTemplate from "../../components/quotation/QuotationTemplate";

const PDFComponent = QuotationTemplate;

export default function ExportCenterPage({
  goBack, goToDashboard, goToCreate, goToPreview, quotationId
}) {
  const [quotationData, setQuotationData] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(() => localStorage.getItem("activeExportFormat") || "pdf");
  const [selectedTemplate, setSelectedTemplate] = useState(() => localStorage.getItem("activeExportTemplate") || "corporate-blue");

  const [isUploading, setIsUploading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);

  const [driveFileId, setDriveFileId] = useState(null);
  const [driveShareUrl, setDriveShareUrl] = useState(null);
  const [isPublic, setIsPublic] = useState(true);

  const [copiedLink, setCopiedLink] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const templateRef = useRef(null);

  // Load quotation state & drive link metadata
  const loadData = () => {
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
      setQuotationData(data);
      // Check existing Google Drive linkage in localDB
      const cloudFiles = localDB.getCloudFiles ? localDB.getCloudFiles() : [];
      const qtnNo = data.referenceNo || data.quotationNo || data.id;
      const linked = cloudFiles.find(f => f.quotationId === qtnNo || f.id === qtnNo || f.fileName?.includes(qtnNo));

      if (linked) {
        setDriveFileId(linked.driveFileId || linked.fileId);
        setDriveShareUrl(linked.driveShareUrl || linked.webViewLink);
        setIsPublic(linked.isPublic !== false);
      } else if (data.driveFileId) {
        setDriveFileId(data.driveFileId);
        setDriveShareUrl(data.driveShareUrl || `https://drive.google.com/file/d/${data.driveFileId}/view`);
        setIsPublic(data.isPublic !== false);
      }
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener("quotationDataUpdated", loadData);
    window.addEventListener("cloudFilesUpdated", loadData);
    return () => {
      window.removeEventListener("quotationDataUpdated", loadData);
      window.removeEventListener("cloudFilesUpdated", loadData);
    };
  }, [quotationId]);

  const mappedData = normalizeQuotationData(quotationData);

  const handleFormatChange = (fmtId) => {
    setSelectedFormat(fmtId);
    localStorage.setItem("activeExportFormat", fmtId);
  };

  const handleTemplateChange = (tplId) => {
    setSelectedTemplate(tplId);
    localStorage.setItem("activeExportTemplate", tplId);
  };

  // 1. Google Drive Upload Action
  const handleDriveUpload = async () => {
    if (!mappedData) return;
    try {
      setIsUploading(true);
      const res = await googleDriveProvider.uploadSingleQuotation(mappedData);
      setDriveFileId(res.fileId);
      setDriveShareUrl(res.webViewLink);
      setIsPublic(true);
      alert("Successfully uploaded to Google Drive!");
    } catch (err) {
      console.error("Drive upload failed:", err);
      alert(`Google Drive Upload error: ${err.message || err}`);
    } finally {
      setIsUploading(false);
    }
  };

  // 2. Google Drive Permissions API Visibility Toggle
  const handleVisibilityToggle = async (targetPublic) => {
    if (!driveFileId || isUpdatingVisibility) return;
    try {
      setIsUpdatingVisibility(true);
      const res = await googleDriveProvider.setFileVisibility(driveFileId, targetPublic);
      setIsPublic(targetPublic);
      setDriveShareUrl(res.webViewLink);
      
      // Update localDB cloud file record
      if (localDB.saveCloudFile) {
        localDB.saveCloudFile({
          id: mappedData.referenceNo || mappedData.quotationNo,
          driveFileId: driveFileId,
          driveShareUrl: res.webViewLink,
          isPublic: targetPublic,
        });
      }
    } catch (err) {
      alert(`Failed to update visibility: ${err.message || err}`);
    } finally {
      setIsUpdatingVisibility(false);
    }
  };

  // 3. Primary Export Action
  const handlePrimaryExport = async () => {
    if (!mappedData) return;
    try {
      setIsExporting(true);
      const filename = `${mappedData.referenceNo || "Quotation"}.${selectedFormat === "docx" ? "docx" : selectedFormat === "xlsx" ? "xlsx" : selectedFormat === "png" ? "png" : "pdf"}`;

      if (selectedFormat === "pdf") {
        if (templateRef.current) {
          await exportEnterprisePDF(templateRef.current, filename, mappedData);
        } else {
          window.print();
        }
      } else {
        // Trigger simulated document file download
        const blob = new Blob([JSON.stringify(mappedData, null, 2)], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      alert(`Export error: ${err.message || err}`);
    } finally {
      setIsExporting(false);
    }
  };

  // 4. Sharing Handlers
  const handleCopyLink = () => {
    const link = driveShareUrl || `https://drive.google.com/file/d/${driveFileId || "sample"}/view`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const qtnNo = mappedData?.referenceNo || mappedData?.quotationNo || "QTN-2026";
    const link = driveShareUrl || `https://drive.google.com/file/d/${driveFileId || "sample"}/view`;
    const text = `Hello,\n\nPlease find the quotation below.\n\nQuotation: ${qtnNo}\n\nView Quotation:\n${link}\n\nThank you.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleEmailShare = () => {
    const qtnNo = mappedData?.referenceNo || mappedData?.quotationNo || "QTN-2026";
    const company = mappedData?.companyName || "VisionX Solutions";
    const link = driveShareUrl || `https://drive.google.com/file/d/${driveFileId || "sample"}/view`;
    const subject = `Quotation - ${qtnNo}`;
    const body = `Hello,\n\nPlease find the quotation attached / shared below.\n\nQuotation Number: ${qtnNo}\n\nView Online:\n${link}\n\nRegards,\n${company}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_self");
  };

  const PDFComponent = QuotationTemplate;

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans pb-32 relative">
      <MobileHeader title="Export &amp; Delivery Center" onBack={goBack || goToDashboard} />

      <div className="w-full px-3 sm:px-6 py-4 max-w-5xl mx-auto space-y-6">

        {/* ── 1. SELECTABLE EXPORT FORMAT CARDS ── */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs">
          <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">1. Select Export Format</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: "pdf", name: "PDF Proposal", ext: ".pdf", icon: FileText, color: "text-red-500", bg: "bg-red-50 border-red-200" },
              { id: "docx", name: "Editable Word", ext: ".docx", icon: FileCode, color: "text-blue-500", bg: "bg-blue-50 border-blue-200" },
              { id: "xlsx", name: "Excel Sheet", ext: ".xlsx", icon: Sheet, color: "text-emerald-500", bg: "bg-emerald-50 border-emerald-200" },
              { id: "png", name: "Graphic Image", ext: ".png", icon: ImageIcon, color: "text-purple-500", bg: "bg-purple-50 border-purple-200" },
            ].map(fmt => {
              const isSelected = selectedFormat === fmt.id;
              const Icon = fmt.icon;
              return (
                <button
                  key={fmt.id}
                  onClick={() => handleFormatChange(fmt.id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-left flex flex-col justify-between h-28 relative ${
                    isSelected
                      ? "border-slate-900 bg-slate-900 text-white shadow-md scale-[1.02]"
                      : "border-slate-200 bg-white hover:border-slate-300 text-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isSelected ? "bg-white/10 text-white" : fmt.bg}`}>
                      <Icon size={20} className={isSelected ? "text-white" : fmt.color} />
                    </div>
                    {isSelected && <Check size={16} className="text-emerald-400 font-bold" />}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs sm:text-sm tracking-tight">{fmt.name}</h3>
                    <p className={`text-[10px] font-mono ${isSelected ? "text-slate-300" : "text-slate-500"}`}>{fmt.ext}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 2. LIVE DOCUMENT PREVIEW & PRIMARY EXPORT BUTTON ── */}
        <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">2. Live Document Preview</h2>
              <p className="text-xs text-slate-500">Real-time preview formatted for {selectedFormat.toUpperCase()} export.</p>
            </div>

            {/* Primary Export Button */}
            <button
              onClick={handlePrimaryExport}
              disabled={isExporting || !mappedData}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              <span>Export {selectedFormat.toUpperCase()} File</span>
            </button>
          </div>

          {/* PDF Template Gallery Strip (Only for PDF Format) */}
          <TemplateSelector
            selectedFormat={selectedFormat}
            selectedTemplate={selectedTemplate}
            onSelectFormat={handleFormatChange}
            onSelectTemplate={handleTemplateChange}
            onEdit={goToPreview}
            onExport={handlePrimaryExport}
            isExporting={isExporting}
          />

          {/* Live Viewport */}
          <div className="w-full overflow-x-auto flex justify-center bg-slate-100 p-3 sm:p-6 rounded-2xl border border-slate-200 min-h-[350px]">
            {mappedData ? (
              selectedFormat === "xlsx" ? (
                <div className="w-full max-w-4xl">
                  <ExcelNativeTemplate data={mappedData} />
                </div>
              ) : selectedFormat === "docx" ? (
                <div className="w-full max-w-4xl">
                  <WordNativeTemplate data={mappedData} />
                </div>
              ) : selectedFormat === "png" ? (
                <div className="w-full max-w-4xl">
                  <ImageNativeTemplate data={mappedData}>
                    <div ref={templateRef} className="w-[794px] bg-white p-2">
                      <PDFComponent data={mappedData} />
                    </div>
                  </ImageNativeTemplate>
                </div>
              ) : (
                <div className="w-[794px] max-w-full overflow-hidden bg-white shadow-md rounded-xl border border-slate-200">
                  <div ref={templateRef} className="w-[794px]">
                    <PDFComponent data={mappedData} />
                  </div>
                </div>
              )
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs font-medium">No quotation data available for preview.</div>
            )}
          </div>
        </div>

        {/* ── 3. GOOGLE DRIVE UPLOAD & VISIBILITY CONTROL ── */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <Cloud size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Google Drive Cloud Storage &amp; Sharing</h3>
                <p className="text-xs text-slate-500">Backup quotation to Google Drive &amp; generate public share links.</p>
              </div>
            </div>
            {driveFileId && (
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold">
                🟢 UPLOADED
              </span>
            )}
          </div>

          {!driveFileId ? (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-3">
              <p className="text-xs text-slate-600 font-medium">Upload this quotation to your Google Drive to enable one-click public share links, WhatsApp sharing, and QR code generation.</p>
              <button
                onClick={handleDriveUpload}
                disabled={isUploading}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 inline-flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {isUploading ? <Loader2 size={16} className="animate-spin" /> : <CloudUpload size={16} />}
                <span>Upload to Google Drive</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs border-b border-slate-200 pb-3">
                <span className="font-bold text-slate-700">Google Drive File Visibility</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVisibilityToggle(false)}
                    disabled={isUpdatingVisibility}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      !isPublic
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <Lock size={12} />
                    <span>Private</span>
                  </button>
                  <button
                    onClick={() => handleVisibilityToggle(true)}
                    disabled={isUpdatingVisibility}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      isPublic
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <Globe size={12} />
                    <span>Anyone with Link</span>
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-600 font-mono break-all flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="truncate flex-1">{driveShareUrl}</span>
                <button onClick={handleCopyLink} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg shrink-0">
                  {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── 4. QUICK SHARE CENTER ── */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">4. Quick Share &amp; Delivery</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* WhatsApp */}
            <button
              onClick={handleWhatsAppShare}
              className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-900 flex flex-col items-start gap-2 cursor-pointer transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <MessageSquare size={20} />
              </div>
              <div>
                <h4 className="font-extrabold text-xs">Share via WhatsApp</h4>
                <p className="text-[10px] text-emerald-700 font-medium">Instant messaging</p>
              </div>
            </button>

            {/* Email */}
            <button
              onClick={handleEmailShare}
              className="p-4 rounded-2xl bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-900 flex flex-col items-start gap-2 cursor-pointer transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <Mail size={20} />
              </div>
              <div>
                <h4 className="font-extrabold text-xs">Share via Email</h4>
                <p className="text-[10px] text-blue-700 font-medium">Default email client</p>
              </div>
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="p-4 rounded-2xl bg-purple-50 border border-purple-200 hover:bg-purple-100 text-purple-900 flex flex-col items-start gap-2 cursor-pointer transition-all group relative"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                {copiedLink ? <Check size={20} /> : <Copy size={20} />}
              </div>
              <div>
                <h4 className="font-extrabold text-xs">{copiedLink ? "Link Copied!" : "Copy Share Link"}</h4>
                <p className="text-[10px] text-purple-700 font-medium">Clipboard link</p>
              </div>
            </button>

            {/* QR Code */}
            <button
              onClick={() => setShowQRModal(true)}
              className="p-4 rounded-2xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-900 flex flex-col items-start gap-2 cursor-pointer transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <QrCode size={20} />
              </div>
              <div>
                <h4 className="font-extrabold text-xs">Generate QR Code</h4>
                <p className="text-[10px] text-slate-500 font-medium">Download or print QR</p>
              </div>
            </button>
          </div>
        </div>

      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-extrabold text-slate-900 text-base">Quotation Share QR Code</h3>
            <div className="bg-white p-4 rounded-2xl border-2 border-slate-900 inline-block mx-auto shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(driveShareUrl || "https://drive.google.com")}`}
                alt="Quotation QR Code"
                className="w-44 h-44 object-contain"
              />
            </div>
            <p className="text-xs text-slate-500 font-mono break-all">{driveShareUrl || "https://drive.google.com"}</p>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer size={14} /> Print QR
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offscreen Template Renderer for Enterprise PDF Generation */}
      {mappedData && (
        <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
          <div ref={templateRef} style={{ width: "794px" }} className="bg-white">
            <PDFComponent data={mappedData} templateKey={selectedTemplate} />
          </div>
        </div>
      )}
    </div>
  );
}
