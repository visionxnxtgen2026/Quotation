import React, { useState } from "react";
import MobileHeader from "../../components/mobile/MobileHeader";
import SettingsCard from "../../components/mobile/SettingsCard";
import DeleteAccountModal from "../../components/settings/DeleteAccountModal";
import { localDB } from "../../utils/localDB";
import { Settings2, Save, Trash2, IndianRupee, Calendar } from "lucide-react";

/**
 * ⚙️ AppPreferencesPage — Dedicated Application Preferences Page
 */
export default function AppPreferencesPage({ onBack }) {
  const [autoSaveDraft, setAutoSaveDraft] = useState(() => localStorage.getItem("autoSaveDraftEnabled") !== "false");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const executeDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      localDB.clearAllData();
      window.location.href = "/";
    } catch {
      alert("Failed to reset. Please try again.");
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans pb-24 relative">
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={executeDeleteAccount}
        isLoading={isDeleting}
      />

      <MobileHeader title="Application Preferences" onBack={onBack} />

      <div className="w-full px-4 py-4 space-y-4 max-w-4xl mx-auto">
        {/* Application Preferences */}
        <SettingsCard
          title="General Preferences"
          subtitle="System formatting and draft behavior"
          icon={<Settings2 size={18} />}
          iconBg="bg-blue-50 text-blue-600"
        >
          <div className="space-y-3">
            {/* Auto Save Draft */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="pr-3">
                <p className="text-xs font-bold text-slate-800">Auto Save Draft</p>
                <p className="text-[10px] text-slate-500 font-medium leading-snug mt-0.5">Automatically save quotation drafts while editing.</p>
              </div>
              <button
                onClick={() => {
                  const newVal = !autoSaveDraft;
                  setAutoSaveDraft(newVal);
                  localStorage.setItem("autoSaveDraftEnabled", String(newVal));
                }}
                className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                  autoSaveDraft ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${autoSaveDraft ? "translate-x-6" : "translate-x-0"}`} />
              </button>
            </div>

            {/* Currency Format */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2.5">
                <IndianRupee size={16} className="text-slate-600" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Currency Unit</p>
                  <p className="text-[10px] text-slate-500 font-medium">Indian Rupee (INR ₹)</p>
                </div>
              </div>
              <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">₹ (INR)</span>
            </div>

            {/* Date Format */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2.5">
                <Calendar size={16} className="text-slate-600" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Date Format</p>
                  <p className="text-[10px] text-slate-500 font-medium">Standard Indian Format</p>
                </div>
              </div>
              <span className="text-xs font-extrabold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">DD/MM/YYYY</span>
            </div>
          </div>
        </SettingsCard>

        {/* Danger Zone */}
        <SettingsCard
          title="Danger Zone"
          subtitle="Reset application local storage"
          icon={<Trash2 size={18} />}
          iconBg="bg-red-50 text-red-600"
        >
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="w-full h-12 rounded-xl bg-red-50 text-red-600 font-bold text-xs border border-red-200 flex items-center justify-center gap-2 cursor-pointer hover:bg-red-100 transition-colors"
          >
            <Trash2 size={15} /> Clear All Local Data &amp; Reset App
          </button>
        </SettingsCard>
      </div>
    </div>
  );
}
