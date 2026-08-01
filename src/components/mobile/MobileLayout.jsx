import React from "react";

export default function MobileLayout({ children }) {
  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-blue-100 relative">
      <main className="flex-1 w-full relative pb-20">
        {children}
      </main>
    </div>
  );
}
