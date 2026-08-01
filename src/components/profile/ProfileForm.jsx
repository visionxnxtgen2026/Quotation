import React from "react";
import { User, Mail, Phone, Save, Loader2, Briefcase, MapPin, AlignLeft, X } from "lucide-react";

export default function ProfileForm({
  userForm,
  handleInputChange,
  isLoading,
  goBack, // Renamed for consistency with EditProfile logic
}) {
  return (
    <div className="flex-1 w-full flex flex-col justify-between animate-fade-in">
      
      {/* 📝 FORM FIELDS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        
        {/* Full Name */}
        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2.5 ml-1">
            <User size={14} className="text-blue-500" /> Full Name
          </label>
          <input 
            type="text" 
            name="name" 
            value={userForm?.name || ""} 
            onChange={handleInputChange} 
            required 
            className="w-full border border-slate-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-bold text-slate-800 placeholder-slate-300 bg-slate-50/50 focus:bg-white shadow-sm"
            placeholder="e.g. Sanjai Mani" 
          />
        </div>

        {/* Email Address (Read-only) */}
        <div className="group">
          <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2.5 ml-1">
            <Mail size={14} /> Email Address (Read-only)
          </label>
          <div className="w-full border border-slate-100 rounded-2xl px-5 py-4 bg-slate-100/80 text-sm font-bold text-slate-400 cursor-not-allowed flex items-center justify-between">
            {userForm?.email || "No email provided"}
            <span className="text-[9px] bg-slate-200 text-slate-500 px-2 py-1 rounded-md uppercase tracking-tighter">Locked</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-medium ml-1 flex items-center gap-1">
            Contact support to change your primary email.
          </p>
        </div>

        {/* Mobile Number */}
        <div>
          <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2.5 ml-1">
            <Phone size={14} className="text-blue-500" /> Mobile Number
          </label>
          <input 
            type="text" 
            name="mobile" 
            value={userForm?.mobile || ""} 
            onChange={handleInputChange} 
            className="w-full border border-slate-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-bold text-slate-800 placeholder-slate-300 bg-slate-50/50 focus:bg-white shadow-sm"
            placeholder="+91 86376 28773" 
          />
        </div>

        {/* Job Title / Designation */}
        <div>
          <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2.5 ml-1">
            <Briefcase size={14} className="text-blue-500" /> Job Title
          </label>
          <input 
            type="text" 
            name="designation" 
            value={userForm?.designation || ""} 
            onChange={handleInputChange} 
            className="w-full border border-slate-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-bold text-slate-800 placeholder-slate-300 bg-slate-50/50 focus:bg-white shadow-sm"
            placeholder="e.g. Managing Director" 
          />
        </div>

        {/* Location */}
        <div>
          <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2.5 ml-1">
            <MapPin size={14} className="text-blue-500" /> Location
          </label>
          <input 
            type="text" 
            name="location" 
            value={userForm?.location || ""} 
            onChange={handleInputChange} 
            className="w-full border border-slate-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-bold text-slate-800 placeholder-slate-300 bg-slate-50/50 focus:bg-white shadow-sm"
            placeholder="e.g. Salem, Tamil Nadu" 
          />
        </div>

        {/* Bio / About Me */}
        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2.5 ml-1">
            <AlignLeft size={14} className="text-blue-500" /> Short Bio
          </label>
          <textarea 
            name="bio" 
            value={userForm?.bio || ""} 
            onChange={handleInputChange} 
            rows="4"
            className="w-full border border-slate-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium text-slate-800 placeholder-slate-300 bg-slate-50/50 focus:bg-white shadow-sm resize-none"
            placeholder="Write a few professional lines about yourself or your company..." 
          />
        </div>

      </div>

      {/* 🔘 ACTION BUTTONS */}
      <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-end gap-4">
        <button 
          type="button" 
          onClick={goBack}
          className="px-8 py-4 rounded-2xl font-black text-slate-500 bg-slate-100 hover:bg-slate-200 hover:text-slate-700 transition-all text-[11px] uppercase tracking-widest active:scale-95 flex items-center gap-2"
        >
          <X size={16} /> Cancel
        </button>
        
        <button 
          type="submit" 
          disabled={isLoading}
          className={`px-10 py-4 rounded-2xl font-black text-white text-[11px] uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            isLoading 
              ? 'bg-slate-400' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5'
          }`}
        >
          {isLoading ? (
            <> <Loader2 size={16} className="animate-spin" /> Updating... </>
          ) : (
            <> <Save size={16} /> Save Changes </>
          )}
        </button>
      </div>

    </div>
  );
}