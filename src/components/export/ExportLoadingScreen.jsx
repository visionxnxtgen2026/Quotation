import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  "Preparing quotation...",
  "Optimizing document...",
  "Generating file...",
  "Finalizing export...",
];

export default function ExportLoadingScreen({ formatLabel = "PDF" }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Advance step text every ~400ms
    const stepTimer = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, 420);

    // Smooth progress bar fill over ~1.8s
    let currentProgress = 0;
    const progressTimer = setInterval(() => {
      currentProgress += 2.2;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(progressTimer);
      }
      setProgress(currentProgress);
    }, 40);

    return () => {
      clearInterval(stepTimer);
      clearInterval(progressTimer);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 bg-white z-[110] flex flex-col items-center justify-center px-8"
    >
      {/* Animated document icon */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.05 }}
        className="mb-10"
      >
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* Outer glow ring */}
          <motion.div
            animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.15, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-[32px] bg-blue-500/20"
          />
          {/* Icon card */}
          <div className="w-24 h-24 rounded-[28px] bg-blue-50 border border-blue-100 flex items-center justify-center shadow-lg">
            <span className="text-5xl select-none">📄</span>
          </div>
          {/* Animated corner dot */}
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center shadow"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="text-2xl font-black text-slate-900 tracking-tight mb-2"
      >
        Generating {formatLabel}
      </motion.h2>

      {/* Step text */}
      <div className="h-6 mb-8">
        <AnimatePresence mode="wait">
          <motion.p
            key={stepIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="text-sm text-slate-500 font-medium text-center"
          >
            {STEPS[stepIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-blue-500"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: "linear" }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] font-bold text-slate-400">Processing...</span>
          <span className="text-[11px] font-bold text-blue-600">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex items-center gap-2 mt-10">
        {STEPS.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              width: i === stepIndex ? 24 : 6,
              backgroundColor: i <= stepIndex ? "#3b82f6" : "#e2e8f0",
            }}
            transition={{ duration: 0.3 }}
            className="h-1.5 rounded-full"
          />
        ))}
      </div>
    </motion.div>
  );
}
