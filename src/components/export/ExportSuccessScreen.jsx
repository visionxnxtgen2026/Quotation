import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2, Download, MessageSquare, Mail,
  CloudUpload, Share2, Printer, ArrowLeft, RefreshCw,
  ExternalLink, WifiOff, Wifi, AlertCircle
} from "lucide-react";
import ShareDialogModal from "./ShareDialogModal.jsx";
import { localDB } from "../../utils/localDB";

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const FORMAT_META = {
  pdf:       { icon: "📄", label: "PDF Document",    desc: "Print-ready PDF",     color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-100" },
  multi_pdf: { icon: "📑", label: "Multi-Page PDF",  desc: "Multi-page layout",   color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-100" },
  docx:      { icon: "📝", label: "Word Document",   desc: "Editable .docx",      color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-100" },
  png:       { icon: "🖼", label: "PNG Image",       desc: "Image snapshot",      color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-100" },
  xlsx:      { icon: "📊", label: "Excel Sheet",     desc: "Spreadsheet",         color: "text-emerald-700",bg: "bg-emerald-50",border: "border-emerald-100" },
};

function ActionCard({ icon, iconBg, title, desc, onClick, isLoading, disabled, badge, delay = 0 }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: "easeOut" }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`w-full bg-white border border-slate-100 rounded-2xl flex items-center gap-4 px-4 py-4 text-left shadow-sm transition-all ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-slate-200 hover:shadow-md active:bg-slate-50"
      }`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {isLoading
          ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          : icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-slate-900">{title}</p>
          {badge}
        </div>
        <p className="text-xs text-slate-400 font-medium mt-0.5">{desc}</p>
      </div>
    </motion.button>
  );
}

export default function ExportSuccessScreen({
  formatId = "pdf",
  blob,
  filename,
  mappedData,
  isOnline,
  onGenerateAnother,
  onBack,
  onGoogleDrive,
  isUploadingDrive,
  driveResult,
  onOpenShareModal,
}) {
  const [sharingWA, setSharingWA] = useState(false);
  const [sharingEmail, setSharingEmail] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [toastNotice, setToastNotice] = useState("");

  const fmt = FORMAT_META[formatId] || FORMAT_META.pdf;
  const fileSize = blob ? blob.size : 0;
  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const refNo = mappedData?.quotationNo || mappedData?.referenceNo || "QTN-2026";
  const quotationId = mappedData?.id || refNo;

  const googleDriveFileId = driveResult?.driveFileId || driveResult?.fileId || null;
  const driveUrl = driveResult?.driveUrl || null;

  const showNotice = (msg) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(""), 3000);
  };

  const handleOpenShareModal = () => {
    if (!googleDriveFileId && !driveUrl) {
      showNotice("Uploading file to Google Drive first...");
      if (onGoogleDrive) onGoogleDrive();
      return;
    }
    setShareModalOpen(true);
    if (typeof onOpenShareModal === "function") {
      onOpenShareModal();
    }
  };

  const handleCloseShareModal = () => {
    setShareModalOpen(false);
  };

  const downloadFile = () => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareFile = async () => {
    if (!blob) return;
    try {
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], filename, { type: blob.type });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ title: `Quotation — ${refNo}`, files: [file] });
          return;
        }
      }
      downloadFile();
    } catch {
      downloadFile();
    }
  };

  const shareWhatsApp = async () => {
    if (sharingWA) return;
    setSharingWA(true);
    try {
      if (window.Capacitor?.isPluginAvailable("Share")) {
        const { Filesystem, Directory } = await import(/* @vite-ignore */ "@capacitor/filesystem");
        const { Share } = await import(/* @vite-ignore */ "@capacitor/share");
        const reader = new FileReader();
        const b64 = await new Promise((res) => { reader.onloadend = () => res(reader.result.split(",")[1]); reader.readAsDataURL(blob); });
        const saved = await Filesystem.writeFile({ path: filename, data: b64, directory: Directory.Cache, recursive: true });
        await Share.share({ title: `Quotation — ${refNo}`, files: [saved.uri], dialogTitle: "Share via WhatsApp" });
      } else {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Quotation ${refNo}`)}`, "_blank");
      }
    } catch { /* ignore */ }
    finally { setSharingWA(false); }
  };

  const sendEmail = async () => {
    if (sharingEmail) return;
    setSharingEmail(true);
    const clientEmail = mappedData?.clientEmail || "";
    try {
      if (window.Capacitor?.isPluginAvailable("Share")) {
        const { Filesystem, Directory } = await import(/* @vite-ignore */ "@capacitor/filesystem");
        const { Share } = await import(/* @vite-ignore */ "@capacitor/share");
        const reader = new FileReader();
        const b64 = await new Promise((res) => { reader.onloadend = () => res(reader.result.split(",")[1]); reader.readAsDataURL(blob); });
        const saved = await Filesystem.writeFile({ path: filename, data: b64, directory: Directory.Cache, recursive: true });
        await Share.share({ title: `Quotation — ${refNo}`, files: [saved.uri], dialogTitle: "Send via Email" });
      } else {
        window.location.href = `mailto:${encodeURIComponent(clientEmail)}?subject=${encodeURIComponent(`Quotation — ${refNo}`)}&body=${encodeURIComponent("Please find attached quotation.")}`;
      }
    } catch { /* ignore */ }
    finally { setSharingEmail(false); }
  };

  const printDoc = () => {
    if (!blob || printing) return;
    setPrinting(true);
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) { win.onload = () => { win.print(); URL.revokeObjectURL(url); }; }
    setTimeout(() => setPrinting(false), 2500);
  };

  const busy = sharingWA || sharingEmail || isUploadingDrive;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 overflow-y-auto relative">
      {/* Toast Banner */}
      {toastNotice && (
        <div className="fixed top-16 left-4 right-4 z-[150] px-4 py-3 rounded-2xl shadow-xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <span>{toastNotice}</span>
        </div>
      )}

      {/* Top Section — Success Hero */}
      <div className="px-5 pt-12 pb-6 flex flex-col items-center">
        {/* Animated check circle */}
        <motion.div
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 350, damping: 20, delay: 0.08 }}
          className="mb-5"
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 size={52} className="text-emerald-500" strokeWidth={1.75} />
            </div>
            {/* Glow ring */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1.18, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="absolute inset-0 rounded-full bg-emerald-300/40"
            />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.35 }}
          className="text-2xl font-black text-slate-900 tracking-tight text-center"
        >
          Export Completed
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.35 }}
          className="text-sm text-slate-500 font-medium text-center mt-1.5 max-w-xs"
        >
          Your quotation has been generated and is ready to share.
        </motion.p>
      </div>

      {/* Document Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.36, duration: 0.35 }}
        className="mx-5 bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs mb-6"
      >
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl ${fmt.bg} border ${fmt.border} flex items-center justify-center text-2xl shrink-0`}>
            {fmt.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-black text-slate-900 truncate">{filename || `Quotation-${refNo}`}</p>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${fmt.bg} ${fmt.color} shrink-0`}>
                {formatId}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-2">
              <span>{refNo}</span>
              <span>•</span>
              <span>{today}</span>
              {fileSize > 0 && (
                <>
                  <span>•</span>
                  <span className="font-mono">{formatBytes(fileSize)}</span>
                </>
              )}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Action Cards List */}
      <div className="px-5 space-y-3 max-w-lg mx-auto">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Share &amp; Export Options</p>

        <ActionCard
          delay={0.42}
          icon={<Download size={22} />}
          iconBg="bg-blue-50 text-blue-600"
          title="Download File"
          desc="Save directly to device storage"
          onClick={downloadFile}
          disabled={!blob}
        />

        <ActionCard
          delay={0.46}
          icon={<MessageSquare size={22} />}
          iconBg="bg-emerald-50 text-emerald-600"
          title={sharingWA ? "Opening WhatsApp..." : "Send to WhatsApp"}
          desc="Attach file and open WhatsApp"
          onClick={shareWhatsApp}
          isLoading={sharingWA}
          disabled={busy || !blob}
        />

        <ActionCard
          delay={0.50}
          icon={<Mail size={22} />}
          iconBg="bg-indigo-50 text-indigo-600"
          title={sharingEmail ? "Opening Email..." : "Send via Email"}
          desc="Attach file and open email client"
          onClick={sendEmail}
          isLoading={sharingEmail}
          disabled={busy || !blob}
        />

        <ActionCard
          delay={0.54}
          icon={<CloudUpload size={22} />}
          iconBg="bg-sky-50 text-sky-600"
          title={
            isUploadingDrive
              ? "Uploading to Google Drive..."
              : driveResult?.driveUrl
              ? "✓ Uploaded to Google Drive"
              : "Upload to Google Drive"
          }
          desc={
            driveResult?.driveUrl
              ? "Saved in My Drive / VisionX QuoteGen Pro"
              : isOnline
              ? "Cloud backup in My Drive"
              : "Offline — connect to back up"
          }
          onClick={onGoogleDrive}
          isLoading={isUploadingDrive}
          disabled={busy || !isOnline}
          badge={
            driveResult?.driveUrl ? (
              <a
                href={driveResult.driveUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[11px] font-bold text-sky-600 hover:underline flex items-center gap-1 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200 cursor-pointer"
              >
                Open Folder <ExternalLink size={12} />
              </a>
            ) : !isOnline ? (
              <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                <WifiOff size={10} /> Offline
              </span>
            ) : null
          }
        />

        <ActionCard
          delay={0.58}
          icon={<Share2 size={22} />}
          iconBg="bg-violet-50 text-violet-600"
          title="Share"
          desc="Share via Google Drive link (Public or Private)"
          onClick={handleOpenShareModal}
          disabled={!blob}
        />

        <ActionCard
          delay={0.62}
          icon={<Printer size={22} />}
          iconBg="bg-slate-100 text-slate-700"
          title={printing ? "Preparing Print..." : "Print Document"}
          desc="Send to local or network printer"
          onClick={printDoc}
          isLoading={printing}
          disabled={busy || !blob}
        />
      </div>

      {/* Bottom Floating Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200/80 flex items-center gap-3 z-40 max-w-lg mx-auto">
        <button
          onClick={onBack}
          className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>

        <button
          onClick={onGenerateAnother}
          className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-blue-600/20"
        >
          <RefreshCw size={16} />
          <span>Export Another</span>
        </button>
      </div>

      {/* Self-contained Share & Permissions Modal */}
      {shareModalOpen && (
        <ShareDialogModal
          isOpen={shareModalOpen}
          onClose={handleCloseShareModal}
          file={
            localDB.getCloudFileById(quotationId) || {
              id: quotationId,
              fileName: filename || `${refNo}.pdf`,
              driveFileId: googleDriveFileId,
              shareUrl: driveUrl,
              visibility: driveResult?.visibility || "public",
              allowedEmails: [localStorage.getItem("gdrive_user_email") || "owner@visionx.com"],
            }
          }
          onFileUpdated={() => {
            window.dispatchEvent(new Event("cloudFilesUpdated"));
          }}
        />
      )}
    </div>
  );
}
