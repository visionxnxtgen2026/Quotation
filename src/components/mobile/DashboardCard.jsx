import React from "react";

export default function DashboardCard({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-3xl border border-slate-100 p-5 shadow-xs transition-all ${className}`}>
      {children}
    </div>
  );
}
