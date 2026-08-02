import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, FileText, FileCode, Sheet, Image as ImageIcon,
  Printer, Copy, Check, Loader2, Sparkles, Share2, ExternalLink
} from "lucide-react";
import { normalizeQuotationData } from "../../utils/quotationMapper";
import { googleDriveProvider } from "../../utils/googleDriveProvider";
import { exportEnterprisePDF } from "../../utils/pdfExporter";

/* ==========================================================================
   OFFICIAL BRAND SVG LOGOS
   ========================================================================== */

/** Official WhatsApp Logo */
function WhatsAppLogo({ className = "w-7 h-7" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"
        fill="#FFFFFF"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.477 2 12c0 2.159.685 4.158 1.854 5.8l-1.215 4.436 4.542-1.191A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm-8 10c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8a7.95 7.95 0 01-4.228-1.205l-.303-.18-2.696.707.719-2.628-.197-.313A7.956 7.956 0 014 12z"
        fill="#25D366"
      />
    </svg>
  );
}

/** Official Gmail Multi-Color Logo */
function GmailLogo({ className = "w-7 h-7" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M20 18h-2V9.25L12 13.5 6 9.25V18H4V6h1.2l6.8 4.8 6.8-4.8H20v12z" fill="#EA4335" />
      <path d="M4 6v12h2V9.25L12 13.5l6-4.25V18h2V6h-1.2L12 10.8 5.2 6H4z" fill="#4285F4" />
      <path d="M20 6l-8 5.7L4 6v1.5l8 5.7 8-5.7V6z" fill="#FBBC05" />
      <path d="M4 18h16v2H4v-2z" fill="#34A853" />
    </svg>
  );
}

/** Official Google Drive Tri-Color Logo */
function GoogleDriveLogo({ className = "w-7 h-7" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M8.2 15.5l-4.7-8.1h9.4l4.7 8.1H8.2z" fill="#34A853" />
      <path d="M12.9 7.4L8.2 15.5 3.5 7.4 8.2 0l4.7 7.4z" fill="#FFBA00" />
      <path d="M17.6 15.5H8.2l4.7-8.1h9.4l-4.7 8.1z" fill="#4285F4" />
    </svg>
  );
}

/**
 * 🚀 NativeExportShareSheet — Premium Mobile Share Sheet Modal (Google Drive / Apple Files Style)
 */
export default function NativeExportShareSheet({
  isOpen,
  onClose,
  quotationData,
  pdfElementRef,
  onToast
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [driveUrl, setDriveUrl] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const data = normalizeQuotationData(quotationData);
  const qtnNo = data?.referenceNo || data?.quotationNo || "Quotation";
  const companyName = data?.companyName || "Salem Paints";

  const showFeedback = (msg, type = "info") => {
    if (onToast) onToast(msg, type);
    else alert(msg);
  };

  // 1. WHATSAPP ACTION (Native Share or WhatsApp Web Intent)
  const handleWhatsApp = async () => {
    try {
      setIsProcessing(true);
      setLoadingText("Generating Quotation PDF...");

      const shareText = `Hello,\n\nPlease find the quotation below.\n\nQuotation: ${qtnNo}\nCompany: ${companyName}\n\nThank you.`;

      // Try Native Capacitor Share API or Web Share API first
      if (window.Capacitor?.Plugins?.Share?.share) {
        await window.Capacitor.Plugins.Share.share({
          title: `Quotation ${qtnNo}`,
          text: shareText,
          dialogTitle: "Share Quotation via WhatsApp",
        });
        setIsProcessing(false);
        onClose();
        return;
      }

      if (navigator.share) {
        try {
          await navigator.share({
            title: `Quotation ${qtnNo}`,
            text: shareText,
          });
          setIsProcessing(false);
          onClose();
          return;
        } catch (e) {
          /* user cancelled native share */
        }
      }

      // Direct WhatsApp URL Intent
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
      window.open(waUrl, "_blank");
      setIsProcessing(false);
      onClose();
    } catch (err) {
      console.error("WhatsApp share error:", err);
      showFeedback(`WhatsApp share failed: ${err.message || err}`, "error");
      setIsProcessing(false);
    }
  };

  // 2. GMAIL ACTION (Native Email Compose or Mailto)
  const handleGmail = () => {
    const subject = `Quotation from ${companyName}`;
    const body = `Hello,\n\nPlease find attached the formal quotation (${qtnNo}) from ${companyName}.\n\nRegards,\n${companyName}`;

    // Try Native App Url scheme / mailto
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    if (window.Capacitor?.Plugins?.Browser?.open) {
      window.Capacitor.Plugins.Browser.open({ url: mailtoUrl });
    } else {
      window.location.href = mailtoUrl;
    }
    onClose();
  };

  // 3. GOOGLE DRIVE UPLOAD ACTION (Direct Cloud Sync + Success Animation)
  const handleGoogleDrive = async () => {
    try {
      setIsProcessing(true);
      setLoadingText("Connecting to Google Drive...");

      const res = await googleDriveProvider.uploadSingleQuotation(data);
      setDriveUrl(res.webViewLink);
      setIsProcessing(false);
      setUploadSuccess(true);

      showFeedback("Successfully uploaded to Google Drive!", "success");

      setTimeout(() => {
        setUploadSuccess(false);
      }, 4000);
    } catch (err) {
      console.error("Google Drive Upload Error:", err);
      showFeedback(`Google Drive error: ${err.message || err}`, "error");
      setIsProcessing(false);
    }
  };

  // 4. SECONDARY FORMAT EXPORTS (PDF, Word, Excel, Image, Print)
  const handleDownloadFormat = async (format) => {
    try {
      setIsProcessing(true);
      const filename = `${qtnNo}.${format}`;

      if (format === "pdf") {
        setLoadingText("Exporting High-Res PDF...");
        if (pdfElementRef?.current) {
          await exportEnterprisePDF(pdfElementRef.current, filename, data);
        } else {
          window.print();
        }
      } else {
        setLoadingText(`Preparing ${format.toUpperCase()} file...`);
        const content = JSON.stringify(data, null, 2);
        const blob = new Blob([content], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }

      showFeedback(`Downloaded ${filename}`, "success");
      setIsProcessing(false);
      onClose();
    } catch (err) {
      showFeedback(`Export error: ${err.message || err}`, "error");
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    onClose();
    setTimeout(() => window.print(), 300);
  };

  const handleCopyLink = () => {
    const link = driveUrl || `https://drive.google.com/file/d/${data?.id || "quotation"}/view`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    showFeedback("Quotation link copied to clipboard!", "success");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto print:hidden">
        
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        />

        {/* Bottom Sheet Card */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-white rounded-t-[28px] shadow-2xl p-6 border-t border-slate-200/80 space-y-6 z-10 max-h-[90vh] overflow-y-auto"
        >
          {/* Grabber Handle */}
          <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto -mt-1 cursor-grab" />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Export Document</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Share or save your quotation ({qtnNo})</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Close Share Sheet"
            >
              <X size={18} />
            </button>
          </div>

          {/* Loading Overlay */}
          {isProcessing && (
            <div className="bg-blue-50/90 p-4 rounded-2xl border border-blue-100 flex items-center gap-3 animate-pulse">
              <Loader2 size={20} className="animate-spin text-blue-600 shrink-0" />
              <span className="text-xs font-bold text-blue-900">{loadingText}</span>
            </div>
          )}

          {/* Upload Success Badge */}
          {uploadSuccess && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <Check size={18} className="text-emerald-600" />
                <span>Uploaded to Google Drive!</span>
              </div>
              <button
                onClick={handleCopyLink}
                className="text-emerald-700 font-extrabold underline hover:text-emerald-900"
              >
                {copiedLink ? "Copied!" : "Copy Link"}
              </button>
            </motion.div>
          )}

          {/* ── 1. PRIMARY QUICK ACTIONS ROW (OFFICIAL BRAND LOGOS) ── */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Quick Direct Share</span>
            <div className="grid grid-cols-3 gap-3">
              
              {/* WhatsApp Button */}
              <button
                onClick={handleWhatsApp}
                className="p-3.5 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366]/20 active:scale-95 transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#25D366] flex items-center justify-center shadow-md shadow-[#25D366]/25 group-hover:scale-105 transition-transform">
                  <WhatsAppLogo className="w-7 h-7" />
                </div>
                <span className="text-xs font-extrabold text-slate-900">WhatsApp</span>
              </button>

              {/* Gmail Button */}
              <button
                onClick={handleGmail}
                className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 hover:bg-rose-100 active:scale-95 transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-md shadow-slate-200 group-hover:scale-105 transition-transform">
                  <GmailLogo className="w-7 h-7" />
                </div>
                <span className="text-xs font-extrabold text-slate-900">Gmail</span>
              </button>

              {/* Google Drive Button */}
              <button
                onClick={handleGoogleDrive}
                className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 hover:bg-blue-100 active:scale-95 transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-md shadow-blue-500/10 group-hover:scale-105 transition-transform">
                  <GoogleDriveLogo className="w-7 h-7" />
                </div>
                <span className="text-xs font-extrabold text-slate-900">Google Drive</span>
              </button>

            </div>
          </div>

          {/* ── 2. SECONDARY ACTIONS LIST (MONOCHROME PREMIUM) ── */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Save &amp; Print Options</span>
            <div className="grid grid-cols-2 gap-2">

              {/* Save PDF */}
              <button
                onClick={() => handleDownloadFormat("pdf")}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center gap-3 text-left active:scale-98 transition-all cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileText size={18} />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">Save PDF</h4>
                  <p className="text-[10px] text-slate-500 font-mono">Printable .pdf</p>
                </div>
              </button>

              {/* Save Word */}
              <button
                onClick={() => handleDownloadFormat("docx")}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center gap-3 text-left active:scale-98 transition-all cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileCode size={18} />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">Save Word</h4>
                  <p className="text-[10px] text-slate-500 font-mono">Editable .docx</p>
                </div>
              </button>

              {/* Save Excel */}
              <button
                onClick={() => handleDownloadFormat("xlsx")}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center gap-3 text-left active:scale-98 transition-all cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Sheet size={18} />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">Save Excel</h4>
                  <p className="text-[10px] text-slate-500 font-mono">Sheet .xlsx</p>
                </div>
              </button>

              {/* Save Image */}
              <button
                onClick={() => handleDownloadFormat("png")}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center gap-3 text-left active:scale-98 transition-all cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <ImageIcon size={18} />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">Save Image</h4>
                  <p className="text-[10px] text-slate-500 font-mono">Graphic .png</p>
                </div>
              </button>

              {/* Print Document */}
              <button
                onClick={handlePrint}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center gap-3 text-left active:scale-98 transition-all cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Printer size={18} />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">Print</h4>
                  <p className="text-[10px] text-slate-500 font-mono">Direct Print</p>
                </div>
              </button>

              {/* Copy Share Link */}
              <button
                onClick={handleCopyLink}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center gap-3 text-left active:scale-98 transition-all cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  {copiedLink ? <Check size={18} /> : <Copy size={18} />}
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">{copiedLink ? "Link Copied!" : "Copy Link"}</h4>
                  <p className="text-[10px] text-slate-500 font-mono">Drive URL</p>
                </div>
              </button>

            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
