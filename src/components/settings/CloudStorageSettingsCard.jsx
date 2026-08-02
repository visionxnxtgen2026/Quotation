import React, { useState, useEffect } from "react";
import { Cloud, CheckCircle2, RefreshCw, LogOut, Folder, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import SettingsCard from "../mobile/SettingsCard";
import { googleDriveProvider } from "../../utils/googleDriveProvider";

/**
 * ☁️ CloudStorageSettingsCard Component
 * Securely connects user's personal Google Drive account for backup & sync.
 */
export default function CloudStorageSettingsCard() {
  const [isConnected, setIsConnected] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [lastSync, setLastSync] = useState(null);
  const [autoSync, setAutoSync] = useState(() => localStorage.getItem("gdrive_auto_sync_setting") || "every_save");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const updateStatus = async () => {
    const connected = await googleDriveProvider.isConnected();
    setIsConnected(connected);
    setUserEmail(localStorage.getItem("gdrive_user_email") || "");
    setLastSync(localStorage.getItem("gdrive_last_sync_time") || null);
  };

  useEffect(() => {
    updateStatus();
    window.addEventListener("gdriveStatusUpdated", updateStatus);
    return () => window.removeEventListener("gdriveStatusUpdated", updateStatus);
  }, []);

  const handleConnect = async () => {
    setErrorMsg("");
    setIsSyncing(true);
    setSyncStatusMsg("Connecting to Google Drive...");

    try {
      await googleDriveProvider.authenticate();
      setSyncStatusMsg("✓ Connected to Google Drive");
      setTimeout(() => {
        setIsSyncing(false);
        setSyncStatusMsg("");
      }, 1500);
    } catch (err) {
      console.error("[GoogleDrive Connect Error]:", err);
      setErrorMsg(err.message || "Authentication failed. Please check internet connection.");
      setIsSyncing(false);
      setSyncStatusMsg("");
    }
  };

  const handleSyncNow = async () => {
    if (isSyncing) return;
    setErrorMsg("");
    setIsSyncing(true);

    try {
      await googleDriveProvider.syncNow((msg) => setSyncStatusMsg(msg));
      setLastSync(localStorage.getItem("gdrive_last_sync_time"));
      setTimeout(() => {
        setIsSyncing(false);
        setSyncStatusMsg("");
      }, 1500);
    } catch (err) {
      console.error("[GoogleDrive Sync Error]:", err);
      setErrorMsg(err.message || "Sync failed. Token might be expired.");
      setIsSyncing(false);
      setSyncStatusMsg("");
    }
  };

  const handleDisconnect = async () => {
    if (window.confirm("Are you sure you want to disconnect Google Drive? Local data will be preserved.")) {
      await googleDriveProvider.disconnect();
      setIsConnected(false);
      setUserEmail("");
      setLastSync(null);
    }
  };

  const handleAutoSyncChange = (e) => {
    const val = e.target.value;
    setAutoSync(val);
    localStorage.setItem("gdrive_auto_sync_setting", val);
  };

  const formatTimeAgo = (isoString) => {
    if (!isoString) return "Never";
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      return new Date(isoString).toLocaleDateString();
    } catch {
      return "Recently";
    }
  };

  return (
    <SettingsCard
      title="Cloud Storage"
      subtitle="Securely backup and sync your quotation data with your personal Google Drive."
      icon={<Cloud size={18} />}
      iconBg="bg-blue-50 text-blue-600"
    >
      <div className="space-y-4">
        {/* Main Status Container */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3">

          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0 font-bold">
                <Cloud size={18} />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">Google Drive</h4>
                <p className="text-[10px] text-slate-500 font-medium">Personal Cloud Data Ownership</p>
              </div>
            </div>

            {/* Status Badge */}
            <div className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 ${isConnected
              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
              : "bg-slate-200 text-slate-700 border border-slate-300"
              }`}>
              <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
              <span>{isConnected ? "Connected" : "Not Connected"}</span>
            </div>
          </div>

          {/* Details Box when Connected */}
          {isConnected ? (
            <div className="space-y-2 pt-2 border-t border-slate-200/80 text-xs">
              <div className="flex items-center justify-between text-slate-600 font-medium">
                <span>Connected Account</span>
                <span className="font-extrabold text-slate-900">{userEmail || "Personal Google Account"}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600 font-medium">
                <span className="flex items-center gap-1">
                  <Folder size={13} className="text-blue-600" /> Storage Folder
                </span>
                <span className="font-extrabold text-slate-900 font-mono">VisionX QuoteGen Pro</span>
              </div>

              <div className="flex items-center justify-between text-slate-600 font-medium">
                <span>Last Sync</span>
                <span className="font-bold text-blue-700">{formatTimeAgo(lastSync)}</span>
              </div>

              {/* Auto Sync Preference Selector */}
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700">Auto Sync Mode</label>
                <select
                  value={autoSync}
                  onChange={handleAutoSyncChange}
                  className="bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600"
                >
                  <option value="every_save">Every Save</option>
                  <option value="every_export">Every Export</option>
                  <option value="realtime">Realtime</option>
                  <option value="never">Never (Manual)</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-slate-600 font-medium leading-relaxed">
              <p className="flex items-center gap-1.5 font-bold text-blue-900 mb-0.5">
                <ShieldCheck size={14} className="text-blue-600" /> Zero Backend Data Storage
              </p>
              Your quotations, PDFs, and settings are saved directly inside your personal Google Drive folder. You own 100% of your business data.
            </div>
          )}

          {/* Sync Status Banner */}
          {syncStatusMsg && (
            <div className="p-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
              <Loader2 size={14} className="animate-spin shrink-0" />
              <span>{syncStatusMsg}</span>
            </div>
          )}

          {/* Error Message Banner */}
          {errorMsg && (
            <div className="p-2.5 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle size={15} className="text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            {!isConnected ? (
              <button
                type="button"
                onClick={handleConnect}
                disabled={isSyncing}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 active:scale-98 transition-all cursor-pointer disabled:opacity-70"
              >
                {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <Cloud size={16} />}
                <span>Connect Google Drive</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSyncNow}
                  disabled={isSyncing}
                  className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 active:scale-98 transition-all cursor-pointer disabled:opacity-70"
                >
                  {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={15} />}
                  <span>Sync Now</span>
                </button>

                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={isSyncing}
                  className="px-4 h-12 rounded-xl border border-slate-300 hover:bg-red-50 hover:border-red-200 text-slate-700 hover:text-red-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut size={15} />
                  <span>Disconnect</span>
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </SettingsCard>
  );
}
