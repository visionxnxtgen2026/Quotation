import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Globe, Lock, Check, Copy, ExternalLink, QrCode, Plus, Trash2, Save,
  ShieldCheck, Loader2, CheckCircle2, Share2, UserPlus, Users, Eye
} from "lucide-react";
import { localDB } from "../../utils/localDB";
import { googleDriveProvider } from "../../utils/googleDriveProvider";
import QRCodeModal from "../settings/cloud/QRCodeModal";

/**
 * 🔒 ShareDialogModal — Google Drive Tabbed Share & Permission Manager.
 * Preserves the Google Drive URL in both Public and Private modes.
 * Modifies permissions on existing Google Drive file without duplicating uploads.
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

      // Always resolve Google Drive URL for both public and private modes
      const resolvedUrl = file.shareUrl || (file.driveFileId ? `https://drive.google.com/file/d/${file.driveFileId}/view` : "");
      setDriveUrl(resolvedUrl);

      const defaultOwner = localStorage.getItem("gdrive_user_email") || "owner@visionx.com";
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
      if (onToast) onToast("No Google Drive link available.", "error");
      return;
    }
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    const msg = isPrivateMode
      ? "Copied Private Google Drive link! Only authorized emails can access."
      : "Public Google Drive link copied to clipboard!";
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
    const trimmed = newEmail.trim();
    if (allowedEmails.includes(trimmed)) {
      if (onToast) onToast("User email already added.", "error");
      return;
    }
    setAllowedEmails((prev) => [...prev, trimmed]);
    setNewEmail("");
  };

  const handleRemoveEmail = (emailToRemove) => {
    setAllowedEmails((prev) => prev.filter((e) => e !== emailToRemove));
  };

  // ── Switch to Public Mode & Update Google Drive Permission ──
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
        details: `Visibility changed to PUBLIC for ${file.fileName}.`
      });

      if (onFileUpdated) onFileUpdated(updatedFile);
      if (onToast) onToast("✓ Updated to Public Mode! Anyone with link can view.", "success");
    } catch (err) {
      console.error("Public Permission Error:", err);
      if (onToast) onToast("Failed to update Google Drive permission.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  // ── Switch to Private Mode & Update Google Drive Permissions ──
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
        shareUrl: targetUrl, // Preserve Drive URL in local storage
      });

      localDB.logCloudSyncEvent({
        action: "Permission Changed",
        fileName: file.fileName,
        details: `Visibility changed to PRIVATE (${allowedEmails.length} users) for ${file.fileName}.`
      });

      if (onFileUpdated) onFileUpdated(updatedFile);
      if (onToast) onToast("✓ Saved Private Permissions! Only authorized emails can access.", "success");
    } catch (err) {
      console.error("Private Permission Error:", err);
      if (onToast) onToast("Failed to save private permissions.", "error");
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
            initial={{ scale: 0.94, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 320 }}
            className="relative bg-white rounded-[24px] p-6 shadow-2xl border border-slate-100 max-w-lg w-full z-10 overflow-hidden space-y-5"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full inline-block mb-1">
                  Google Drive Share
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Share Quotation</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Manage access for <span className="font-bold text-slate-800">{file.fileName}</span>.
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tab Navigation (Public vs Private) */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 border border-slate-200/80">
              <button
                onClick={() => {
                  setActiveTab("public");
                  handleApplyPublicMode();
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === "public"
                    ? "bg-white text-emerald-700 shadow-xs border border-emerald-200/60"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Globe size={16} />
                <span>🌍 Public</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("private");
                  handleApplyPrivateMode();
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === "private"
                    ? "bg-white text-amber-700 shadow-xs border border-amber-200/60"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Lock size={16} />
                <span>🔒 Private</span>
              </button>
            </div>

            {/* ─── PUBLIC TAB ─── */}
            {activeTab === "public" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between text-emerald-950">
                  <div className="flex items-center gap-3">
                    <Globe size={22} className="text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="text-xs font-black">🌍 Anyone with Link</h4>
                      <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                        Anyone with this Google Drive URL can open and view the file.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase shrink-0">
                    Public Active
                  </span>
                </div>

                {/* Google Drive Link Box (Always Visible) */}
                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    Google Drive Public Link
                  </label>
                  <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-xs font-mono text-slate-700 truncate">
                    <span className="truncate pr-2">{targetUrl}</span>
                    <button
                      onClick={() => handleCopyLink(false)}
                      className="text-blue-600 hover:text-blue-700 font-bold shrink-0 text-[11px] hover:underline cursor-pointer"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleCopyLink(false)}
                    className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? "Copied!" : "Copy Link"}</span>
                  </button>

                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink size={14} />
                    <span>Open Link</span>
                  </a>

                  <button
                    onClick={handleNativeShare}
                    className="py-2.5 px-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Share2 size={14} />
                    <span>Share</span>
                  </button>

                  <button
                    onClick={() => setShowQRModal(true)}
                    className="py-2.5 px-3 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold hover:bg-purple-100 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <QrCode size={14} />
                    <span>QR Code</span>
                  </button>
                </div>
              </div>
            )}

            {/* ─── PRIVATE TAB ─── */}
            {activeTab === "private" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between text-amber-950">
                  <div className="flex items-center gap-3">
                    <Lock size={22} className="text-amber-600 shrink-0" />
                    <div>
                      <h4 className="text-xs font-black">🔒 Restricted Access</h4>
                      <p className="text-[11px] text-amber-700 font-medium mt-0.5">
                        Only authorized email accounts can access this file. Google Drive will block others.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase shrink-0">
                    Private Active
                  </span>
                </div>

                {/* Google Drive Link Box (Always Visible in Private Mode) */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Google Drive Private Link
                    </label>
                    <span className="text-[10px] text-amber-600 font-bold">Requires Sign-In</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-xs font-mono text-slate-700 truncate">
                    <span className="truncate pr-2">{targetUrl}</span>
                    <button
                      onClick={() => handleCopyLink(true)}
                      className="text-amber-700 hover:text-amber-800 font-bold shrink-0 text-[11px] hover:underline cursor-pointer"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Private Mode Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleCopyLink(true)}
                    className="py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>Copy Private Link</span>
                  </button>

                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink size={14} />
                    <span>Open Link</span>
                  </a>
                </div>

                {/* Authorized Users Manager */}
                <div className="space-y-3 pt-1 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Users size={15} className="text-amber-600" /> Authorized Emails
                    </h4>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                      {allowedEmails.length} User(s)
                    </span>
                  </div>

                  {/* Input + Add Email */}
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Enter email address (e.g. customer@gmail.com)"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
                      className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-600"
                    />
                    <button
                      type="button"
                      onClick={handleAddEmail}
                      className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0 shadow-2xs"
                    >
                      <UserPlus size={14} />
                      <span>Add Email</span>
                    </button>
                  </div>

                  {/* Allowed Emails List */}
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {allowedEmails.map((email, idx) => (
                      <div
                        key={email}
                        className="bg-slate-50 rounded-xl p-2 border border-slate-200 flex items-center justify-between text-xs"
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
                            title="Remove Email"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Save Permissions Button */}
                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={handleApplyPrivateMode}
                      disabled={isUpdating}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {isUpdating ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                      <span>{isUpdating ? "Saving..." : "Save Permissions"}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Status */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-blue-600" />
                Google Drive In-Place Permission Sync
              </span>
              <span className="font-bold text-slate-800">URL Preserved</span>
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
