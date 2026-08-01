import React, { useState } from "react";
import MobileHeader from "../../components/mobile/MobileHeader";
import SettingsCard from "../../components/mobile/SettingsCard";
import { localDB } from "../../utils/localDB";
import { Download, Upload, FileText, CheckCircle2, RefreshCw, Database } from "lucide-react";

/**
 * 📦 ExportImportPage — Dedicated Export & Import Data Migration Page
 */
export default function ExportImportPage({ onBack }) {
  const [importMode, setImportMode] = useState("merge"); // "merge" | "replace"

  const handleExportAll = () => {
    localDB.exportBackupJSON();
  };

  const handleExportActiveCompany = () => {
    const active = localDB.getActiveCompanyProfile();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(active, null, 2));
    const anchor = document.createElement("a");
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", `company_profile_${(active.companyName || "profile").toLowerCase().replace(/\s+/g, "_")}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (importMode === "replace") {
          if (window.confirm("Replace mode will overwrite existing local data. Continue?")) {
            if (localDB.importBackupJSON(parsed)) {
              alert("Data replaced successfully!");
            } else {
              alert("Failed to import data.");
            }
          }
        } else {
          // Merge Mode
          if (localDB.importBackupJSON(parsed)) {
            alert("Backup merged successfully!");
          } else {
            alert("Failed to merge backup.");
          }
        }
      } catch (err) {
        alert("Invalid JSON backup file format.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans pb-24 relative">
      <MobileHeader title="Export & Import Settings" onBack={onBack} />

      <div className="w-full px-4 py-4 space-y-4 max-w-4xl mx-auto">
        {/* Export Data */}
        <SettingsCard
          title="Export Data"
          subtitle="Download full offline backup or company profile JSON files"
          icon={<Download size={18} />}
          iconBg="bg-blue-50 text-blue-600"
        >
          <div className="space-y-3">
            <button
              onClick={handleExportAll}
              className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs hover:bg-slate-800 transition-colors"
            >
              <Download size={15} /> Export All Application Data (Full Backup JSON)
            </button>
            <button
              onClick={handleExportActiveCompany}
              className="w-full h-12 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-colors"
            >
              <FileText size={15} className="text-blue-600" /> Export Active Company Profile JSON
            </button>
          </div>
        </SettingsCard>

        {/* Import Data */}
        <SettingsCard
          title="Import Backup Data"
          subtitle="Restore data from previously exported backup files"
          icon={<Upload size={18} />}
          iconBg="bg-emerald-50 text-emerald-600"
        >
          <div className="space-y-4">
            {/* Import Mode Selector */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <label className="text-xs font-extrabold text-slate-800 block">Import Mode:</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setImportMode("merge")}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    importMode === "merge"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white text-slate-700 border border-slate-200"
                  }`}
                >
                  Merge (Safely Combine)
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode("replace")}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    importMode === "replace"
                      ? "bg-red-600 text-white shadow-xs"
                      : "bg-white text-slate-700 border border-slate-200"
                  }`}
                >
                  Replace (Overwrite Existing)
                </button>
              </div>
            </div>

            <label className="w-full h-12 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer text-center hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20">
              <Upload size={15} /> Select JSON File to Import ({importMode.toUpperCase()})
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>
          </div>
        </SettingsCard>
      </div>
    </div>
  );
}
