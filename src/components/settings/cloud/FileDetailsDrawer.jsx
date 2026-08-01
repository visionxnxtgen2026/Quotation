import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ExternalLink, Copy, Download, Trash2, Edit3, Shield, Eye,
  Clock, Folder, HardDrive, QrCode, Check, History, Lock, Globe
} from "lucide-react";
import { localDB } from "../../../utils/localDB";

export default function FileDetailsDrawer({
  file,
  isOpen,
  onClose,
  onCopyLink,
  onOpenRename,
  onDelete,
  onShowQR,
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !file) return null;

  const handleCopy = () => {
    if (file.shareUrl) {
      onCopyLink(file.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return "245 KB (Est.)";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
          onClick={onClose}
        />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0 font-bold text-lg">
                {file.fileName?.endsWith(".pdf") ? "📄" : file.fileName?.endsWith(".docx") ? "📝" : "🖼️"}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-black text-slate-900 truncate">{file.fileName}</h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">File Details &amp; Meta</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Document Preview Box */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-inner flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute top-3 right-3">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  file.visibility === "public" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}>
                  {file.visibility === "public" ? "🌐 Public" : "🔒 Private"}
                </span>
              </div>
              <span className="text-4xl my-2">📄</span>
              <p className="text-xs font-black text-white truncate max-w-[240px] mt-1">{file.fileName}</p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">{formatSize(file.size)}</p>
            </div>

            {/* Main Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {file.shareUrl && (
                <a
                  href={file.shareUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => localDB.incrementFileViewCount(file.id)}
                  className="flex flex-col items-center justify-center p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <ExternalLink size={16} className="mb-1" />
                  <span>Open Link</span>
                </a>
              )}

              <button
                onClick={handleCopy}
                disabled={!file.shareUrl}
                className="flex flex-col items-center justify-center p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-40"
              >
                {copied ? <Check size={16} className="text-emerald-600 mb-1" /> : <Copy size={16} className="mb-1" />}
                <span>{copied ? "Copied!" : "Copy Link"}</span>
              </button>

              <button
                onClick={() => onShowQR(file)}
                disabled={file.visibility !== "public"}
                className="flex flex-col items-center justify-center p-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-2xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-40"
              >
                <QrCode size={16} className="mb-1" />
                <span>QR Code</span>
              </button>
            </div>

            {/* Detailed Properties Table */}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2">Properties</p>
              <div className="bg-slate-50 rounded-2xl border border-slate-200/80 divide-y divide-slate-200/60 text-xs">
                <div className="p-3 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Quotation Number</span>
                  <span className="font-bold text-slate-900">{file.quotationNumber || "QTN-2026"}</span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Customer Name</span>
                  <span className="font-bold text-slate-900">{file.customerName || "Walk-in Customer"}</span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Created Date</span>
                  <span className="font-bold text-slate-900">{formatDate(file.createdAt)}</span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Last Modified</span>
                  <span className="font-bold text-slate-900">{formatDate(file.updatedAt)}</span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Visibility</span>
                  <span className={`font-bold capitalize ${file.visibility === "public" ? "text-emerald-600" : "text-amber-600"}`}>
                    {file.visibility || "Public"}
                  </span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Drive Folder</span>
                  <span className="font-mono font-bold text-blue-600">{file.folderName || "VisionX QuoteGen Pro"}</span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Google Drive File ID</span>
                  <span className="font-mono text-[10px] font-bold text-slate-600 truncate max-w-[140px]">{file.driveFileId || "Local Only"}</span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Total Views</span>
                  <span className="font-bold text-purple-600">{file.viewCount || 0} Views</span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Last Opened</span>
                  <span className="font-bold text-slate-900">{formatDate(file.lastOpenedAt)}</span>
                </div>
              </div>
            </div>

            {/* Allowed Emails for Private Access */}
            {file.visibility === "private" && (
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2">Allowed Emails</p>
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 space-y-2">
                  <p className="text-[11px] text-amber-900 font-bold flex items-center gap-1.5">
                    <Lock size={13} className="text-amber-600" /> Private Restricted Access
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(file.allowedEmails || []).map((email, i) => (
                      <span key={i} className="text-[11px] bg-white text-slate-800 border border-slate-200 px-2.5 py-1 rounded-full font-bold">
                        {email}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Share & Activity History */}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2 flex items-center gap-1">
                <History size={12} /> Share &amp; Event History
              </p>
              <div className="space-y-2">
                {(file.shareHistory || [{ action: "Created & Sync Metadata", timestamp: file.createdAt }]).map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{item.action}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{formatDate(item.timestamp)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
            <button
              onClick={() => onOpenRename(file)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Edit3 size={15} />
              <span>Rename</span>
            </button>

            <button
              onClick={() => {
                onDelete(file);
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Trash2 size={15} />
              <span>Delete</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
