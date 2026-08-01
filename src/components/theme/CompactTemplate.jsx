import React from "react";
import { hasVal, hasPositiveNum, hasColValue } from "./templateUtils";

/**
 * COMPACT — High-Density Contractor Quotation (Tally Prime / QuickBooks Compact Style)
 */
export default function CompactTemplate({ data }) {
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
  const hasAddress = hasVal(quote.companyAddress);
  const hasPhone = hasVal(quote.companyPhone);
  const hasEmail = hasVal(quote.companyEmail);
  const hasGst = hasVal(quote.gstNo);
  const hasWebsite = hasVal(quote.website);
  const hasCompanyHeader = hasLogo || hasCompanyName || hasAddress || hasPhone || hasEmail || hasGst;

  const hasDate = hasVal(quote.date);
  const hasRefNo = hasVal(quote.quotationNo);
  const hasExpiry = hasVal(quote.expiryDate);
  const hasDocHeader = hasDate || hasRefNo || hasExpiry;

  const hasClientName = hasVal(quote.clientName);
  const hasClientCompany = hasVal(quote.clientCompany);
  const hasClientAddress = hasVal(quote.clientAddress);
  const hasClientPhone = hasVal(quote.clientPhone);
  const hasClientEmail = hasVal(quote.clientEmail);

  const hasProjectName = hasVal(quote.projectName);
  const hasBrand = hasVal(quote.paintBrand);
  const hasSubject = hasVal(quote.subject);

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
  const hasTerms = Array.isArray(quote.terms) && quote.terms.filter(hasVal).length > 0;
  const validTerms = hasTerms ? quote.terms.filter(hasVal) : [];

  const bank = quote.bankDetails || {};
  const hasBankDetails = hasVal(bank.bankName) || hasVal(bank.accNo) || hasVal(bank.ifsc) || hasVal(bank.accHolder);

  const sig = quote.signature || {};
  const hasSignature = hasVal(sig.name) || hasVal(sig.designation) || hasVal(quote.companyName);

  return (
    <div className="bg-white p-8 min-h-[297mm] text-slate-900 font-sans border border-slate-400 relative text-[11px] leading-tight">
      
      {/* HEADER COMPACT BLOCK */}
      <div className="border border-slate-900 mb-4 p-4 flex justify-between items-center bg-slate-100">
        <div className="flex gap-4 items-center">
          {hasLogo && <img src={quote.companyLogo} alt="Logo" className="w-12 h-12 object-contain shrink-0" />}
          {hasCompanyHeader && (
            <div>
              {hasCompanyName && <h1 className="text-lg font-bold text-slate-900 uppercase">{quote.companyName}</h1>}
              <div className="text-[10px] text-slate-700 flex flex-wrap gap-x-3 gap-y-0.5">
                {hasAddress && <span>{quote.companyAddress}</span>}
                {hasPhone && <span>Ph: {quote.companyPhone}</span>}
                {hasEmail && <span>Email: {quote.companyEmail}</span>}
                {hasGst && <span className="font-bold">GSTIN: {quote.gstNo}</span>}
              </div>
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <h2 className="text-xl font-black text-slate-900 uppercase">QUOTATION</h2>
          {hasRefNo && <p className="font-mono font-bold text-slate-800">Ref: {quote.quotationNo}</p>}
          {hasDate && <p className="text-slate-600">Date: {quote.date}</p>}
        </div>
      </div>

      {/* COMPACT METADATA GRID */}
      <div className="grid grid-cols-2 gap-4 border border-slate-400 p-3 mb-4 bg-slate-50 text-[11px]">
        <div>
          <span className="font-bold uppercase text-[9px] text-slate-500 block mb-0.5">CUSTOMER DETAILS</span>
          {hasClientName && <p className="font-bold text-slate-900">{quote.clientName}</p>}
          {hasClientCompany && <p className="font-semibold">{quote.clientCompany}</p>}
          {hasClientAddress && <p className="text-slate-700">{quote.clientAddress}</p>}
          {hasClientPhone && <p className="text-slate-600">Ph: {quote.clientPhone}</p>}
        </div>
        <div>
          <span className="font-bold uppercase text-[9px] text-slate-500 block mb-0.5">PROJECT SPECIFICATION</span>
          {hasProjectName && <p className="font-bold text-slate-900">{quote.projectName}</p>}
          {hasSubject && <p className="text-slate-700">Subject: {quote.subject}</p>}
          {hasBrand && <p className="text-slate-700">Brand: {quote.paintBrand}</p>}
          {hasWarranty && <p className="font-bold text-emerald-700 mt-0.5">Warranty: {quote.warranty} Years</p>}
        </div>
      </div>

      {/* HIGH DENSITY TABLE */}
      {validSections.length > 0 && (
        <div className="mb-4">
          {validSections.map((sec, secIdx) => (
            <div key={secIdx} className="mb-3">
              {hasVal(sec.title) && (
                <div className="bg-slate-800 text-white font-bold text-[10px] uppercase px-3 py-1">
                  {sec.title}
                </div>
              )}
              <table className="w-full text-left border-collapse border border-slate-400">
                <thead>
                  <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-400 uppercase text-[9px]">
                    <th className="py-1.5 px-2 border-r border-slate-400 w-8 text-center">#</th>
                    <th className="py-1.5 px-2 border-r border-slate-400">Description</th>
                    {showUnit && <th className="py-1.5 px-2 border-r border-slate-400 text-center w-12">Unit</th>}
                    {showQty && <th className="py-1.5 px-2 border-r border-slate-400 text-center w-12">Qty</th>}
                    {showLabour && <th className="py-1.5 px-2 border-r border-slate-400 text-right w-20">Labour</th>}
                    {showMaterial && <th className="py-1.5 px-2 border-r border-slate-400 text-right w-20">Material</th>}
                    {showRate && <th className="py-1.5 px-2 border-r border-slate-400 text-right w-20">Rate</th>}
                    <th className="py-1.5 px-2 text-right w-24">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {sec.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-100">
                      <td className="py-1 px-2 border-r border-slate-400 text-center font-mono text-[10px]">{idx + 1}</td>
                      <td className="py-1 px-2 border-r border-slate-400 font-medium whitespace-pre-wrap">{item.desc}</td>
                      {showUnit && <td className="py-1 px-2 border-r border-slate-400 text-center text-slate-600">{item.unit || "—"}</td>}
                      {showQty && <td className="py-1 px-2 border-r border-slate-400 text-center font-mono">{item.qty || "1"}</td>}
                      {showLabour && <td className="py-1 px-2 border-r border-slate-400 text-right font-mono">₹{item.labour}</td>}
                      {showMaterial && <td className="py-1 px-2 border-r border-slate-400 text-right font-mono">₹{item.material}</td>}
                      {showRate && <td className="py-1 px-2 border-r border-slate-400 text-right font-mono">₹{item.rate}</td>}
                      <td className="py-1 px-2 text-right font-mono font-bold text-slate-900">₹{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* SUMMARY & BANK BLOCK */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          {hasBankDetails && (
            <div className="border border-slate-400 p-2 bg-slate-50 text-[10px]">
              <span className="font-bold uppercase text-[9px] text-slate-600 block mb-1">BANK DETAILS</span>
              <p>Bank: {bank.bankName}</p>
              <p>Acc: {bank.accNo}</p>
              <p>IFSC: {bank.ifsc}</p>
              {hasVal(bank.accHolder) && <p>Name: {bank.accHolder}</p>}
            </div>
          )}
        </div>

        {hasGrandTotal && (
          <div className="border border-slate-900 bg-slate-50">
            <div className="p-2 space-y-1 text-[10px]">
              {hasSubtotal && <div className="flex justify-between"><span>Subtotal:</span><span className="font-mono">₹ {quote.subtotal}</span></div>}
              {hasDiscount && <div className="flex justify-between text-emerald-700"><span>Discount:</span><span className="font-mono">− ₹ {quote.discount}</span></div>}
              {hasTax && <div className="flex justify-between"><span>GST/Tax:</span><span className="font-mono">₹ {quote.tax}</span></div>}
            </div>
            <div className="bg-slate-900 text-white p-2 font-bold flex justify-between text-xs">
              <span>GRAND TOTAL:</span>
              <span className="font-mono">₹ {quote.grandTotal}</span>
            </div>
          </div>
        )}
      </div>

      {/* TERMS & FOOTER */}
      {(hasTerms || hasScope) && (
        <div className="border-t border-slate-300 pt-2 mb-4 text-[10px]">
          {hasScope && <p className="mb-1"><span className="font-bold">Scope:</span> {quote.scopeOfWork}</p>}
          {hasTerms && (
            <div>
              <span className="font-bold block mb-0.5">Terms:</span>
              <ol className="list-decimal list-inside text-slate-700">
                {validTerms.map((t, idx) => <li key={idx}>{t}</li>)}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* FOOTER */}
      <div className="border-t border-slate-900 pt-3 flex justify-between items-end text-[10px]">
        <div>
          <p className="font-bold">Thank you for your business!</p>
          {hasWebsite && <p>{quote.website}</p>}
        </div>
        {hasSignature && (
          <div className="text-center w-36 border-t border-slate-400 pt-1">
            <p className="font-bold text-xs">{sig.name || quote.companyName}</p>
            {hasVal(sig.designation) && <p className="text-[9px] text-slate-500 uppercase">{sig.designation}</p>}
          </div>
        )}
      </div>

    </div>
  );
}