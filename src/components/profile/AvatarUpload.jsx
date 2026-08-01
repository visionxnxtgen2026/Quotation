import React, { useRef } from "react";
import { Camera, User } from "lucide-react";

export default function AvatarUpload({ 
  previewUrl, 
  userName, 
  onFileSelect 
}) {
  const fileInputRef = useRef(null);

  // Extracts initials from name (e.g., Sanjai Mani -> SM)
  const initials = userName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "VX";

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 shrink-0 animate-fade-in">
      
      {/* 📸 IMAGE CONTAINER */}
      <div 
        className="relative group cursor-pointer" 
        onClick={() => fileInputRef.current.click()}
      >
        {/* Main Avatar Frame */}
        <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl bg-slate-100 relative transition-all duration-500 group-hover:scale-[1.03] group-hover:shadow-blue-500/10 flex items-center justify-center">
          
          {previewUrl ? (
            <img 
              src={previewUrl} 
              alt="Profile Avatar" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={(e) => {
                // If image fails to load, clear it to show fallback
                e.target.onerror = null;
                e.target.src = ""; 
              }}
            />
          ) : (
            // Fallback Initials UI
            <div className="flex flex-col items-center justify-center text-slate-300">
              <span className="text-4xl font-black tracking-tighter uppercase">{initials}</span>
            </div>
          )}
          
          {/* Professional Hover Overlay */}
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/30">
              <Camera size={32} className="text-white" />
            </div>
          </div>
        </div>
        
        {/* Floating Camera Action Button */}
        <div 
          className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-3.5 rounded-2xl shadow-lg shadow-blue-500/40 border-4 border-white group-hover:bg-blue-700 group-hover:scale-110 transition-all duration-300 active:scale-95"
        >
          <Camera size={20} strokeWidth={2.5} />
        </div>

        {/* Hidden Native File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/png, image/jpeg, image/jpg" 
          className="hidden" 
        />
      </div>

      {/* Helper Branding Text */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-1.5 mb-1">
            <div className="w-1 h-1 rounded-full bg-blue-500"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Profile Avatar</p>
            <div className="w-1 h-1 rounded-full bg-blue-500"></div>
        </div>
        <p className="text-[9px] font-bold text-slate-400/80 uppercase tracking-widest leading-tight">
          JPG, PNG • Max 2MB
        </p>
      </div>

    </div>
  );
}