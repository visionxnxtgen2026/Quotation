import React from "react";
import { ArrowLeft } from "lucide-react";

export default function MobileHeader({ title, subtitle, onBack, right, logo = false }) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs print:hidden pt-[env(safe-area-inset-top,0px)]">
      <div className="flex items-center justify-between h-16 px-4 w-full max-w-full overflow-hidden select-none">
        {/* Left Back Button / Brand Icon (Minimum 44x44dp Touch Target) */}
        <div className="w-11 h-11 flex items-center justify-start shrink-0">
          {onBack ? (
            <button
              onClick={onBack}
              className="w-11 h-11 flex items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft size={22} strokeWidth={2.2} />
            </button>
          ) : logo ? (
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-2xs p-0.5 border border-slate-200">
              <img src="/logo.png" alt="VisionX Logo" className="w-full h-full object-contain" />
            </div>
          ) : null}
        </div>

        {/* Centered Page Title (Material Design 3 20sp Typography) */}
        <div className="flex-1 text-center min-w-0 px-2">
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight truncate leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] text-slate-500 font-medium truncate -mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right Action Container (12-16dp spacing, no overlapping) */}
        <div className="min-w-[44px] flex items-center justify-end gap-2.5 shrink-0">
          {right || null}
        </div>
      </div>
    </header>
  );
}
