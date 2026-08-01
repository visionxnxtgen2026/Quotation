import React, { useState } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";

export default function DeleteAccountModal({ isOpen, onClose, onConfirm, isDeleting }) {
  const [inputValue, setInputValue] = useState("");

  if (!isOpen) return null;

  const isMatch = inputValue === "DELETE";

  const handleConfirm = () => {
    if (isMatch) {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Dark Blur Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={!isDeleting ? onClose : undefined}
      ></div>

      {/* Modal Box */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors disabled:opacity-50"
        >
          <X size={18} />
        </button>

        <div className="p-8">
          {/* Header Icon */}
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 mx-auto">
            <AlertTriangle size={28} />
          </div>

          <h2 className="text-xl font-black text-slate-900 text-center mb-2">
            Delete Account?
          </h2>
          <p className="text-sm text-slate-500 text-center mb-6 leading-relaxed">
            This action is permanent and cannot be undone. All your saved quotations, profile data, and settings will be wiped out completely.
          </p>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-6">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
              Type <span className="text-red-500 select-none">DELETE</span> to confirm
            </label>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isDeleting}
              placeholder="DELETE"
              className="w-full text-center border border-slate-300 rounded-lg px-4 py-3 font-black tracking-widest text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all uppercase placeholder-slate-300"
              autoComplete="off"
            />
          </div>

          <div className="flex gap-3">
            <button 
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirm}
              disabled={!isMatch || isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <><Loader2 size={18} className="animate-spin" /> Deleting...</>
              ) : (
                "Delete Forever"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}