import React, { useState } from "react";
import {
  Building2, Star, Trash2, Copy, Download, Upload, Plus, X, Edit2, Check,
  ChevronRight, ArrowLeft, MoreVertical, Sparkles, ShieldCheck
} from "lucide-react";
import { localDB } from "../../utils/localDB";
import CreateCompanyModal from "./CreateCompanyModal";

import CompanyWorkspaceScreen from "./CompanyWorkspaceScreen";

/**
 * 🏢 CompanyProfilesScreen Component
 * Workspace-like dedicated management screen for company profiles.
 */
export default function CompanyProfilesScreen({
  isOpen,
  onClose,
  onSelectProfile,
  onProfilesUpdated,
  goToCompanyWorkspace
}) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  if (!isOpen) return null;

  if (selectedWorkspaceId && !goToCompanyWorkspace) {
    return (
      <CompanyWorkspaceScreen
        profileId={selectedWorkspaceId}
        onBack={() => setSelectedWorkspaceId(null)}
        onSaved={() => {
          if (onProfilesUpdated) onProfilesUpdated();
        }}
      />
    );
  }

  const profiles = localDB.getCompanyProfiles();

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

  const handleSelectCompany = (p) => {
    localDB.setActiveCompanyProfileId(p.id);
    if (goToCompanyWorkspace) {
      goToCompanyWorkspace(p.id);
    } else {
      setSelectedWorkspaceId(p.id);
    }
  };

  const handleSetDefault = (e, id) => {
    e.stopPropagation();
    localDB.setDefaultCompanyProfile(id);
    setActiveMenuId(null);
    showToast("Default company changed successfully.");
    if (onProfilesUpdated) onProfilesUpdated();
  };

  const handleDuplicate = (e, id) => {
    e.stopPropagation();
    localDB.duplicateCompanyProfile(id);
    setActiveMenuId(null);
    if (onProfilesUpdated) onProfilesUpdated();
  };

  const handleDelete = (e, id, name, isDefault) => {
    e.stopPropagation();
    setActiveMenuId(null);
    if (isDefault) {
      alert("Cannot delete the default company profile. Please set another company profile as default first.");
      return;
    }
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      localDB.deleteCompanyProfile(id);
      if (onProfilesUpdated) onProfilesUpdated();
    }
  };

  const handleExportSingle = (e, p) => {
    e.stopPropagation();
    setActiveMenuId(null);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(p, null, 2));
    const anchor = document.createElement("a");
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", `company_profile_${(p.companyName || "profile").toLowerCase().replace(/\s+/g, "_")}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const handleRename = (e, id) => {
    e.stopPropagation();
    if (!editingName.trim()) return;
    const target = profiles.find((p) => p.id === id);
    if (target) {
      localDB.saveCompanyProfileById({ ...target, companyName: editingName.trim() });
      setEditingId(null);
      setEditingName("");
      setActiveMenuId(null);
      if (onProfilesUpdated) onProfilesUpdated();
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-[#F8FAFC] flex flex-col animate-in slide-in-from-right duration-250 font-sans overflow-hidden">
      
      {/* 📱 HEADER BAR */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200/80 px-4 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-slate-100/80 hover:bg-slate-200/70 text-slate-700 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">Company Profiles</h2>
            <p className="text-xs text-slate-500 font-medium">Manage all your brands, franchises and organizations</p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus size={15} /> <span className="hidden sm:inline">+ Create Company</span>
        </button>
      </div>

      {/* 🍞 TOAST BANNER */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
          <Check size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 🏢 MAIN PROFILES LIST CONTAINER */}
      <div className="flex-1 overflow-y-auto p-4 max-w-3xl mx-auto w-full space-y-4">
        
        {/* Helper Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-5 text-white shadow-lg shadow-blue-600/15 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <Building2 size={22} className="text-blue-100" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Multi-Organization Workspaces</h3>
              <p className="text-xs text-blue-100 mt-0.5 font-medium">Tap any company card to open its dedicated workspace settings.</p>
            </div>
          </div>
        </div>

        {/* List of Companies */}
        <div className="space-y-3">
          {profiles.map((p) => {
            const isDefault = !!p.isDefault;
            const isMenuOpen = activeMenuId === p.id;
            const name = p.companyName || "Unnamed Company";

            return (
              <div
                key={p.id}
                onClick={() => handleSelectCompany(p)}
                className={`relative rounded-3xl p-4 sm:p-5 border shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] transition-all cursor-pointer group ${
                  isDefault
                    ? "bg-gradient-to-r from-emerald-50/60 via-white to-white border-emerald-300 ring-2 ring-emerald-100"
                    : "bg-white border-slate-200/80 hover:border-blue-300"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  
                  {/* Left: Logo & Company Name */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                      {p.companyLogo ? (
                        <img src={p.companyLogo} alt={name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <Building2 size={22} className="text-slate-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      {editingId === p.id ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="px-3 py-1 bg-white border border-blue-500 rounded-xl text-xs font-bold text-slate-900 outline-none w-full"
                            autoFocus
                          />
                          <button
                            onClick={(e) => handleRename(e, p.id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-xl cursor-pointer"
                          >
                            <Check size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <h4 className="font-black text-slate-900 text-xs sm:text-sm tracking-tight break-words line-clamp-2 leading-snug min-w-0">
                            {name}
                          </h4>
                          {isDefault && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 border border-emerald-300 text-[10px] font-black uppercase shrink-0">
                              <Star size={10} className="fill-emerald-600 text-emerald-600" /> DEFAULT
                            </span>
                          )}
                        </div>
                      )}

                      <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                        {p.companyEmail || p.email || p.companyPhone || p.phone || "No contact info saved"}
                      </p>
                    </div>
                  </div>

                  {/* Right Actions & Menu */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(isMenuOpen ? null : p.id);
                      }}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                      title="More Options"
                    >
                      <MoreVertical size={18} />
                    </button>

                    <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 flex items-center justify-center transition-all">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>

                {/* Dropdown Options Popover Menu */}
                {isMenuOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-4 top-14 z-30 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 min-w-[170px] space-y-1 animate-in zoom-in-95 duration-150"
                  >
                    {!isDefault ? (
                      <button
                        onClick={(e) => handleSetDefault(e, p.id)}
                        className="w-full px-3 py-2 text-left text-xs font-extrabold text-emerald-600 hover:bg-emerald-50 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Star size={14} className="fill-emerald-600" /> Set as Default
                      </button>
                    ) : (
                      <div className="px-3 py-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 rounded-xl flex items-center gap-2">
                        <Check size={14} /> Active Default
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(p.id);
                        setEditingName(name);
                        setActiveMenuId(null);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Edit2 size={14} /> Rename Company
                    </button>
                    <button
                      onClick={(e) => handleDuplicate(e, p.id)}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Copy size={14} /> Duplicate Company
                    </button>
                    <button
                      onClick={(e) => handleExportSingle(e, p)}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Download size={14} /> Export Company
                    </button>
                    {!isDefault && (
                      <button
                        onClick={(e) => handleDelete(e, p.id, name, isDefault)}
                        className="w-full px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 transition-colors cursor-pointer border-t border-slate-100 mt-1"
                      >
                        <Trash2 size={14} /> Delete Company
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Large Bottom Create Button */}
        <div className="pt-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full py-4 bg-white hover:bg-blue-50/50 border-2 border-dashed border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-700 font-extrabold text-xs uppercase tracking-wider rounded-3xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 shadow-2xs"
          >
            <Plus size={16} /> + Create New Company Profile
          </button>
        </div>
      </div>

      <CreateCompanyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={(created) => {
          setIsCreateModalOpen(false);
          if (onProfilesUpdated) onProfilesUpdated();
          if (created && created.id) {
            handleSelectCompany(created);
          }
        }}
      />
    </div>
  );
}
