import React from "react";
import { ArrowLeft } from "lucide-react";

/**
 * AppBar — sticky top app bar for every mobile screen.
 *
 * Props:
 *  title        — string: page title
 *  onBack       — fn | null: show back arrow if provided
 *  right        — ReactNode: optional right-side element
 *  logo         — bool: show VisionX logo instead of back arrow
 */
export default function AppBar({ title, onBack, right, logo = false }) {
  return (
    <header className="sticky top-0 z-40 flex items-center h-14 px-4 gap-3 bg-white border-b border-slate-200 shadow-sm print:hidden">
      {/* Left: back button or logo */}
      <div className="w-10 flex items-center justify-start shrink-0">
        {onBack ? (
          <button
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-slate-700" />
          </button>
        ) : logo ? (
          <img
            src="/logo.png"
            alt="VisionX QuoteGen Pro Logo"
            className="w-8 h-8 object-contain rounded-lg border border-slate-100 p-0.5"
          />
        ) : null}
      </div>

      {/* Center: title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-[15px] font-black text-slate-900 tracking-tight truncate text-center">
          {title}
        </h1>
      </div>

      {/* Right: action slot */}
      <div className="w-10 flex items-center justify-end shrink-0">
        {right || null}
      </div>
    </header>
  );
}
