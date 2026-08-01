import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileArchive, RotateCcw, X, CheckCircle2, ShieldCheck, Sparkles, Loader2 } from "lucide-react";
import { workspaceBackupProvider } from "../../../utils/workspaceBackupProvider";
import { googleDriveProvider } from "../../../utils/googleDriveProvider";

export default function WorkspaceRestoreDetector({ onToast }) {
  const [isOpen, setIsOpen] = useState(false);
  const [backupInfo, setBackupInfo] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [progressPct, setProgressPct] = useState(0);

  const checkForBackups = async () => {
    const isConnected = await googleDriveProvider.isConnected();
    if (!isConnected) return;

    // Check if restore prompt was already dismissed in this session
    if (sessionStorage.getItem("gdrive_restore_prompt_dismissed") === "true") return;

    try {
      const backups = await workspaceBackupProvider.fetchWorkspaceBackupsList();
      if (backups && backups.length > 0) {
        const latest = backups[0];
        setBackupInfo(latest);
        setIsOpen(true);
      }
    } catch (e) {
      console.warn("Workspace backup check notice:", e);
    }
  };

  useEffect(() => {
    checkForBackups();
    window.addEventListener("gdriveStatusUpdated", checkForBackups);
    return () => window.removeEventListener("gdriveStatusUpdated", checkForBackups);
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("gdrive_restore_prompt_dismissed", "true");
    setIsOpen(false);
  };

  const handleRestore = async () => {
    if (!backupInfo) return;
    setIsRestoring(true);
    setProgressMsg("Downloading Workspace Backup...");
    setProgressPct(20);

    try {
      await workspaceBackupProvider.restoreWorkspace(backupInfo.id, "replace", (msg, pct) => {
        setProgressMsg(msg);
        setProgressPct(pct);
      });

      sessionStorage.setItem("gdrive_restore_prompt_dismissed", "true");
      setIsOpen(false);
      if (onToast) onToast("Workspace restored successfully on this device!", "success");
    } catch (err) {
      console.error("Restore Error:", err);
      if (onToast) onToast(err.message || "Failed to restore workspace.", "error");
    } finally {
      setIsRestoring(false);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return "2.4 MB";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Recently";
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

  if (!isOpen || !backupInfo) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-md"
          onClick={handleDismiss}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 320 }}
          className="relative bg-white rounded-[32px] p-6 shadow-2xl border border-slate-100 max-w-sm w-full z-10 text-center space-y-5"
        >
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X size={16} />
          </button>

          {/* Animated Header Icon */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mb-3 shadow-inner">
              <FileArchive size={32} />
            </div>
            <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full mb-1">
              Google Drive Found
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Workspace Backup Found</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              A previous workspace backup was detected in your Google Drive.
            </p>
          </div>

          {/* Backup Details Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Last Backup Date</span>
              <span className="font-bold text-slate-900">{formatDate(backupInfo.createdTime)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Backup Size</span>
              <span className="font-mono font-bold text-blue-600">{formatSize(backupInfo.size)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Created On Device</span>
              <span className="font-bold text-slate-900">{backupInfo.deviceName}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 font-medium px-2">
            Restoring will setup all your saved quotations, company profiles, logos, signatures, and preferences.
          </p>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleDismiss}
              disabled={isRestoring}
              className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Skip
            </button>
            <button
              onClick={handleRestore}
              disabled={isRestoring}
              className="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isRestoring ? (
                <><Loader2 size={15} className="animate-spin" /> Restoring...</>
              ) : (
                <><RotateCcw size={15} /> Restore Workspace</>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
