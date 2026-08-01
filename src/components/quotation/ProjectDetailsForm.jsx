import React from "react";
import { Building2, Image as ImageIcon, X } from "lucide-react";

export default function ProjectDetailsForm({ formData, handleNestedChange, handleLogoUpload, removeLogo, fileInputRef }) {
  const inputStyle = "w-full h-10 px-3.5 bg-white border border-slate-200 rounded-lg text-sm font-normal text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors";
  const labelStyle = "block text-xs font-semibold text-slate-700 tracking-wide mb-1.5";
  const cardStyle = "bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs mb-6";
  const headerStyle = "flex items-center gap-3 pb-4 mb-6 border-b border-slate-100";

  return (
    <div className={cardStyle}>
      <div className={headerStyle}>
        <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60 shrink-0">
          <Building2 size={18}/>
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-900 leading-tight">Project Details</h2>
          <p className="text-xs text-slate-500 font-normal mt-0.5">Client and project metadata specification</p>
        </div>
      </div>

      <div className="mb-6">
        <label className={labelStyle}>Company Logo</label>
        <input type="file" accept="image/png, image/jpeg, image/jpg" ref={fileInputRef} className="hidden" onChange={handleLogoUpload} />
        {formData.projectDetails.companyLogo ? (
          <div className="relative w-44 h-16 border border-slate-200 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center group">
            <img src={formData.projectDetails.companyLogo} alt="Logo" className="w-full h-full object-contain p-2" />
            <button onClick={removeLogo} className="absolute top-1.5 right-1.5 bg-slate-900/80 hover:bg-slate-900 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
              <X size={12} />
            </button>
          </div>
        ) : (
          <div onClick={() => fileInputRef.current.click()} className="w-full max-w-sm h-14 border border-dashed border-slate-300 rounded-lg px-4 flex items-center justify-start gap-3 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400 cursor-pointer transition-colors">
            <ImageIcon size={18} className="text-slate-400"/>
            <span className="text-xs text-slate-600 font-medium">Upload Company Logo (PNG, JPG)</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        <div>
          <label className={labelStyle}>Company Name</label>
          <input className={inputStyle} placeholder="Your company name" value={formData.projectDetails.companyName} onChange={(e) => handleNestedChange("projectDetails", "companyName", e.target.value)} />
        </div>
        <div>
          <label className={labelStyle}>Client Name</label>
          <input className={inputStyle} placeholder="Client name" value={formData.projectDetails.clientName} onChange={(e) => handleNestedChange("projectDetails", "clientName", e.target.value)} />
        </div>
        <div>
          <label className={labelStyle}>Project Name</label>
          <input className={inputStyle} placeholder="Project name" value={formData.projectDetails.projectName} onChange={(e) => handleNestedChange("projectDetails", "projectName", e.target.value)} />
        </div>
        <div>
          <label className={labelStyle}>Reference No.</label>
          <input 
            className={`${inputStyle} bg-slate-100/80 text-slate-700 font-mono font-medium cursor-not-allowed select-all`} 
            value={formData.projectDetails.referenceNo || ""} 
            readOnly 
            title="Auto-generated Reference Number"
          />
        </div>
        <div>
          <label className={labelStyle}>Date</label>
          <input type="date" className={inputStyle} value={formData.projectDetails.date} onChange={(e) => handleNestedChange("projectDetails", "date", e.target.value)} />
        </div>
        
        <div>
          <label className={labelStyle}>Brand Specification</label>
          <div className="relative">
            <input 
              list="paint-brands" 
              className={inputStyle} 
              placeholder="Select or Type Brand Name"
              value={formData.projectDetails.paintBrand} 
              onChange={(e) => handleNestedChange("projectDetails", "paintBrand", e.target.value)} 
            />
            <datalist id="paint-brands">
              <option value="Nippon Paint" />
              <option value="Asian Paints" />
              <option value="Berger Paints" />
              <option value="Dulux" />
              <option value="JSW Paints" />
              <option value="Indigo Paints" />
              <option value="Dr. Fixit" />
            </datalist>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <label className={labelStyle}>Subject</label>
          <input 
            className={inputStyle} 
            placeholder="e.g. Paint Quote for Mr.Mani, Zoology Park Road, Salem" 
            value={formData.projectDetails.subject} 
            onChange={(e) => handleNestedChange("projectDetails", "subject", e.target.value)} 
          />
        </div>
      </div>
    </div>
  );
}