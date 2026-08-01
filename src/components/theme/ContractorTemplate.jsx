import React from "react";
import { hasVal, hasPositiveNum, hasColValue } from "./templateUtils";

/**
 * CONTRACTOR — Trade & Construction Contract Quotation (High Legibility, Large Work Description Table)
 */
export default function ContractorTemplate({ data }) {
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
  const hasDocHeader = hasDate || hasRefNo || hasExpiry;

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
    <div className="bg-white p-12 min-h-[297mm] text-slate-900 font-sans border-t-8 border-emerald-700 border-x border-b border-slate-300 relative text-xs leading-relaxed">
      
      {/* CONTRACTOR HEADER */}
      <div className="flex justify-between items-start pb-6 border-b-2 border-emerald-800 mb-8 gap-8">
        <div className="flex gap-4 items-center">
          {hasLogo && <img src={quote.companyLogo} alt="Logo" className="w-16 h-16 object-contain shrink-0 border border-slate-200 p-1" />}
          {hasCompanyHeader && (
            <div>
              {hasCompanyName && <h1 className="text-2xl font-black text-slate-900 uppercase">{quote.companyName}</h1>}
              {hasTagline && <p className="text-[11px] font-bold text-emerald-700 mb-1">{quote.companyTagline}</p>}
              <div className="text-[11px] text-slate-600 space-y-0.5 mt-1 font-medium">
                {hasAddress && <p>{quote.companyAddress}</p>}
                {(hasPhone || hasEmail) && (
                  <p>
                    {hasPhone && <span>Ph: {quote.companyPhone}</span>}
                    {hasPhone && hasEmail && <span> | </span>}
                    {hasEmail && <span>Email: {quote.companyEmail}</span>}
                  </p>
                )}
                {hasGst && <p className="font-bold text-emerald-800">GSTIN: {quote.gstNo}</p>}
              </div>
            </div>
          )}
        </div>

        <div className="text-right shrink-0">
          <span className="bg-emerald-100 text-emerald-900 text-xs font-black px-3.5 py-1.5 rounded uppercase tracking-widest inline-block mb-2">
            CONTRACT QUOTATION
          </span>
          {hasDocHeader && (
            <div className="text-[11px] space-y-0.5 text-slate-700">
              {hasRefNo && <p><span className="font-bold text-slate-500">Ref:</span> <span className="font-mono font-bold text-emerald-950">{quote.quotationNo}</span></p>}
              {hasDate && <p><span className="font-bold text-slate-500">Date:</span> <span>{quote.date}</span></p>}
              {hasExpiry && <p><span className="font-bold text-slate-500">Valid Until:</span> <span>{quote.expiryDate}</span></p>}
            </div>
          )}
        </div>
      </div>

      {/* METADATA */}
      {(hasClientSection || hasProjectSection) && (
        <div className="grid grid-cols-2 gap-8 mb-8 border border-slate-300 p-4 bg-emerald-50/30">
          {hasClientSection && (
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-800 mb-1.5">
                CLIENT / OWNER
              </h3>
              {hasClientName && <p className="font-bold text-sm text-slate-900">{quote.clientName}</p>}
              {hasClientCompany && <p className="font-semibold text-slate-800">{quote.clientCompany}</p>}
              {hasClientAddress && <p className="text-slate-700 mt-1 whitespace-pre-line">{quote.clientAddress}</p>}
              {hasClientPhone && <p className="text-slate-600 mt-1">Ph: {quote.clientPhone}</p>}
            </div>
          )}

          {hasProjectSection && (
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-800 mb-1.5">
                WORK SITE &amp; SPECS
              </h3>
              {hasProjectName && <p className="font-bold text-sm text-slate-900">{quote.projectName}</p>}
              {hasSubject && <p className="text-slate-700 mt-1 font-medium">Subject: {quote.subject}</p>}
              {hasSiteLoc && <p className="text-slate-700 mt-1">Location: {quote.siteLocation}</p>}
              {hasBrand && <p className="text-slate-700 mt-1 font-semibold">Brand Approved: {quote.paintBrand}</p>}
              {hasWarranty && <p className="font-bold text-emerald-800 mt-1">Warranty: {quote.warranty} Years On Material &amp; Labour</p>}
            </div>
          )}
        </div>
      )}

      {/* LARGE WORK DESCRIPTION TABLE */}
      {validSections.length > 0 && (
        <div className="mb-8 space-y-6">
          {validSections.map((sec, secIdx) => (
            <div key={secIdx}>
              {hasVal(sec.title) && (
                <div className="bg-emerald-800 text-white font-bold text-xs uppercase px-3 py-1.5 mb-1">
                  {sec.title}
                </div>
              )}
              <table className="w-full text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold text-[10px] uppercase tracking-wider border-b border-slate-300">
                    <th className="py-2.5 px-3 border-r border-slate-300 w-10 text-center">#</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Work Scope &amp; Material Specification</th>
                    {showUnit && <th className="py-2.5 px-3 border-r border-slate-300 text-center w-16">Unit</th>}
                    {showQty && <th className="py-2.5 px-3 border-r border-slate-300 text-center w-16">Qty</th>}
                    {showLabour && <th className="py-2.5 px-3 border-r border-slate-300 text-right w-24">Labour</th>}
                    {showMaterial && <th className="py-2.5 px-3 border-r border-slate-300 text-right w-24">Material</th>}
                    {showRate && <th className="py-2.5 px-3 border-r border-slate-300 text-right w-24">Rate</th>}
                    <th className="py-2.5 px-3 text-right w-28">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
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

      {/* CONTRACTOR TOTALS */}
      {hasGrandTotal && (
        <div className="flex justify-end mb-8">
          <div className="w-80 border-2 border-emerald-800 bg-slate-50">
            <div className="p-3 space-y-2 text-xs border-b border-slate-300">
              {hasSubtotal && <div className="flex justify-between text-slate-600"><span>Work Subtotal</span><span className="font-mono font-bold text-slate-900">₹ {quote.subtotal}</span></div>}
              {hasDiscount && <div className="flex justify-between text-emerald-700 font-semibold"><span>Discount</span><span className="font-mono">− ₹ {quote.discount}</span></div>}
              {hasTax && <div className="flex justify-between text-slate-600"><span>GST / Tax</span><span className="font-mono font-bold text-slate-900">₹ {quote.tax}</span></div>}
            </div>
            <div className="p-3 bg-emerald-800 text-white flex justify-between items-center font-bold text-sm">
              <span className="uppercase tracking-wider text-xs">Contract Total Value</span>
              <span className="font-mono text-base">₹ {quote.grandTotal}</span>
            </div>
          </div>
        </div>
      )}

      {/* TERMS & BANK */}
      {(hasScope || hasTerms || hasExclusions || hasNotes || hasBankDetails) && (
        <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-300 mb-8">
          <div className="space-y-4">
            {hasScope && <div><h4 className="font-bold text-slate-900 uppercase text-[11px] mb-1">Scope of Work</h4><p className="text-slate-600 whitespace-pre-wrap">{quote.scopeOfWork}</p></div>}
            {hasTerms && <div><h4 className="font-bold text-slate-900 uppercase text-[11px] mb-1">Contract Terms</h4><ol className="list-decimal list-inside space-y-1 text-slate-600">{validTerms.map((t, idx) => <li key={idx}>{t}</li>)}</ol></div>}
          </div>

          <div>
            {hasBankDetails && (
              <div className="border border-slate-300 p-4 bg-slate-50">
                <h4 className="font-bold text-emerald-800 uppercase text-[11px] mb-2 pb-1 border-b border-slate-300">Contractor Bank Details</h4>
                <div className="space-y-1 text-[11px] text-slate-700">
                  {hasVal(bank.bankName) && <p>Bank Name: <span className="font-semibold">{bank.bankName}</span></p>}
                  {hasVal(bank.accHolder) && <p>Account Name: <span className="font-semibold">{bank.accHolder}</span></p>}
                  {hasVal(bank.accNo) && <p>Account No: <span className="font-mono font-bold">{bank.accNo}</span></p>}
                  {hasVal(bank.ifsc) && <p>IFSC Code: <span className="font-mono font-semibold">{bank.ifsc}</span></p>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="pt-8 border-t-2 border-emerald-800 flex justify-between items-end">
        <div className="text-[11px] text-slate-500">
          <p className="font-bold text-slate-800">Thank you for your business!</p>
          {hasWebsite && <p>{quote.website}</p>}
        </div>

        {hasSignature && (
          <div className="text-center w-48">
            <div className="h-12 border-b border-slate-400 mb-2 flex items-end justify-center">
              <span className="text-[9px] text-slate-400 uppercase tracking-widest pb-1">[ Contractor Signature ]</span>
            </div>
            <p className="font-bold text-slate-900 text-xs">{sig.name || quote.companyName}</p>
            {hasVal(sig.designation) && <p className="text-[10px] text-slate-600 uppercase">{sig.designation}</p>}
          </div>
        )}
      </div>

    </div>
  );
}
