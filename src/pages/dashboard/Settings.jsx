import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Building2,
  Cloud,
  FolderArchive,
  Info,
  ChevronRight,
  Bell,
  User,
  AlertTriangle,
  LogOut,
  CheckCircle2,
  Check,
  ShieldCheck,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import CompanyProfilesScreen from "../../components/settings/CompanyProfilesScreen";
import CloudBackupPage from "../settings/CloudBackupPage";
import AboutPage from "../settings/AboutPage";
import QuotationsPage from "./QuotationsPage";
import { localDB } from "../../utils/localDB";
import { googleDriveProvider } from "../../utils/googleDriveProvider";

/**
 * ⚙️ Simplified Enterprise Settings Hub — Dynamic Drive Connection State
 * Automatically switches UI between Connect and Connected/Disconnect states in realtime.
 */
export default function Settings({
  goToDashboard,
  goToCreate,
  goToPreview,
  goToExport,
  goToSettings,
  goToEditProfile,
  goToStorage,
  goToHelp,
  goToCompanyWorkspace
}) {
  const [activeSubPage, setActiveSubPage] = useState("menu"); // "menu" | "profiles" | "cloud" | "library" | "about"
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);

  // Google Drive Account State
  const [gdriveConnected, setGdriveConnected] = useState(false);
  const [gdriveEmail, setGdriveEmail] = useState("");
  const [gdrivePhoto, setGdrivePhoto] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const refreshData = () => {
    const list = localDB.getCompanyProfiles();
    const active = localDB.getActiveCompanyProfile();
    setProfiles(list);
    setActiveProfile(active);
  };

  const checkDrive = async () => {
    try {
      const isConn = await googleDriveProvider.isConnected();
      setGdriveConnected(isConn);
      if (isConn) {
        setGdriveEmail(googleDriveProvider.userEmail || localStorage.getItem("gdrive_user_email") || "Connected Gmail Account");
        setGdrivePhoto(googleDriveProvider.userPicture || localStorage.getItem("gdrive_user_picture") || "");
      } else {
        setGdriveEmail("");
        setGdrivePhoto("");
      }
    } catch (e) {
      setGdriveConnected(false);
      setGdriveEmail("");
      setGdrivePhoto("");
    }
  };

  useEffect(() => {
    refreshData();
    checkDrive();

    window.addEventListener("quotationDataUpdated", refreshData);
    window.addEventListener("gdriveStatusUpdated", checkDrive);
    window.addEventListener("cloudFilesUpdated", checkDrive);
    window.addEventListener("storage", checkDrive);

    return () => {
      window.removeEventListener("quotationDataUpdated", refreshData);
      window.removeEventListener("gdriveStatusUpdated", checkDrive);
      window.removeEventListener("cloudFilesUpdated", checkDrive);
      window.removeEventListener("storage", checkDrive);
    };
  }, []);

  const handleConnectDrive = async () => {
    setIsConnecting(true);
    try {
      await googleDriveProvider.authenticate();
      await checkDrive();
    } catch (err) {
      console.error("[Settings Drive Connect Error]:", err);
      alert(err.message || "Failed to connect to Google Drive");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectDrive = async () => {
    if (window.confirm("Are you sure you want to disconnect Google Drive? Local quotations remain safe.")) {
      await googleDriveProvider.disconnect();
      await checkDrive();
    }
  };

  // Sub-page Renderers
  if (activeSubPage === "profiles") {
    return (
      <CompanyProfilesScreen
        isOpen={true}
        onClose={() => setActiveSubPage("menu")}
        onSelectProfile={() => refreshData()}
        onProfilesUpdated={() => refreshData()}
        goToCompanyWorkspace={goToCompanyWorkspace}
      />
    );
  }

  if (activeSubPage === "cloud") {
    return <CloudBackupPage onBack={() => setActiveSubPage("menu")} />;
  }

  if (activeSubPage === "library") {
    return (
      <QuotationsPage
        goBack={() => setActiveSubPage("menu")}
        goToCreate={goToCreate}
        goToPreview={goToPreview}
        goToExport={goToExport}
      />
    );
  }

  if (activeSubPage === "about") {
    return <AboutPage onBack={() => setActiveSubPage("menu")} />;
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans pb-32 text-slate-800 select-none">
      {/* ====================================================
          TOP HEADER (STICKY BAR)
      ==================================================== */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={goToDashboard}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors active:scale-95 cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Settings</h1>
              <p className="text-xs font-medium text-slate-500 hidden sm:block">
                Manage your company profile, cloud backup, and application data.
              </p>
            </div>
          </div>

          {/* Right Notification Icon & Profile Avatar */}
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors relative">
              <Bell size={20} />
              <span className="w-2 h-2 bg-blue-600 rounded-full absolute top-2 right-2 ring-2 ring-white" />
            </button>

            <div
              onClick={() => setActiveSubPage("profiles")}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center cursor-pointer shadow-xs hover:scale-105 transition-transform ring-2 ring-blue-100"
            >
              {activeProfile?.companyName ? activeProfile.companyName.charAt(0).toUpperCase() : "VX"}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">

        {/* ====================================================
            WORKSPACE HERO GRADIENT CARD
        ==================================================== */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-[24px] p-6 shadow-xl border border-blue-900/40 relative overflow-hidden space-y-6">
          <div className="w-64 h-64 bg-blue-600/10 rounded-full blur-3xl absolute -top-20 -right-20 pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
                {activeProfile?.companyLogo ? (
                  <img src={activeProfile.companyLogo} alt="Logo" className="w-full h-full object-contain p-1.5 rounded-2xl" />
                ) : (
                  <Building2 size={32} className="text-blue-300" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-extrabold uppercase rounded-full tracking-wider">
                    Active Company Profile
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" /> Enterprise ERP
                  </span>
                </div>

                <h2 className="text-xl font-black text-white tracking-tight mt-1">
                  {activeProfile?.companyName || "VisionX Enterprise"}
                </h2>

                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  {profiles.length} Registered Workspace Profiles • Consolidated Business Config
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveSubPage("profiles")}
              className="px-4 py-2.5 bg-[#2563EB] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md shadow-blue-600/30 shrink-0 cursor-pointer"
            >
              Manage Company Profile
            </button>
          </div>
        </div>

        {/* ====================================================
            CONSOLIDATED 5-CARD SETTINGS NAVIGATION
        ==================================================== */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            System Navigation
          </h3>

          <div className="grid grid-cols-1 gap-3">

            {/* 🏢 1. COMPANY PROFILE CARD */}
            <div
              onClick={() => setActiveSubPage("profiles")}
              className="bg-white rounded-[20px] p-5 border border-slate-200/80 shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:scale-98 transition-all cursor-pointer group flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 border border-blue-100 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                  <Building2 size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">🏢 Company Profile</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Company Info, Bank Details, Tax &amp; Billing, PDF Settings, Watermarks &amp; Encryption
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>

            {/* ☁ 2. CLOUD & BACKUP CARD (DYNAMIC BASED ON GOOGLE DRIVE STATUS) */}
            <div className="bg-white rounded-[20px] p-5 border border-slate-200/80 shadow-2xs space-y-4 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-colors ${
                    gdriveConnected ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}>
                    <Cloud size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">☁ Cloud &amp; Backup</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 border ${
                        gdriveConnected
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${gdriveConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                        <span>{gdriveConnected ? "Google Drive Connected" : "Not Connected"}</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {gdriveConnected
                        ? `Connected: ${gdriveEmail}`
                        : "Connect your Google Drive account to enable automatic backup and cloud sharing."}
                    </p>
                  </div>
                </div>
              </div>

              {/* DYNAMIC CONTENT BASED ON CONNECTION STATUS */}
              {gdriveConnected ? (
                /* CASE 2: CONNECTED GOOGLE DRIVE */
                <div className="space-y-3 pt-1 border-t border-slate-100">
                  {/* Status Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11px] font-extrabold flex items-center gap-1">
                      <Check size={13} className="text-emerald-600" /> Auto Backup Enabled
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200/80 text-[11px] font-extrabold flex items-center gap-1">
                      <Check size={13} className="text-blue-600" /> Cloud Sync Active
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-800 border border-purple-200/80 text-[11px] font-extrabold flex items-center gap-1">
                      <Check size={13} className="text-purple-600" /> Share Drive Links Available
                    </span>
                  </div>

                  {/* Connected Actions */}
                  <div className="flex items-center gap-2.5 pt-1">
                    <button
                      onClick={() => setActiveSubPage("cloud")}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Manage Drive</span>
                      <ChevronRight size={14} />
                    </button>

                    <button
                      onClick={handleDisconnectDrive}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <LogOut size={13} />
                      <span>Disconnect Drive</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* CASE 1: NOT CONNECTED GOOGLE DRIVE */
                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={handleConnectDrive}
                    disabled={isConnecting}
                    className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <Cloud size={16} />
                    <span>{isConnecting ? "Connecting..." : "Connect Google Drive"}</span>
                  </button>
                </div>
              )}
            </div>

            {/* 📂 3. QUOTATION LIBRARY CARD */}
            <div
              onClick={() => setActiveSubPage("library")}
              className="bg-white rounded-[20px] p-5 border border-slate-200/80 shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:scale-98 transition-all cursor-pointer group flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <FolderArchive size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">📂 Quotation Library</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Manage all saved &amp; cloud-synced quotation files with timeline grouping
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>

            {/* ℹ 4. ABOUT VISIONX CARD */}
            <div
              onClick={() => setActiveSubPage("about")}
              className="bg-white rounded-[20px] p-5 border border-slate-200/80 shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:scale-98 transition-all cursor-pointer group flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                  <Info size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">ℹ About VisionX QuoteGen Pro</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Version 2.4.0 (Enterprise Build 2026.08.02) • Check updates &amp; terms
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>

          </div>
        </div>

        {/* ====================================================
            BOTTOM SECTION — DANGER ZONE (DYNAMICALLY HIDES DISCONNECT)
        ==================================================== */}
        <section className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 px-1 flex items-center gap-1.5">
            <AlertTriangle size={14} /> Danger Zone
          </h3>

          <div className={`grid gap-3 ${gdriveConnected ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
            <div className="bg-rose-50/60 border border-rose-200 rounded-[20px] p-4 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-rose-900">Clear Cache</h4>
                <p className="text-[11px] text-rose-600/80 mt-0.5">Purge temporary preview cache</p>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem("previewDraft");
                  alert("Cache cleared successfully.");
                }}
                className="px-3.5 py-1.5 bg-white border border-rose-300 text-rose-700 font-bold text-xs rounded-xl hover:bg-rose-100 active:scale-95 transition-all shadow-2xs shrink-0 cursor-pointer"
              >
                Clear
              </button>
            </div>

            {/* ONLY DISPLAY DISCONNECT DRIVE IN DANGER ZONE WHEN CONNECTED */}
            {gdriveConnected && (
              <div className="bg-rose-50/60 border border-rose-200 rounded-[20px] p-4 flex items-center justify-between gap-3 animate-in fade-in duration-200">
                <div>
                  <h4 className="text-xs font-bold text-rose-900">Disconnect Drive</h4>
                  <p className="text-[11px] text-rose-600/80 mt-0.5">Sign out of Google Account</p>
                </div>
                <button
                  onClick={handleDisconnectDrive}
                  className="px-3 py-1.5 bg-white border border-rose-300 text-rose-700 font-bold text-xs rounded-xl hover:bg-rose-100 active:scale-95 transition-all shadow-2xs shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <LogOut size={12} /> Disconnect
                </button>
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}