import React, { useState, useEffect, useMemo } from "react";
import {
  Search, Filter, ArrowUpDown, LayoutGrid, List, CheckSquare, Square,
  Download, Trash2, ExternalLink, Copy, Edit3, Lock, Globe, QrCode, FileText, Share2
} from "lucide-react";
import { localDB } from "../../../utils/localDB";
import { googleDriveProvider } from "../../../utils/googleDriveProvider";

export default function UploadedFilesManager({
  onSelectFile,
  onCopyLink,
  onOpenRename,
  onShowQR,
  onOpenShareModal,
  onToast
}) {
  const [files, setFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // "all" | "today" | "yesterday" | "7days" | "month"
  const [visibilityFilter, setVisibilityFilter] = useState("all"); // "all" | "public" | "private"
  const [sortBy, setSortBy] = useState("newest"); // "newest" | "oldest" | "largest" | "smallest"
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [selectedIds, setSelectedIds] = useState([]);

  const refreshFiles = () => {
    setFiles(localDB.getActiveCloudFiles());
  };

  useEffect(() => {
    refreshFiles();
    window.addEventListener("cloudFilesUpdated", refreshFiles);
    return () => window.removeEventListener("cloudFilesUpdated", refreshFiles);
  }, []);

  // Filter & Sort Logic
  const filteredFiles = useMemo(() => {
    return files.filter((f) => {
      // Search filter
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        (f.fileName && f.fileName.toLowerCase().includes(query)) ||
        (f.customerName && f.customerName.toLowerCase().includes(query)) ||
        (f.quotationNumber && f.quotationNumber.toLowerCase().includes(query));

      if (!matchSearch) return false;

      // Visibility filter
      if (visibilityFilter !== "all" && f.visibility !== visibilityFilter) {
        return false;
      }

      // Date filter
      if (dateFilter !== "all" && f.createdAt) {
        const fileTime = new Date(f.createdAt).getTime();
        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;

        if (dateFilter === "today") {
          const todayStart = new Date().setHours(0, 0, 0, 0);
          if (fileTime < todayStart) return false;
        } else if (dateFilter === "yesterday") {
          const yesterdayStart = new Date(now - dayMs).setHours(0, 0, 0, 0);
          const todayStart = new Date().setHours(0, 0, 0, 0);
          if (fileTime < yesterdayStart || fileTime >= todayStart) return false;
        } else if (dateFilter === "7days") {
          if (now - fileTime > 7 * dayMs) return false;
        } else if (dateFilter === "month") {
          if (now - fileTime > 30 * dayMs) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "largest") return (b.size || 0) - (a.size || 0);
      if (sortBy === "smallest") return (a.size || 0) - (b.size || 0);
      return 0;
    });
  }, [files, searchQuery, dateFilter, visibilityFilter, sortBy]);

  // Bulk Selection Handlers
  const handleSelectAll = () => {
    if (selectedIds.length === filteredFiles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredFiles.map((f) => f.id));
    }
  };

  const toggleSelectOne = (id, e) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Move ${selectedIds.length} selected files to Recently Deleted?`)) {
      localDB.bulkSoftDeleteCloudFiles(selectedIds);
      setSelectedIds([]);
      refreshFiles();
      if (onToast) onToast("Selected files moved to Recently Deleted.", "success");
    }
  };

  const handleBulkDownload = () => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach((id) => {
      const f = localDB.getCloudFileById(id);
      if (f?.shareUrl) {
        window.open(f.shareUrl, "_blank");
      }
    });
    if (onToast) onToast(`Opening ${selectedIds.length} files...`, "success");
  };

  const handleDeleteOne = (id, e) => {
    e.stopPropagation();
    localDB.softDeleteCloudFile(id);
    refreshFiles();
    if (onToast) onToast("File moved to Recently Deleted.", "success");
  };

  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return "245 KB";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Just now";
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    } catch {
      return "Recent";
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-sm space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by quotation number, customer name, or filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/90 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        {/* Filter controls row */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Date filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-700 focus:outline-none focus:border-blue-600"
            >
              <option value="all">📅 All Dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="7days">Last 7 Days</option>
              <option value="month">Last Month</option>
            </select>

            {/* Visibility filter */}
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-700 focus:outline-none focus:border-blue-600"
            >
              <option value="all">👁 All Visibility</option>
              <option value="public">🌐 Public Only</option>
              <option value="private">🔒 Private Only</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-700 focus:outline-none focus:border-blue-600"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="largest">Largest Size</option>
              <option value="smallest">Smallest Size</option>
            </select>
          </div>

          {/* Grid vs List toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 border border-slate-200">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "grid" ? "bg-white text-blue-600 shadow-2xs font-bold" : "text-slate-500"
              }`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "list" ? "bg-white text-blue-600 shadow-2xs font-bold" : "text-slate-500"
              }`}
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar (when selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-600 text-white rounded-2xl p-3.5 shadow-md flex items-center justify-between gap-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-xs font-black">
            <button onClick={handleSelectAll} className="flex items-center gap-1 cursor-pointer">
              <CheckSquare size={16} />
              <span>{selectedIds.length} Selected</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkDownload}
              className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Download size={14} />
              <span>Download</span>
            </button>

            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Files List / Empty State */}
      {filteredFiles.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200/90 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FileText size={28} />
          </div>
          <h4 className="text-base font-black text-slate-900">No Uploaded Files Found</h4>
          <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
            Export a quotation or sync with Google Drive to see your uploaded file cards here.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredFiles.map((file) => {
            const isSelected = selectedIds.includes(file.id);
            return (
              <div
                key={file.id}
                onClick={() => onSelectFile(file)}
                className={`bg-white rounded-3xl p-4 border transition-all cursor-pointer relative group flex flex-col justify-between space-y-3 ${
                  isSelected ? "border-blue-500 bg-blue-50/20 shadow-md" : "border-slate-200/90 hover:border-slate-300 hover:shadow-md"
                }`}
              >
                {/* Top header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      onClick={(e) => toggleSelectOne(file.id, e)}
                      className="text-slate-400 hover:text-blue-600 transition-colors shrink-0"
                    >
                      {isSelected ? <CheckSquare size={18} className="text-blue-600" /> : <Square size={18} />}
                    </button>

                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 text-xl">
                      {file.fileName?.endsWith(".pdf") ? "📄" : file.fileName?.endsWith(".docx") ? "📝" : "🖼️"}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-900 truncate">{file.fileName}</p>
                      <p className="text-[10px] text-slate-400 font-bold truncate">
                        {file.customerName || file.quotationNumber || "Quotation"}
                      </p>
                    </div>
                  </div>

                  {/* Visibility badge */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenShareModal) onOpenShareModal(file);
                    }}
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 cursor-pointer hover:scale-105 transition-transform ${
                      file.visibility === "public" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                    title="Click to manage permissions & share settings"
                  >
                    {file.visibility === "public" ? "🌍 Public" : "🔒 Private"}
                  </button>
                </div>

                {/* File Meta info */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100">
                  <span>{formatDate(file.createdAt)}</span>
                  <span className="font-mono">{formatSize(file.size)}</span>
                </div>

                {/* Inline Action Buttons */}
                <div className="flex items-center justify-between gap-1 pt-1">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenShareModal) onOpenShareModal(file);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      title="Share & Permissions"
                    >
                      <Share2 size={14} />
                    </button>

                    {file.shareUrl && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCopyLink(file.shareUrl);
                        }}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                        title="Copy Link"
                      >
                        <Copy size={14} />
                      </button>
                    )}

                    {file.visibility === "public" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onShowQR(file);
                        }}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
                        title="Show QR"
                      >
                        <QrCode size={14} />
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenRename(file);
                      }}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                      title="Rename"
                    >
                      <Edit3 size={14} />
                    </button>
                  </div>

                  <button
                    onClick={(e) => handleDeleteOne(file.id, e)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white rounded-3xl border border-slate-200/90 divide-y divide-slate-100 overflow-hidden shadow-sm">
          {filteredFiles.map((file) => {
            const isSelected = selectedIds.includes(file.id);
            return (
              <div
                key={file.id}
                onClick={() => onSelectFile(file)}
                className={`p-4 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                  isSelected ? "bg-blue-50/40" : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    onClick={(e) => toggleSelectOne(file.id, e)}
                    className="text-slate-400 hover:text-blue-600 transition-colors shrink-0"
                  >
                    {isSelected ? <CheckSquare size={18} className="text-blue-600" /> : <Square size={18} />}
                  </button>

                  <span className="text-xl shrink-0">
                    {file.fileName?.endsWith(".pdf") ? "📄" : file.fileName?.endsWith(".docx") ? "📝" : "🖼️"}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-slate-900 truncate">{file.fileName}</p>
                    <p className="text-[11px] text-slate-400 font-bold truncate">
                      {file.customerName || file.quotationNumber || "Quotation"} • {formatDate(file.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono font-bold text-slate-600 hidden sm:inline">{formatSize(file.size)}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    file.visibility === "public" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  }`}>
                    {file.visibility === "public" ? "Public" : "Private"}
                  </span>
                  <button
                    onClick={(e) => handleDeleteOne(file.id, e)}
                    className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
