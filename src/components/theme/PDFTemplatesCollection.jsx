import React from "react";
import { Building2 } from "lucide-react";
import { extractQuotationModel } from "../../utils/quotationMapper";

/** Universal Data Model Extraction for PDF Templates */
function extractData(data) {
  const m = extractQuotationModel(data);
  const logo = m.companyLogo || m.companyLogoUrl || data?.companyLogo || data?.company?.logo || data?.company?.logoUrl || "";
  return {
    ...m,
    companyLogo: logo,
    refNo: m.referenceNo || m.quotationNo,
    discount: m.discountAmount,
    tax: m.taxAmount,
  };
}

/** Standard Responsive Logo Container (60x60 min to 80x80 max) */
function CompanyHeaderLogo({ d, className = "w-20 h-20", darkTheme = false }) {
  const logoUrl = d.companyLogo || d.companyLogoUrl;
  return (
    <div className={`${className} flex items-center justify-center overflow-hidden shrink-0 rounded-2xl ${darkTheme ? "bg-white/10 border border-white/20" : "bg-white border border-slate-200 shadow-2xs"} p-1.5`}>
      {logoUrl ? (
        <img
          src={logoUrl}
          alt="Company Logo"
          className="w-full h-full object-contain"
          onError={(e) => {
            e.target.style.display = "none";
            if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
          }}
        />
      ) : null}
      <div className={`w-full h-full flex items-center justify-center font-black text-xl ${darkTheme ? "text-white bg-white/10" : "text-slate-800 bg-slate-100"} ${logoUrl ? "hidden" : ""}`}>
        {d.companyName ? d.companyName.charAt(0).toUpperCase() : <Building2 size={24} />}
      </div>
    </div>
  );
}

/* ==========================================================================
   TEMPLATE 1: CORPORATE BLUE (IT & Technology)
   ========================================================================== */
export function CorporateBlueTemplate({ data }) {
  const d = extractData(data);
  return (
    <div className="w-[794px] min-h-[1123px] bg-white text-slate-900 p-8 font-sans flex flex-col justify-between shadow-xs print:shadow-none print:m-0 print:p-8">
      <div>
        {/* Blue Header Bar */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl flex items-center justify-between shadow-md mb-6 gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <CompanyHeaderLogo d={d} className="w-20 h-20" darkTheme={true} />
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-black tracking-tight text-white truncate">{d.companyName}</h1>
              {d.companyTagline && <p className="text-xs text-blue-300 font-medium truncate">{d.companyTagline}</p>}
              <p className="text-[11px] text-slate-300 mt-1 leading-normal">{d.companyAddress}</p>
              <div className="flex flex-wrap gap-x-3 text-[10px] text-blue-200 font-mono mt-1">
                {d.companyPhone && <span>Ph: {d.companyPhone}</span>}
                {d.companyEmail && <span>Email: {d.companyEmail}</span>}
                {d.gstNo && <span>GSTIN: {d.gstNo}</span>}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="inline-block bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-1">
              PROPOSAL
            </span>
            <p className="text-xs font-mono font-bold text-white">{d.refNo}</p>
            <p className="text-[10px] text-slate-300 font-mono">{d.dateStr}</p>
          </div>
        </div>

        {/* Client & Metadata Card */}
        <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">Prepared For</span>
            <h3 className="font-extrabold text-slate-900 text-sm mt-0.5">{d.clientName}</h3>
            {d.clientCompany && <p className="text-slate-700 font-bold text-xs">{d.clientCompany}</p>}
            <p className="text-slate-600 font-medium mt-0.5">{d.clientAddress}</p>
            <p className="text-slate-500 font-mono text-[11px] mt-1">{d.clientEmail} {d.clientPhone ? `• ${d.clientPhone}` : ""}</p>
          </div>
          <div className="text-right space-y-1">
            <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">Quotation Details</span>
            <p className="font-bold text-slate-900">Valid Until: <span className="font-mono text-blue-700">{d.validUntil}</span></p>
            {d.gstNo && <p className="text-slate-600 font-medium">GSTIN: <span className="font-mono text-slate-900">{d.gstNo}</span></p>}
            {d.panNo && <p className="text-slate-600 font-medium">PAN: <span className="font-mono text-slate-900">{d.panNo}</span></p>}
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full text-xs text-left mb-6 border-collapse">
          <thead>
            <tr className="bg-blue-900 text-white font-bold uppercase tracking-wider text-[10px]">
              <th className="p-3 rounded-l-xl w-10 text-center">#</th>
              <th className="p-3">Description</th>
              <th className="p-3 text-center w-16">Qty</th>
              <th className="p-3 text-right w-24">Rate ({d.currencySymbol})</th>
              <th className="p-3 text-right rounded-r-xl w-28">Amount ({d.currencySymbol})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {d.items.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 print:break-inside-avoid">
                <td className="p-3 text-center font-mono text-slate-400">{idx + 1}</td>
                <td className="p-3 font-semibold text-slate-800">{item.description}</td>
                <td className="p-3 text-center font-mono">{item.quantity}</td>
                <td className="p-3 text-right font-mono">{item.rate.toLocaleString()}</td>
                <td className="p-3 text-right font-mono font-bold text-slate-900">{item.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-6 print:break-inside-avoid">
          <div className="w-64 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600"><span>Subtotal</span><span className="font-mono">{d.currencySymbol}{d.subtotal.toLocaleString()}</span></div>
            {d.discount > 0 && <div className="flex justify-between text-rose-600"><span>Discount</span><span className="font-mono">-{d.currencySymbol}{d.discount.toLocaleString()}</span></div>}
            {d.tax > 0 && <div className="flex justify-between text-slate-600"><span>GST Tax</span><span className="font-mono">+{d.currencySymbol}{d.tax.toLocaleString()}</span></div>}
            {d.additionalCharges > 0 && <div className="flex justify-between text-slate-600"><span>Extra Charges</span><span className="font-mono">+{d.currencySymbol}{d.additionalCharges.toLocaleString()}</span></div>}
            <div className="border-t border-slate-300 pt-2 flex justify-between font-black text-sm text-blue-900"><span>Grand Total</span><span className="font-mono">{d.currencySymbol}{d.grandTotal.toLocaleString()}</span></div>
          </div>
        </div>

        {/* Terms & Notes */}
        <div className="grid grid-cols-2 gap-4 text-[11px] bg-slate-50/50 p-4 rounded-xl border border-slate-200 print:break-inside-avoid">
          <div>
            <h4 className="font-extrabold text-blue-900 uppercase tracking-wider text-[10px] mb-1">Terms &amp; Conditions</h4>
            <p className="text-slate-600 whitespace-pre-line leading-relaxed">{d.terms || "Standard commercial terms apply."}</p>
          </div>
          <div>
            <h4 className="font-extrabold text-blue-900 uppercase tracking-wider text-[10px] mb-1">Warranty &amp; Notes</h4>
            {d.warranty && <p className="text-slate-600 leading-relaxed"><span className="font-bold text-slate-800">Warranty:</span> {d.warranty}</p>}
            <p className="text-slate-600 whitespace-pre-line leading-relaxed mt-1">{d.notes || d.scope}</p>
          </div>
        </div>
      </div>

      {/* Footer Signatures & Bank */}
      <div className="border-t border-slate-200 pt-4 flex items-end justify-between text-xs print:break-inside-avoid">
        <div>
          {d.bankDetails.bankName && (
            <>
              <p className="font-bold text-slate-800 text-[11px]">Bank: <span className="font-normal text-slate-600">{d.bankDetails.bankName}</span></p>
              <p className="font-mono text-slate-600 text-[10px]">A/C: {d.bankDetails.accountNumber} • IFSC: {d.bankDetails.ifscCode}</p>
            </>
          )}
        </div>
        <div className="text-right">
          {d.signature.signatureImage ? (
            <img src={d.signature.signatureImage} alt="Signature" className="max-h-12 max-w-[120px] object-contain ml-auto mb-1" />
          ) : (
            <div className="w-28 h-10 border-b border-slate-300 mb-1 flex items-center justify-center font-serif italic text-slate-400 text-xs">
              {d.signature.name || "Authorized Signatory"}
            </div>
          )}
          <p className="font-bold text-slate-900">{d.signature.name || d.companyName}</p>
          <p className="text-[10px] text-slate-500">{d.signature.designation || "Authorized Signatory"}</p>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   TEMPLATE 2: MINIMAL WHITE (Architecture & Apple-inspired)
   ========================================================================== */
export function MinimalWhiteTemplate({ data }) {
  const d = extractData(data);
  return (
    <div className="w-[794px] min-h-[1123px] bg-white text-slate-900 p-10 font-sans flex flex-col justify-between print:shadow-none print:m-0 print:p-8">
      <div>
        <div className="border-b border-slate-200 pb-8 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <CompanyHeaderLogo d={d} className="w-20 h-20" />
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-light text-slate-900 tracking-tight truncate">{d.companyName}</h1>
              {d.companyTagline && <p className="text-xs text-slate-400 font-normal tracking-widest uppercase mt-0.5">{d.companyTagline}</p>}
              <p className="text-xs text-slate-500 font-light mt-1">{d.companyAddress}</p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">{d.companyPhone} • {d.companyEmail}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <h2 className="text-xl font-light text-slate-900">ESTIMATE</h2>
            <p className="text-xs font-mono text-slate-400 mt-0.5">{d.refNo}</p>
            <p className="text-[10px] text-slate-400 font-mono">{d.dateStr}</p>
          </div>
        </div>

        <div className="py-8 border-b border-slate-100 grid grid-cols-2 gap-8 text-xs font-light">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-slate-400">Client</span>
            <p className="text-sm font-normal text-slate-900 mt-1">{d.clientName}</p>
            {d.clientCompany && <p className="text-slate-600 font-normal">{d.clientCompany}</p>}
            <p className="text-slate-500 mt-0.5 leading-relaxed">{d.clientAddress}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-widest text-slate-400">Issued By</span>
            <p className="text-sm font-normal text-slate-900 mt-1">{d.companyName}</p>
            <p className="text-slate-500 mt-0.5">{d.companyAddress}</p>
          </div>
        </div>

        <table className="w-full text-xs text-left my-8 border-collapse font-light">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase tracking-widest">
              <th className="py-3">Description</th>
              <th className="py-3 text-center">Qty</th>
              <th className="py-3 text-right">Price</th>
              <th className="py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {d.items.map((item, idx) => (
              <tr key={idx} className="print:break-inside-avoid">
                <td className="py-4 font-normal text-slate-900">{item.description}</td>
                <td className="py-4 text-center font-mono text-slate-500">{item.quantity}</td>
                <td className="py-4 text-right font-mono text-slate-500">{d.currencySymbol}{item.rate.toLocaleString()}</td>
                <td className="py-4 text-right font-mono font-normal text-slate-900">{d.currencySymbol}{item.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end pt-4 border-t border-slate-200 print:break-inside-avoid">
          <div className="w-56 space-y-2 text-xs font-light">
            <div className="flex justify-between text-slate-500"><span>Subtotal</span><span className="font-mono">{d.currencySymbol}{d.subtotal.toLocaleString()}</span></div>
            {d.discount > 0 && <div className="flex justify-between text-rose-600"><span>Discount</span><span className="font-mono">-{d.currencySymbol}{d.discount.toLocaleString()}</span></div>}
            {d.tax > 0 && <div className="flex justify-between text-slate-500"><span>Tax</span><span className="font-mono">+{d.currencySymbol}{d.tax.toLocaleString()}</span></div>}
            <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-normal text-slate-900"><span>Total</span><span className="font-mono">{d.currencySymbol}{d.grandTotal.toLocaleString()}</span></div>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between font-light print:break-inside-avoid">
        <span>{d.companyEmail} • {d.companyPhone}</span>
        <span>Valid until {d.validUntil}</span>
      </div>
    </div>
  );
}

/* ==========================================================================
   TEMPLATE 3: CONSTRUCTION HEAVY (Construction & Engineering)
   ========================================================================== */
export function ConstructionTemplate({ data }) {
  const d = extractData(data);
  return (
    <div className="w-[794px] min-h-[1123px] bg-white text-slate-900 p-8 font-sans flex flex-col justify-between border-t-8 border-amber-500 print:shadow-none print:m-0 print:p-8">
      <div>
        <div className="bg-slate-900 text-white p-5 rounded-lg flex items-center justify-between mb-6 border-b-4 border-amber-500 gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <CompanyHeaderLogo d={d} className="w-20 h-20" darkTheme={true} />
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-black text-white tracking-wide uppercase truncate">{d.companyName}</h1>
              <p className="text-xs text-amber-400 font-bold uppercase tracking-widest">CIVIL &amp; CONTRACTING ESTIMATE</p>
              <p className="text-[11px] text-slate-300 mt-0.5">{d.companyAddress}</p>
            </div>
          </div>
          <div className="text-right font-mono shrink-0">
            <p className="text-amber-400 font-black text-base">{d.refNo}</p>
            <p className="text-xs text-slate-300">{d.dateStr}</p>
          </div>
        </div>

        <div className="bg-amber-50 border-2 border-amber-400/80 p-4 rounded-lg mb-6 grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider">PROJECT SITE DETAILS</span>
            <h3 className="font-black text-slate-900 text-sm mt-0.5">{d.clientName}</h3>
            <p className="text-slate-700 font-medium">{d.clientAddress}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider">CONTRACTOR DETAILS</span>
            <p className="font-bold text-slate-900">{d.companyName}</p>
            {d.gstNo && <p className="text-slate-700">GSTIN: {d.gstNo}</p>}
          </div>
        </div>

        <table className="w-full text-xs text-left mb-6 border-2 border-slate-900">
          <thead>
            <tr className="bg-slate-900 text-amber-400 font-black uppercase text-[10px] border-b-2 border-slate-900">
              <th className="p-2.5 border-r border-slate-700 text-center w-10">#</th>
              <th className="p-2.5 border-r border-slate-700">WORK DESCRIPTION / MATERIAL</th>
              <th className="p-2.5 border-r border-slate-700 text-center w-16">QTY</th>
              <th className="p-2.5 border-r border-slate-700 text-right w-24">RATE ({d.currencySymbol})</th>
              <th className="p-2.5 text-right w-28">AMOUNT ({d.currencySymbol})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {d.items.map((item, idx) => (
              <tr key={idx} className="font-medium print:break-inside-avoid">
                <td className="p-2.5 text-center font-mono border-r border-slate-300">{idx + 1}</td>
                <td className="p-2.5 border-r border-slate-300 font-bold text-slate-900">{item.description}</td>
                <td className="p-2.5 text-center font-mono border-r border-slate-300">{item.quantity}</td>
                <td className="p-2.5 text-right font-mono border-r border-slate-300">{item.rate.toLocaleString()}</td>
                <td className="p-2.5 text-right font-mono font-black text-slate-900">{item.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-6 print:break-inside-avoid">
          <div className="w-72 bg-slate-900 text-white p-4 rounded-lg border-2 border-amber-500 space-y-2 text-xs">
            <div className="flex justify-between text-slate-300"><span>SUBTOTAL</span><span className="font-mono">{d.currencySymbol}{d.subtotal.toLocaleString()}</span></div>
            {d.discount > 0 && <div className="flex justify-between text-rose-400"><span>DISCOUNT</span><span className="font-mono">-{d.currencySymbol}{d.discount.toLocaleString()}</span></div>}
            {d.tax > 0 && <div className="flex justify-between text-slate-300"><span>TAX / GST</span><span className="font-mono">+{d.currencySymbol}{d.tax.toLocaleString()}</span></div>}
            <div className="border-t border-amber-500 pt-2 flex justify-between font-black text-sm text-amber-400"><span>FINAL ESTIMATE</span><span className="font-mono">{d.currencySymbol}{d.grandTotal.toLocaleString()}</span></div>
          </div>
        </div>
      </div>

      <div className="border-t-2 border-slate-900 pt-4 flex justify-between items-center text-xs print:break-inside-avoid">
        <p className="font-bold text-slate-800">WARRANTY: <span className="font-normal text-slate-600">{d.warranty || "3 Years"}</span></p>
        <p className="font-bold text-slate-900">{d.signature.name || "AUTHORIZED CONTRACTOR SIGNATURE"}</p>
      </div>
    </div>
  );
}

/* ==========================================================================
   TEMPLATE 4: LUXURY BLACK & GOLD (Interior Design)
   ========================================================================== */
export function LuxuryGoldTemplate({ data }) {
  const d = extractData(data);
  return (
    <div className="w-[794px] min-h-[1123px] bg-[#09090B] text-slate-100 p-8 font-serif flex flex-col justify-between border-2 border-amber-600/40 print:shadow-none print:m-0 print:p-8">
      <div>
        <div className="border-b border-amber-600/40 pb-6 mb-6 flex justify-between items-end gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <CompanyHeaderLogo d={d} className="w-20 h-20" darkTheme={true} />
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-normal text-amber-400 tracking-widest uppercase truncate">{d.companyName}</h1>
              {d.companyTagline && <p className="text-xs text-amber-200/60 font-sans tracking-widest mt-0.5 uppercase">{d.companyTagline}</p>}
              <p className="text-xs text-slate-400 font-sans mt-1">{d.companyAddress}</p>
            </div>
          </div>
          <div className="text-right font-sans shrink-0">
            <span className="text-amber-500 font-mono text-xs uppercase tracking-widest">LUXURY ESTIMATE</span>
            <p className="text-xs font-mono text-slate-300 mt-1">{d.refNo}</p>
          </div>
        </div>

        <div className="bg-amber-950/20 border border-amber-600/30 p-5 rounded-lg mb-8 grid grid-cols-2 gap-4 text-xs font-sans">
          <div>
            <span className="text-[10px] uppercase text-amber-500 tracking-widest font-bold">CLIENT PROPOSAL</span>
            <h3 className="font-bold text-white text-sm mt-1">{d.clientName}</h3>
            <p className="text-slate-400 mt-0.5">{d.clientAddress}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase text-amber-500 tracking-widest font-bold">DATE &amp; VALIDITY</span>
            <p className="text-slate-300 mt-1">Date: {d.dateStr}</p>
            <p className="text-slate-300">Valid: {d.validUntil}</p>
          </div>
        </div>

        <table className="w-full text-xs text-left mb-8 border-collapse font-sans">
          <thead>
            <tr className="border-b border-amber-600/40 text-amber-400 uppercase text-[10px] tracking-widest">
              <th className="py-3">SPECIFICATION &amp; DESIGN ITEM</th>
              <th className="py-3 text-center">QTY</th>
              <th className="py-3 text-right">RATE</th>
              <th className="py-3 text-right">AMOUNT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-950/40">
            {d.items.map((item, idx) => (
              <tr key={idx} className="print:break-inside-avoid">
                <td className="py-3.5 text-slate-200 font-medium">{item.description}</td>
                <td className="py-3.5 text-center font-mono text-slate-400">{item.quantity}</td>
                <td className="py-3.5 text-right font-mono text-slate-400">{d.currencySymbol}{item.rate.toLocaleString()}</td>
                <td className="py-3.5 text-right font-mono text-amber-400 font-bold">{d.currencySymbol}{item.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-8 font-sans print:break-inside-avoid">
          <div className="w-64 space-y-2 text-xs border-t border-amber-600/40 pt-4">
            <div className="flex justify-between text-slate-400"><span>SUBTOTAL</span><span className="font-mono">{d.currencySymbol}{d.subtotal.toLocaleString()}</span></div>
            {d.discount > 0 && <div className="flex justify-between text-rose-400"><span>DISCOUNT</span><span className="font-mono">-{d.currencySymbol}{d.discount.toLocaleString()}</span></div>}
            {d.tax > 0 && <div className="flex justify-between text-slate-400"><span>TAX</span><span className="font-mono">+{d.currencySymbol}{d.tax.toLocaleString()}</span></div>}
            <div className="border-t border-amber-600/40 pt-2 flex justify-between font-bold text-sm text-amber-400"><span>TOTAL INVESTMENT</span><span className="font-mono">{d.currencySymbol}{d.grandTotal.toLocaleString()}</span></div>
          </div>
        </div>
      </div>

      <div className="border-t border-amber-600/40 pt-4 text-center font-sans text-xs text-amber-500/80 uppercase tracking-widest print:break-inside-avoid">
        {d.companyName} • LUXURY ARCHITECTURAL INTERIORS
      </div>
    </div>
  );
}

/* ==========================================================================
   TEMPLATE 5: PAINT CONTRACTOR (Painting & Decorating)
   ========================================================================== */
export function PaintContractorTemplate({ data }) {
  const d = extractData(data);
  return (
    <div className="w-[794px] min-h-[1123px] bg-white text-slate-900 p-8 font-sans flex flex-col justify-between border-t-8 border-teal-600 print:shadow-none print:m-0 print:p-8">
      <div>
        <div className="bg-teal-50 border border-teal-200 p-5 rounded-2xl flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <CompanyHeaderLogo d={d} className="w-20 h-20" />
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-black text-teal-900 tracking-tight truncate">{d.companyName}</h1>
              <p className="text-xs text-teal-700 font-medium">PREMIUM PAINTING &amp; COATING ESTIMATE</p>
              <p className="text-[11px] text-slate-600 mt-0.5">{d.companyAddress}</p>
            </div>
          </div>
          <div className="text-right font-mono shrink-0">
            <span className="bg-teal-600 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full">PAINT PROPOSAL</span>
            <p className="text-xs font-bold text-slate-800 mt-1">{d.refNo}</p>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 grid grid-cols-3 gap-3 text-xs">
          <div><p className="text-[10px] font-bold uppercase text-slate-400">CLIENT</p><p className="font-bold text-slate-900">{d.clientName}</p></div>
          <div><p className="text-[10px] font-bold uppercase text-slate-400">PAINT BRAND SPEC</p><p className="font-bold text-teal-700">Asian Paints / Dulux</p></div>
          <div><p className="text-[10px] font-bold uppercase text-slate-400">WARRANTY</p><p className="font-bold text-emerald-700">{d.warranty || "3 Years"}</p></div>
        </div>

        <table className="w-full text-xs text-left mb-6 border-collapse">
          <thead>
            <tr className="bg-teal-700 text-white font-bold uppercase text-[10px]">
              <th className="p-3 rounded-l-lg">AREA / SPECIFICATION</th>
              <th className="p-3 text-center">QTY</th>
              <th className="p-3 text-right">MATERIAL</th>
              <th className="p-3 text-right">LABOUR</th>
              <th className="p-3 text-right rounded-r-lg">AMOUNT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {d.items.map((item, idx) => (
              <tr key={idx} className="print:break-inside-avoid">
                <td className="p-3 font-semibold text-slate-800">{item.description}</td>
                <td className="p-3 text-center font-mono">{item.quantity}</td>
                <td className="p-3 text-right font-mono">{d.currencySymbol}{item.materialRate.toLocaleString()}</td>
                <td className="p-3 text-right font-mono">{d.currencySymbol}{item.labourRate.toLocaleString()}</td>
                <td className="p-3 text-right font-mono font-bold text-teal-900">{d.currencySymbol}{item.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-6 print:break-inside-avoid">
          <div className="w-64 bg-teal-50 p-4 rounded-xl border border-teal-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600"><span>SUBTOTAL</span><span className="font-mono">{d.currencySymbol}{d.subtotal.toLocaleString()}</span></div>
            {d.discount > 0 && <div className="flex justify-between text-rose-600"><span>DISCOUNT</span><span className="font-mono">-{d.currencySymbol}{d.discount.toLocaleString()}</span></div>}
            {d.tax > 0 && <div className="flex justify-between text-slate-600"><span>GST TAX</span><span className="font-mono">+{d.currencySymbol}{d.tax.toLocaleString()}</span></div>}
            <div className="border-t border-teal-300 pt-2 flex justify-between font-black text-sm text-teal-900"><span>GRAND TOTAL</span><span className="font-mono">{d.currencySymbol}{d.grandTotal.toLocaleString()}</span></div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4 text-xs flex justify-between text-slate-500 print:break-inside-avoid">
        <span>Surface Preparation: Scraping, Putty, Primer + 2 Topcoats Included</span>
        <span className="font-bold text-slate-900">{d.signature.name || "Authorized Signature"}</span>
      </div>
    </div>
  );
}

/* ==========================================================================
   TEMPLATE 6: MODERN GRADIENT (Startup SaaS)
   ========================================================================== */
export function ModernGradientTemplate({ data }) {
  const d = extractData(data);
  return (
    <div className="w-[794px] min-h-[1123px] bg-white text-slate-900 p-8 font-sans flex flex-col justify-between print:shadow-none print:m-0 print:p-8">
      <div>
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white p-6 rounded-3xl shadow-lg mb-6 flex justify-between items-center gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <CompanyHeaderLogo d={d} className="w-20 h-20" darkTheme={true} />
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-black tracking-tight truncate">{d.companyName}</h1>
              {d.companyTagline && <p className="text-xs text-indigo-100 font-medium mt-0.5 truncate">{d.companyTagline}</p>}
              <p className="text-[11px] text-indigo-100/90 mt-1">{d.companyAddress}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="bg-white/20 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full backdrop-blur-xs">MODERN PROPOSAL</span>
            <p className="text-xs font-mono font-bold mt-1.5">{d.refNo}</p>
          </div>
        </div>

        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6 grid grid-cols-2 gap-4 text-xs">
          <div><span className="text-[10px] font-black uppercase text-indigo-600">CLIENT</span><p className="font-extrabold text-slate-900 text-sm">{d.clientName}</p><p className="text-slate-500">{d.clientAddress}</p></div>
          <div className="text-right"><span className="text-[10px] font-black uppercase text-indigo-600">DATE</span><p className="font-bold text-slate-900">{d.dateStr}</p><p className="text-slate-500">Valid: {d.validUntil}</p></div>
        </div>

        <table className="w-full text-xs text-left mb-6 border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white font-bold uppercase text-[10px]">
              <th className="p-3.5 rounded-l-xl">ITEM / SERVICE</th>
              <th className="p-3.5 text-center">QTY</th>
              <th className="p-3.5 text-right">RATE</th>
              <th className="p-3.5 text-right rounded-r-xl">AMOUNT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {d.items.map((item, idx) => (
              <tr key={idx} className="print:break-inside-avoid">
                <td className="p-3.5 font-bold text-slate-800">{item.description}</td>
                <td className="p-3.5 text-center font-mono">{item.quantity}</td>
                <td className="p-3.5 text-right font-mono">{d.currencySymbol}{item.rate.toLocaleString()}</td>
                <td className="p-3.5 text-right font-mono font-black text-indigo-600">{d.currencySymbol}{item.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-6 print:break-inside-avoid">
          <div className="w-64 bg-slate-900 text-white p-5 rounded-2xl space-y-2 text-xs shadow-md">
            <div className="flex justify-between text-slate-400"><span>Subtotal</span><span className="font-mono">{d.currencySymbol}{d.subtotal.toLocaleString()}</span></div>
            {d.discount > 0 && <div className="flex justify-between text-rose-400"><span>Discount</span><span className="font-mono">-{d.currencySymbol}{d.discount.toLocaleString()}</span></div>}
            {d.tax > 0 && <div className="flex justify-between text-slate-400"><span>Tax</span><span className="font-mono">+{d.currencySymbol}{d.tax.toLocaleString()}</span></div>}
            <div className="border-t border-slate-800 pt-2 flex justify-between font-black text-sm text-indigo-400"><span>Total</span><span className="font-mono">{d.currencySymbol}{d.grandTotal.toLocaleString()}</span></div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4 text-xs text-slate-400 flex justify-between print:break-inside-avoid">
        <span>{d.companyEmail}</span>
        <span className="font-bold text-indigo-600">{d.signature.name || d.companyName}</span>
      </div>
    </div>
  );
}

/* ==========================================================================
   TEMPLATE 7: EXECUTIVE PROPOSAL (Boardroom & Enterprise)
   ========================================================================== */
export function ExecutiveProposalTemplate({ data }) {
  const d = extractData(data);
  return (
    <div className="w-[794px] min-h-[1123px] bg-white text-slate-900 p-8 font-sans flex flex-col justify-between print:shadow-none print:m-0 print:p-8">
      <div>
        <div className="border-b-4 border-slate-900 pb-6 mb-6 flex justify-between items-end gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <CompanyHeaderLogo d={d} className="w-20 h-20" />
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight truncate">{d.companyName}</h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">BOARDROOM EXECUTIVE PROPOSAL</p>
              <p className="text-[11px] text-slate-600 mt-1">{d.companyAddress}</p>
            </div>
          </div>
          <div className="text-right font-mono shrink-0">
            <p className="text-sm font-black text-slate-900">{d.refNo}</p>
            <p className="text-xs text-slate-500">{d.dateStr}</p>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-5 rounded-xl mb-6 text-xs">
          <h3 className="font-bold uppercase tracking-widest text-blue-400 text-[10px] mb-1">EXECUTIVE SUMMARY</h3>
          <p className="text-slate-300 leading-relaxed">
            Formal commercial proposal submitted for <span className="font-bold text-white">{d.clientName}</span> regarding {d.projectName || d.companyTagline}.
          </p>
        </div>

        <table className="w-full text-xs text-left mb-6 border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-900 font-black uppercase text-[10px] border-b-2 border-slate-900">
              <th className="p-3">DELIVERABLE SPECIFICATION</th>
              <th className="p-3 text-center">QTY</th>
              <th className="p-3 text-right">UNIT COST</th>
              <th className="p-3 text-right">TOTAL COST</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {d.items.map((item, idx) => (
              <tr key={idx} className="print:break-inside-avoid">
                <td className="p-3 font-bold text-slate-900">{item.description}</td>
                <td className="p-3 text-center font-mono">{item.quantity}</td>
                <td className="p-3 text-right font-mono">{d.currencySymbol}{item.rate.toLocaleString()}</td>
                <td className="p-3 text-right font-mono font-bold text-slate-900">{d.currencySymbol}{item.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-6 print:break-inside-avoid">
          <div className="w-64 bg-slate-50 p-4 rounded-xl border border-slate-300 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600"><span>Subtotal</span><span className="font-mono">{d.currencySymbol}{d.subtotal.toLocaleString()}</span></div>
            {d.discount > 0 && <div className="flex justify-between text-rose-600"><span>Discount</span><span className="font-mono">-{d.currencySymbol}{d.discount.toLocaleString()}</span></div>}
            {d.tax > 0 && <div className="flex justify-between text-slate-600"><span>Tax</span><span className="font-mono">+{d.currencySymbol}{d.tax.toLocaleString()}</span></div>}
            <div className="border-t border-slate-400 pt-2 flex justify-between font-black text-sm text-slate-900"><span>Grand Total</span><span className="font-mono">{d.currencySymbol}{d.grandTotal.toLocaleString()}</span></div>
          </div>
        </div>
      </div>

      <div className="border-t-2 border-slate-900 pt-4 text-xs flex justify-between items-center print:break-inside-avoid">
        <span>Confidential Enterprise Proposal</span>
        <span className="font-bold">{d.signature.name || "Executive Board Signature"}</span>
      </div>
    </div>
  );
}

/* ==========================================================================
   TEMPLATE 8: INVOICE HYBRID (Accounting & Billing)
   ========================================================================== */
export function InvoiceHybridTemplate({ data }) {
  const d = extractData(data);
  return (
    <div className="w-[794px] min-h-[1123px] bg-white text-slate-900 p-8 font-sans flex flex-col justify-between print:shadow-none print:m-0 print:p-8">
      <div>
        <div className="border-b border-slate-200 pb-6 mb-6 flex justify-between items-start gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <CompanyHeaderLogo d={d} className="w-20 h-20" />
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-slate-900 truncate">{d.companyName}</h1>
              <p className="text-xs text-slate-500">{d.companyAddress}</p>
              {d.gstNo && <p className="text-xs text-slate-500 font-mono">GSTIN: {d.gstNo}</p>}
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="bg-emerald-600 text-white text-[10px] font-bold uppercase px-3 py-1 rounded">QUOTATION / INVOICE</span>
            <p className="text-xs font-mono font-bold mt-2">NO: {d.refNo}</p>
            <p className="text-[10px] text-slate-500 font-mono">DATE: {d.dateStr}</p>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded border border-slate-200 mb-6 text-xs grid grid-cols-2 gap-4">
          <div><span className="text-[10px] font-bold uppercase text-slate-400">BILL TO</span><p className="font-bold text-slate-900">{d.clientName}</p><p className="text-slate-600">{d.clientAddress}</p></div>
          <div className="text-right"><span className="text-[10px] font-bold uppercase text-slate-400">PAYMENT TERMS</span><p className="font-bold text-slate-900">50% Advance</p><p className="text-slate-600">Valid {d.validUntil}</p></div>
        </div>

        <table className="w-full text-xs text-left mb-6 border-collapse border border-slate-200">
          <thead>
            <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 text-[10px] uppercase">
              <th className="p-2.5 border-r border-slate-200">DESCRIPTION</th>
              <th className="p-2.5 text-center border-r border-slate-200 w-16">QTY</th>
              <th className="p-2.5 text-right border-r border-slate-200 w-24">UNIT PRICE</th>
              <th className="p-2.5 text-right w-28">AMOUNT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {d.items.map((item, idx) => (
              <tr key={idx} className="print:break-inside-avoid">
                <td className="p-2.5 border-r border-slate-200 font-medium">{item.description}</td>
                <td className="p-2.5 text-center font-mono border-r border-slate-200">{item.quantity}</td>
                <td className="p-2.5 text-right font-mono border-r border-slate-200">{d.currencySymbol}{item.rate.toLocaleString()}</td>
                <td className="p-2.5 text-right font-mono font-bold text-slate-900">{d.currencySymbol}{item.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="grid grid-cols-2 gap-4 mb-6 text-xs print:break-inside-avoid">
          <div className="bg-emerald-50 p-3 rounded border border-emerald-200">
            <p className="font-bold text-emerald-900 text-[11px] mb-1">BANKING DETAILS FOR PAYMENT</p>
            {d.bankDetails.bankName ? (
              <>
                <p className="text-slate-700">Bank: {d.bankDetails.bankName}</p>
                <p className="font-mono text-slate-700">A/C: {d.bankDetails.accountNumber}</p>
                <p className="font-mono text-slate-700">IFSC: {d.bankDetails.ifscCode}</p>
              </>
            ) : (
              <p className="text-slate-500 italic">Please contact finance team for bank transfer details.</p>
            )}
          </div>
          <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1.5 text-right">
            <div className="flex justify-between"><span>Subtotal</span><span className="font-mono">{d.currencySymbol}{d.subtotal.toLocaleString()}</span></div>
            {d.discount > 0 && <div className="flex justify-between text-rose-600"><span>Discount</span><span className="font-mono">-{d.currencySymbol}{d.discount.toLocaleString()}</span></div>}
            {d.tax > 0 && <div className="flex justify-between"><span>GST Tax</span><span className="font-mono">+{d.currencySymbol}{d.tax.toLocaleString()}</span></div>}
            <div className="border-t border-slate-300 pt-1.5 flex justify-between font-bold text-sm text-emerald-800"><span>TOTAL DUE</span><span className="font-mono">{d.currencySymbol}{d.grandTotal.toLocaleString()}</span></div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4 text-xs text-center text-slate-500 print:break-inside-avoid">
        Thank you for your business! Please make payments payable to {d.companyName}
      </div>
    </div>
  );
}

/* ==========================================================================
   TEMPLATE 9: CLASSIC BUSINESS (Traditional & Legal)
   ========================================================================== */
export function ClassicBusinessTemplate({ data }) {
  const d = extractData(data);
  return (
    <div className="w-[794px] min-h-[1123px] bg-white text-slate-900 p-10 font-serif flex flex-col justify-between border border-slate-300 print:shadow-none print:m-0 print:p-8">
      <div>
        <div className="border-b-4 border-double border-slate-800 pb-6 mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <CompanyHeaderLogo d={d} className="w-20 h-20" />
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold uppercase tracking-widest text-slate-900 truncate">{d.companyName}</h1>
              {d.companyTagline && <p className="text-xs font-sans text-slate-600 mt-0.5">{d.companyTagline}</p>}
              <p className="text-xs font-sans text-slate-600 mt-1">{d.companyAddress}</p>
              <p className="text-xs font-mono text-slate-500 mt-0.5">{d.companyEmail} • {d.companyPhone}</p>
            </div>
          </div>
          <div className="text-right font-sans text-xs font-mono shrink-0">
            <p className="font-bold text-sm text-slate-900">FORMAL QUOTATION</p>
            <p className="mt-1">NO: {d.refNo}</p>
            <p>DATE: {d.dateStr}</p>
          </div>
        </div>

        <div className="mb-6 font-sans text-xs">
          <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">TO:</p>
          <p className="font-bold text-slate-900 text-sm">{d.clientName}</p>
          <p className="text-slate-700">{d.clientAddress}</p>
        </div>

        <table className="w-full text-xs text-left mb-8 border-collapse border border-slate-800 font-sans">
          <thead>
            <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-800">
              <th className="p-2.5 border-r border-slate-800 text-center w-10">S.NO</th>
              <th className="p-2.5 border-r border-slate-800">DESCRIPTION OF GOODS / SERVICES</th>
              <th className="p-2.5 border-r border-slate-800 text-center w-16">QTY</th>
              <th className="p-2.5 border-r border-slate-800 text-right w-24">RATE ({d.currencySymbol})</th>
              <th className="p-2.5 text-right w-28">AMOUNT ({d.currencySymbol})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {d.items.map((item, idx) => (
              <tr key={idx} className="print:break-inside-avoid">
                <td className="p-2.5 text-center font-mono border-r border-slate-800">{idx + 1}</td>
                <td className="p-2.5 border-r border-slate-800 font-medium">{item.description}</td>
                <td className="p-2.5 text-center font-mono border-r border-slate-800">{item.quantity}</td>
                <td className="p-2.5 text-right font-mono border-r border-slate-800">{item.rate.toLocaleString()}</td>
                <td className="p-2.5 text-right font-mono font-bold">{item.amount.toLocaleString()}</td>
              </tr>
            ))}
            <tr className="font-bold border-t-2 border-slate-800 bg-slate-100 print:break-inside-avoid">
              <td colSpan={4} className="p-2.5 text-right border-r border-slate-800">TOTAL ESTIMATED COST</td>
              <td className="p-2.5 text-right font-mono font-extrabold">{d.currencySymbol}{d.grandTotal.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-800 pt-6 flex justify-between items-end text-xs font-sans print:break-inside-avoid">
        <div>
          <p className="font-bold text-slate-800">Terms: Valid for {d.validUntil}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-slate-900">For {d.companyName}</p>
          <p className="text-[10px] text-slate-500 mt-6 uppercase tracking-wider font-bold">{d.signature.name || "Authorized Signatory"}</p>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   TEMPLATE 10: CREATIVE STUDIO (Creative Agency & Studio)
   ========================================================================== */
export function CreativeStudioTemplate({ data }) {
  const d = extractData(data);
  return (
    <div className="w-[794px] min-h-[1123px] bg-white text-slate-900 font-sans flex shadow-lg print:shadow-none print:m-0">
      
      {/* Dark Left Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-8 flex flex-col justify-between shrink-0">
        <div>
          <CompanyHeaderLogo d={d} className="w-20 h-20 mb-6" darkTheme={true} />
          <h1 className="text-xl font-black tracking-tight text-white">{d.companyName}</h1>
          {d.companyTagline && <p className="text-xs text-rose-400 font-bold uppercase tracking-wider mt-1">{d.companyTagline}</p>}

          <div className="mt-10 space-y-4 text-xs text-slate-300 border-t border-slate-800 pt-6">
            <div>
              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">PREPARED FOR</p>
              <p className="font-bold text-white text-sm mt-1">{d.clientName}</p>
              <p className="text-slate-400">{d.clientAddress}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">REFERENCE</p>
              <p className="font-mono text-white font-bold">{d.refNo}</p>
              <p className="text-slate-400">{d.dateStr}</p>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-4">
          <p>{d.companyEmail}</p>
          <p>{d.companyPhone}</p>
        </div>
      </div>

      {/* Main Bright Content Canvas */}
      <div className="flex-1 p-8 flex flex-col justify-between">
        <div>
          <div className="border-b-2 border-rose-500 pb-4 mb-6">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">CREATIVE PROPOSAL</h2>
            <p className="text-xs text-slate-500 font-medium">{d.projectName || "Design & Production Estimate"}</p>
          </div>

          <table className="w-full text-xs text-left mb-6 border-collapse">
            <thead>
              <tr className="bg-rose-50 text-rose-900 font-bold uppercase text-[10px]">
                <th className="p-3">SCOPE / DELIVERABLE</th>
                <th className="p-3 text-center">QTY</th>
                <th className="p-3 text-right">RATE</th>
                <th className="p-3 text-right">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {d.items.map((item, idx) => (
                <tr key={idx} className="print:break-inside-avoid">
                  <td className="p-3 font-extrabold text-slate-800">{item.description}</td>
                  <td className="p-3 text-center font-mono">{item.quantity}</td>
                  <td className="p-3 text-right font-mono">{d.currencySymbol}{item.rate.toLocaleString()}</td>
                  <td className="p-3 text-right font-mono font-black text-rose-600">{d.currencySymbol}{item.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-6 print:break-inside-avoid">
            <div className="w-56 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600"><span>Subtotal</span><span className="font-mono">{d.currencySymbol}{d.subtotal.toLocaleString()}</span></div>
              {d.discount > 0 && <div className="flex justify-between text-rose-600"><span>Discount</span><span className="font-mono">-{d.currencySymbol}{d.discount.toLocaleString()}</span></div>}
              {d.tax > 0 && <div className="flex justify-between text-slate-600"><span>Tax</span><span className="font-mono">+{d.currencySymbol}{d.tax.toLocaleString()}</span></div>}
              <div className="border-t border-rose-300 pt-2 flex justify-between font-black text-sm text-rose-600"><span>Grand Total</span><span className="font-mono">{d.currencySymbol}{d.grandTotal.toLocaleString()}</span></div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4 text-xs flex justify-between items-center text-slate-500 print:break-inside-avoid">
          <span>Creative Studio Proposal • {d.validUntil}</span>
          <span className="font-bold text-slate-900">{d.signature.name || "Agency Signoff"}</span>
        </div>
      </div>
    </div>
  );
}
