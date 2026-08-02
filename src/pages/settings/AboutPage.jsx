import React, { useState, useEffect } from "react";
import MobileHeader from "../../components/mobile/MobileHeader";
import { localDB } from "../../utils/localDB";
import { GoogleDriveProvider } from "../../utils/googleDriveProvider";
import {
  ShieldCheck,
  Cloud,
  Check,
  Sparkles,
  Lock,
  Wifi,
  Building2,
  FileText,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  Infinity as InfinityIcon
} from "lucide-react";

/**
 * ℹ️ AboutPage — Minimal Enterprise Desktop About Screen
 * Inspired by Visual Studio, JetBrains, Microsoft Office & Adobe Creative Cloud
 */
export default function AboutPage({ onBack }) {
  const [activeProfile, setActiveProfile] = useState(null);
  const [isDriveConnected, setIsDriveConnected] = useState(false);

  useEffect(() => {
    const active = localDB.getActiveCompanyProfile();
    setActiveProfile(active);

    const driveProvider = new GoogleDriveProvider();
    driveProvider.isConnected().then((connected) => {
      setIsDriveConnected(connected);
    });
  }, []);

  const appInfo = [
    { label: "Application Version", value: "2.0 Enterprise" },
    { label: "Build Number", value: "2026.08.01" },
    { label: "Release Date", value: "August 1, 2026" },
    { label: "License", value: "Enterprise Offline" },
    { label: "Current Workspace", value: activeProfile?.companyName || "Default Workspace" },
    { label: "Developer", value: "ZERONYX Technologies" },
  ];

  const coreFeatures = [
    { title: "Multi Company Profiles", icon: <Building2 size={16} className="text-blue-600" /> },
    { title: "Professional PDF Export", icon: <FileText size={16} className="text-blue-600" /> },
    { title: "Word Export", icon: <FileCode size={16} className="text-blue-600" /> },
    { title: "Excel Export", icon: <FileSpreadsheet size={16} className="text-blue-600" /> },
    { title: "Image Export", icon: <ImageIcon size={16} className="text-blue-600" /> },
    { title: "Google Drive Backup", icon: <Cloud size={16} className="text-blue-600" /> },
    { title: "Offline First", icon: <Wifi size={16} className="text-blue-600" /> },
    { title: "Unlimited Quotations", icon: <InfinityIcon size={16} className="text-blue-600" /> },
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans pb-12 relative text-slate-800">
      <MobileHeader title="About QuoteGen Pro" onBack={onBack} />

      <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* ────────────────────────────── 1. HERO CARD ────────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_4px_25px_rgba(0,0,0,0.03)] text-center space-y-5">
          {/* Logo Container */}
          <div className="w-20 h-20 rounded-3xl bg-slate-900 p-3.5 mx-auto shadow-xl shadow-slate-900/10 border border-slate-800 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="QuoteGen Pro Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = "none";
              }}
            />
            <Sparkles size={36} className="text-blue-400 hidden group-has-[img[style*='display: none']]:block" />
          </div>

          {/* Heading & Badges */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                VisionX QuoteGen Pro
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                v2.0 Enterprise
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto">
              Professional Enterprise Quotation Management Platform
            </p>
          </div>

          {/* Key Quick Metadata */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-500 pt-1">
            <span>License: <strong className="text-slate-800 font-bold">Enterprise Offline</strong></span>
            <span className="text-slate-300">•</span>
            <span>Build: <strong className="text-slate-800 font-bold">2026.08.01</strong></span>
          </div>

          {/* Status Badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Offline Ready
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-bold shadow-2xs">
              <Lock size={13} className="text-blue-600" />
              Secure Local Storage
            </span>
            {isDriveConnected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200/80 text-xs font-bold shadow-2xs">
                <Cloud size={13} className="text-cyan-600" />
                Google Drive Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold shadow-2xs">
                <Cloud size={13} className="text-slate-500" />
                Google Drive Backup Ready
              </span>
            )}
          </div>
        </div>

        {/* ────────────────────────────── 2. APPLICATION INFORMATION ────────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-4">
          <h2 className="text-sm font-black uppercase text-slate-400 tracking-wider">
            Application Information
          </h2>

          <div className="divide-y divide-slate-100">
            {appInfo.map((info, idx) => (
              <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs sm:text-sm">
                <span className="font-semibold text-slate-500">{info.label}</span>
                <span className="font-extrabold text-slate-900 text-right">{info.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ────────────────────────────── 3. ENTERPRISE FEATURES ────────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-4">
          <h2 className="text-sm font-black uppercase text-slate-400 tracking-wider">
            Enterprise Features
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {coreFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-blue-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <Check size={14} className="text-blue-600 stroke-[3]" />
                </div>
                <span className="text-xs font-bold text-slate-800">{feat.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ────────────────────────────── 4. FOOTER ────────────────────────────── */}
        <div className="pt-4 text-center space-y-1.5">
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm font-black text-slate-900 tracking-tight">
              VisionX QuoteGen Pro
            </span>
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
              Enterprise Offline Edition
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            © 2026 ZERONYX Technologies. All Rights Reserved.
          </p>
          <p className="text-[11px] text-slate-400 font-semibold tracking-wide flex items-center justify-center gap-1">
            Made with <span className="text-red-500">❤️</span> in India
          </p>
        </div>

      </div>
    </div>
  );
}
