import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ExportLoadingScreen({ formatLabel = "PDF", templateName = "Modern Proposal" }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    "Preparing quotation...",
    "Loading company profile...",
    `Applying selected template (${templateName})...`,
    "Calculating totals...",
    `Generating ${formatLabel}...`,
    "Embedding logo...",
    "Finalizing document...",
    "Export completed.",
  ];

  useEffect(() => {
    // Advance step text every ~300ms
    const stepTimer = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, steps.length - 1));
    }, 320);

    // Smooth progress bar fill over ~2.4s
    let currentProgress = 0;
    const progressTimer = setInterval(() => {
      currentProgress += 2.0;
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
  }, [templateName, formatLabel]);

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
            <span className="text-5xl select-none">⚡</span>
          </div>
          {/* Animated corner spinner */}
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
        className="text-2xl font-black text-slate-900 tracking-tight mb-2 text-center"
      >
        Generating {formatLabel}
      </motion.h2>

      {/* Dynamic step text */}
      <div className="h-6 mb-8">
        <AnimatePresence mode="wait">
          <motion.p
            key={stepIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="text-sm text-slate-600 font-semibold text-center"
          >
            {steps[stepIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress bar container */}
      <div className="w-full max-w-xs bg-slate-100 rounded-full h-2 overflow-hidden mb-3">
        <motion.div
          className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-75"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-xs font-bold text-slate-400 font-mono tracking-wide">
        {Math.round(progress)}%
      </p>
    </motion.div>
  );
}
