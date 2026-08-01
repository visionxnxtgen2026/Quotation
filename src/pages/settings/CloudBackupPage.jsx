import React, { useState, useEffect } from "react";
import MobileHeader from "../../components/mobile/MobileHeader";
import SettingsCard from "../../components/mobile/SettingsCard";
import CloudStorageSettingsCard from "../../components/settings/CloudStorageSettingsCard";
import { localDB } from "../../utils/localDB";
import { googleDriveProvider } from "../../utils/googleDriveProvider";
import { Cloud, ArrowLeft, HardDrive, FileText, CheckCircle2, RefreshCw } from "lucide-react";

/**
 * ☁️ CloudBackupPage — Dedicated Application-Level Cloud Storage & Backup Page
 */
export default function CloudBackupPage({ onBack }) {
  const [metrics, setMetrics] = useState({ totalQuotations: 0, usedMB: "0.00" });

  useEffect(() => {
    setMetrics(localDB.getStorageMetrics());
  }, []);

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans pb-24 relative">
      <MobileHeader title="Cloud & Backup Settings" onBack={onBack} />

      <div className="w-full px-4 py-4 space-y-4 max-w-4xl mx-auto">
        {/* Google Drive Integration Component */}
        <CloudStorageSettingsCard />

        {/* Local Storage Statistics */}
        <SettingsCard
          title="Storage Statistics"
          subtitle="Offline database and cached assets usage"
          icon={<HardDrive size={18} />}
          iconBg="bg-purple-50 text-purple-600"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Total Quotations</span>
              <span className="text-lg font-black text-slate-900 mt-1 block">{metrics.totalQuotations} Documents</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Local Storage Used</span>
              <span className="text-lg font-black text-blue-600 mt-1 block">{metrics.usedMB} MB</span>
            </div>
          </div>
        </SettingsCard>
      </div>
    </div>
  );
}
