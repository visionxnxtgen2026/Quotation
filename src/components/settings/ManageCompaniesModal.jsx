import React, { useState } from "react";
import {
  Building2, Star, Trash2, Copy, Download, Upload, Plus, X, Edit2, Check, ShieldCheck
} from "lucide-react";
import { localDB } from "../../utils/localDB";

/**
 * 🏢 ManageCompaniesModal Component
 * Modal for managing company profiles: Rename, Duplicate, Set Default, Export, Import, Delete.
 */
export default function ManageCompaniesModal({
  isOpen,
  onClose,
  onOpenCreate,
  onProfilesUpdated,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  if (!isOpen) return null;

  const profiles = localDB.getCompanyProfiles();

  const handleSetDefault = (id) => {
    localDB.setDefaultCompanyProfile(id);
    if (onProfilesUpdated) onProfilesUpdated();
  };

  const handleDuplicate = (id) => {
    localDB.duplicateCompanyProfile(id);
    if (onProfilesUpdated) onProfilesUpdated();
  };

  const handleDelete = (id, name, isDefault) => {
    if (isDefault) {
      alert("Cannot delete the default company profile. Set another company profile as default first.");
      return;
    }
    if (window.confirm(`Are you sure you want to delete profile "${name}"?`)) {
      localDB.deleteCompanyProfile(id);
      if (onProfilesUpdated) onProfilesUpdated();
    }
  };

  const handleRename = (id) => {
    if (!editingName.trim()) return;
    const target = profiles.find((p) => p.id === id);
    if (target) {
      localDB.saveCompanyProfileById({ ...target, companyName: editingName.trim() });
      setEditingId(null);
      setEditingName("");
      if (onProfilesUpdated) onProfilesUpdated();
    }
  };

  const handleExportSingle = (p) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(p, null, 2));
    const anchor = document.createElement("a");
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", `company_profile_${(p.companyName || "profile").toLowerCase().replace(/\s+/g, "_")}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const handleImportSingle = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed && (parsed.companyName || parsed.name)) {
          const imported = {
            ...parsed,
            id: `cp_${Date.now()}`,
            companyName: parsed.companyName || parsed.name,
            isDefault: false,
          };
          localDB.saveCompanyProfileById(imported);
          if (onProfilesUpdated) onProfilesUpdated();
          alert(`Company profile "${imported.companyName}" imported successfully!`);
        } else {
          alert("Invalid company profile JSON.");
        }
      } catch (err) {
        alert("Failed to parse company profile JSON file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-5 border border-slate-100 relative max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Manage Company Profiles</h3>
              <p className="text-xs text-slate-500 font-medium">Switch, rename, duplicate or set default profiles</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* List of Profiles */}
        <div className="overflow-y-auto space-y-3 flex-1 pr-1">
          {profiles.map((p) => {
            const isDefault = !!p.isDefault;
            const name = p.companyName || "Unnamed Company";

            return (
              <div
                key={p.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isDefault
                    ? "bg-blue-50/40 border-blue-200 shadow-2xs"
                    : "bg-white border-slate-200/80 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Logo / Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                      {p.companyLogo ? (
                        <img src={p.companyLogo} alt={name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <Building2 size={18} className="text-slate-400" />
                      )}
                    </div>

                    {/* Name or Rename Input */}
                    <div className="min-w-0 flex-1">
                      {editingId === p.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="px-2.5 py-1 bg-white border border-blue-500 rounded-lg text-xs font-bold text-slate-900 outline-none w-full"
                            autoFocus
                          />
                          <button
                            onClick={() => handleRename(p.id)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                          >
                            <Check size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-slate-900 text-sm truncate">{name}</h4>
                          {isDefault && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                              <Star size={10} className="fill-emerald-600 text-emerald-600" /> Default
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                        {p.companyEmail || p.email || p.companyPhone || "No contact info"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-1 flex-wrap text-xs">
                  <div className="flex items-center gap-1">
                    {!isDefault && (
                      <button
                        onClick={() => handleSetDefault(p.id)}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Star size={12} /> Set Default
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingId(p.id);
                        setEditingName(name);
                      }}
                      className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
                      title="Rename"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDuplicate(p.id)}
                      className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
                      title="Duplicate Profile"
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      onClick={() => handleExportSingle(p)}
                      className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
                      title="Export Profile JSON"
                    >
                      <Download size={13} />
                    </button>
                  </div>

                  <button
                    disabled={isDefault}
                    onClick={() => handleDelete(p.id, name, isDefault)}
                    className={`p-1.5 rounded-xl cursor-pointer transition-colors ${
                      isDefault
                        ? "text-slate-300 cursor-not-allowed"
                        : "text-slate-400 hover:text-red-600 hover:bg-red-50"
                    }`}
                    title={isDefault ? "Cannot delete default profile" : "Delete Profile"}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-3 shrink-0">
          <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition-colors">
            <Upload size={13} /> Import Profile
            <input type="file" accept=".json" onChange={handleImportSingle} className="hidden" />
          </label>

          <button
            onClick={() => {
              onClose();
              if (onOpenCreate) onOpenCreate();
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={14} /> + Create New Company
          </button>
        </div>
      </div>
    </div>
  );
}
