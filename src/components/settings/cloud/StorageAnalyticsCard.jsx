import React, { useState, useEffect } from "react";
import { PieChart, HardDrive, ShieldCheck, Check, Settings2, FileText, Lock, Globe } from "lucide-react";
import { localDB } from "../../../utils/localDB";

export default function StorageAnalyticsCard({ onToast }) {
  const [cloudFiles, setCloudFiles] = useState([]);
  const [settings, setSettings] = useState(() => localDB.getCloudSettings());

  const refreshAnalytics = () => {
    setCloudFiles(localDB.getActiveCloudFiles());
    setSettings(localDB.getCloudSettings());
  };

  useEffect(() => {
    refreshAnalytics();
    window.addEventListener("cloudFilesUpdated", refreshAnalytics);
    window.addEventListener("cloudSettingsUpdated", refreshAnalytics);
    return () => {
      window.removeEventListener("cloudFilesUpdated", refreshAnalytics);
      window.removeEventListener("cloudSettingsUpdated", refreshAnalytics);
    };
  }, []);

  const totalFiles = cloudFiles.length;
  const pdfCount = cloudFiles.filter((f) => f.fileName?.endsWith(".pdf")).length;
  const publicCount = cloudFiles.filter((f) => f.visibility === "public").length;
  const privateCount = cloudFiles.filter((f) => f.visibility === "private").length;

  const usedBytes = cloudFiles.reduce((acc, f) => acc + (f.size || 0), 0);
  const usedMB = (usedBytes / (1024 * 1024)).toFixed(2);
  const driveQuotaGB = 15; // Standard free Google Drive tier
  const remainingGB = (driveQuotaGB - (usedBytes / (1024 * 1024 * 1024))).toFixed(2);
  const usedPct = Math.min(100, Math.max(0.5, ((usedBytes / (driveQuotaGB * 1024 * 1024 * 1024)) * 100).toFixed(2)));

  const handleToggleAdvanced = (key) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    localDB.saveCloudSettings(updated);
    if (onToast) onToast("Advanced setting updated.", "success");
  };

  const advancedOptions = [
    { key: "autoGenerateShareLink", label: "Generate Share Link Automatically", desc: "Create Google Drive view link upon upload" },
    { key: "copyLinkAfterUpload", label: "Copy Link After Upload", desc: "Auto-copy share link to clipboard on export" },
    { key: "uploadOriginalPdf", label: "Upload Original PDF", desc: "Keep high-resolution vector PDF in cloud" },
    { key: "compressBeforeUpload", label: "Compress Before Upload", desc: "Optimize file size before sending to cloud" },
    { key: "deleteLocalAfterUpload", label: "Delete Local Copy After Upload", desc: "Clear local storage cache after cloud backup" },
    { key: "encryptMetadata", label: "Encrypt Backup Metadata", desc: "Encrypt JSON backups before saving to Drive" },
    { key: "keepPreviousVersions", label: "Keep Previous Versions", desc: "Retain version history of modified files" },
    { key: "offlineCache", label: "Offline Cache Guarantee", desc: "Keep IndexedDB fallback active when offline" },
  ];

  return (
    <div className="space-y-4">
      {/* 1. STORAGE ANALYTICS DASHBOARD CARD */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100 font-bold">
              <PieChart size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">Storage Analytics</h3>
              <p className="text-xs text-slate-500 font-medium">Google Drive quota and local database usage</p>
            </div>
          </div>
        </div>

        {/* Quota Progress Bar */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-black">
            <span className="text-slate-900">Google Drive Quota Used</span>
            <span className="text-sky-600">{usedMB} MB / {driveQuotaGB} GB ({usedPct}%)</span>
          </div>

          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full transition-all duration-500"
              style={{ width: `${usedPct}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 font-bold">
            <span>0 GB</span>
            <span>Approx. {remainingGB} GB Remaining Free Space</span>
            <span>15 GB</span>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Files</span>
            <span className="text-xl font-black text-slate-900 mt-1">{totalFiles} Items</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total PDFs</span>
            <span className="text-xl font-black text-blue-600 mt-1">{pdfCount} Documents</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Storage Used</span>
            <span className="text-xl font-black text-emerald-600 mt-1">{usedMB} MB</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Remaining Free</span>
            <span className="text-xl font-black text-sky-600 mt-1">{remainingGB} GB</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
              <Globe size={11} className="text-emerald-600" /> Public Files
            </span>
            <span className="text-xl font-black text-emerald-600 mt-1">{publicCount} Files</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
              <Lock size={11} className="text-amber-600" /> Private Files
            </span>
            <span className="text-xl font-black text-amber-600 mt-1">{privateCount} Files</span>
          </div>
        </div>
      </div>

      {/* 2. ADVANCED SETTINGS */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100 font-bold">
            <Settings2 size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">Advanced Cloud Options</h3>
            <p className="text-xs text-slate-500 font-medium">Fine-tune backup algorithms and link behavior</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {advancedOptions.map(({ key, label, desc }) => {
            const isChecked = Boolean(settings[key]);
            return (
              <div
                key={key}
                onClick={() => handleToggleAdvanced(key)}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  isChecked
                    ? "bg-purple-50/50 border-purple-200"
                    : "bg-slate-50 border-slate-200/80 hover:bg-slate-100/60"
                }`}
              >
                <div className="min-w-0 flex-1 pr-2">
                  <p className={`text-xs font-bold ${isChecked ? "text-purple-950" : "text-slate-800"}`}>{label}</p>
                  <p className="text-[10px] text-slate-500 font-medium truncate">{desc}</p>
                </div>

                <div
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                    isChecked ? "bg-purple-600" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                      isChecked ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
