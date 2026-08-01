import React from "react";
import { CreditCard, ShieldCheck } from "lucide-react";

export default function PreviewTerms({ quotation, totals, formatCurrency }) {
  // Split terms by newline for better readability
  const termsList = quotation.textAreas?.termsConditions 
    ? quotation.textAreas.termsConditions.split('\n').filter(t => t.trim() !== '')
    : [];

  return (
    <div className="space-y-12 font-sans">
      
      {/* 1. BILLING SUMMARY (Grand Total Box) */}
      <div className="flex justify-end break-inside-avoid">
        <div className="w-full max-w-sm bg-slate-900 rounded-2xl p-6 text-white shadow-xl print:bg-slate-50 print:text-slate-900 print:shadow-none print:border-2 print:border-slate-900">
          
          <h3 className="text-xs font-black text-slate-400 print:text-slate-500 uppercase tracking-widest border-b border-slate-700 print:border-slate-300 pb-2 mb-3">
            Billing Summary
          </h3>
          
          <div className="flex justify-between text-[15px] font-semibold mb-2">
            <span className="text-slate-300 print:text-slate-700">Subtotal</span>
            <span>Rs. {formatCurrency(totals.subtotal)}</span>
          </div>
          
          {totals.discountPercent > 0 && (
            <div className="flex justify-between text-[15px] font-semibold text-rose-400 print:text-rose-600 mb-3">
              <span>Discount ({totals.discountPercent}%)</span>
              <span>- Rs. {formatCurrency(totals.discountAmount)}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center pt-4 border-t border-slate-700 print:border-slate-300 mt-2">
            <span className="text-lg font-black uppercase tracking-tight">Grand Total</span>
            <span className="text-2xl font-black text-emerald-400 print:text-slate-900 tracking-tight">
              Rs. {formatCurrency(totals.finalAmount)}
            </span>
          </div>

        </div>
      </div>

      {/* 2. TERMS & BANK DETAILS GRID */}
      <div className="grid grid-cols-2 gap-12 text-[15px] leading-relaxed break-inside-avoid">
        
        {/* Left Side: Terms & Conditions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-black text-slate-900 border-b-2 border-slate-900 pb-2">
             <ShieldCheck size={20} className="text-indigo-600 print:text-slate-900" />
             <span className="uppercase tracking-widest text-[13px]">Terms & Conditions</span>
          </div>
          
          <div className="text-slate-700 font-medium space-y-2">
            {termsList.length > 0 ? (
              termsList.map((term, idx) => (
                <p key={idx}>{term}</p>
              ))
            ) : (
              <>
                <p>1. Scaffolding must be provided by the client wherever rope scaffolding is not possible.</p>
                <p>2. If rework is required after texture completion, additional charges will apply.</p>
                <p>3. Rates are given as per existing square feet area. Final measurement taken after completion.</p>
                <p>4. The work order should be raised in the name of the applicator or authorized vendor.</p>
              </>
            )}
            {/* Validity Clause */}
            <p className="pt-2 text-slate-500 font-bold text-[13px] italic">
              * Validity: {quotation.validity || "This quotation is valid for 30 days from the date of issue."}
            </p>
          </div>
        </div>

        {/* Right Side: Bank Details */}
        <div className="bg-indigo-50/50 print:bg-white p-6 rounded-2xl border border-indigo-100 print:border-slate-300 space-y-4">
          <div className="flex items-center gap-2 font-black text-indigo-900 print:text-slate-900 uppercase tracking-widest text-[13px] mb-3">
             <CreditCard size={20} /> Bank Details
          </div>
          
          <div className="space-y-2 font-semibold text-slate-800">
            <div className="flex justify-between border-b border-indigo-200 print:border-slate-200 pb-1.5">
              <span className="text-slate-500">Bank Name</span> 
              <span className="font-black uppercase">{quotation.bankDetails?.bankName || "—"}</span>
            </div>
            <div className="flex justify-between border-b border-indigo-200 print:border-slate-200 pb-1.5">
              <span className="text-slate-500">A/C Holder</span> 
              <span className="font-black uppercase">{quotation.bankDetails?.accountHolder || "—"}</span>
            </div>
            <div className="flex justify-between border-b border-indigo-200 print:border-slate-200 pb-1.5">
              <span className="text-slate-500">Account No.</span> 
              <span className="font-black tracking-widest">{quotation.bankDetails?.accountNumber || "—"}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-500">IFSC Code</span> 
              <span className="font-black uppercase text-indigo-600 print:text-slate-900">{quotation.bankDetails?.ifscCode || "—"}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. SIGNATURES */}
      <div className="pt-20 flex justify-between items-end break-inside-avoid">
        
        {/* Customer Signature */}
        <div className="text-center w-64 space-y-3">
          <div className="border-b-2 border-slate-400 w-full"></div>
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
            Customer Signature
          </p>
        </div>
        
        {/* Authorized Signatory */}
        <div className="text-center w-64 space-y-3">
          <h4 className="text-lg font-black text-indigo-600 print:text-slate-900 uppercase mb-6">
            {quotation.projectDetails?.companyName || "Your Company"}
          </h4>
          <div className="border-b-2 border-slate-900 w-full"></div>
          <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">
            Authorized Signatory
          </p>
          {quotation.signature?.name && (
            <p className="text-[13px] font-bold text-slate-600 mt-1">
              {quotation.signature.name}
            </p>
          )}
        </div>

      </div>
      
    </div>
  );
}