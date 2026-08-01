import React, { useState, useEffect } from "react";
import MobileHeader from "../../components/mobile/MobileHeader";
import StatCard from "../../components/mobile/StatCard";
import QuickActionCard from "../../components/mobile/QuickActionCard";
import DashboardCard from "../../components/mobile/DashboardCard";
import FloatingActionButton from "../../components/mobile/FloatingActionButton";
import BannerAd from "../../components/mobile/BannerAd";
import { admobManager } from "../../utils/admobManager";
import { localDB } from "../../utils/localDB";
import {
  Plus, FileText, IndianRupee, Clock,
  FileSearch, Eye, Edit3, Download, Trash2,
  CheckCircle2, AlertCircle, Sparkles, Folder, Calendar,
} from "lucide-react";

export default function Dashboard({
  goToCreate,
  goToDashboard,
  goToPreview,
  goToExport,
  goToStorage,
  goToSettings,
  setQuotationId,
}) {
  const [stats, setStats] = useState({ total: 0, value: 0, lastCreated: "None" });
  const [recentQuotes, setRecentQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [deleteModal, setDeleteModal] = useState({ open: false, quote: null, loading: false });

  // Today's date string for Android native header greeting
  const todayDateStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const showToast = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const fetchData = () => {
    try {
      setIsLoading(true);
      const quotes = localDB.getQuotations();
      const totalVal = quotes.reduce((acc, q) =>
        acc + Number(q.grandTotal || q.pricing?.grandTotal || q.projectDetails?.grandTotal || 0), 0);
      const lastDate = quotes.length > 0
        ? new Date(quotes[0].updatedAt || quotes[0].createdAt || Date.now()).toLocaleDateString("en-IN")
        : "None";
      setStats({ total: quotes.length, value: totalVal, lastCreated: lastDate });
      setRecentQuotes(quotes.slice(0, 15));
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleNewQuote = () => {
    if (setQuotationId) setQuotationId(null);
    localStorage.removeItem("previewDraft");
    goToCreate();
  };

  const loadAndGo = async (id, rawData, destination) => {
    if (setQuotationId) setQuotationId(id);
    if (rawData) localStorage.setItem("previewDraft", JSON.stringify(rawData));
    destination();
    admobManager.showInterstitial("Navigation");
  };

  const confirmDelete = async () => {
    const { quote } = deleteModal;
    if (!quote) return;
    setDeleteModal(d => ({ ...d, loading: true }));
    try {
      localDB.deleteQuotation(quote._id || quote.id);
      showToast("Quotation deleted permanently.");
      fetchData();
    } catch {
      showToast("Failed to delete quotation.", "error");
    } finally {
      setDeleteModal({ open: false, quote: null, loading: false });
    }
  };

  const formatCurrency = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans pb-24 relative">
      <MobileHeader logo title="VisionX QuoteGen Pro" subtitle="Offline Quotation Software" />

      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-16 left-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3 text-xs font-semibold ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span className="flex-1">{toast.message}</span>
        </div>
      )}

      <div className="w-full px-4 py-4 space-y-4">
        {/* Welcome Greeting Banner — Material Design 3 Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-md shadow-blue-600/20 w-full">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-2xs">
                <img src="/logo.png" alt="VisionX Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="text-base font-black tracking-tight">VisionX QuoteGen Pro</h2>
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Create • Manage • Print</p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full text-[10px] font-medium text-blue-100">
              <Calendar size={11} /> {todayDateStr}
            </div>
          </div>
          <p className="text-xs text-blue-100 mb-4 leading-relaxed font-normal">
            Create, manage, and export professional quotations completely offline.
          </p>
          <button
            onClick={handleNewQuote}
            className="flex items-center justify-center gap-2 bg-white text-blue-700 font-bold text-xs px-5 h-12 rounded-xl shadow-xs active:scale-98 transition-transform cursor-pointer w-full"
          >
            <Plus size={16} strokeWidth={3} /> Create New Quotation
          </button>
        </div>

        {/* Overview Statistics */}
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1 mb-2">Overview</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
            <StatCard icon={<FileText size={18} />} color="blue" label="Quotations" value={stats.total} />
            <StatCard icon={<IndianRupee size={18} />} color="emerald" label="Total Value" value={formatCurrency(stats.value)} />
            <StatCard icon={<Clock size={18} />} color="purple" label="Last Activity" value={stats.lastCreated} small />
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1 mb-2">Quick Actions</p>
          <div className="grid grid-cols-2 gap-3">
            <QuickActionCard
              icon={<Plus size={20} />}
              iconBg="bg-blue-50 text-blue-600"
              title="New Quote"
              subtitle="Build quotation"
              onClick={handleNewQuote}
            />
            <QuickActionCard
              icon={<Folder size={20} />}
              iconBg="bg-purple-50 text-purple-600"
              title="Storage"
              subtitle="View document archive"
              onClick={goToStorage}
            />
          </div>
        </div>

        {/* Recent Quotations */}
        <div>
          <div className="flex items-center justify-between px-1 mb-2">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Recent Quotations</p>
            <button onClick={goToStorage} className="text-[11px] font-bold text-blue-600 cursor-pointer">View All →</button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-xs text-slate-400 font-semibold">Loading quotations...</p>
            </div>
          ) : recentQuotes.length === 0 ? (
            <DashboardCard className="py-12 text-center border-2 border-dashed border-slate-200">
              <FileSearch size={36} className="text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No Saved Quotations</p>
              <p className="text-[11px] text-slate-400 mt-1 mb-3">Create your first quotation document.</p>
              <button
                onClick={handleNewQuote}
                className="bg-blue-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer"
              >
                + Create Quotation
              </button>
            </DashboardCard>
          ) : (
            <div className="space-y-3">
              {recentQuotes.map((q) => {
                const qId = q._id || q.id;
                const refNo = q.quotationNo || q.projectDetails?.referenceNo || "—";
                const client = q.clientName || q.projectDetails?.clientName || "Client";
                const project = q.projectName || q.projectDetails?.projectName || "Quotation";
                const total = q.grandTotal || q.pricing?.grandTotal || 0;
                const date = q.date || q.projectDetails?.date
                  ? new Date(q.date || q.projectDetails?.date).toLocaleDateString("en-IN")
                  : new Date(q.createdAt || Date.now()).toLocaleDateString("en-IN");

                return (
                  <div key={qId} className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
                    <div className="p-4 flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block mb-1">{refNo}</span>
                        <p className="text-xs font-bold text-slate-900 truncate">{client}</p>
                        <p className="text-[11px] text-slate-400 font-medium truncate">{project}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-extrabold text-slate-900">₹{Number(total).toLocaleString("en-IN")}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{date}</p>
                      </div>
                    </div>
                    <div className="border-t border-slate-100 flex divide-x divide-slate-100 text-[10px] font-semibold text-slate-600">
                      <button onClick={() => loadAndGo(qId, q, goToPreview)} className="flex-1 py-2.5 flex items-center justify-center gap-1 hover:bg-slate-50 text-blue-600 cursor-pointer">
                        <Eye size={13} /> Preview
                      </button>
                      <button onClick={() => loadAndGo(qId, q, goToCreate)} className="flex-1 py-2.5 flex items-center justify-center gap-1 hover:bg-slate-50 text-slate-700 cursor-pointer">
                        <Edit3 size={13} /> Edit
                      </button>
                      <button onClick={() => loadAndGo(qId, q, goToExport)} className="flex-1 py-2.5 flex items-center justify-center gap-1 hover:bg-slate-50 text-emerald-600 cursor-pointer">
                        <Download size={13} /> Export
                      </button>
                      <button onClick={() => setDeleteModal({ open: true, quote: q, loading: false })} className="flex-1 py-2.5 flex items-center justify-center gap-1 hover:bg-slate-50 text-red-500 cursor-pointer">
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Banner Ad */}
        <BannerAd pageName="Dashboard" />
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={handleNewQuote} label="New Quote" />

      {/* Material Bottom Sheet Delete Confirmation */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setDeleteModal({ open: false, quote: null, loading: false })} />
          <div className="relative bg-white rounded-t-3xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto" />
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Delete Quotation?</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {deleteModal.quote?.clientName || deleteModal.quote?.projectDetails?.clientName || "This quotation"} will be deleted.
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setDeleteModal({ open: false, quote: null, loading: false })} className="flex-1 h-12 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs cursor-pointer">Cancel</button>
              <button onClick={confirmDelete} disabled={deleteModal.loading} className="flex-1 h-12 rounded-xl bg-red-600 text-white font-bold text-xs cursor-pointer disabled:opacity-60">
                {deleteModal.loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}