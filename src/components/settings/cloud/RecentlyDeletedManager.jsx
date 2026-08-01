import React, { useState, useEffect } from "react";
import { Trash2, RotateCcw, AlertTriangle, FileText, CheckCircle2, RefreshCw } from "lucide-react";
import { localDB } from "../../../utils/localDB";
import { googleDriveProvider } from "../../../utils/googleDriveProvider";

export default function RecentlyDeletedManager({ onToast }) {
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isRestoring, setIsRestoring] = useState(false);

  const refreshList = () => {
    setDeletedFiles(localDB.getRecentlyDeletedCloudFiles());
  };

  useEffect(() => {
    refreshList();
    window.addEventListener("cloudFilesUpdated", refreshList);
    return () => window.removeEventListener("cloudFilesUpdated", refreshList);
  }, []);

  const handleRestoreOne = async (file) => {
    setIsRestoring(true);
    try {
      localDB.restoreCloudFile(file.id);
      if (file.driveFileId) {
        await googleDriveProvider.restoreDriveFile(file.driveFileId).catch(() => {});
      }
      refreshList();
      if (onToast) onToast(`Restored "${file.fileName}"`, "success");
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDeleteForeverOne = async (file) => {
    if (window.confirm(`Permanently delete "${file.fileName}"? This action cannot be undone.`)) {
      localDB.permanentDeleteCloudFile(file.id);
      if (file.driveFileId) {
        await googleDriveProvider.deleteDriveFile(file.driveFileId).catch(() => {});
      }
      refreshList();
      if (onToast) onToast("File permanently deleted.", "success");
    }
  };

  const handleBulkRestore = async () => {
    if (selectedIds.length === 0) return;
    setIsRestoring(true);
    try {
      for (const id of selectedIds) {
        const file = localDB.getCloudFileById(id);
        localDB.restoreCloudFile(id);
        if (file?.driveFileId) {
          await googleDriveProvider.restoreDriveFile(file.driveFileId).catch(() => {});
        }
      }
      setSelectedIds([]);
      refreshList();
      if (onToast) onToast(`Restored ${selectedIds.length} files.`, "success");
    } finally {
      setIsRestoring(false);
    }
  };

  const handleEmptyTrash = async () => {
    if (deletedFiles.length === 0) return;
    if (window.confirm("Empty trash completely? All deleted files will be removed permanently.")) {
      for (const file of deletedFiles) {
        localDB.permanentDeleteCloudFile(file.id);
        if (file.driveFileId) {
          await googleDriveProvider.deleteDriveFile(file.driveFileId).catch(() => {});
        }
      }
      setSelectedIds([]);
      refreshList();
      if (onToast) onToast("Trash emptied completely.", "success");
    }
  };

  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return "245 KB";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Recently";
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-3xl p-5 shadow-sm flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-bold">
            <Trash2 size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-amber-950 tracking-tight">Recently Deleted Trash</h3>
            <p className="text-xs text-amber-800 font-medium">{deletedFiles.length} files in trash</p>
          </div>
        </div>

        {deletedFiles.length > 0 && (
          <button
            onClick={handleEmptyTrash}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Empty Trash
          </button>
        )}
      </div>

      {/* Bulk bar */}
      {selectedIds.length > 0 && (
        <div className="bg-amber-700 text-white rounded-2xl p-3.5 flex items-center justify-between gap-2 shadow-md">
          <span className="text-xs font-bold">{selectedIds.length} Items Selected</span>
          <div className="flex gap-2">
            <button
              onClick={handleBulkRestore}
              disabled={isRestoring}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <RotateCcw size={14} />
              <span>Restore Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* Deleted Files List */}
      {deletedFiles.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200/90 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 size={30} />
          </div>
          <h4 className="text-base font-black text-slate-900">Trash is Empty</h4>
          <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
            Files deleted from your cloud manager will appear here for 30 days before permanent deletion.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 divide-y divide-slate-100 overflow-hidden shadow-sm">
          {deletedFiles.map((file) => (
            <div key={file.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-2xl shrink-0">📄</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-slate-900 truncate">{file.fileName}</p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Deleted on {formatDate(file.deletedAt)} • {formatSize(file.size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleRestoreOne(file)}
                  disabled={isRestoring}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw size={13} />
                  <span>Restore</span>
                </button>

                <button
                  onClick={() => handleDeleteOneForever(file)}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-xl transition-colors cursor-pointer"
                  title="Delete Permanently"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
