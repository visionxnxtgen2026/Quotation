import React from "react";

export default function StatCard({ icon, color = "blue", label, value, small = false }) {
  const colorMap = {
    blue:    { bg: "bg-blue-50",    text: "text-blue-600" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
    purple:  { bg: "bg-purple-50",  text: "text-purple-600" },
    amber:   { bg: "bg-amber-50",   text: "text-amber-600" },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 w-full shadow-xs flex flex-col justify-between gap-3">
      <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.text} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className={`${small ? "text-sm" : "text-lg"} font-black text-slate-900 mt-0.5 leading-tight truncate`}>
          {value}
        </p>
      </div>
    </div>
  );
}
