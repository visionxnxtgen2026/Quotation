import React from "react";
import { ShieldCheck, Building2, User, Calendar, MapPin, Award } from "lucide-react";
import { hasVal, hasPositiveNum, hasColValue } from "./templateUtils";

/**
 * 🏛️ EnterpriseQuotationLayout — Master Corporate Proposal Layout
 * Designed to SAP ERP, Oracle, Zoho Books & Tally Prime presentation standards.
 * Pixel-perfect alignment, balanced spacing, symmetric two-column cards, clean table headers, and enterprise print layout.
 */
export default function EnterpriseQuotationLayout({ data }) {
  if (!data) return null;
  const quote = data;

  // Filter valid non-empty categories
  const validSections = (quote.sections || quote.rateSections || [])
    .map((sec) => {
      const items = (sec.items || sec.rows || []).filter(
        (item) => hasVal(item.desc || item.work || item.description) || hasPositiveNum(item.total)
      );
      return { ...sec, items };
    })
    .filter((sec) => sec.items.length > 0);

  const allItems = validSections.flatMap((sec) => sec.items || []);

  // Header & Company Metadata
  const hasLogo = hasVal(quote.companyLogo);
  const hasCompanyName = hasVal(quote.companyName);
  const hasTagline = hasVal(quote.companyTagline);
  const hasAddress = hasVal(quote.companyAddress);
  const hasPhone = hasVal(quote.companyPhone);
  const hasEmail = hasVal(quote.companyEmail);
  const hasGst = hasVal(quote.gstNo);
  const hasWebsite = hasVal(quote.website);
  const hasCompanyHeader = hasLogo || hasCompanyName || hasAddress || hasPhone || hasEmail || hasGst || hasTagline;

  // Document Info
  const hasDate = hasVal(quote.date);
  const hasRefNo = hasVal(quote.quotationNo || quote.referenceNo);
  const hasExpiry = hasVal(quote.expiryDate);
  const hasRevision = hasVal(quote.revision);
  const hasDocHeader = hasDate || hasRefNo || hasExpiry || hasRevision;

  // Client Details
  const hasClientName = hasVal(quote.clientName);
  const hasClientCompany = hasVal(quote.clientCompany);
  const hasClientAddress = hasVal(quote.clientAddress);
  const hasClientPhone = hasVal(quote.clientPhone);
  const hasClientEmail = hasVal(quote.clientEmail);
  const hasClientSection = hasClientName || hasClientCompany || hasClientAddress || hasClientPhone || hasClientEmail;

  // Project Details
  const hasProjectName = hasVal(quote.projectName);
  const hasBrand = hasVal(quote.paintBrand);
  const hasSubject = hasVal(quote.subject);
  const hasSiteLoc = hasVal(quote.siteLocation);
  const hasWarranty = hasVal(quote.warranty);
  const hasProjectSection = hasProjectName || hasBrand || hasSubject || hasSiteLoc || hasWarranty;

  // Column visibilities
  const showLabour = hasColValue(allItems, "labour");
  const showMaterial = hasColValue(allItems, "material");

  // Financials
  const hasSubtotal = hasPositiveNum(quote.subtotal);
  const hasDiscount = hasPositiveNum(quote.discount) || (typeof quote.discount === "string" && quote.discount !== "0.00" && quote.discount !== "0");
  const hasTax = hasPositiveNum(quote.tax);
  const hasTransport = hasPositiveNum(quote.transport);
  const hasAddCharges = hasPositiveNum(quote.additionalCharges);
  const hasGrandTotal = hasPositiveNum(quote.grandTotal) || hasSubtotal;

  // Text Sections & Terms
  const hasScope = hasVal(quote.scopeOfWork);
  const hasExclusions = hasVal(quote.exclusions);
  const hasNotes = hasVal(quote.notes) && quote.notes !== quote.scopeOfWork;
  const hasTerms = Array.isArray(quote.terms) && quote.terms.filter(hasVal).length > 0;
  const validTerms = hasTerms ? quote.terms.filter(hasVal) : [];

  // Bank & Signature
  const bank = quote.bankDetails || {};
  const hasBankDetails = hasVal(bank.bankName) || hasVal(bank.accNo) || hasVal(bank.accountNumber) || hasVal(bank.ifsc) || hasVal(bank.accHolder) || hasVal(bank.upi);

  const sig = quote.signature || {};
  const hasSignature = hasVal(sig.name) || hasVal(sig.designation) || hasVal(quote.companyName);

  return (
    <div className="bg-white text-slate-900 font-sans p-8 sm:p-10 min-h-[297mm] w-full max-w-[794px] mx-auto relative leading-relaxed text-xs box-border">
      
      {/* 🏢 1. CORPORATE HEADER */}
      <div className="pdf-section-block border-b-2 border-slate-900 pb-5 mb-5 flex justify-between items-center gap-6">
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
                <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">
                  {quote.companyName}
                </h1>
              )}
              {hasTagline && (
                <p className="text-[11px] font-bold text-blue-600 leading-none">{quote.companyTagline}</p>
              )}
              {hasAddress && (
                <p className="text-[11px] text-slate-600 font-medium whitespace-pre-line leading-tight mt-0.5">{quote.companyAddress}</p>
              )}
              {(hasPhone || hasEmail) && (
                <p className="text-[11px] text-slate-600 font-medium leading-none">
                  {hasPhone && <span>Ph: {quote.companyPhone}</span>}
                  {hasPhone && hasEmail && <span> • </span>}
                  {hasEmail && <span>Email: {quote.companyEmail}</span>}
                </p>
              )}
              {hasWebsite && <p className="text-[11px] text-slate-600 font-medium leading-none">{quote.website}</p>}
              {hasGst && <p className="text-[11px] font-extrabold text-slate-900 leading-none">GSTIN: {quote.gstNo}</p>}
            </div>
          )}
        </div>

        {/* Document Title & Reference Header (Aligned to same vertical baseline) */}
        <div className="text-right shrink-0 flex flex-col items-end justify-center space-y-1">
          <h2 className="text-2xl font-black uppercase tracking-widest text-slate-900 leading-none">
            QUOTATION
          </h2>
          {hasDocHeader && (
            <div className="text-[11px] space-y-0.5 text-slate-700 font-medium text-right pt-0.5">
              {hasRefNo && (
                <p className="leading-tight flex items-center justify-end gap-1.5">
                  <span className="font-bold text-slate-500">Ref No:</span>
                  <span className="font-mono font-extrabold text-slate-950">{quote.quotationNo || quote.referenceNo}</span>
                </p>
              )}
              {hasDate && (
                <p className="leading-tight flex items-center justify-end gap-1.5">
                  <span className="font-bold text-slate-500">Date:</span>
                  <span className="font-semibold text-slate-900">{quote.date}</span>
                </p>
              )}
              {hasExpiry && (
                <p className="leading-tight flex items-center justify-end gap-1.5">
                  <span className="font-bold text-slate-500">Valid Until:</span>
                  <span className="font-semibold text-slate-900">{quote.expiryDate}</span>
                </p>
              )}
              {hasRevision && (
                <p className="leading-tight flex items-center justify-end gap-1.5">
                  <span className="font-bold text-slate-500">Revision:</span>
                  <span className="font-semibold text-slate-900">{quote.revision}</span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 👥 2. PREPARED FOR & PROJECT SUMMARY (SYMMETRIC TWO-COLUMN EQUAL CARDS) */}
      {(hasClientSection || hasProjectSection) && (
        <div className="pdf-section-block grid grid-cols-2 gap-5 mb-5 items-stretch">
          {/* Prepared For Card */}
          <div className="flex-1 bg-slate-50/90 border border-slate-200/90 rounded-xl p-4 flex flex-col justify-start box-border shadow-2xs">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 pb-1 border-b border-slate-200/80">
              PREPARED FOR
            </h3>
            <div className="space-y-1 flex-1 text-left">
              {hasClientName && <p className="font-extrabold text-sm text-slate-900 leading-tight">{quote.clientName}</p>}
              {hasClientCompany && <p className="font-semibold text-xs text-slate-700 leading-snug">{quote.clientCompany}</p>}
              {hasClientAddress && <p className="text-[11px] text-slate-600 whitespace-pre-line leading-relaxed mt-1">{quote.clientAddress}</p>}
              {(hasClientPhone || hasClientEmail) && (
                <div className="text-[11px] text-slate-600 font-medium space-y-0.5 mt-2 pt-1.5 border-t border-slate-200/60">
                  {hasClientPhone && <p className="leading-tight">Ph: {quote.clientPhone}</p>}
                  {hasClientEmail && <p className="leading-tight">Email: {quote.clientEmail}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Project Summary Card */}
          <div className="flex-1 bg-slate-50/90 border border-slate-200/90 rounded-xl p-4 flex flex-col justify-start box-border shadow-2xs">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 pb-1 border-b border-slate-200/80">
              PROJECT SUMMARY
            </h3>
            <div className="space-y-1 flex-1 text-left">
              {hasProjectName && <p className="font-extrabold text-sm text-slate-900 leading-tight">{quote.projectName}</p>}
              {hasSubject && <p className="text-[11px] font-semibold text-slate-700 leading-snug">Subject: {quote.subject}</p>}
              {hasSiteLoc && <p className="text-[11px] text-slate-600 font-medium leading-snug">Location: {quote.siteLocation}</p>}
              {hasBrand && <p className="text-[11px] text-slate-700 font-bold leading-snug">Brand Spec: {quote.paintBrand}</p>}
              
              {/* 🛡️ WARRANTY BADGE */}
              {hasWarranty && (
                <div className="pt-1.5">
                  <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/80 text-[10px] font-extrabold leading-none whitespace-nowrap">
                    <ShieldCheck size={12} className="shrink-0 text-blue-600" />
                    <span>Warranty: {quote.warranty}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 📊 3. RATE TABLES */}
      {validSections.length > 0 && (
        <div className="mb-5 space-y-5">
          {validSections.map((sec, secIdx) => {
            const secItems = sec.items || sec.rows || [];
            const secLabourTotal = secItems.reduce((acc, r) => acc + (Number(r.labour) || 0), 0);
            const secMaterialTotal = secItems.reduce((acc, r) => acc + (Number(r.material) || 0), 0);
            const secRatePerSqft = secItems.reduce((acc, r) => acc + (Number(r.total) || (Number(r.labour || 0) + Number(r.material || 0))), 0);
            const workingAreaNum = Number(sec.workingArea || 0);
            const secEstimatedAmount = workingAreaNum > 0 ? (workingAreaNum * secRatePerSqft) : secRatePerSqft;

            return (
              <div key={sec.id || secIdx} className="pdf-section-block pdf-category-block border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
                {/* Category Header Bar */}
                <div className="bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wide px-4 py-2.5 flex items-center justify-between">
                  <span>{sec.title || `Category #${secIdx + 1}`}</span>
                  {workingAreaNum > 0 && (
                    <span className="text-[11px] font-semibold text-slate-300">
                      Area: {workingAreaNum} Sqft
                    </span>
                  )}
                </div>

                {/* Items Table with Explicit Column Widths */}
                <table className="w-full text-left border-collapse text-xs table-fixed">
                  <thead>
                    <tr className="bg-slate-100/90 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <th className="py-2.5 px-3 border-r border-slate-200/80 w-[6%] text-center align-middle">#</th>
                      <th className="py-2.5 px-3 border-r border-slate-200/80 w-[48%] text-left align-middle">Description of Work / Item Specification</th>
                      {showLabour && <th className="py-2.5 px-3 border-r border-slate-200/80 w-[15%] text-right align-middle">Labour (₹)</th>}
                      {showMaterial && <th className="py-2.5 px-3 border-r border-slate-200/80 w-[15%] text-right align-middle">Material (₹)</th>}
                      <th className="py-2.5 px-3 text-right w-[16%] align-middle">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {secItems.map((item, idx) => {
                      const lab = Number(item.labour || 0);
                      const mat = Number(item.material || 0);
                      const tot = Number(item.total || lab + mat);

                      return (
                        <tr key={item.id || idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 border-r border-slate-200/80 text-center font-mono text-[11px] text-slate-500 align-middle">{idx + 1}</td>
                          <td className="py-2.5 px-3 border-r border-slate-200/80 font-medium whitespace-pre-wrap leading-relaxed align-middle text-left">{item.desc || item.work || item.description || "—"}</td>
                          {showLabour && <td className="py-2.5 px-3 border-r border-slate-200/80 text-right font-mono font-medium text-slate-700 align-middle">₹{lab.toFixed(2)}</td>}
                          {showMaterial && <td className="py-2.5 px-3 border-r border-slate-200/80 text-right font-mono font-medium text-slate-700 align-middle">₹{mat.toFixed(2)}</td>}
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 align-middle">₹{tot.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Category Summary Footer Row */}
                <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between font-bold text-xs">
                  <span className="uppercase text-[10px] tracking-wide text-slate-300">Category Rate Summary</span>
                  <div className="flex items-center gap-4 text-xs">
                    {showLabour && <span className="text-slate-300 font-medium">Labour: <strong className="text-white font-mono">₹{secLabourTotal.toFixed(2)}</strong></span>}
                    {showMaterial && <span className="text-slate-300 font-medium">Material: <strong className="text-white font-mono">₹{secMaterialTotal.toFixed(2)}</strong></span>}
                    <span className="text-emerald-400 font-black text-xs font-mono">Rate/Sqft: ₹{secRatePerSqft.toFixed(2)}</span>
                  </div>
                </div>

                {/* Working Area Calculation Panel */}
                {workingAreaNum > 0 && (
                  <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Calculation: {workingAreaNum} Sqft × ₹{secRatePerSqft.toFixed(2)}/Sqft</span>
                    <span className="font-black text-slate-900 text-xs font-mono">Category Total: ₹{secEstimatedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 💰 4. FINANCIAL PRICING SUMMARY PANEL */}
      {hasGrandTotal && (
        <div className="pdf-section-block flex justify-end mb-5 break-inside-avoid print:break-inside-avoid">
          <div className="w-80 border border-slate-300 rounded-xl overflow-hidden bg-slate-50/50 shadow-2xs">
            <div className="p-3.5 space-y-2 border-b border-slate-200 text-xs font-medium">
              {hasSubtotal && (
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-semibold">Subtotal</span>
                  <span className="font-mono font-bold text-slate-900">₹ {quote.subtotal}</span>
                </div>
              )}
              {hasDiscount && (
                <div className="flex justify-between items-center text-emerald-700 font-bold">
                  <span>Discount</span>
                  <span className="font-mono">− ₹ {quote.discountAmount || quote.discount}</span>
                </div>
              )}
              {hasTax && (
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-semibold">GST / Statutory Tax</span>
                  <span className="font-mono font-bold text-slate-900">₹ {quote.tax}</span>
                </div>
              )}
              {hasTransport && (
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-semibold">Transportation</span>
                  <span className="font-mono font-bold text-slate-900">₹ {quote.transport}</span>
                </div>
              )}
              {hasAddCharges && (
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-semibold">Additional Charges</span>
                  <span className="font-mono font-bold text-slate-900">₹ {quote.additionalCharges}</span>
                </div>
              )}
            </div>

            {/* Highlighted Grand Total */}
            <div className="p-3.5 bg-slate-900 text-white flex justify-between items-center">
              <span className="uppercase tracking-wider text-xs font-black">GRAND TOTAL</span>
              <span className="font-mono text-base font-black text-emerald-400 text-right">
                ₹ {Number(quote.grandTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 📝 5. SCOPE OF WORK, TERMS, EXCLUSIONS & BANK DETAILS (BALANCED REFLOW) */}
      {(hasScope || hasTerms || hasExclusions || hasNotes || hasBankDetails) && (
        <div className="space-y-4 mb-5">
          {/* Scope of Work */}
          {hasScope && (
            <div className="pdf-section-block border border-slate-200 rounded-xl p-4 bg-white shadow-2xs">
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] mb-1.5 pb-1 border-b border-slate-100">
                Scope of Work
              </h4>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed font-medium text-xs">
                {quote.scopeOfWork}
              </p>
            </div>
          )}

          {/* Payment Details & Bank Transfer Info */}
          {hasBankDetails && (
            <div className="pdf-section-block border border-slate-200 rounded-xl p-4 bg-slate-50/80 shadow-2xs break-inside-avoid">
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] mb-2 pb-1 border-b border-slate-200">
                Payment Details &amp; Bank Transfer Info
              </h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px] font-semibold text-slate-700">
                {hasVal(bank.bankName) && (
                  <p className="flex justify-between items-center"><span className="text-slate-500">Bank Name:</span> <span className="font-bold text-slate-900">{bank.bankName}</span></p>
                )}
                {hasVal(bank.accHolder || bank.accountHolder) && (
                  <p className="flex justify-between items-center"><span className="text-slate-500">Account Name:</span> <span className="font-bold text-slate-900">{bank.accHolder || bank.accountHolder}</span></p>
                )}
                {hasVal(bank.accNo || bank.accountNumber) && (
                  <p className="flex justify-between items-center"><span className="text-slate-500">Account Number:</span> <span className="font-mono font-extrabold text-slate-950">{bank.accNo || bank.accountNumber}</span></p>
                )}
                {hasVal(bank.ifsc || bank.ifscCode) && (
                  <p className="flex justify-between items-center"><span className="text-slate-500">IFSC Code:</span> <span className="font-mono font-bold text-slate-900">{bank.ifsc || bank.ifscCode}</span></p>
                )}
                {hasVal(bank.branch) && (
                  <p className="flex justify-between items-center"><span className="text-slate-500">Branch:</span> <span className="font-medium text-slate-800">{bank.branch}</span></p>
                )}
                {hasVal(bank.upi || bank.upiId) && (
                  <p className="flex justify-between items-center"><span className="text-slate-500">UPI ID:</span> <span className="font-mono font-bold text-slate-900">{bank.upi || bank.upiId}</span></p>
                )}
              </div>
            </div>
          )}

          {/* Terms & Conditions */}
          {hasTerms && (
            <div className="pdf-section-block border border-slate-200 rounded-xl p-4 bg-white shadow-2xs">
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] mb-1.5 pb-1 border-b border-slate-100">
                Terms &amp; Conditions
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 font-medium leading-relaxed text-xs">
                {validTerms.map((termStr, tIdx) => (
                  <li key={tIdx} className="pl-1">
                    {termStr}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Exclusions */}
          {hasExclusions && (
            <div className="pdf-section-block border border-slate-200 rounded-xl p-4 bg-white shadow-2xs">
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] mb-1.5 pb-1 border-b border-slate-100">
                Excluded Items &amp; Services
              </h4>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed font-medium text-xs">
                {quote.exclusions}
              </p>
            </div>
          )}

          {/* Notes */}
          {hasNotes && (
            <div className="pdf-section-block border border-amber-200 bg-amber-50/60 rounded-xl p-4">
              <h4 className="font-extrabold text-amber-900 uppercase tracking-wider text-[11px] mb-1">
                Important Notes
              </h4>
              <p className="text-amber-800 italic leading-relaxed font-medium text-xs">
                {quote.notes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ✍️ 6. AUTHORIZED SIGNATURE & FOOTER NOTE */}
      <div className="pdf-section-block pt-5 mt-5 border-t-2 border-slate-900 flex justify-between items-end break-inside-avoid print:break-inside-avoid">
        {/* Left Side Note & Website */}
        <div className="text-[11px] text-slate-500 font-medium space-y-0.5 flex-1 pr-6 text-left">
          <p className="font-black text-slate-900 text-xs">Thank you for your business!</p>
          <p>For any questions or clarification regarding this quotation, please contact us anytime.</p>
          {hasWebsite && <p className="text-slate-700 font-extrabold mt-1">{quote.website}</p>}
        </div>

        {/* Right Side Signature Box */}
        {hasSignature && (
          <div className="text-center w-56 shrink-0 flex flex-col items-center justify-center">
            {sig.signatureImage ? (
              <img
                src={sig.signatureImage}
                alt="Signature"
                className="h-12 object-contain mb-1"
              />
            ) : (
              <div className="w-full border-b border-slate-400 mb-2 pb-1 text-center">
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold block">
                  Authorized Signatory
                </span>
              </div>
            )}
            <p className="font-black text-slate-900 text-xs tracking-tight">{sig.name || quote.companyName}</p>
            {hasVal(sig.designation) && (
              <p className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mt-0.5">
                {sig.designation}
              </p>
            )}
            {hasCompanyName && (
              <p className="text-[9px] text-slate-400 font-bold mt-0.5">{quote.companyName}</p>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
