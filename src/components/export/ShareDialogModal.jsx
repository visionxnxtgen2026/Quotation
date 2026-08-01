import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Globe, Lock, Check, Copy, ExternalLink, QrCode, Plus, Trash2, Save,
  ShieldCheck, Loader2, Sparkles, CheckCircle2, ArrowRight, Share2
} from "lucide-react";
import { localDB } from "../../utils/localDB";
import { googleDriveProvider } from "../../utils/googleDriveProvider";
import QRCodeModal from "../settings/cloud/QRCodeModal";

/**
 * 🔒 ShareDialogModal — Enterprise Google Drive Sharing & Permission Management Modal.
 * Modifies permissions of existing Google Drive files in-place without duplicating uploads.
 */
export default function ShareDialogModal({
  isOpen,
  onClose,
  file,
  onFileUpdated,
  onToast
}) {
  const [step, setStep] = useState("select"); // "select" | "public_success" | "private_form" | "private_success"
  const [selectedMode, setSelectedMode] = useState("public"); // "public" | "private"
  const [allowedEmails, setAllowedEmails] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (isOpen && file) {
      const isPub = file.visibility === "public";
      setSelectedMode(isPub ? "public" : "private");
      setShareUrl(file.shareUrl || `https://drive.google.com/file/d/${file.driveFileId}/view`);
      setStep("select");

      const defaultOwner = localStorage.getItem("gdrive_user_email") || "owner@visionx.com";
      const list = Array.isArray(file.allowedEmails) && file.allowedEmails.length > 0
        ? file.allowedEmails
        : [defaultOwner, "client@gmail.com"];
      setAllowedEmails(list);
    }
  }, [isOpen, file]);

  if (!isOpen || !file) return null;

  const handleCopyLink = () => {
    const urlToCopy = shareUrl || file.shareUrl;
    if (!urlToCopy) {
      if (onToast) onToast("No link available.", "error");
      return;
    }
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    if (onToast) onToast("Google Drive link copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    const urlToShare = shareUrl || file.shareUrl;
    if (navigator.share && urlToShare) {
      try {
        await navigator.share({
          title: `Quotation — ${file.fileName}`,
          url: urlToShare,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      handleCopyLink();
    }
  };

  const handleAddEmail = () => {
    if (!newEmail || !newEmail.includes("@")) {
      if (onToast) onToast("Please enter a valid email address.", "error");
      return;
    }
    const trimmed = newEmail.trim();
    if (allowedEmails.includes(trimmed)) {
      if (onToast) onToast("Email address already added.", "error");
      return;
    }
    setAllowedEmails((prev) => [...prev, trimmed]);
    setNewEmail("");
  };

  const handleRemoveEmail = (emailToRemove) => {
    setAllowedEmails((prev) => prev.filter((e) => e !== emailToRemove));
  };

  // ── Execute Public Permission Update ──
  const handleApplyPublic = async () => {
    setIsUpdating(true);
    try {
      let updatedUrl = shareUrl;

      if (file.driveFileId) {
        const res = await googleDriveProvider.setFileVisibility(file.driveFileId, "public", []);
        if (res?.shareUrl) updatedUrl = res.shareUrl;
      }

      setShareUrl(updatedUrl);

      const updatedFile = localDB.saveCloudFile({
        ...file,
        visibility: "public",
        shareUrl: updatedUrl,
        allowedEmails,
      });

      localDB.logCloudSyncEvent({
        action: "Permission Changed",
        fileName: file.fileName,
        details: `Visibility set to PUBLIC for ${file.fileName}.`
      });

      if (onFileUpdated) onFileUpdated(updatedFile);
      setStep("public_success");
      if (onToast) onToast("✓ Public link created successfully!", "success");
    } catch (err) {
      console.error("Error setting public permission:", err);
      if (onToast) onToast("Failed to update Google Drive permission.", "error");
    } fontally: {
      setIsUpdating(false);
    }
  };

  // ── Execute Private Permission Update ──
  const handleApplyPrivate = async () => {
    setIsUpdating(true);
    try {
      if (file.driveFileId) {
        await googleDriveProvider.setFileVisibility(file.driveFileId, "private", allowedEmails);
      }

      const updatedFile = localDB.saveCloudFile({
        ...file,
        visibility: "private",
        allowedEmails,
      });

      localDB.logCloudSyncEvent({
        action: "Permission Changed",
        fileName: file.fileName,
        details: `Visibility set to PRIVATE (${allowedEmails.length} emails) for ${file.fileName}.`
      });

      if (onFileUpdated) onFileUpdated(updatedFile);
      setStep("private_success");
      if (onToast) onToast("✓ Private permissions updated successfully!", "success");
    } catch (err) {
      console.error("Error setting private permission:", err);
      if (onToast) onToast("Failed to save private permissions.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleContinueMode = () => {
    if (selectedMode === "public") {
      handleApplyPublic();
    } else {
      setStep("private_form");
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
                  Google Drive Permissions
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Share Quotation</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Choose how you want to share this Google Drive file.
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* ─── STEP 1: MODE SELECTION ─── */}
            {step === "select" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {/* 🌍 Public Card */}
                  <div
                    onClick={() => setSelectedMode("public")}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                      selectedMode === "public"
                        ? "border-emerald-500 bg-emerald-50/40 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                          selectedMode === "public" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                        }`}>
                          <Globe size={22} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-slate-900">🌍 Public</h4>
                            <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
                              Anyone with Link
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-bold mt-0.5">
                            Anyone with the link can view this quotation.
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                            Perfect for customers.
                          </p>
                        </div>
                      </div>

                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        selectedMode === "public" ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300"
                      }`}>
                        {selectedMode === "public" && <Check size={14} strokeWidth={3} />}
                      </div>
                    </div>
                  </div>

                  {/* 🔒 Private Card */}
                  <div
                    onClick={() => setSelectedMode("private")}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                      selectedMode === "private"
                        ? "border-amber-500 bg-amber-50/40 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                          selectedMode === "private" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                        }`}>
                          <Lock size={22} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-slate-900">🔒 Private</h4>
                            <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase">
                              Restricted Access
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-bold mt-0.5">
                            Only selected email addresses can open this quotation.
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                            Perfect for confidential quotations.
                          </p>
                        </div>
                      </div>

                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        selectedMode === "private" ? "border-amber-600 bg-amber-600 text-white" : "border-slate-300"
                      }`}>
                        {selectedMode === "private" && <Check size={14} strokeWidth={3} />}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleContinueMode}
                    disabled={isUpdating}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isUpdating ? (
                      <><Loader2 size={16} className="animate-spin" /> Updating Google Drive...</>
                    ) : (
                      <><span>Continue</span> <ArrowRight size={16} /></>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ─── PUBLIC SUCCESS FLOW ─── */}
            {step === "public_success" && (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-center gap-3 text-emerald-950">
                  <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-xs font-black">✓ Public Link Created</h4>
                    <p className="text-[11px] text-emerald-700 font-medium">
                      Anyone with this Google Drive link can now view the document.
                    </p>
                  </div>
                </div>

                {/* Display Google Drive URL */}
                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    Google Drive Share URL
                  </label>
                  <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-xs font-mono text-slate-700 truncate">
                    <span className="truncate pr-2">{shareUrl || file.shareUrl}</span>
                    <button
                      onClick={handleCopyLink}
                      className="text-blue-600 hover:text-blue-700 font-bold shrink-0 text-[11px] hover:underline cursor-pointer"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Public Actions Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <button
                    onClick={handleCopyLink}
                    className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? "Copied!" : "Copy Link"}</span>
                  </button>

                  {file.shareUrl && (
                    <a
                      href={file.shareUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink size={14} />
                      <span>Open Link</span>
                    </a>
                  )}

                  <button
                    onClick={() => setShowQRModal(true)}
                    className="py-2.5 px-3 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold hover:bg-purple-100 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <QrCode size={14} />
                    <span>QR Code</span>
                  </button>

                  <button
                    onClick={handleNativeShare}
                    className="py-2.5 px-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Share2 size={14} />
                    <span>Share</span>
                  </button>
                </div>

                <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                  <button
                    onClick={() => setStep("select")}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    ← Edit Permissions
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* ─── PRIVATE EMAIL FORM ─── */}
            {step === "private_form" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Authorized Users
                  </h4>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                    {allowedEmails.length} Recipient(s)
                  </span>
                </div>

                {/* Email Input + Add Button */}
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter email address (e.g. customer@gmail.com)"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
                    className="flex-1 bg-white border border-amber-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-600"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddEmail}
                    className="px-3.5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Plus size={15} />
                    <span>Add Email</span>
                  </button>
                </div>

                {/* Email List */}
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {allowedEmails.map((email, idx) => (
                    <div
                      key={email}
                      className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 flex items-center justify-between text-xs"
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

                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setStep("select")}
                    disabled={isUpdating}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplyPrivate}
                    disabled={isUpdating}
                    className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                  >
                    {isUpdating ? (
                      <><Loader2 size={15} className="animate-spin" /> Saving Permissions...</>
                    ) : (
                      <><Save size={15} /> Save Permissions</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ─── PRIVATE SUCCESS FLOW ─── */}
            {step === "private_success" && (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-center gap-3 text-amber-950">
                  <CheckCircle2 size={24} className="text-amber-600 shrink-0" />
                  <div>
                    <h4 className="text-xs font-black">✓ Permissions Updated Successfully</h4>
                    <p className="text-[11px] text-amber-700 font-medium">
                      Public access revoked. Only authorized email accounts can access this file on Google Drive.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <button
                    onClick={() => setStep("select")}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    ← Edit Permissions
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* Security Footer Notice */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-blue-600" />
                Google Drive In-Place Permission Sync
              </span>
              <span className="font-bold text-slate-800">Same Drive File ID</span>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Embedded QR Code Modal */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        url={shareUrl || file.shareUrl || ""}
        fileName={file.fileName || "Quotation"}
      />
    </>
  );
}
