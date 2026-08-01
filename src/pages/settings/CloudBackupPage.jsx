import React, { useState, useEffect } from "react";
import MobileHeader from "../../components/mobile/MobileHeader";
import CloudAccountCard from "../../components/settings/cloud/CloudAccountCard";
import BackupSettingsCard from "../../components/settings/cloud/BackupSettingsCard";
import WorkspaceBackupCard from "../../components/settings/cloud/WorkspaceBackupCard";
import UploadedFilesManager from "../../components/settings/cloud/UploadedFilesManager";
import RecentlyDeletedManager from "../../components/settings/cloud/RecentlyDeletedManager";
import SyncHistoryTimeline from "../../components/settings/cloud/SyncHistoryTimeline";
import StorageAnalyticsCard from "../../components/settings/cloud/StorageAnalyticsCard";
import FileDetailsDrawer from "../../components/settings/cloud/FileDetailsDrawer";
import QRCodeModal from "../../components/settings/cloud/QRCodeModal";
import ShareDialogModal from "../../components/export/ShareDialogModal";
import { localDB } from "../../utils/localDB";
import { googleDriveProvider } from "../../utils/googleDriveProvider";
import {
  Cloud, HardDrive, Trash2, History, PieChart, CheckCircle2, AlertCircle,
  FileText, ShieldCheck, X, Edit3
} from "lucide-react";

/**
 * ☁️ CloudBackupPage — Enterprise Cloud & Backup Manager (Google Drive Integration)
 */
export default function CloudBackupPage({ onBack }) {
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "files" | "deleted" | "history" | "analytics"
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Selected file drawers & modals state
  const [selectedFile, setSelectedFile] = useState(null);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [shareModalState, setShareModalState] = useState({ isOpen: false, file: null });
  const [qrModalState, setQrModalState] = useState({ isOpen: false, url: "", fileName: "" });
  const [renameModalState, setRenameModalState] = useState({ isOpen: false, file: null, newName: "" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3500);
  };

  const handleOpenFileDetails = (file) => {
    setSelectedFile(file);
    setShowDetailsDrawer(true);
  };

  const handleCopyLink = (url) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    showToast("Share URL copied to clipboard!", "success");
  };

  const handleOpenRenameModal = (file) => {
    setRenameModalState({
      isOpen: true,
      file,
      newName: file.fileName || "",
    });
  };

  const handleSaveRename = async () => {
    const { file, newName } = renameModalState;
    if (!file || !newName || !newName.trim()) return;

    localDB.updateCloudFile(file.id, { fileName: newName.trim() });
    if (file.driveFileId) {
      await googleDriveProvider.renameDriveFile(file.driveFileId, newName.trim()).catch(() => {});
    }

    setRenameModalState({ isOpen: false, file: null, newName: "" });
    if (selectedFile?.id === file.id) {
      setSelectedFile((prev) => (prev ? { ...prev, fileName: newName.trim() } : null));
    }
    showToast("File renamed successfully.", "success");
  };

  const handleShowQR = (file) => {
    if (file?.shareUrl) {
      setQrModalState({
        isOpen: true,
        url: file.shareUrl,
        fileName: file.fileName,
      });
    } else {
      showToast("Public share URL required to generate QR code.", "error");
    }
  };

  const handleDeleteFile = async (file) => {
    localDB.softDeleteCloudFile(file.id);
    if (file.driveFileId) {
      await googleDriveProvider.deleteDriveFile(file.driveFileId).catch(() => {});
    }
    showToast(`Moved "${file.fileName}" to Recently Deleted.`, "success");
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: <Cloud size={16} /> },
    { id: "files", label: "Uploaded Files", icon: <FileText size={16} /> },
    { id: "deleted", label: "Trash", icon: <Trash2 size={16} /> },
    { id: "history", label: "Sync History", icon: <History size={16} /> },
    { id: "analytics", label: "Analytics", icon: <PieChart size={16} /> },
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans pb-24 relative">
      <MobileHeader title="Cloud & Backup Manager" onBack={onBack} />

      {/* Toast Banner */}
      {toast.show && (
        <div className={`fixed top-16 left-4 right-4 z-[130] px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-semibold ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span className="flex-1">{toast.message}</span>
        </div>
      )}

      <div className="w-full px-4 py-4 space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs Bar */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-xs overflow-x-auto gap-1 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer snap-center ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Cloud Overview & Settings */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <CloudAccountCard onToast={showToast} />
            <WorkspaceBackupCard onToast={showToast} />
            <BackupSettingsCard onToast={showToast} />
          </div>
        )}

        {/* Tab 2: Uploaded Files Manager */}
        {activeTab === "files" && (
          <UploadedFilesManager
            onSelectFile={handleOpenFileDetails}
            onCopyLink={handleCopyLink}
            onOpenRename={handleOpenRenameModal}
            onShowQR={handleShowQR}
            onOpenShareModal={(file) => {
              setSelectedFile(file);
              setShareModalState({ isOpen: true, file });
            }}
            onToast={showToast}
          />
        )}

        {/* Tab 3: Recently Deleted */}
        {activeTab === "deleted" && (
          <RecentlyDeletedManager onToast={showToast} />
        )}

        {/* Tab 4: Sync History */}
        {activeTab === "history" && (
          <SyncHistoryTimeline />
        )}

        {/* Tab 5: Analytics & Advanced */}
        {activeTab === "analytics" && (
          <StorageAnalyticsCard onToast={showToast} />
        )}
      </div>

      {/* File Details Drawer */}
      <FileDetailsDrawer
        file={selectedFile}
        isOpen={showDetailsDrawer}
        onClose={() => setShowDetailsDrawer(false)}
        onCopyLink={handleCopyLink}
        onOpenRename={handleOpenRenameModal}
        onDelete={handleDeleteFile}
        onShowQR={handleShowQR}
        onOpenShareModal={(file) => {
          setSelectedFile(file);
          setShareModalState({ isOpen: true, file });
        }}
      />

      {/* Share Dialog Modal */}
      <ShareDialogModal
        isOpen={shareModalState.isOpen}
        onClose={() => setShareModalState({ isOpen: false, file: null })}
        file={shareModalState.file || selectedFile}
        onFileUpdated={(updated) => {
          setSelectedFile(updated);
          window.dispatchEvent(new Event("cloudFilesUpdated"));
        }}
        onToast={showToast}
      />

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={qrModalState.isOpen}
        onClose={() => setQrModalState({ isOpen: false, url: "", fileName: "" })}
        url={qrModalState.url}
        fileName={qrModalState.fileName}
      />

      {/* Rename File Modal */}
      {renameModalState.isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setRenameModalState({ isOpen: false, file: null, newName: "" })}
          />
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 max-w-sm w-full z-10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Edit3 size={18} className="text-blue-600" /> Rename File
              </h3>
              <button
                onClick={() => setRenameModalState({ isOpen: false, file: null, newName: "" })}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">File Name</label>
              <input
                type="text"
                value={renameModalState.newName}
                onChange={(e) => setRenameModalState((prev) => ({ ...prev, newName: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && handleSaveRename()}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                autoFocus
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRenameModalState({ isOpen: false, file: null, newName: "" })}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRename}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Save Name
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
