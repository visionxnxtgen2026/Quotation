import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Cloud,
  ArrowRight,
  Clock
} from "lucide-react";
import { localDB } from "../../utils/localDB";
import { googleDriveProvider } from "../../utils/googleDriveProvider";
import { admobManager } from "../../utils/admobManager";
import GoogleDriveConnectModal from "../../components/cloud/GoogleDriveConnectModal";

export default function Dashboard({
  goToCreate,
  goToStorage,
  goToSettings,
  goToCloud,
  setQuotationId,
}) {
  const [activeCompany, setActiveCompany] = useState(null);
  const [stats, setStats] = useState({
    totalQuotes: 0,
    totalCompanies: 0,
    lastBackup: "Never",
  });
  const [greeting, setGreeting] = useState("Good Evening");
  const [isDriveConnected, setIsDriveConnected] = useState(false);
  const [cloudFilesCount, setCloudFilesCount] = useState(0);
  const [lastSyncTimeRaw, setLastSyncTimeRaw] = useState(null);
  const [showConnectModal, setShowConnectModal] = useState(false);

  const formatCompactSync = (isoString) => {
    if (!isoString) return "2 Aug 2026 • 9:39 AM";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return "2 Aug 2026 • 9:39 AM";
      const day = d.getDate();
      const month = d.toLocaleDateString("en-US", { month: "short" });
      const year = d.getFullYear();
      const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
      return `${day} ${month} ${year} • ${time}`;
    } catch {
      return "2 Aug 2026 • 9:39 AM";
    }
  };

  const loadData = async () => {
    const company = localDB.getActiveCompanyProfile();
    setActiveCompany(company);

    const quotations = localDB.getQuotations();
    const companies = localDB.getCompanyProfiles();
    const cloudFiles = localDB.getCloudFiles ? localDB.getCloudFiles() : [];

    const lastSyncTime = localStorage.getItem("gdrive_last_sync_time") || googleDriveProvider.lastSync;
    setLastSyncTimeRaw(lastSyncTime);

    setStats({
      totalQuotes: quotations.length,
      totalCompanies: companies.length,
      lastBackup: lastSyncTime
        ? new Date(lastSyncTime).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
        : "Never",
    });

    const connected = await googleDriveProvider.isConnected();
    setIsDriveConnected(connected);
    setCloudFilesCount(cloudFiles.length);
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    loadData();
    window.addEventListener("quotationDataUpdated", loadData);
    window.addEventListener("gdriveStatusUpdated", loadData);
    window.addEventListener("cloudFilesUpdated", loadData);
    window.addEventListener("storage", loadData);

    return () => {
      window.removeEventListener("quotationDataUpdated", loadData);
      window.removeEventListener("gdriveStatusUpdated", loadData);
      window.removeEventListener("cloudFilesUpdated", loadData);
      window.removeEventListener("storage", loadData);
    };
  }, []);

  const handleNewQuote = () => {
    admobManager.showInterstitial("Create Quotation");
    if (setQuotationId) setQuotationId(null);
    sessionStorage.removeItem("company_dialog_shown");
    localStorage.removeItem("previewDraft");
    goToCreate(1);
  };

  const handleCloudClick = async () => {
    const connected = await googleDriveProvider.isConnected();
    if (!connected) {
      setShowConnectModal(true);
    } else {
      if (goToCloud) goToCloud();
      else if (goToSettings) goToSettings();
    }
  };

  const companyLogo = activeCompany?.companyLogo || activeCompany?.logo || activeCompany?.logoUrl || activeCompany?.logoPath;
  const companyName = activeCompany?.companyName || "My Company";
  const companyTagline = activeCompany?.companyTagline || activeCompany?.workspaceType || activeCompany?.tagline || "Enterprise Workspace";

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans pb-32 select-none">
      <GoogleDriveConnectModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onSuccess={() => {
          loadData();
          if (goToCloud) goToCloud();
        }}
      />

      {/* ── 1. DASHBOARD HEADER ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs print:hidden pt-[env(safe-area-inset-top,0px)]">
        <div className="flex items-center justify-between h-14 px-4 w-full max-w-full overflow-hidden">
          
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {companyLogo ? (
              <div className="w-[40px] h-[40px] rounded-xl bg-white border border-slate-200/80 p-0.5 overflow-hidden shrink-0 shadow-xs">
                <img src={companyLogo} alt={companyName} className="w-full h-full object-cover rounded-[10px]" />
              </div>
            ) : (
              <div className="w-[40px] h-[40px] rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-sm flex items-center justify-center shrink-0 border border-blue-200/80 shadow-xs">
                {companyName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1 overflow-hidden">
              <h1 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight break-words line-clamp-2 leading-snug" title={companyName}>
                {companyName}
              </h1>
              <p className="text-[10px] font-semibold text-slate-500 truncate mt-0.5">
                {companyTagline}
              </p>
            </div>
          </div>

          <button
            onClick={handleCloudClick}
            className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer border shrink-0 ${
              isDriveConnected
                ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100"
                : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
            }`}
          >
            <Cloud size={14} className={isDriveConnected ? "text-emerald-600" : "text-slate-500"} />
            <span>{isDriveConnected ? "🟢 Connected" : "Connect Cloud"}</span>
          </button>

        </div>
      </header>

      <div className="px-4 py-3 space-y-3.5 max-w-lg mx-auto">
        
        {/* ── 2. COMPACT WORKSPACE HERO CARD ── */}
        <div className="bg-white rounded-[22px] p-4 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>{greeting}</span> 👋
            </h2>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 font-mono bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
              Enterprise
            </span>
          </div>
          
          <div className="flex items-center gap-2.5 mt-1.5">
            {companyLogo ? (
              <div className="w-[40px] h-[40px] rounded-xl bg-white border border-slate-200/80 p-0.5 overflow-hidden shrink-0 shadow-xs">
                <img src={companyLogo} alt={companyName} className="w-full h-full object-cover rounded-[10px]" />
              </div>
            ) : (
              <div className="w-[40px] h-[40px] rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-sm flex items-center justify-center shrink-0 border border-blue-200/80 shadow-xs">
                {companyName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="text-xs font-bold text-slate-900 break-words line-clamp-2 leading-snug capitalize" title={companyName}>
                {companyName}
              </p>
              <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">
                {companyTagline}
              </p>
            </div>
          </div>
        </div>

        {/* ── 3. PRIMARY ACTION BUTTON (NEW QUOTATION) ── */}
        <button
          onClick={handleNewQuote}
          className="w-full h-[52px] rounded-[14px] bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer"
        >
          <Plus size={18} strokeWidth={3} />
          New Quotation
        </button>

        {/* ── 4. COMPACT CLOUD BACKUP SUMMARY WIDGET (~125px Height) ── */}
        {isDriveConnected ? (
          <div
            onClick={handleCloudClick}
            className="bg-white rounded-[22px] p-4 sm:p-4.5 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] transition-all cursor-pointer group space-y-3"
          >
            {/* Top Row: Icon + Title + Connected Badge */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-105 transition-transform">
                  <Cloud size={17} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm tracking-tight">Cloud Backup</h3>
                  <p className="text-[11px] text-slate-500 font-medium truncate">Google Drive connected successfully</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-extrabold shrink-0 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 🟢 Connected
              </span>
            </div>

            <div className="h-px bg-slate-100 w-full" />

            {/* Middle Row: Synced Files & Last Sync */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={15} className="text-blue-600 shrink-0" />
                <span className="font-extrabold text-slate-900 text-xs truncate">
                  {cloudFilesCount} Quotations Synced
                </span>
              </div>

              <div className="flex items-center gap-2 min-w-0">
                <Clock size={15} className="text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider leading-none">Last Sync</span>
                  <span className="font-extrabold text-slate-900 text-xs truncate block mt-0.5">
                    {formatCompactSync(lastSyncTimeRaw)}
                  </span>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100 w-full" />

            {/* Bottom Link */}
            <div className="flex items-center justify-end text-xs font-extrabold text-blue-600 group-hover:translate-x-0.5 transition-transform">
              <span>View Details</span>
              <ArrowRight size={14} className="ml-1" />
            </div>
          </div>
        ) : (
          <div
            onClick={handleCloudClick}
            className="bg-white rounded-[22px] p-4 sm:p-4.5 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] transition-all cursor-pointer group space-y-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 border border-slate-200 group-hover:scale-105 transition-transform">
                  <Cloud size={17} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm tracking-tight">Cloud Backup</h3>
                  <p className="text-[11px] text-slate-500 font-medium truncate">Connect Google Drive to auto-back up</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-extrabold shrink-0">
                ⚪ Not Connected
              </span>
            </div>

            <div className="h-px bg-slate-100 w-full" />

            <div className="flex items-center justify-between text-xs font-extrabold">
              <span className="text-slate-500 font-medium">Protect your data in Google Drive</span>
              <span className="text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                Connect <ArrowRight size={14} />
              </span>
            </div>
          </div>
        )}

        {/* ── 5. SINGLE COMPACT STATISTICS SUMMARY CARD ── */}
        <div className="bg-white rounded-[18px] p-3.5 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between divide-x divide-slate-100 text-center">
          <div className="flex-1 px-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Quotations</span>
            <span className="text-sm font-black text-slate-900 mt-0.5 block">{stats.totalQuotes}</span>
          </div>

          <div className="flex-1 px-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Companies</span>
            <span className="text-sm font-black text-slate-900 mt-0.5 block">{stats.totalCompanies}</span>
          </div>

          <div className="flex-1 px-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Last Backup</span>
            <span className="text-sm font-black text-slate-900 mt-0.5 block truncate">{stats.lastBackup}</span>
          </div>
        </div>

      </div>
    </div>
  );
}