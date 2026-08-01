import React from "react";

export default function MobileFormCard({ title, subtitle, children, icon }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
      {(title || subtitle) && (
        <div className="flex items-center gap-3.5 pb-3 border-b border-slate-100">
          {icon && (
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold">
              {icon}
            </div>
          )}
          <div>
            {title && <h3 className="text-sm font-black text-slate-900 leading-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

export function MobileInput({
  label,
  type = "text",
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  rows,
  readOnly = false,
  disabled = false,
  error,
  rightAction,
  inputRef,
  id,
  autoComplete,
  inputMode,
  enterKeyHint = "next",
  name
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {rows ? (
          <textarea
            id={id}
            name={name}
            ref={inputRef}
            rows={rows}
            value={value || ""}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={placeholder}
            readOnly={readOnly}
            disabled={disabled || readOnly}
            autoComplete={autoComplete}
            enterKeyHint={enterKeyHint}
            className={`w-full bg-slate-50/80 border rounded-2xl p-4 text-xs font-medium text-slate-900 focus:outline-none transition-all resize-y min-h-[70px] ${
              error
                ? "border-red-500 bg-red-50/20 text-red-900 focus:border-red-600"
                : readOnly
                ? "bg-slate-100/90 border-slate-200 cursor-not-allowed font-mono text-slate-700 font-bold"
                : "border-slate-200 focus:border-blue-600 focus:bg-white"
            }`}
          />
        ) : (
          <input
            id={id}
            name={name}
            ref={inputRef}
            type={type}
            inputMode={inputMode}
            autoComplete={autoComplete}
            enterKeyHint={enterKeyHint}
            value={value || ""}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={placeholder}
            readOnly={readOnly}
            disabled={disabled || readOnly}
            className={`w-full h-14 bg-slate-50/80 border rounded-2xl px-4 text-xs font-medium text-slate-900 focus:outline-none transition-all ${
              error
                ? "border-red-500 bg-red-50/20 text-red-900 focus:border-red-600"
                : readOnly
                ? "bg-slate-100/90 border-slate-200 cursor-not-allowed font-mono text-slate-700 font-bold"
                : "border-slate-200 focus:border-blue-600 focus:bg-white"
            } ${rightAction ? "pr-12" : ""}`}
          />
        )}
        {rightAction && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightAction}
          </div>
        )}
      </div>
      {error && (
        <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}
