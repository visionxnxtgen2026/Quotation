import React, { useState, useEffect } from "react";
import { Cloud, RefreshCw, LogOut, CheckCircle2, AlertCircle, ShieldCheck, User, HardDrive } from "lucide-react";
import { googleDriveProvider } from "../../../utils/googleDriveProvider";

export default function CloudAccountCard({ onToast }) {
  const [isConnected, setIsConnected] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userPicture, setUserPicture] = useState("");
  const [lastSync, setLastSync] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const refreshAccountStatus = async () => {
    const connected = await googleDriveProvider.isConnected();
    setIsConnected(connected);
    setUserEmail(googleDriveProvider.userEmail || localStorage.getItem("gdrive_user_email") || "");
    setUserName(googleDriveProvider.userName || localStorage.getItem("gdrive_user_name") || "");
    setUserPicture(googleDriveProvider.userPicture || localStorage.getItem("gdrive_user_picture") || "");
    setLastSync(googleDriveProvider.lastSync || localStorage.getItem("gdrive_last_sync_time") || null);
  };

  useEffect(() => {
    refreshAccountStatus();
    window.addEventListener("gdriveStatusUpdated", refreshAccountStatus);
    return () => window.removeEventListener("gdriveStatusUpdated", refreshAccountStatus);
  }, []);

  const handleConnect = async () => {
    setIsSyncing(true);
    try {
      await googleDriveProvider.authenticate();
      await refreshAccountStatus();
      if (onToast) onToast("Connected to Google Drive!", "success");
    } catch (err) {
      console.error("Connect error:", err);
      if (onToast) onToast(err.message || "Failed to connect Google Drive", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncNow = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await googleDriveProvider.syncNow();
      await refreshAccountStatus();
      if (onToast) onToast("Cloud sync completed successfully!", "success");
    } catch (err) {
      if (onToast) onToast("Sync failed. Check internet connection.", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (window.confirm("Are you sure you want to disconnect Google Drive? Your local quotation data will remain safe.")) {
      await googleDriveProvider.disconnect();
      await refreshAccountStatus();
      if (onToast) onToast("Google Drive disconnected.", "success");
    }
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
    <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
      {/* Top Title Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 font-bold">
            <Cloud size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">Google Drive</h3>
            <p className="text-xs text-slate-500 font-medium">Personal Cloud Account Storage</p>
          </div>
        </div>

        {/* Connection Status Badge */}
        <div className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 ${
          isConnected
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-slate-100 text-slate-600 border border-slate-200"
        }`}>
          <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
          <span>{isConnected ? "Connected" : "Disconnected"}</span>
        </div>
      </div>

      {/* Connected User Profile Info */}
      {isConnected ? (
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
          <div className="flex items-center gap-3.5">
            {userPicture ? (
              <img src={userPicture} alt="Profile" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-black text-base flex items-center justify-center border-2 border-white shadow-xs shrink-0">
                {userEmail ? userEmail.charAt(0).toUpperCase() : <User size={20} />}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Connected Account</span>
              <p className="text-sm font-black text-slate-900 truncate">{userName || "Google User"}</p>
              <p className="text-xs font-bold text-blue-600 truncate">{userEmail || "Connected"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/70 text-xs">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Storage Folder</span>
              <span className="font-bold text-slate-800 mt-0.5 truncate">VisionX QuoteGen Pro</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Last Sync</span>
              <span className="font-bold text-blue-700 mt-0.5">{formatTimeAgo(lastSync)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50/70 rounded-2xl p-4 border border-blue-100 text-xs text-slate-600 leading-relaxed font-medium">
          <p className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-blue-600" /> Private Enterprise Cloud Sync
          </p>
          Connect your personal Google Drive account to store your quotations, PDFs, templates, and company settings securely in your own cloud space.
        </div>
      )}

      {/* Buttons Bar */}
      <div className="flex flex-wrap gap-2 pt-1">
        {isConnected ? (
          <>
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-98 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
              <span>{isSyncing ? "Syncing..." : "Sync Now"}</span>
            </button>

            <button
              onClick={handleConnect}
              disabled={isSyncing}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Reconnect
            </button>

            <button
              onClick={handleDisconnect}
              disabled={isSyncing}
              className="px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <LogOut size={14} />
              <span>Disconnect</span>
            </button>
          </>
        ) : (
          <button
            onClick={handleConnect}
            disabled={isSyncing}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-black transition-all shadow-lg shadow-blue-600/20 active:scale-98 cursor-pointer disabled:opacity-60"
          >
            <Cloud size={18} />
            <span>{isSyncing ? "Connecting..." : "Connect Google Drive"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
