import React, { useState, useEffect } from "react";
import { Sliders, Shield, Lock, Globe, Plus, Trash2, Check, Save } from "lucide-react";
import { localDB } from "../../../utils/localDB";

export default function BackupSettingsCard({ onToast }) {
  const [settings, setSettings] = useState(() => localDB.getCloudSettings());
  const [newEmail, setNewEmail] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggle = (key) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    localDB.saveCloudSettings(updated);
  };

  const handleFrequencyChange = (e) => {
    const updated = { ...settings, backupFrequency: e.target.value };
    setSettings(updated);
    localDB.saveCloudSettings(updated);
  };

  const handleVisibilityChange = (val) => {
    const updated = { ...settings, defaultVisibility: val };
    setSettings(updated);
    localDB.saveCloudSettings(updated);
  };

  const handleAddEmail = () => {
    if (!newEmail || !newEmail.includes("@")) {
      if (onToast) onToast("Please enter a valid email address.", "error");
      return;
    }
    const currentList = settings.allowedEmails || [];
    if (currentList.includes(newEmail.trim())) {
      if (onToast) onToast("Email already exists in allowed list.", "error");
      return;
    }
    const updatedEmails = [...currentList, newEmail.trim()];
    const updated = { ...settings, allowedEmails: updatedEmails };
    setSettings(updated);
    localDB.saveCloudSettings(updated);
    setNewEmail("");
    if (onToast) onToast("Email added to access list.", "success");
  };

  const handleRemoveEmail = (emailToRemove) => {
    const updatedEmails = (settings.allowedEmails || []).filter((e) => e !== emailToRemove);
    const updated = { ...settings, allowedEmails: updatedEmails };
    setSettings(updated);
    localDB.saveCloudSettings(updated);
  };

  const handleSavePrivateAccess = () => {
    localDB.saveCloudSettings(settings);
    setSavedSuccess(true);
    if (onToast) onToast("Access permissions saved!", "success");
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const toggleItems = [
    { key: "autoBackupQuotations", label: "Auto Backup Quotations", desc: "Sync JSON data upon save" },
    { key: "autoBackupPdfs", label: "Auto Backup PDFs", desc: "Upload generated PDF exports" },
    { key: "autoBackupImages", label: "Auto Backup Images", desc: "Backup logo & signatures" },
    { key: "autoBackupCustomerData", label: "Auto Backup Customer Data", desc: "Sync client profiles & history" },
    { key: "autoBackupCompanyProfiles", label: "Auto Backup Company Profiles", desc: "Backup workspace settings" },
    { key: "autoBackupSettings", label: "Auto Backup Settings", desc: "Sync app preferences" },
  ];

  return (
    <div className="space-y-4">
      {/* 1. AUTO BACKUP TOGGLES & FREQUENCY */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 font-bold">
            <Sliders size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">Auto Backup Preferences</h3>
            <p className="text-xs text-slate-500 font-medium">Automatic cloud synchronization options</p>
          </div>
        </div>

        {/* Frequency selector */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
          <label className="text-xs font-black text-slate-900">Backup Frequency</label>
          <select
            value={settings.backupFrequency || "every_export"}
            onChange={handleFrequencyChange}
            className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 shadow-2xs"
          >
            <option value="every_export">Every Export</option>
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="manual">Manual Only</option>
          </select>
        </div>

        {/* Toggle List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {toggleItems.map(({ key, label, desc }) => {
            const isChecked = Boolean(settings[key]);
            return (
              <div
                key={key}
                onClick={() => handleToggle(key)}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  isChecked
                    ? "bg-blue-50/50 border-blue-200"
                    : "bg-slate-50 border-slate-200/80 hover:bg-slate-100/60"
                }`}
              >
                <div className="min-w-0 flex-1 pr-2">
                  <p className={`text-xs font-bold ${isChecked ? "text-blue-950" : "text-slate-800"}`}>{label}</p>
                  <p className="text-[10px] text-slate-500 font-medium truncate">{desc}</p>
                </div>

                {/* Custom Switch Toggle */}
                <div
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                    isChecked ? "bg-blue-600" : "bg-slate-300"
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
