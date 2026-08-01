import React, { useState, useEffect } from "react";
import MobileHeader from "../../components/mobile/MobileHeader";
import StatCard from "../../components/mobile/StatCard";
import StorageCard from "../../components/mobile/StorageCard";
import DashboardCard from "../../components/mobile/DashboardCard";
import BannerAd from "../../components/mobile/BannerAd";
import { admobManager } from "../../utils/admobManager";
import { localDB } from "../../utils/localDB";
import {
  FileText, Download, Upload, Trash2, Search,
  ChevronDown, ChevronUp, CheckCircle2, AlertCircle,
  HardDrive, Sparkles, FileCheck, X
} from "lucide-react";

export default function StorageManager({
  goBack, goToDashboard, goToCreate, goToPreview, goToExport,
  goToStorage, goToSettings, goToHelp, setQuotationId
}) {
  const [quotations, setQuotations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [metrics, setMetrics] = useState({ totalQuotations: 0, usedKB: 0 });
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameForm, setRenameForm] = useState({ clientName: "", projectName: "" });

  const loadData = () => {
    const list = localDB.getQuotations();
    setQuotations(list);
    setMetrics(localDB.getStorageMetrics());
  };

  useEffect(() => { loadData(); }, []);

  const showToast = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3500);
  };

  const filteredQuotations = quotations.filter(q => {
    const query = searchQuery.toLowerCase();
    const client = (q.clientName || q.projectDetails?.clientName || "").toLowerCase();
    const refNo = (q.quotationNo || q.projectDetails?.referenceNo || q._id || "").toLowerCase();
    const project = (q.projectName || q.projectDetails?.projectName || "").toLowerCase();
    const company = (q.companyName || q.projectDetails?.companyName || "").toLowerCase();
    return client.includes(query) || refNo.includes(query) || project.includes(query) || company.includes(query);
  });

  const handleViewPDF = (q) => {
    if (setQuotationId) setQuotationId(q._id || q.id);
    localStorage.setItem("previewDraft", JSON.stringify(q));
    goToPreview();
  };

  const handleDownloadPDF = (q) => {
    if (setQuotationId) setQuotationId(q._id || q.id);
    localStorage.setItem("previewDraft", JSON.stringify(q));
    goToExport();
  };

  const handleDuplicate = (q) => {
    const duplicated = localDB.duplicateQuotation(q._id || q.id);
    if (duplicated) { loadData(); showToast("Quotation duplicated!", "success"); }
    else showToast("Duplicate failed.", "error");
  };

  const handleOpenRename = (q) => {
    setRenameTarget(q);
    setRenameForm({ clientName: q.clientName || q.projectDetails?.clientName || "", projectName: q.projectName || q.projectDetails?.projectName || "" });
  };

  const handleSaveRename = () => {
    if (!renameTarget) return;
    localDB.renameQuotation(renameTarget._id || renameTarget.id, renameForm.clientName, renameForm.projectName);
    setRenameTarget(null);
    loadData();
    showToast("Updated successfully.", "success");
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    localDB.deleteQuotation(deleteTarget._id || deleteTarget.id);
    setDeleteTarget(null);
    loadData();
    showToast("Quotation deleted.", "success");
  };

  const handleExportJSON = () => {
    localDB.exportBackupJSON();
    showToast("Backup downloaded.", "success");
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const success = localDB.importBackupJSON(ev.target.result);
      if (success) {
        loadData();
        showToast("Backup restored!", "success");
        admobManager.showInterstitial("Restore Backup");
      } else {
        showToast("Invalid JSON backup file.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleConfirmClear = () => {
    localDB.clearAllData();
    loadData();
    setShowClearModal(false);
    showToast("Data cleared.", "success");
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans pb-24 relative">
      <MobileHeader title="Storage Manager" onBack={goBack || goToDashboard} />

      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-16 left-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3 text-xs font-semibold ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span className="flex-1">{toast.message}</span>
        </div>
      )}

      <div className="w-full px-4 py-4 space-y-4">
        {/* Storage Metrics Row */}
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1 mb-2">Metrics</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
            <StatCard icon={<FileCheck size={18} />} color="blue" label="Documents" value={metrics.totalQuotations} />
            <StatCard icon={<HardDrive size={18} />} color="emerald" label="Storage Used" value={`${metrics.usedKB} KB`} />
            <StatCard icon={<Sparkles size={18} />} color="purple" label="Engine" value="IndexedDB" small />
          </div>
        </div>

        {/* Saved Quotations List */}
        <div>
          <div className="flex items-center justify-between px-1 mb-2">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Saved Documents <span className="text-blue-600">({filteredQuotations.length})</span>
            </p>
          </div>

          {/* Search Field */}
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search documents by client, ref no..."
              className="w-full h-12 bg-white border border-slate-200 rounded-xl pl-10 pr-4 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600 transition-all shadow-2xs"
            />
          </div>

          {filteredQuotations.length === 0 ? (
            <DashboardCard className="py-12 text-center border-2 border-dashed border-slate-200">
              <FileText size={36} className="text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No Documents Found</p>
              <p className="text-[11px] text-slate-400 mt-1 mb-3">Create a quotation to archive it here.</p>
              <button onClick={goToCreate} className="bg-blue-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer">
                + Create Quotation
              </button>
            </DashboardCard>
          ) : (
            <div className="space-y-3">
              {filteredQuotations.map(q => (
                <StorageCard
                  key={q._id || q.id}
                  quotation={q}
                  onView={() => handleViewPDF(q)}
                  onDownload={() => handleDownloadPDF(q)}
                  onDuplicate={() => handleDuplicate(q)}
                  onRename={() => handleOpenRename(q)}
                  onDelete={() => setDeleteTarget(q)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Backup & Recovery Accordion */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between p-4 text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                <HardDrive size={18} className="text-slate-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Backup & Restore (JSON)</p>
                <p className="text-[11px] text-slate-500 font-normal">Export raw data backup</p>
              </div>
            </div>
            {showAdvanced ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </button>

          {showAdvanced && (
            <div className="p-4 border-t border-slate-100 space-y-3">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <p className="text-xs font-bold text-slate-900 mb-0.5">Export Full Backup</p>
                <p className="text-[11px] text-slate-500 mb-3">Download JSON backup file.</p>
                <button onClick={handleExportJSON} className="w-full h-12 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer">
                  <Download size={14} /> Export Backup JSON
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <p className="text-xs font-bold text-slate-900 mb-0.5">Restore from Backup</p>
                <p className="text-[11px] text-slate-500 mb-3">Import a JSON backup file.</p>
                <label className="w-full h-12 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer">
                  <Upload size={14} /> Restore Backup JSON
                  <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                </label>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <p className="text-xs font-bold text-red-600">Delete Local Data</p>
                  <p className="text-[10px] text-slate-400">Clear all local storage</p>
                </div>
                <button onClick={() => setShowClearModal(true)} className="text-xs font-bold text-red-600 border border-red-200 px-3 py-1.5 rounded-xl cursor-pointer">
                  Clear Data
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Banner Ad */}
        <BannerAd pageName="Storage" />
      </div>

      {/* Delete Sheet */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-t-3xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto" />
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shrink-0"><Trash2 size={20} /></div>
              <div><p className="font-bold text-slate-900 text-sm">Delete Quotation?</p><p className="text-xs text-slate-500 mt-0.5">{deleteTarget.clientName || "This document"} will be deleted.</p></div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 h-12 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs cursor-pointer">Cancel</button>
              <button onClick={handleDelete} className="flex-1 h-12 rounded-xl bg-red-600 text-white font-bold text-xs cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Sheet */}
      {renameTarget && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setRenameTarget(null)} />
          <div className="relative bg-white rounded-t-3xl p-5 shadow-2xl space-y-3 animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-2" />
            <p className="font-bold text-slate-900 text-sm">Rename Quotation</p>
            <input type="text" value={renameForm.clientName} onChange={e => setRenameForm({ ...renameForm, clientName: e.target.value })} placeholder="Client Name" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-medium" />
            <input type="text" value={renameForm.projectName} onChange={e => setRenameForm({ ...renameForm, projectName: e.target.value })} placeholder="Project Name" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-medium" />
            <div className="flex gap-3 pt-2">
              <button onClick={() => setRenameTarget(null)} className="flex-1 h-12 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs cursor-pointer">Cancel</button>
              <button onClick={handleSaveRename} className="flex-1 h-12 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setShowClearModal(false)} />
          <div className="relative bg-white rounded-t-3xl p-5 shadow-2xl space-y-3 animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-2" />
            <p className="font-bold text-slate-900 text-sm">Clear All Local Data?</p>
            <p className="text-xs text-slate-500">All saved quotations and settings will be permanently wiped.</p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowClearModal(false)} className="flex-1 h-12 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs cursor-pointer">Cancel</button>
              <button onClick={handleConfirmClear} className="flex-1 h-12 rounded-xl bg-red-600 text-white font-bold text-xs cursor-pointer">Clear Data</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
