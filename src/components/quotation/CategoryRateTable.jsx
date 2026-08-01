import React, { useState } from "react";
import { TableProperties, Plus, Trash2, ChevronDown, ChevronUp, Sparkles, Layers } from "lucide-react";

/**
 * 📊 CategoryRateTable — Premium Accordion Card for Rate Tables
 * Renders expandable/collapsible rate category cards, sticky table headers,
 * working area calculator, total rates, and responsive mobile-first UI.
 */
export default function CategoryRateTable({
  section,
  secIndex = 0,
  editable = false,
  onTitleChange,
  onWorkingAreaChange,
  onItemChange,
  onAddItem,
  onDeleteItem,
  onDeleteSection,
  canDeleteSection = true,
  defaultExpanded = true,
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!section) return null;

  const rows = section.rows || section.items || [];
  
  // Calculate Section Totals
  const sectionLabour = rows.reduce((acc, r) => acc + (Number(r.labour) || 0), 0);
  const sectionMaterial = rows.reduce((acc, r) => acc + (Number(r.material) || 0), 0);
  const sectionRatePerSqft = rows.reduce((acc, r) => acc + (Number(r.total) || (Number(r.labour || 0) + Number(r.material || 0))), 0);
  
  const workingArea = Number(section.workingArea || 0);
  const estimatedAmount = workingArea > 0 ? (workingArea * sectionRatePerSqft) : sectionRatePerSqft;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] transition-all duration-200 overflow-hidden mb-5">
      
      {/* 🏷️ ACCORDION HEADER BAR */}
      <div 
        className="p-5 flex items-center justify-between gap-3 bg-white select-none cursor-pointer border-b border-slate-100/80 hover:bg-slate-50/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100/60 flex items-center justify-center shrink-0 font-extrabold shadow-2xs">
            <Layers size={18} />
          </div>
          <div className="flex-1 min-w-0">
            {editable ? (
              <div onClick={(e) => e.stopPropagation()} className="w-full">
                <input
                  type="text"
                  value={section.title || ""}
                  onChange={(e) => onTitleChange && onTitleChange(section.id, e.target.value)}
                  className="text-sm sm:text-base font-extrabold text-slate-900 bg-transparent border-b border-slate-200 hover:border-blue-400 focus:border-blue-600 outline-none w-full transition-colors pb-0.5"
                  placeholder="Category Name (e.g. Interior Premium Finish)..."
                />
              </div>
            ) : (
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight truncate">
                {section.title || `Category #${secIndex + 1}`}
              </h3>
            )}
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 font-medium flex-wrap">
              <span>{rows.length} {rows.length === 1 ? 'item' : 'items'}</span>
              <span>•</span>
              <span className="font-bold text-blue-600">₹{sectionRatePerSqft.toFixed(2)}/Sqft</span>
              {workingArea > 0 && (
                <>
                  <span>•</span>
                  <span className="font-extrabold text-slate-700">{workingArea} Sqft</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls & Toggle Arrow */}
        <div className="flex items-center gap-2 shrink-0">
          {workingArea > 0 && (
            <div className="hidden sm:block text-right pr-2">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Estimated</span>
              <span className="text-xs font-black text-emerald-600">
                ₹{estimatedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {editable && canDeleteSection && onDeleteSection && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSection(section.id);
              }}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              title="Delete Category"
            >
              <Trash2 size={16} />
            </button>
          )}

          <div className="w-8 h-8 rounded-xl bg-slate-100/80 text-slate-600 flex items-center justify-center transition-transform duration-200">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </div>

      {/* 📋 EXPANDABLE ACCORDION BODY */}
      {isExpanded && (
        <div className="p-4 sm:p-6 bg-slate-50/30 space-y-4 animate-in slide-in-from-top-2 duration-200 border-t border-slate-100">
          {/* 📋 TABLE CONTAINER (Responsive Horizontal Scroll for Mobile) */}
          <div className="border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs bg-white">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-xs text-left border-collapse min-w-[520px]">
                <thead className="bg-slate-100/80 border-b border-slate-200">
                  <tr className="text-slate-700 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 w-5/12">Work &amp; Material Description</th>
                    <th className="py-3 px-4 text-center w-2/12">Labour Rate (₹)</th>
                    <th className="py-3 px-4 text-center w-2/12">Material Rate (₹)</th>
                    <th className="py-3 px-4 text-right w-3/12">Total / Sqft (₹)</th>
                    {editable && <th className="w-10"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.length > 0 ? (
                    rows.map((row, rowIdx) => {
                      const lab = Number(row.labour || 0);
                      const mat = Number(row.material || 0);
                      const tot = Number(row.total || lab + mat);

                      return (
                        <tr key={row.id || rowIdx} className="group bg-white hover:bg-slate-50/70 transition-colors">
                          {/* Work / Material Description */}
                          <td className="py-3 px-4">
                            {editable ? (
                              <textarea
                                rows={2}
                                value={row.work || row.desc || row.description || ""}
                                onChange={(e) => onItemChange && onItemChange(section.id, row.id, "work", e.target.value)}
                                placeholder="e.g. Surface Preparation, Wall Putty (3 Coats)..."
                                className="w-full bg-slate-50 border border-slate-200/90 focus:bg-white text-slate-900 font-medium text-xs resize-y placeholder-slate-400 p-2.5 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 transition-all min-h-[50px]"
                              />
                            ) : (
                              <span className="font-semibold text-slate-800 whitespace-pre-wrap leading-relaxed block">
                                {row.work || row.desc || row.description || "—"}
                              </span>
                            )}
                          </td>

                          {/* Labour Cost */}
                          <td className="py-3 px-3 text-center">
                            {editable ? (
                              <input
                                type="number"
                                inputMode="decimal"
                                value={row.labour !== undefined && row.labour !== null ? row.labour : ""}
                                onChange={(e) => onItemChange && onItemChange(section.id, row.id, "labour", e.target.value)}
                                className="w-full h-10 text-center bg-slate-50 border border-slate-200/90 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-bold text-slate-900 outline-none transition-all"
                              />
                            ) : (
                              <span className="font-semibold text-slate-700">₹{lab.toFixed(2)}</span>
                            )}
                          </td>

                          {/* Material Cost */}
                          <td className="py-3 px-3 text-center">
                            {editable ? (
                              <input
                                type="number"
                                inputMode="decimal"
                                value={row.material !== undefined && row.material !== null ? row.material : ""}
                                onChange={(e) => onItemChange && onItemChange(section.id, row.id, "material", e.target.value)}
                                className="w-full h-10 text-center bg-slate-50 border border-slate-200/90 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-bold text-slate-900 outline-none transition-all"
                              />
                            ) : (
                              <span className="font-semibold text-slate-700">₹{mat.toFixed(2)}</span>
                            )}
                          </td>

                          {/* Total Cost */}
                          <td className="py-3 px-4 text-right font-black text-slate-900 text-xs">
                            ₹{tot.toFixed(2)}
                          </td>

                          {/* Actions */}
                          {editable && (
                            <td className="py-3 px-2 text-center">
                              {rows.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => onDeleteItem && onDeleteItem(section.id, row.id)}
                                  className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-colors cursor-pointer"
                                  title="Delete Work Item"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={editable ? 5 : 4} className="py-6 text-center text-slate-400 font-medium">
                        No work items added yet.
                      </td>
                    </tr>
                  )}

                  {/* 🟦 CATEGORY ESTIMATION SUMMARY ROW */}
                  <tr className="bg-slate-900 text-white font-bold text-xs tracking-wide border-t border-slate-800">
                    <td className="py-3.5 px-4 uppercase text-[10px] tracking-wider">Category Rate Subtotal / Sqft</td>
                    <td className="py-3.5 px-3 text-center font-bold">₹{sectionLabour.toFixed(2)}</td>
                    <td className="py-3.5 px-3 text-center font-bold">₹{sectionMaterial.toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-right text-emerald-400 text-sm font-black">
                      ₹{sectionRatePerSqft.toFixed(2)}
                    </td>
                    {editable && <td></td>}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Add New Row Button (Editable Mode) */}
            {editable && onAddItem && (
              <div className="bg-white border-t border-slate-200/80 p-2">
                <button
                  type="button"
                  onClick={() => onAddItem(section.id)}
                  className="w-full py-2.5 text-xs font-extrabold text-blue-600 hover:bg-blue-50/70 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus size={15} /> Add Work Item
                </button>
              </div>
            )}
          </div>

          {/* 🧮 WORKING AREA & ESTIMATED AMOUNT CALCULATION BLOCK */}
          <div className="p-4 bg-white border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto justify-between sm:justify-start">
              {/* Total Working Area Box */}
              <div className="bg-slate-50/90 px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-0.5">
                  Total Area
                </label>
                <div className="flex items-center gap-1.5">
                  {editable ? (
                    <input
                      type="number"
                      inputMode="decimal"
                      value={section.workingArea || ""}
                      onChange={(e) => onWorkingAreaChange && onWorkingAreaChange(section.id, e.target.value)}
                      className="w-24 text-xs font-black text-slate-900 outline-none bg-transparent"
                      placeholder="e.g. 250"
                    />
                  ) : (
                    <span className="text-xs font-black text-slate-900">
                      {workingArea > 0 ? workingArea : "—"}
                    </span>
                  )}
                  <span className="text-xs font-bold text-slate-500">Sqft</span>
                </div>
              </div>

              <div className="text-slate-400 font-extrabold text-sm">×</div>

              {/* Rate / Sqft Box */}
              <div className="bg-slate-50/90 px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-0.5">
                  Rate / Sqft
                </label>
                <div className="text-xs font-black text-slate-900">
                  ₹{sectionRatePerSqft.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Category Estimated Amount Box */}
            <div className="text-right w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 flex items-center justify-between sm:block">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-0.5">
                Category Auto Total
              </label>
              <div className="text-base sm:text-lg font-black text-emerald-600 tracking-tight">
                ₹{estimatedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
