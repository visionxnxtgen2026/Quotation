import { useState } from "react";
import { Shield, FileText, CheckCircle2, ArrowRight, Lock } from "lucide-react";

// ─── Consent flag key ───────────────────────────────────────────────────────
export const CONSENT_KEY = "legalConsentAccepted";

export function hasAcceptedConsent() {
  try {
    return localStorage.getItem(CONSENT_KEY) === "true";
  } catch {
    return false;
  }
}

function saveConsent() {
  try {
    localStorage.setItem(CONSENT_KEY, "true");
  } catch {
    // fallback: ignore
  }
}

// ─── Scrollable Modal ─────────────────────────────────────────────────────────
function LegalModal({ title, subtitle, icon: Icon, accentColor, children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15,23,42,0.75)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="bg-white w-full max-w-2xl flex flex-col"
        style={{
          maxHeight: "88vh",
          borderRadius: "20px",
          boxShadow: "0 40px 100px rgba(0,0,0,0.4)",
        }}
      >
        {/* Accent top bar */}
        <div
          className="h-1 w-full rounded-t-[20px]"
          style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)` }}
        />

        {/* Modal Header */}
        <div className="flex items-center gap-4 px-7 py-5 border-b border-slate-100">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${accentColor}12`, color: accentColor }}
          >
            <Icon size={20} strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-black text-slate-900 tracking-tight">{title}</h2>
            <p className="text-[11px] text-slate-400 font-medium">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer text-lg font-light"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Scrollable Body */}
        <div
          className="overflow-y-auto flex-1 px-7 py-6 text-xs text-slate-700 leading-relaxed space-y-4"
          style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
        >
          {children}
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-slate-100 flex items-center justify-between rounded-b-[20px] bg-slate-50/60">
          <p className="text-[10px] text-slate-400 font-medium">VisionX QuoteGen Pro</p>
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-700 text-white text-xs font-bold px-6 py-2 rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Privacy Policy Content ─────────────────────────────────────────────────
function PrivacyPolicyContent() {
  return (
    <>
      <p className="text-[11px] text-slate-400 font-medium">Effective Date: Upon installation of this application.</p>
      <PolicySection title="1. Overview">
        VisionX QuoteGen Pro is a professional quotation management application. All core features
        operate entirely on your local device and do not require an internet connection. This policy
        explains how your data is handled within the application.
      </PolicySection>
      <PolicySection title="2. Data Storage">
        All information entered into VisionX QuoteGen Pro — including company profiles, client details,
        quotation records, and settings — is stored <strong>exclusively on your local device</strong> using
        the browser's built-in IndexedDB and LocalStorage. No data is automatically transmitted to
        any external server, cloud service, or third party.
      </PolicySection>
      <PolicySection title="3. Information We Do Not Collect">
        VisionX QuoteGen Pro does <strong>not</strong> collect, process, or transmit:
        <ul className="list-disc ml-4 mt-1.5 space-y-1 text-slate-600">
          <li>Personal identification information to any server</li>
          <li>Client or customer data to any external party</li>
          <li>Usage analytics, crash reports, or behavioral data</li>
          <li>Device identifiers or location data</li>
          <li>Any form of telemetry or tracking information</li>
        </ul>
      </PolicySection>
      <PolicySection title="4. Backup and Export Files">
        The application provides an optional data backup feature. Backup files are generated{" "}
        <strong>only upon your explicit request</strong> and are saved directly to your device.
        You are solely responsible for the security and distribution of any exported files.
      </PolicySection>
      <PolicySection title="5. PDF and Print Exports">
        Quotation documents exported as PDF or sent to print are generated locally within the application.
        These files are not uploaded or transmitted by the software. You are responsible for the safe
        handling and distribution of exported documents.
      </PolicySection>
      <PolicySection title="6. No Tracking or Analytics">
        VisionX QuoteGen Pro does not integrate any analytics platforms, advertising networks, tracking
        pixels, or third-party monitoring tools. Your usage remains entirely private.
      </PolicySection>
      <PolicySection title="7. No External Dependencies">
        The application is designed to function without an internet connection. No background network
        requests are made during normal operation.
      </PolicySection>
      <PolicySection title="8. User Control and Data Deletion">
        You may delete all locally stored data at any time by navigating to{" "}
        <strong>Settings → Clear Local Database</strong> or{" "}
        <strong>Storage Manager → Reset Data</strong>. This action is permanent and cannot be undone
        without a prior backup.
      </PolicySection>
      <PolicySection title="9. Contact">
        For questions regarding this Privacy Policy, contact VisionX Support:{" "}
        <a href="mailto:VisionXnxtgen2026@gmail.com" className="text-blue-600 font-semibold underline">
          VisionXnxtgen2026@gmail.com
        </a>
      </PolicySection>
    </>
  );
}

// ─── Terms & Conditions Content ──────────────────────────────────────────────
function TermsContent() {
  return (
    <>
      <p className="text-[11px] text-slate-400 font-medium">Effective Date: Upon acceptance of this agreement.</p>
      <PolicySection title="1. Nature of the Software">
        VisionX QuoteGen Pro is a <strong>professional quotation generation tool</strong>. The software
        assists users in creating business quotation documents based on information entered by the user.
        The application does not provide legal, financial, or professional advisory services.
      </PolicySection>
      <PolicySection title="2. User Responsibility for Accuracy">
        Users are solely responsible for the accuracy of all information entered into the application,
        including item descriptions, quantities, unit rates, tax values, client details, and company
        information. VisionX is not responsible for pricing errors, calculation discrepancies from
        incorrect inputs, or any inaccuracies entered by the user.
      </PolicySection>
      <PolicySection title="3. Review Before Sharing">
        Users are responsible for reviewing all quotations carefully before sharing, printing, or
        distributing them to clients. Quotations reflect the information provided by the user and
        must be verified before use.
      </PolicySection>
      <PolicySection title="4. Data Backup Responsibility">
        Users should maintain regular backups of important quotations using the built-in Storage
        Manager. VisionX is not liable for data loss due to device failure, browser data clearing,
        or operating system issues.
      </PolicySection>
      <PolicySection title="5. No Warranties">
        VisionX QuoteGen Pro is provided on an "as-is" basis. VisionX makes no warranties, express
        or implied, regarding the suitability of the software for any particular purpose,
        uninterrupted availability, or complete freedom from errors.
      </PolicySection>
      <PolicySection title="6. Limitation of Liability">
        VisionX shall not be liable for any direct, indirect, incidental, or consequential damages
        arising from use or inability to use this software, including losses from quotation
        inaccuracies, data loss, or business decisions based on generated quotations.
      </PolicySection>
      <PolicySection title="7. Modifications to Terms">
        These Terms &amp; Conditions may be updated with new application versions. Continued use of
        the application after updates constitutes acceptance of the revised terms.
      </PolicySection>
      <PolicySection title="8. Governing Law">
        These terms are governed by and construed in accordance with applicable local laws in
        the user's jurisdiction.
      </PolicySection>
      <PolicySection title="9. Contact">
        For questions regarding these Terms &amp; Conditions, contact VisionX Support:{" "}
        <a href="mailto:VisionXnxtgen2026@gmail.com" className="text-blue-600 font-semibold underline">
          VisionXnxtgen2026@gmail.com
        </a>
      </PolicySection>
    </>
  );
}

function PolicySection({ title, children }) {
  return (
    <div className="pb-3 border-b border-slate-50 last:border-0">
      <p className="font-black text-slate-800 text-[11px] uppercase tracking-wider mb-1.5">{title}</p>
      <p className="text-slate-600 leading-relaxed">{children}</p>
    </div>
  );
}

// ─── Legal Card Component ─────────────────────────────────────────────────────
function LegalCard({ icon: Icon, iconBg, iconColor, title, description, onRead }) {
  return (
    <div
      className="flex items-start gap-4 p-5 rounded-2xl border cursor-default transition-all"
      style={{
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        borderColor: "#e2e8f0",
      }}
    >
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: iconBg, color: iconColor }}
      >
        <Icon size={20} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-slate-900 mb-0.5">{title}</p>
        <p className="text-[11px] text-slate-500 leading-relaxed">{description}</p>
      </div>
      <button
        onClick={onRead}
        className="text-[11px] font-bold px-4 py-1.5 rounded-xl border transition-all cursor-pointer shrink-0 mt-0.5"
        style={{
          color: iconColor,
          borderColor: `${iconColor}30`,
          background: `${iconColor}08`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `${iconColor}15`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = `${iconColor}08`;
        }}
      >
        Read →
      </button>
    </div>
  );
}

// ─── Main LegalConsent Screen ─────────────────────────────────────────────────
export default function LegalConsent({ onAccept }) {
  const [termsChecked, setTermsChecked] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const canContinue = termsChecked && privacyChecked;

  const handleContinue = () => {
    if (!canContinue) return;
    saveConsent();
    onAccept();
  };

  return (
    <>
      {/* ── Modals ─────────────────────────────────────────────────── */}
      {showTerms && (
        <LegalModal
          title="Terms & Conditions"
          subtitle="VisionX QuoteGen Pro — Terms of Use"
          icon={FileText}
          accentColor="#3b82f6"
          onClose={() => setShowTerms(false)}
        >
          <TermsContent />
        </LegalModal>
      )}

      {showPrivacy && (
        <LegalModal
          title="Privacy Policy"
          subtitle="VisionX QuoteGen Pro — Data Privacy"
          icon={Shield}
          accentColor="#10b981"
          onClose={() => setShowPrivacy(false)}
        >
          <PrivacyPolicyContent />
        </LegalModal>
      )}

      {/* ── Full-screen Background ──────────────────────────────────── */}
      <div
        className="min-h-screen flex items-center justify-center py-10 px-4"
        style={{
          background: "linear-gradient(160deg, #f0f4ff 0%, #e8f0fe 40%, #f5f3ff 70%, #f0fdf4 100%)",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        {/* Decorative large blobs */}
        <div
          className="pointer-events-none fixed top-[-120px] left-[-100px] w-[600px] h-[600px] rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, #bfdbfe 0%, transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none fixed bottom-[-100px] right-[-80px] w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #a7f3d0 0%, transparent 70%)",
          }}
        />

        {/* ── Card ────────────────────────────────────────────────────── */}
        <div
          className="relative w-full max-w-[520px]"
          style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
        >
          <div
            className="bg-white"
            style={{
              borderRadius: "28px",
              boxShadow:
                "0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08), 0 32px 64px rgba(59,130,246,0.08)",
              border: "1px solid rgba(226,232,240,0.8)",
            }}
          >
            {/* ── Top accent stripe ─────────────────────────────────── */}
            <div
              className="h-1 w-full"
              style={{
                borderRadius: "28px 28px 0 0",
                background: "linear-gradient(90deg, #2563eb 0%, #6366f1 50%, #10b981 100%)",
              }}
            />

            {/* ── Inner content ─────────────────────────────────────── */}
            <div className="px-9 pt-8 pb-8">

              {/* ── Brand Section ─────────────────────────────────── */}
              <div className="flex flex-col items-center text-center mb-8">

                {/* Logo */}
                <div
                  className="w-24 h-24 rounded-3xl flex items-center justify-center mb-5 overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                    boxShadow: "0 8px 32px rgba(37,99,235,0.15)",
                    border: "2px solid rgba(37,99,235,0.1)",
                  }}
                >
                  <img
                    src="/logo.png"
                    alt="VisionX QuoteGen Pro"
                    className="w-16 h-16 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement.innerHTML =
                        `<span style="font-size:28px;font-weight:900;color:#2563eb;letter-spacing:-1px">VX</span>`;
                    }}
                  />
                </div>

                {/* Brand name */}
                <div className="mb-1">
                  <span
                    className="text-[11px] font-black uppercase tracking-[0.2em]"
                    style={{ color: "#2563eb" }}
                  >
                    VisionX
                  </span>
                </div>

                <h1
                  className="text-2xl font-black text-slate-900 leading-tight mb-1"
                  style={{ letterSpacing: "-0.5px" }}
                >
                  QuoteGen Pro
                </h1>

                <p className="text-[12px] font-semibold text-slate-400 mb-4 tracking-wide">
                  Professional Quotation Software
                </p>

                {/* Divider */}
                <div className="w-12 h-0.5 rounded-full bg-slate-200 mb-4" />

                <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-[380px]">
                  This application helps you create, manage and export professional quotations
                  quickly and securely.
                </p>
              </div>

              {/* ── Divider ──────────────────────────────────────────── */}
              <div className="border-t border-slate-100 mb-6" />

              {/* ── Legal Agreement Heading ───────────────────────────── */}
              <div className="flex items-center gap-2 mb-4">
                <Lock size={13} className="text-slate-400" />
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                  Legal Agreement
                </p>
              </div>

              {/* ── Legal Cards ──────────────────────────────────────── */}
              <div className="space-y-3 mb-6">
                <LegalCard
                  icon={Shield}
                  iconBg="rgba(16,185,129,0.1)"
                  iconColor="#059669"
                  title="Privacy Policy"
                  description="How VisionX handles your data. All information stays on your device."
                  onRead={() => setShowPrivacy(true)}
                />
                <LegalCard
                  icon={FileText}
                  iconBg="rgba(37,99,235,0.1)"
                  iconColor="#2563eb"
                  title="Terms & Conditions"
                  description="Your responsibilities and the terms of using this software."
                  onRead={() => setShowTerms(true)}
                />
              </div>

              {/* ── Checkboxes ───────────────────────────────────────── */}
              <div className="space-y-2.5 mb-6">
                {/* Privacy checkbox */}
                <label
                  className="flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer"
                  style={{
                    background: privacyChecked ? "rgba(16,185,129,0.05)" : "#fafafa",
                    borderColor: privacyChecked ? "rgba(16,185,129,0.3)" : "#e2e8f0",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={privacyChecked}
                    onChange={(e) => setPrivacyChecked(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded cursor-pointer shrink-0"
                    style={{ accentColor: "#059669" }}
                  />
                  <span className="text-[12px] font-medium text-slate-700 leading-relaxed">
                    I have read and accepted the{" "}
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }}
                      className="font-bold underline underline-offset-2 cursor-pointer"
                      style={{ color: "#059669" }}
                    >
                      Privacy Policy
                    </button>
                    .
                  </span>
                </label>

                {/* Terms checkbox */}
                <label
                  className="flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer"
                  style={{
                    background: termsChecked ? "rgba(37,99,235,0.05)" : "#fafafa",
                    borderColor: termsChecked ? "rgba(37,99,235,0.3)" : "#e2e8f0",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={termsChecked}
                    onChange={(e) => setTermsChecked(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded cursor-pointer shrink-0"
                    style={{ accentColor: "#2563eb" }}
                  />
                  <span className="text-[12px] font-medium text-slate-700 leading-relaxed">
                    I have read and accepted the{" "}
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setShowTerms(true); }}
                      className="font-bold underline underline-offset-2 cursor-pointer"
                      style={{ color: "#2563eb" }}
                    >
                      Terms & Conditions
                    </button>
                    .
                  </span>
                </label>
              </div>

              {/* ── Continue Button ───────────────────────────────────── */}
              <button
                onClick={handleContinue}
                disabled={!canContinue}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm tracking-wide transition-all duration-200"
                style={
                  canContinue
                    ? {
                      background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                      color: "#fff",
                      boxShadow: "0 8px 24px rgba(37,99,235,0.35)",
                      cursor: "pointer",
                    }
                    : {
                      background: "#f1f5f9",
                      color: "#94a3b8",
                      cursor: "not-allowed",
                    }
                }
              >
                {canContinue ? (
                  <>
                    Continue to Application <ArrowRight size={16} />
                  </>
                ) : (
                  "Please accept both agreements to continue"
                )}
              </button>

              {/* ── Contact Footer ────────────────────────────────────── */}
              <div className="flex flex-col items-center mt-6 pt-5 border-t border-slate-100">
                <p className="text-[11px] text-slate-400 font-medium mb-0.5">Need Assistance?</p>
                <p className="text-[11px] font-bold text-slate-600">VisionX Support</p>
                <a
                  href="mailto:VisionXnxtgen2026@gmail.com"
                  className="text-[11px] font-semibold underline underline-offset-2 mt-0.5"
                  style={{ color: "#2563eb" }}
                >
                  VisionXnxtgen2026@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Below-card tag */}
          <p className="text-center text-[10px] font-medium mt-5" style={{ color: "#94a3b8" }}>
            © VisionX · Professional Quotation Software · All data stored on this device
          </p>
        </div>
      </div>
    </>
  );
}
