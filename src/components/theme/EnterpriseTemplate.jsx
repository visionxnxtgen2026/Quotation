import React from "react";
import { hasVal, hasPositiveNum, hasColValue } from "./templateUtils";

/**
 * ENTERPRISE — Inspired by SAP / Oracle ERP (Structured Grid, Executive Document Appearance)
 */
export default function EnterpriseTemplate({ data }) {
  if (!data) return null;
  const quote = data;

  const validSections = (quote.sections || [])
    .map((sec) => ({
      ...sec,
      items: (sec.items || []).filter((item) => hasVal(item.desc) || hasPositiveNum(item.total)),
    }))
    .filter((sec) => sec.items.length > 0);

  const allItems = validSections.flatMap((sec) => sec.items || []);

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
  const hasRefNo = hasVal(quote.quotationNo);
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
  const hasProjectSection = hasProjectName || hasBrand || hasSubject || hasSiteLoc;

  // Table Column Visibility
  const showUnit = hasColValue(allItems, "unit");
  const showQty = hasColValue(allItems, "qty");
  const showLabour = hasColValue(allItems, "labour");
  const showMaterial = hasColValue(allItems, "material");
  const showRate = hasColValue(allItems, "rate");

  // Pricing
  const hasSubtotal = hasPositiveNum(quote.subtotal);
  const hasDiscount = hasPositiveNum(quote.discount);
  const hasTax = hasPositiveNum(quote.tax);
  const hasTransport = hasPositiveNum(quote.transport);
  const hasAddCharges = hasPositiveNum(quote.additionalCharges);
  const hasGrandTotal = hasPositiveNum(quote.grandTotal) || hasSubtotal;

  const hasWarranty = hasVal(quote.warranty);
  const hasScope = hasVal(quote.scopeOfWork);
  const hasExclusions = hasVal(quote.exclusions);
  const hasNotes = hasVal(quote.notes);
  const hasTerms = Array.isArray(quote.terms) && quote.terms.filter(hasVal).length > 0;
  const validTerms = hasTerms ? quote.terms.filter(hasVal) : [];

  const bank = quote.bankDetails || {};
  const hasBankDetails = hasVal(bank.bankName) || hasVal(bank.accNo) || hasVal(bank.ifsc) || hasVal(bank.accHolder);

  const sig = quote.signature || {};
  const hasSignature = hasVal(sig.name) || hasVal(sig.designation) || hasVal(quote.companyName);

  return (
    <div className="bg-white p-12 min-h-[297mm] text-slate-900 font-sans border-2 border-slate-900 relative text-xs leading-relaxed shadow-xs">
      
      {/* SAP ERP STYLE TOP HEADER BAR */}
      <div className="bg-slate-900 text-white p-4 -mx-12 -mt-12 mb-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {hasLogo && <img src={quote.companyLogo} alt="Logo" className="w-10 h-10 object-contain bg-white rounded p-1" />}
          <div>
            {hasCompanyName && <h1 className="text-lg font-black tracking-widest uppercase">{quote.companyName}</h1>}
            {hasTagline && <p className="text-[10px] text-slate-300 font-medium">{quote.companyTagline}</p>}
          </div>
        </div>
        <div className="text-right">
          <span className="text-amber-400 font-black text-sm uppercase tracking-widest block">COMMERCIAL QUOTATION</span>
          {hasRefNo && <span className="font-mono text-xs text-slate-200">ID: {quote.quotationNo}</span>}
        </div>
      </div>

      {/* SAP GRID INFO BLOCK */}
      <div className="grid grid-cols-3 border border-slate-400 mb-8 divide-x divide-slate-400 bg-slate-50 text-[11px]">
        {/* Box 1: Vendor Info */}
        <div className="p-3">
          <span className="font-bold text-[10px] uppercase text-slate-500 block mb-1">VENDOR / ISSUER</span>
          {hasCompanyName && <p className="font-bold text-slate-900">{quote.companyName}</p>}
          {hasAddress && <p className="text-slate-600">{quote.companyAddress}</p>}
          {hasPhone && <p className="text-slate-600">Ph: {quote.companyPhone}</p>}
          {hasGst && <p className="font-bold text-slate-900">GSTIN: {quote.gstNo}</p>}
        </div>

        {/* Box 2: Customer Info */}
        <div className="p-3">
          <span className="font-bold text-[10px] uppercase text-slate-500 block mb-1">CUSTOMER / RECIPIENT</span>
          {hasClientName && <p className="font-bold text-slate-900">{quote.clientName}</p>}
          {hasClientCompany && <p className="font-semibold text-slate-800">{quote.clientCompany}</p>}
          {hasClientAddress && <p className="text-slate-600 whitespace-pre-line">{quote.clientAddress}</p>}
          {hasClientPhone && <p className="text-slate-600">Ph: {quote.clientPhone}</p>}
        </div>

        {/* Box 3: Document Control */}
        <div className="p-3 bg-white">
          <span className="font-bold text-[10px] uppercase text-slate-500 block mb-1">DOCUMENT CONTROL</span>
          {hasDate && <p><span className="font-semibold">Date:</span> {quote.date}</p>}
          {hasExpiry && <p><span className="font-semibold">Valid Until:</span> {quote.expiryDate}</p>}
          {hasProjectName && <p className="font-bold text-slate-900 mt-1">Project: {quote.projectName}</p>}
          {hasWarranty && <p className="font-bold text-slate-900 mt-1">Warranty: {quote.warranty} Yrs</p>}
        </div>
      </div>

      {/* ENTERPRISE TABULAR DATA */}
      {validSections.length > 0 && (
        <div className="mb-8 space-y-6">
          {validSections.map((sec, secIdx) => (
            <div key={secIdx}>
              {hasVal(sec.title) && (
                <div className="bg-slate-200 text-slate-900 font-bold text-xs uppercase px-3 py-1.5 border-t-2 border-slate-900">
                  {sec.title}
                </div>
              )}
              <table className="w-full text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider">
                    <th className="py-2.5 px-3 border-r border-slate-700 w-10 text-center">#</th>
                    <th className="py-2.5 px-3 border-r border-slate-700">Line Item Description</th>
                    {showUnit && <th className="py-2.5 px-3 border-r border-slate-700 text-center w-16">Unit</th>}
                    {showQty && <th className="py-2.5 px-3 border-r border-slate-700 text-center w-16">Qty</th>}
                    {showLabour && <th className="py-2.5 px-3 border-r border-slate-700 text-right w-24">Labour</th>}
                    {showMaterial && <th className="py-2.5 px-3 border-r border-slate-700 text-right w-24">Material</th>}
                    {showRate && <th className="py-2.5 px-3 border-r border-slate-700 text-right w-24">Unit Rate</th>}
                    <th className="py-2.5 px-3 text-right w-28">Net Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                  {sec.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3 border-r border-slate-300 text-center font-mono text-[11px] text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-3 border-r border-slate-300 font-semibold whitespace-pre-wrap">{item.desc}</td>
                      {showUnit && <td className="py-2 px-3 border-r border-slate-300 text-center text-slate-500">{item.unit || "—"}</td>}
                      {showQty && <td className="py-2 px-3 border-r border-slate-300 text-center font-mono">{item.qty || "1"}</td>}
                      {showLabour && <td className="py-2 px-3 border-r border-slate-300 text-right font-mono">₹{item.labour}</td>}
                      {showMaterial && <td className="py-2 px-3 border-r border-slate-300 text-right font-mono">₹{item.material}</td>}
                      {showRate && <td className="py-2 px-3 border-r border-slate-300 text-right font-mono">₹{item.rate}</td>}
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">₹{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* SUMMARY */}
      {hasGrandTotal && (
        <div className="flex justify-end mb-8">
          <div className="w-80 border-2 border-slate-900 bg-slate-50">
            <div className="p-3 space-y-2 text-xs border-b border-slate-300">
              {hasSubtotal && (
                <div className="flex justify-between text-slate-600">
                  <span>Gross Subtotal</span>
                  <span className="font-mono font-bold text-slate-900">₹ {quote.subtotal}</span>
                </div>
              )}
              {hasDiscount && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Contract Discount</span>
                  <span className="font-mono">− ₹ {quote.discount}</span>
                </div>
              )}
              {hasTax && (
                <div className="flex justify-between text-slate-600">
                  <span>Applicable Tax</span>
                  <span className="font-mono font-bold text-slate-900">₹ {quote.tax}</span>
                </div>
              )}
            </div>
            <div className="p-3 bg-slate-900 text-white flex justify-between items-center font-bold text-sm">
              <span className="uppercase tracking-wider text-xs">Total Contract Value</span>
              <span className="font-mono text-base text-amber-400">₹ {quote.grandTotal}</span>
            </div>
          </div>
        </div>
      )}

      {/* TERMS & BANK DETAILS */}
      {(hasScope || hasTerms || hasExclusions || hasNotes || hasBankDetails) && (
        <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-300 mb-8">
          <div className="space-y-4">
            {hasScope && (
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-1">Scope of Work</h4>
                <p className="text-slate-600 whitespace-pre-wrap">{quote.scopeOfWork}</p>
              </div>
            )}
            {hasTerms && (
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-1">Commercial Terms</h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-600">
                  {validTerms.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          <div>
            {hasBankDetails && (
              <div className="border border-slate-400 p-4 bg-slate-50">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-2 pb-1 border-b border-slate-300">
                  Banking &amp; Settlement Info
                </h4>
                <table className="text-[11px] w-full text-slate-700">
                  <tbody>
                    {hasVal(bank.bankName) && <tr><td className="font-semibold py-1">Bank Name:</td><td className="text-right py-1 font-medium">{bank.bankName}</td></tr>}
                    {hasVal(bank.accHolder) && <tr><td className="font-semibold py-1">Account Name:</td><td className="text-right py-1 font-medium">{bank.accHolder}</td></tr>}
                    {hasVal(bank.accNo) && <tr><td className="font-semibold py-1">Account No:</td><td className="text-right py-1 font-mono font-bold text-slate-900">{bank.accNo}</td></tr>}
                    {hasVal(bank.ifsc) && <tr><td className="font-semibold py-1">IFSC / Routing:</td><td className="text-right py-1 font-mono font-semibold">{bank.ifsc}</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="pt-8 border-t-2 border-slate-900 flex justify-between items-end">
        <div className="text-[11px] text-slate-500">
          <p className="font-bold text-slate-800">SAP ERP Certified Document</p>
          {hasWebsite && <p>{quote.website}</p>}
        </div>

        {hasSignature && (
          <div className="text-center w-48">
            <div className="h-12 border-b border-slate-400 mb-2 flex items-end justify-center">
              <span className="text-[9px] text-slate-400 uppercase tracking-widest pb-1">[ Authorized Signature ]</span>
            </div>
            <p className="font-bold text-slate-900 text-xs">{sig.name || quote.companyName}</p>
            {hasVal(sig.designation) && <p className="text-[10px] text-slate-600 uppercase">{sig.designation}</p>}
          </div>
        )}
      </div>

    </div>
  );
}
