import React from "react";
import { Check } from "lucide-react";

export default function Stepper({ steps, currentStep, onStepClick }) {
  return (
    <div className="w-full bg-white border-b border-slate-100 px-4 py-3 sticky top-15 z-30 shadow-2xs">
      <div className="max-w-md mx-auto relative flex items-center justify-between">
        {/* Step Connecting Line Background */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
        
        {/* Step Connecting Line Active Fill */}
        <div
          className="absolute top-4 left-6 h-0.5 bg-blue-600 transition-all duration-300 -z-0"
          style={{
            width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - 12px)`
          }}
        />

        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <button
              key={step.key}
              onClick={() => onStepClick && onStepClick(stepNum)}
              className="flex flex-col items-center gap-1.5 z-10 cursor-pointer group"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold transition-all duration-200 ${
                  isCompleted
                    ? "bg-blue-600 text-white shadow-sm"
                    : isCurrent
                    ? "bg-blue-600 text-white ring-4 ring-blue-100 shadow-md shadow-blue-600/30 scale-105"
                    : "bg-white border-2 border-slate-300 text-slate-400"
                }`}
              >
                {isCompleted ? <Check size={16} strokeWidth={3} /> : stepNum}
              </div>
              <span
                className={`text-[11px] tracking-tight transition-colors ${
                  isCurrent ? "font-extrabold text-blue-700" : isCompleted ? "font-bold text-slate-700" : "font-medium text-slate-400"
                }`}
              >
                {step.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
