import React, { useState, useEffect } from "react";
import {
  Cloud, CheckCircle2, RefreshCw, LogOut, Download, Upload,
  Folder, ShieldCheck, Loader2, AlertCircle, X, ArrowLeft,
  FileText, Check, Settings, HardDrive, User, Calendar
} from "lucide-react";
import { googleDriveProvider } from "../../utils/googleDriveProvider";
import { localDB } from "../../utils/localDB";

/**
 * ☁️ CloudSyncModal Component
 * Enterprise Bottom Sheet (Mobile) & Centered Modal (Desktop)
 * Features Google Drive Connect, Sync Now, Backup Now, Disconnect,
 * Auto Backup Switches, and complete Remote Restore Screen.
 */
export default function CloudSyncModal({ isOpen, onClose }) {
  const [view, setView] = useState("main"); // "main" | "restore"
  const [isConnected, setIsConnected] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [lastSync, setLastSync] = useState(null);

  const [isSyncing, setIsSyncing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [syncStatusMsg, setSyncStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  // Restore Screen State
  const [remoteQuotes, setRemoteQuotes] = useState([]);
  const [isLoadingRemote, setIsLoadingRemote] = useState(false);

  // Auto Backup Switches State
  const [switches, setSwitches] = useState(() => ({
    backupSettings: localStorage.getItem("gdrive_sw_settings") !== "false",
    backupQuotations: localStorage.getItem("gdrive_sw_quotations") !== "false",
    backupPdfs: localStorage.getItem("gdrive_sw_pdfs") !== "false",
    backupDrafts: localStorage.getItem("gdrive_sw_drafts") !== "false",
    autoSync: localStorage.getItem("gdrive_sw_autosync") !== "false",
    syncOnExport: localStorage.getItem("gdrive_sw_export") !== "false",
    syncOnSave: localStorage.getItem("gdrive_sw_save") !== "false",
  }));

  const updateStatus = async () => {
    const connected = await googleDriveProvider.isConnected();
    setIsConnected(connected);
    setUserEmail(localStorage.getItem("gdrive_user_email") || "");
    setLastSync(localStorage.getItem("gdrive_last_sync_time") || null);
  };

  useEffect(() => {
    if (isOpen) {
      updateStatus();
      setView("main");
    }
  }, [isOpen]);

  useEffect(() => {
    window.addEventListener("gdriveStatusUpdated", updateStatus);
    return () => window.removeEventListener("gdriveStatusUpdated", updateStatus);
  }, []);

  const handleToggleSwitch = (key) => {
    setSwitches(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem(`gdrive_sw_${key.toLowerCase()}`, String(updated[key]));
      return updated;
    });
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleConnect = async () => {
    setErrorMsg("");
    setIsSyncing(true);
    setSyncStatusMsg("Connecting to Google Drive...");
    setProgressPercent(20);

    try {
      await googleDriveProvider.authenticate();
      setProgressPercent(100);
      setSyncStatusMsg("✓ Connected to Google Drive");
      setTimeout(() => {
        setIsSyncing(false);
        setSyncStatusMsg("");
        setProgressPercent(0);
      }, 1200);
    } catch (err) {
      console.error("[GoogleDrive Connect Error]:", err);
      setErrorMsg(err.message || "Authentication failed. Please check internet connection.");
      setIsSyncing(false);
      setSyncStatusMsg("");
      setProgressPercent(0);
    }
  };

  const handleSyncNow = async () => {
    if (isSyncing) return;
    setErrorMsg("");
    setIsSyncing(true);

    try {
      await googleDriveProvider.syncNow((msg, pct) => {
        setSyncStatusMsg(msg);
        if (pct) setProgressPercent(pct);
      });
      setLastSync(localStorage.getItem("gdrive_last_sync_time"));
      showToast("✓ Cloud Sync completed successfully!");
      setTimeout(() => {
        setIsSyncing(false);
        setSyncStatusMsg("");
        setProgressPercent(0);
      }, 1200);
    } catch (err) {
      console.error("[GoogleDrive Sync Error]:", err);
      setErrorMsg(err.message || "Sync failed. Token might be expired.");
      setIsSyncing(false);
      setSyncStatusMsg("");
      setProgressPercent(0);
    }
  };

  const handleBackupNow = async () => {
    if (isSyncing) return;
    setErrorMsg("");
    setIsSyncing(true);

    try {
      await googleDriveProvider.backupAllNow((msg, pct) => {
        setSyncStatusMsg(msg);
        if (pct) setProgressPercent(pct);
      });
      setLastSync(localStorage.getItem("gdrive_last_sync_time"));
      showToast("✓ Full Backup created in Google Drive!");
      setTimeout(() => {
        setIsSyncing(false);
        setSyncStatusMsg("");
        setProgressPercent(0);
      }, 1200);
    } catch (err) {
      console.error("[GoogleDrive Backup Error]:", err);
      setErrorMsg(err.message || "Backup failed.");
      setIsSyncing(false);
      setSyncStatusMsg("");
      setProgressPercent(0);
    }
  };

  const handleOpenRestoreView = async () => {
    setView("restore");
    setIsLoadingRemote(true);
    try {
      const items = await googleDriveProvider.fetchRemoteQuotationsList();
      setRemoteQuotes(items);
    } catch (err) {
      console.error("[GoogleDrive Restore Fetch Error]:", err);
      setErrorMsg("Failed to load remote quotations from Google Drive.");
    } finally {
      setIsLoadingRemote(false);
    }
  };

  const handleRestoreQuotation = (qData) => {
    try {
      localDB.saveQuotation(qData);
      window.dispatchEvent(new Event("quotationDataUpdated"));
      showToast(`✓ Quotation ${qData.quotationNo || qData.projectDetails?.referenceNo} restored!`);
    } catch (err) {
      console.error("Restore error:", err);
      showToast("Failed to restore quotation.");
    }
  };

  const handleDisconnect = async () => {
    if (window.confirm("Are you sure you want to disconnect Google Drive?\n\nYour quotation files will remain completely safe in your personal Google Drive account. Only application access will be removed.")) {
      await googleDriveProvider.disconnect();
      setIsConnected(false);
      setUserEmail("");
      setLastSync(null);
      showToast("Google Drive disconnected.");
    }
  };

  const formatLastSyncStr = (isoString) => {
    if (!isoString) return "Never";
    try {
      const date = new Date(isoString);
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return isToday ? `Today ${timeStr}` : `${date.toLocaleDateString()} ${timeStr}`;
    } catch {
      return "Recently";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Sheet Container */}
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 border border-slate-200/80">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {view === "restore" ? (
              <button
                type="button"
                onClick={() => setView("main")}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100/60 shadow-2xs">
                <Cloud size={20} />
              </div>
            )}
            <div>
              <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                {view === "restore" ? "Restore Quotations" : "Cloud Storage"}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {view === "restore"
                  ? "Select a quotation to restore into local database"
                  : "Backup and restore your quotations securely using your own Google Drive."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Floating Toast Notification */}
        {toastMsg && (
          <div className="mx-5 mt-3 p-3 bg-slate-900 text-white rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow-lg animate-in fade-in duration-150">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">

          {/* ==================== VIEW 1: MAIN CLOUD STORAGE ==================== */}
          {view === "main" && (
            <>
              {/* STATUS CARD */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-blue-600 font-black text-xs">
                      <Cloud size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">Google Drive Integration</h4>
                      <p className="text-[10px] font-medium text-slate-500">Client-Side Direct Cloud Storage</p>
                    </div>
                  </div>

                  <div className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 ${isConnected ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                    <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                    <span>{isConnected ? "🟢 Connected" : "🔴 Not Connected"}</span>
                  </div>
                </div>

                {!isConnected ? (
                  <div className="space-y-3 pt-1">
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      Connect your Google Drive to securely backup quotations, company settings, templates, drafts and PDFs.
                    </p>
                    <button
                      type="button"
                      onClick={handleConnect}
                      disabled={isSyncing}
                      className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 active:scale-98 transition-all cursor-pointer disabled:opacity-70"
                    >
                      {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <Cloud size={16} />}
                      <span>Connect Google Drive</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5 pt-2 border-t border-slate-200/80 text-xs">
                    <div className="flex items-center justify-between text-slate-600 font-medium">
                      <span>Google Account</span>
                      <span className="font-extrabold text-slate-900">{userEmail || "Connected Google User"}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 font-medium">
                      <span>Storage Folder</span>
                      <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-200">VisionX QuoteGen Pro</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 font-medium">
                      <span>Storage Used</span>
                      <span className="font-extrabold text-blue-700">42 MB (Cloud Protected)</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 font-medium">
                      <span>Last Sync</span>
                      <span className="font-bold text-slate-900">{formatLastSyncStr(lastSync)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* PROGRESS BAR & SYNC STATUS */}
              {isSyncing && (
                <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-2xl space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-xs font-extrabold text-blue-900">
                    <span className="flex items-center gap-1.5">
                      <Loader2 size={14} className="animate-spin text-blue-600" />
                      {syncStatusMsg || "Syncing with Google Drive..."}
                    </span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-blue-200/80 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* ERROR MESSAGE */}
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 4 ACTION BUTTONS (WHEN CONNECTED) */}
              {isConnected && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={handleSyncNow}
                    disabled={isSyncing}
                    className="h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-98 transition-all cursor-pointer disabled:opacity-70"
                  >
                    <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
                    <span>Sync Now</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenRestoreView}
                    disabled={isSyncing}
                    className="h-12 rounded-2xl bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-2xs active:scale-98 transition-all cursor-pointer"
                  >
                    <Download size={14} className="text-blue-600" />
                    <span>Restore</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBackupNow}
                    disabled={isSyncing}
                    className="h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-98 transition-all cursor-pointer"
                  >
                    <Upload size={14} />
                    <span>Backup Now</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDisconnect}
                    disabled={isSyncing}
                    className="h-12 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Disconnect</span>
                  </button>
                </div>
              )}

              {/* AUTO BACKUP SWITCHES */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider text-slate-500">
                  Auto Backup Settings
                </h4>

                <div className="space-y-2">
                  <SwitchRow label="Backup Company Settings" checked={switches.backupSettings} onChange={() => handleToggleSwitch("backupSettings")} />
                  <SwitchRow label="Backup Quotations" checked={switches.backupQuotations} onChange={() => handleToggleSwitch("backupQuotations")} />
                  <SwitchRow label="Backup PDFs" checked={switches.backupPdfs} onChange={() => handleToggleSwitch("backupPdfs")} />
                  <SwitchRow label="Backup Drafts" checked={switches.backupDrafts} onChange={() => handleToggleSwitch("backupDrafts")} />
                  <SwitchRow label="Auto Sync" checked={switches.autoSync} onChange={() => handleToggleSwitch("autoSync")} />
                  <SwitchRow label="Sync on Export" checked={switches.syncOnExport} onChange={() => handleToggleSwitch("syncOnExport")} />
                  <SwitchRow label="Sync on Save" checked={switches.syncOnSave} onChange={() => handleToggleSwitch("syncOnSave")} />
                </div>
              </div>
            </>
          )}

          {/* ==================== VIEW 2: RESTORE SCREEN ==================== */}
          {view === "restore" && (
            <div className="space-y-4">
              {isLoadingRemote ? (
                <div className="py-12 text-center space-y-3">
                  <Loader2 size={24} className="animate-spin text-blue-600 mx-auto" />
                  <p className="text-xs font-extrabold text-slate-700">Fetching remote quotations from Google Drive...</p>
                </div>
              ) : remoteQuotes.length === 0 ? (
                <div className="py-12 text-center space-y-2 bg-slate-50 rounded-2xl border border-slate-200/80 p-6">
                  <Cloud size={32} className="text-slate-300 mx-auto" />
                  <h4 className="text-xs font-black text-slate-800">No Remote Quotations Found</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Click "Backup Now" or "Sync Now" to store quotations in Google Drive.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-600">Found {remoteQuotes.length} quotation(s) in Google Drive:</p>
                  {remoteQuotes.map((q) => (
                    <div key={q.fileId} className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 hover:border-blue-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                          {q.quotationNo}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {formatLastSyncStr(q.updatedAt)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400 font-medium text-[10px] block">CLIENT</span>
                          <span className="font-extrabold text-slate-900">{q.clientName}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium text-[10px] block">PROJECT</span>
                          <span className="font-extrabold text-slate-900">{q.projectName}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleRestoreQuotation(q.data)}
                          className="flex-1 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-98 transition-all"
                        >
                          <Download size={14} /> Restore
                        </button>
                        {q.driveUrl && (
                          <a
                            href={q.driveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <FileText size={14} /> PDF
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/** Toggle Switch Component */
function SwitchRow({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80">
      <span className="text-xs font-bold text-slate-800">{label}</span>
      <button
        type="button"
        onClick={onChange}
        className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${checked ? "bg-blue-600" : "bg-slate-300"}`}
      >
        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}
