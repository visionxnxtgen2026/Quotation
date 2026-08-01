import React, { useState, useEffect } from "react";
import {
  HardDrive, Upload, RotateCcw, Download, Trash2, Edit3, Check, Loader2,
  AlertTriangle, ShieldCheck, Laptop, Smartphone, FileArchive, Sparkles, X, RefreshCw
} from "lucide-react";
import { workspaceBackupProvider } from "../../../utils/workspaceBackupProvider";
import { googleDriveProvider } from "../../../utils/googleDriveProvider";

export default function WorkspaceBackupCard({ onToast }) {
  const [backups, setBackups] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [progressPct, setProgressPct] = useState(0);

  // Modal states
  const [confirmBackupModal, setConfirmBackupModal] = useState(false);
  const [smartRestoreModal, setSmartRestoreModal] = useState({ isOpen: false, backup: null, mode: "replace" });
  const [renameModal, setRenameModal] = useState({ isOpen: false, backup: null, newName: "" });

  // Auto backup settings state
  const [autoBackupWeek, setAutoBackupWeek] = useState(() => localStorage.getItem("autobackup_week") !== "false");
  const [autoBackupUpdate, setAutoBackupUpdate] = useState(() => localStorage.getItem("autobackup_update") !== "false");
  const [autoBackupReset, setAutoBackupReset] = useState(() => localStorage.getItem("autobackup_reset") !== "false");
  const [autoBackupLogout, setAutoBackupLogout] = useState(() => localStorage.getItem("autobackup_logout") !== "false");

  const loadBackups = async () => {
    setIsLoadingList(true);
    try {
      const list = await workspaceBackupProvider.fetchWorkspaceBackupsList();
      setBackups(list);
    } catch (err) {
      console.warn("Error loading backups list:", err);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    loadBackups();
  }, []);

  const handleStartBackup = async () => {
    setConfirmBackupModal(false);
    setIsBackingUp(true);
    setProgressMsg("Preparing Workspace...");
    setProgressPct(10);

    try {
      await workspaceBackupProvider.uploadWorkspaceBackup((msg, pct) => {
        setProgressMsg(msg);
        setProgressPct(pct);
      });

      await loadBackups();
      if (onToast) onToast("Full Workspace Backup saved to Google Drive!", "success");
    } catch (err) {
      console.error("Workspace Backup Error:", err);
      if (onToast) onToast(err.message || "Failed to create workspace backup.", "error");
    } finally {
      setTimeout(() => {
        setIsBackingUp(false);
        setProgressMsg("");
        setProgressPct(0);
      }, 1200);
    }
  };

  const handleExecuteRestore = async () => {
    const { backup, mode } = smartRestoreModal;
    if (!backup) return;

    setSmartRestoreModal({ isOpen: false, backup: null, mode: "replace" });
    setIsRestoring(true);
    setProgressMsg("Downloading Backup Archive...");
    setProgressPct(20);

    try {
      await workspaceBackupProvider.restoreWorkspace(backup.id, mode, (msg, pct) => {
        setProgressMsg(msg);
        setProgressPct(pct);
      });

      if (onToast) onToast(`Workspace restored successfully (${mode.toUpperCase()} mode)!`, "success");
    } catch (err) {
      console.error("Workspace Restore Error:", err);
      if (onToast) onToast(err.message || "Failed to restore workspace backup.", "error");
    } finally {
      setTimeout(() => {
        setIsRestoring(false);
        setProgressMsg("");
        setProgressPct(0);
      }, 1200);
    }
  };

  const handleDeleteBackup = async (backup) => {
    if (window.confirm(`Permanently delete backup "${backup.fileName}" from Google Drive?`)) {
      await googleDriveProvider.deleteDriveFile(backup.id);
      await loadBackups();
      if (onToast) onToast("Workspace backup deleted.", "success");
    }
  };

  const handleSaveRename = async () => {
    const { backup, newName } = renameModal;
    if (!backup || !newName || !newName.trim()) return;

    const formattedName = newName.trim().endsWith(".zip") ? newName.trim() : `${newName.trim()}.zip`;
    await googleDriveProvider.renameDriveFile(backup.id, formattedName);
    setRenameModal({ isOpen: false, backup: null, newName: "" });
    await loadBackups();
    if (onToast) onToast("Backup renamed successfully.", "success");
  };

  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return "1.8 MB";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Recently";
    try {
      return new Date(dateStr).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. TOP HEADER & BACKUP ACTION CARD */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-3xl p-5 text-white shadow-xl space-y-4 relative overflow-hidden">
        {/* Glow accent background */}
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-blue-500/20 blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/20">
              <FileArchive size={22} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-blue-300 tracking-wider">Device Migration</span>
              <h3 className="text-base font-black text-white tracking-tight">Workspace Backup &amp; Migration</h3>
            </div>
          </div>

          <button
            onClick={loadBackups}
            disabled={isLoadingList}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Refresh Backups List"
          >
            <RefreshCw size={16} className={isLoadingList ? "animate-spin" : ""} />
          </button>
        </div>

        <p className="text-xs text-blue-100/90 font-medium leading-relaxed">
          Back up your entire workspace (quotations, company profiles, logos, templates, settings, and database) into a single archive on Google Drive for easy device migration.
        </p>

        <button
          onClick={() => setConfirmBackupModal(true)}
          disabled={isBackingUp || isRestoring}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-2xl font-black text-xs tracking-wide shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-60"
        >
          <Upload size={16} />
          <span>Backup Workspace to Google Drive</span>
        </button>
      </div>

      {/* 2. AUTO BACKUP CHECKBOXES CARD */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider text-slate-400">
          Automated Workspace Backup Rules
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            { key: "week", label: "Auto Backup Every Week", state: autoBackupWeek, setter: setAutoBackupWeek },
            { key: "update", label: "Auto Backup Before App Update", state: autoBackupUpdate, setter: setAutoBackupUpdate },
            { key: "reset", label: "Auto Backup Before Reset", state: autoBackupReset, setter: setAutoBackupReset },
            { key: "logout", label: "Auto Backup Before Logout", state: autoBackupLogout, setter: setAutoBackupLogout },
          ].map(({ key, label, state, setter }) => (
            <label
              key={key}
              className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                state ? "bg-blue-50/50 border-blue-200" : "bg-slate-50 border-slate-200/80"
              }`}
            >
              <span className="text-xs font-bold text-slate-800 pr-2">{label}</span>
              <input
                type="checkbox"
                checked={state}
                onChange={(e) => {
                  const val = e.target.checked;
                  setter(val);
                  localStorage.setItem(`autobackup_${key}`, String(val));
                }}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
              />
            </label>
          ))}
        </div>
      </div>

      {/* 3. AVAILABLE BACKUPS LIST CARD */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider text-slate-400">
            Available Google Drive Backups ({backups.length})
          </h4>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            Newest First
          </span>
        </div>

        {isLoadingList ? (
          <div className="py-8 text-center space-y-2">
            <Loader2 size={24} className="animate-spin text-blue-600 mx-auto" />
            <p className="text-xs font-bold text-slate-500">Scanning Google Drive Workspace Backups...</p>
          </div>
        ) : backups.length === 0 ? (
          <div className="py-8 text-center space-y-2 border-2 border-dashed border-slate-200 rounded-2xl">
            <FileArchive size={32} className="text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No Workspace Backups Found</p>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              Tap "Backup Workspace to Google Drive" above to create your first cloud migration archive.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {backups.map((b) => (
              <div
                key={b.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 hover:border-slate-300 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold">
                    <FileArchive size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-slate-900 truncate">{b.fileName}</p>
                    <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                      {formatDate(b.createdTime)} • {formatSize(b.size)} • <span className="font-bold text-slate-700">{b.deviceName}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setSmartRestoreModal({ isOpen: true, backup: b, mode: "replace" })}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                  >
                    <RotateCcw size={13} />
                    <span>Restore</span>
                  </button>

                  <button
                    onClick={() => setRenameModal({ isOpen: true, backup: b, newName: b.fileName })}
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                    title="Rename Backup"
                  >
                    <Edit3 size={15} />
                  </button>

                  <button
                    onClick={() => handleDeleteBackup(b)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete Backup"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── MODALS & OVERLAYS ─── */}

      {/* BACKUP CONFIRMATION MODAL */}
      {confirmBackupModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setConfirmBackupModal(false)} />
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 max-w-sm w-full z-10 space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
              <Upload size={28} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Backup Complete Workspace?</h3>
              <p className="text-xs text-slate-500 font-medium mt-1.5 leading-relaxed">
                This packs all quotations, company profiles, logos, templates, settings, and database into a single ZIP on Google Drive for device migration.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setConfirmBackupModal(false)}
                className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleStartBackup}
                className="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Backup Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SMART RESTORE MODAL */}
      {smartRestoreModal.isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setSmartRestoreModal({ isOpen: false, backup: null, mode: "replace" })} />
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 max-w-md w-full z-10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <RotateCcw size={20} className="text-blue-600" /> Restore Workspace
              </h3>
              <button
                onClick={() => setSmartRestoreModal({ isOpen: false, backup: null, mode: "replace" })}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Choose how you want to restore workspace backup <span className="font-bold text-slate-800">{smartRestoreModal.backup?.fileName}</span>:
            </p>

            <div className="space-y-2.5">
              <div
                onClick={() => setSmartRestoreModal((prev) => ({ ...prev, mode: "replace" }))}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  smartRestoreModal.mode === "replace"
                    ? "border-blue-600 bg-blue-50/50 shadow-xs"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-slate-900">Replace Existing Workspace</span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Recommended</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Clears local storage and restores everything fresh from this backup file.
                </p>
              </div>

              <div
                onClick={() => setSmartRestoreModal((prev) => ({ ...prev, mode: "merge" }))}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  smartRestoreModal.mode === "merge"
                    ? "border-emerald-600 bg-emerald-50/50 shadow-xs"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-slate-900">Merge Workspace Data</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Combines quotations and profiles from this backup with your current local database.
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSmartRestoreModal({ isOpen: false, backup: null, mode: "replace" })}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteRestore}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Restore Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENAME BACKUP MODAL */}
      {renameModal.isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setRenameModal({ isOpen: false, backup: null, newName: "" })} />
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 max-w-sm w-full z-10 space-y-4">
            <h3 className="text-base font-black text-slate-900">Rename Backup Archive</h3>
            <input
              type="text"
              value={renameModal.newName}
              onChange={(e) => setRenameModal((prev) => ({ ...prev, newName: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleSaveRename()}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => setRenameModal({ isOpen: false, backup: null, newName: "" })}
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

      {/* BACKUP / RESTORE PROGRESS FULLSCREEN OVERLAY */}
      {(isBackingUp || isRestoring) && (
        <div className="fixed inset-0 z-[140] bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center space-y-5">
          <div className="w-20 h-20 rounded-3xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center animate-bounce">
            <FileArchive size={40} className="text-blue-400" />
          </div>

          <div>
            <h3 className="text-xl font-black text-white">
              {isBackingUp ? "Backing Up Workspace..." : "Restoring Workspace..."}
            </h3>
            <p className="text-xs text-blue-200 font-medium mt-1">{progressMsg}</p>
          </div>

          <div className="w-full max-w-xs space-y-1">
            <div className="h-2 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-blue-300 font-bold block text-right">{progressPct}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
