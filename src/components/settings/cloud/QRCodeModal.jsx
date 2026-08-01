import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { X, Copy, Download, QrCode, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function QRCodeModal({ isOpen, onClose, url, fileName }) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && url) {
      QRCode.toDataURL(url, {
        width: 320,
        margin: 2,
        color: {
          dark: "#0F172A",
          light: "#FFFFFF",
        },
      })
        .then((dataUrl) => setQrDataUrl(dataUrl))
        .catch((err) => console.error("QR Code Generation Error:", err));
    }
  }, [isOpen, url]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `QR_${fileName ? fileName.replace(/\.[^/.]+$/, "") : "Quotation"}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          onClick={onClose}
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 max-w-sm w-full z-10 text-center space-y-4"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
              <QrCode size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-900">Quotation QR Code</h3>
            <p className="text-xs text-slate-500 font-medium truncate max-w-[260px]">{fileName || "Public Quotation Link"}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 inline-block shadow-inner">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Quotation QR Code" className="w-56 h-56 mx-auto rounded-xl" />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs font-bold animate-pulse">
                Generating QR Code...
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-400 font-medium px-2">
            Scan with any phone camera to view the live quotation.
          </p>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? "Copied!" : "Copy Link"}</span>
            </button>

            <button
              onClick={handleDownloadQR}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Download size={14} />
              <span>Download QR</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
