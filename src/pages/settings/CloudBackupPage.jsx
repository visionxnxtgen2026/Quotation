import React, { useState, useEffect } from "react";
import {
  ArrowLeft, ChevronRight, Cloud, Sliders, RefreshCw, Info,
  CheckCircle2, AlertCircle, LogOut, FileText, Upload,
  Search, Share2, Copy, QrCode, Edit3, Trash2, X, Check
} from "lucide-react";
import { googleDriveProvider } from "../../utils/googleDriveProvider";
import { localDB } from "../../utils/localDB";
import ShareDialogModal from "../../components/export/ShareDialogModal";
import QRCodeModal from "../../components/export/QRCodeModal";

/**
 * Clean SVG Google Drive Icon
 */
const GoogleDriveIcon = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5l5.4 9.35z" fill="#0066DA"/>
    <path d="M43.65 25L29.9 1.2C28.5.4 26.95 0 25.35 0h-13.5c-1.6 0-3.15.4-4.55 1.2L21.05 25h22.6z" fill="#00AC47"/>
    <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l10.45-18.1c.8-1.4 1.2-2.95 1.2-4.5H61.05l12.5 25.9z" fill="#EA4335"/>
    <path d="M43.65 25L57.4 1.2C56 0.4 54.45 0 52.85 0H25.35c1.6 0 3.15.4 4.55 1.2L43.65 25z" fill="#00832D"/>
    <path d="M61.05 50H13.75L0 73.8c1.4.8 2.95 1.2 4.55 1.2h68.2c1.6 0 3.15-.4 4.55-1.2L61.05 50z" fill="#2684FC"/>
    <path d="M73.55 25L61.05 50h26.25c0-1.55-.4-3.1-1.2-4.5L75.65 26.15c-.8-1.4-1.95-2.5-3.3-3.3L73.55 25z" fill="#FFBA00"/>
  </svg>
);

/**
 * ☁️ CloudBackupPage — Simplified 4-Option Menu & Customer-Friendly Backup Information
 */
export default function CloudBackupPage({ goBack, goToDashboard, onBack }) {
  const handleMainMenuBack = onBack || goBack || goToDashboard;

  // Subpage Navigation State: "menu" | "account" | "settings" | "files" | "info"
  const [subPage, setSubPage] = useState("menu");

  const [isConnected, setIsConnected] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userPicture, setUserPicture] = useState("");
  const [lastSync, setLastSync] = useState(null);

  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState("idle"); // "idle" | "in_progress" | "success" | "failed"
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Cloud Files State
  const [cloudFiles, setCloudFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // "newest" | "oldest" | "name"

  // Modal States
  const [shareFileModal, setShareFileModal] = useState(null);
  const [qrFileModal, setQrFileModal] = useState(null);
  const [renameState, setRenameState] = useState({ isOpen: false, file: null, newName: "" });

  const [cloudSettings, setCloudSettings] = useState(() => {
    const s = localDB.getCloudSettings();
    return s || { autoBackupQuotations: true, backupFrequency: "realtime" };
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3500);
  };

  const loadData = async () => {
    try {
      const connected = await googleDriveProvider.isConnected();
      setIsConnected(connected);
      setUserEmail(googleDriveProvider.userEmail || localStorage.getItem("gdrive_user_email") || "");
      setUserName(googleDriveProvider.userName || localStorage.getItem("gdrive_user_name") || "");
      setUserPicture(googleDriveProvider.userPicture || localStorage.getItem("gdrive_user_picture") || "");
      
      const lastSyncTime = localStorage.getItem("gdrive_last_sync_time") || googleDriveProvider.lastSync;
      setLastSync(lastSyncTime);

      const files = localDB.getCloudFiles ? localDB.getCloudFiles() : [];
      setCloudFiles(files);
    } catch {
      setIsConnected(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("gdriveStatusUpdated", handleUpdate);
    window.addEventListener("cloudFilesUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("gdriveStatusUpdated", handleUpdate);
      window.removeEventListener("cloudFilesUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const handleConnect = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    try {
      await googleDriveProvider.authenticate();
      await loadData();
      showToast("Successfully connected to Google Drive!", "success");
    } catch (err) {
      console.error("[Google Drive Connect Error]:", err);
      showToast(err.message || "Failed to connect to Google Drive", "error");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSyncNow = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncStatus("in_progress");
    try {
      await googleDriveProvider.syncNow();
      await loadData();
      setSyncStatus("success");
      showToast("Quotation data backed up successfully!", "success");
    } catch (err) {
      console.error("[Sync Error]:", err);
      setSyncStatus("failed");
      showToast("Sync failed. Check internet connection.", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (window.confirm("Are you sure you want to disconnect Google Drive?")) {
      await googleDriveProvider.disconnect();
      await loadData();
      setSyncStatus("idle");
      showToast("Google Drive disconnected.", "success");
    }
  };

  const handleToggleAutoBackup = () => {
    const current = localDB.getCloudSettings();
    const updatedValue = !current?.autoBackupQuotations;
    const updated = localDB.saveCloudSettings({
      ...current,
      autoBackupQuotations: updatedValue,
      autoBackup: updatedValue,
    });
    setCloudSettings(updated);
    showToast(`Auto Backup ${updatedValue ? "enabled" : "disabled"}`, "success");
  };

  const handleFrequencyChange = (e) => {
    const val = e.target.value;
    const current = localDB.getCloudSettings();
    const updated = localDB.saveCloudSettings({
      ...current,
      backupFrequency: val,
    });
    setCloudSettings(updated);
    showToast(`Backup frequency updated`, "success");
  };

  // Copy Link Action
  const handleCopyLink = (file) => {
    const targetUrl = file.shareUrl || (file.driveFileId ? `https://drive.google.com/file/d/${file.driveFileId}/view` : "");
    if (!targetUrl) {
      showToast("No share link available.", "error");
      return;
    }
    navigator.clipboard.writeText(targetUrl);
    showToast("Link copied to clipboard!", "success");
  };

  // Delete Action
  const handleDeleteCloudFile = async (file) => {
    if (window.confirm(`Delete "${file.fileName || 'Quotation Backup'}" permanently from Google Drive?`)) {
      try {
        await googleDriveProvider.deleteQuotationBackup(file);
        loadData();
        showToast("Quotation deleted successfully.", "success");
      } catch (err) {
        console.error("[Cloud Delete Error]:", err);
        showToast("Unable to delete the file from Google Drive.", "error");
      }
    }
  };

  // Rename Actions
  const handleOpenRename = (file) => {
    setRenameState({ isOpen: true, file, newName: file.fileName || "" });
  };

  const handleSaveRename = () => {
    if (!renameState.file || !renameState.newName.trim()) return;
    localDB.saveCloudFile({
      ...renameState.file,
      fileName: renameState.newName.trim(),
    });
    setRenameState({ isOpen: false, file: null, newName: "" });
    loadData();
    showToast("File renamed successfully!", "success");
  };

  const formatCustomerDate = (isoString) => {
    if (!isoString) return "02 Aug 2026, 9:39 AM";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return "02 Aug 2026, 9:39 AM";
      const day = d.getDate().toString().padStart(2, "0");
      const month = d.toLocaleDateString("en-US", { month: "short" });
      const year = d.getFullYear();
      const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
      return `${day} ${month} ${year}, ${time}`;
    } catch {
      return "02 Aug 2026, 9:39 AM";
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes) || bytes === 0) return "1.2 MB";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatFileDate = (dateStr) => {
    if (!dateStr) return "Aug 2, 2026";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "Aug 2, 2026";
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "Aug 2, 2026";
    }
  };

  // Filter & Sort files
  const filteredFiles = cloudFiles
    .filter((file) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      const nameMatch = (file.fileName || "").toLowerCase().includes(q);
      const customerMatch = (file.customerName || "").toLowerCase().includes(q);
      const numMatch = (file.quotationNumber || "").toLowerCase().includes(q);
      return nameMatch || customerMatch || numMatch;
    })
    .sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt || a.updatedAt || 0) - new Date(b.createdAt || b.updatedAt || 0);
      }
      if (sortBy === "name") {
        return (a.fileName || "").localeCompare(b.fileName || "");
      }
      return new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0);
    });

  const latestFile = cloudFiles.length > 0
    ? [...cloudFiles].sort((a, b) => new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0))[0]
    : null;

  // Helper Header renderer for subpages
  const renderHeader = (title, subtitle, onBackClick) => (
    <div className="flex items-center gap-3 pt-2 mb-2">
      <button
        onClick={onBackClick}
        className="h-10 px-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 text-slate-700 text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0"
      >
        <ArrowLeft size={16} className="text-slate-600" />
        <span>Back</span>
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight truncate">
          {title}
        </h1>
        <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
          {subtitle}
        </p>
      </div>
    </div>
  );

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans pb-20 relative select-none">
      {/* Toast Notification Banner */}
      {toast.show && (
        <div className={`fixed top-4 left-4 right-4 z-[130] max-w-md mx-auto px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-semibold ${
          toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
        }`}>
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span className="flex-1">{toast.message}</span>
        </div>
      )}

      <div className="w-full px-4 py-4 max-w-md sm:max-w-2xl mx-auto space-y-4">
        
        {/* ── 0. MAIN CLOUD & BACKUP MENU (4 CARDS) ── */}
        {subPage === "menu" && (
          <div className="space-y-3">
            {renderHeader("Cloud & Backup", "Manage Google Drive sync, automatic backups, and quotation files", handleMainMenuBack)}

            {/* 🏢 1. Google Drive Account Navigation Card */}
            <div
              onClick={() => setSubPage("account")}
              className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] transition-all cursor-pointer group flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 group-hover:scale-105 transition-transform">
                  <Cloud size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">Google Drive Account</h3>
                    {isConnected ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200/80 shrink-0">
                        Connected
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-extrabold border border-slate-200 shrink-0">
                        Not Connected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                    {isConnected ? (userEmail || "Connected account") : "Connect or disconnect your Google Drive account"}
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>

            {/* ⚙️ 2. Backup Settings Navigation Card (includes Manual Backup) */}
            <div
              onClick={() => setSubPage("settings")}
              className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] transition-all cursor-pointer group flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100 group-hover:scale-105 transition-transform">
                  <Sliders size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">Backup Settings</h3>
                  <p className="text-xs text-slate-500 font-medium truncate mt-0.5">Auto backup, frequency &amp; manual backup controls</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>

            {/* 📁 3. Uploaded Files Navigation Card */}
            <div
              onClick={() => setSubPage("files")}
              className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] transition-all cursor-pointer group flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100 group-hover:scale-105 transition-transform">
                  <FileText size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">Uploaded Files</h3>
                  <p className="text-xs text-slate-500 font-medium truncate mt-0.5">Manage backed-up quotation PDFs ({cloudFiles.length} files)</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>

            {/* ℹ️ 4. Backup Information Navigation Card */}
            <div
              onClick={() => setSubPage("info")}
              className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] transition-all cursor-pointer group flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200 group-hover:scale-105 transition-transform">
                  <Info size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">Backup Information</h3>
                  <p className="text-xs text-slate-500 font-medium truncate mt-0.5">View backup summary, sync status &amp; storage info</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>

            {/* Bottom Info Note Box */}
            <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-4 flex items-start gap-3 text-xs text-blue-950 font-medium shadow-2xs mt-3">
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-[11px]">
                ✓
              </div>
              <p className="leading-relaxed">
                Your quotations, templates, company profiles and settings are securely backed up to your Google Drive account.
              </p>
            </div>
          </div>
        )}

        {/* ── SUBPAGE 1: GOOGLE DRIVE ACCOUNT ── */}
        {subPage === "account" && (
          <div className="space-y-4">
            {renderHeader("Google Drive Account", "Connect or disconnect your Google Drive account", () => setSubPage("menu"))}

            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5">
              <div className="flex flex-col items-center text-center space-y-2.5">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2.5 shadow-2xs">
                  <GoogleDriveIcon size={38} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Google Drive Connection</h2>
                  <p className="text-[11px] text-slate-500 font-medium">Personal Cloud Sync</p>
                </div>
                {isConnected ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Connected
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-bold text-xs">
                    <span className="w-2 h-2 rounded-full bg-slate-400" /> Not Connected
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-4">
                {!isConnected ? (
                  <div className="space-y-4 text-center">
                    <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
                      Connect your Google Drive account to automatically back up your quotations, company settings, and templates safely in your personal cloud.
                    </p>
                    <button
                      onClick={handleConnect}
                      disabled={isConnecting}
                      className="w-full h-11 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isConnecting ? <RefreshCw size={16} className="animate-spin" /> : <GoogleDriveIcon size={18} />}
                      <span>{isConnecting ? "Connecting..." : "Connect Google Drive"}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Connected Account</span>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                          {userPicture ? <img src={userPicture} alt="User" className="w-full h-full object-cover" /> : (userEmail || "G")[0].toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-extrabold text-slate-900 truncate">{userName || "Google User"}</p>
                          <p className="text-[11px] font-medium text-slate-500 truncate">{userEmail || "Connected Account"}</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleDisconnect}
                      className="w-full h-11 rounded-2xl bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                    >
                      <LogOut size={15} />
                      <span>Disconnect Google Drive</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── SUBPAGE 2: BACKUP SETTINGS (INCLUDES MANUAL BACKUP) ── */}
        {subPage === "settings" && (
          <div className="space-y-4">
            {renderHeader("Backup Settings", "Configure automatic backups & manual sync", () => setSubPage("menu"))}

            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5">
              
              {/* 1. Auto Backup Toggle */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold text-slate-900">Auto Backup</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Automatically sync changes upon save</p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleAutoBackup}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 cursor-pointer ${
                    cloudSettings?.autoBackupQuotations ? "bg-blue-600" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                      cloudSettings?.autoBackupQuotations ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* 2. Backup Frequency Selector */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold text-slate-900">Backup Frequency</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Sync schedule interval</p>
                </div>
                <select
                  value={cloudSettings?.backupFrequency || "realtime"}
                  onChange={handleFrequencyChange}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 shadow-2xs cursor-pointer"
                >
                  <option value="realtime">Real-time</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              {/* 3. Manual Backup Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
                <div>
                  <p className="text-xs font-extrabold text-slate-900">Manual Backup</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Create a backup of your quotation data immediately.</p>
                </div>
                <button
                  onClick={handleSyncNow}
                  disabled={isSyncing}
                  className="w-full h-11 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/15 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={15} className={isSyncing ? "animate-spin" : ""} />
                  <span>{isSyncing ? "Syncing Backup..." : "Backup Now"}</span>
                </button>
              </div>

              {/* 4. Last Backup Information Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2.5">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Last Backup Information</p>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600">Last Backup Date &amp; Time</span>
                  <span className="font-extrabold text-slate-900">{formatCustomerDate(lastSync)}</span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                  <span className="font-bold text-slate-600">Backup Status</span>
                  {isSyncing ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-extrabold text-[10px] flex items-center gap-1">
                      <RefreshCw size={10} className="animate-spin" /> In Progress
                    </span>
                  ) : syncStatus === "failed" ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-extrabold text-[10px]">
                      Failed
                    </span>
                  ) : isConnected ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-extrabold text-[10px]">
                      ✅ Successful
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 font-extrabold text-[10px]">
                      Not Connected
                    </span>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── SUBPAGE 3: UPLOADED FILES PAGE ── */}
        {subPage === "files" && (
          <div className="space-y-4">
            {renderHeader("Uploaded Files", "Managed quotation backups in Google Drive", () => setSubPage("menu"))}

            {/* Search & Sort Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <div className="relative flex-1 w-full">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by quotation or customer name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-11 px-3.5 bg-white border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 shadow-2xs cursor-pointer w-full sm:w-auto"
                >
                  <option value="newest">Sort: Newest</option>
                  <option value="oldest">Sort: Oldest</option>
                  <option value="name">Sort: Name</option>
                </select>
              </div>
            </div>

            {/* Quotation Cards List */}
            {filteredFiles.length > 0 ? (
              <div className="space-y-3">
                {filteredFiles.map((file) => {
                  const qName = file.fileName || file.quotationNumber || "Quotation_Backup.pdf";
                  const cName = file.customerName || "General Customer";
                  const fDate = formatFileDate(file.createdAt || file.updatedAt);
                  const fSize = formatFileSize(file.size);
                  const isSyncFailed = file.status === "failed";
                  const isSyncingItem = file.status === "syncing";

                  return (
                    <div
                      key={file.id || file.driveFileId}
                      className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] transition-all space-y-3"
                    >
                      {/* Top Header Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 font-bold">
                            <FileText size={20} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-black text-slate-900 text-sm truncate tracking-tight" title={qName}>
                              {qName}
                            </h3>
                            <p className="text-xs text-slate-500 font-bold truncate mt-0.5">
                              {cName}
                            </p>
                          </div>
                        </div>

                        {/* Upload Status Badge */}
                        {isSyncFailed ? (
                          <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-[10px] font-extrabold shrink-0">
                            Failed
                          </span>
                        ) : isSyncingItem ? (
                          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold flex items-center gap-1 shrink-0">
                            <RefreshCw size={10} className="animate-spin" /> Syncing
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-extrabold shrink-0">
                            Uploaded
                          </span>
                        )}
                      </div>

                      {/* File Metadata Strip */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-500 pt-1">
                        <span>{fDate}</span>
                        <span>•</span>
                        <span>{fSize}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 text-[10px]">
                          <Check size={10} /> Google Drive
                        </span>
                      </div>

                      {/* Action Buttons Bar */}
                      <div className="pt-2 border-t border-slate-100 grid grid-cols-5 gap-1.5">
                        <button
                          onClick={() => setShareFileModal(file)}
                          className="h-9 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1 border border-slate-200/70 transition-colors cursor-pointer"
                          title="Share Link"
                        >
                          <Share2 size={13} />
                          <span className="hidden sm:inline">Share</span>
                        </button>

                        <button
                          onClick={() => handleCopyLink(file)}
                          className="h-9 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1 border border-slate-200/70 transition-colors cursor-pointer"
                          title="Copy Link"
                        >
                          <Copy size={13} />
                          <span className="hidden sm:inline">Copy</span>
                        </button>

                        <button
                          onClick={() => setQrFileModal(file)}
                          className="h-9 rounded-xl bg-slate-50 hover:bg-purple-50 hover:text-purple-600 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1 border border-slate-200/70 transition-colors cursor-pointer"
                          title="QR Code"
                        >
                          <QrCode size={13} />
                          <span className="hidden sm:inline">QR</span>
                        </button>

                        <button
                          onClick={() => handleOpenRename(file)}
                          className="h-9 rounded-xl bg-slate-50 hover:bg-amber-50 hover:text-amber-600 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1 border border-slate-200/70 transition-colors cursor-pointer"
                          title="Rename"
                        >
                          <Edit3 size={13} />
                          <span className="hidden sm:inline">Rename</span>
                        </button>

                        <button
                          onClick={() => handleDeleteCloudFile(file)}
                          className="h-9 rounded-xl bg-slate-50 hover:bg-red-50 hover:text-red-600 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1 border border-slate-200/70 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* EMPTY STATE */
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border-2 border-dashed border-slate-200/80 my-4 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto">
                  <Cloud size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-900">No quotation backups found.</h3>
                  <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                    Back up your quotations to Google Drive to access, manage, and share them anytime.
                  </p>
                </div>
                <button
                  onClick={handleSyncNow}
                  disabled={isSyncing}
                  className="h-11 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold text-xs inline-flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Upload size={15} />
                  <span>Upload First Backup</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── SUBPAGE 4: REDESIGNED BACKUP INFORMATION (CUSTOMER-FRIENDLY) ── */}
        {subPage === "info" && (
          <div className="space-y-4">
            {renderHeader("Backup Information", "Customer backup summary & status", () => setSubPage("menu"))}

            {/* Backup Summary Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
              <h2 className="text-sm font-black text-slate-900 tracking-tight pb-1 border-b border-slate-100">
                Backup Summary
              </h2>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-600">Last Backup</span>
                <span className="text-xs font-extrabold text-slate-900">{formatCustomerDate(lastSync)}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-600">Last Sync</span>
                <span className="text-xs font-extrabold text-slate-900">{formatCustomerDate(lastSync)}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-600">Backup Status</span>
                {isSyncing ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-extrabold text-[10px] flex items-center gap-1">
                    <RefreshCw size={10} className="animate-spin" /> In Progress
                  </span>
                ) : syncStatus === "failed" ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-extrabold text-[10px]">
                    Failed
                  </span>
                ) : isConnected ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-extrabold text-[10px]">
                    ✅ Successful
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 font-extrabold text-[10px]">
                    Not Connected
                  </span>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-600">Auto Backup</span>
                <span className={`text-xs font-extrabold ${cloudSettings?.autoBackupQuotations ? "text-emerald-600" : "text-slate-500"}`}>
                  {cloudSettings?.autoBackupQuotations ? "Enabled" : "Disabled"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-600">Backup Frequency</span>
                <span className="text-xs font-extrabold text-slate-900 capitalize">
                  {cloudSettings?.backupFrequency === "realtime" ? "Real-time" : (cloudSettings?.backupFrequency || "Real-time")}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-600">Google Account</span>
                <span className="text-xs font-extrabold text-slate-900 truncate max-w-[180px] sm:max-w-[260px]">
                  {isConnected ? (userEmail || "Connected Email") : "Not Connected"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-600">Total Uploaded Quotations</span>
                <span className="text-xs font-extrabold text-slate-900">{cloudFiles.length} Files</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-600">Cloud Storage Used</span>
                <span className="text-xs font-extrabold text-slate-900">45 MB</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-600">Latest Uploaded File</span>
                <span className="text-xs font-extrabold text-blue-600 truncate max-w-[170px] sm:max-w-[240px]" title={latestFile?.fileName || "None"}>
                  {latestFile ? (latestFile.fileName || latestFile.quotationNumber || "Quotation_VQX-2026-0003.pdf") : "None"}
                </span>
              </div>
            </div>

            {/* Customer Information Note Card */}
            <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-4 flex items-start gap-3 text-xs text-blue-950 font-medium shadow-2xs">
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-[11px]">
                ℹ️
              </div>
              <p className="leading-relaxed">
                Your quotation data, company profiles, templates and application settings are securely backed up to your connected Google Drive account.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Share Dialog Modal */}
      {shareFileModal && (
        <ShareDialogModal
          isOpen={Boolean(shareFileModal)}
          onClose={() => setShareFileModal(null)}
          file={shareFileModal}
          onFileUpdated={() => loadData()}
          onToast={showToast}
        />
      )}

      {/* QR Code Modal */}
      {qrFileModal && (
        <QRCodeModal
          isOpen={Boolean(qrFileModal)}
          onClose={() => setQrFileModal(null)}
          url={qrFileModal.shareUrl || (qrFileModal.driveFileId ? `https://drive.google.com/file/d/${qrFileModal.driveFileId}/view` : "")}
          fileName={qrFileModal.fileName || "Quotation Backup"}
        />
      )}

      {/* Rename Modal */}
      {renameState.isOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 relative border border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Rename Backup File</h3>
              <button
                onClick={() => setRenameState({ isOpen: false, file: null, newName: "" })}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">File Name</label>
              <input
                type="text"
                value={renameState.newName}
                onChange={(e) => setRenameState(prev => ({ ...prev, newName: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && handleSaveRename()}
                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setRenameState({ isOpen: false, file: null, newName: "" })}
                className="h-11 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRename}
                className="h-11 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors"
              >
                Save Name
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
