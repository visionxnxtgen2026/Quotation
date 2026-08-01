import React, { useState, useEffect } from "react";
import { Cloud, Loader2 } from "lucide-react";
import { googleDriveProvider } from "../../utils/googleDriveProvider";

/**
 * ☁️ CloudSyncButton Component
 * 42px rounded circular button for the Dashboard Header with status indicator badge,
 * ripple effect, soft shadow, white background, and blue cloud icon.
 */
export default function CloudSyncButton({ onClick }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const checkStatus = async () => {
    const connected = await googleDriveProvider.isConnected();
    setIsConnected(connected);
  };

  useEffect(() => {
    checkStatus();
    window.addEventListener("gdriveStatusUpdated", checkStatus);
    return () => window.removeEventListener("gdriveStatusUpdated", checkStatus);
  }, []);

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative w-[42px] h-[42px] rounded-full bg-white hover:bg-slate-50 text-blue-600 border border-slate-200/90 shadow-md shadow-slate-200/60 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 group focus:outline-none"
      title={isConnected ? "Cloud Sync (Connected)" : "Cloud Storage (Not Connected)"}
      aria-label="Cloud Sync"
    >
      <Cloud size={20} className="text-blue-600 group-hover:scale-110 transition-transform" />

      {/* Connection Status Badge Dot */}
      <span className={`absolute top-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-white ${
        isConnected ? "bg-emerald-500 shadow-2xs animate-pulse" : "bg-slate-300"
      }`} />
    </button>
  );
}
