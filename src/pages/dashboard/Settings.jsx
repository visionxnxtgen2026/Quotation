import React, { useState, useEffect } from "react";
import MobileHeader from "../../components/mobile/MobileHeader";
import CompanyProfilesScreen from "../../components/settings/CompanyProfilesScreen";
import CloudBackupPage from "../settings/CloudBackupPage";
import ExportImportPage from "../settings/ExportImportPage";
import AppPreferencesPage from "../settings/AppPreferencesPage";
import AboutPage from "../settings/AboutPage";
import { localDB } from "../../utils/localDB";
import {
  Building2, Cloud, Package, Settings2, Info, ChevronRight, Star
} from "lucide-react";

/**
 * ⚙️ Enterprise Settings Hub — Clean Navigation Menu
 * Separates Company Profiles, Cloud & Backup, Export & Import, App Preferences, and About.
 */
export default function Settings({
  goToDashboard, goToCreate, goToPreview, goToExport,
  goToSettings, goToEditProfile, goToStorage, goToHelp
}) {
  const [activeSubPage, setActiveSubPage] = useState("menu"); // "menu" | "profiles" | "cloud" | "export" | "prefs" | "about"
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);

  const refreshData = () => {
    const list = localDB.getCompanyProfiles();
    const active = localDB.getActiveCompanyProfile();
    setProfiles(list);
    setActiveProfile(active);
  };

  useEffect(() => {
    refreshData();
    window.addEventListener("quotationDataUpdated", refreshData);
    return () => window.removeEventListener("quotationDataUpdated", refreshData);
  }, []);

  // Sub-page Renderers
  if (activeSubPage === "profiles") {
    return (
      <CompanyProfilesScreen
        isOpen={true}
        onClose={() => setActiveSubPage("menu")}
        onSelectProfile={() => refreshData()}
        onProfilesUpdated={() => refreshData()}
      />
    );
  }

  if (activeSubPage === "cloud") {
    return <CloudBackupPage onBack={() => setActiveSubPage("menu")} />;
  }

  if (activeSubPage === "export") {
    return <ExportImportPage onBack={() => setActiveSubPage("menu")} />;
  }

  if (activeSubPage === "prefs") {
    return <AppPreferencesPage onBack={() => setActiveSubPage("menu")} />;
  }

  if (activeSubPage === "about") {
    return <AboutPage onBack={() => setActiveSubPage("menu")} />;
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans pb-24 relative">
      <MobileHeader title="Settings" onBack={goToDashboard} />

      <div className="w-full px-4 py-4 space-y-3 max-w-2xl mx-auto">
        
        {/* Active Workspace Header Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-5 text-white shadow-lg shadow-blue-600/15 flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              {activeProfile?.companyLogo ? (
                <img src={activeProfile.companyLogo} alt="Logo" className="w-full h-full object-contain p-1" />
              ) : (
                <Building2 size={22} className="text-white" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black uppercase text-blue-200 tracking-wider">Active Workspace Profile</span>
              <h2 className="text-base font-black text-white truncate">{activeProfile?.companyName || "My Company"}</h2>
              <p className="text-xs text-blue-100 font-medium truncate">{profiles.length} registered company profiles</p>
            </div>
          </div>
        </div>

        {/* 🏢 1. Company Profiles Navigation Card */}
        <div
          onClick={() => setActiveSubPage("profiles")}
          className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] transition-all cursor-pointer group flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-105 transition-transform">
              <Building2 size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">Company Profiles</h3>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">Branding, logos, bank details &amp; quotation templates</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>

        {/* ☁️ 2. Cloud & Backup Navigation Card */}
        <div
          onClick={() => setActiveSubPage("cloud")}
          className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] transition-all cursor-pointer group flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 group-hover:scale-105 transition-transform">
              <Cloud size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">Cloud &amp; Backup</h3>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">Google Drive sync, cloud restore &amp; auto-backup options</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>

        {/* 📦 3. Export & Import Navigation Card */}
        <div
          onClick={() => setActiveSubPage("export")}
          className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] transition-all cursor-pointer group flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 group-hover:scale-105 transition-transform">
              <Package size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">Export &amp; Import</h3>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">Export full backup JSON files or restore offline data</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>

        {/* ⚙️ 4. Application Preferences Navigation Card */}
        <div
          onClick={() => setActiveSubPage("prefs")}
          className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] transition-all cursor-pointer group flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100 group-hover:scale-105 transition-transform">
              <Settings2 size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">Application Preferences</h3>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">System preferences, draft auto-save &amp; reset app</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>

        {/* ℹ️ 5. About QuoteGen Pro Navigation Card */}
        <div
          onClick={() => setActiveSubPage("about")}
          className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] transition-all cursor-pointer group flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200 group-hover:scale-105 transition-transform">
              <Info size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">About QuoteGen Pro</h3>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">Version 2.0 (Offline Enterprise Specifications)</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>

      </div>
    </div>
  );
}