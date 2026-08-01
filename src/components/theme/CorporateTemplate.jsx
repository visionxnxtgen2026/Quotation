import React from "react";
import { hasVal, hasPositiveNum, hasColValue } from "./templateUtils";

/**
 * CORPORATE — Executive Enterprise Quotation (Dark Header, SAP / Oracle ERP Style)
 */
export default function CorporateTemplate({ data }) {
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
    <div className="bg-white p-12 min-h-[297mm] text-slate-900 font-sans border border-slate-300 relative text-xs leading-relaxed">
      
      {/* 🏢 1. DARK EXECUTIVE HEADER */}
      <div className="bg-slate-900 text-white -mx-12 -mt-12 p-10 mb-8 flex justify-between items-start">
        <div className="flex gap-6 items-start">
          {hasLogo && (
            <img src={quote.companyLogo} alt="Logo" className="w-16 h-16 object-contain shrink-0 bg-white rounded-lg p-1" />
          )}
          {hasCompanyHeader && (
            <div>
              {hasCompanyName && (
                <h1 className="text-2xl font-bold tracking-tight text-white uppercase leading-none">
                  {quote.companyName}
                </h1>
              )}
              {hasTagline && <p className="text-[11px] text-amber-400 font-medium mt-1">{quote.companyTagline}</p>}
              <div className="text-[11px] text-slate-300 space-y-0.5 mt-2">
                {hasAddress && <p>{quote.companyAddress}</p>}
                {(hasPhone || hasEmail) && (
                  <p>
                    {hasPhone && <span>Tel: {quote.companyPhone}</span>}
                    {hasPhone && hasEmail && <span> &nbsp;|&nbsp; </span>}
                    {hasEmail && <span>Email: {quote.companyEmail}</span>}
                  </p>
                )}
                {hasGst && <p className="text-amber-400 font-mono font-semibold">GSTIN: {quote.gstNo}</p>}
              </div>
            </div>
          )}
        </div>

        <div className="text-right shrink-0">
          <h2 className="text-3xl font-black uppercase tracking-widest text-amber-400 mb-2">QUOTATION</h2>
          {hasDocHeader && (
            <table className="text-[11px] text-right ml-auto text-slate-200">
              <tbody>
                {hasRefNo && (
                  <tr>
                    <td className="font-bold text-slate-400 uppercase tracking-wider pr-3 py-0.5">Ref No:</td>
                    <td className="font-mono font-bold text-white py-0.5">{quote.quotationNo}</td>
                  </tr>
                )}
                {hasDate && (
                  <tr>
                    <td className="font-bold text-slate-400 uppercase tracking-wider pr-3 py-0.5">Date:</td>
                    <td className="font-medium text-white py-0.5">{quote.date}</td>
                  </tr>
                )}
                {hasExpiry && (
                  <tr>
                    <td className="font-bold text-slate-400 uppercase tracking-wider pr-3 py-0.5">Valid Until:</td>
                    <td className="font-medium text-white py-0.5">{quote.expiryDate}</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 👥 2. CLIENT & PROJECT METADATA */}
      {(hasClientSection || hasProjectSection) && (
        <div className="grid grid-cols-2 gap-8 mb-8 pb-6 border-b border-slate-200">
          {hasClientSection && (
            <div className="bg-slate-50 p-5 rounded-lg border-l-4 border-slate-900 border-y border-r border-slate-200">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                Client Information
              </h3>
              {hasClientName && <p className="font-bold text-base text-slate-900">{quote.clientName}</p>}
              {hasClientCompany && <p className="font-semibold text-slate-700">{quote.clientCompany}</p>}
              {hasClientAddress && <p className="text-slate-600 mt-1 whitespace-pre-line leading-relaxed">{quote.clientAddress}</p>}
              {(hasClientPhone || hasClientEmail) && (
                <div className="text-slate-500 mt-2 space-y-0.5 text-[11px] font-medium pt-2 border-t border-slate-200">
                  {hasClientPhone && <p>Ph: {quote.clientPhone}</p>}
                  {hasClientEmail && <p>Email: {quote.clientEmail}</p>}
                </div>
              )}
            </div>
          )}

          {hasProjectSection && (
            <div className="bg-amber-50/50 p-5 rounded-lg border-l-4 border-amber-600 border-y border-r border-amber-200">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-800 mb-2">
                Commercial Specification
              </h3>
              {hasProjectName && <p className="font-bold text-base text-slate-900">{quote.projectName}</p>}
              {hasSubject && <p className="text-slate-700 font-medium mt-1">Subject: {quote.subject}</p>}
              {hasSiteLoc && <p className="text-slate-600 mt-1">Location: {quote.siteLocation}</p>}
              {hasBrand && <p className="text-slate-600 mt-1 font-semibold">Brand: {quote.paintBrand}</p>}
              {hasWarranty && (
                <div className="mt-3 inline-block bg-slate-900 text-amber-400 text-[10px] font-bold px-3 py-1 rounded uppercase tracking-wider">
                  ★ {quote.warranty} Year Corporate Warranty
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
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-3 pb-1 border-b-2 border-slate-900">
                  {sec.title}
                </h4>
              )}
              <table className="w-full text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-4 border-r border-slate-700 w-10 text-center">#</th>
                    <th className="py-3 px-4 border-r border-slate-700">Description</th>
                    {showUnit && <th className="py-3 px-4 border-r border-slate-700 text-center w-16">Unit</th>}
                    {showQty && <th className="py-3 px-4 border-r border-slate-700 text-center w-16">Qty</th>}
                    {showLabour && <th className="py-3 px-4 border-r border-slate-700 text-right w-24">Labour</th>}
                    {showMaterial && <th className="py-3 px-4 border-r border-slate-700 text-right w-24">Material</th>}
                    {showRate && <th className="py-3 px-4 border-r border-slate-700 text-right w-24">Rate</th>}
                    <th className="py-3 px-4 text-right w-28">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {sec.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 border-r border-slate-300 text-center font-mono text-[11px] text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-4 border-r border-slate-300 font-medium whitespace-pre-wrap">{item.desc}</td>
                      {showUnit && <td className="py-2.5 px-4 border-r border-slate-300 text-center text-slate-500">{item.unit || "—"}</td>}
                      {showQty && <td className="py-2.5 px-4 border-r border-slate-300 text-center font-mono">{item.qty || "1"}</td>}
                      {showLabour && <td className="py-2.5 px-4 border-r border-slate-300 text-right font-mono">₹{item.labour}</td>}
                      {showMaterial && <td className="py-2.5 px-4 border-r border-slate-300 text-right font-mono">₹{item.material}</td>}
                      {showRate && <td className="py-2.5 px-4 border-r border-slate-300 text-right font-mono">₹{item.rate}</td>}
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">₹{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* 💰 4. PRICE SUMMARY */}
      {hasGrandTotal && (
        <div className="flex justify-end mb-8">
          <div className="w-80 border-2 border-slate-900 bg-slate-50">
            <div className="p-4 space-y-2 text-xs border-b border-slate-300">
              {hasSubtotal && (
                <div className="flex justify-between text-slate-600">
                  <span>Gross Subtotal</span>
                  <span className="font-mono font-bold text-slate-900">₹ {quote.subtotal}</span>
                </div>
              )}
              {hasDiscount && (
                <div className="flex justify-between text-emerald-700 font-semibold">
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
                  <span>Transport Freight</span>
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
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center font-bold text-sm">
              <span className="uppercase tracking-wider text-xs text-amber-400">Net Amount Payable</span>
              <span className="font-mono text-lg text-white">₹ {quote.grandTotal}</span>
            </div>
          </div>
        </div>
      )}

      {/* 📝 5. TERMS, NOTES & BANK DETAILS */}
      {(hasScope || hasTerms || hasExclusions || hasNotes || hasBankDetails) && (
        <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-300 mb-8">
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
                <ol className="list-decimal list-inside space-y-1 text-slate-600">
                  {validTerms.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ol>
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
              <div className="border border-slate-300 p-4 bg-slate-50">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3 pb-1 border-b border-slate-300">
                  Remittance Bank Details
                </h4>
                <table className="text-[11px] w-full text-slate-700">
                  <tbody>
                    {hasVal(bank.bankName) && (
                      <tr>
                        <td className="font-semibold py-1">Bank Name:</td>
                        <td className="text-right py-1 font-medium">{bank.bankName}</td>
                      </tr>
                    )}
                    {hasVal(bank.accHolder) && (
                      <tr>
                        <td className="font-semibold py-1">Account Holder:</td>
                        <td className="text-right py-1 font-medium">{bank.accHolder}</td>
                      </tr>
                    )}
                    {hasVal(bank.accNo) && (
                      <tr>
                        <td className="font-semibold py-1">Account No:</td>
                        <td className="text-right py-1 font-mono font-bold text-slate-900">{bank.accNo}</td>
                      </tr>
                    )}
                    {hasVal(bank.ifsc) && (
                      <tr>
                        <td className="font-semibold py-1">IFSC Code:</td>
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
      <div className="pt-8 border-t-2 border-slate-900 flex justify-between items-end">
        <div className="text-[11px] text-slate-500">
          <p className="font-bold text-slate-900">Thank you for choosing {quote.companyName || "us"}!</p>
          {hasWebsite && <p className="mt-0.5">{quote.website}</p>}
        </div>

        {hasSignature && (
          <div className="text-center w-52">
            <div className="h-14 border-b border-slate-400 mb-2 flex items-end justify-center">
              <span className="text-[9px] text-slate-400 uppercase tracking-widest pb-1">[ Corporate Seal &amp; Signature ]</span>
            </div>
            <p className="font-bold text-slate-900 text-xs">{sig.name || quote.companyName}</p>
            {hasVal(sig.designation) && <p className="text-[10px] text-slate-600 uppercase tracking-wider">{sig.designation}</p>}
          </div>
        )}
      </div>

    </div>
  );
}