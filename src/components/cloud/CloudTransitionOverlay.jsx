import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cloud, Lock, ShieldCheck, Database, Folder, FileText,
  RefreshCw, CheckCircle2, Server, Key, Cpu, Zap
} from "lucide-react";

/**
 * ⚡ CloudTransitionOverlay — Premium Cloud Workspace Transition Screen
 * Renders full-screen enterprise cloud environment loading transition.
 * Palette: Primary #2563EB, Accent #3B82F6, Success #10B981, Bg #F8FAFC, Glow #DBEAFE
 */
export default function CloudTransitionOverlay({ isVisible, onComplete }) {
  const [progress, setProgress] = useState(0);
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [isExpanding, setIsExpanding] = useState(false);

  const steps = [
    { label: "Checking Device", icon: Cpu },
    { label: "Authenticating User", icon: Key },
    { label: "Encrypting Session", icon: Lock },
    { label: "Connecting Cloud", icon: Server },
    { label: "Loading Workspace...", icon: Database },
  ];

  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      setActiveStepIdx(0);
      setIsExpanding(false);
      return;
    }

    // Smooth Progress Animation (0% to 100% over ~2.4 seconds)
    const startTime = Date.now();
    const duration = 2400;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 20 && pct < 40) setActiveStepIdx(1);
      else if (pct >= 40 && pct < 60) setActiveStepIdx(2);
      else if (pct >= 60 && pct < 80) setActiveStepIdx(3);
      else if (pct >= 80) setActiveStepIdx(4);

      if (pct >= 100) {
        clearInterval(interval);
        setIsExpanding(true);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 400);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed inset-0 z-[9999] bg-[#F8FAFC] flex flex-col items-center justify-between p-6 select-none overflow-hidden"
      >
        {/* ── Ambient Background Glow & Drifting Gradient Circles ── */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              x: [-20, 20, -20],
              y: [-20, 20, -20],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-blue-300/30 to-indigo-200/20 blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              x: [30, -30, 30],
              y: [30, -30, 30],
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] rounded-full bg-gradient-to-tl from-blue-200/40 via-sky-100/30 to-emerald-100/20 blur-3xl"
          />
          <motion.div
            animate={{
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] rounded-full bg-blue-100/40 blur-3xl"
          />
        </div>

        {/* ── Floating Drifting Micro Icons (Database, Folder, File, Sync, Key) ── */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          <motion.div
            animate={{ y: [-10, 15, -10], x: [-5, 10, -5], rotate: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-24 left-10 p-3 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xs text-blue-500/70"
          >
            <Database size={20} />
          </motion.div>

          <motion.div
            animate={{ y: [15, -10, 15], x: [10, -5, 10], rotate: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-36 right-12 p-3 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xs text-indigo-500/70"
          >
            <Folder size={20} />
          </motion.div>

          <motion.div
            animate={{ y: [-15, 10, -15], x: [8, -8, 8], rotate: [0, 8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-40 left-12 p-3 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xs text-emerald-500/70"
          >
            <ShieldCheck size={20} />
          </motion.div>

          <motion.div
            animate={{ y: [10, -15, 10], x: [-10, 8, -10], rotate: [0, -10, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-36 right-14 p-3 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xs text-sky-500/70"
          >
            <RefreshCw size={20} className="animate-spin-slow" />
          </motion.div>
        </div>

        {/* Top Branding Badge */}
        <div className="relative z-20 pt-8 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600">
            <Lock size={15} />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-slate-500 font-mono">
            VisionX Secure Vault
          </span>
        </div>

        {/* ── Central Hero Section (Breathing Cloud + Glow Ring + Title) ── */}
        <div className="relative z-20 w-full max-w-sm flex flex-col items-center text-center my-auto">
          {/* Cloud Hero Container */}
          <div className="relative mb-8 flex items-center justify-center">
            {/* Outward Expanding Light Effect on 100% */}
            {isExpanding && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0.8 }}
                animate={{ scale: 4, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute w-32 h-32 rounded-full bg-blue-500/30 blur-md z-0"
              />
            )}

            {/* Soft Ambient Pulse Ring */}
            <motion.div
              animate={{
                scale: [1, 1.28, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-36 h-36 rounded-full bg-gradient-to-tr from-blue-400/30 to-sky-300/20 blur-xl"
            />

            {/* Glassmorphism Inner Card Container */}
            <motion.div
              animate={{
                scale: [0.98, 1.03, 0.98],
                y: [-2, 2, -2],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 w-28 h-28 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-[0_12px_40px_rgba(37,99,235,0.12)] flex items-center justify-center"
            >
              {/* Cloud Icon */}
              <Cloud size={56} className="text-blue-600 drop-shadow-sm" fill="#DBEAFE" strokeWidth={1.75} />
            </motion.div>
          </div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-black text-slate-900 tracking-tight"
          >
            Connecting to VisionX Cloud
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-xs font-semibold text-slate-500 mt-1"
          >
            Preparing your secure enterprise workspace...
          </motion.p>

          {/* ── Progress Section ── */}
          <div className="w-full mt-6 bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
            {/* Progress Bar Header */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 font-mono">ENCRYPTED SYNC</span>
              <span className="font-black text-blue-600 font-mono">{progress}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 relative">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 rounded-full"
                style={{ width: `${progress}%` }}
                transition={{ ease: "easeOut" }}
              />
            </div>

            {/* Sequenced Checklist */}
            <div className="pt-2 space-y-1.5 text-left">
              {steps.map((s, idx) => {
                const isDone = idx <= activeStepIdx;
                const isCurrent = idx === activeStepIdx;
                const Icon = s.icon;

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl transition-all ${
                      isDone
                        ? "bg-slate-50 text-slate-800 font-bold"
                        : "text-slate-400 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        size={14}
                        className={
                          isDone
                            ? "text-blue-600"
                            : "text-slate-300"
                        }
                      />
                      <span className="text-[11px]">{s.label}</span>
                    </div>

                    {isDone ? (
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-emerald-500 flex items-center"
                      >
                        <CheckCircle2 size={14} />
                      </motion.div>
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full border border-slate-200" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Bottom Security Footer ── */}
        <div className="relative z-20 pb-4 text-center space-y-1">
          <p className="text-[11px] font-bold text-slate-600">Enterprise-grade encrypted connection</p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/50 border border-slate-300/50 text-[10px] font-mono font-bold text-slate-500">
            <span>AES-256</span>
            <span>•</span>
            <span>TLS 1.3</span>
            <span>•</span>
            <span className="text-emerald-600">Auto Sync Enabled</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
