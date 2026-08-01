import React, { useState, useEffect } from "react";
import MobileHeader from "../../components/mobile/MobileHeader";
import SettingsCard from "../../components/mobile/SettingsCard";
import CloudStorageSettingsCard from "../../components/settings/CloudStorageSettingsCard";
import { MobileInput } from "../../components/mobile/MobileFormCard";
import DeleteAccountModal from "../../components/settings/DeleteAccountModal";
import CreateCompanyModal from "../../components/settings/CreateCompanyModal";
import ManageCompaniesModal from "../../components/settings/ManageCompaniesModal";
import { localDB } from "../../utils/localDB";
import { triggerAutoSync } from "../../utils/googleDriveProvider";
import {
  Building2, FileText, Landmark, CheckCircle2, Save,
  AlertTriangle, Trash2, Image as ImageIcon, Shield, ScrollText, X,
  ChevronRight, Mail, LifeBuoy, Download, Upload, Info, FileCheck, Star, Plus, Settings2
} from "lucide-react";

export default function Settings({
  goToDashboard, goToCreate, goToPreview, goToExport,
  goToSettings, goToEditProfile, goToStorage, goToHelp
}) {
  const [saved, setSaved] = useState(false);
  const [autoSaveDraft, setAutoSaveDraft] = useState(() => localStorage.getItem("autoSaveDraftEnabled") !== "false");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);

  const [form, setForm] = useState({
    id: "", companyLogo: "", companyName: "", companyTagline: "",
    email: "", phone: "", altPhone: "", website: "", address: "",
    city: "", state: "", pincode: "", country: "India", gstNo: "",
    defaultWarranty: "", defaultPaintBrand: "", defaultTerms: "", defaultNotes: "", defaultExclusions: "",
    bankName: "", accountHolder: "", accountNumber: "", ifscCode: "", branch: "", upiId: "",
    signatoryName: "", designation: "", signatoryPhone: "", signatoryEmail: "", signatureImage: ""
  });

  const refreshProfiles = () => {
    const list = localDB.getCompanyProfiles();
    const active = localDB.getActiveCompanyProfile();
    setProfiles(list);
    setActiveProfile(active);
    loadProfileIntoForm(active);
  };

  const loadProfileIntoForm = (prof) => {
    if (!prof) return;
    setForm({
      id: prof.id || "",
      companyLogo: prof.companyLogo || "",
      companyName: prof.companyName || "",
      companyTagline: prof.companyTagline || prof.tagline || "",
      email: prof.companyEmail || prof.email || "",
      phone: prof.companyPhone || prof.phone || "",
      altPhone: prof.companyAltPhone || prof.altPhone || "",
      website: prof.website || "",
      address: prof.companyAddress || prof.address || "",
      city: prof.city || "",
      state: prof.state || "",
      pincode: prof.pincode || "",
      country: prof.country || "India",
      gstNo: prof.gstNo || "",
      defaultWarranty: prof.defaultWarranty || "3 Years Warranty",
      defaultPaintBrand: prof.defaultPaintBrand || "",
      defaultTerms: prof.defaultTerms || "",
      defaultNotes: prof.defaultNotes || "",
      defaultExclusions: prof.defaultExclusions || "",
      bankName: prof.bankDetails?.bankName || "",
      accountHolder: prof.bankDetails?.accountHolder || "",
      accountNumber: prof.bankDetails?.accountNumber || "",
      ifscCode: prof.bankDetails?.ifscCode || "",
      branch: prof.branch || prof.bankDetails?.branch || "",
      upiId: prof.bankDetails?.upiId || "",
      signatoryName: prof.signature?.name || "",
      designation: prof.signature?.designation || "",
      signatoryPhone: prof.signature?.phone || "",
      signatoryEmail: prof.signature?.email || "",
      signatureImage: prof.signature?.signatureImage || prof.companySignature || ""
    });
  };

  useEffect(() => {
    refreshProfiles();
    window.addEventListener("quotationDataUpdated", refreshProfiles);
    return () => window.removeEventListener("quotationDataUpdated", refreshProfiles);
  }, []);

  const handleSelectCompany = (e) => {
    const targetId = e.target.value;
    localDB.setActiveCompanyProfileId(targetId);
    refreshProfiles();
  };

  const handleSetCurrentAsDefault = () => {
    if (activeProfile && activeProfile.id) {
      localDB.setDefaultCompanyProfile(activeProfile.id);
      refreshProfiles();
    }
  };

  const handleChange = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm(prev => ({ ...prev, companyLogo: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm(prev => ({ ...prev, signatureImage: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const activeProf = localDB.getActiveCompanyProfile();
    localDB.saveCompanyProfileById({
      id: activeProf.id || form.id,
      companyLogo: form.companyLogo,
      companyName: form.companyName,
      companyTagline: form.companyTagline,
      companyEmail: form.email,
      companyPhone: form.phone,
      companyAltPhone: form.altPhone,
      website: form.website,
      companyAddress: form.address,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      country: form.country,
      gstNo: form.gstNo,
      defaultWarranty: form.defaultWarranty,
      defaultPaintBrand: form.defaultPaintBrand,
      defaultTerms: form.defaultTerms,
      defaultNotes: form.defaultNotes,
      defaultExclusions: form.defaultExclusions,
      bankDetails: {
        bankName: form.bankName,
        accountHolder: form.accountHolder,
        accountNumber: form.accountNumber,
        ifscCode: form.ifscCode,
        branch: form.branch,
        upiId: form.upiId
      },
      signature: {
        name: form.signatoryName,
        designation: form.designation,
        phone: form.signatoryPhone,
        email: form.signatoryEmail,
        signatureImage: form.signatureImage
      }
    });

    triggerAutoSync("save");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    refreshProfiles();
  };

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

  const handleExportJSON = () => { localDB.exportBackupJSON(); };
  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (localDB.importBackupJSON(ev.target.result)) alert("Backup restored!");
      else alert("Invalid backup file.");
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans pb-24 relative">
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={executeDeleteAccount}
        isLoading={isDeleting}
      />

      <CreateCompanyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={() => refreshProfiles()}
      />

      <ManageCompaniesModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        onOpenCreate={() => setIsCreateModalOpen(true)}
        onProfilesUpdated={() => refreshProfiles()}
      />

      <MobileHeader
        title="Company Settings"
        onBack={goToDashboard}
        right={
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl cursor-pointer shadow-xs active:scale-95 transition-all ${
              saved ? "bg-emerald-600 text-white" : "bg-blue-600 text-white"
            }`}
          >
            {saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
            {saved ? "Saved" : "Save"}
          </button>
        }
      />

      <div className="w-full px-4 py-4 space-y-4 max-w-4xl mx-auto">
        
        {/* 1. Company Profiles Card */}
        <SettingsCard
          title="Company Profiles"
          subtitle="Manage multiple company, brand or franchise profiles"
          icon={<Building2 size={18} />}
          iconBg="bg-blue-50 text-blue-600"
        >
          {/* 🏢 MULTI-COMPANY SELECTOR BAR */}
          <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 mb-5 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                Current Active Company:
                {activeProfile?.isDefault && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                    <Star size={10} className="fill-emerald-600 text-emerald-600" /> Default
                  </span>
                )}
              </label>

              <div className="flex items-center gap-1.5">
                {!activeProfile?.isDefault && (
                  <button
                    onClick={handleSetCurrentAsDefault}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                    title="Set this profile as the default for new quotations"
                  >
                    <Star size={12} /> Set Default
                  </button>
                )}
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                >
                  <Plus size={13} /> Create New
                </button>
                <button
                  onClick={() => setIsManageModalOpen(true)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                >
                  <Settings2 size={13} /> Manage All
                </button>
              </div>
            </div>

            {/* Select Dropdown */}
            <select
              value={activeProfile?.id || ""}
              onChange={handleSelectCompany}
              className="w-full h-11 px-3.5 bg-white border border-slate-200/90 rounded-xl font-extrabold text-xs text-slate-900 outline-none focus:border-blue-600 shadow-2xs transition-all cursor-pointer"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.companyName || "Unnamed Company"} {p.isDefault ? "⭐ (Default)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 mb-4">
            <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-2xs p-1">
              {form.companyLogo
                ? <img src={form.companyLogo} alt="Logo" className="w-full h-full object-contain" />
                : <ImageIcon size={22} className="text-slate-300" />}
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-800">Company Logo</p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">Displays on top header of PDF preview &amp; export</p>
              <label className="inline-block mt-1 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer">
                Upload Logo
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <MobileInput label="Company Name" value={form.companyName} onChange={e => handleChange("companyName", e.target.value)} placeholder="e.g. VisionX Technologies" />
            <MobileInput label="Tagline / Slogan" value={form.companyTagline} onChange={e => handleChange("companyTagline", e.target.value)} placeholder="e.g. Premium Painting & Interior Solutions" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <MobileInput label="Contact Email" value={form.email} onChange={e => handleChange("email", e.target.value)} placeholder="contact@visionx.com" />
              <MobileInput label="Phone Number" value={form.phone} onChange={e => handleChange("phone", e.target.value)} placeholder="+91 00000 00000" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <MobileInput label="Alternate Phone" value={form.altPhone} onChange={e => handleChange("altPhone", e.target.value)} placeholder="+91 00000 00000" />
              <MobileInput label="Website URL" value={form.website} onChange={e => handleChange("website", e.target.value)} placeholder="www.visionx.com" />
            </div>
            <MobileInput label="GST Number (GSTIN)" value={form.gstNo} onChange={e => handleChange("gstNo", e.target.value)} placeholder="33ABCDE1234F1Z5" />
            <MobileInput label="Street Address" value={form.address} onChange={e => handleChange("address", e.target.value)} placeholder="Full registered office address" rows={2} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MobileInput label="City" value={form.city} onChange={e => handleChange("city", e.target.value)} placeholder="City" />
              <MobileInput label="State" value={form.state} onChange={e => handleChange("state", e.target.value)} placeholder="State" />
              <MobileInput label="PIN Code" value={form.pincode} onChange={e => handleChange("pincode", e.target.value)} placeholder="600001" />
              <MobileInput label="Country" value={form.country} onChange={e => handleChange("country", e.target.value)} placeholder="India" />
            </div>
          </div>
        </SettingsCard>

        {/* ☁️ Cloud Storage (Google Drive Backup & Sync Card) */}
        <CloudStorageSettingsCard />

        {/* 2. Banking & Payment Information */}
        <SettingsCard title="Banking Information" subtitle="Auto-populates payment details table" icon={<Landmark size={18} />} iconBg="bg-emerald-50 text-emerald-600">
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <MobileInput label="Bank Name" value={form.bankName} onChange={e => handleChange("bankName", e.target.value)} placeholder="HDFC Bank" />
              <MobileInput label="Account Holder Name" value={form.accountHolder} onChange={e => handleChange("accountHolder", e.target.value)} placeholder="VisionX Technologies Pvt Ltd" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <MobileInput label="Account Number" value={form.accountNumber} onChange={e => handleChange("accountNumber", e.target.value)} placeholder="50100234567890" />
              <MobileInput label="IFSC Code" value={form.ifscCode} onChange={e => handleChange("ifscCode", e.target.value)} placeholder="HDFC0001234" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <MobileInput label="Branch Name" value={form.branch} onChange={e => handleChange("branch", e.target.value)} placeholder="Main City Branch" />
              <MobileInput label="UPI ID" value={form.upiId} onChange={e => handleChange("upiId", e.target.value)} placeholder="visionx@hdfcbank" />
            </div>
          </div>
        </SettingsCard>

        {/* 3. Signature & Signatory Information */}
        <SettingsCard title="Authorized Signature" subtitle="Displays at footer of corporate proposals" icon={<FileCheck size={18} />} iconBg="bg-amber-50 text-amber-600">
          <div className="flex items-center gap-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 mb-4">
            <div className="w-20 h-14 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-2xs p-1">
              {form.signatureImage
                ? <img src={form.signatureImage} alt="Signature" className="w-full h-full object-contain" />
                : <ImageIcon size={20} className="text-slate-300" />}
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-800">Signature Stamp / Image</p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">PNG or JPG signature image with transparent/white background</p>
              <label className="inline-block mt-1 text-xs font-bold text-amber-600 hover:text-amber-700 cursor-pointer">
                Upload Signature
                <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <MobileInput label="Authorized Signatory Name" value={form.signatoryName} onChange={e => handleChange("signatoryName", e.target.value)} placeholder="e.g. Rajesh Kumar" />
            <MobileInput label="Designation" value={form.designation} onChange={e => handleChange("designation", e.target.value)} placeholder="e.g. Managing Director" />
          </div>
        </SettingsCard>

        {/* 4. Default Text Templates */}
        <SettingsCard title="Default Reusable Templates" subtitle="Pre-fill warranty, scope, exclusions &amp; terms" icon={<FileText size={18} />} iconBg="bg-purple-50 text-purple-600">
          <div className="space-y-3">
            <MobileInput label="Default Warranty Statement" value={form.defaultWarranty} onChange={e => handleChange("defaultWarranty", e.target.value)} placeholder="12 Years Workmanship Warranty" />
            <MobileInput label="Default Brand Specification" value={form.defaultPaintBrand} onChange={e => handleChange("defaultPaintBrand", e.target.value)} placeholder="Asian Paints Royale / Berger Silk" />
            <MobileInput label="Default Scope of Work" value={form.defaultNotes} onChange={e => handleChange("defaultNotes", e.target.value)} rows={3} />
            <MobileInput label="Default Exclusions" value={form.defaultExclusions} onChange={e => handleChange("defaultExclusions", e.target.value)} rows={3} />
            <MobileInput label="Default Terms &amp; Conditions" value={form.defaultTerms} onChange={e => handleChange("defaultTerms", e.target.value)} rows={4} />
          </div>
        </SettingsCard>

        {/* 5. Application Preferences */}
        <SettingsCard title="Application Preferences" subtitle="Draft &amp; saving behaviour" icon={<Save size={18} />} iconBg="bg-blue-50 text-blue-600">
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
        </SettingsCard>

        {/* 6. Backup & Restore */}
        <SettingsCard title="Backup &amp; Restore" subtitle="Data migration tools" icon={<Download size={18} />} iconBg="bg-amber-50 text-amber-600">
          <div className="space-y-3">
            <button onClick={handleExportJSON} className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs hover:bg-slate-800 transition-colors">
              <Download size={14} /> Export Backup JSON
            </button>
            <label className="w-full h-12 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer text-center hover:bg-emerald-700 transition-colors">
              <Upload size={14} /> Restore Backup JSON
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>
          </div>
        </SettingsCard>

        {/* 7. Danger Zone */}
        <SettingsCard title="Danger Zone" subtitle="Reset application data" icon={<Trash2 size={18} />} iconBg="bg-red-50 text-red-600">
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="w-full h-12 rounded-xl bg-red-50 text-red-600 font-bold text-xs border border-red-200 flex items-center justify-center gap-2 cursor-pointer hover:bg-red-100 transition-colors"
          >
            <Trash2 size={14} /> Clear All Local Data
          </button>
        </SettingsCard>
      </div>
    </div>
  );
}