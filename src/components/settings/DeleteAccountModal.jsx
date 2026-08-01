import React, { useState } from "react";
import { AlertTriangle, X, Loader2, Upload, Cloud } from "lucide-react";
import { workspaceBackupProvider } from "../../utils/workspaceBackupProvider";

export default function DeleteAccountModal({ isOpen, onClose, onConfirm, isDeleting }) {
  const [inputValue, setInputValue] = useState("");
  const [isBackingUp, setIsBackingUp] = useState(false);

  if (!isOpen) return null;

  const isMatch = inputValue === "DELETE";

  const handleBackupAndReset = async () => {
    setIsBackingUp(true);
    try {
      await workspaceBackupProvider.uploadWorkspaceBackup();
    } catch (e) {
      console.warn("Backup before reset notice:", e);
    } finally {
      setIsBackingUp(false);
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Dark Blur Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={!isDeleting && !isBackingUp ? onClose : undefined}
      ></div>

      {/* Modal Box */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          disabled={isDeleting || isBackingUp}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors disabled:opacity-50"
        >
          <X size={18} />
        </button>

        <div className="p-8 space-y-4">
          {/* Header Icon */}
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={28} />
          </div>

          <h2 className="text-xl font-black text-slate-900 text-center">
            Reset Application &amp; Delete Data?
          </h2>
          <p className="text-xs text-slate-500 text-center leading-relaxed">
            Would you like to back up your workspace to Google Drive before resetting local data?
          </p>

          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 text-center">
              Type <span className="text-red-500 select-none">DELETE</span> to confirm reset
            </label>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isDeleting || isBackingUp}
              placeholder="DELETE"
              className="w-full text-center border border-slate-300 rounded-xl px-4 py-2.5 font-black tracking-widest text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all uppercase placeholder-slate-300 text-xs"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2 pt-1">
            <button
              onClick={handleBackupAndReset}
              disabled={!isMatch || isDeleting || isBackingUp}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {isBackingUp ? (
                <><Loader2 size={16} className="animate-spin" /> Backing up to Google Drive...</>
              ) : (
                <><Upload size={16} /> Backup Workspace &amp; Reset</>
              )}
            </button>

            <div className="flex gap-2">
              <button 
                onClick={onClose}
                disabled={isDeleting || isBackingUp}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 text-xs rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={onConfirm}
                disabled={!isMatch || isDeleting || isBackingUp}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold py-2.5 text-xs rounded-xl transition-all cursor-pointer"
              >
                {isDeleting ? "Resetting..." : "Reset Without Backup"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}