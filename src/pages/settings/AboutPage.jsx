import React from "react";
import MobileHeader from "../../components/mobile/MobileHeader";
import SettingsCard from "../../components/mobile/SettingsCard";
import { Info, ShieldCheck, Heart, ExternalLink } from "lucide-react";

/**
 * ℹ️ AboutPage — Application Details & About Information
 */
export default function AboutPage({ onBack }) {
  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans pb-24 relative">
      <MobileHeader title="About QuoteGen Pro" onBack={onBack} />

      <div className="w-full px-4 py-4 space-y-4 max-w-4xl mx-auto">
        {/* App Info Banner */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white text-center shadow-xl space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-white p-2.5 mx-auto shadow-md">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight">VisionX QuoteGen Pro</h2>
            <p className="text-xs font-bold uppercase text-blue-400 tracking-wider mt-0.5">Version 2.0 (Offline Enterprise)</p>
          </div>
          <p className="text-xs text-slate-300 max-w-sm mx-auto font-normal leading-relaxed">
            Professional offline quotation software for contractors, painting specialists, interior designers, and enterprises.
          </p>
        </div>

        {/* Feature Badges */}
        <SettingsCard
          title="Software Specifications"
          subtitle="Privacy & Architecture"
          icon={<ShieldCheck size={18} />}
          iconBg="bg-blue-50 text-blue-600"
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-700">Storage Architecture</span>
              <span className="font-extrabold text-blue-600">100% Client-Side Local Storage</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-700">Cloud Provider</span>
              <span className="font-extrabold text-emerald-600">Personal Google Drive API v3</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-700">PDF Rendering Engine</span>
              <span className="font-extrabold text-purple-600">HTML Canvas / jsPDF Native</span>
            </div>
          </div>
        </SettingsCard>
      </div>
    </div>
  );
}
