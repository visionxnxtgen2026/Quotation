import React from "react";
import CategoryRateTable from "./CategoryRateTable";
import { TableProperties, Layers } from "lucide-react";

export default function RateTableForm({ 
  rateSections, 
  handleSectionTitleChange, 
  handleSectionAreaChange,
  handleRateTableChange, 
  addRateRow, 
  deleteRateRow, 
  addSection, 
  deleteSection, 
  totalSqft 
}) {
  const grandTotalAmount = rateSections?.reduce((total, section) => {
    const sectionTotalRate = (section.rows || []).reduce((sum, row) => sum + (Number(row.total) || 0), 0);
    const sectionArea = Number(section.workingArea) || 0;
    const sectionEst = sectionArea > 0 ? (sectionArea * sectionTotalRate) : sectionTotalRate;
    return total + sectionEst;
  }, 0) || 0;

  return (
    <div>
      {rateSections?.map((section, secIdx) => (
        <CategoryRateTable
          key={section.id || secIdx}
          section={section}
          secIndex={secIdx}
          editable={true}
          onTitleChange={handleSectionTitleChange}
          onWorkingAreaChange={handleSectionAreaChange}
          onItemChange={handleRateTableChange}
          onAddItem={addRateRow}
          onDeleteItem={deleteRateRow}
          onDeleteSection={deleteSection}
          canDeleteSection={rateSections.length > 1}
        />
      ))}

      {/* ADD NEW CATEGORY BUTTON */}
      <button 
        onClick={addSection}
        className="w-full border-2 border-dashed border-slate-300 hover:border-blue-600 bg-white hover:bg-blue-50/50 text-slate-700 hover:text-blue-700 rounded-2xl py-4 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs font-extrabold text-xs uppercase tracking-wider mb-6 active:scale-98"
      >
        <div className="w-7 h-7 rounded-lg bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0">
          <Layers size={16} />
        </div>
        <span>+ Add New Rate Category</span>
      </button>

      {/* GRAND TOTAL SUMMARY */}
      <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between border border-slate-800 gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 shrink-0 font-extrabold">
            <TableProperties size={20}/>
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white leading-tight">Final Grand Total</h3>
            <p className="text-slate-400 text-xs mt-0.5 font-medium">Combined estimated total amount across all categories</p>
          </div>
        </div>
        <div className="text-right w-full sm:w-auto">
          <div className="text-2xl font-black text-emerald-400 tracking-tight">
            ₹ {grandTotalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    </div>
  );
}