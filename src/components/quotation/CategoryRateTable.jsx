import React, { useState } from "react";
import {
  TableProperties, Plus, Trash2, ChevronDown, ChevronUp, Sparkles, Layers,
  X, Edit2, ArrowLeft, ArrowRight, Check
} from "lucide-react";

/**
 * 📊 CategoryRateTable — Dynamic Pricing Accordion Card
 * Supports dynamic pricing components (Labour, Material, Primer, Putty, Scaffolding, etc.),
 * independent category Area (Sqft), auto-expanding table headers, and responsive layout.
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
  onComponentsChange,
  canDeleteSection = true,
  defaultExpanded = true,
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showAddComponentModal, setShowAddComponentModal] = useState(false);
  const [newCompName, setNewCompName] = useState("");
  const [editingCompId, setEditingCompId] = useState(null);
  const [editingCompName, setEditingCompName] = useState("");

  if (!section) return null;

  const rows = section.rows || section.items || [];
  
  // Resolve Pricing Components for this section (Default: Labour & Material)
  const components = (section.components && section.components.length > 0)
    ? section.components
    : [
        { id: "labour", name: "Labour" },
        { id: "material", name: "Material" }
      ];

  // Helper to get component rate for a row
  const getCompRate = (row, compId) => {
    if (row.componentRates && row.componentRates[compId] !== undefined) {
      return Number(row.componentRates[compId]) || 0;
    }
    if (compId === "labour") return Number(row.labour || 0);
    if (compId === "material") return Number(row.material || 0);
    if (row[compId] !== undefined) return Number(row[compId]) || 0;
    return 0;
  };

  // Helper to calculate total rate for a single row
  const getRowTotal = (row) => {
    return components.reduce((acc, c) => acc + getCompRate(row, c.id), 0);
  };

  // Calculate Section Subtotals per component and Total Rate/Sqft
  const compSubtotals = components.reduce((acc, c) => {
    acc[c.id] = rows.reduce((rAcc, r) => rAcc + getCompRate(r, c.id), 0);
    return acc;
  }, {});

  const sectionRatePerSqft = rows.reduce((acc, r) => acc + getRowTotal(r), 0);
  const workingArea = Number(section.workingArea || 0);
  const estimatedAmount = workingArea > 0 ? (workingArea * sectionRatePerSqft) : sectionRatePerSqft;

  // Component Management Handlers
  const handleAddComponent = (nameToAdd) => {
    const name = (nameToAdd || newCompName).trim();
    if (!name) return;

    const compId = `comp_${Date.now()}`;
    const updated = [...components, { id: compId, name }];
    if (onComponentsChange) {
      onComponentsChange(section.id, updated);
    }
    setNewCompName("");
    setShowAddComponentModal(false);
  };

  const handleDeleteComponent = (compId) => {
    if (components.length <= 1) {
      alert("At least one pricing component is required.");
      return;
    }
    const updated = components.filter(c => c.id !== compId);
    if (onComponentsChange) {
      onComponentsChange(section.id, updated);
    }
  };

  const handleRenameComponent = (compId) => {
    if (!editingCompName.trim()) return;
    const updated = components.map(c => c.id === compId ? { ...c, name: editingCompName.trim() } : c);
    if (onComponentsChange) {
      onComponentsChange(section.id, updated);
    }
    setEditingCompId(null);
    setEditingCompName("");
  };

  const handleMoveComponent = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= components.length) return;
    const updated = [...components];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    if (onComponentsChange) {
      onComponentsChange(section.id, updated);
    }
  };

  const PRESETS = ["Labour", "Material", "Primer", "Putty", "Texture", "Scaffolding", "Transport", "Others"];

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
          
          {/* ➕ ADD PRICING COMPONENT BUTTON & PRESETS MODAL */}
          {editable && (
            <div className="flex items-center justify-between gap-3 flex-wrap bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-700">Pricing Components:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {components.map((c, cIdx) => (
                    <span key={c.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-100">
                      {c.name}
                      {editable && components.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComponent(c.id)}
                          className="hover:text-red-600 cursor-pointer ml-0.5"
                          title={`Remove ${c.name}`}
                        >
                          <X size={12} />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddComponentModal(!showAddComponentModal)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer ml-auto"
              >
                <Plus size={14} /> + Add Pricing Component
              </button>
            </div>
          )}

          {/* Add Pricing Component Popover Panel */}
          {showAddComponentModal && editable && (
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-blue-600" /> Select or Enter Pricing Component Name
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddComponentModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((preset) => {
                  const exists = components.some(c => c.name.toLowerCase() === preset.toLowerCase());
                  return (
                    <button
                      key={preset}
                      type="button"
                      disabled={exists}
                      onClick={() => handleAddComponent(preset)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        exists
                          ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                          : "bg-white hover:bg-blue-600 hover:text-white text-slate-700 border border-slate-200 shadow-2xs active:scale-95"
                      }`}
                    >
                      + {preset}
                    </button>
                  );
                })}
              </div>

              {/* Custom Input */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newCompName}
                  onChange={(e) => setNewCompName(e.target.value)}
                  placeholder="Custom component name (e.g. Scaffolding, Transport)..."
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-600"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddComponent();
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleAddComponent()}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* 📋 TABLE CONTAINER (Dynamic Columns & Responsive Scroll) */}
          <div className="border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs bg-white">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-xs text-left border-collapse min-w-[600px]">
                <thead className="bg-slate-100/80 border-b border-slate-200">
                  <tr className="text-slate-700 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 min-w-[200px]">Work &amp; Material Description</th>

                    {/* DYNAMIC PRICING COMPONENT HEADERS */}
                    {components.map((c, cIdx) => (
                      <th key={c.id} className="py-3 px-3 text-center min-w-[120px]">
                        <div className="flex items-center justify-center gap-1">
                          {editingCompId === c.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={editingCompName}
                                onChange={(e) => setEditingCompName(e.target.value)}
                                className="w-20 px-1 py-0.5 text-center text-[10px] font-bold bg-white border border-blue-500 rounded outline-none"
                                autoFocus
                              />
                              <button onClick={() => handleRenameComponent(c.id)} className="text-emerald-600 p-0.5 cursor-pointer">
                                <Check size={12} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span>{c.name} (₹)</span>
                              {editable && (
                                <button
                                  onClick={() => {
                                    setEditingCompId(c.id);
                                    setEditingCompName(c.name);
                                  }}
                                  className="text-slate-400 hover:text-blue-600 p-0.5 cursor-pointer"
                                  title="Rename Component"
                                >
                                  <Edit2 size={10} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </th>
                    ))}

                    <th className="py-3 px-4 text-right min-w-[120px]">Total / Sqft (₹)</th>
                    {editable && <th className="w-10"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.length > 0 ? (
                    rows.map((row, rowIdx) => {
                      const rowTot = getRowTotal(row);

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

                          {/* DYNAMIC PRICING COMPONENT RATE INPUTS */}
                          {components.map((c) => {
                            const val = getCompRate(row, c.id);
                            return (
                              <td key={c.id} className="py-3 px-3 text-center">
                                {editable ? (
                                  <input
                                    type="number"
                                    inputMode="decimal"
                                    value={val !== 0 ? val : ""}
                                    onChange={(e) => onItemChange && onItemChange(section.id, row.id, c.id, e.target.value)}
                                    placeholder="0"
                                    className="w-full h-10 text-center bg-slate-50 border border-slate-200/90 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-bold text-slate-900 outline-none transition-all"
                                  />
                                ) : (
                                  <span className="font-semibold text-slate-700">₹{val.toFixed(2)}</span>
                                )}
                              </td>
                            );
                          })}

                          {/* Total Cost / Sqft */}
                          <td className="py-3 px-4 text-right font-black text-slate-900 text-xs">
                            ₹{rowTot.toFixed(2)}
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
                      <td colSpan={components.length + (editable ? 3 : 2)} className="py-6 text-center text-slate-400 font-medium">
                        No work items added yet.
                      </td>
                    </tr>
                  )}

                  {/* 🟦 CATEGORY ESTIMATION SUMMARY ROW */}
                  <tr className="bg-slate-900 text-white font-bold text-xs tracking-wide border-t border-slate-800">
                    <td className="py-3.5 px-4 uppercase text-[10px] tracking-wider">Category Rate Subtotal / Sqft</td>
                    
                    {components.map((c) => (
                      <td key={c.id} className="py-3.5 px-3 text-center font-bold">
                        ₹{(compSubtotals[c.id] || 0).toFixed(2)}
                      </td>
                    ))}

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
                  Category Area (Sqft)
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
