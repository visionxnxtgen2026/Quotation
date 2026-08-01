import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Globe, Lock, Check, Copy, ExternalLink, QrCode, Plus, Trash2, Save,
  Shield, ShieldCheck, Loader2, Sparkles
} from "lucide-react";
import { localDB } from "../../utils/localDB";
import { googleDriveProvider } from "../../utils/googleDriveProvider";
import QRCodeModal from "../settings/cloud/QRCodeModal";

export default function ShareDialogModal({
  isOpen,
  onClose,
  file,
  onFileUpdated,
  onToast
}) {
  const [visibility, setVisibility] = useState("public");
  const [allowedEmails, setAllowedEmails] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    if (isOpen && file) {
      setVisibility(file.visibility || "public");
      const defaultOwner = localStorage.getItem("gdrive_user_email") || "owner@visionx.com";
      const list = Array.isArray(file.allowedEmails) && file.allowedEmails.length > 0
        ? file.allowedEmails
        : [defaultOwner, "client@company.com"];
      setAllowedEmails(list);
    }
  }, [isOpen, file]);

  if (!isOpen || !file) return null;

  const handleCopyLink = () => {
    if (!file.shareUrl) {
      if (onToast) onToast("Generating public link first...", "error");
      return;
    }
    navigator.clipboard.writeText(file.shareUrl);
    setCopied(true);
    if (onToast) onToast("Google Drive link copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddEmail = () => {
    if (!newEmail || !newEmail.includes("@")) {
      if (onToast) onToast("Please enter a valid email address.", "error");
      return;
    }
    const trimmed = newEmail.trim();
    if (allowedEmails.includes(trimmed)) {
      if (onToast) onToast("Email already exists in allowed list.", "error");
      return;
    }
    setAllowedEmails((prev) => [...prev, trimmed]);
    setNewEmail("");
  };

  const handleRemoveEmail = (emailToRemove) => {
    setAllowedEmails((prev) => prev.filter((e) => e !== emailToRemove));
  };

  const handleApplyPermissions = async (targetVisibility) => {
    const newVis = targetVisibility || visibility;
    setVisibility(newVis);
    setIsUpdating(true);

    try {
      let shareUrl = file.shareUrl;

      if (file.driveFileId) {
        const res = await googleDriveProvider.setFileVisibility(file.driveFileId, newVis, allowedEmails);
        if (res?.shareUrl) shareUrl = res.shareUrl;
      }

      // Update local metadata database
      const updatedFile = localDB.saveCloudFile({
        ...file,
        visibility: newVis,
        allowedEmails,
        shareUrl: newVis === "public" ? shareUrl : file.shareUrl,
        shareHistory: [
          ...(file.shareHistory || []),
          { action: `Permission Changed to ${newVis.toUpperCase()}`, timestamp: new Date().toISOString() }
        ]
      });

      localDB.logCloudSyncEvent({
        action: "Permission Changed",
        fileName: file.fileName,
        details: `Visibility changed to ${newVis.toUpperCase()} for ${file.fileName}.`
      });

      if (onFileUpdated) onFileUpdated(updatedFile);
      if (onToast) onToast(`Permissions updated to ${newVis.toUpperCase()}!`, "success");
    } catch (err) {
      console.error("Error updating permissions:", err);
      if (onToast) onToast("Failed to update Google Drive permissions.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 320 }}
            className="relative bg-white rounded-[28px] p-6 shadow-2xl border border-slate-100 max-w-lg w-full z-10 overflow-hidden space-y-5"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-full inline-block mb-1">
                  Google Drive Permissions
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Share Quotation</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Choose how you want to share <span className="font-bold text-slate-800">{file.fileName}</span>.
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Mode Radio Cards */}
            <div className="grid grid-cols-1 gap-3">
              {/* 🌍 PUBLIC CARD */}
              <div
                onClick={() => handleApplyPermissions("public")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  visibility === "public"
                    ? "border-emerald-500 bg-emerald-50/40 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                      visibility === "public" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      <Globe size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900">🌍 Public</h4>
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
                          Anyone with Link
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Anyone with the generated Google Drive link can view the quotation.
                      </p>
                    </div>
                  </div>

                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    visibility === "public" ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300"
                  }`}>
                    {visibility === "public" && <Check size={14} strokeWidth={3} />}
                  </div>
                </div>

                {/* Public Mode Controls */}
                {visibility === "public" && (
                  <div className="pt-3 border-t border-emerald-200/60 space-y-2 mt-2 animate-in fade-in">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyLink();
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copied ? "Copied!" : "Copy Link"}</span>
                      </button>

                      {file.shareUrl && (
                        <a
                          href={file.shareUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-center gap-1 px-3 py-2 bg-white text-slate-800 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <ExternalLink size={14} />
                          <span>Open</span>
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowQRModal(true);
                        }}
                        className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold hover:bg-purple-100 transition-colors cursor-pointer"
                      >
                        <QrCode size={14} />
                        <span>QR Code</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 🔒 PRIVATE CARD */}
              <div
                onClick={() => handleApplyPermissions("private")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  visibility === "private"
                    ? "border-amber-500 bg-amber-50/40 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                      visibility === "private" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      <Lock size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900">🔒 Private</h4>
                        <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase">
                          Restricted Access
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Only selected email addresses can access this quotation on Google Drive.
                      </p>
                    </div>
                  </div>

                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    visibility === "private" ? "border-amber-600 bg-amber-600 text-white" : "border-slate-300"
                  }`}>
                    {visibility === "private" && <Check size={14} strokeWidth={3} />}
                  </div>
                </div>

                {/* Private Mode Controls */}
                {visibility === "private" && (
                  <div className="pt-3 border-t border-amber-200/60 space-y-3 mt-2 animate-in fade-in" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-black text-amber-950 uppercase tracking-wider">
                        Authorized Email Addresses ({(allowedEmails || []).length})
                      </span>
                    </div>

                    {/* Email Input + Add Button */}
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="Add recipient email (e.g. client@gmail.com)"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
                        className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-600"
                      />
                      <button
                        type="button"
                        onClick={handleAddEmail}
                        className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <Plus size={14} />
                        <span>Add</span>
                      </button>
                    </div>

                    {/* Email List */}
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {allowedEmails.map((email, idx) => (
                        <div
                          key={email}
                          className="bg-white rounded-xl p-2.5 border border-amber-200 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                            <span className="font-bold text-slate-800 truncate">{email}</span>
                            {idx === 0 && (
                              <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full uppercase">
                                Owner
                              </span>
                            )}
                          </div>

                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveEmail(email)}
                              className="text-slate-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                              title="Remove access"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Save Access Button */}
                    <div className="pt-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleApplyPermissions("private")}
                        disabled={isUpdating}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        <span>{isUpdating ? "Updating..." : "Save Access"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Footer */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-blue-600" />
                Google Drive In-Place Permission Sync
              </span>
              <span className="font-bold text-slate-800">No Duplicate Files</span>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Embedded QR Code Modal */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        url={file.shareUrl || ""}
        fileName={file.fileName || "Quotation"}
      />
    </>
  );
}
