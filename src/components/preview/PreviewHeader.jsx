import React from "react";

export default function PreviewHeader({ quotation, formatDate }) {
  // Extracting mobile number for dynamic subject line
  const clientPhone = quotation.signature?.phone || quotation.projectDetails?.referenceNo || ""; 
  
  // Format the Subject line dynamically
  const formattedSubject = `Paint Quote for ${quotation.projectDetails?.clientName || "Client Name"} ${
    quotation.projectDetails?.projectName ? `, ${quotation.projectDetails.projectName}` : ""
  } ${clientPhone ? `( ${clientPhone} )` : ""}`;

  return (
    <div className="mb-12 font-sans">
      
      {/* 1. TOP SECTION: Branding & Document Meta */}
      <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8 mb-8">
        
        {/* Left Side: Logo & Brand Badge */}
        <div className="space-y-4">
          {quotation.projectDetails?.companyLogo ? (
            <img 
              src={quotation.projectDetails.companyLogo} 
              alt="Company Logo" 
              className="h-20 max-w-[280px] object-contain print:max-h-24" 
            />
          ) : (
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
              {quotation.projectDetails?.companyName || "YOUR COMPANY"}
            </h1>
          )}
          {/* Paint Brand Badge */}
          <div className="bg-indigo-600 text-white px-4 py-1.5 rounded text-xs font-black tracking-widest inline-block uppercase shadow-sm">
            {quotation.projectDetails?.paintBrand || "PREMIUM COATING"}
          </div>
        </div>
        
        {/* Right Side: Quotation Title & Date */}
        <div className="text-right">
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">QUOTATION</h2>
          <div className="space-y-1 text-[15px] font-bold text-slate-500">
            <p>Date: <span className="text-slate-900">{formatDate(quotation.projectDetails?.date)}</span></p>
            <p>Ref: <span className="text-slate-900">#{quotation.projectDetails?.referenceNo || "001"}</span></p>
          </div>
        </div>
      </div>

      {/* 2. INFO GRID: Bill To & Project Details */}
      <div className="grid grid-cols-2 gap-12 text-[15px] mb-10">
        <div className="space-y-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100 pb-2">Billing Details</h3>
          <p className="text-xl font-black text-slate-900 uppercase">{quotation.projectDetails?.clientName || "Client Name"}</p>
        </div>
        <div className="space-y-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100 pb-2">Project Site</h3>
          <p className="text-xl font-black text-slate-900 uppercase">{quotation.projectDetails?.projectName || "Unnamed Project"}</p>
        </div>
      </div>

      {/* 3. COVER LETTER: Salutation, Subject & Body (Professional Box) */}
      <div className="p-7 bg-slate-50 border-l-4 border-indigo-600 rounded-r-2xl shadow-sm">
        <p className="text-[15px] mb-3 text-slate-800 font-bold">
          Dear Sir/Madam,
        </p>
        
        <p className="font-black text-[15px] text-slate-900 mb-3 underline underline-offset-4 decoration-indigo-200">
          Subject: {quotation.coverLetter?.subject || formattedSubject}
        </p>
        
        <p className="text-[15px] text-slate-700 leading-relaxed font-medium">
          {quotation.coverLetter?.body || "Thank you for your purchase enquiry for the above mentioned site. Please find below our quotation for Material & Labour for this site."}
        </p>
      </div>

    </div>
  );
}