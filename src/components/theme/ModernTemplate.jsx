import React from "react";
import { hasVal, hasPositiveNum, hasColValue } from "./templateUtils";

/**
 * MODERN — Clean Corporate Business Quotation (Blue Accent, Zoho Books / QuickBooks Style)
 */
export default function ModernTemplate({ data }) {
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
    <div className="bg-white p-12 min-h-[297mm] text-slate-800 font-sans border-t-8 border-blue-600 border-x border-b border-slate-200 relative text-xs leading-relaxed shadow-sm">
      
      {/* 🏢 1. HEADER */}
      <div className="flex justify-between items-start pb-8 border-b border-slate-200 mb-8 gap-8">
        <div className="flex gap-5 items-start">
          {hasLogo && (
            <img src={quote.companyLogo} alt="Logo" className="w-16 h-16 object-contain shrink-0 rounded-lg border border-slate-100 p-1" />
          )}
          {hasCompanyHeader && (
            <div>
              {hasCompanyName && (
                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                  {quote.companyName}
                </h1>
              )}
              {hasTagline && <p className="text-[11px] font-medium text-blue-600 mb-1">{quote.companyTagline}</p>}
              <div className="text-[11px] text-slate-500 space-y-0.5 mt-1 font-medium">
                {hasAddress && <p>{quote.companyAddress}</p>}
                {(hasPhone || hasEmail) && (
                  <p>
                    {hasPhone && <span>{quote.companyPhone}</span>}
                    {hasPhone && hasEmail && <span> &nbsp;·&nbsp; </span>}
                    {hasEmail && <span>{quote.companyEmail}</span>}
                  </p>
                )}
                {hasGst && <p className="text-slate-700 font-semibold">GSTIN: {quote.gstNo}</p>}
              </div>
            </div>
          )}
        </div>

        <div className="text-right shrink-0">
          <span className="bg-blue-50 text-blue-700 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest inline-block mb-3 border border-blue-200">
            Quotation
          </span>
          {hasDocHeader && (
            <table className="text-[11px] text-right ml-auto">
              <tbody>
                {hasRefNo && (
                  <tr>
                    <td className="font-bold text-slate-400 uppercase tracking-wider pr-3 py-0.5">Ref No:</td>
                    <td className="font-mono font-bold text-blue-900 py-0.5">{quote.quotationNo}</td>
                  </tr>
                )}
                {hasDate && (
                  <tr>
                    <td className="font-bold text-slate-400 uppercase tracking-wider pr-3 py-0.5">Date:</td>
                    <td className="font-semibold text-slate-800 py-0.5">{quote.date}</td>
                  </tr>
                )}
                {hasExpiry && (
                  <tr>
                    <td className="font-bold text-slate-400 uppercase tracking-wider pr-3 py-0.5">Valid Until:</td>
                    <td className="font-semibold text-slate-800 py-0.5">{quote.expiryDate}</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 👥 2. CLIENT & PROJECT METADATA */}
      {(hasClientSection || hasProjectSection) && (
        <div className="grid grid-cols-2 gap-8 mb-8">
          {hasClientSection && (
            <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200/80">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">
                Prepared For
              </h3>
              {hasClientName && <p className="font-bold text-base text-slate-900">{quote.clientName}</p>}
              {hasClientCompany && <p className="font-semibold text-slate-700">{quote.clientCompany}</p>}
              {hasClientAddress && <p className="text-slate-600 mt-1 whitespace-pre-line leading-relaxed">{quote.clientAddress}</p>}
              {(hasClientPhone || hasClientEmail) && (
                <div className="text-slate-500 mt-2 space-y-0.5 text-[11px] font-medium pt-2 border-t border-slate-200/60">
                  {hasClientPhone && <p>Ph: {quote.clientPhone}</p>}
                  {hasClientEmail && <p>Email: {quote.clientEmail}</p>}
                </div>
              )}
            </div>
          )}

          {hasProjectSection && (
            <div className="bg-blue-50/40 p-5 rounded-xl border border-blue-100">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">
                Project Overview
              </h3>
              {hasProjectName && <p className="font-bold text-base text-slate-900">{quote.projectName}</p>}
              {hasSubject && <p className="text-slate-700 font-medium mt-1">Subject: {quote.subject}</p>}
              {hasSiteLoc && <p className="text-slate-600 mt-1">Location: {quote.siteLocation}</p>}
              {hasBrand && <p className="text-slate-600 mt-1 font-semibold">Brand: {quote.paintBrand}</p>}
              {hasWarranty && (
                <div className="mt-3 inline-flex items-center gap-1.5 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider shadow-xs">
                  <span>✓ {quote.warranty} Years Warranty Included</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 📊 3. MATERIAL & SERVICES TABLE */}
      {validSections.length > 0 && (
        <div className="mb-8 space-y-6">
          {validSections.map((sec, secIdx) => (
            <div key={secIdx}>
              {hasVal(sec.title) && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-4 bg-blue-600 rounded-full" />
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">{sec.title}</h4>
                </div>
              )}
              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider">
                      <th className="py-3 px-4 w-10 text-center">#</th>
                      <th className="py-3 px-4">Description</th>
                      {showUnit && <th className="py-3 px-4 text-center w-16">Unit</th>}
                      {showQty && <th className="py-3 px-4 text-center w-16">Qty</th>}
                      {showLabour && <th className="py-3 px-4 text-right w-24">Labour</th>}
                      {showMaterial && <th className="py-3 px-4 text-right w-24">Material</th>}
                      {showRate && <th className="py-3 px-4 text-right w-24">Rate</th>}
                      <th className="py-3 px-4 text-right w-28">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {sec.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4 text-slate-900 font-semibold whitespace-pre-wrap">{item.desc}</td>
                        {showUnit && <td className="py-3 px-4 text-center text-slate-500">{item.unit || "—"}</td>}
                        {showQty && <td className="py-3 px-4 text-center font-mono">{item.qty || "1"}</td>}
                        {showLabour && <td className="py-3 px-4 text-right font-mono">₹{item.labour}</td>}
                        {showMaterial && <td className="py-3 px-4 text-right font-mono">₹{item.material}</td>}
                        {showRate && <td className="py-3 px-4 text-right font-mono">₹{item.rate}</td>}
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">₹{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 💰 4. PRICE SUMMARY */}
      {hasGrandTotal && (
        <div className="flex justify-end mb-8">
          <div className="w-80 rounded-xl border border-slate-200 overflow-hidden shadow-xs bg-slate-50">
            <div className="p-4 space-y-2.5 text-xs border-b border-slate-200">
              {hasSubtotal && (
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-mono font-bold text-slate-900">₹ {quote.subtotal}</span>
                </div>
              )}
              {hasDiscount && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount</span>
                  <span className="font-mono">− ₹ {quote.discount}</span>
                </div>
              )}
              {hasTax && (
                <div className="flex justify-between text-slate-600">
                  <span>GST / Tax</span>
                  <span className="font-mono font-bold text-slate-900">₹ {quote.tax}</span>
                </div>
              )}
              {hasTransport && (
                <div className="flex justify-between text-slate-600">
                  <span>Transport</span>
                  <span className="font-mono font-bold text-slate-900">₹ {quote.transport}</span>
                </div>
              )}
              {hasAddCharges && (
                <div className="flex justify-between text-slate-600">
                  <span>Additional Charges</span>
                  <span className="font-mono font-bold text-slate-900">₹ {quote.additionalCharges}</span>
                </div>
              )}
            </div>
            <div className="p-4 bg-blue-600 text-white flex justify-between items-center font-bold text-sm">
              <span className="uppercase tracking-wider text-xs">Total Amount</span>
              <span className="font-mono text-lg">₹ {quote.grandTotal}</span>
            </div>
          </div>
        </div>
      )}

      {/* 📝 5. TERMS, NOTES & BANK DETAILS */}
      {(hasScope || hasTerms || hasExclusions || hasNotes || hasBankDetails) && (
        <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200 mb-8">
          <div className="space-y-4">
            {hasScope && (
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">Scope of Work</h4>
                <p className="text-slate-600 whitespace-pre-wrap">{quote.scopeOfWork}</p>
              </div>
            )}
            {hasTerms && (
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">Terms &amp; Conditions</h4>
                <ul className="space-y-1 text-slate-600 list-disc list-inside">
                  {validTerms.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
            {hasExclusions && (
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">Exclusions</h4>
                <p className="text-slate-600 whitespace-pre-wrap">{quote.exclusions}</p>
              </div>
            )}
            {hasNotes && (
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">Notes</h4>
                <p className="text-slate-600 italic">{quote.notes}</p>
              </div>
            )}
          </div>

          <div>
            {hasBankDetails && (
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/80">
                <h4 className="font-bold text-blue-900 uppercase tracking-wider text-[11px] mb-3 pb-1 border-b border-slate-200">
                  Payment &amp; Bank Details
                </h4>
                <table className="text-[11px] w-full text-slate-700">
                  <tbody>
                    {hasVal(bank.bankName) && (
                      <tr>
                        <td className="font-semibold py-1">Bank:</td>
                        <td className="text-right py-1 font-medium">{bank.bankName}</td>
                      </tr>
                    )}
                    {hasVal(bank.accHolder) && (
                      <tr>
                        <td className="font-semibold py-1">Account Name:</td>
                        <td className="text-right py-1 font-medium">{bank.accHolder}</td>
                      </tr>
                    )}
                    {hasVal(bank.accNo) && (
                      <tr>
                        <td className="font-semibold py-1">Account No:</td>
                        <td className="text-right py-1 font-mono font-bold text-blue-900">{bank.accNo}</td>
                      </tr>
                    )}
                    {hasVal(bank.ifsc) && (
                      <tr>
                        <td className="font-semibold py-1">IFSC:</td>
                        <td className="text-right py-1 font-mono font-semibold">{bank.ifsc}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ✍️ 6. AUTHORIZED SIGNATURE & FOOTER */}
      <div className="pt-8 border-t border-slate-200 flex justify-between items-end">
        <div className="text-[11px] text-slate-500">
          <p className="font-semibold text-slate-800">Thank you for your business!</p>
          {hasWebsite && <p className="mt-0.5 text-blue-600">{quote.website}</p>}
        </div>

        {hasSignature && (
          <div className="text-center w-48">
            <div className="h-12 border-b border-slate-300 mb-2 flex items-end justify-center">
              <span className="text-[9px] text-slate-400 uppercase tracking-widest pb-1">[ Seal / Authorized Signature ]</span>
            </div>
            <p className="font-bold text-slate-900 text-xs">{sig.name || quote.companyName}</p>
            {hasVal(sig.designation) && <p className="text-[10px] text-slate-500 uppercase tracking-wider">{sig.designation}</p>}
          </div>
        )}
      </div>

    </div>
  );
}