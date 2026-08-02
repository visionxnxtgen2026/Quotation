import React, { useState, useEffect } from "react";
import {
  FileText, Search, Plus, Eye, Download, Share2, Copy, QrCode,
  Edit3, Trash2, CheckCircle2, AlertCircle, RefreshCw, X, Check, Cloud, ArrowRight
} from "lucide-react";
import { localDB } from "../../utils/localDB";
import { googleDriveProvider } from "../../utils/googleDriveProvider";
import ShareDialogModal from "../../components/export/ShareDialogModal";
import QRCodeModal from "../../components/export/QRCodeModal";
import GoogleDriveConnectModal from "../../components/cloud/GoogleDriveConnectModal";
import MobileHeader from "../../components/mobile/MobileHeader";

/**
 * 📄 QuotationsPage — Central Cloud Quotation Library Page
 * Depends strictly on Google Drive connection status.
 */
export default function QuotationsPage({ goToCreate, goToPreview, goToSettings, goToCloud, setQuotationId }) {
  const [isConnected, setIsConnected] = useState(null); // null = checking, true, false
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [cloudFiles, setCloudFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // "newest" | "oldest" | "name"
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Modal States
  const [shareFileModal, setShareFileModal] = useState(null);
  const [qrFileModal, setQrFileModal] = useState(null);
  const [renameState, setRenameState] = useState({ isOpen: false, file: null, newName: "" });
  const [deleteConfirmState, setDeleteConfirmState] = useState({ isOpen: false, file: null, isDeleting: false });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3500);
  };

  const checkDriveAndLoad = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const connected = await googleDriveProvider.isConnected();
      setIsConnected(connected);
      if (connected) {
        const files = localDB.getCloudFiles ? localDB.getCloudFiles() : [];
        setCloudFiles(files);
      } else {
        setCloudFiles([]);
      }
    } catch (err) {
      console.error("[QuotationsPage Check Error]:", err);
      setHasError(true);
      setIsConnected(false);
      setCloudFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkDriveAndLoad();
    const handleUpdate = () => checkDriveAndLoad();
    window.addEventListener("cloudFilesUpdated", handleUpdate);
    window.addEventListener("gdriveStatusUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("cloudFilesUpdated", handleUpdate);
      window.removeEventListener("gdriveStatusUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Filter & Sort
  const filteredFiles = cloudFiles
    .filter((file) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      const nameMatch = (file.fileName || "").toLowerCase().includes(q);
      const customerMatch = (file.customerName || "").toLowerCase().includes(q);
      const numMatch = (file.quotationNumber || "").toLowerCase().includes(q);
      return nameMatch || customerMatch || numMatch;
    })
    .sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt || a.updatedAt || 0) - new Date(b.createdAt || b.updatedAt || 0);
      }
      if (sortBy === "name") {
        return (a.fileName || "").localeCompare(b.fileName || "");
      }
      return new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0);
    });

  // Automatic Timeline Grouping Engine (Today, Yesterday, This Week, Current Month, Previous Months, Years)
  const timelineGroups = React.useMemo(() => {
    const groups = {};
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const weekStart = todayStart - 6 * 86400000;

    filteredFiles.forEach((file) => {
      const rawDate = file.createdAt || file.updatedAt || file.dateCreated || file.date || Date.now();
      const dateObj = new Date(rawDate);
      const time = dateObj.getTime();

      let groupKey = "";

      if (time >= todayStart) {
        groupKey = "Today";
      } else if (time >= yesterdayStart) {
        groupKey = "Yesterday";
      } else if (time >= weekStart) {
        groupKey = "This Week";
      } else if (dateObj.getFullYear() === now.getFullYear() && dateObj.getMonth() === now.getMonth()) {
        groupKey = dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric" });
      } else if (dateObj.getFullYear() === now.getFullYear()) {
        groupKey = dateObj.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      } else {
        groupKey = String(dateObj.getFullYear());
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(file);
    });

    return groups;
  }, [filteredFiles]);

  // Action Handlers
  const handlePreviewQuotation = (file) => {
    if (setQuotationId && (file.quotationId || file.id)) {
      setQuotationId(file.quotationId || file.id);
    }
    if (goToPreview) goToPreview();
  };

  const handleDownloadPDF = (file) => {
    const qName = file.fileName || "Quotation.pdf";
    if (file.shareUrl || file.driveFileId) {
      const targetUrl = file.shareUrl || `https://drive.google.com/file/d/${file.driveFileId}/view`;
      window.open(targetUrl, "_blank");
      showToast(`Opening download link for ${qName}`, "success");
    } else {
      showToast("Generating quotation PDF for download...", "success");
      handlePreviewQuotation(file);
    }
  };

  const handleShareFile = (file) => {
    setShareFileModal(file);
  };

  const handleCopyLink = (file) => {
    const targetUrl = file.shareUrl || (file.driveFileId ? `https://drive.google.com/file/d/${file.driveFileId}/view` : "");
    if (!targetUrl) {
      showToast("No share link available.", "error");
      return;
    }
    navigator.clipboard.writeText(targetUrl);
    showToast("Link copied to clipboard!", "success");
  };

  const handleOpenDelete = (file) => {
    setDeleteConfirmState({ isOpen: false, file, isDeleting: false });
    setTimeout(() => {
      setDeleteConfirmState({ isOpen: true, file, isDeleting: false });
    }, 10);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmState.file || deleteConfirmState.isDeleting) return;
    setDeleteConfirmState(prev => ({ ...prev, isDeleting: true }));

    try {
      await googleDriveProvider.deleteQuotationBackup(deleteConfirmState.file);
      setDeleteConfirmState({ isOpen: false, file: null, isDeleting: false });
      checkDriveAndLoad();
      showToast("Quotation deleted successfully.", "success");
    } catch (err) {
      console.error("[Delete Quotation Error]:", err);
      setDeleteConfirmState(prev => ({ ...prev, isDeleting: false }));
      showToast("Unable to delete the file from Google Drive.", "error");
    }
  };

  const handleOpenRename = (file) => {
    setRenameState({ isOpen: true, file, newName: file.fileName || "" });
  };

  const handleSaveRename = () => {
    if (!renameState.file || !renameState.newName.trim()) return;
    if (localDB.saveCloudFile) {
      localDB.saveCloudFile({
        ...renameState.file,
        fileName: renameState.newName.trim(),
      });
    }
    setRenameState({ isOpen: false, file: null, newName: "" });
    checkDriveAndLoad();
    showToast("Quotation renamed successfully!", "success");
  };

  const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes) || bytes === 0) return "1.2 MB";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatFileDate = (dateStr) => {
    if (!dateStr) return "Aug 2, 2026";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "Aug 2, 2026";
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "Aug 2, 2026";
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans pb-32 select-none">
      <MobileHeader title="Quotations" />

      <GoogleDriveConnectModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onSuccess={() => {
          setShowConnectModal(false);
          checkDriveAndLoad();
        }}
      />

      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[150] px-4 py-2.5 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200 ${
            toast.type === "error"
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}
        >
          {toast.type === "error" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="px-4 py-4 max-w-4xl mx-auto space-y-4">

        {/* ── 1. LOADING STATE ── */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center animate-pulse">
              <RefreshCw size={22} className="animate-spin" />
            </div>
            <p className="text-xs font-bold text-slate-500">Checking Google Drive Connection...</p>
          </div>
        )}

        {/* ── 2. ERROR STATE ── */}
        {!isLoading && hasError && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/80 my-4 space-y-4 shadow-xs max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center mx-auto">
              <Cloud size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">Unable to load quotations</h3>
              <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                Please check your internet connection or reconnect your Google Drive account.
              </p>
            </div>
            <button
              onClick={checkDriveAndLoad}
              className="h-11 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold text-xs inline-flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <RefreshCw size={16} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* ── 3. NOT CONNECTED STATE ── */}
        {!isLoading && !hasError && isConnected === false && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/80 my-4 space-y-5 shadow-xs max-w-md mx-auto">
            <div className="w-20 h-20 rounded-3xl bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center mx-auto">
              <Cloud size={40} />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900">Google Drive Not Connected</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Connect your Google Drive account to automatically back up and manage your quotation files securely.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={() => setShowConnectModal(true)}
                className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Cloud size={18} />
                <span>Connect Google Drive</span>
              </button>

              <button
                onClick={() => goToCloud ? goToCloud() : (goToSettings ? goToSettings() : null)}
                className="w-full h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs border border-slate-200 transition-colors cursor-pointer"
              >
                Go to Cloud & Backup
              </button>
            </div>
          </div>
        )}

        {/* ── 4. CONNECTED STATE ── */}
        {!isLoading && !hasError && isConnected === true && (
          <>
            {/* Search Bar & Sort Header */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-slate-900 tracking-tight">Cloud Quotation Library</h2>
                  <p className="text-xs text-slate-500 font-medium">{filteredFiles.length} quotation file{filteredFiles.length === 1 ? '' : 's'} stored in Google Drive</p>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-extrabold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 🟢 Connected
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by quotation name or customer..."
                    className="w-full h-11 bg-white border border-slate-200/80 rounded-2xl pl-10 pr-4 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 shadow-2xs transition-all"
                  />
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-11 bg-white border border-slate-200/80 rounded-2xl px-3 text-xs font-extrabold text-slate-700 focus:outline-none focus:border-blue-600 shadow-2xs cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">File Name</option>
                </select>
              </div>
            </div>

            {/* Timeline Grouped Quotation Cards */}
            {Object.keys(timelineGroups).length > 0 ? (
              <div className="space-y-6 pt-1">
                {Object.entries(timelineGroups).map(([groupTitle, groupFiles]) => {
                  if (!groupFiles || groupFiles.length === 0) return null;

                  return (
                    <section key={groupTitle} className="space-y-3">
                      {/* Sticky Section Header */}
                      <div className="sticky top-12 z-20 bg-slate-50/95 backdrop-blur-xs py-2 px-1 flex items-center gap-3 border-b border-slate-200/80">
                        <h3 className="text-xs font-black text-slate-900 tracking-wider uppercase flex items-center gap-1.5 shrink-0">
                          <span>{groupTitle}</span>
                          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                            {groupFiles.length}
                          </span>
                        </h3>
                        <div className="flex-1 h-px bg-slate-200/80" />
                      </div>

                      {/* Section Cards Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {groupFiles.map((file) => {
                          const fileName = file.fileName || `Quotation_${file.quotationNumber || 'VQX-2026-0001'}.pdf`;
                          const customerName = file.customerName || "General Customer";
                          const createdDate = formatFileDate(file.createdAt || file.updatedAt);
                          const fileSize = formatFileSize(file.size);
                          const status = file.status || "synced";

                          return (
                            <div
                              key={file.id || file.driveFileId || Math.random()}
                              className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all space-y-3 relative group"
                            >
                              {/* Top Header Row */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                                    <FileText size={20} />
                                  </div>
                                  <div className="min-w-0">
                                    <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm tracking-tight truncate" title={fileName}>
                                      {fileName}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-semibold truncate mt-0.5">
                                      👤 {customerName}
                                    </p>
                                  </div>
                                </div>

                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold shrink-0">
                                  <Cloud size={11} className="text-emerald-600" />
                                  <span className="capitalize">{status}</span>
                                </span>
                              </div>

                              {/* File Details Bar */}
                              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100">
                                <span>📅 {createdDate}</span>
                                <span>📁 {fileSize}</span>
                              </div>

                              {/* Action Buttons Grid */}
                              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 pt-1">
                                <button
                                  onClick={() => handlePreviewQuotation(file)}
                                  className="h-9 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-extrabold flex flex-col sm:flex-row items-center justify-center gap-1 border border-blue-100 transition-colors cursor-pointer"
                                  title="Preview Quotation"
                                >
                                  <Eye size={13} />
                                  <span className="hidden sm:inline">Preview</span>
                                </button>

                                <button
                                  onClick={() => handleDownloadPDF(file)}
                                  className="h-9 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold flex flex-col sm:flex-row items-center justify-center gap-1 border border-slate-200/70 transition-colors cursor-pointer"
                                  title="Download PDF"
                                >
                                  <Download size={13} />
                                  <span className="hidden sm:inline">Download</span>
                                </button>

                                <button
                                  onClick={() => handleShareFile(file)}
                                  className="h-9 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold flex flex-col sm:flex-row items-center justify-center gap-1 border border-slate-200/70 transition-colors cursor-pointer"
                                  title="Share Link"
                                >
                                  <Share2 size={13} />
                                  <span className="hidden sm:inline">Share</span>
                                </button>

                                <button
                                  onClick={() => handleCopyLink(file)}
                                  className="h-9 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold flex flex-col sm:flex-row items-center justify-center gap-1 border border-slate-200/70 transition-colors cursor-pointer"
                                  title="Copy Link"
                                >
                                  <Copy size={13} />
                                  <span className="hidden sm:inline">Copy</span>
                                </button>

                                <button
                                  onClick={() => setQrFileModal(file)}
                                  className="h-9 rounded-xl bg-slate-50 hover:bg-purple-50 hover:text-purple-600 text-slate-700 text-[10px] font-bold flex flex-col sm:flex-row items-center justify-center gap-1 border border-slate-200/70 transition-colors cursor-pointer"
                                  title="QR Code"
                                >
                                  <QrCode size={13} />
                                  <span className="hidden sm:inline">QR</span>
                                </button>

                                <button
                                  onClick={() => handleOpenRename(file)}
                                  className="h-9 rounded-xl bg-slate-50 hover:bg-amber-50 hover:text-amber-600 text-slate-700 text-[10px] font-bold flex flex-col sm:flex-row items-center justify-center gap-1 border border-slate-200/70 transition-colors cursor-pointer"
                                  title="Rename"
                                >
                                  <Edit3 size={13} />
                                  <span className="hidden sm:inline">Rename</span>
                                </button>

                                <button
                                  onClick={() => handleOpenDelete(file)}
                                  className="h-9 rounded-xl bg-slate-50 hover:bg-red-50 hover:text-red-600 text-slate-700 text-[10px] font-bold flex flex-col sm:flex-row items-center justify-center gap-1 border border-slate-200/70 transition-colors cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 size={13} />
                                  <span className="hidden sm:inline">Delete</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : (
              /* EMPTY LIBRARY STATE (CONNECTED BUT 0 FILES) */
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border-2 border-dashed border-slate-200/80 my-4 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto">
                  <Cloud size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-900">No Quotations Found</h3>
                  <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                    Create your first quotation and sync it to Google Drive.
                  </p>
                </div>
                <button
                  onClick={goToCreate}
                  className="h-11 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold text-xs inline-flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Create New Quotation</span>
                </button>
              </div>
            )}
          </>
        )}

      </div>

      {/* Share Dialog Modal */}
      {shareFileModal && (
        <ShareDialogModal
          isOpen={Boolean(shareFileModal)}
          onClose={() => setShareFileModal(null)}
          file={shareFileModal}
          onFileUpdated={() => checkDriveAndLoad()}
          onToast={showToast}
        />
      )}

      {/* QR Code Modal */}
      {qrFileModal && (
        <QRCodeModal
          isOpen={Boolean(qrFileModal)}
          onClose={() => setQrFileModal(null)}
          url={qrFileModal.shareUrl || (qrFileModal.driveFileId ? `https://drive.google.com/file/d/${qrFileModal.driveFileId}/view` : "")}
          fileName={qrFileModal.fileName || "Quotation PDF"}
        />
      )}

      {/* Rename Modal */}
      {renameState.isOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 relative border border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Rename Quotation</h3>
              <button
                onClick={() => setRenameState({ isOpen: false, file: null, newName: "" })}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Quotation Name</label>
              <input
                type="text"
                value={renameState.newName}
                onChange={(e) => setRenameState(prev => ({ ...prev, newName: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && handleSaveRename()}
                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setRenameState({ isOpen: false, file: null, newName: "" })}
                className="h-11 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRename}
                className="h-11 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Save Name
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmState.isOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 relative border border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Delete Quotation?</h3>
              <button
                onClick={() => setDeleteConfirmState({ isOpen: false, file: null, isDeleting: false })}
                disabled={deleteConfirmState.isDeleting}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs font-medium text-slate-600 leading-relaxed">
              This will permanently delete this quotation from your connected Google Drive and remove it from the application.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setDeleteConfirmState({ isOpen: false, file: null, isDeleting: false })}
                disabled={deleteConfirmState.isDeleting}
                className="h-11 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteConfirmState.isDeleting}
                className="h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {deleteConfirmState.isDeleting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
