import React from "react";
import { Plus } from "lucide-react";

export default function FloatingActionButton({ onClick, label, icon: Icon = Plus }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 z-40 flex items-center gap-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs px-5 h-14 rounded-2xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
      aria-label={label || "Action"}
    >
      <Icon size={20} strokeWidth={2.5} />
      {label && <span className="font-bold">{label}</span>}
    </button>
  );
}
