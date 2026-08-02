import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2, Download, MessageSquare, Mail,
  CloudUpload, Share2, ArrowLeft
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
  pdf: { icon: "📄", label: "PDF Document", desc: "Print-ready PDF", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-100" },
  multi_pdf: { icon: "📑", label: "Multi-Page PDF", desc: "Multi-page layout", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-100" },
  docx: { icon: "📝", label: "Word Document", desc: "Editable .docx", color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-100" },
  png: { icon: "🖼", label: "PNG Image", desc: "Image snapshot", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-100" },
  xlsx: { icon: "📊", label: "Excel Sheet", desc: "Spreadsheet", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
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
        {isLoading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : icon}
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
  const [toastNotice, setToastNotice] = useState("");

  const fmt = FORMAT_META[formatId] || FORMAT_META.pdf;
  const fileSize = blob ? blob.size : 0;
  const refNo = mappedData?.quotationNo || mappedData?.referenceNo || "QTN-2026";

  const showNotice = (msg) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(""), 4000);
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

  // Direct 1-Click WhatsApp Sharing Workflow
  const shareWhatsApp = async () => {
    if (!blob || sharingWA) return;

    // Read client phone number already saved in quotation data
    const rawPhone = mappedData?.clientPhone || mappedData?.phone || "";
    const cleanPhone = String(rawPhone).replace(/[^0-9]/g, "");

    if (!cleanPhone) {
      showNotice("Client mobile number is not available. Please update client details before sharing via WhatsApp.");
      return;
    }

    setSharingWA(true);
    const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const clientName = mappedData?.clientName || "Client";
    const defaultMessage = `Hello ${clientName},\n\nPlease find attached the official quotation proposal.\n\nQuotation No: ${refNo}\n\nThank you.`;

    try {
      // 1. NATIVE MOBILE APP INTENT (Capacitor Android / iOS)
      if (window.Capacitor?.isPluginAvailable("Share")) {
        const { Filesystem, Directory } = await import(/* @vite-ignore */ "@capacitor/filesystem");
        const { Share } = await import(/* @vite-ignore */ "@capacitor/share");

        const reader = new FileReader();
        const b64 = await new Promise((res) => {
          reader.onloadend = () => res(reader.result.split(",")[1]);
          reader.readAsDataURL(blob);
        });

        const saved = await Filesystem.writeFile({
          path: filename,
          data: b64,
          directory: Directory.Cache,
          recursive: true,
        });

        await Share.share({
          title: `Quotation ${refNo}`,
          text: defaultMessage,
          files: [saved.uri],
          dialogTitle: "Send to WhatsApp",
        });

        return;
      }

      // 2. WEB SHARE API (Browsers supporting file sharing)
      if (navigator.share && navigator.canShare) {
        const fileObj = new File([blob], filename, { type: blob.type || "application/pdf" });
        if (navigator.canShare({ files: [fileObj] })) {
          await navigator.share({
            title: `Quotation ${refNo}`,
            text: defaultMessage,
            files: [fileObj],
          });
          return;
        }
      }

      // 3. DESKTOP WEB FALLBACK
      // Download the exported file directly
      downloadFile();

      // Launch WhatsApp Chat directly to recipient's phone number
      const waUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(defaultMessage)}`;
      window.open(waUrl, "_blank");

      showNotice(`Quotation downloaded. Tap attach 📎 in WhatsApp to send ${filename}.`);
    } catch (err) {
      console.error("[Direct WhatsApp Share Error]:", err);
    } finally {
      setSharingWA(false);
    }
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
        const b64 = await new Promise((res) => {
          reader.onloadend = () => res(reader.result.split(",")[1]);
          reader.readAsDataURL(blob);
        });
        const saved = await Filesystem.writeFile({ path: filename, data: b64, directory: Directory.Cache, recursive: true });
        await Share.share({ title: `Quotation — ${refNo}`, files: [saved.uri], dialogTitle: "Send via Email" });
      } else {
        window.location.href = `mailto:${encodeURIComponent(clientEmail)}?subject=${encodeURIComponent(
          `Quotation — ${refNo}`
        )}&body=${encodeURIComponent("Please find attached quotation.")}`;
      }
    } catch {
      /* ignore */
    } finally {
      setSharingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 overflow-y-auto relative">
      {/* Toast Notice */}
      {toastNotice && (
        <div className="fixed top-16 left-4 right-4 z-[150] px-4 py-3 rounded-2xl shadow-xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <span>{toastNotice}</span>
        </div>
      )}

      {/* Top Section — Success Hero */}
      <div className="px-5 pt-12 pb-6 flex flex-col items-center">
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
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="text-2xl font-black text-slate-900 tracking-tight text-center"
        >
          Export Completed!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xs font-medium text-slate-500 mt-1 text-center"
        >
          Your quotation was generated successfully.
        </motion.p>
      </div>

      {/* File Card Banner */}
      <div className="px-4 mb-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${fmt.bg} ${fmt.border} border`}>
            {fmt.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-slate-900 truncate">{filename || `Quotation_${refNo}`}</p>
            <p className="text-xs text-slate-600 font-medium mt-0.5">{fmt.label} • {formatBytes(fileSize)}</p>
          </div>
        </div>
      </div>

      {/* Action Options List */}
      <div className="px-4 space-y-2.5 max-w-lg mx-auto">
        <ActionCard
          icon={<Download size={22} className="text-blue-600" />}
          iconBg="bg-blue-50"
          title={`Download ${fmt.label}`}
          desc="Save file directly to your device"
          onClick={downloadFile}
          delay={0.24}
        />

        <ActionCard
          icon={<MessageSquare size={22} className="text-emerald-600" />}
          iconBg="bg-emerald-50"
          title="Send to WhatsApp"
          desc="Instant 1-click share with client"
          onClick={shareWhatsApp}
          isLoading={sharingWA}
          delay={0.28}
        />

        <ActionCard
          icon={<Mail size={22} className="text-indigo-600" />}
          iconBg="bg-indigo-50"
          title="Send via Email"
          desc="Attach exported file in email client"
          onClick={sendEmail}
          isLoading={sharingEmail}
          delay={0.32}
        />

        <ActionCard
          icon={<CloudUpload size={22} className="text-teal-600" />}
          iconBg="bg-teal-50"
          title="Save to Google Drive"
          desc={driveResult ? "Uploaded to Drive • Tap to view" : "Upload to Google Drive cloud folder"}
          onClick={onGoogleDrive}
          isLoading={isUploadingDrive}
          disabled={!isOnline}
          delay={0.36}
        />

        <ActionCard
          icon={<Share2 size={22} className="text-slate-600" />}
          iconBg="bg-slate-100"
          title="Share File (System)"
          desc="Use native sharing options"
          onClick={shareFile}
          delay={0.4}
        />
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 z-50 flex items-center justify-between gap-3 shadow-lg">
        <button
          onClick={onBack}
          className="flex-1 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Done</span>
        </button>
      </div>
    </div>
  );
}
