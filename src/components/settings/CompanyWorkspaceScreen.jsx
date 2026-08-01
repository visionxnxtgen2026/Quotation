import React, { useState, useEffect } from "react";
import MobileHeader from "../mobile/MobileHeader";
import SettingsCard from "../mobile/SettingsCard";
import CloudStorageSettingsCard from "./CloudStorageSettingsCard";
import { MobileInput } from "../mobile/MobileFormCard";
import { localDB } from "../../utils/localDB";
import { triggerAutoSync } from "../../utils/googleDriveProvider";
import {
  Building2, Landmark, FileCheck, FileText, Cloud, Settings2, CheckCircle2, Save,
  ArrowLeft, Star, Image as ImageIcon, Plus, Trash2, IndianRupee, ShieldCheck
} from "lucide-react";

/**
 * 🏢 CompanyWorkspaceScreen Component
 * Independent workspace management view for a specific company profile.
 */
export default function CompanyWorkspaceScreen({ profileId, onBack, onSaved }) {
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "info" | "bank" | "signature" | "templates" | "cloud" | "preferences"
  
  const [profile, setProfile] = useState(() => {
    const list = localDB.getCompanyProfiles();
    return list.find(p => p.id === profileId) || localDB.getActiveCompanyProfile();
  });

  const [form, setForm] = useState({
    id: profile?.id || "",
    companyLogo: profile?.companyLogo || "",
    companyName: profile?.companyName || "",
    companyTagline: profile?.companyTagline || profile?.tagline || "",
    email: profile?.companyEmail || profile?.email || "",
    phone: profile?.companyPhone || profile?.phone || "",
    altPhone: profile?.companyAltPhone || profile?.altPhone || "",
    website: profile?.website || "",
    address: profile?.companyAddress || profile?.address || "",
    city: profile?.city || "",
    state: profile?.state || "",
    pincode: profile?.pincode || "",
    country: profile?.country || "India",
    gstNo: profile?.gstNo || "",
    
    // Banking
    bankName: profile?.bankDetails?.bankName || "",
    accountHolder: profile?.bankDetails?.accountHolder || "",
    accountNumber: profile?.bankDetails?.accountNumber || "",
    ifscCode: profile?.bankDetails?.ifscCode || "",
    branch: profile?.branch || profile?.bankDetails?.branch || "",
    upiId: profile?.bankDetails?.upiId || "",
    
    // Signature
    signatoryName: profile?.signature?.name || "",
    designation: profile?.signature?.designation || "",
    signatoryPhone: profile?.signature?.phone || "",
    signatoryEmail: profile?.signature?.email || "",
    signatureImage: profile?.signature?.signatureImage || profile?.companySignature || "",

    // Templates
    coverLetterSubject: profile?.coverLetterSubject || "Quotation for Painting Work",
    coverLetterBody: profile?.coverLetterBody || "",
    defaultDiscount: profile?.defaultDiscount !== undefined ? profile?.defaultDiscount : "0",
    defaultValidity: profile?.defaultValidity || "30 Days from issue date",
    defaultWarranty: profile?.defaultWarranty || "3 Years Warranty",
    defaultPaintBrand: profile?.defaultPaintBrand || "",
    defaultTerms: profile?.defaultTerms || "",
    defaultNotes: profile?.defaultNotes || "",
    defaultExclusions: profile?.defaultExclusions || "",
    
    // Preferences
    currency: profile?.currency || "INR (₹)",
    autoSave: profile?.autoSave !== false,
    autoBackup: profile?.autoBackup !== false,
    isDefault: !!profile?.isDefault
  });

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

  const handleSetAsDefault = () => {
    if (form.id) {
      localDB.setDefaultCompanyProfile(form.id);
      setForm(prev => ({ ...prev, isDefault: true }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleSaveWorkspace = () => {
    const updated = localDB.saveCompanyProfileById({
      id: form.id || `cp_${Date.now()}`,
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
      
      coverLetterSubject: form.coverLetterSubject,
      coverLetterBody: form.coverLetterBody,
      defaultDiscount: form.defaultDiscount,
      defaultValidity: form.defaultValidity,
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
      },
      currency: form.currency,
      autoSave: form.autoSave,
      autoBackup: form.autoBackup,
      isDefault: form.isDefault
    });

    triggerAutoSync("save");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    if (onSaved) onSaved(updated);
  };

  return (
    <div className="fixed inset-0 z-[90] bg-[#F8FAFC] flex flex-col animate-in slide-in-from-right duration-250 font-sans overflow-hidden">
      
      {/* 📱 WORKSPACE HEADER */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200/80 px-4 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-slate-100/80 hover:bg-slate-200/70 text-slate-700 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 p-0.5 flex items-center justify-center shrink-0">
              {form.companyLogo ? (
                <img src={form.companyLogo} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <Building2 size={18} className="text-blue-600" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight truncate">
                  {form.companyName || "Company Workspace"}
                </h2>
                {form.isDefault && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-extrabold uppercase">
                    <Star size={9} className="fill-emerald-600 text-emerald-600" /> Default
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Independent Company Business Workspace</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSaveWorkspace}
          className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer shadow-md transition-all active:scale-95 ${
            saved ? "bg-emerald-600 text-white shadow-emerald-600/20" : "bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700"
          }`}
        >
          {saved ? <CheckCircle2 size={15} /> : <Save size={15} />}
          <span>{saved ? "Saved" : "Save Workspace"}</span>
        </button>
      </div>

      {/* 🧭 NAVIGATION SECTION TABS */}
      <div className="bg-white border-b border-slate-200/80 px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        {[
          { id: "all", label: "All Sections", icon: <Building2 size={13} /> },
          { id: "info", label: "1. Company Info", icon: <Building2 size={13} /> },
          { id: "bank", label: "2. Banking", icon: <Landmark size={13} /> },
          { id: "signature", label: "3. Signature", icon: <FileCheck size={13} /> },
          { id: "templates", label: "4. Templates", icon: <FileText size={13} /> },
          { id: "cloud", label: "5. Cloud Backup", icon: <Cloud size={13} /> },
          { id: "preferences", label: "6. Preferences", icon: <Settings2 size={13} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 🏢 MAIN WORKSPACE CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full space-y-4 pb-24">
        
        {/* SECTION 1: Company Information */}
        {(activeTab === "all" || activeTab === "info") && (
          <SettingsCard
            title="1. Company Information"
            subtitle="Branding & contact details for PDF proposal header"
            icon={<Building2 size={18} />}
            iconBg="bg-blue-50 text-blue-600"
          >
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
        )}

        {/* SECTION 2: Banking Information */}
        {(activeTab === "all" || activeTab === "bank") && (
          <SettingsCard
            title="2. Banking Information"
            subtitle="Auto-populates payment details table for this company"
            icon={<Landmark size={18} />}
            iconBg="bg-emerald-50 text-emerald-600"
          >
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
        )}

        {/* SECTION 3: Authorized Signature */}
        {(activeTab === "all" || activeTab === "signature") && (
          <SettingsCard
            title="3. Authorized Signature"
            subtitle="Displays at footer of proposals for this company"
            icon={<FileCheck size={18} />}
            iconBg="bg-amber-50 text-amber-600"
          >
            <div className="flex items-center gap-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 mb-4">
              <div className="w-20 h-14 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-2xs p-1">
                {form.signatureImage
                  ? <img src={form.signatureImage} alt="Signature" className="w-full h-full object-contain" />
                  : <ImageIcon size={20} className="text-slate-300" />}
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-800">Signature Stamp / Image</p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">PNG or JPG image with transparent/white background</p>
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
        )}

        {/* SECTION 4: Default Quotation Templates */}
        {(activeTab === "all" || activeTab === "templates") && (
          <SettingsCard
            title="4. Default Quotation Templates"
            subtitle="Pre-fill cover letter, warranty, scope, exclusions &amp; terms for this company"
            icon={<FileText size={18} />}
            iconBg="bg-purple-50 text-purple-600"
          >
            <div className="space-y-3">
              <MobileInput label="Default Cover Letter Subject" value={form.coverLetterSubject} onChange={e => handleChange("coverLetterSubject", e.target.value)} placeholder="Quotation for Painting Work" />
              <MobileInput label="Default Cover Letter Body" value={form.coverLetterBody} onChange={e => handleChange("coverLetterBody", e.target.value)} rows={3} placeholder="Enter default introduction text..." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MobileInput label="Default Warranty Statement" value={form.defaultWarranty} onChange={e => handleChange("defaultWarranty", e.target.value)} placeholder="3 Years Warranty" />
                <MobileInput label="Default Validity Clause" value={form.defaultValidity} onChange={e => handleChange("defaultValidity", e.target.value)} placeholder="30 Days from issue date" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MobileInput label="Default Brand Specification" value={form.defaultPaintBrand} onChange={e => handleChange("defaultPaintBrand", e.target.value)} placeholder="Asian Paints Royale / Dulux Silk" />
                <MobileInput label="Default Discount (%)" value={form.defaultDiscount} onChange={e => handleChange("defaultDiscount", e.target.value)} placeholder="0" />
              </div>
              <MobileInput label="Default Scope of Work" value={form.defaultNotes} onChange={e => handleChange("defaultNotes", e.target.value)} rows={3} />
              <MobileInput label="Default Exclusions" value={form.defaultExclusions} onChange={e => handleChange("defaultExclusions", e.target.value)} rows={3} />
              <MobileInput label="Default Terms &amp; Conditions" value={form.defaultTerms} onChange={e => handleChange("defaultTerms", e.target.value)} rows={4} />
            </div>
          </SettingsCard>
        )}

        {/* SECTION 5: Cloud Backup */}
        {(activeTab === "all" || activeTab === "cloud") && (
          <CloudStorageSettingsCard />
        )}

        {/* SECTION 6: Workspace Preferences */}
        {(activeTab === "all" || activeTab === "preferences") && (
          <SettingsCard
            title="6. Workspace Preferences"
            subtitle="Currency unit &amp; proposal formatting settings for this company"
            icon={<Settings2 size={18} />}
            iconBg="bg-blue-50 text-blue-600"
          >
            <div className="space-y-3">
              {/* Currency Selector */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <IndianRupee size={16} className="text-slate-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Workspace Currency</p>
                    <p className="text-[10px] text-slate-500 font-medium">Default pricing unit for proposals</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">₹ INR</span>
              </div>
            </div>
          </SettingsCard>
        )}

      </div>
    </div>
  );
}
