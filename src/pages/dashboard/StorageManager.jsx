import React, { useState, useEffect } from "react";
import MobileHeader from "../../components/mobile/MobileHeader";
import BannerAd from "../../components/mobile/BannerAd";
import { admobManager } from "../../utils/admobManager";
import { localDB } from "../../utils/localDB";
import {
  FileText,
  Search,
  Filter,
  ArrowUpDown,
  Building2,
  Calendar,
  Eye,
  Edit3,
  Copy,
  Download,
  Trash2,
  Archive,
  ArchiveRestore,
  Plus,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Sparkles,
  X,
  FileSearch,
  ChevronDown
} from "lucide-react";

/**
 * 🗄️ QuotationManager (StorageManager) — Dedicated Quotation Archive & Manager Page
 * Allows search, multi-field filter, date filtering, sorting, duplicate, export, archive & delete.
 */
export default function StorageManager({
  goBack,
  goToDashboard,
  goToCreate,
  goToPreview,
  goToExport,
  goToStorage,
  goToSettings,
  goToHelp,
  setQuotationId,
}) {
  const [quotations, setQuotations] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL"); // ALL | TODAY | WEEK | MONTH | YEAR
  const [sortBy, setSortBy] = useState("NEWEST"); // NEWEST | OLDEST | AMOUNT_HIGH | CLIENT_AZ
  const [viewArchived, setViewArchived] = useState(false);

  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showAdvancedBackup, setShowAdvancedBackup] = useState(false);
  const [metrics, setMetrics] = useState({ totalQuotations: 0, usedKB: 0 });

  const loadData = () => {
    const list = localDB.getQuotations();
    const companyList = localDB.getCompanyProfiles();
    setQuotations(list);
    setProfiles(companyList);
    setMetrics(localDB.getStorageMetrics());
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  // ── FILTER & SORT LOGIC ──
  const filteredQuotations = quotations
    .filter((q) => {
      // 1. Archive status filter
      const isArchived = Boolean(q.isArchived);
      if (viewArchived !== isArchived) return false;

      // 2. Search query filter
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        const client = (q.clientName || q.projectDetails?.clientName || "").toLowerCase();
        const refNo = (q.quotationNo || q.projectDetails?.referenceNo || q._id || "").toLowerCase();
        const project = (q.projectName || q.projectDetails?.projectName || "").toLowerCase();
        const company = (q.companyName || q.projectDetails?.companyName || "").toLowerCase();
        const matchesSearch =
          client.includes(query) ||
          refNo.includes(query) ||
          project.includes(query) ||
          company.includes(query);
        if (!matchesSearch) return false;
      }

      // 3. Company Profile filter
      if (companyFilter !== "ALL") {
        const qCompany = (q.companyName || q.projectDetails?.companyName || "").trim();
        if (qCompany !== companyFilter) return false;
      }

      // 4. Date filter
      if (dateFilter !== "ALL") {
        const qDate = new Date(q.updatedAt || q.createdAt || q.date || Date.now());
        const now = new Date();
        if (dateFilter === "TODAY") {
          if (qDate.toDateString() !== now.toDateString()) return false;
        } else if (dateFilter === "WEEK") {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (qDate < sevenDaysAgo) return false;
        } else if (dateFilter === "MONTH") {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (qDate < thirtyDaysAgo) return false;
        } else if (dateFilter === "YEAR") {
          if (qDate.getFullYear() !== now.getFullYear()) return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || Date.now()).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt || Date.now()).getTime();
      const totalA = Number(a.grandTotal || a.pricing?.grandTotal || 0);
      const totalB = Number(b.grandTotal || b.pricing?.grandTotal || 0);
      const clientA = (a.clientName || a.projectDetails?.clientName || "").toLowerCase();
      const clientB = (b.clientName || b.projectDetails?.clientName || "").toLowerCase();

      if (sortBy === "NEWEST") return dateB - dateA;
      if (sortBy === "OLDEST") return dateA - dateB;
      if (sortBy === "AMOUNT_HIGH") return totalB - totalA;
      if (sortBy === "CLIENT_AZ") return clientA.localeCompare(clientB);
      return 0;
    });

  // ── ACTIONS ──
  const handleViewPDF = (q) => {
    if (setQuotationId) setQuotationId(q._id || q.id);
    if (localDB.saveDraft) localDB.saveDraft(q);
    else localStorage.setItem("previewDraft", JSON.stringify(q));
    goToPreview();
  };

  const handleEdit = (q) => {
    if (setQuotationId) setQuotationId(q._id || q.id);
    if (localDB.saveDraft) localDB.saveDraft(q);
    else localStorage.setItem("previewDraft", JSON.stringify(q));
    goToCreate();
  };

  const handleExportPDF = (q) => {
    if (setQuotationId) setQuotationId(q._id || q.id);
    if (localDB.saveDraft) localDB.saveDraft(q);
    else localStorage.setItem("previewDraft", JSON.stringify(q));
    goToExport();
  };

  const handleDuplicate = (q) => {
    const duplicated = localDB.duplicateQuotation(q._id || q.id);
    if (duplicated) {
      loadData();
      showToast("Quotation duplicated successfully!", "success");
    } else {
      showToast("Duplicate failed.", "error");
    }
  };

  const handleToggleArchive = (q) => {
    const nextArchived = !q.isArchived;
    const updated = { ...q, isArchived: nextArchived };
    localDB.saveQuotation(updated);
    loadData();
    showToast(
      nextArchived ? "Moved quotation to Archive." : "Restored quotation from Archive.",
      "success"
    );
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      localDB.deleteQuotation(deleteTarget._id || deleteTarget.id);
      loadData();
      showToast("Quotation deleted permanently.", "success");
    } catch {
      showToast("Failed to delete quotation.", "error");
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  const handleExportJSON = () => {
    localDB.exportBackupJSON();
    showToast("JSON Backup downloaded.", "success");
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const success = localDB.importBackupJSON(ev.target.result);
      if (success) {
        loadData();
        showToast("Backup restored successfully!", "success");
        admobManager.showInterstitial("Restore Backup");
      } else {
        showToast("Invalid JSON backup file.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const activeCount = quotations.filter((q) => !q.isArchived).length;
  const archivedCount = quotations.filter((q) => q.isArchived).length;

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans pb-24 relative text-slate-800">
      <MobileHeader
        title="Quotation Manager"
        subtitle="Search, filter, export and manage your quotation archive"
        onBack={goBack}
      />

      {/* Toast Alert */}
      {toast.show && (
        <div
          className={`fixed top-16 left-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3 text-xs font-semibold ${
            toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span className="flex-1">{toast.message}</span>
        </div>
      )}

      <div className="w-full max-w-5xl mx-auto px-4 py-5 space-y-5">

        {/* ── TOP ACTION BAR & ARCHIVE TOGGLE ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewArchived(false)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                !viewArchived
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Active Quotations ({activeCount})
            </button>
            <button
              onClick={() => setViewArchived(true)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewArchived
                  ? "bg-slate-800 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Archive size={14} /> Archived ({archivedCount})
            </button>
          </div>

          <button
            onClick={() => {
              if (setQuotationId) setQuotationId(null);
              localStorage.removeItem("previewDraft");
              goToCreate();
            }}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} /> Create Quotation
          </button>
        </div>

        {/* ── SEARCH & FILTER TOOLBAR ── */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          {/* Search Box */}
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by client, quotation no, or project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-9 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter Pills Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Filter by Company */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-200/80">
              <Building2 size={16} className="text-slate-400 shrink-0" />
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer truncate"
              >
                <option value="ALL">All Companies</option>
                {profiles.map((p, idx) => (
                  <option key={idx} value={p.companyName}>
                    {p.companyName}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Date Range */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-200/80">
              <Calendar size={16} className="text-slate-400 shrink-0" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Time</option>
                <option value="TODAY">Today</option>
                <option value="WEEK">This Week (7 Days)</option>
                <option value="MONTH">This Month (30 Days)</option>
                <option value="YEAR">This Year</option>
              </select>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-200/80">
              <ArrowUpDown size={16} className="text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="NEWEST">Sort: Newest First</option>
                <option value="OLDEST">Sort: Oldest First</option>
                <option value="AMOUNT_HIGH">Sort: Amount (High to Low)</option>
                <option value="CLIENT_AZ">Sort: Client Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── QUOTATION LIST RESULTS ── */}
        {filteredQuotations.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 space-y-3">
            <FileSearch size={40} className="text-slate-300 mx-auto" />
            <div>
              <p className="text-sm font-bold text-slate-800">
                {quotations.length === 0
                  ? "No Saved Quotations"
                  : "No Quotations Match Your Filters"}
              </p>
              <p className="text-xs text-slate-500 font-normal mt-0.5 max-w-sm mx-auto">
                {quotations.length === 0
                  ? "Create your first quotation document to start managing client estimates."
                  : "Try clearing your search query or selecting 'All Companies' / 'All Time'."}
              </p>
            </div>

            {quotations.length === 0 ? (
              <button
                onClick={() => {
                  if (setQuotationId) setQuotationId(null);
                  localStorage.removeItem("previewDraft");
                  goToCreate();
                }}
                className="px-5 py-2.5 rounded-2xl bg-blue-600 text-white font-extrabold text-xs shadow-sm hover:bg-blue-700 transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus size={16} /> Create Quotation
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCompanyFilter("ALL");
                  setDateFilter("ALL");
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between px-1 text-xs font-bold text-slate-500">
              <span>Showing {filteredQuotations.length} {viewArchived ? "Archived" : ""} Quotations</span>
              <span>Sorted by {sortBy.replace("_", " ").toLowerCase()}</span>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {filteredQuotations.map((q) => {
                const qId = q._id || q.id;
                const refNo = q.quotationNo || q.projectDetails?.referenceNo || "—";
                const client = q.clientName || q.projectDetails?.clientName || "Client";
                const project = q.projectName || q.projectDetails?.projectName || "Quotation";
                const company = q.companyName || q.projectDetails?.companyName || "My Company";
                const total = q.grandTotal || q.pricing?.grandTotal || 0;
                const date = q.date || q.projectDetails?.date
                  ? new Date(q.date || q.projectDetails?.date).toLocaleDateString("en-IN")
                  : new Date(q.createdAt || Date.now()).toLocaleDateString("en-IN");

                return (
                  <div
                    key={qId}
                    className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden"
                  >
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-lg">
                            {refNo}
                          </span>
                          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[180px]">
                            {company}
                          </span>
                        </div>

                        <h3 className="text-base font-black text-slate-900 truncate tracking-tight">
                          {client}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium truncate">
                          {project}
                        </p>
                      </div>

                      <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                        <span className="text-base font-black text-slate-900">
                          ₹{Number(total).toLocaleString("en-IN")}
                        </span>
                        <span className="text-[11px] text-slate-400 font-semibold mt-0.5">
                          {date}
                        </span>
                      </div>
                    </div>

                    {/* Toolbar Actions */}
                    <div className="border-t border-slate-100 bg-slate-50/60 grid grid-cols-3 sm:grid-cols-6 divide-x divide-slate-100 text-xs font-bold text-slate-700">
                      <button
                        onClick={() => handleViewPDF(q)}
                        className="py-3 flex items-center justify-center gap-1.5 hover:bg-white text-blue-600 transition-colors cursor-pointer"
                      >
                        <Eye size={15} /> Preview
                      </button>

                      <button
                        onClick={() => handleEdit(q)}
                        className="py-3 flex items-center justify-center gap-1.5 hover:bg-white text-slate-800 transition-colors cursor-pointer"
                      >
                        <Edit3 size={15} /> Edit
                      </button>

                      <button
                        onClick={() => handleDuplicate(q)}
                        className="py-3 flex items-center justify-center gap-1.5 hover:bg-white text-purple-600 transition-colors cursor-pointer"
                      >
                        <Copy size={15} /> Duplicate
                      </button>

                      <button
                        onClick={() => handleExportPDF(q)}
                        className="py-3 flex items-center justify-center gap-1.5 hover:bg-white text-emerald-600 transition-colors cursor-pointer"
                      >
                        <Download size={15} /> Export
                      </button>

                      <button
                        onClick={() => handleToggleArchive(q)}
                        className="py-3 flex items-center justify-center gap-1.5 hover:bg-white text-amber-600 transition-colors cursor-pointer"
                      >
                        {q.isArchived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
                        {q.isArchived ? "Unarchive" : "Archive"}
                      </button>

                      <button
                        onClick={() => setDeleteTarget(q)}
                        className="py-3 flex items-center justify-center gap-1.5 hover:bg-white text-red-600 transition-colors cursor-pointer"
                      >
                        <Trash2 size={15} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ADVANCED STORAGE & BACKUP DRAWER ── */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div
            onClick={() => setShowAdvancedBackup(!showAdvancedBackup)}
            className="flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200/60">
                <HardDrive size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Storage & Backup Utilities
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Local DB size: {metrics.usedKB} KB ({quotations.length} records)
                </p>
              </div>
            </div>
            <ChevronDown
              size={18}
              className={`text-slate-400 group-hover:text-slate-700 transition-transform ${
                showAdvancedBackup ? "rotate-180" : ""
              }`}
            />
          </div>

          {showAdvancedBackup && (
            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleExportJSON}
                className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download size={16} /> Export Full JSON Backup
              </button>

              <label className="py-3 px-4 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer">
                <FileText size={16} /> Import JSON Backup
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Bottom Banner Ad */}
        <BannerAd pageName="QuotationManager" />
      </div>

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">Delete Quotation?</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {deleteTarget.clientName || deleteTarget.projectDetails?.clientName || "This quotation"} will be permanently removed.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="flex-1 py-3 rounded-2xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
              >
                {deleteLoading ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
