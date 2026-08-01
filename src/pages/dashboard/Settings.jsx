import React, { useState, useEffect } from "react";
import MobileHeader from "../../components/mobile/MobileHeader";
import SettingsCard from "../../components/mobile/SettingsCard";
import { MobileInput } from "../../components/mobile/MobileFormCard";
import DeleteAccountModal from "../../components/settings/DeleteAccountModal";
import { localDB } from "../../utils/localDB";
import {
  Building2, FileText, Landmark, CheckCircle2, Save,
  AlertTriangle, Trash2, Image as ImageIcon, Shield, ScrollText, X,
  ChevronRight, Mail, LifeBuoy, Download, Upload, Info, FileCheck
} from "lucide-react";

export default function Settings({
  goToDashboard, goToCreate, goToPreview, goToExport,
  goToSettings, goToEditProfile, goToStorage, goToHelp
}) {
  const [saved, setSaved] = useState(false);
  const [autoSaveDraft, setAutoSaveDraft] = useState(() => localStorage.getItem("autoSaveDraftEnabled") !== "false");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const [form, setForm] = useState({
    companyLogo: "", companyName: "", companyTagline: "",
    email: "", phone: "", altPhone: "", website: "", address: "",
    city: "", state: "", pincode: "", country: "India", gstNo: "",
    defaultWarranty: "", defaultPaintBrand: "", defaultTerms: "", defaultNotes: "", defaultExclusions: "",
    bankName: "", accountHolder: "", accountNumber: "", ifscCode: "", branch: "", upiId: "",
    signatoryName: "", designation: "", signatoryPhone: "", signatoryEmail: "", signatureImage: ""
  });

  useEffect(() => {
    const profile = localDB.getCompanyProfile();
    if (profile) {
      setForm(prev => ({
        ...prev,
        companyLogo: profile.companyLogo || "",
        companyName: profile.companyName || "",
        companyTagline: profile.companyTagline || "",
        email: profile.companyEmail || profile.email || "",
        phone: profile.companyPhone || profile.phone || "",
        altPhone: profile.companyAltPhone || "",
        website: profile.website || "",
        address: profile.companyAddress || profile.address || "",
        city: profile.city || "",
        state: profile.state || "",
        pincode: profile.pincode || "",
        country: profile.country || "India",
        gstNo: profile.gstNo || "",
        defaultWarranty: profile.defaultWarranty || "12 Years Workmanship Warranty",
        defaultPaintBrand: profile.defaultPaintBrand || "Asian Paints Royale / Berger Silk",
        defaultTerms: profile.defaultTerms || "1. Quotation valid for 30 days.\n2. Payment terms: 50% advance, 30% mid-work, 20% completion.\n3. Taxes extra as applicable.",
        defaultNotes: profile.defaultNotes || "Thank you for choosing our services. We are committed to delivering quality workmanship within agreed timelines.",
        defaultExclusions: profile.defaultExclusions || "1. Major civil structural repairs.\n2. Electrical and plumbing modifications.\n3. High-rise external scaffolding above 15ft unless specified.",
        bankName: profile.bankDetails?.bankName || "",
        accountHolder: profile.bankDetails?.accountHolder || "",
        accountNumber: profile.bankDetails?.accountNumber || "",
        ifscCode: profile.bankDetails?.ifscCode || "",
        branch: profile.bankDetails?.branch || "",
        upiId: profile.bankDetails?.upiId || "",
        signatoryName: profile.signature?.name || "",
        designation: profile.signature?.designation || "",
        signatoryPhone: profile.signature?.phone || "",
        signatoryEmail: profile.signature?.email || "",
        signatureImage: profile.signature?.signatureImage || profile.companySignature || ""
      }));
    }
  }, []);

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
    localDB.saveCompanyProfile({
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
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
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

      <MobileHeader
        title="Company Settings"
        onBack={goToDashboard}
        right={
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl cursor-pointer shadow-xs active:scale-95 transition-all ${saved ? "bg-emerald-600 text-white" : "bg-blue-600 text-white"
              }`}
          >
            {saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
            {saved ? "Saved" : "Save"}
          </button>
        }
      />

      <div className="w-full px-4 py-4 space-y-4 max-w-4xl mx-auto">
        {/* 1. Company Information */}
        <SettingsCard title="Company Information" subtitle="Single source of truth auto-filled on new quotations" icon={<Building2 size={18} />} iconBg="bg-blue-50 text-blue-600">
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
              className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${autoSaveDraft ? "bg-blue-600" : "bg-slate-300"
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