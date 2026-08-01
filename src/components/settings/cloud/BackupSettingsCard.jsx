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

      {/* 2. DEFAULT PRIVACY & ACCESS CONTROL */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100 font-bold">
            <Shield size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">Default Upload Visibility</h3>
            <p className="text-xs text-slate-500 font-medium">Privacy settings for generated cloud file links</p>
          </div>
        </div>

        {/* Radio selector cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            onClick={() => handleVisibilityChange("public")}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              settings.defaultVisibility === "public"
                ? "border-emerald-500 bg-emerald-50/50 shadow-xs"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-2.5 mb-1">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${settings.defaultVisibility === "public" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                <Globe size={18} />
              </div>
              <div className="flex-1">
                <span className="text-xs font-black text-slate-900">Public</span>
                <span className="text-[10px] font-bold text-emerald-600 block">Default</span>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${settings.defaultVisibility === "public" ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300"}`}>
                {settings.defaultVisibility === "public" && <Check size={12} strokeWidth={3} />}
              </div>
            </div>
            <p className="text-[11px] text-slate-600 font-medium">Anyone with the generated share link can open and view the document.</p>
          </div>

          <div
            onClick={() => handleVisibilityChange("private")}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              settings.defaultVisibility === "private"
                ? "border-amber-500 bg-amber-50/50 shadow-xs"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-2.5 mb-1">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${settings.defaultVisibility === "private" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                <Lock size={18} />
              </div>
              <div className="flex-1">
                <span className="text-xs font-black text-slate-900">Private</span>
                <span className="text-[10px] font-bold text-amber-600 block">Restricted</span>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${settings.defaultVisibility === "private" ? "border-amber-600 bg-amber-600 text-white" : "border-slate-300"}`}>
                {settings.defaultVisibility === "private" && <Check size={12} strokeWidth={3} />}
              </div>
            </div>
            <p className="text-[11px] text-slate-600 font-medium">Only specifically authorized email addresses can access the file on Google Drive.</p>
          </div>
        </div>

        {/* Private Access Email Manager */}
        {settings.defaultVisibility === "private" && (
          <div className="bg-amber-50/60 rounded-2xl border border-amber-200/80 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                <Lock size={14} className="text-amber-600" /> Private Allowed Emails List
              </h4>
              <span className="text-[10px] font-bold text-amber-700">
                {(settings.allowedEmails || []).length} Authorized
              </span>
            </div>

            {/* Input + Add button */}
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Add allowed email (e.g. client@company.com)"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
                className="flex-1 bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleAddEmail}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Plus size={14} />
                <span>Add Email</span>
              </button>
            </div>

            {/* Allowed email list */}
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {(settings.allowedEmails || []).map((email) => (
                <div
                  key={email}
                  className="bg-white rounded-xl px-3 py-2 border border-amber-200/60 flex items-center justify-between text-xs"
                >
                  <span className="font-bold text-slate-800 truncate">{email}</span>
                  <button
                    onClick={() => handleRemoveEmail(email)}
                    className="text-slate-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                    title="Remove Email"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-1 flex justify-end">
              <button
                onClick={handleSavePrivateAccess}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                {savedSuccess ? <Check size={14} /> : <Save size={14} />}
                <span>{savedSuccess ? "Saved!" : "Save Email List"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
