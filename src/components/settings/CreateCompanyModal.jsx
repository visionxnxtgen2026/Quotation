import React, { useState } from "react";
import { Building2, Upload, X, Check, Image as ImageIcon } from "lucide-react";
import { localDB } from "../../utils/localDB";

/**
 * 🏢 CreateCompanyModal Component
 * Modal for creating a new company profile with Name and optional Logo.
 */
export default function CreateCompanyModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");

  if (!isOpen) return null;

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter a company name.");
      return;
    }

    const created = localDB.createCompanyProfile({
      name: name.trim(),
      logo: logo
    });

    setName("");
    setLogo("");
    if (onCreated) onCreated(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5 border border-slate-100 relative animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Create Company Profile</h3>
              <p className="text-xs text-slate-500 font-medium">Add a new brand or branch profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          {/* Company Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Company Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Salem Paints / Royal Coatings"
              className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all"
              autoFocus
            />
          </div>

          {/* Optional Logo */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Company Logo (Optional)</label>
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                {logo ? (
                  <img src={logo} alt="Company Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <ImageIcon size={20} className="text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <input type="file" id="modalLogoInput" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                <label
                  htmlFor="modalLogoInput"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-400 text-slate-700 text-xs font-bold rounded-xl cursor-pointer shadow-2xs transition-all"
                >
                  <Upload size={13} /> {logo ? "Change Logo" : "Upload Logo"}
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check size={16} /> Create Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
