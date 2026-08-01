import React, { useState, useEffect, useMemo } from "react";
import { History, Upload, Trash2, RotateCcw, Edit3, Shield, Clock } from "lucide-react";
import { localDB } from "../../../utils/localDB";

export default function SyncHistoryTimeline() {
  const [logs, setLogs] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState("all"); // "all" | "today" | "yesterday" | "older"

  const refreshLogs = () => {
    setLogs(localDB.getCloudSyncLogs());
  };

  useEffect(() => {
    refreshLogs();
    window.addEventListener("cloudLogsUpdated", refreshLogs);
    return () => window.removeEventListener("cloudLogsUpdated", refreshLogs);
  }, []);

  const filteredLogs = useMemo(() => {
    if (filterPeriod === "all") return logs;
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const yesterdayStart = new Date(now - dayMs).setHours(0, 0, 0, 0);

    return logs.filter((log) => {
      const logTime = new Date(log.timestamp).getTime();
      if (filterPeriod === "today") return logTime >= todayStart;
      if (filterPeriod === "yesterday") return logTime >= yesterdayStart && logTime < todayStart;
      if (filterPeriod === "older") return logTime < yesterdayStart;
      return true;
    });
  }, [logs, filterPeriod]);

  const getActionBadge = (action) => {
    switch (action) {
      case "Uploaded":
        return { icon: <Upload size={14} />, bg: "bg-blue-50 text-blue-700 border-blue-200" };
      case "Deleted":
        return { icon: <Trash2 size={14} />, bg: "bg-red-50 text-red-700 border-red-200" };
      case "Restored":
        return { icon: <RotateCcw size={14} />, bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "Renamed":
        return { icon: <Edit3 size={14} />, bg: "bg-purple-50 text-purple-700 border-purple-200" };
      case "Permission Changed":
        return { icon: <Shield size={14} />, bg: "bg-amber-50 text-amber-700 border-amber-200" };
      default:
        return { icon: <Clock size={14} />, bg: "bg-slate-50 text-slate-700 border-slate-200" };
    }
  };

  const formatDate = (isoString) => {
    try {
      return new Date(isoString).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Filter Row */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-bold border border-indigo-100">
            <History size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">Sync History Timeline</h3>
            <p className="text-xs text-slate-500 font-medium">Realtime cloud &amp; database operation logs</p>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 text-xs font-bold border border-slate-200">
          {["all", "today", "yesterday", "older"].map((period) => (
            <button
              key={period}
              onClick={() => setFilterPeriod(period)}
              className={`px-3 py-1.5 rounded-xl capitalize transition-all cursor-pointer ${
                filterPeriod === period ? "bg-white text-blue-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline List */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200/90 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Clock size={24} />
          </div>
          <h4 className="text-base font-black text-slate-900">No History Logs</h4>
          <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
            Operations like uploads, file renaming, permissions updates, and file restorations will automatically be recorded here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-4">
          <div className="relative border-l-2 border-slate-200 ml-4 space-y-4">
            {filteredLogs.map((log) => {
              const badge = getActionBadge(log.action);
              return (
                <div key={log.id} className="relative pl-6">
                  {/* Timeline node icon */}
                  <div className="absolute -left-3.5 top-0 w-7 h-7 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center text-slate-600 shadow-2xs">
                    {badge.icon}
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${badge.bg}`}>
                          {log.action}
                        </span>
                        <span className="text-xs font-black text-slate-900">{log.fileName}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{formatDate(log.timestamp)}</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">{log.details}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
