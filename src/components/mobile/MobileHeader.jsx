import React, { memo } from "react";
import { ArrowLeft } from "lucide-react";

function MobileHeader({ title, subtitle, onBack, right, logo = false }) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs print:hidden pt-[env(safe-area-inset-top,0px)]">
      <div className="flex items-center justify-between h-14 px-4 w-full max-w-full overflow-hidden select-none">
        {/* Left Action / Brand Logo */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {onBack ? (
            <button
              onClick={onBack}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer shrink-0"
              aria-label="Back"
            >
              <ArrowLeft size={20} strokeWidth={2.2} />
            </button>
          ) : logo ? (
            <div className="w-8 h-8 rounded-xl bg-slate-900 p-1 flex items-center justify-center shrink-0 shadow-xs">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
          ) : null}

          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-black text-slate-900 tracking-tight truncate leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] font-semibold text-slate-500 truncate -mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Action Container */}
        <div className="flex items-center justify-end gap-2 shrink-0">
          {right || null}
        </div>
      </div>
    </header>
  );
}

export default memo(MobileHeader);
