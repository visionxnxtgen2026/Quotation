import React, { useState, useEffect } from "react";
import MobileHeader from "../mobile/MobileHeader";
import SettingsCard from "../mobile/SettingsCard";
import CloudStorageSettingsCard from "./CloudStorageSettingsCard";
import { MobileInput } from "../mobile/MobileFormCard";
import { localDB } from "../../utils/localDB";
import { triggerAutoSync } from "../../utils/googleDriveProvider";
import {
  Building2, Landmark, FileCheck, FileText, Cloud, Settings2, CheckCircle2, Save,
  ArrowLeft, Star, Image as ImageIcon, Plus, Trash2, IndianRupee, ShieldCheck,
  Search, ChevronDown, Check, Sparkles, RefreshCcw, Lock, Key, Shield
} from "lucide-react";

const SUPPORTED_CURRENCIES = [
  { flag: "🇺🇸", name: "US Dollar", code: "USD", symbol: "$" },
  { flag: "🇪🇺", name: "Euro", code: "EUR", symbol: "€" },
  { flag: "🇮🇳", name: "Indian Rupee", code: "INR", symbol: "₹" },
  { flag: "🇬🇧", name: "British Pound", code: "GBP", symbol: "£" },
  { flag: "🇯🇵", name: "Japanese Yen", code: "JPY", symbol: "¥" },
  { flag: "🇨🇳", name: "Chinese Yuan", code: "CNY", symbol: "¥" },
  { flag: "🇨🇦", name: "Canadian Dollar", code: "CAD", symbol: "$" },
  { flag: "🇦🇺", name: "Australian Dollar", code: "AUD", symbol: "$" },
  { flag: "🇸🇬", name: "Singapore Dollar", code: "SGD", symbol: "$" },
  { flag: "🇦🇪", name: "UAE Dirham", code: "AED", symbol: "AED" },
];

const getActiveCurrencyObj = (curVal) => {
  if (!curVal) return SUPPORTED_CURRENCIES[2]; // Default INR
  const upper = String(curVal).toUpperCase();
  const match = SUPPORTED_CURRENCIES.find(c =>
    upper.includes(c.code) || upper.includes(c.name.toUpperCase())
  );
  return match || SUPPORTED_CURRENCIES[2];
};

/**
 * 🏢 CompanyWorkspaceScreen Component — Consolidated Enterprise ERP Profile
 * Manages all 5 core company configuration modules under a single screen.
 */
export default function CompanyWorkspaceScreen({ profileId, onBack, onSaved }) {
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "info" | "bank" | "tax" | "pdf" | "security"
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [currencySearchQuery, setCurrencySearchQuery] = useState("");

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
    panNo: profile?.panNo || "",
    businessType: profile?.businessType || "Private Limited",
    timeZone: profile?.timeZone || "Asia/Kolkata (GMT+5:30)",

    // Banking
    bankName: profile?.bankDetails?.bankName || "",
    accountHolder: profile?.bankDetails?.accountHolder || "",
    accountNumber: profile?.bankDetails?.accountNumber || "",
    ifscCode: profile?.bankDetails?.ifscCode || "",
    branch: profile?.branch || profile?.bankDetails?.branch || "",
    upiId: profile?.bankDetails?.upiId || "",
    qrCodeImage: profile?.bankDetails?.qrCodeImage || "",

    // Tax & Billing
    taxPercentage: profile?.taxPercentage || "18",
    hsnCode: profile?.hsnCode || "998311",
    invoicePrefix: profile?.invoicePrefix || "INV-",
    quotationPrefix: profile?.quotationPrefix || "QTN-",
    numberFormat: profile?.numberFormat || "QTN-2026-0001",
    autoNumbering: profile?.autoNumbering !== false,

    // PDF & Documents
    paperSize: profile?.paperSize || "A4",
    pageMargins: profile?.pageMargins || "Standard (10mm)",
    headerText: profile?.headerText || "",
    footerText: profile?.footerText || "Thank you for doing business with us.",
    defaultFilename: profile?.defaultFilename || "Quotation_<Number>",
    showPageNumbers: profile?.showPageNumbers !== false,
    companyWatermark: profile?.companyWatermark || "",
    pdfQuality: profile?.pdfQuality || "High (300 DPI)",

    // Signature
    signatoryName: profile?.signature?.name || "",
    designation: profile?.signature?.designation || "",
    signatoryPhone: profile?.signature?.phone || "",
    signatoryEmail: profile?.signature?.email || "",
    signatureImage: profile?.signature?.signatureImage || profile?.companySignature || "",

    // Encryption & Permissions
    localEncryption: profile?.localEncryption !== false,
    cloudEncryption: profile?.cloudEncryption !== false,

    // Preferences
    currency: profile?.currency || "INR (₹)",
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

  const handleQRCodeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm(prev => ({ ...prev, qrCodeImage: reader.result }));
      reader.readAsDataURL(file);
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
      panNo: form.panNo,
      businessType: form.businessType,
      timeZone: form.timeZone,

      bankDetails: {
        bankName: form.bankName,
        accountHolder: form.accountHolder,
        accountNumber: form.accountNumber,
        ifscCode: form.ifscCode,
        branch: form.branch,
        upiId: form.upiId,
        qrCodeImage: form.qrCodeImage
      },

      taxPercentage: form.taxPercentage,
      hsnCode: form.hsnCode,
      invoicePrefix: form.invoicePrefix,
      quotationPrefix: form.quotationPrefix,
      numberFormat: form.numberFormat,
      autoNumbering: form.autoNumbering,

      paperSize: form.paperSize,
      pageMargins: form.pageMargins,
      headerText: form.headerText,
      footerText: form.footerText,
      defaultFilename: form.defaultFilename,
      showPageNumbers: form.showPageNumbers,
      companyWatermark: form.companyWatermark,
      pdfQuality: form.pdfQuality,

      signature: {
        name: form.signatoryName,
        designation: form.designation,
        phone: form.signatoryPhone,
        email: form.signatoryEmail,
        signatureImage: form.signatureImage
      },

      localEncryption: form.localEncryption,
      cloudEncryption: form.cloudEncryption,
      currency: form.currency,
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
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200/80 px-3 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-2 shadow-2xs w-full">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 overflow-hidden">
          <button
            onClick={onBack}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-100/80 hover:bg-slate-200/70 text-slate-700 flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 border border-blue-100 p-0.5 flex items-center justify-center shrink-0">
              {form.companyLogo ? (
                <img src={form.companyLogo} alt="Logo" className="w-full h-full object-contain rounded-lg" />
              ) : (
                <Building2 size={18} className="text-blue-600" />
              )}
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                <h2 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight truncate">
                  {form.companyName || "Company Profile"}
                </h2>
                {form.isDefault && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-extrabold uppercase shrink-0">
                    <Star size={9} className="fill-emerald-600 text-emerald-600" /> Default
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">Consolidated Enterprise Configuration</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSaveWorkspace}
          className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer shadow-md transition-all active:scale-95 shrink-0 ${
            saved ? "bg-emerald-600 text-white shadow-emerald-600/20" : "bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700"
          }`}
        >
          {saved ? <CheckCircle2 size={15} /> : <Save size={15} />}
          <span>{saved ? "Saved" : "Save Profile"}</span>
        </button>
      </div>

      {/* 🧭 NAVIGATION SECTION TABS */}
      <div className="bg-white border-b border-slate-200/80 px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        {[
          { id: "all", label: "All Sections", icon: <Building2 size={13} /> },
          { id: "info", label: "🏢 1. Company Info", icon: <Building2 size={13} /> },
          { id: "bank", label: "🏦 2. Bank Details", icon: <Landmark size={13} /> },
          { id: "tax", label: "🧾 3. Tax & Billing", icon: <FileText size={13} /> },
          { id: "pdf", label: "📄 4. PDF & Documents", icon: <FileCheck size={13} /> },
          { id: "security", label: "🔐 5. Encryption & Permissions", icon: <ShieldCheck size={13} /> },
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
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 🏢 MAIN WORKSPACE CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full space-y-4 pb-24">

        {/* 🏢 SECTION 1: Company Information */}
        {(activeTab === "all" || activeTab === "info") && (
          <SettingsCard
            title="🏢 1. Company Information"
            subtitle="Company Name, Logo, Address, Phone, Email, Website, GST & PAN Numbers"
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
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Displays on top header of PDF proposal &amp; export</p>
                <label className="inline-block mt-1 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer">
                  Upload Logo
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <MobileInput label="Company Name" value={form.companyName} onChange={e => handleChange("companyName", e.target.value)} placeholder="e.g. ZERONYX Technologies Pvt Ltd" />
              <MobileInput label="Tagline / Slogan" value={form.companyTagline} onChange={e => handleChange("companyTagline", e.target.value)} placeholder="e.g. Premium Painting & Interior Solutions" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MobileInput label="Contact Email" value={form.email} onChange={e => handleChange("email", e.target.value)} placeholder="contact@VisionX.com" />
                <MobileInput label="Phone Number" value={form.phone} onChange={e => handleChange("phone", e.target.value)} placeholder="+91 00000 00000" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MobileInput label="Alternate Phone" value={form.altPhone} onChange={e => handleChange("altPhone", e.target.value)} placeholder="+91 00000 00000" />
                <MobileInput label="Website URL" value={form.website} onChange={e => handleChange("website", e.target.value)} placeholder="www.VisionX.com" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MobileInput label="GST Number (GSTIN)" value={form.gstNo} onChange={e => handleChange("gstNo", e.target.value)} placeholder="33ABCDE1234F1Z5" />
                <MobileInput label="PAN Number" value={form.panNo} onChange={e => handleChange("panNo", e.target.value)} placeholder="ABCDE1234F" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MobileInput label="Business Type" value={form.businessType} onChange={e => handleChange("businessType", e.target.value)} placeholder="Private Limited / Proprietorship" />
                <MobileInput label="Time Zone" value={form.timeZone} onChange={e => handleChange("timeZone", e.target.value)} placeholder="Asia/Kolkata (GMT+5:30)" />
              </div>
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

        {/* 🏦 SECTION 2: Bank Details */}
        {(activeTab === "all" || activeTab === "bank") && (
          <SettingsCard
            title="🏦 2. Bank Details"
            subtitle="Bank Name, Account Holder, Account Number, IFSC, Branch, UPI ID & QR Code"
            icon={<Landmark size={18} />}
            iconBg="bg-emerald-50 text-emerald-600"
          >
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MobileInput label="Bank Name" value={form.bankName} onChange={e => handleChange("bankName", e.target.value)} placeholder="HDFC Bank" />
                <MobileInput label="Account Holder Name" value={form.accountHolder} onChange={e => handleChange("accountHolder", e.target.value)} placeholder="ZERONYX Technologies Pvt Ltd" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MobileInput label="Account Number" value={form.accountNumber} onChange={e => handleChange("accountNumber", e.target.value)} placeholder="50100234567890" />
                <MobileInput label="IFSC Code" value={form.ifscCode} onChange={e => handleChange("ifscCode", e.target.value)} placeholder="HDFC0001234" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MobileInput label="Branch Name" value={form.branch} onChange={e => handleChange("branch", e.target.value)} placeholder="Main City Branch" />
                <MobileInput label="UPI ID" value={form.upiId} onChange={e => handleChange("upiId", e.target.value)} placeholder="VisionX@hdfcbank" />
              </div>

              <div className="flex items-center gap-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 mt-2">
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-2xs p-1">
                  {form.qrCodeImage
                    ? <img src={form.qrCodeImage} alt="QR Code" className="w-full h-full object-contain" />
                    : <ImageIcon size={20} className="text-slate-300" />}
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-800">Payment QR Code Image</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">Upload UPI payment QR code for invoices</p>
                  <label className="inline-block mt-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer">
                    Upload Payment QR Code
                    <input type="file" accept="image/*" onChange={handleQRCodeUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </SettingsCard>
        )}

        {/* 🧾 SECTION 3: Tax & Billing */}
        {(activeTab === "all" || activeTab === "tax") && (
          <SettingsCard
            title="🧾 3. Tax & Billing"
            subtitle="GSTIN, Tax Percentage, HSN Code, Invoice Prefix, Quotation Prefix & Number Format"
            icon={<FileText size={18} />}
            iconBg="bg-indigo-50 text-indigo-600"
          >
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MobileInput label="Tax Percentage (%)" value={form.taxPercentage} onChange={e => handleChange("taxPercentage", e.target.value)} placeholder="18" />
                <MobileInput label="HSN / SAC Code" value={form.hsnCode} onChange={e => handleChange("hsnCode", e.target.value)} placeholder="998311" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MobileInput label="Invoice Prefix" value={form.invoicePrefix} onChange={e => handleChange("invoicePrefix", e.target.value)} placeholder="INV-" />
                <MobileInput label="Quotation Prefix" value={form.quotationPrefix} onChange={e => handleChange("quotationPrefix", e.target.value)} placeholder="QTN-" />
              </div>
              <MobileInput label="Number Format Template" value={form.numberFormat} onChange={e => handleChange("numberFormat", e.target.value)} placeholder="QTN-2026-0001" />
            </div>
          </SettingsCard>
        )}

        {/* 📄 SECTION 4: PDF & Document Settings */}
        {(activeTab === "all" || activeTab === "pdf") && (
          <SettingsCard
            title="📄 4. PDF & Document Settings"
            subtitle="Paper Size, Margins, Headers, Footers, Watermarks & Digital Signature"
            icon={<FileCheck size={18} />}
            iconBg="bg-purple-50 text-purple-600"
          >
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MobileInput label="Paper Size" value={form.paperSize} onChange={e => handleChange("paperSize", e.target.value)} placeholder="A4" />
                <MobileInput label="Page Margins" value={form.pageMargins} onChange={e => handleChange("pageMargins", e.target.value)} placeholder="Standard (10mm)" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MobileInput label="Default Filename Template" value={form.defaultFilename} onChange={e => handleChange("defaultFilename", e.target.value)} placeholder="Quotation_<Number>" />
                <MobileInput label="PDF Quality" value={form.pdfQuality} onChange={e => handleChange("pdfQuality", e.target.value)} placeholder="High (300 DPI)" />
              </div>
              <MobileInput label="Footer Note / Disclaimer" value={form.footerText} onChange={e => handleChange("footerText", e.target.value)} rows={2} />
              <MobileInput label="Company Watermark Text" value={form.companyWatermark} onChange={e => handleChange("companyWatermark", e.target.value)} placeholder="CONFIDENTIAL" />

              <div className="flex items-center gap-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 mt-2">
                <div className="w-20 h-14 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-2xs p-1">
                  {form.signatureImage
                    ? <img src={form.signatureImage} alt="Signature" className="w-full h-full object-contain" />
                    : <ImageIcon size={20} className="text-slate-300" />}
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-800">Authorized Digital Signature</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">Displays on proposal approval section</p>
                  <label className="inline-block mt-1 text-xs font-bold text-purple-600 hover:text-purple-700 cursor-pointer">
                    Upload Signature Image
                    <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <MobileInput label="Authorized Signatory Name" value={form.signatoryName} onChange={e => handleChange("signatoryName", e.target.value)} placeholder="e.g. Rajesh Kumar" />
                <MobileInput label="Designation" value={form.designation} onChange={e => handleChange("designation", e.target.value)} placeholder="e.g. Managing Director" />
              </div>
            </div>
          </SettingsCard>
        )}

        {/* 🔐 SECTION 5: Encryption & Permissions */}
        {(activeTab === "all" || activeTab === "security") && (
          <SettingsCard
            title="🔐 5. Encryption & Permissions"
            subtitle="Local Database Encryption, Cloud Encryption & Access Control"
            icon={<ShieldCheck size={18} />}
            iconBg="bg-rose-50 text-rose-600"
          >
            <div className="space-y-3">
              <div className="p-3.5 bg-rose-50/60 border border-rose-200/80 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-extrabold text-rose-900">
                  <Lock size={15} /> <span>AES-256 Database Encryption Active</span>
                </div>
                <p className="text-[11px] text-rose-700 font-medium leading-relaxed">
                  All local company profiles, banking secrets, and quotation records are encrypted before storing in local DB cache.
                </p>
              </div>

              <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-extrabold text-blue-900">
                  <Shield size={15} /> <span>Cloud & Export Permission Controls</span>
                </div>
                <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
                  Only authorized users of this company profile can export PDFs, sync with Google Drive, or modify workspace settings.
                </p>
              </div>
            </div>
          </SettingsCard>
        )}

      </div>
    </div>
  );
}
