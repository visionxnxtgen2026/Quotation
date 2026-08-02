import React, { useState } from "react";
import {
  FileText, Sheet, FileCode, Image as ImageIcon, Check, Download,
  Calculator, Layers, ArrowUpRight, CheckCircle2, ShieldCheck, Printer
} from "lucide-react";
import { extractQuotationModel } from "../../utils/quotationMapper";

/**
 * 📊 EXCEL NATIVE SPREADSHEET TEMPLATE
 * Replaces PDF layout with a real Microsoft Excel worksheet UI.
 */
export function ExcelNativeTemplate({ data }) {
  const [activeSheet, setActiveSheet] = useState("quotation"); // quotation | material | labour | cost

  if (!data) return null;

  const m = extractQuotationModel(data);
  const currencySymbol = m.currencySymbol;
  const refNo = m.referenceNo;
  const dateStr = m.dateStr;
  const customerName = m.clientName;
  const projectTitle = m.projectName;
  const companyName = m.companyName;

  const items = m.items;
  const subtotal = m.subtotal;
  const discount = m.discountAmount;
  const tax = m.taxAmount;
  const grandTotal = m.grandTotal;

  return (
    <div className="w-full bg-[#F3F3F3] text-slate-800 font-sans border border-slate-300 rounded-xl overflow-hidden shadow-xl animate-in fade-in duration-200">
      
      {/* ── 1. EXCEL TITLE BAR & RIBBON ── */}
      <div className="bg-[#107C41] text-white px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2 min-w-0">
          <Sheet size={18} className="text-white shrink-0" />
          <span className="text-xs font-bold tracking-wide truncate">
            {refNo}.xlsx — Microsoft Excel Worksheet
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono bg-emerald-800/80 px-2.5 py-1 rounded border border-emerald-600 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> LIVE FORMULA MODE
        </div>
      </div>

      {/* Excel Menu Bar */}
      <div className="bg-white border-b border-slate-200 px-3 py-1 flex items-center gap-4 text-[11px] font-semibold text-slate-600 select-none overflow-x-auto no-scrollbar">
        <span className="text-[#107C41] font-bold border-b-2 border-[#107C41] pb-1 cursor-pointer">Home</span>
        <span className="hover:text-slate-900 cursor-pointer">Insert</span>
        <span className="hover:text-slate-900 cursor-pointer">Page Layout</span>
        <span className="hover:text-slate-900 cursor-pointer font-bold text-slate-900">Formulas</span>
        <span className="hover:text-slate-900 cursor-pointer">Data</span>
        <span className="hover:text-slate-900 cursor-pointer">Review</span>
        <span className="hover:text-slate-900 cursor-pointer">View</span>
      </div>

      {/* Excel Formula Bar */}
      <div className="bg-[#F8F9FA] border-b border-slate-300 px-3 py-1.5 flex items-center gap-3 text-xs font-mono text-slate-700">
        <div className="bg-white border border-slate-300 px-2 py-0.5 rounded text-[11px] font-bold text-slate-500 shrink-0">
          H{items.length + 8}
        </div>
        <span className="font-serif italic font-bold text-slate-400 select-none">fx</span>
        <div className="flex-1 bg-white border border-slate-300 px-2.5 py-0.5 rounded text-xs font-mono text-slate-900 overflow-x-auto">
          {activeSheet === "quotation" && `=SUM(H6:H${items.length + 5})`}
          {activeSheet === "material" && `=SUM(F6:F${items.length + 5})`}
          {activeSheet === "labour" && `=SUM(F6:F${items.length + 5})`}
          {activeSheet === "cost" && `=H${items.length + 8}*0.18`}
        </div>
      </div>

      {/* ── 2. EXCEL WORKSHEET GRID VIEWPORT ── */}
      <div className="overflow-x-auto p-2 bg-white min-h-[420px]">
        <table className="w-full border-collapse text-xs font-sans text-slate-800">
          <thead>
            {/* Excel Column Headers (A, B, C, D, E, F, G, H) */}
            <tr className="bg-[#E6E6E6] text-slate-600 font-mono text-[11px] text-center border-b border-slate-300 select-none">
              <th className="w-10 py-1 bg-[#D9D9D9] border-r border-slate-300 font-normal">#</th>
              <th className="w-12 py-1 border-r border-slate-300 font-normal">A</th>
              <th className="py-1 border-r border-slate-300 font-normal min-w-[200px]">B</th>
              <th className="w-16 py-1 border-r border-slate-300 font-normal">C</th>
              <th className="w-16 py-1 border-r border-slate-300 font-normal">D</th>
              <th className="w-24 py-1 border-r border-slate-300 font-normal">E</th>
              <th className="w-24 py-1 border-r border-slate-300 font-normal">F</th>
              <th className="w-24 py-1 border-r border-slate-300 font-normal">G</th>
              <th className="w-28 py-1 border-r border-slate-300 font-normal">H</th>
            </tr>
          </thead>

          <tbody>
            {/* SHEET 1: QUOTATION SHEET */}
            {activeSheet === "quotation" && (
              <>
                {/* Row 1: Header Meta Info */}
                <tr className="border-b border-slate-200">
                  <td className="bg-[#E6E6E6] text-slate-500 font-mono text-[10px] text-center py-1 border-r border-slate-300">1</td>
                  <td className="font-bold text-slate-500 p-1.5 border-r border-slate-200 bg-slate-50/50">Quotation No</td>
                  <td className="font-bold text-slate-900 p-1.5 border-r border-slate-200 font-mono">{refNo}</td>
                  <td className="font-bold text-slate-500 p-1.5 border-r border-slate-200 bg-slate-50/50">Date</td>
                  <td colSpan={2} className="p-1.5 border-r border-slate-200 font-mono">{dateStr}</td>
                  <td className="font-bold text-slate-500 p-1.5 border-r border-slate-200 bg-slate-50/50">Currency</td>
                  <td colSpan={2} className="p-1.5 font-bold text-emerald-700 font-mono">{currencySymbol} ({data.currencyCode || "INR"})</td>
                </tr>

                {/* Row 2: Customer Meta Info */}
                <tr className="border-b border-slate-200">
                  <td className="bg-[#E6E6E6] text-slate-500 font-mono text-[10px] text-center py-1 border-r border-slate-300">2</td>
                  <td className="font-bold text-slate-500 p-1.5 border-r border-slate-200 bg-slate-50/50">Customer</td>
                  <td className="font-bold text-slate-900 p-1.5 border-r border-slate-200">{customerName}</td>
                  <td className="font-bold text-slate-500 p-1.5 border-r border-slate-200 bg-slate-50/50">Project</td>
                  <td colSpan={5} className="p-1.5 font-medium text-slate-800">{projectTitle}</td>
                </tr>

                {/* Row 3: Company Info */}
                <tr className="border-b border-slate-200">
                  <td className="bg-[#E6E6E6] text-slate-500 font-mono text-[10px] text-center py-1 border-r border-slate-300">3</td>
                  <td className="font-bold text-slate-500 p-1.5 border-r border-slate-200 bg-slate-50/50">Company</td>
                  <td colSpan={7} className="font-bold text-slate-900 p-1.5">{companyName}</td>
                </tr>

                {/* Row 4: Blank Row */}
                <tr className="border-b border-slate-200 bg-slate-50/30">
                  <td className="bg-[#E6E6E6] text-slate-400 font-mono text-[10px] text-center py-1 border-r border-slate-300">4</td>
                  <td colSpan={8} className="py-1"></td>
                </tr>

                {/* Row 5: Items Table Column Header */}
                <tr className="bg-[#107C41] text-white font-bold text-xs border-b border-slate-300">
                  <td className="bg-[#0B5C30] text-slate-200 font-mono text-[10px] text-center py-1.5 border-r border-emerald-800">5</td>
                  <td className="p-2 text-center border-r border-emerald-600">S.No</td>
                  <td className="p-2 border-r border-emerald-600">Description</td>
                  <td className="p-2 text-center border-r border-emerald-600">Qty</td>
                  <td className="p-2 text-center border-r border-emerald-600">Unit</td>
                  <td className="p-2 text-right border-r border-emerald-600">Labour Rate</td>
                  <td className="p-2 text-right border-r border-emerald-600">Material Rate</td>
                  <td className="p-2 text-right border-r border-emerald-600">Total Rate</td>
                  <td className="p-2 text-right">Amount ({currencySymbol})</td>
                </tr>

                {/* Item Rows */}
                {items.map((item, idx) => {
                  const qty = parseFloat(item.quantity || item.qty || 1);
                  const unit = item.unit || "Sq.Ft";
                  const labourRate = parseFloat(item.labourRate || 0);
                  const materialRate = parseFloat(item.materialRate || item.rate || 0);
                  const totalRate = labourRate + materialRate;
                  const itemAmount = parseFloat(item.amount || item.totalPrice || qty * totalRate);

                  return (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-emerald-50/40 transition-colors">
                      <td className="bg-[#E6E6E6] text-slate-500 font-mono text-[10px] text-center py-1.5 border-r border-slate-300">{idx + 6}</td>
                      <td className="p-2 text-center font-mono border-r border-slate-200 text-slate-500">{idx + 1}</td>
                      <td className="p-2 font-medium border-r border-slate-200 text-slate-900">
                        {item.description || item.name || `Item ${idx + 1}`}
                      </td>
                      <td className="p-2 text-center font-mono border-r border-slate-200">{qty}</td>
                      <td className="p-2 text-center font-mono border-r border-slate-200 text-slate-500">{unit}</td>
                      <td className="p-2 text-right font-mono border-r border-slate-200">{currencySymbol}{labourRate.toLocaleString()}</td>
                      <td className="p-2 text-right font-mono border-r border-slate-200">{currencySymbol}{materialRate.toLocaleString()}</td>
                      <td className="p-2 text-right font-mono border-r border-slate-200 bg-slate-50/50">
                        <span className="text-[10px] text-slate-400 font-mono mr-1">=E{idx + 6}+F{idx + 6}</span>
                        {currencySymbol}{totalRate.toLocaleString()}
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-slate-900 bg-slate-50">
                        <span className="text-[10px] text-slate-400 font-mono mr-1">=C{idx + 6}*G{idx + 6}</span>
                        {currencySymbol}{itemAmount.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}

                {/* Totals Section Rows */}
                <tr className="border-b border-slate-200 bg-slate-50 font-bold">
                  <td className="bg-[#E6E6E6] text-slate-500 font-mono text-[10px] text-center py-1.5 border-r border-slate-300">{items.length + 6}</td>
                  <td colSpan={7} className="p-2 text-right border-r border-slate-200 font-sans uppercase tracking-wider text-[11px] text-slate-600">Subtotal</td>
                  <td className="p-2 text-right font-mono text-slate-900 font-extrabold border-l-2 border-slate-300">
                    <span className="text-[10px] text-emerald-600 font-mono mr-1">=SUM(H6:H{items.length + 5})</span>
                    {currencySymbol}{subtotal.toLocaleString()}
                  </td>
                </tr>

                {discount > 0 && (
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <td className="bg-[#E6E6E6] text-slate-500 font-mono text-[10px] text-center py-1.5 border-r border-slate-300">{items.length + 7}</td>
                    <td colSpan={7} className="p-2 text-right border-r border-slate-200 font-sans uppercase tracking-wider text-[11px] text-slate-600">Discount</td>
                    <td className="p-2 text-right font-mono text-rose-600 font-bold">
                      -{currencySymbol}{discount.toLocaleString()}
                    </td>
                  </tr>
                )}

                <tr className="border-b border-slate-200 bg-slate-50">
                  <td className="bg-[#E6E6E6] text-slate-500 font-mono text-[10px] text-center py-1.5 border-r border-slate-300">{items.length + 8}</td>
                  <td colSpan={7} className="p-2 text-right border-r border-slate-200 font-sans uppercase tracking-wider text-[11px] text-slate-600">GST (18%)</td>
                  <td className="p-2 text-right font-mono text-slate-800 font-bold">
                    <span className="text-[10px] text-emerald-600 font-mono mr-1">=H{items.length + 6}*0.18</span>
                    +{currencySymbol}{tax.toLocaleString()}
                  </td>
                </tr>

                {/* Grand Total Row */}
                <tr className="bg-[#107C41] text-white font-extrabold border-t-2 border-b-2 border-slate-400">
                  <td className="bg-[#0B5C30] text-slate-200 font-mono text-[10px] text-center py-2 border-r border-emerald-800">{items.length + 9}</td>
                  <td colSpan={7} className="p-2.5 text-right border-r border-emerald-600 uppercase tracking-widest text-xs">GRAND TOTAL</td>
                  <td className="p-2.5 text-right font-mono text-sm tracking-tight text-white bg-[#0B5C30]">
                    <span className="text-[10px] text-emerald-300 font-mono mr-1.5">=H{items.length + 6}-H{items.length + 7}+H{items.length + 8}</span>
                    {currencySymbol}{grandTotal.toLocaleString()}
                  </td>
                </tr>
              </>
            )}

            {/* SHEET 2: MATERIAL SUMMARY */}
            {activeSheet === "material" && (
              <>
                <tr className="bg-[#107C41] text-white font-bold text-xs">
                  <td className="bg-[#0B5C30] text-slate-200 font-mono text-[10px] text-center py-1.5 border-r border-emerald-800">1</td>
                  <td className="p-2 text-center border-r border-emerald-600">Code</td>
                  <td className="p-2 border-r border-emerald-600">Material Name</td>
                  <td className="p-2 text-center border-r border-emerald-600">Qty</td>
                  <td className="p-2 text-center border-r border-emerald-600">Unit</td>
                  <td className="p-2 text-right border-r border-emerald-600">Unit Cost</td>
                  <td colSpan={3} className="p-2 text-right">Material Total ({currencySymbol})</td>
                </tr>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-200 hover:bg-emerald-50/40">
                    <td className="bg-[#E6E6E6] text-slate-500 font-mono text-[10px] text-center py-1.5 border-r border-slate-300">{idx + 2}</td>
                    <td className="p-2 text-center font-mono border-r border-slate-200">MAT-0{idx + 1}</td>
                    <td className="p-2 font-medium border-r border-slate-200">{item.description || `Material Item ${idx + 1}`}</td>
                    <td className="p-2 text-center font-mono border-r border-slate-200">{item.quantity || 1}</td>
                    <td className="p-2 text-center font-mono border-r border-slate-200">{item.unit || "Sq.Ft"}</td>
                    <td className="p-2 text-right font-mono border-r border-slate-200">{currencySymbol}{(parseFloat(item.materialRate || item.rate || 100)).toLocaleString()}</td>
                    <td colSpan={3} className="p-2 text-right font-mono font-bold">{currencySymbol}{(parseFloat(item.amount || item.totalPrice || 100)).toLocaleString()}</td>
                  </tr>
                ))}
              </>
            )}

            {/* SHEET 3: LABOUR SUMMARY */}
            {activeSheet === "labour" && (
              <>
                <tr className="bg-[#107C41] text-white font-bold text-xs">
                  <td className="bg-[#0B5C30] text-slate-200 font-mono text-[10px] text-center py-1.5 border-r border-emerald-800">1</td>
                  <td className="p-2 text-center border-r border-emerald-600">Task ID</td>
                  <td className="p-2 border-r border-emerald-600">Labour Task Description</td>
                  <td className="p-2 text-center border-r border-emerald-600">Crew Size</td>
                  <td className="p-2 text-center border-r border-emerald-600">Hours</td>
                  <td className="p-2 text-right border-r border-emerald-600">Hourly Rate</td>
                  <td colSpan={3} className="p-2 text-right">Labour Total ({currencySymbol})</td>
                </tr>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-200 hover:bg-emerald-50/40">
                    <td className="bg-[#E6E6E6] text-slate-500 font-mono text-[10px] text-center py-1.5 border-r border-slate-300">{idx + 2}</td>
                    <td className="p-2 text-center font-mono border-r border-slate-200">LBR-0{idx + 1}</td>
                    <td className="p-2 font-medium border-r border-slate-200">{item.description || `Labour Task ${idx + 1}`}</td>
                    <td className="p-2 text-center font-mono border-r border-slate-200">2 Workers</td>
                    <td className="p-2 text-center font-mono border-r border-slate-200">8 Hrs</td>
                    <td className="p-2 text-right font-mono border-r border-slate-200">{currencySymbol}{(parseFloat(item.labourRate || 50)).toLocaleString()}</td>
                    <td colSpan={3} className="p-2 text-right font-mono font-bold">{currencySymbol}{(parseFloat(item.labourRate || 50) * (parseFloat(item.quantity || 1))).toLocaleString()}</td>
                  </tr>
                ))}
              </>
            )}

            {/* SHEET 4: COST ANALYSIS */}
            {activeSheet === "cost" && (
              <>
                <tr className="bg-[#107C41] text-white font-bold text-xs">
                  <td className="bg-[#0B5C30] text-slate-200 font-mono text-[10px] text-center py-1.5 border-r border-emerald-800">1</td>
                  <td colSpan={2} className="p-2 border-r border-emerald-600">Cost Category</td>
                  <td colSpan={3} className="p-2 text-right border-r border-emerald-600">Allocated Amount</td>
                  <td colSpan={3} className="p-2 text-center">% of Total</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="bg-[#E6E6E6] text-slate-500 font-mono text-[10px] text-center py-1.5 border-r border-slate-300">2</td>
                  <td colSpan={2} className="p-2 font-bold text-slate-900 border-r border-slate-200">Materials &amp; Supplies</td>
                  <td colSpan={3} className="p-2 text-right font-mono border-r border-slate-200">{currencySymbol}{(subtotal * 0.65).toLocaleString()}</td>
                  <td colSpan={3} className="p-2 text-center font-mono font-bold text-emerald-700">65.0%</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="bg-[#E6E6E6] text-slate-500 font-mono text-[10px] text-center py-1.5 border-r border-slate-300">3</td>
                  <td colSpan={2} className="p-2 font-bold text-slate-900 border-r border-slate-200">Labour &amp; Execution</td>
                  <td colSpan={3} className="p-2 text-right font-mono border-r border-slate-200">{currencySymbol}{(subtotal * 0.35).toLocaleString()}</td>
                  <td colSpan={3} className="p-2 text-center font-mono font-bold text-blue-700">35.0%</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* ── 3. EXCEL SHEET TABS FOOTER ── */}
      <div className="bg-[#E6E6E6] border-t border-slate-300 px-3 py-1.5 flex items-center justify-between text-xs font-semibold text-slate-700 select-none">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: "quotation", name: "📄 Quotation" },
            { id: "material", name: "📊 Material Summary" },
            { id: "labour", name: "🔨 Labour Summary" },
            { id: "cost", name: "📈 Cost Analysis" },
          ].map((sheet) => {
            const isActive = activeSheet === sheet.id;
            return (
              <button
                key={sheet.id}
                onClick={() => setActiveSheet(sheet.id)}
                className={`px-3 py-1 rounded-t-md text-[11px] font-bold transition-all cursor-pointer border ${
                  isActive
                    ? "bg-white text-[#107C41] border-slate-300 border-b-transparent shadow-2xs"
                    : "bg-[#D9D9D9] text-slate-600 border-transparent hover:bg-slate-200"
                }`}
              >
                {sheet.name}
              </button>
            );
          })}
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-500">
          <span>READY</span>
          <span>•</span>
          <span>100% ZOOM</span>
        </div>
      </div>

    </div>
  );
}

/**
 * 📝 WORD NATIVE EDITABLE DOCUMENT TEMPLATE
 * Replaces PDF layout with a real Microsoft Word document layout.
 */
export function WordNativeTemplate({ data }) {
  if (!data) return null;

  const m = extractQuotationModel(data);
  const currencySymbol = m.currencySymbol;
  const refNo = m.referenceNo;
  const dateStr = m.dateStr;
  const customerName = m.clientName;
  const projectTitle = m.projectName;
  const companyName = m.companyName;
  const items = m.items;
  const subtotal = m.subtotal;
  const discount = m.discountAmount;
  const tax = m.taxAmount;
  const grandTotal = m.grandTotal;
  const terms = m.terms;

  return (
    <div className="w-full bg-white text-slate-900 font-sans rounded-xl border border-slate-300 shadow-xl overflow-hidden animate-in fade-in duration-200">
      
      {/* ── 1. WORD TITLE BAR & RIBBON ── */}
      <div className="bg-[#2B579A] text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <FileCode size={18} className="text-white shrink-0" />
          <span className="text-xs font-bold tracking-wide truncate">
            {refNo}.docx — Microsoft Word Document
          </span>
        </div>
        <div className="text-[10px] font-mono bg-blue-900/80 px-2.5 py-0.5 rounded text-blue-100">
          EDITABLE DOCUMENT
        </div>
      </div>

      {/* Word Ribbon Tools Menu */}
      <div className="bg-[#F3F2F1] border-b border-slate-200 px-4 py-1.5 flex items-center gap-4 text-xs font-medium text-slate-700 select-none overflow-x-auto no-scrollbar">
        <span className="text-[#2B579A] font-bold border-b-2 border-[#2B579A] pb-1">Home</span>
        <span className="hover:text-slate-900">Insert</span>
        <span className="hover:text-slate-900">Layout</span>
        <span className="hover:text-slate-900">References</span>
        <span className="hover:text-slate-900">Mailings</span>
        <span className="hover:text-slate-900">Review</span>
        <span className="hover:text-slate-900">View</span>
      </div>

      {/* ── 2. WORD CANVAS PAPER PAGE ── */}
      <div className="p-8 sm:p-12 space-y-6 max-w-3xl mx-auto font-sans leading-relaxed">
        
        {/* Word Document Title Header */}
        <div className="border-b-2 border-[#2B579A] pb-4">
          <h1 className="text-2xl font-bold text-[#2B579A] tracking-tight">{companyName}</h1>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Official Quotation Proposal</p>
        </div>

        {/* Meta Info Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div>
            <p className="text-slate-400 font-bold uppercase text-[10px]">Prepared For</p>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{customerName}</p>
            <p className="text-slate-600 font-medium">{projectTitle}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 font-bold uppercase text-[10px]">Reference Details</p>
            <p className="font-bold font-mono text-slate-900 text-sm mt-0.5">{refNo}</p>
            <p className="text-slate-600 font-medium">{dateStr}</p>
          </div>
        </div>

        {/* Scope of Work Heading */}
        <div>
          <h2 className="text-sm font-bold text-[#2B579A] uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
            1. Scope of Work &amp; Pricing Breakdown
          </h2>

          <table className="w-full text-xs text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-[#2B579A] text-white font-bold">
                <th className="p-2 border border-slate-300 text-center w-10">#</th>
                <th className="p-2 border border-slate-300">Description</th>
                <th className="p-2 border border-slate-300 text-center w-14">Qty</th>
                <th className="p-2 border border-slate-300 text-right w-24">Rate</th>
                <th className="p-2 border border-slate-300 text-right w-24">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="p-2 border border-slate-300 text-center font-mono">{idx + 1}</td>
                  <td className="p-2 border border-slate-300 font-medium">{item.description || `Item ${idx + 1}`}</td>
                  <td className="p-2 border border-slate-300 text-center font-mono">{item.quantity || 1}</td>
                  <td className="p-2 border border-slate-300 text-right font-mono">{currencySymbol}{(parseFloat(item.materialRate || item.rate || 0)).toLocaleString()}</td>
                  <td className="p-2 border border-slate-300 text-right font-mono font-bold">{currencySymbol}{(parseFloat(item.amount || item.totalPrice || 0)).toLocaleString()}</td>
                </tr>
              ))}
              <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                <td colSpan={4} className="p-2 text-right border border-slate-300">Subtotal</td>
                <td className="p-2 text-right font-mono border border-slate-300">{currencySymbol}{subtotal.toLocaleString()}</td>
              </tr>
              {discount > 0 && (
                <tr className="bg-slate-50 text-rose-600 font-bold">
                  <td colSpan={4} className="p-2 text-right border border-slate-300">Discount</td>
                  <td className="p-2 text-right font-mono border border-slate-300">-{currencySymbol}{discount.toLocaleString()}</td>
                </tr>
              )}
              <tr className="bg-slate-50 font-bold">
                <td colSpan={4} className="p-2 text-right border border-slate-300">GST (18%)</td>
                <td className="p-2 text-right font-mono border border-slate-300">+{currencySymbol}{tax.toLocaleString()}</td>
              </tr>
              <tr className="bg-[#2B579A] text-white font-extrabold text-sm">
                <td colSpan={4} className="p-2.5 text-right border border-slate-300 uppercase">Grand Total</td>
                <td className="p-2.5 text-right font-mono border border-slate-300">{currencySymbol}{grandTotal.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Terms & Signature Section */}
        <div className="pt-4 border-t border-slate-200 space-y-4">
          <h2 className="text-sm font-bold text-[#2B579A] uppercase tracking-wider border-b border-slate-200 pb-1">
            2. Standard Terms &amp; Conditions
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed italic">
            1. Quotation valid for 30 days from date of issue.<br />
            2. Work will commence within 3 business days of receiving advance payment.<br />
            3. Any change in scope will be charged extra.
          </p>
        </div>

      </div>
    </div>
  );
}

/**
 * 🖼️ IMAGE NATIVE HIGH-RES GRAPHIC SNAPSHOT TEMPLATE
 * Replaces PDF layout with high-resolution image preview canvas.
 */
export function ImageNativeTemplate({ data, children }) {
  if (!data) return null;

  const refNo = data.referenceNo || data.quotationNo || "QTN-2026-0001";

  return (
    <div className="w-full bg-slate-900 text-white rounded-xl border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in duration-200">
      
      {/* Image Viewer Header */}
      <div className="bg-slate-950 px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ImageIcon size={18} className="text-purple-400" />
          <span className="text-xs font-bold font-mono text-purple-300">
            {refNo}.png • 300 DPI Graphic Snapshot
          </span>
        </div>
        <span className="text-[10px] font-mono bg-purple-900/60 text-purple-200 px-2.5 py-0.5 rounded border border-purple-700/60">
          2480 × 3508 PX (A4 IMAGE)
        </span>
      </div>

      {/* Render children (PDF layout wrapped inside image frame) */}
      <div className="p-4 sm:p-6 bg-slate-900 flex justify-center">
        <div className="shadow-2xl rounded-xl overflow-hidden border border-slate-700">
          {children}
        </div>
      </div>
    </div>
  );
}
