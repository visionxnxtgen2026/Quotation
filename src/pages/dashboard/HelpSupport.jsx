import React, { useState } from "react";
import MobileHeader from "../../components/mobile/MobileHeader";
import BannerAd from "../../components/mobile/BannerAd";
import { LifeBuoy, Mail, FileText, ChevronDown, Database, Info, MessageSquare } from "lucide-react";

export default function HelpSupport({
  goToDashboard, goToCreate, goToStorage, goToSettings,
}) {
  const [openFAQ, setOpenFAQ] = useState(null);

  const faqs = [
    { q: "Where is my quotation data stored?", a: "All your quotations, company profile details, and settings are stored locally on your device inside IndexedDB and LocalStorage. Nothing is sent to any server." },
    { q: "How do I backup or transfer my quotations?", a: "Go to the Storage Manager page and tap 'Export JSON'. Import that file on any device to restore your data." },
    { q: "Does QuoteGen Pro require internet access?", a: "No. VisionX QuoteGen Pro works 100% offline. No internet connection is required." },
    { q: "How do I export my quotations as PDF?", a: "Navigate to the Export page and tap 'Download / Save PDF'. Your browser's print dialog will open — select 'Save as PDF'." },
    { q: "How do I contact technical support?", a: "Contact VisionX Support via email at visionxnxtgen2026@gmail.com." },
  ];

  const handleEmailSupport = () => {
    const subject = encodeURIComponent("VisionX QuoteGen Pro Support Request");
    const body = encodeURIComponent("Hello VisionX Support Team,\n\nI need assistance with QuoteGen Pro.\n\nIssue Description:\n\nThank you.");
    window.location.href = `mailto:visionxnxtgen2026@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="bg-slate-100 min-h-screen font-sans pb-24 relative">
      <MobileHeader title="Help & Support" onBack={goToSettings} />

      <div className="w-full px-4 py-4 space-y-4">
        {/* Banner */}
        <div className="bg-gradient-to-br from-sky-600 to-blue-700 rounded-3xl p-5 text-white shadow-lg">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center mb-3">
            <LifeBuoy size={20} className="text-white" />
          </div>
          <h2 className="text-base font-black">VisionX Help & Support</h2>
          <p className="text-xs text-blue-100 font-medium mt-1">Product assistance & answers to common questions.</p>
        </div>

        {/* Email Support Card */}
        <button
          onClick={handleEmailSupport}
          className="w-full bg-white rounded-3xl border border-slate-100 p-4 shadow-xs flex items-center gap-4 text-left cursor-pointer active:scale-[0.99] transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Mail size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900">Email Support</p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Contact VisionX Technical Support team.</p>
            <p className="text-[11px] font-bold text-blue-600 mt-1 truncate">visionxnxtgen2026@gmail.com</p>
          </div>
        </button>

        {/* Storage Shortcut */}
        <button
          onClick={goToStorage}
          className="w-full bg-white rounded-3xl border border-slate-100 p-4 shadow-xs flex items-center gap-4 text-left cursor-pointer active:scale-[0.99] transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Database size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Storage & Backup Manager</p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Manage saved data and backups.</p>
          </div>
        </button>

        {/* FAQ Section */}
        <div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider px-1 mb-2">Frequently Asked Questions</p>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
            {faqs.map((faq, idx) => (
              <div key={idx} className={idx > 0 ? "border-t border-slate-100" : ""}>
                <button
                  onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-start justify-between gap-3 cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-900 leading-snug">{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform shrink-0 mt-0.5 ${openFAQ === idx ? "rotate-180 text-blue-600" : ""}`}
                  />
                </button>
                {openFAQ === idx && (
                  <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-50 pt-2">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Banner Ad */}
        <BannerAd pageName="Help" />

        {/* App Version */}
        <div className="text-center py-2">
          <p className="text-xs font-bold text-slate-400">VisionX QuoteGen Pro v1.0.0</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Offline Application · Powered by VisionX</p>
        </div>
      </div>
    </div>
  );
}