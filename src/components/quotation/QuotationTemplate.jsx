import React from "react";
import { ShieldCheck, Building2, User, Calendar, MapPin, Award } from "lucide-react";
import { normalizeQuotationData } from "../../utils/quotationMapper";
import { hasVal, hasPositiveNum } from "../theme/templateUtils";

/**
 * 🏛️ QuotationTemplate — Master Dynamic Quotation Component with Distinct Theme Designs
 * 
 * Supports distinct visual themes for:
 * • Corporate Blue (`corporate-blue`)
 * • Minimal White (`minimal-white`)
 * • Construction Heavy (`construction-yellow`)
 * • Luxury Black & Gold (`luxury-gold`)
 * • Paint Contractor (`paint-contractor`)
 * • Modern Gradient (`modern-gradient`)
 * • Executive Proposal (`executive-proposal`)
 * • Invoice Hybrid (`invoice-hybrid`)
 * • Classic Business (`classic-business`)
 * • Creative Studio (`creative-studio`)
 */
export default function QuotationTemplate({ data, templateKey }) {
  if (!data) return null;

  // Normalize data using unified data model
  const quote = normalizeQuotationData(data) || data;

  // Resolve active template ID
  const activeTemplateId = (templateKey || quote.template || quote.selectedTemplate || localStorage.getItem("activeExportTemplate") || "corporate-blue").toLowerCase();

  // Template Name Resolver & Debug Logging
  const templateNamesMap = {
    "corporate-blue": "Corporate Blue",
    "corporateblue": "Corporate Blue",
    "minimal-white": "Minimal White",
    "minimalwhite": "Minimal White",
    "construction-yellow": "Construction Heavy",
    "construction": "Construction Heavy",
    "luxury-gold": "Luxury Black & Gold",
    "luxurygold": "Luxury Black & Gold",
    "paint-contractor": "Paint Contractor",
    "paintcontractor": "Paint Contractor",
    "modern-gradient": "Modern Gradient",
    "moderngradient": "Modern Gradient",
    "executive-proposal": "Executive Proposal",
    "executiveproposal": "Executive Proposal",
    "invoice-hybrid": "Invoice Hybrid",
    "invoicehybrid": "Invoice Hybrid",
    "classic-business": "Classic Business",
    "classicbusiness": "Classic Business",
    "creative-studio": "Creative Studio",
    "creativestudio": "Creative Studio",
  };

  const templateName = templateNamesMap[activeTemplateId] || "Corporate Blue";

  // Requirement: Console log selected template & template rendered
  console.log("Selected Template:", activeTemplateId);
  console.log("Template Rendered:", templateName);

  // Theme Flags
  const isLuxury = activeTemplateId.includes("luxury") || activeTemplateId.includes("obsidian") || activeTemplateId.includes("sovereign") || activeTemplateId.includes("gold");
  const isMinimal = activeTemplateId.includes("minimal") || activeTemplateId.includes("compact");
  const isConstruction = activeTemplateId.includes("construction") || activeTemplateId.includes("heavy") || activeTemplateId.includes("yellow");
  const isPaint = activeTemplateId.includes("paint");
  const isGradient = activeTemplateId.includes("gradient") || activeTemplateId.includes("signature");
  const isExecutive = activeTemplateId.includes("executive");
  const isInvoice = activeTemplateId.includes("invoice");
  const isClassic = activeTemplateId.includes("classic");
  const isCreative = activeTemplateId.includes("creative");
  const isCorporate = activeTemplateId.includes("corporate") || activeTemplateId.includes("blue") || (!isLuxury && !isMinimal && !isConstruction && !isPaint && !isGradient && !isExecutive && !isInvoice && !isClassic && !isCreative);

  // Filter valid non-empty categories
  const rawSections = quote.sections || quote.rateSections || [];
  const validSections = rawSections
    .map((sec) => {
      const items = (sec.items || sec.rows || []).filter(
        (item) => hasVal(item.desc || item.work || item.description || item.name) || hasPositiveNum(item.totalRate || item.total || item.rate)
      );
      return { ...sec, items };
    })
    .filter((sec) => sec.items.length > 0);

  // Metadata
  const hasLogo = hasVal(quote.companyLogo);
  const hasCompanyName = hasVal(quote.companyName);
  const hasTagline = hasVal(quote.companyTagline);
  const hasAddress = hasVal(quote.companyAddress);
  const hasPhone = hasVal(quote.companyPhone);
  const hasEmail = hasVal(quote.companyEmail);
  const hasGst = hasVal(quote.gstNo);
  const hasWebsite = hasVal(quote.website);
  const hasCompanyHeader = hasLogo || hasCompanyName || hasAddress || hasPhone || hasEmail || hasGst || hasTagline;

  const hasDate = hasVal(quote.date);
  const hasRefNo = hasVal(quote.quotationNo || quote.referenceNo);
  const hasExpiry = hasVal(quote.expiryDate);
  const hasRevision = hasVal(quote.revision);
  const hasDocHeader = hasDate || hasRefNo || hasExpiry || hasRevision;

  const hasClientName = hasVal(quote.clientName);
  const hasClientCompany = hasVal(quote.clientCompany);
  const hasClientAddress = hasVal(quote.clientAddress);
  const hasClientPhone = hasVal(quote.clientPhone);
  const hasClientEmail = hasVal(quote.clientEmail);
  const hasClientSection = hasClientName || hasClientCompany || hasClientAddress || hasClientPhone || hasClientEmail;

  const hasProjectName = hasVal(quote.projectName);
  const hasBrand = hasVal(quote.paintBrand);
  const hasSubject = hasVal(quote.subject);
  const hasSiteLoc = hasVal(quote.siteLocation);
  const hasWarranty = hasVal(quote.warranty);
  const hasProjectSection = hasProjectName || hasBrand || hasSubject || hasSiteLoc || hasWarranty;

  const hasSubtotal = hasPositiveNum(quote.subtotal);
  const hasDiscount = hasPositiveNum(quote.discount) || hasPositiveNum(quote.discountAmount) || (typeof quote.discount === "string" && quote.discount !== "0.00" && quote.discount !== "0");
  const hasTax = hasPositiveNum(quote.tax) || hasPositiveNum(quote.taxAmount);
  const hasTransport = hasPositiveNum(quote.transport);
  const hasAddCharges = hasPositiveNum(quote.additionalCharges);
  const hasGrandTotal = hasPositiveNum(quote.grandTotal) || hasSubtotal;

  const hasScope = hasVal(quote.scopeOfWork);
  const hasExclusions = hasVal(quote.exclusions);
  const hasTerms = Array.isArray(quote.terms) && quote.terms.filter(hasVal).length > 0;
  const validTerms = hasTerms ? quote.terms.filter(hasVal) : [];

  const bank = quote.bankDetails || {};
  const hasBankDetails = hasVal(bank.bankName) || hasVal(bank.accNo) || hasVal(bank.accountNumber) || hasVal(bank.ifsc) || hasVal(bank.accHolder) || hasVal(bank.upi);

  const sig = quote.signature || {};
  const hasSignature = hasVal(sig.name) || hasVal(sig.designation) || hasVal(quote.companyName);

  // Dynamic Theme CSS Helpers
  const getContainerClass = () => {
    if (isLuxury) return "bg-[#0F172A] text-slate-100 font-sans p-6 sm:p-10 min-h-[297mm] w-full max-w-[794px] mx-auto relative leading-relaxed text-xs box-border border border-amber-500/30 print:p-6 shadow-2xl";
    if (isConstruction) return "bg-white text-slate-950 font-sans p-6 sm:p-10 min-h-[297mm] w-full max-w-[794px] mx-auto relative leading-relaxed text-xs box-border border-2 border-slate-900 print:p-6 shadow-md";
    return "bg-white text-slate-900 font-sans p-6 sm:p-10 min-h-[297mm] w-full max-w-[794px] mx-auto relative leading-relaxed text-xs box-border print:p-6 shadow-xs print:shadow-none";
  };

  const getHeaderClass = () => {
    if (isLuxury) return "border-b border-amber-500/40 pb-5 mb-5 flex justify-between items-center gap-6";
    if (isConstruction) return "bg-amber-400 text-slate-950 border-2 border-slate-900 rounded-xl p-4 mb-5 flex justify-between items-center gap-6 shadow-sm";
    if (isPaint) return "bg-teal-700 text-white rounded-xl p-5 mb-5 flex justify-between items-center gap-6 shadow-sm";
    if (isGradient) return "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl p-5 mb-5 flex justify-between items-center gap-6 shadow-md";
    if (isExecutive) return "bg-slate-900 text-white rounded-xl p-5 mb-5 flex justify-between items-center gap-6 shadow-md";
    if (isInvoice) return "bg-emerald-800 text-white rounded-xl p-5 mb-5 flex justify-between items-center gap-6 shadow-md";
    if (isCorporate) return "border-b-2 border-blue-900 pb-5 mb-5 flex justify-between items-center gap-6";
    if (isMinimal) return "border-b border-slate-200 pb-5 mb-5 flex justify-between items-center gap-6";
    if (isClassic) return "border-b-4 border-double border-slate-900 pb-5 mb-5 flex justify-between items-center gap-6 text-center";
    return "border-b-2 border-slate-900 pb-5 mb-5 flex justify-between items-center gap-6";
  };

  const getCardClass = () => {
    if (isLuxury) return "bg-slate-900/90 border border-amber-500/30 text-slate-200 rounded-xl p-4 flex flex-col justify-start box-border shadow-2xs";
    if (isConstruction) return "bg-slate-900 text-amber-300 border-2 border-amber-400 rounded-xl p-4 flex flex-col justify-start box-border shadow-2xs";
    if (isPaint) return "bg-teal-50/70 border border-teal-200/90 text-slate-900 rounded-xl p-4 flex flex-col justify-start box-border shadow-2xs";
    if (isGradient) return "bg-indigo-50/70 border border-indigo-200/90 text-slate-900 rounded-xl p-4 flex flex-col justify-start box-border shadow-2xs";
    if (isMinimal) return "bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl p-4 flex flex-col justify-start box-border";
    if (isCorporate) return "bg-blue-50/60 border border-blue-200/80 text-slate-900 rounded-xl p-4 flex flex-col justify-start box-border shadow-2xs";
    return "bg-slate-50/90 border border-slate-200/90 rounded-xl p-4 flex flex-col justify-start box-border shadow-2xs";
  };

  const getCategoryHeaderClass = () => {
    if (isLuxury) return "bg-slate-900 text-amber-400 font-serif font-bold text-xs uppercase tracking-wider px-4 py-2.5 flex items-center justify-between border-b border-amber-500/40";
    if (isConstruction) return "bg-slate-900 text-amber-400 font-black text-xs uppercase tracking-wider px-4 py-2.5 flex items-center justify-between border-l-4 border-amber-400";
    if (isPaint) return "bg-teal-800 text-white font-extrabold text-xs uppercase tracking-wide px-4 py-2.5 flex items-center justify-between";
    if (isGradient) return "bg-gradient-to-r from-indigo-900 to-purple-900 text-white font-extrabold text-xs uppercase tracking-wide px-4 py-2.5 flex items-center justify-between";
    if (isMinimal) return "bg-slate-100 text-slate-900 font-bold text-xs uppercase tracking-wide px-4 py-2 flex items-center justify-between border-b border-slate-200";
    if (isCorporate) return "bg-blue-900 text-white font-extrabold text-xs uppercase tracking-wide px-4 py-2.5 flex items-center justify-between";
    return "bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wide px-4 py-2.5 flex items-center justify-between";
  };

  const getTableHeaderClass = () => {
    if (isLuxury) return "bg-slate-900 text-amber-300 font-extrabold uppercase text-[10px] tracking-wider border-b border-amber-500/30";
    if (isConstruction) return "bg-amber-100 text-amber-950 font-black uppercase text-[10px] tracking-wider border-b-2 border-slate-900";
    if (isPaint) return "bg-teal-50 text-teal-950 font-extrabold uppercase text-[10px] tracking-wider border-b border-teal-200";
    if (isMinimal) return "bg-slate-50 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200";
    if (isCorporate) return "bg-blue-50 text-blue-950 font-extrabold uppercase text-[10px] tracking-wider border-b border-blue-200";
    return "bg-slate-100/90 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200";
  };

  const getGrandTotalClass = () => {
    if (isLuxury) return "p-3.5 bg-amber-500 text-slate-950 flex justify-between items-center font-black";
    if (isConstruction) return "p-3.5 bg-slate-900 text-amber-400 border-2 border-amber-400 flex justify-between items-center font-black";
    if (isPaint) return "p-3.5 bg-teal-900 text-white flex justify-between items-center font-black";
    if (isGradient) return "p-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white flex justify-between items-center font-black";
    if (isCorporate) return "p-3.5 bg-blue-900 text-white flex justify-between items-center font-black";
    return "p-3.5 bg-slate-900 text-white flex justify-between items-center font-black";
  };

  const getGrandTotalAmountClass = () => {
    if (isLuxury) return "font-mono text-base font-black text-slate-950 text-right";
    if (isConstruction) return "font-mono text-base font-black text-amber-400 text-right";
    if (isPaint) return "font-mono text-base font-black text-emerald-400 text-right";
    if (isCorporate) return "font-mono text-base font-black text-emerald-400 text-right";
    return "font-mono text-base font-black text-emerald-400 text-right";
  };

  return (
    <div className={getContainerClass()}>
      
      {/* 🏢 1. HEADER */}
      <div className={getHeaderClass()}>
        {/* Company Identity */}
        <div className="flex items-center gap-5 flex-1 min-w-0">
          {hasLogo && (
            <div className="shrink-0 flex items-center justify-center">
              <img
                src={quote.companyLogo}
                alt="Company Logo"
                style={{ maxHeight: "68px", maxWidth: "170px" }}
                className="object-contain"
              />
            </div>
          )}
          {hasCompanyHeader && (
            <div className="flex-1 min-w-0 space-y-0.5 text-left">
              {hasCompanyName && (
                <h1 className={`text-xl font-black tracking-tight uppercase leading-none ${isLuxury ? "text-amber-400 font-serif" : isConstruction ? "text-slate-950" : (isPaint || isGradient || isExecutive || isInvoice) ? "text-white" : "text-slate-900"}`}>
                  {quote.companyName}
                </h1>
              )}
              {hasTagline && (
                <p className={`text-[11px] font-bold leading-none ${isLuxury ? "text-amber-300" : (isPaint || isGradient || isExecutive || isInvoice) ? "text-slate-200" : "text-blue-600"}`}>
                  {quote.companyTagline}
                </p>
              )}
              {hasAddress && (
                <p className={`text-[11px] font-medium whitespace-pre-line leading-tight mt-0.5 ${(isPaint || isGradient || isExecutive || isInvoice) ? "text-slate-100" : isLuxury ? "text-slate-300" : "text-slate-600"}`}>
                  {quote.companyAddress}
                </p>
              )}
              {(hasPhone || hasEmail) && (
                <p className={`text-[11px] font-medium leading-none ${(isPaint || isGradient || isExecutive || isInvoice) ? "text-slate-100" : isLuxury ? "text-slate-300" : "text-slate-600"}`}>
                  {hasPhone && <span>Ph: {quote.companyPhone}</span>}
                  {hasPhone && hasEmail && <span> • </span>}
                  {hasEmail && <span>Email: {quote.companyEmail}</span>}
                </p>
              )}
              {hasWebsite && <p className={`text-[11px] font-medium leading-none ${(isPaint || isGradient || isExecutive || isInvoice) ? "text-slate-100" : isLuxury ? "text-slate-300" : "text-slate-600"}`}>{quote.website}</p>}
              {hasGst && <p className={`text-[11px] font-extrabold leading-none ${(isPaint || isGradient || isExecutive || isInvoice) ? "text-white" : isLuxury ? "text-amber-300" : "text-slate-900"}`}>GSTIN: {quote.gstNo}</p>}
            </div>
          )}
        </div>

        {/* Document Title & Reference Header */}
        <div className="text-right shrink-0 flex flex-col items-end justify-center space-y-1">
          <h2 className={`text-2xl font-black uppercase tracking-widest leading-none ${isLuxury ? "text-amber-400 font-serif" : (isPaint || isGradient || isExecutive || isInvoice) ? "text-white" : isConstruction ? "text-slate-950" : "text-slate-900"}`}>
            QUOTATION
          </h2>
          {hasDocHeader && (
            <div className={`text-[11px] space-y-0.5 font-medium text-right pt-0.5 ${(isPaint || isGradient || isExecutive || isInvoice) ? "text-slate-100" : isLuxury ? "text-slate-300" : "text-slate-700"}`}>
              {hasRefNo && (
                <p className="leading-tight flex items-center justify-end gap-1.5">
                  <span className="font-bold opacity-80">Ref No:</span>
                  <span className="font-mono font-extrabold">{quote.quotationNo || quote.referenceNo}</span>
                </p>
              )}
              {hasDate && (
                <p className="leading-tight flex items-center justify-end gap-1.5">
                  <span className="font-bold opacity-80">Date:</span>
                  <span className="font-semibold">{quote.date}</span>
                </p>
              )}
              {hasExpiry && (
                <p className="leading-tight flex items-center justify-end gap-1.5">
                  <span className="font-bold opacity-80">Valid Until:</span>
                  <span className="font-semibold">{quote.expiryDate}</span>
                </p>
              )}
              {hasRevision && (
                <p className="leading-tight flex items-center justify-end gap-1.5">
                  <span className="font-bold opacity-80">Revision:</span>
                  <span className="font-semibold">{quote.revision}</span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 👥 2. PREPARED FOR & PROJECT SUMMARY CARDS */}
      {(hasClientSection || hasProjectSection) && (
        <div className="pdf-section-block pdf-client-block pdf-keep-together grid grid-cols-2 gap-5 mb-5 items-stretch">
          {/* Prepared For Card */}
          <div className={getCardClass()}>
            <h3 className={`text-[10px] font-black uppercase tracking-widest mb-2 pb-1 border-b ${isLuxury ? "text-amber-400 border-amber-500/30" : isConstruction ? "text-amber-400 border-slate-800" : "text-slate-500 border-slate-200/80"}`}>
              PREPARED FOR
            </h3>
            <div className="space-y-1 flex-1 text-left">
              {hasClientName && <p className={`font-extrabold text-sm leading-tight ${isLuxury ? "text-amber-300" : isConstruction ? "text-amber-300" : "text-slate-900"}`}>{quote.clientName}</p>}
              {hasClientCompany && <p className={`font-semibold text-xs leading-snug ${isLuxury ? "text-slate-300" : isConstruction ? "text-slate-300" : "text-slate-700"}`}>{quote.clientCompany}</p>}
              {hasClientAddress && <p className={`text-[11px] whitespace-pre-line leading-relaxed mt-1 ${isLuxury ? "text-slate-400" : "text-slate-600"}`}>{quote.clientAddress}</p>}
              {(hasClientPhone || hasClientEmail) && (
                <div className={`text-[11px] font-medium space-y-0.5 mt-2 pt-1.5 border-t ${isLuxury ? "border-amber-500/30 text-slate-300" : "border-slate-200/60 text-slate-600"}`}>
                  {hasClientPhone && <p className="leading-tight">Ph: {quote.clientPhone}</p>}
                  {hasClientEmail && <p className="leading-tight">Email: {quote.clientEmail}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Project Summary Card */}
          <div className={getCardClass()}>
            <h3 className={`text-[10px] font-black uppercase tracking-widest mb-2 pb-1 border-b ${isLuxury ? "text-amber-400 border-amber-500/30" : isConstruction ? "text-amber-400 border-slate-800" : "text-slate-500 border-slate-200/80"}`}>
              PROJECT SUMMARY
            </h3>
            <div className="space-y-1 flex-1 text-left">
              {hasProjectName && <p className={`font-extrabold text-sm leading-tight ${isLuxury ? "text-amber-300" : isConstruction ? "text-amber-300" : "text-slate-900"}`}>{quote.projectName}</p>}
              {hasSubject && <p className={`text-[11px] font-semibold leading-snug ${isLuxury ? "text-slate-300" : "text-slate-700"}`}>Subject: {quote.subject}</p>}
              {hasSiteLoc && <p className={`text-[11px] font-medium leading-snug ${isLuxury ? "text-slate-400" : "text-slate-600"}`}>Location: {quote.siteLocation}</p>}
              {hasBrand && <p className={`text-[11px] font-bold leading-snug ${isLuxury ? "text-amber-400" : "text-slate-700"}`}>Brand Spec: {quote.paintBrand}</p>}
              
              {hasWarranty && (
                <div className="pt-1.5">
                  <span className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold leading-none whitespace-nowrap ${isLuxury ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : isConstruction ? "bg-amber-400/20 text-amber-300 border border-amber-400/40" : "bg-blue-50 text-blue-700 border border-blue-200/80"}`}>
                    <ShieldCheck size={12} className="shrink-0" />
                    <span>Warranty: {quote.warranty}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 📊 3. DYNAMIC CATEGORY RATE TABLES */}
      {validSections.length > 0 && (
        <div className="mb-5 space-y-5">
          {validSections.map((sec, secIdx) => {
            const secItems = sec.items || sec.rows || [];
            const secComponents = (sec.components && sec.components.length > 0)
              ? sec.components
              : [{ id: "labour", name: "Labour" }, { id: "material", name: "Material" }];

            const compSubtotals = {};
            secComponents.forEach(c => {
              compSubtotals[c.id] = secItems.reduce((acc, item) => {
                const val = item.componentRates?.[c.id] !== undefined
                  ? Number(item.componentRates[c.id]) || 0
                  : (c.id === "labour" ? Number(item.labour || 0) : c.id === "material" ? Number(item.material || 0) : Number(item[c.id] || 0));
                return acc + val;
              }, 0);
            });

            const secRatePerSqft = secItems.reduce((acc, r) => acc + (Number(r.totalRate ?? r.rate) || 0), 0);
            const workingAreaNum = Number(sec.workingArea || 0);
            const secEstimatedAmount = workingAreaNum > 0 ? (workingAreaNum * secRatePerSqft) : secRatePerSqft;

            return (
              <div key={sec.id || secIdx} className={`pdf-section-block pdf-category-block border rounded-xl overflow-hidden shadow-2xs ${isLuxury ? "border-amber-500/40" : isConstruction ? "border-2 border-slate-900" : "border-slate-200/90"}`}>
                {/* Category Header Bar */}
                <div className={getCategoryHeaderClass()}>
                  <span>{sec.title || `Category #${secIdx + 1}`}</span>
                  {workingAreaNum > 0 && (
                    <span className="text-[11px] font-semibold opacity-90">
                      Area: {workingAreaNum} Sqft
                    </span>
                  )}
                </div>

                {/* Items Table with Dynamic Pricing Columns */}
                <table className="w-full text-left border-collapse text-xs table-fixed">
                  <thead>
                    <tr className={getTableHeaderClass()}>
                      <th className="py-2.5 px-3 border-r border-slate-200/40 w-[6%] text-center align-middle">#</th>
                      <th className="py-2.5 px-3 border-r border-slate-200/40 text-left align-middle">Description of Work / Item Specification</th>
                      <th className="py-2.5 px-2 border-r border-slate-200/40 w-[8%] text-center align-middle">Qty</th>
                      {secComponents.map((c) => (
                        <th key={c.id} className="py-2.5 px-3 border-r border-slate-200/40 text-right align-middle">
                          {c.name} (₹)
                        </th>
                      ))}
                      <th className="py-2.5 px-3 text-right w-[16%] align-middle">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y text-xs ${isLuxury ? "divide-slate-800 text-slate-200 bg-slate-950" : "divide-slate-100 text-slate-800"}`}>
                    {secItems.map((item, idx) => {
                      const rowTot = secComponents.reduce((acc, c) => {
                        const val = item.componentRates?.[c.id] !== undefined
                          ? Number(item.componentRates[c.id]) || 0
                          : (c.id === "labour" ? Number(item.labour || 0) : c.id === "material" ? Number(item.material || 0) : Number(item[c.id] || 0));
                        return acc + val;
                      }, 0);
                      const qty = Number(item.qty || item.quantity || 1);

                      return (
                        <tr key={item.id || idx} className={isLuxury ? "hover:bg-slate-900/60" : "hover:bg-slate-50/50"}>
                          <td className={`py-2.5 px-3 border-r text-center font-mono text-[11px] align-middle ${isLuxury ? "border-slate-800 text-slate-400" : "border-slate-200/80 text-slate-500"}`}>{idx + 1}</td>
                          <td className={`py-2.5 px-3 border-r font-medium whitespace-pre-wrap leading-relaxed align-middle text-left ${isLuxury ? "border-slate-800 text-slate-200" : "border-slate-200/80 text-slate-800"}`}>{item.desc || item.work || item.description || "—"}</td>
                          <td className={`py-2.5 px-2 border-r text-center font-mono text-[11px] align-middle ${isLuxury ? "border-slate-800 text-slate-300" : "border-slate-200/80 text-slate-600"}`}>{qty}</td>
                          {secComponents.map((c) => {
                            const val = item.componentRates?.[c.id] !== undefined
                              ? Number(item.componentRates[c.id]) || 0
                              : (c.id === "labour" ? Number(item.labour || 0) : c.id === "material" ? Number(item.material || 0) : Number(item[c.id] || 0));
                            return (
                              <td key={c.id} className={`py-2.5 px-3 border-r text-right font-mono font-medium align-middle ${isLuxury ? "border-slate-800 text-amber-300" : "border-slate-200/80 text-slate-700"}`}>
                                ₹{val.toFixed(2)}
                              </td>
                            );
                          })}
                          <td className={`py-2.5 px-3 text-right font-mono font-bold align-middle ${isLuxury ? "text-amber-400" : "text-slate-900"}`}>₹{(rowTot * qty).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Category Summary Footer Row */}
                <div className={`px-4 py-2 flex items-center justify-between font-bold text-xs flex-wrap gap-2 ${isLuxury ? "bg-slate-900 text-amber-300 border-t border-amber-500/30" : isConstruction ? "bg-slate-900 text-amber-400" : "bg-slate-900 text-white"}`}>
                  <span className="uppercase text-[10px] tracking-wide opacity-80">Category Rate Summary</span>
                  <div className="flex items-center gap-4 text-xs flex-wrap">
                    {secComponents.map((c) => (
                      <span key={c.id} className="font-medium opacity-90">
                        {c.name}: <strong className="font-mono">{`₹${(compSubtotals[c.id] || 0).toFixed(2)}`}</strong>
                      </span>
                    ))}
                    <span className={`font-black text-xs font-mono ${isLuxury ? "text-amber-400" : isConstruction ? "text-amber-400" : "text-emerald-400"}`}>Rate/Sqft: ₹{secRatePerSqft.toFixed(2)}</span>
                  </div>
                </div>

                {/* Working Area Calculation Panel */}
                {workingAreaNum > 0 && (
                  <div className={`px-4 py-2 border-t flex items-center justify-between text-xs font-semibold ${isLuxury ? "bg-slate-900/60 border-amber-500/30 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"}`}>
                    <span>Calculation: {workingAreaNum} Sqft × ₹{secRatePerSqft.toFixed(2)}/Sqft</span>
                    <span className={`font-black text-xs font-mono ${isLuxury ? "text-amber-400" : "text-slate-900"}`}>Category Total: ₹{secEstimatedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 💰 4. FINANCIAL PRICING SUMMARY PANEL */}
      {hasGrandTotal && (
        <div className="pdf-section-block pdf-summary-block pdf-keep-together flex justify-end mb-5 break-inside-avoid print:break-inside-avoid">
          <div className={`w-80 border rounded-xl overflow-hidden shadow-2xs ${isLuxury ? "border-amber-500/40 bg-slate-900" : isConstruction ? "border-2 border-slate-900 bg-amber-50/50" : "border-slate-300 bg-slate-50/50"}`}>
            <div className={`p-3.5 space-y-2 border-b text-xs font-medium ${isLuxury ? "border-amber-500/30 text-slate-300" : "border-slate-200 text-slate-700"}`}>
              {hasSubtotal && (
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Subtotal</span>
                  <span className={`font-mono font-bold ${isLuxury ? "text-slate-100" : "text-slate-900"}`}>₹ {quote.subtotal}</span>
                </div>
              )}
              {hasDiscount && (
                <div className="flex justify-between items-center text-emerald-700 font-bold">
                  <span>Discount</span>
                  <span className="font-mono">− ₹ {quote.discountAmount || quote.discount}</span>
                </div>
              )}
              {hasTax && (
                <div className="flex justify-between items-center">
                  <span className="font-semibold">GST / Statutory Tax</span>
                  <span className={`font-mono font-bold ${isLuxury ? "text-slate-100" : "text-slate-900"}`}>₹ {quote.tax}</span>
                </div>
              )}
              {hasTransport && (
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Transportation</span>
                  <span className={`font-mono font-bold ${isLuxury ? "text-slate-100" : "text-slate-900"}`}>₹ {quote.transport}</span>
                </div>
              )}
              {hasAddCharges && (
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Additional Charges</span>
                  <span className={`font-mono font-bold ${isLuxury ? "text-slate-100" : "text-slate-900"}`}>₹ {quote.additionalCharges}</span>
                </div>
              )}
            </div>

            {/* Highlighted Grand Total */}
            <div className={getGrandTotalClass()}>
              <span className="uppercase tracking-wider text-xs font-black">GRAND TOTAL</span>
              <span className={getGrandTotalAmountClass()}>
                ₹ {Number(quote.grandTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 📝 5. SCOPE OF WORK, TERMS, EXCLUSIONS & BANK DETAILS */}
      {(hasScope || hasTerms || hasExclusions || hasNotes || hasBankDetails) && (
        <div className="space-y-4 mb-5">
          {/* Scope of Work */}
          {hasScope && (
            <div className={`pdf-section-block border rounded-xl p-4 shadow-2xs ${isLuxury ? "border-amber-500/30 bg-slate-900/80" : "border-slate-200 bg-white"}`}>
              <h4 className={`font-extrabold uppercase tracking-wider text-[11px] mb-1.5 pb-1 border-b ${isLuxury ? "text-amber-400 border-amber-500/20" : "text-slate-900 border-slate-100"}`}>
                Scope of Work
              </h4>
              <p className={`whitespace-pre-wrap leading-relaxed font-medium text-xs ${isLuxury ? "text-slate-300" : "text-slate-700"}`}>
                {quote.scopeOfWork}
              </p>
            </div>
          )}

          {/* Exclusions */}
          {hasExclusions && (
            <div className={`pdf-section-block border rounded-xl p-4 shadow-2xs ${isLuxury ? "border-amber-500/30 bg-slate-900/80" : "border-slate-200 bg-white"}`}>
              <h4 className={`font-extrabold uppercase tracking-wider text-[11px] mb-1.5 pb-1 border-b ${isLuxury ? "text-amber-400 border-amber-500/20" : "text-slate-900 border-slate-100"}`}>
                Exclusions &amp; Client Scope
              </h4>
              <p className={`whitespace-pre-wrap leading-relaxed font-medium text-xs ${isLuxury ? "text-slate-300" : "text-slate-700"}`}>
                {quote.exclusions}
              </p>
            </div>
          )}

          {/* Terms & Conditions */}
          {hasTerms && (
            <div className={`pdf-section-block border rounded-xl p-4 shadow-2xs ${isLuxury ? "border-amber-500/30 bg-slate-900/80" : "border-slate-200 bg-white"}`}>
              <h4 className={`font-extrabold uppercase tracking-wider text-[11px] mb-1.5 pb-1 border-b ${isLuxury ? "text-amber-400 border-amber-500/20" : "text-slate-900 border-slate-100"}`}>
                Terms &amp; Conditions
              </h4>
              <ol className={`list-decimal list-inside space-y-1 font-medium text-xs ${isLuxury ? "text-slate-300" : "text-slate-700"}`}>
                {validTerms.map((term, tIdx) => (
                  <li key={tIdx} className="leading-relaxed">{term}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Payment Details & Bank Transfer Info */}
          {hasBankDetails && (
            <div className={`pdf-section-block pdf-bank-block pdf-keep-together border rounded-xl p-4 shadow-2xs break-inside-avoid ${isLuxury ? "border-amber-500/30 bg-slate-900/90" : "border-slate-200 bg-slate-50/80"}`}>
              <h4 className={`font-extrabold uppercase tracking-wider text-[11px] mb-2 pb-1 border-b ${isLuxury ? "text-amber-400 border-amber-500/20" : "text-slate-900 border-slate-200"}`}>
                Payment Details &amp; Bank Transfer Info
              </h4>
              <div className={`grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px] font-semibold ${isLuxury ? "text-slate-300" : "text-slate-700"}`}>
                {hasVal(bank.bankName) && (
                  <p className="flex justify-between items-center"><span className="opacity-70">Bank Name:</span> <span className={`font-bold ${isLuxury ? "text-slate-100" : "text-slate-900"}`}>{bank.bankName}</span></p>
                )}
                {hasVal(bank.accHolder || bank.accountHolder) && (
                  <p className="flex justify-between items-center"><span className="opacity-70">Account Name:</span> <span className={`font-bold ${isLuxury ? "text-slate-100" : "text-slate-900"}`}>{bank.accHolder || bank.accountHolder}</span></p>
                )}
                {hasVal(bank.accNo || bank.accountNumber) && (
                  <p className="flex justify-between items-center"><span className="opacity-70">Account Number:</span> <span className={`font-mono font-extrabold ${isLuxury ? "text-amber-300" : "text-slate-950"}`}>{bank.accNo || bank.accountNumber}</span></p>
                )}
                {hasVal(bank.ifsc || bank.ifscCode) && (
                  <p className="flex justify-between items-center"><span className="opacity-70">IFSC Code:</span> <span className={`font-mono font-bold ${isLuxury ? "text-slate-100" : "text-slate-900"}`}>{bank.ifsc || bank.ifscCode}</span></p>
                )}
                {hasVal(bank.branch) && (
                  <p className="flex justify-between items-center"><span className="opacity-70">Branch:</span> <span className="font-medium">{bank.branch}</span></p>
                )}
                {hasVal(bank.upi || bank.upiId) && (
                  <p className="flex justify-between items-center"><span className="opacity-70">UPI ID:</span> <span className={`font-mono font-bold ${isLuxury ? "text-amber-300" : "text-slate-900"}`}>{bank.upi || bank.upiId}</span></p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ✍️ 6. AUTHORIZED SIGNATORY BLOCK */}
      {hasSignature && (
        <div className={`pdf-section-block pdf-signature-block pdf-keep-together flex justify-between items-end pt-6 border-t mt-6 break-inside-avoid print:break-inside-avoid ${isLuxury ? "border-amber-500/30" : "border-slate-200"}`}>
          <div className="text-left text-slate-500 text-[10px]">
            <p className="font-semibold">Thank you for your business!</p>
            <p className="mt-0.5">This is a computer-generated quotation document.</p>
          </div>
          <div className="text-right space-y-1">
            {hasVal(sig.signatureImage) && (
              <div className="flex justify-end mb-1">
                <img
                  src={sig.signatureImage}
                  alt="Signature"
                  style={{ maxHeight: "48px", maxWidth: "140px" }}
                  className="object-contain"
                />
              </div>
            )}
            <div className={`w-48 border-t pt-1 ml-auto ${isLuxury ? "border-amber-500/50" : "border-slate-400"}`}>
              <p className={`font-extrabold text-xs uppercase ${isLuxury ? "text-amber-400" : "text-slate-900"}`}>{sig.name || quote.companyName}</p>
              {hasVal(sig.designation) && <p className={`text-[10px] font-bold ${isLuxury ? "text-slate-300" : "text-slate-600"}`}>{sig.designation}</p>}
              <p className="text-[10px] text-slate-500">Authorized Signatory</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
