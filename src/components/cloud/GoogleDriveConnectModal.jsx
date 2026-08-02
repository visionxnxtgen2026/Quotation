import React, { useState, useEffect } from "react";
import { Cloud, ShieldCheck, Loader2, CheckCircle2, Lock, X } from "lucide-react";
import { googleDriveProvider } from "../../utils/googleDriveProvider";

const STAGES = [
  "✔ Initializing secure connection...",
  "✔ Verifying Google account...",
  "✔ Requesting Drive permissions...",
  "✔ Preparing encrypted storage...",
  "✔ Almost done...",
];

export default function GoogleDriveConnectModal({ isOpen, onClose, onSuccess }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsConnecting(false);
      setStageIndex(0);
      setProgress(0);
      setIsSuccess(false);
      setErrorMsg("");
      setShowConfetti(false);
    }
  }, [isOpen]);

  const handleStartConnect = async () => {
    setIsConnecting(true);
    setErrorMsg("");
    setStageIndex(0);
    setProgress(15);

    // Stage progress animation timer
    const timer1 = setTimeout(() => { setStageIndex(1); setProgress(35); }, 800);
    const timer2 = setTimeout(() => { setStageIndex(2); setProgress(55); }, 1600);
    const timer3 = setTimeout(() => { setStageIndex(3); setProgress(75); }, 2400);
    const timer4 = setTimeout(() => { setStageIndex(4); setProgress(90); }, 3200);

    try {
      await googleDriveProvider.authenticate();
      
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);

      setProgress(100);
      setIsConnecting(false);
      setIsSuccess(true);
      setShowConfetti(true);

      if (onSuccess) onSuccess();

      // Auto close after 1.5s
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);

    } catch (err) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);

      console.error("[Google Drive OAuth Error]:", err);
      setErrorMsg(err.message || "Authentication failed. Please check your internet connection.");
      setIsConnecting(false);
      setProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in">
      <div className="w-full max-w-[480px] bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-[24px] shadow-2xl p-6 relative overflow-hidden select-none transform transition-all duration-300 scale-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isConnecting}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
        >
          <X size={18} />
        </button>

        {/* Lightweight Confetti Particles on Success */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <div className="absolute top-1/3 right-1/4 w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce" />
            <div className="absolute top-1/2 left-1/3 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <div className="absolute top-1/2 right-1/3 w-3 h-3 rounded-full bg-indigo-500 animate-ping" />
          </div>
        )}

        {/* ── MODAL HEADER ── */}
        <div className="text-center space-y-1.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto shadow-xs">
            <Cloud size={24} />
          </div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            Cloud Storage
          </h2>
          <p className="text-xs font-semibold text-slate-500">
            Connecting securely to your Google Drive...
          </p>
        </div>

        {/* ── CENTER ANIMATION (Cloud → Animated Particle Beam → Google Drive) ── */}
        <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 mb-6 flex items-center justify-between relative overflow-hidden">
          
          {/* Cloud Icon */}
          <div className="flex flex-col items-center gap-1 z-10">
            <div className={`w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 ${isConnecting ? "animate-pulse" : ""}`}>
              <Cloud size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Cloud</span>
          </div>

          {/* Animated Connecting Beam with Moving Glowing Dots */}
          <div className="flex-1 px-4 relative flex items-center justify-center">
            <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Glowing Traveling Particle */}
            {isConnecting && (
              <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full shadow-[0_0_10px_#2563eb] animate-ping" />
            )}
          </div>

          {/* Google Drive Logo */}
          <div className="flex flex-col items-center gap-1 z-10">
            <div className={`w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm p-2 ${isConnecting ? "animate-pulse" : ""}`}>
              <svg className="w-full h-full" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
                <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l3.85-6.65c.8-1.4 1.2-2.95 1.2-4.5h-27.5l13.75 23.8c1.45 0 3.05-.45 5.4-9.35z" fill="#ea4335"/>
                <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.4-4.5 1.2z" fill="#00832d"/>
                <path d="m59.8 50h27.5c0-1.55-.4-3.1-1.2-4.5l-25.4-44c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8z" fill="#ffba00"/>
              </svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Google Drive</span>
          </div>

        </div>

        {/* ── SUCCESS STATE OVERLAY ── */}
        {isSuccess ? (
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 text-center space-y-2 mb-6 animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/30">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-sm font-black text-emerald-900">
              ✅ Connected Successfully
            </h3>
            <p className="text-xs font-semibold text-emerald-700">
              Workspace data will now auto-sync in the background.
            </p>
          </div>
        ) : (
          /* ── PROGRESS STAGE TEXT ── */
          <div className="mb-6 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>{STAGES[stageIndex]}</span>
              <span className="font-mono text-blue-600">{progress}%</span>
            </div>

            {/* Smooth Glowing Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 p-0.5">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_#2563eb]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 leading-tight">
            {errorMsg}
          </div>
        )}

        {/* ── ACTION BUTTON ── */}
        <div className="space-y-4">
          <button
            onClick={isSuccess ? onClose : handleStartConnect}
            disabled={isConnecting}
            className={`w-full h-12 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-98 cursor-pointer flex items-center justify-center gap-2 ${
              isSuccess
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 disabled:opacity-75"
            }`}
          >
            {isConnecting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Connecting...</span>
              </>
            ) : isSuccess ? (
              <span>Continue</span>
            ) : (
              <span>Connect Google Drive</span>
            )}
          </button>

          {/* ── SECURITY TRUST BADGE ── */}
          <div className="text-center pt-1 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 flex items-center justify-center gap-1">
              <Lock size={12} className="text-slate-400" />
              <span>End-to-end encrypted • OAuth 2.0 Secure Authentication</span>
            </p>
            <p className="text-[10px] font-medium text-slate-400 mt-0.5">
              Never stores your Google password
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
