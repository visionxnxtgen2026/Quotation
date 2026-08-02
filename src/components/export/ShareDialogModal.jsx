import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Globe, Lock, Check, Copy, ExternalLink, QrCode, Plus, Trash2, Save,
  ShieldCheck, Loader2, Share2, UserPlus, Users, Sparkles
} from "lucide-react";
import { localDB } from "../../utils/localDB";
import { googleDriveProvider } from "../../utils/googleDriveProvider";
import QRCodeModal from "./QRCodeModal";

/**
 * 📱 ShareDialogModal — Mobile-First Google Drive Bottom Sheet Permission Manager.
 * Replaces centered desktop modals with an Apple/Material 3 mobile bottom sheet (max-h: 85vh).
 */
export default function ShareDialogModal({
  isOpen,
  onClose,
  file,
  onFileUpdated,
  onToast
}) {
  const [activeTab, setActiveTab] = useState("public"); // "public" | "private"
  const [allowedEmails, setAllowedEmails] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [driveUrl, setDriveUrl] = useState("");

  useEffect(() => {
    if (isOpen && file) {
      const isPub = file.visibility === "public";
      setActiveTab(isPub ? "public" : "private");

      const resolvedUrl = file.shareUrl || (file.driveFileId ? `https://drive.google.com/file/d/${file.driveFileId}/view` : "");
      setDriveUrl(resolvedUrl);

      const defaultOwner = localStorage.getItem("gdrive_user_email") || "owner@VisionX.com";
      const list = Array.isArray(file.allowedEmails) && file.allowedEmails.length > 0
        ? file.allowedEmails
        : [defaultOwner, "customer@gmail.com"];
      setAllowedEmails(list);
    }
  }, [isOpen, file]);

  if (!isOpen || !file) return null;

  const targetUrl = driveUrl || file.shareUrl || `https://drive.google.com/file/d/${file.driveFileId}/view`;

  const handleCopyLink = (isPrivateMode = false) => {
    if (!targetUrl) {
      if (onToast) onToast("No link available.", "error");
      return;
    }
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    const msg = isPrivateMode
      ? "Copied Private Link! Only authorized emails can access."
      : "Public Link copied to clipboard!";
    if (onToast) onToast(msg, "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share && targetUrl) {
      try {
        await navigator.share({
          title: `Quotation — ${file.fileName}`,
          url: targetUrl,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      handleCopyLink(false);
    }
  };

  const handleAddEmail = () => {
    if (!newEmail || !newEmail.includes("@")) {
      if (onToast) onToast("Please enter a valid email address.", "error");
      return;
    }
    const trimmed = newEmail.trim().toLowerCase();
    if (allowedEmails.includes(trimmed)) {
      if (onToast) onToast("Email already added.", "error");
      return;
    }
    setAllowedEmails((prev) => [...prev, trimmed]);
    setNewEmail("");
  };

  const handleRemoveEmail = (emailToRemove) => {
    setAllowedEmails((prev) => prev.filter((e) => e !== emailToRemove));
  };

  const handleApplyPublicMode = async () => {
    setIsUpdating(true);
    try {
      let finalUrl = targetUrl;
      if (file.driveFileId) {
        const res = await googleDriveProvider.setFileVisibility(file.driveFileId, "public", []);
        if (res?.shareUrl) finalUrl = res.shareUrl;
      }

      setDriveUrl(finalUrl);

      const updatedFile = localDB.saveCloudFile({
        ...file,
        visibility: "public",
        shareUrl: finalUrl,
        allowedEmails,
      });

      localDB.logCloudSyncEvent({
        action: "Permission Changed",
        fileName: file.fileName,
        details: `Visibility set to PUBLIC for ${file.fileName}.`
      });

      if (onFileUpdated) onFileUpdated(updatedFile);
      if (onToast) onToast("✓ Updated to Public Mode!", "success");
    } catch (err) {
      console.error("Public Permission Error:", err);
      if (onToast) onToast("Failed to update Google Drive permission.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApplyPrivateMode = async () => {
    setIsUpdating(true);
    try {
      if (file.driveFileId) {
        await googleDriveProvider.setFileVisibility(file.driveFileId, "private", allowedEmails);
      }

      const updatedFile = localDB.saveCloudFile({
        ...file,
        visibility: "private",
        allowedEmails,
        shareUrl: targetUrl,
      });

      localDB.logCloudSyncEvent({
        action: "Permission Changed",
        fileName: file.fileName,
        details: `Visibility set to PRIVATE for ${file.fileName}.`
      });

      if (onFileUpdated) onFileUpdated(updatedFile);
      if (onToast) onToast("✓ Saved Private Permissions!", "success");
    } catch (err) {
      console.error("Private Permission Error:", err);
      if (onToast) onToast("Failed to save private permissions.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSwitchTab = (tab) => {
    setActiveTab(tab);
    if (tab === "public") {
      handleApplyPublicMode();
    } else {
      handleApplyPrivateMode();
    }
  };

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-[120] flex flex-col justify-end items-center">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={onClose}
          />

          {/* 📱 Mobile Bottom Sheet Panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative bg-white rounded-t-[28px] shadow-2xl border-t border-slate-200/80 w-full max-w-[480px] max-h-[85vh] flex flex-col z-10 overflow-hidden"
          >
            {/* Drag Handle Indicator */}
            <div className="w-full pt-3 pb-1 flex justify-center shrink-0">
              <div className="w-12 h-1.5 rounded-full bg-slate-300/80" />
            </div>

            {/* Header */}
            <div className="px-5 pb-3 pt-1 flex items-center justify-between border-b border-slate-100 shrink-0">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">Share Quotation</h3>
                <p className="text-xs text-slate-500 font-medium">Manage Google Drive access</p>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Segmented Permission Control Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 shrink-0">
              <div className="grid grid-cols-2 bg-slate-200/70 p-1 rounded-2xl relative">
                <button
                  onClick={() => handleSwitchTab("public")}
                  className={`relative z-10 py-2 text-xs font-black rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === "public" ? "text-emerald-700" : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                  <Globe size={15} />
                  <span>🌍 Public</span>
                </button>

                <button
                  onClick={() => handleSwitchTab("private")}
                  className={`relative z-10 py-2 text-xs font-black rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === "private" ? "text-amber-700" : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                  <Lock size={15} />
                  <span>🔒 Private</span>
                </button>

                {/* Animated Background Slider */}
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className={`absolute inset-y-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-xs ${activeTab === "public" ? "left-1 border border-emerald-200/80" : "left-[calc(50%+2px)] border border-amber-200/80"
                    }`}
                />
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* 🌍 PUBLIC MODE */}
              {activeTab === "public" && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  {/* Small info banner */}
                  <div className="bg-emerald-50 border border-emerald-200/60 rounded-xl px-3 py-2 flex items-center gap-2 text-emerald-900 text-xs font-semibold">
                    <Globe size={15} className="text-emerald-600 shrink-0" />
                    <span>🌍 Public — Anyone with the link can view this file.</span>
                  </div>

                  {/* Compact Public Link Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Public Link
                    </label>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2">
                      <input
                        type="text"
                        readOnly
                        value={targetUrl}
                        className="flex-1 bg-transparent text-xs font-mono font-bold text-slate-800 outline-none truncate px-1"
                      />
                      <button
                        onClick={() => handleCopyLink(false)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                      >
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>

                  {/* All 4 Equal Action Buttons in One Compact Grid Row (h-12 / 48px, rounded-14px) */}
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    <button
                      onClick={() => handleCopyLink(false)}
                      className="h-12 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-[14px] text-xs font-bold transition-colors cursor-pointer flex flex-col items-center justify-center gap-0.5"
                    >
                      <Copy size={16} />
                      <span className="text-[10px]">Copy</span>
                    </button>

                    <a
                      href={targetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="h-12 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-[14px] text-xs font-bold transition-colors cursor-pointer flex flex-col items-center justify-center gap-0.5"
                    >
                      <ExternalLink size={16} />
                      <span className="text-[10px]">Open</span>
                    </a>

                    <button
                      onClick={handleNativeShare}
                      className="h-12 bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 rounded-[14px] text-xs font-bold transition-colors cursor-pointer flex flex-col items-center justify-center gap-0.5"
                    >
                      <Share2 size={16} />
                      <span className="text-[10px]">Share</span>
                    </button>

                    <button
                      onClick={() => setShowQRModal(true)}
                      className="h-12 bg-purple-50 text-purple-700 border border-purple-100 hover:bg-purple-100 rounded-[14px] text-xs font-bold transition-colors cursor-pointer flex flex-col items-center justify-center gap-0.5"
                    >
                      <QrCode size={16} />
                      <span className="text-[10px]">QR</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 🔒 PRIVATE MODE */}
              {activeTab === "private" && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  {/* Small info banner */}
                  <div className="bg-amber-50 border border-amber-200/60 rounded-xl px-3 py-2 flex items-center gap-2 text-amber-900 text-xs font-semibold">
                    <Lock size={15} className="text-amber-600 shrink-0" />
                    <span>🔒 Private — Only authorized email addresses can access this file.</span>
                  </div>

                  {/* Add Email Single Row */}
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Add email address..."
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 h-11 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddEmail}
                      className="h-11 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0 shadow-2xs"
                    >
                      <UserPlus size={15} />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Authorized Users Compact List */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        Authorized Users ({allowedEmails.length})
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-0.5">
                      {allowedEmails.map((email, idx) => {
                        const initial = email.charAt(0).toUpperCase();
                        return (
                          <div
                            key={email}
                            className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xs shrink-0 border border-amber-200">
                                {initial}
                              </div>
                              <span className="font-bold text-slate-800 truncate">{email}</span>
                              {idx === 0 && (
                                <span className="text-[9px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full uppercase shrink-0">
                                  Owner
                                </span>
                              )}
                            </div>

                            {idx !== 0 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveEmail(email)}
                                className="text-slate-400 hover:text-red-600 transition-colors p-1.5 cursor-pointer shrink-0"
                                title="Remove Email"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Footer (Equal height 48px buttons, rounded 14px) */}
            <div className="p-4 bg-white border-t border-slate-100 grid grid-cols-2 gap-2.5 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isUpdating}
                className="h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-[14px] text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={activeTab === "public" ? handleApplyPublicMode : handleApplyPrivateMode}
                disabled={isUpdating}
                className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-[14px] text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isUpdating ? (
                  <><Loader2 size={16} className="animate-spin" /> Saving...</>
                ) : (
                  <><Save size={16} /> Save Permissions</>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Embedded QR Code Modal */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        url={targetUrl}
        fileName={file.fileName || "Quotation"}
      />
    </>
  );
}
