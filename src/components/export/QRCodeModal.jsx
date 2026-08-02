import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { X, Download, Copy, Check } from "lucide-react";

export default function QRCodeModal({ isOpen, onClose, url, fileName }) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && url) {
      QRCode.toDataURL(url, { width: 280, margin: 2 })
        .then((dataUri) => setQrDataUrl(dataUri))
        .catch((err) => console.error("QR Code Error:", err));
    }
  }, [isOpen, url]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (url) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const anchor = document.createElement("a");
    anchor.href = qrDataUrl;
    anchor.download = `QR_${(fileName || "Quotation").replace(/\s+/g, "_")}.png`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl space-y-4 text-center relative border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors"
        >
          <X size={16} />
        </button>

        <div>
          <h3 className="text-base font-black text-slate-900">QR Code</h3>
          <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{fileName || "Scan to view"}</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-center items-center">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 rounded-xl shadow-xs" />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">Generating...</div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleCopyLink}
            className="h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>

          <button
            onClick={handleDownloadQR}
            className="h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download size={14} />
            <span>Save QR</span>
          </button>
        </div>
      </div>
    </div>
  );
}
