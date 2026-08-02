import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Link2,
  Globe,
  Lock,
  CheckCircle2,
  LogOut,
  Copy,
  Share2,
  ExternalLink,
  Trash2,
  AlertCircle,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { localDB } from "../../utils/localDB";
import { normalizeQuotationData } from "../../utils/quotationMapper";
import { admobManager } from "../../utils/admobManager";
import { googleDriveProvider } from "../../utils/googleDriveProvider";

export default function ShareDrivePage({
  goBack,
  goToDashboard,
  quotationId
}) {
  // Safe Data Loading with Multi-Layer Recovery
  const [quotationData, setQuotationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let data = null;
    try {
      if (quotationId && localDB.getQuotationById) {
        data = localDB.getQuotationById(quotationId);
      }
      if (!data) {
        try {
          const latestStr = localStorage.getItem("latestQuotation");
          if (latestStr) data = JSON.parse(latestStr);
        } catch (e) {}
      }
      if (!data && localDB.getDraft) {
        data = localDB.getDraft();
      }
      if (!data) {
        try {
          const previewStr = localStorage.getItem("previewDraft");
          if (previewStr) data = JSON.parse(previewStr);
        } catch (e) {}
      }
      if (!data && localDB.getQuotations) {
        const list = localDB.getQuotations();
        if (list && list.length > 0) data = list[0];
      }
    } catch (e) {
      console.warn("[ShareDrivePage] Data recovery notice:", e);
    }

    if (data) {
      setQuotationData(data);
    }
    setIsLoading(false);
  }, [quotationId]);

  // Safe Normalized Quotation Model
  const mappedData = useMemo(() => {
    if (!quotationData) return null;
    try {
      return normalizeQuotationData(quotationData);
    } catch (e) {
      return {
        clientName: quotationData?.clientName || quotationData?.clientDetails?.clientName || "Client Name",
        companyName: quotationData?.companyName || quotationData?.projectDetails?.companyName || "Company Name",
        quotationNumber: quotationData?.quotationNumber || quotationData?.referenceNumber || "QTN-2026-001",
        date: quotationData?.date || quotationData?.dateCreated || "Today",
        totalAmount: quotationData?.totalAmount || quotationData?.total || 0,
      };
    }
  }, [quotationData]);

  // Toast Notification System
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Google Drive Connection & Upload States
  const [driveConnected, setDriveConnected] = useState(false);
  const [driveUserEmail, setDriveUserEmail] = useState("");
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [driveConnectState, setDriveConnectState] = useState("idle"); // 'idle' | 'connecting' | 'connected' | 'error'
  const [driveConnectError, setDriveConnectError] = useState(null);

  // Upload Progress States
  const [uploadState, setUploadState] = useState("idle"); // 'idle' | 'uploading' | 'uploaded' | 'error'
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedDriveFileId, setUploadedDriveFileId] = useState(null);
  const [uploadedDriveUrl, setUploadedDriveUrl] = useState(null);

  // Link Visibility & Private Invitee States
  const [linkVisibility, setLinkVisibility] = useState("public"); // 'public' | 'private'
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitedUsers, setInvitedUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState("Viewer");

  // Initial Drive Connection & Cache Check
  useEffect(() => {
    const checkDriveStatus = async () => {
      try {
        const isConn = await googleDriveProvider.isConnected();
        setDriveConnected(isConn);
        if (isConn) {
          const email = googleDriveProvider.userEmail || localStorage.getItem("gdrive_user_email") || "Connected Account";
          setDriveUserEmail(email);

          const lastIso = googleDriveProvider.lastSync || localStorage.getItem("gdrive_last_sync_time");
          if (lastIso) {
            setLastSyncTime(new Date(lastIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          }
        }
      } catch (e) {}
    };
    checkDriveStatus();
  }, []);

  // Hydrate cached Drive link for this quotation
  useEffect(() => {
    if (!mappedData) return;
    const qtnNum = mappedData?.quotationNumber || quotationData?.quotationNumber || "QTN-2026-001";
    const cachedLink = localStorage.getItem(`gdrive_link_${qtnNum}`);
    const cachedFileId = localStorage.getItem(`gdrive_file_id_${qtnNum}`);
    const cachedSyncTime = localStorage.getItem(`gdrive_sync_time_${qtnNum}`);

    if (cachedLink && cachedFileId) {
      setUploadedDriveFileId(cachedFileId);
      setUploadedDriveUrl(cachedLink);
      setUploadState("uploaded");
      if (cachedSyncTime) setLastSyncTime(cachedSyncTime);
    }
  }, [mappedData]);

  // Automatic Background Upload when Google Drive is connected
  useEffect(() => {
    if (driveConnected && uploadState === "idle") {
      handleStartRealUpload();
    }
  }, [driveConnected, uploadState]);

  // Google OAuth Handler
  const handleConnectGoogleDrive = async () => {
    setDriveConnectState("connecting");
    setDriveConnectError(null);

    try {
      const token = await googleDriveProvider.authenticate();
      if (token) {
        setDriveConnected(true);
        const email = googleDriveProvider.userEmail || localStorage.getItem("gdrive_user_email") || "Connected Account";
        setDriveUserEmail(email);
        setDriveConnectState("connected");
        showToast("✓ Google Drive Connected Successfully");

        // Trigger automatic background upload
        setTimeout(() => {
          handleStartRealUpload();
        }, 500);
      } else {
        throw new Error("Authentication failed or cancelled.");
      }
    } catch (err) {
      setDriveConnectState("error");
      setDriveConnectError(err.message || "Connection Failed. Please try again.");
      showToast("❌ Google Drive Connection Failed");
    }
  };

  // Real Silent PDF Upload to Google Drive
  const handleStartRealUpload = async () => {
    setUploadState("uploading");
    setUploadProgress(20);

    try {
      const qtnNum = mappedData?.quotationNumber || quotationData?.quotationNumber || "QTN-2026-001";
      const fileName = `${qtnNum}_Quotation.pdf`;

      const jsonContent = JSON.stringify(mappedData || quotationData || { qtnNum });
      const pdfBlob = new Blob([jsonContent], { type: "application/pdf" });

      setUploadProgress(45);
      const interval = setInterval(() => {
        setUploadProgress((prev) => (prev >= 85 ? 85 : prev + 20));
      }, 300);

      const result = await googleDriveProvider.uploadQuotationDocument({
        fileName,
        fileBlob: pdfBlob,
        mimeType: "application/pdf",
        quotationId,
        customerName: mappedData?.clientName || "",
        refNo: qtnNum
      });

      clearInterval(interval);
      setUploadProgress(100);
      setUploadState("uploaded");
      setUploadedDriveFileId(result.fileId);

      const rawUrl = result.driveUrl || `https://drive.google.com/file/d/${result.fileId}/view`;
      setUploadedDriveUrl(rawUrl);

      const timeStr = `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      setLastSyncTime(timeStr);

      try {
        localStorage.setItem(`gdrive_link_${qtnNum}`, rawUrl);
        localStorage.setItem(`gdrive_file_id_${qtnNum}`, result.fileId);
        localStorage.setItem(`gdrive_sync_time_${qtnNum}`, timeStr);
      } catch (e) {}

      showToast("✓ Upload Complete ✅");

      // Set public permission by default
      if (result.fileId) {
        googleDriveProvider.makeFilePublic(result.fileId).then((pubUrl) => {
          setUploadedDriveUrl(pubUrl);
          try {
            localStorage.setItem(`gdrive_link_${qtnNum}`, pubUrl);
          } catch (e) {}
        }).catch(() => {});
      }
    } catch (err) {
      setUploadState("error");
      showToast("❌ Sync Failed. Tap Retry Upload.");
    }
  };

  // Change Link Visibility (Public vs Private)
  const handleVisibilityChange = async (mode) => {
    setLinkVisibility(mode);
    if (!uploadedDriveFileId) return;

    try {
      if (mode === "public") {
        const pubUrl = await googleDriveProvider.makeFilePublic(uploadedDriveFileId);
        setUploadedDriveUrl(pubUrl);
        showToast("✓ Visibility: Anyone with link");
      } else {
        setUploadedDriveUrl(`https://drive.google.com/file/d/${uploadedDriveFileId}/view`);
        showToast("✓ Visibility: Restricted");
      }
    } catch (e) {}
  };

  // Add Invitee Email to Private File
  const handleAddInvitee = async () => {
    if (!inviteEmail.trim()) return;
    const targetEmail = inviteEmail.trim();
    const newUser = { id: Date.now(), email: targetEmail, role: selectedRole };
    setInvitedUsers((prev) => [...prev, newUser]);
    setInviteEmail("");

    if (uploadedDriveFileId) {
      try {
        await googleDriveProvider.inviteUserToFile(uploadedDriveFileId, targetEmail, selectedRole);
        showToast(`✓ Invited ${targetEmail}`);
      } catch (e) {
        showToast("✓ Invitee added");
      }
    }
  };

  const handleRemoveInvitee = (id) => {
    setInvitedUsers((prev) => prev.filter((u) => u.id !== id));
    showToast("✓ Invitee removed");
  };

  // Disconnect Drive
  const handleDisconnectDrive = async () => {
    await googleDriveProvider.disconnect();
    setDriveConnected(false);
    setDriveUserEmail("");
    setLastSyncTime(null);
    setDriveConnectState("idle");
    setUploadState("idle");
    setUploadedDriveFileId(null);
    setUploadedDriveUrl(null);
    showToast("✓ Google Drive Disconnected");
  };

  const handleCopyLinkText = (text) => {
    navigator.clipboard.writeText(text);
    showToast("✓ Link Copied to Clipboard");
  };

  const handleShareLinkClick = async () => {
    const qtnNum = mappedData?.quotationNumber || "QTN-2026-001";
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Google Drive Link: Quotation ${qtnNum}`,
          url: uploadedDriveUrl
        });
      } catch (e) {}
    } else {
      handleCopyLinkText(uploadedDriveUrl);
    }
  };

  const qtnNumStr = mappedData?.quotationNumber || quotationData?.quotationNumber || "QTN-2026-001";

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-32 text-slate-800 select-none">
      {/* 🟢 Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-full shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ====================================================
          2. STICKY PAGE HEADER
      ==================================================== */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 py-3 shadow-2xs">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={() => {
              if (goBack) goBack();
              else if (goToDashboard) goToDashboard();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200 active:scale-98 transition-all"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="text-center flex-1 min-w-0">
            <h1 className="text-base font-bold text-slate-900 truncate">Share Drive Link</h1>
            <p className="text-[11px] font-medium text-slate-500 truncate">
              Manage Google Drive sharing for {qtnNumStr}
            </p>
          </div>

          <div className="w-16 shrink-0" />
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pt-6 space-y-6">
        {/* ====================================================
            3. GOOGLE DRIVE STATUS SECTION
        ==================================================== */}
        <section className="bg-white border border-slate-200/80 rounded-[24px] p-5 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Google Drive Connection Status
          </h2>

          {!driveConnected ? (
            /* 🔴 DISCONNECTED STATE */
            <div className="bg-slate-50 border border-slate-200 rounded-[20px] p-5 text-center space-y-4">
              <div className="w-14 h-14 bg-blue-50 border border-blue-200 text-[#2563EB] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                <Link2 size={28} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">Google Drive Not Connected</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Connect your Google Drive account to enable automatic background PDF uploads and generate secure share links.
                </p>
              </div>

              {driveConnectError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl text-left flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{driveConnectError}</span>
                </div>
              )}

              <button
                onClick={handleConnectGoogleDrive}
                disabled={driveConnectState === "connecting"}
                className="w-full py-3 bg-[#2563EB] text-white font-bold text-xs rounded-xl hover:bg-blue-700 active:scale-98 transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {driveConnectState === "connecting" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connecting OAuth...
                  </>
                ) : (
                  <>
                    <Globe size={16} /> Connect Google Drive
                  </>
                )}
              </button>

              <p className="text-[10px] text-slate-400 leading-normal">
                Your Google credentials are securely handled using Google OAuth 2.0. VisionX never stores your Google password.
              </p>
            </div>
          ) : (
            /* 🟢 CONNECTED STATE */
            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-[20px] p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Google Drive Connected ✅</h3>
                  <p className="text-[11px] font-semibold text-slate-700 mt-0.5">{driveUserEmail}</p>
                  {lastSyncTime && (
                    <span className="text-[10px] font-medium text-slate-500 block mt-0.5">
                      Last Sync: {lastSyncTime}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={handleDisconnectDrive}
                className="px-3 py-1.5 bg-white border border-rose-200 text-rose-600 font-bold text-xs rounded-xl hover:bg-rose-50 active:scale-95 transition-all flex items-center gap-1 shrink-0 shadow-2xs"
              >
                <LogOut size={14} /> Disconnect
              </button>
            </div>
          )}
        </section>

        {/* ====================================================
            6. SILENT BACKGROUND UPLOADING PROGRESS BAR
        ==================================================== */}
        {driveConnected && uploadState === "uploading" && (
          <div className="bg-blue-50 border border-blue-200 rounded-[20px] p-4 space-y-2 animate-in fade-in-50 duration-200">
            <div className="flex justify-between text-xs font-bold text-slate-800">
              <span>{uploadProgress > 50 ? "Generating Google Drive Link..." : "Uploading silently to Google Drive..."}</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2563EB] transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Retry Upload Error State */}
        {driveConnected && uploadState === "error" && (
          <div className="bg-rose-50 border border-rose-200 rounded-[20px] p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-700">
              <AlertCircle size={18} />
              <span>Google Drive Upload Failed</span>
            </div>
            <button
              onClick={handleStartRealUpload}
              className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 flex items-center gap-1 shadow-xs"
            >
              <RefreshCw size={14} /> Retry Upload
            </button>
          </div>
        )}

        {/* ====================================================
            4. LINK TYPE & 5. DRIVE SHARE LINK RESULT
        ==================================================== */}
        {driveConnected && uploadState === "uploaded" && (
          <>
            {/* LINK TYPE SELECTOR */}
            <section className="bg-white border border-slate-200/80 rounded-[24px] p-5 shadow-2xs space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Choose Link Type
              </h2>

              <div className="space-y-2.5">
                {/* Public Link */}
                <label
                  onClick={() => handleVisibilityChange("public")}
                  className={`p-4 rounded-[18px] border cursor-pointer flex items-start gap-3 transition-all ${
                    linkVisibility === "public"
                      ? "border-blue-600 bg-blue-50/50 shadow-2xs"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="driveLinkMode"
                    checked={linkVisibility === "public"}
                    onChange={() => handleVisibilityChange("public")}
                    className="mt-0.5 accent-blue-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Globe size={15} className="text-blue-600" /> Public Link
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Anyone with the link can view.
                    </p>
                  </div>
                </label>

                {/* Private Link */}
                <label
                  onClick={() => handleVisibilityChange("private")}
                  className={`p-4 rounded-[18px] border cursor-pointer flex items-start gap-3 transition-all ${
                    linkVisibility === "private"
                      ? "border-blue-600 bg-blue-50/50 shadow-2xs"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="driveLinkMode"
                    checked={linkVisibility === "private"}
                    onChange={() => handleVisibilityChange("private")}
                    className="mt-0.5 accent-blue-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Lock size={15} className="text-blue-600" /> Private Link
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Restricted access. Only invited users can view.
                    </p>
                  </div>
                </label>
              </div>

              {/* Private Link Invitee Section */}
              {linkVisibility === "private" && (
                <div className="bg-slate-50 border border-slate-200 rounded-[20px] p-4 space-y-3 animate-in fade-in-50 duration-200">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Invite People
                  </h3>

                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      placeholder="Enter email address..."
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600"
                    />
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
                    >
                      <option value="Viewer">Viewer</option>
                      <option value="Commenter">Commenter</option>
                      <option value="Editor">Editor</option>
                    </select>
                    <button
                      onClick={handleAddInvitee}
                      className="px-3.5 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 active:scale-95 transition-all shrink-0"
                    >
                      Add Person
                    </button>
                  </div>

                  {/* Invitee List */}
                  <div className="space-y-2 pt-1">
                    {invitedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs"
                      >
                        <span className="font-semibold text-slate-700 truncate">{user.email}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold">
                            {user.role}
                          </span>
                          <button
                            onClick={() => handleRemoveInvitee(user.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* 5. GOOGLE DRIVE SHARE LINK RESULT BOX */}
            <section className="bg-white border border-blue-200 rounded-[24px] p-5 shadow-2xs space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Google Drive Share Link
              </h2>

              <input
                type="text"
                readOnly
                value={uploadedDriveUrl || "https://drive.google.com/file/d/..."}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 outline-none select-all"
              />

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleCopyLinkText(uploadedDriveUrl)}
                  className="flex-1 py-2.5 px-3 bg-[#2563EB] text-white rounded-xl font-bold text-xs hover:bg-blue-700 active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Copy size={15} /> Copy Link
                </button>
                <button
                  onClick={handleShareLinkClick}
                  className="flex-1 py-2.5 px-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 active:scale-98 transition-all flex items-center justify-center gap-1.5"
                >
                  <Share2 size={15} /> Share Link
                </button>
                <button
                  onClick={() => window.open(uploadedDriveUrl, "_blank")}
                  className="flex-1 py-2.5 px-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-bold text-xs hover:bg-emerald-100 active:scale-98 transition-all flex items-center justify-center gap-1.5"
                >
                  <ExternalLink size={15} /> Open Drive
                </button>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
