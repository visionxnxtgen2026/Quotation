import React from "react";
import { Tag, CalendarClock, PenTool, CreditCard, Landmark, FileText, XCircle } from "lucide-react";

export default function TermsPaymentForm({ formData, handleNestedChange, setFormData }) {
  const inputStyle = "w-full h-10 px-3.5 bg-white border border-slate-200 rounded-lg text-sm font-normal text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors";
  const textareaStyle = "w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-normal text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors";
  const labelStyle = "block text-xs font-semibold text-slate-700 tracking-wide mb-1.5";
  const cardStyle = "bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs mb-6";
  const headerStyle = "flex items-center gap-3 pb-4 mb-6 border-b border-slate-100";

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className={cardStyle + " mb-0"}>
          <div className={headerStyle}>
            <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60 shrink-0">
              <Tag size={18}/>
            </div>
            <h2 className="text-base font-semibold text-slate-900 leading-tight">Pricing & Warranty</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className={labelStyle}>Discount (%)</label>
              <input type="number" className={inputStyle} value={formData.pricing.discount} onChange={(e) => handleNestedChange("pricing", "discount", e.target.value)} />
            </div>
            <div>
              <label className={labelStyle}>Warranty (Years)</label>
              <input type="text" className={inputStyle} value={formData.pricing.warranty} onChange={(e) => handleNestedChange("pricing", "warranty", e.target.value)} />
            </div>
          </div>
        </div>
        
        <div className={cardStyle + " mb-0"}>
          <div className={headerStyle}>
            <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60 shrink-0">
              <CalendarClock size={18}/>
            </div>
            <h2 className="text-base font-semibold text-slate-900 leading-tight">Timeline</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className={labelStyle}>Start Date</label>
              <input type="date" className={inputStyle} value={formData.timeline.startDate} onChange={(e) => handleNestedChange("timeline", "startDate", e.target.value)} />
            </div>
            <div>
              <label className={labelStyle}>Completion Date</label>
              <input type="date" className={inputStyle} value={formData.timeline.endDate} onChange={(e) => handleNestedChange("timeline", "endDate", e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 mb-6">
        {[
          { id: "scopeOfWork", title: "Scope of Work", icon: <FileText size={18}/> },
          { id: "exclusions", title: "Exclusions", icon: <XCircle size={18}/> },
          { id: "termsConditions", title: "Terms & Conditions", icon: <PenTool size={18}/> },
        ].map((item) => (
          <div key={item.id} className={cardStyle + " mb-0"}>
            <div className={headerStyle}>
              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60 shrink-0">
                {item.icon}
              </div>
              <h2 className="text-base font-semibold text-slate-900 leading-tight">{item.title}</h2>
            </div>
            <textarea 
              rows={3} 
              className={`${textareaStyle} resize-y text-slate-900`} 
              value={formData.textAreas[item.id]} 
              onChange={(e) => handleNestedChange("textAreas", item.id, e.target.value)} 
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className={cardStyle + " mb-0"}>
          <div className={headerStyle}>
            <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60 shrink-0">
              <CreditCard size={18}/>
            </div>
            <h2 className="text-base font-semibold text-slate-900 leading-tight">Payment Terms</h2>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3 items-center">
                <input className={inputStyle} value={formData.paymentTerms[`step${i}`]} onChange={(e) => handleNestedChange("paymentTerms", `step${i}`, e.target.value)} />
                <div className="relative w-24 shrink-0">
                  <input 
                    type="number" 
                    className={inputStyle + " pr-7 text-center font-semibold text-slate-900"} 
                    value={formData.paymentPercents[`p${i}`]} 
                    onChange={(e) => handleNestedChange("paymentPercents", `p${i}`, e.target.value)} 
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={cardStyle + " mb-0"}>
          <div className={headerStyle}>
            <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60 shrink-0">
              <Landmark size={18}/>
            </div>
            <h2 className="text-base font-semibold text-slate-900 leading-tight">Bank Details</h2>
          </div>
          <div className="space-y-3.5">
            <input className={inputStyle} placeholder="Bank Name" value={formData.bankDetails.bankName} onChange={(e) => handleNestedChange("bankDetails", "bankName", e.target.value)} />
            <input className={inputStyle} placeholder="Account Holder Name" value={formData.bankDetails.accountHolder} onChange={(e) => handleNestedChange("bankDetails", "accountHolder", e.target.value)} />
            <div className="grid grid-cols-2 gap-3.5">
              <input className={inputStyle} placeholder="Account Number" value={formData.bankDetails.accountNumber} onChange={(e) => handleNestedChange("bankDetails", "accountNumber", e.target.value)} />
              <input className={inputStyle} placeholder="IFSC Code" value={formData.bankDetails.ifscCode} onChange={(e) => handleNestedChange("bankDetails", "ifscCode", e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className={cardStyle}>
        <div className={headerStyle}>
          <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60 shrink-0">
            <PenTool size={18}/>
          </div>
          <h2 className="text-base font-semibold text-slate-900 leading-tight">Signature & Validity</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3.5">
            <label className={labelStyle}>Authorized Signatory</label>
            <input className={inputStyle} placeholder="Name" value={formData.signature.name} onChange={(e) => handleNestedChange("signature", "name", e.target.value)} />
            <input className={inputStyle} placeholder="Designation" value={formData.signature.designation} onChange={(e) => handleNestedChange("signature", "designation", e.target.value)} />
          </div>
          <div className="space-y-3.5">
            <label className={labelStyle}>Contact Info</label>
            <input className={inputStyle} placeholder="Phone" value={formData.signature.phone} onChange={(e) => handleNestedChange("signature", "phone", e.target.value)} />
            <input className={inputStyle} placeholder="Email" value={formData.signature.email} onChange={(e) => handleNestedChange("signature", "email", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className={labelStyle}>Validity Clause</label>
            <textarea rows={2} className={`${textareaStyle} resize-none`} value={formData.validity} onChange={(e) => setFormData(prev => ({ ...prev, validity: e.target.value }))} />
          </div>
        </div>
      </div>
    </>
  );
}