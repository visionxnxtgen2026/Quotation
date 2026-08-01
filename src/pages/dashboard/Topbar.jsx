import React from "react";
import { Plus, Search, Bell, Menu } from "lucide-react";

export default function Topbar({ title = "Dashboard", subtitle = "Manage your work", goToCreate }) {
  return (
    <div className="flex justify-between items-center px-10 py-5 bg-white/80 backdrop-blur-xl sticky top-0 z-20 border-b border-gray-200/50 shadow-sm">
      
      {/* LEFT: TITLE & BREADCRUMB STYLE */}
      <div className="hidden sm:block">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h1>
        <p className="text-sm text-gray-500 font-medium mt-0.5">{subtitle}</p>
      </div>

      {/* MIDDLE: SEARCH BAR (SaaS Standard) */}
      <div className="flex-1 max-w-md mx-8 hidden lg:block">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search quotations, clients..." 
            className="w-full bg-gray-100/50 border border-transparent focus:border-blue-500/30 focus:bg-white rounded-2xl py-2.5 pl-12 pr-4 outline-none transition-all font-medium text-sm"
          />
        </div>
      </div>

      {/* RIGHT: ACTIONS */}
      <div className="flex items-center gap-4">
        
        {/* Notification Bell */}
        <button className="relative p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-all group">
          <Bell size={20} className="group-hover:shake" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Vertical Divider */}
        <div className="w-px h-8 bg-gray-200 mx-1 hidden sm:block"></div>

        {/* CTA BUTTON: NEW QUOTATION */}
        <button 
          onClick={goToCreate} 
          className="flex items-center gap-2 text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
        >
          <Plus className="w-4 h-4" /> 
          <span className="hidden md:inline">New Quotation</span>
          <span className="md:hidden">New</span>
        </button>

      </div>

      {/* MOBILE MENU ICON (Optional - if you implement drawer later) */}
      <button className="sm:hidden p-2 text-gray-600">
        <Menu size={24} />
      </button>

    </div>
  );
}