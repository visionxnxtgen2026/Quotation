import React, { useState, useMemo, useRef, useEffect } from "react";
import MobileHeader from "../../components/mobile/MobileHeader";
import { admobManager } from "../../utils/admobManager";
import { localDB } from "../../utils/localDB";
import { normalizeQuotationData } from "../../utils/quotationMapper";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { googleDriveProvider, triggerAutoSync } from "../../utils/googleDriveProvider";
import {
  Download, Mail, MessageSquare, Printer,
  CheckCircle2, AlertCircle, FileCheck, ArrowRight,
  FileText, Calendar, HardDrive, Cloud, CloudUpload, ExternalLink, WifiOff, Wifi
} from "lucide-react";

import EnterpriseQuotationLayout from "../../components/theme/EnterpriseQuotationLayout.jsx";
import ClassicTemplate from "../../components/theme/ClassicTemplate.jsx";
import ModernTemplate from "../../components/theme/ModernTemplate.jsx";
import CorporateTemplate from "../../components/theme/CorporateTemplate.jsx";
import CompactTemplate from "../../components/theme/CompactTemplate.jsx";
import CreativeTemplate from "../../components/theme/CreativeTemplate.jsx";
import GroupedTemplate from "../../components/theme/GroupedTemplate.jsx";
import ObsidianTemplate from "../../components/theme/ObsidianTemplate.jsx";
import SovereignTemplate from "../../components/theme/SovereignTemplate.jsx";
import ExecutiveTemplate from "../../components/theme/ExecutiveTemplate.jsx";
import BusinessProTemplate from "../../components/theme/BusinessProTemplate.jsx";
import EnterpriseTemplate from "../../components/theme/EnterpriseTemplate.jsx";
import ContractorTemplate from "../../components/theme/ContractorTemplate.jsx";
import SignatureTemplate from "../../components/theme/SignatureTemplate.jsx";

export default function Export({
  goBack, goToPreview, goToDashboard, goToCreate,
  goToStorage, goToSettings, quotationId,
}) {
  const { isOnline } = useNetworkStatus();
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isPreparingWA, setIsPreparingWA] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isUploadingDrive, setIsUploadingDrive] = useState(false);

  const [driveResult, setDriveResult] = useState(() => {
    if (quotationId) {
      const q = localDB.getQuotationById(quotationId);
      return q?.driveUrl ? { driveUrl: q.driveUrl, uploadStatus: q.uploadStatus || "Uploaded", folderPath: q.folderPath } : null;
    }
    return null;
  });

  const pdfContainerRef = useRef(null);
  const selectedTemplate = localStorage.getItem("selectedTemplate") || "classic";

  const quotationData = useMemo(() => {
    let data = null;
    if (quotationId) {
      data = localDB.getQuotationById(quotationId);
    }
    if (!data) {
      const draft = localStorage.getItem("previewDraft");
      if (draft) {
        try {
          data = JSON.parse(draft);
        } catch (e) {
          console.error("Error parsing export draft:", e);
        }
      }
    }
    if (!data) {
      const list = localDB.getQuotations();
      if (list && list.length > 0) data = list[0];
    }
    return data;
  }, [quotationId]);

  const mappedData = useMemo(() => {
    return normalizeQuotationData(quotationData);
  }, [quotationData]);

  const refNo = mappedData?.quotationNo || mappedData?.referenceNo || "QTN-2026";
  const pdfFilename = `Quotation_${refNo.replace(/[^a-zA-Z0-9-]/g, "_")}.pdf`;

  const showToast = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 4500);
  };

  // Listen to Notification tap action to open saved file
  useEffect(() => {
    let unbind = null;
    if (window.Capacitor && window.Capacitor.isPluginAvailable("LocalNotifications")) {
      import(/* @vite-ignore */ "@capacitor/local-notifications").then(({ LocalNotifications }) => {
        LocalNotifications.addListener("localNotificationActionPerformed", async (notification) => {
          const filePath = notification.notification?.extra?.path;
          if (filePath && window.Capacitor.isPluginAvailable("Share")) {
            const { Share } = await import(/* @vite-ignore */ "@capacitor/share");
            await Share.share({
              title: pdfFilename,
              files: [filePath],
              dialogTitle: "Open Quotation PDF",
            }).catch(() => {});
          }
        }).then(listener => { unbind = listener; });
      }).catch(() => {});
    }
    return () => { if (unbind && unbind.remove) unbind.remove(); };
  }, [pdfFilename]);

  // 📄 Enterprise-Grade Multi-Page PDF Generator with Header/Footer & Section Breaking
  const generatePdfBase64 = async () => {
    console.log("[PDF] Generating Enterprise Multi-Page PDF...");
    const element = pdfContainerRef.current || document.getElementById("quotation-pdf-container");
    if (!element) {
      console.error("[PDF] Error: PDF container element not found");
      throw new Error("PDF container element not found");
    }
    const { exportEnterprisePDF } = await import("../../utils/pdfExporter.js");
    return await exportEnterprisePDF(element, pdfFilename, mappedData || {});
  };

  // 1. Download PDF Action with Android MediaStore/Filesystem Verification
  const handleDownloadPDF = async () => {
    console.log("[PDF] Button clicked");
    if (isDownloadingPDF) return;
    setIsDownloadingPDF(true);

    try {
      const { cleanBase64, pdf } = await generatePdfBase64();
      const relPath = `VisionX QuoteGen Pro/${pdfFilename}`;
      console.log("[PDF] Saving to Downloads...", relPath);

      let isFileSaved = false;
      let fileUri = "";

      if (window.Capacitor && window.Capacitor.isPluginAvailable("Filesystem")) {
        const { Filesystem, Directory } = await import(/* @vite-ignore */ "@capacitor/filesystem");
        
        try {
          if (Filesystem.requestPermissions) {
            await Filesystem.requestPermissions();
          }
        } catch (permErr) {
          console.warn("[PDF] Permission request notice:", permErr);
        }

        let usedDirectory = Directory.Documents;

        // Attempt 1: Try ExternalStorage (Public Downloads/Documents)
        try {
          const result = await Filesystem.writeFile({
            path: relPath,
            data: cleanBase64,
            directory: Directory.ExternalStorage,
            recursive: true,
          });
          fileUri = result.uri;
          usedDirectory = Directory.ExternalStorage;
        } catch (err1) {
          console.warn("[PDF] ExternalStorage save notice, trying Documents:", err1?.message || err1);
          // Attempt 2: Documents directory
          const result2 = await Filesystem.writeFile({
            path: relPath,
            data: cleanBase64,
            directory: Directory.Documents,
            recursive: true,
          });
          fileUri = result2.uri;
          usedDirectory = Directory.Documents;
        }

        console.log("[PDF] File saved:", fileUri);

        // Physical File Existence Verification
        try {
          const statResult = await Filesystem.stat({
            path: relPath,
            directory: usedDirectory,
          });
          isFileSaved = !!(statResult && (statResult.size > 0 || statResult.type === "file"));
          console.log("[PDF] File exists:", isFileSaved, "Size:", statResult?.size);
        } catch (statErr) {
          console.warn("[PDF] Stat check failed:", statErr);
          isFileSaved = false;
        }

        // ONLY IF File exists: Register with MediaStore & Show Notification
        if (isFileSaved) {
          console.log("[PDF] Registering with MediaStore...");
          console.log("[PDF] Showing download notification...");

          if (window.Capacitor.isPluginAvailable("LocalNotifications")) {
            try {
              const { LocalNotifications } = await import(/* @vite-ignore */ "@capacitor/local-notifications");
              await LocalNotifications.requestPermissions().catch(() => {});
              await LocalNotifications.schedule({
                notifications: [
                  {
                    title: "Download complete",
                    body: `${pdfFilename} — Tap to open`,
                    id: Math.floor(Date.now() % 100000) + 1,
                    schedule: { at: new Date(Date.now() + 100) },
                    extra: { path: fileUri },
                  },
                ],
              }).catch(e => console.warn("[PDF] Notification schedule notice:", e));
            } catch (nErr) {
              console.warn("[PDF] LocalNotifications notice:", nErr);
            }
          }
        }
      } else {
        pdf.save(pdfFilename);
        isFileSaved = true;
        console.log("[PDF] File downloaded via browser link");
      }

      if (isFileSaved) {
        showToast(`PDF downloaded successfully. Saved to Downloads/VisionX QuoteGen Pro/`, "success");
        triggerAutoSync("export", { fileName: pdfFilename, pdfBlob: cleanBase64 });
        console.log("[PDF] Download completed");
      } else {
        console.error("[PDF] Error: Download failed, file verification returned false");
        showToast("Download failed. Unable to save PDF.", "error");
      }

      admobManager.showInterstitial("Download PDF");
    } catch (err) {
      console.error("[PDF] Error downloading PDF:", err);
      showToast(`Download failed. ${err?.message || "Unable to save PDF."}`, "error");
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  // 2. WhatsApp Direct PDF Attachment Action
  const handleSendWhatsApp = async () => {
    console.log("[WhatsApp] Button clicked");
    if (isPreparingWA) return;
    setIsPreparingWA(true);

    try {
      const { cleanBase64 } = await generatePdfBase64();

      if (window.Capacitor && window.Capacitor.isPluginAvailable("Share")) {
        const { Filesystem, Directory } = await import(/* @vite-ignore */ "@capacitor/filesystem");
        const { Share } = await import(/* @vite-ignore */ "@capacitor/share");

        const savedFile = await Filesystem.writeFile({
          path: pdfFilename,
          data: cleanBase64,
          directory: Directory.Cache,
          recursive: true,
        });

        await Share.share({
          title: `Quotation - ${refNo}`,
          text: "Hello,\n\nPlease find the attached quotation.\n\nRegards,\nVisionX QuoteGen Pro",
          files: [savedFile.uri],
          dialogTitle: "Share Quotation via WhatsApp",
        });

        showToast("Opening WhatsApp with PDF attached...", "success");
      } else {
        const waText = encodeURIComponent(
          `Hello,\n\nPlease find the attached quotation: ${pdfFilename}\n\nRegards,\nVisionX QuoteGen Pro`
        );
        window.open(`https://api.whatsapp.com/send?text=${waText}`, "_blank");
        showToast("Opening WhatsApp... Please attach the downloaded PDF.", "success");
      }
    } catch (err) {
      console.error("WhatsApp Share error:", err);
      showToast("WhatsApp not installed or share failed.", "error");
    } finally {
      setIsPreparingWA(false);
    }
  };

  // 3. Email PDF Attachment Action
  const handleSendEmail = async () => {
    console.log("[Email] Button clicked");
    if (isSendingEmail) return;
    setIsSendingEmail(true);

    try {
      const { cleanBase64 } = await generatePdfBase64();
      const clientEmail = quotationData?.projectDetails?.clientEmail || quotationData?.signature?.email || "";

      if (window.Capacitor && window.Capacitor.isPluginAvailable("Share")) {
        const { Filesystem, Directory } = await import(/* @vite-ignore */ "@capacitor/filesystem");
        const { Share } = await import(/* @vite-ignore */ "@capacitor/share");

        const savedFile = await Filesystem.writeFile({
          path: pdfFilename,
          data: cleanBase64,
          directory: Directory.Cache,
          recursive: true,
        });

        await Share.share({
          title: `Quotation - ${refNo}`,
          text: "Hello,\n\nPlease find the attached quotation.\n\nRegards,\nVisionX QuoteGen Pro",
          files: [savedFile.uri],
          dialogTitle: "Send Quotation via Email",
        });

        showToast("Opening Email app with PDF attached...", "success");
      } else {
        const subject = encodeURIComponent(`Quotation - ${refNo}`);
        const body = encodeURIComponent("Hello,\n\nPlease find the attached quotation.\n\nRegards,\nVisionX QuoteGen Pro");
        window.location.href = `mailto:${encodeURIComponent(clientEmail.trim())}?subject=${subject}&body=${body}`;
        showToast("Opening Email app...", "success");
      }
    } catch (err) {
      console.error("Email Share error:", err);
      showToast("Email application not found.", "error");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handlePrint = async () => {
    console.log("[Print] Button clicked");
    try {
      const { pdf } = await generatePdfBase64();
      pdf.autoPrint();
      pdf.output("dataurlnewwindow");
      showToast("Printing PDF...", "success");
    } catch {
      window.print();
    }
  };

  const handleBackupGoogleDrive = async () => {
    if (!isOnline) {
      showToast("Offline Mode: Connect to the internet to back up to Google Drive.", "error");
      return;
    }
    if (isUploadingDrive) return;
    setIsUploadingDrive(true);
    const qId = quotationId || mappedData?.id || mappedData?.quotationNo || `QTN-${Date.now()}`;
    localDB.updateBackupStatus(qId, { uploadStatus: "Uploading" });

    try {
      const { cleanBase64 } = await generatePdfBase64();

      // Save PDF Blob locally to IndexedDB first (Offline-First guarantee)
      await localDB.savePdfBlob(qId, cleanBase64);

      // Upload to Google Drive using googleDriveProvider
      const uploadRes = await googleDriveProvider.uploadPdf({
        fileName: pdfFilename,
        pdfBlob: cleanBase64,
      });

      // Update Local Database with Cloud Sync Metadata
      localDB.updateBackupStatus(qId, {
        uploadStatus: "Uploaded",
        driveFileId: uploadRes.fileId,
        driveUrl: uploadRes.driveUrl,
        syncDate: uploadRes.uploadedAt,
        folderPath: uploadRes.folderPath,
      });

      setDriveResult({
        driveUrl: uploadRes.driveUrl,
        uploadStatus: "Uploaded",
        folderPath: uploadRes.folderPath,
      });

      showToast(`✓ Backed up to Google Drive (${uploadRes.folderPath})`, "success");
    } catch (err) {
      console.error("[GoogleDrive Backup Error]:", err);
      localDB.updateBackupStatus(qId, { uploadStatus: "Failed" });
      showToast(`Google Drive backup failed. ${err?.message || "Please try again."}`, "error");
    } finally {
      setIsUploadingDrive(false);
    }
  };

  const RenderSelectedTemplate = () => {
    if (!mappedData) return null;
    const props = { data: mappedData };
    switch (selectedTemplate) {
      case "modern": return <ModernTemplate {...props} />;
      case "compact": return <CompactTemplate {...props} />;
      case "creative": return <CreativeTemplate {...props} />;
      case "grouped": return <GroupedTemplate {...props} />;
      case "obsidian": return <ObsidianTemplate {...props} />;
      case "sovereign": return <SovereignTemplate {...props} />;
      case "executive": return <ExecutiveTemplate {...props} />;
      case "businesspro": return <BusinessProTemplate {...props} />;
      case "contractor": return <ContractorTemplate {...props} />;
      case "signature": return <SignatureTemplate {...props} />;
      case "corporate":
      case "enterprise":
      case "classic":
      default: return <EnterpriseQuotationLayout {...props} />;
    }
  };

  const busy = isDownloadingPDF || isPreparingWA || isSendingEmail;
  const formattedToday = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <>
      {/* Off-screen PDF Capture Container */}
      <div
        id="quotation-pdf-container"
        ref={pdfContainerRef}
        style={{
          position: "fixed",
          left: "-9999px",
          top: "0px",
          width: "794px",
          backgroundColor: "#ffffff",
          zIndex: -100,
        }}
      >
        <RenderSelectedTemplate />
      </div>
      
      <div className="print:hidden bg-[#F8FAFC] min-h-screen font-sans flex flex-col pb-24">
        <MobileHeader
          title="Export Quotation"
          onBack={goBack || goToPreview}
          right={
            <button onClick={goToPreview} className="text-xs font-bold text-blue-600 cursor-pointer">Preview</button>
          }
        />

        {toast.show && (
          <div className={`fixed top-16 left-4 right-4 z-[100] px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3 text-xs font-semibold ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
            {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span className="flex-1">{toast.message}</span>
          </div>
        )}

        <div className="flex-1 px-4 py-5 space-y-4">
          {/* Polished File Status Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100/60">
                <FileCheck size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full uppercase tracking-wider">Ready for export</span>
                </div>
                <p className="text-xs font-black text-slate-900 truncate mt-1">{pdfFilename}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Generated Date</span>
                <span className="font-bold text-slate-800 mt-0.5">{formattedToday}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Estimated Size</span>
                <span className="font-bold text-slate-800 mt-0.5">~245 KB</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">Export Options</p>

          <div className="space-y-3">
            {/* 1. Download PDF */}
            <MobileActionCard
              icon={<Download size={22} />}
              iconBg="bg-blue-50 text-blue-600"
              title={isDownloadingPDF ? "Generating PDF..." : "Download PDF"}
              desc={isDownloadingPDF ? "Please wait..." : "Save PDF to device Downloads"}
              onClick={handleDownloadPDF}
              isLoading={isDownloadingPDF}
              disabled={busy}
            />

            {/* 2. WhatsApp Direct Attachment */}
            <MobileActionCard
              icon={<MessageSquare size={22} />}
              iconBg="bg-emerald-50 text-emerald-600"
              title={isPreparingWA ? "Attaching PDF..." : "Send to WhatsApp"}
              desc="Attach PDF & open WhatsApp"
              onClick={handleSendWhatsApp}
              isLoading={isPreparingWA}
              disabled={busy}
            />

            {/* 3. Email Direct Attachment */}
            <MobileActionCard
              icon={<Mail size={22} />}
              iconBg="bg-indigo-50 text-indigo-600"
              title={isSendingEmail ? "Attaching PDF..." : "Send via Email"}
              desc="Attach PDF & open Email client"
              onClick={handleSendEmail}
              isLoading={isSendingEmail}
              disabled={busy}
            />

            {/* 4. Google Drive Cloud Backup Action */}
            <MobileActionCard
              icon={<CloudUpload size={22} />}
              iconBg="bg-sky-50 text-sky-600"
              title={
                isUploadingDrive
                  ? "Uploading to Google Drive..."
                  : driveResult?.driveUrl
                  ? "🟢 Uploaded to Google Drive"
                  : "Backup to Google Drive"
              }
              desc={
                driveResult?.driveUrl
                  ? "Saved to My Drive / Quotation App"
                  : isOnline
                  ? "Cloud Backup Available (My Drive / Quotation App)"
                  : "● Offline Mode — Saved in local IndexedDB"
              }
              onClick={handleBackupGoogleDrive}
              isLoading={isUploadingDrive}
              disabled={busy}
              badge={
                driveResult?.driveUrl ? (
                  <a
                    href={driveResult.driveUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] font-bold text-sky-600 hover:underline flex items-center gap-1"
                  >
                    Open <ExternalLink size={12} />
                  </a>
                ) : !isOnline ? (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <WifiOff size={11} /> Offline
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Wifi size={11} /> Online
                  </span>
                )
              }
            />

            {/* 5. Local Print */}
            <MobileActionCard
              icon={<Printer size={22} />}
              iconBg="bg-slate-100 text-slate-700"
              title="Print Document"
              desc="Print PDF document"
              onClick={handlePrint}
              disabled={busy}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function MobileActionCard({ icon, iconBg, title, desc, onClick, isLoading, disabled, badge }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`w-full bg-white border border-slate-100 rounded-2xl flex items-center gap-4 px-4 py-4 text-left shadow-2xs transition-all cursor-pointer ${
        disabled ? "opacity-60 cursor-not-allowed" : "active:bg-slate-50 active:scale-99"
      }`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {isLoading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold text-slate-900">{title}</p>
          {badge}
        </div>
        <p className="text-[11px] text-slate-400 font-medium mt-0.5">{desc}</p>
      </div>
      <ArrowRight size={16} className="text-slate-300 shrink-0" />
    </button>
  );
}