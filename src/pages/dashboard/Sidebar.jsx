import React from "react";
import {
  LayoutDashboard as DashboardIcon,
  FileText as FileIcon,
  Eye as EyeIcon,
  Download as ExportIcon,
  Database as StorageIcon,
  LifeBuoy as HelpIcon,
  Settings as SettingsIcon,
} from "lucide-react";

export default function Sidebar({
  active = "dashboard",
  goToCreate,
  goToDashboard,
  goToPreview,
  goToExport,
  goToStorage,
  goToSettings,
  goToHelp,
}) {
  return (
    <div className="w-[250px] bg-[#0B1120] text-slate-300 h-screen p-4 flex flex-col fixed left-0 top-0 border-r border-slate-800/80 z-50 select-none">

      {/* LOGO */}
      <div
        onClick={goToDashboard}
        className="flex items-center gap-3 mb-8 px-2 py-2 cursor-pointer group"
      >
        <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 bg-white border border-slate-200 p-0.5 flex items-center justify-center">
          <img src="/logo.png" alt="VisionX Logo" className="w-full h-full object-contain" />
        </div>
        <div className="min-w-0">
          <h1 className="text-[13px] font-black tracking-tight text-white truncate leading-tight">
            vision<span className="text-blue-400">X</span> QuoteGen Pro
          </h1>
          <p className="text-[9px] text-slate-500 tracking-wide font-semibold truncate">
            Professional Quotation Software
          </p>
        </div>
      </div>

      {/* MAIN MENU SECTION */}
      <div className="mb-6">
        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2 px-3">
          Main Menu
        </p>
        <div className="space-y-1">
          <MenuItem icon={<DashboardIcon size={16} />} label="Dashboard"     active={active === "dashboard"} onClick={goToDashboard} />
          <MenuItem icon={<FileIcon size={16} />}      label="Create Quote"  active={active === "create"}    onClick={goToCreate} />
          <MenuItem icon={<EyeIcon size={16} />}       label="Preview"       active={active === "preview"}   onClick={goToPreview} />
          <MenuItem icon={<ExportIcon size={16} />}    label="Export"        active={active === "export"}    onClick={goToExport} />
        </div>
      </div>

      {/* SYSTEM SECTION */}
      <div>
        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2 px-3">
          System &amp; Storage
        </p>
        <div className="space-y-1">
          <MenuItem icon={<StorageIcon size={16} />} label="Storage Manager"  active={active === "storage"}  onClick={goToStorage} />
          <MenuItem icon={<HelpIcon size={16} />}    label="Help &amp; Support" active={active === "help"}    onClick={goToHelp} />
          <MenuItem icon={<SettingsIcon size={16} />} label="Settings"         active={active === "settings"} onClick={goToSettings} />
        </div>
      </div>

    </div>
  );
}

function MenuItem({ icon, label, active, onClick }) {
  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick();
      }}
      className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors relative text-xs ${
        active
          ? "text-white bg-slate-800 font-semibold"
          : "text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium"
      }`}
    >
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-blue-500 rounded-r-full" />
      )}
      <div className="shrink-0">{icon}</div>
      <span className="truncate tracking-wide">{label}</span>
    </div>
  );
}