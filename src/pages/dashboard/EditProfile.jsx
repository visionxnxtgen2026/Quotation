import React, { useState, useEffect } from "react";
import MobileHeader from "../../components/mobile/MobileHeader";
import MobileFormCard, { MobileInput } from "../../components/mobile/MobileFormCard";
import { localDB } from "../../utils/localDB";
import {
  Building2, Landmark, ShieldCheck, CheckCircle2, AlertCircle, Save,
  FileText, Image as ImageIcon, Phone, Mail, Globe, MapPin, Tag, FileCheck
} from "lucide-react";

export default function EditProfile({ goBack }) {
  const [isSaved, setIsSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [companyForm, setCompanyForm] = useState({
    companyName: "",
    companyTagline: "",
    companyAddress: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    companyPhone: "",
    companyAltPhone: "",
    companyEmail: "",
    website: "",
    gstNo: "",
    companyLogo: "",
    defaultPaintBrand: "",
    defaultWarranty: "",
    defaultTerms: "",
    defaultNotes: "",
    defaultExclusions: "",
    bankDetails: {
      bankName: "",
      accountHolder: "",
      accountNumber: "",
      ifscCode: "",
      branch: "",
      upiId: ""
    },
    signature: {
      name: "",
      designation: "",
      phone: "",
      email: "",
      signatureImage: ""
    }
  });

  useEffect(() => {
    const profile = localDB.getCompanyProfile();
    if (profile) {
      setCompanyForm({
        companyName: profile.companyName || "",
        companyTagline: profile.companyTagline || "",
        companyAddress: profile.companyAddress || "",
        city: profile.city || "",
        state: profile.state || "",
        pincode: profile.pincode || "",
        country: profile.country || "India",
        companyPhone: profile.companyPhone || "",
        companyAltPhone: profile.companyAltPhone || "",
        companyEmail: profile.companyEmail || "",
        website: profile.website || "",
        gstNo: profile.gstNo || "",
        companyLogo: profile.companyLogo || "",
        defaultPaintBrand: profile.defaultPaintBrand || "",
        defaultWarranty: profile.defaultWarranty || "",
        defaultTerms: profile.defaultTerms || "",
        defaultNotes: profile.defaultNotes || "",
        defaultExclusions: profile.defaultExclusions || "",
        bankDetails: {
          bankName: profile.bankDetails?.bankName || "",
          accountHolder: profile.bankDetails?.accountHolder || "",
          accountNumber: profile.bankDetails?.accountNumber || "",
          ifscCode: profile.bankDetails?.ifscCode || "",
          branch: profile.bankDetails?.branch || "",
          upiId: profile.bankDetails?.upiId || ""
        },
        signature: {
          name: profile.signature?.name || "",
          designation: profile.signature?.designation || "",
          phone: profile.signature?.phone || "",
          email: profile.signature?.email || "",
          signatureImage: profile.signature?.signatureImage || profile.companySignature || ""
        }
      });
    }
  }, []);

  const handleChange = (field, value) => {
    setCompanyForm(prev => ({ ...prev, [field]: value }));
  };

  const handleBankChange = (field, value) => {
    setCompanyForm(prev => ({
      ...prev,
      bankDetails: { ...prev.bankDetails, [field]: value }
    }));
  };

  const handleSignatureChange = (field, value) => {
    setCompanyForm(prev => ({
      ...prev,
      signature: { ...prev.signature, [field]: value }
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyForm(prev => ({ ...prev, companyLogo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyForm(prev => ({
          ...prev,
          signature: { ...prev.signature, signatureImage: reader.result }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!companyForm.companyName.trim()) {
      setErrorMsg("Company Name is required.");
      return;
    }

    try {
      localDB.saveCompanyProfile(companyForm);
      setIsSaved(true);
      setErrorMsg("");
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error("Save Company Settings Error:", err);
      setErrorMsg("Failed to save company settings.");
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen font-sans pb-32">
      <MobileHeader
        title="Company Settings"
        onBack={goBack}
        right={
          <button
            onClick={handleSave}
            className="px-3.5 py-1.5 bg-blue-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Save size={15} /> Save
          </button>
        }
      />

      {isSaved && (
        <div className="fixed top-16 left-4 right-4 z-[100] bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 size={16} />
          <span className="flex-1">✓ Company Settings Saved Successfully</span>
        </div>
      )}

      {errorMsg && (
        <div className="fixed top-16 left-4 right-4 z-[100] bg-red-600 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3 text-xs font-semibold animate-in fade-in">
          <AlertCircle size={16} />
          <span className="flex-1">{errorMsg}</span>
        </div>
      )}

      <div className="px-4 pt-3 space-y-4">
        {/* 1. Company Identity Card */}
        <MobileFormCard title="1. Company Identity" icon={<Building2 size={18} />}>
          <div className="space-y-3">
            {/* Logo Preview & Upload */}
            <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs p-1">
                {companyForm.companyLogo ? (
                  <img src={companyForm.companyLogo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <ImageIcon size={24} className="text-slate-300" />
                )}
              </div>
              <div className="flex-1">
                <label className="text-xs font-extrabold text-blue-600 hover:text-blue-700 cursor-pointer block">
                  Upload Company Logo
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">PNG, JPG or SVG (Max 2MB)</p>
              </div>
            </div>

            <MobileInput
              label="Company Name *"
              value={companyForm.companyName}
              onChange={e => handleChange("companyName", e.target.value)}
              placeholder="e.g. VisionX Enterprises"
            />
            <MobileInput
              label="Tagline / Slogan"
              value={companyForm.companyTagline}
              onChange={e => handleChange("companyTagline", e.target.value)}
              placeholder="e.g. Enterprise Painting & Decorating"
            />
            <div className="grid grid-cols-2 gap-3">
              <MobileInput
                label="Contact Email"
                type="email"
                value={companyForm.companyEmail}
                onChange={e => handleChange("companyEmail", e.target.value)}
                placeholder="contact@company.com"
              />
              <MobileInput
                label="Phone Number"
                type="tel"
                value={companyForm.companyPhone}
                onChange={e => handleChange("companyPhone", e.target.value)}
                placeholder="+91 00000 00000"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MobileInput
                label="Website"
                value={companyForm.website}
                onChange={e => handleChange("website", e.target.value)}
                placeholder="www.company.com"
              />
              <MobileInput
                label="GST Number"
                value={companyForm.gstNo}
                onChange={e => handleChange("gstNo", e.target.value)}
                placeholder="33ABCDE1234F1Z5"
              />
            </div>
            <MobileInput
              label="Company Address"
              rows={2}
              value={companyForm.companyAddress}
              onChange={e => handleChange("companyAddress", e.target.value)}
              placeholder="Full registered address"
            />
          </div>
        </MobileFormCard>

        {/* 2. Bank Details Card */}
        <MobileFormCard title="2. Bank Details" icon={<Landmark size={18} />}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <MobileInput
                label="Bank Name"
                value={companyForm.bankDetails.bankName}
                onChange={e => handleBankChange("bankName", e.target.value)}
                placeholder="e.g. HDFC Bank"
              />
              <MobileInput
                label="Account Holder Name"
                value={companyForm.bankDetails.accountHolder}
                onChange={e => handleBankChange("accountHolder", e.target.value)}
                placeholder="Account Name"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MobileInput
                label="Account Number"
                value={companyForm.bankDetails.accountNumber}
                onChange={e => handleBankChange("accountNumber", e.target.value)}
                placeholder="e.g. 50100234567890"
              />
              <MobileInput
                label="IFSC Code"
                value={companyForm.bankDetails.ifscCode}
                onChange={e => handleBankChange("ifscCode", e.target.value)}
                placeholder="e.g. HDFC0001234"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MobileInput
                label="Branch Name"
                value={companyForm.bankDetails.branch}
                onChange={e => handleBankChange("branch", e.target.value)}
                placeholder="e.g. Main Business Branch"
              />
              <MobileInput
                label="UPI ID"
                value={companyForm.bankDetails.upiId}
                onChange={e => handleBankChange("upiId", e.target.value)}
                placeholder="e.g. VisionX@hdfcbank"
              />
            </div>
          </div>
        </MobileFormCard>

        {/* 3. Authorized Signature Card */}
        <MobileFormCard title="3. Authorized Signature" icon={<FileCheck size={18} />}>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="w-16 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs p-1">
                {companyForm.signature.signatureImage ? (
                  <img src={companyForm.signature.signatureImage} alt="Signature" className="w-full h-full object-contain" />
                ) : (
                  <ImageIcon size={20} className="text-slate-300" />
                )}
              </div>
              <div className="flex-1">
                <label className="text-xs font-extrabold text-amber-600 hover:text-amber-700 cursor-pointer block">
                  Upload Signature Image
                  <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
                </label>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">PNG or JPG signature file</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MobileInput
                label="Signatory Name"
                value={companyForm.signature.name}
                onChange={e => handleSignatureChange("name", e.target.value)}
                placeholder="e.g. Rajesh Kumar"
              />
              <MobileInput
                label="Designation"
                value={companyForm.signature.designation}
                onChange={e => handleSignatureChange("designation", e.target.value)}
                placeholder="e.g. Project Director"
              />
            </div>
          </div>
        </MobileFormCard>

        {/* 4. Default Specifications Card */}
        <MobileFormCard title="4. Default Reusable Templates" icon={<ShieldCheck size={18} />}>
          <div className="space-y-3">
            <MobileInput
              label="Default Brand Specification"
              value={companyForm.defaultPaintBrand}
              onChange={e => handleChange("defaultPaintBrand", e.target.value)}
              placeholder="e.g. Asian Paints Royale / Berger Silk"
            />
            <MobileInput
              label="Default Warranty"
              rows={2}
              value={companyForm.defaultWarranty}
              onChange={e => handleChange("defaultWarranty", e.target.value)}
              placeholder="Default warranty clause..."
            />
            <MobileInput
              label="Default Scope of Work"
              rows={3}
              value={companyForm.defaultNotes}
              onChange={e => handleChange("defaultNotes", e.target.value)}
              placeholder="Default scope notes..."
            />
            <MobileInput
              label="Default Exclusions"
              rows={3}
              value={companyForm.defaultExclusions}
              onChange={e => handleChange("defaultExclusions", e.target.value)}
              placeholder="Default exclusions..."
            />
            <MobileInput
              label="Default Terms & Conditions"
              rows={4}
              value={companyForm.defaultTerms}
              onChange={e => handleChange("defaultTerms", e.target.value)}
              placeholder="Default terms..."
            />
          </div>
        </MobileFormCard>

        {/* Save Action Button */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-98 transition-all cursor-pointer"
          >
            <Save size={18} /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}