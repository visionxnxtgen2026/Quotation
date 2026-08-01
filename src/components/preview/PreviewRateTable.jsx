import React from "react";
import CategoryRateTable from "../quotation/CategoryRateTable";

export default function PreviewRateTable({ sections, rateSections, rateTable, formatNum }) {
  const categories = sections || rateSections || (rateTable ? [{ title: "Material & Labour Rates", rows: rateTable }] : []);

  return (
    <div className="mb-8 font-sans text-slate-900">
      {categories.map((sec, idx) => (
        <CategoryRateTable
          key={sec.id || idx}
          section={sec}
          secIndex={idx}
          editable={false}
        />
      ))}
    </div>
  );
}