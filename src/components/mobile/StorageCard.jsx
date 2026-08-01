import React from "react";
import { FileText, Eye, Download, Copy, Edit3, Trash2, Cloud, ExternalLink, CloudUpload } from "lucide-react";

export default function StorageCard({ quotation, onView, onDownload, onDuplicate, onRename, onDelete, onBackupDrive }) {
  const id = quotation._id || quotation.id;
  const client = quotation.clientName || quotation.projectDetails?.clientName || "Client";
  const company = quotation.companyName || quotation.projectDetails?.companyName || "";
  const refNo = quotation.quotationNo || quotation.projectDetails?.referenceNo || id;
  const date = quotation.date || quotation.projectDetails?.date
    ? new Date(quotation.date || quotation.projectDetails?.date).toLocaleDateString("en-IN")
    : new Date(quotation.createdAt || Date.now()).toLocaleDateString("en-IN");
  const total = quotation.grandTotal || quotation.pricing?.grandTotal || 0;

  const uploadStatus = quotation.uploadStatus || (quotation.driveUrl ? "Uploaded" : "Pending");
  const driveUrl = quotation.driveUrl;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
      <div className="p-4 flex items-center gap-3">
        {/* PDF File Badge Icon */}
        <div className="w-11 h-11 bg-red-50 border border-red-100 text-red-600 rounded-xl flex flex-col items-center justify-center shrink-0">
          <FileText size={18} />
          <span className="text-[7px] font-bold uppercase -mt-0.5">PDF</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{refNo}</span>
            
            {/* Sync Badge */}
            {uploadStatus === "Uploaded" ? (
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                🟢 Uploaded
              </span>
            ) : uploadStatus === "Uploading" ? (
              <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 animate-pulse">
                🔵 Uploading...
              </span>
            ) : uploadStatus === "Failed" ? (
              <span className="text-[9px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                🔴 Failed
              </span>
            ) : (
              <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                🟡 Pending Upload
              </span>
            )}
          </div>
          <p className="text-xs font-bold text-slate-900 truncate">{client}</p>
          <p className="text-[11px] text-slate-500 font-medium truncate">{company ? `${company} · ` : ""}{date}</p>
        </div>

        {/* Amount */}
        <div className="text-right shrink-0">
          <p className="text-xs font-extrabold text-slate-900">₹{Number(total).toLocaleString("en-IN")}</p>
          {driveUrl && (
            <a
              href={driveUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] font-bold text-sky-600 hover:underline flex items-center justify-end gap-0.5 mt-0.5"
            >
              Drive <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>

      {/* Action Row */}
      <div className="border-t border-slate-100 flex divide-x divide-slate-100 text-[11px] font-medium text-slate-600">
        <button onClick={onView} className="flex-1 py-2.5 flex items-center justify-center gap-1 hover:bg-slate-50 text-blue-600 cursor-pointer">
          <Eye size={13} /> View
        </button>
        <button onClick={onDownload} className="flex-1 py-2.5 flex items-center justify-center gap-1 hover:bg-slate-50 text-emerald-600 cursor-pointer">
          <Download size={13} /> PDF
        </button>
        {onBackupDrive && uploadStatus !== "Uploaded" && (
          <button onClick={onBackupDrive} className="flex-1 py-2.5 flex items-center justify-center gap-1 hover:bg-sky-50 text-sky-600 cursor-pointer font-bold">
            <CloudUpload size={13} /> Backup
          </button>
        )}
        <button onClick={onDuplicate} className="flex-1 py-2.5 flex items-center justify-center gap-1 hover:bg-slate-50 text-slate-700 cursor-pointer">
          <Copy size={13} /> Copy
        </button>
        <button onClick={onRename} className="flex-1 py-2.5 flex items-center justify-center gap-1 hover:bg-slate-50 text-purple-600 cursor-pointer">
          <Edit3 size={13} /> Rename
        </button>
        <button onClick={onDelete} className="flex-1 py-2.5 flex items-center justify-center gap-1 hover:bg-slate-50 text-red-600 cursor-pointer">
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </div>
  );
}
