/**
 * 📦 LocalDB — Offline-First Storage Engine for QuoteGen Pro
 * Primary: IndexedDB | Fallback: LocalStorage
 */

const DB_NAME = "QuoteGenProDB";
const DB_VERSION = 1;
const STORE_NAME = "quotations";

const STORAGE_KEYS = {
  QUOTATIONS: "quotegen_saved_quotations",
  DRAFT: "previewDraft",
  COMPANY_PROFILE: "quotegen_company_profile",
  MATERIALS: "quotegen_materials_list",
  REF_SEQ: "quotation_ref_seq",
  REF_DATE: "quotation_ref_date",
  SETTINGS: "quotegen_settings",
  CLOUD_FILES: "quotegen_cloud_files",
  SYNC_LOGS: "quotegen_cloud_sync_logs",
  CLOUD_SETTINGS: "quotegen_cloud_settings",
};

const DEFAULT_CLOUD_SETTINGS = {
  autoBackupQuotations: true,
  autoBackupPdfs: true,
  autoBackupImages: true,
  autoBackupCustomerData: true,
  autoBackupCompanyProfiles: true,
  autoBackupSettings: true,
  backupFrequency: "every_export", // "every_export" | "hourly" | "daily" | "manual"
  defaultVisibility: "public", // "public" | "private"
  allowedEmails: ["client@example.com", "admin@visionx.com"],
  autoGenerateShareLink: true,
  copyLinkAfterUpload: true,
  uploadOriginalPdf: true,
  compressBeforeUpload: false,
  deleteLocalAfterUpload: false,
  encryptMetadata: false,
  keepPreviousVersions: true,
  offlineCache: true,
};

const DEFAULT_COMPANY_PROFILE = {
  companyName: "",
  companyTagline: "",
  companyAddress: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  companyPhone: "",
  companyAltPhone: "",
  companyEmail: "",
  gstNo: "",
  website: "",
  companyLogo: "",
  defaultWarranty: "3 Years Warranty",
  defaultPaintBrand: "Asian Paints Royale / Dulux",
  defaultTerms: "1. Quotation valid for 30 days from date of issue.\n2. Work will commence within 3 business days of receiving advance payment.\n3. Any change in scope will be charged extra.",
  defaultNotes: "1. Surface cleaning, scraping, and putty application.\n2. Application of primer coat.\n3. Application of topcoats (2 coats).",
  defaultExclusions: "1. Major civil structural repairs.\n2. Electrical and plumbing alterations.\n3. High-rise external scaffolding above 25ft unless specified.",
  paymentTerms: {
    advance: "50%",
    midWork: "30%",
    completion: "20%"
  },
  bankDetails: {
    bankName: "",
    accountHolder: "",
    accountNumber: "",
    ifscCode: "",
    branch: "",
    upiId: "",
    qrCodeImage: ""
  },
  signature: {
    name: "",
    designation: "Authorized Signatory",
    phone: "",
    email: "",
    signatureImage: ""
  },
  companySeal: "",
  companySignature: ""
};

// ── 🗄️ INDEXEDDB HELPER ──
const initIDB = () => {
  return new Promise((resolve) => {
    if (!window.indexedDB) {
      resolve(null);
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = () => resolve(null);
  });
};

export const localDB = {
  // ── 📄 QUOTATIONS MANAGEMENT ──
  getQuotations() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUOTATIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("LocalDB Read Error:", e);
      return [];
    }
  },

  getQuotationById(id) {
    if (!id) return null;
    const list = this.getQuotations();
    return list.find((q) => q._id === id || q.id === id || q.projectDetails?.referenceNo === id || q.projectDetails?.quotationNo === id) || null;
  },

  saveQuotation(quotationData) {
    try {
      const list = this.getQuotations();
      const id = quotationData._id || quotationData.id || quotationData.projectDetails?.referenceNo || `QTN-${Date.now()}`;

      const updatedQuote = {
        uploadStatus: quotationData.uploadStatus || "Pending",
        driveFileId: quotationData.driveFileId || null,
        driveUrl: quotationData.driveUrl || null,
        syncDate: quotationData.syncDate || null,
        folderPath: quotationData.folderPath || null,
        ...quotationData,
        _id: id,
        id: id,
        updatedAt: new Date().toISOString(),
        createdAt: quotationData.createdAt || new Date().toISOString(),
      };

      const existingIdx = list.findIndex((q) => q._id === id || q.id === id);
      if (existingIdx >= 0) {
        list[existingIdx] = updatedQuote;
      } else {
        list.unshift(updatedQuote);
      }

      localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(list));

      // Async sync to IndexedDB
      initIDB().then((db) => {
        if (db) {
          try {
            const tx = db.transaction(STORE_NAME, "readwrite");
            tx.objectStore(STORE_NAME).put(updatedQuote);
          } catch (err) { }
        }
      });

      return updatedQuote;
    } catch (e) {
      console.error("LocalDB Save Error:", e);
      return null;
    }
  },

  // ── 📦 PDF BLOB & CLOUD BACKUP METADATA ──
  async savePdfBlob(id, pdfBlobOrBase64) {
    try {
      const db = await initIDB();
      if (!db) return false;
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const existing = await new Promise((resolve) => {
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      });

      const entry = {
        ...(existing || { id, _id: id }),
        pdfBlob: pdfBlobOrBase64,
        pdfSavedAt: new Date().toISOString(),
      };
      store.put(entry);
      return true;
    } catch (e) {
      console.error("Error saving PDF blob to IndexedDB:", e);
      return false;
    }
  },

  async getPdfBlob(id) {
    try {
      const db = await initIDB();
      if (!db) return null;
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const req = tx.objectStore(STORE_NAME).get(id);
        req.onsuccess = () => resolve(req.result?.pdfBlob || null);
        req.onerror = () => resolve(null);
      });
    } catch (e) {
      console.error("Error retrieving PDF blob from IndexedDB:", e);
      return null;
    }
  },

  updateBackupStatus(id, { uploadStatus, driveFileId, driveUrl, syncDate, folderPath }) {
    const quote = this.getQuotationById(id);
    if (!quote) return null;

    const updated = {
      ...quote,
      uploadStatus: uploadStatus || quote.uploadStatus,
      driveFileId: driveFileId !== undefined ? driveFileId : quote.driveFileId,
      driveUrl: driveUrl !== undefined ? driveUrl : quote.driveUrl,
      syncDate: syncDate || new Date().toISOString(),
      folderPath: folderPath || quote.folderPath,
    };

    return this.saveQuotation(updated);
  },

  deleteQuotation(id) {
    try {
      const list = this.getQuotations();
      const filtered = list.filter((q) => q._id !== id && q.id !== id);
      localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(filtered));

      // Sync deletion to IndexedDB
      initIDB().then((db) => {
        if (db) {
          try {
            const tx = db.transaction(STORE_NAME, "readwrite");
            tx.objectStore(STORE_NAME).delete(id);
          } catch (err) { }
        }
      });

      return true;
    } catch (e) {
      console.error("LocalDB Delete Error:", e);
      return false;
    }
  },

  duplicateQuotation(id) {
    const original = this.getQuotationById(id);
    if (!original) return null;
    const newId = `QTN-${Date.now()}`;
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const refNo = `QTN-${dateStr}-${Math.floor(1000 + Math.random() * 9000)}`;

    const clone = JSON.parse(JSON.stringify(original));
    clone._id = newId;
    clone.id = newId;
    clone.createdAt = new Date().toISOString();
    clone.updatedAt = new Date().toISOString();

    if (clone.projectDetails) {
      clone.projectDetails.referenceNo = refNo;
      clone.projectDetails.quotationNo = refNo;
      if (clone.projectDetails.clientName) {
        clone.projectDetails.clientName = `${clone.projectDetails.clientName} (Copy)`;
      }
    }
    if (clone.clientName) {
      clone.clientName = `${clone.clientName} (Copy)`;
    }
    clone.quotationNo = refNo;

    return this.saveQuotation(clone);
  },

  renameQuotation(id, newClientName, newProjectName) {
    const quote = this.getQuotationById(id);
    if (!quote) return null;

    if (quote.projectDetails) {
      if (newClientName) quote.projectDetails.clientName = newClientName;
      if (newProjectName) quote.projectDetails.projectName = newProjectName;
    }
    if (newClientName) quote.clientName = newClientName;
    if (newProjectName) quote.projectName = newProjectName;

    return this.saveQuotation(quote);
  },

  // ── 🏢 MULTI-COMPANY PROFILES MANAGEMENT ──
  getCompanyProfiles() {
    try {
      const data = localStorage.getItem("quotegen_company_profiles_list");
      if (data) {
        const list = JSON.parse(data);
        if (Array.isArray(list) && list.length > 0) return list;
      }
      
      const legacyProfile = this.getCompanyProfileLegacy();
      const initialProfile = {
        id: "cp_default",
        companyName: legacyProfile.companyName || "My Company",
        isDefault: true,
        ...legacyProfile,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const initialList = [initialProfile];
      localStorage.setItem("quotegen_company_profiles_list", JSON.stringify(initialList));
      localStorage.setItem("quotegen_active_company_id", "cp_default");
      return initialList;
    } catch (e) {
      console.error("Error reading company profiles list:", e);
      return [DEFAULT_COMPANY_PROFILE];
    }
  },

  getDefaultCompanyProfile() {
    const list = this.getCompanyProfiles();
    return list.find(p => p.isDefault) || list[0] || DEFAULT_COMPANY_PROFILE;
  },

  getActiveCompanyProfile() {
    const activeId = localStorage.getItem("quotegen_active_company_id");
    const list = this.getCompanyProfiles();
    if (activeId) {
      const found = list.find(p => p.id === activeId);
      if (found) return found;
    }
    return this.getDefaultCompanyProfile();
  },

  setActiveCompanyProfileId(id) {
    localStorage.setItem("quotegen_active_company_id", id);
    window.dispatchEvent(new Event("quotationDataUpdated"));
  },

  setDefaultCompanyProfile(id) {
    const list = this.getCompanyProfiles().map(p => ({
      ...p,
      isDefault: p.id === id
    }));
    localStorage.setItem("quotegen_company_profiles_list", JSON.stringify(list));
    localStorage.setItem("quotegen_active_company_id", id);
    const defaultProfile = list.find(p => p.id === id);
    if (defaultProfile) {
      localStorage.setItem(STORAGE_KEYS.COMPANY_PROFILE, JSON.stringify(defaultProfile));
    }
    window.dispatchEvent(new Event("quotationDataUpdated"));
    return list;
  },

  saveCompanyProfileById(profileData) {
    try {
      const list = this.getCompanyProfiles();
      const id = profileData.id || `cp_${Date.now()}`;
      
      const existingIdx = list.findIndex(p => p.id === id);
      const isDefault = profileData.isDefault !== undefined 
        ? profileData.isDefault 
        : (existingIdx >= 0 ? list[existingIdx].isDefault : list.length === 0);

      const updatedProfile = {
        ...DEFAULT_COMPANY_PROFILE,
        ...(existingIdx >= 0 ? list[existingIdx] : {}),
        ...profileData,
        id,
        isDefault,
        updatedAt: new Date().toISOString(),
        createdAt: (existingIdx >= 0 ? list[existingIdx].createdAt : new Date().toISOString()),
      };

      if (existingIdx >= 0) {
        list[existingIdx] = updatedProfile;
      } else {
        list.push(updatedProfile);
      }

      localStorage.setItem("quotegen_company_profiles_list", JSON.stringify(list));
      localStorage.setItem("quotegen_active_company_id", id);

      if (isDefault) {
        localStorage.setItem(STORAGE_KEYS.COMPANY_PROFILE, JSON.stringify(updatedProfile));
      }

      window.dispatchEvent(new Event("quotationDataUpdated"));
      return updatedProfile;
    } catch (e) {
      console.error("LocalDB Save Company Profile Error:", e);
      return null;
    }
  },

  createCompanyProfile({ name, logo }) {
    const newProfile = {
      id: `cp_${Date.now()}`,
      companyName: name || "New Company",
      companyLogo: logo || "",
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.saveCompanyProfileById(newProfile);
  },

  duplicateCompanyProfile(id) {
    const list = this.getCompanyProfiles();
    const target = list.find(p => p.id === id);
    if (!target) return null;
    
    const clone = JSON.parse(JSON.stringify(target));
    clone.id = `cp_${Date.now()}`;
    clone.companyName = `${clone.companyName} (Copy)`;
    clone.isDefault = false;
    clone.createdAt = new Date().toISOString();
    clone.updatedAt = new Date().toISOString();

    list.push(clone);
    localStorage.setItem("quotegen_company_profiles_list", JSON.stringify(list));
    localStorage.setItem("quotegen_active_company_id", clone.id);
    window.dispatchEvent(new Event("quotationDataUpdated"));
    return clone;
  },

  deleteCompanyProfile(id) {
    const list = this.getCompanyProfiles();
    const target = list.find(p => p.id === id);
    if (!target) return false;

    if (target.isDefault) {
      alert("Cannot delete the default company profile. Set another company profile as default first.");
      return false;
    }

    const filtered = list.filter(p => p.id !== id);
    localStorage.setItem("quotegen_company_profiles_list", JSON.stringify(filtered));
    
    const activeId = localStorage.getItem("quotegen_active_company_id");
    if (activeId === id) {
      const defaultProf = filtered.find(p => p.isDefault) || filtered[0];
      if (defaultProf) {
        localStorage.setItem("quotegen_active_company_id", defaultProf.id);
      }
    }
    window.dispatchEvent(new Event("quotationDataUpdated"));
    return true;
  },

  getCompanyProfileLegacy() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPANY_PROFILE);
      if (!data) return DEFAULT_COMPANY_PROFILE;
      const parsed = JSON.parse(data);
      return {
        ...DEFAULT_COMPANY_PROFILE,
        ...parsed,
        bankDetails: {
          ...DEFAULT_COMPANY_PROFILE.bankDetails,
          ...(parsed.bankDetails || {})
        },
        signature: {
          ...DEFAULT_COMPANY_PROFILE.signature,
          ...(parsed.signature || {})
        }
      };
    } catch (e) {
      return DEFAULT_COMPANY_PROFILE;
    }
  },

  getCompanyProfile() {
    return this.getActiveCompanyProfile();
  },

  saveCompanyProfile(profile) {
    const active = this.getActiveCompanyProfile();
    return this.saveCompanyProfileById({ ...active, ...profile });
  },

  // ── 📊 STORAGE METRICS ──
  getStorageMetrics() {
    const list = this.getQuotations();
    const drafts = localStorage.getItem(STORAGE_KEYS.DRAFT) ? 1 : 0;

    let totalBytes = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalBytes += (localStorage[key].length + key.length) * 2;
      }
    }

    const kbSize = (totalBytes / 1024).toFixed(2);
    const mbSize = (totalBytes / (1024 * 1024)).toFixed(2);

    return {
      totalQuotations: list.length,
      draftQuotations: drafts,
      usedBytes: totalBytes,
      usedKB: kbSize,
      usedMB: mbSize,
    };
  },

  // ── 💾 BACKUP (EXPORT ALL DATA) ──
  exportBackupJSON() {
    const backupData = {
      app: "QuoteGen Pro",
      version: "2.0-offline",
      exportedAt: new Date().toISOString(),
      companyProfile: this.getCompanyProfile(),
      companyProfiles: this.getCompanyProfiles(),
      activeCompanyId: localStorage.getItem("quotegen_active_company_id"),
      quotations: this.getQuotations(),
      draft: localStorage.getItem(STORAGE_KEYS.DRAFT) ? JSON.parse(localStorage.getItem(STORAGE_KEYS.DRAFT)) : null,
      settings: localStorage.getItem(STORAGE_KEYS.SETTINGS) ? JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) : null,
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `quotegen_pro_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  // ── 📥 RESTORE (IMPORT BACKUP JSON) ──
  importBackupJSON(jsonData) {
    try {
      const parsed = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;

      if (!parsed || (!parsed.quotations && !parsed.companyProfile && !parsed.companyProfiles)) {
        throw new Error("Invalid backup JSON format.");
      }

      if (Array.isArray(parsed.quotations)) {
        localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(parsed.quotations));
      }

      if (Array.isArray(parsed.companyProfiles)) {
        localStorage.setItem("quotegen_company_profiles_list", JSON.stringify(parsed.companyProfiles));
      } else if (parsed.companyProfile) {
        localStorage.setItem(STORAGE_KEYS.COMPANY_PROFILE, JSON.stringify(parsed.companyProfile));
      }

      if (parsed.activeCompanyId) {
        localStorage.setItem("quotegen_active_company_id", parsed.activeCompanyId);
      }

      if (parsed.draft) {
        localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(parsed.draft));
      }

      if (parsed.settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed.settings));
      }

      window.dispatchEvent(new Event("quotationDataUpdated"));
      return true;
    } catch (e) {
      console.error("Import Error:", e);
      return false;
    }
  },

  // ── ☁️ CLOUD FILES & BACKUP METADATA ENGINE ──
  getCloudSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLOUD_SETTINGS);
      return data ? { ...DEFAULT_CLOUD_SETTINGS, ...JSON.parse(data) } : DEFAULT_CLOUD_SETTINGS;
    } catch (e) {
      return DEFAULT_CLOUD_SETTINGS;
    }
  },

  saveCloudSettings(settings) {
    try {
      const current = this.getCloudSettings();
      const updated = { ...current, ...settings };
      localStorage.setItem(STORAGE_KEYS.CLOUD_SETTINGS, JSON.stringify(updated));
      window.dispatchEvent(new Event("cloudSettingsUpdated"));
      return updated;
    } catch (e) {
      console.error("Error saving cloud settings:", e);
      return null;
    }
  },

  getCloudFiles() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLOUD_FILES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error loading cloud files:", e);
      return [];
    }
  },

  getActiveCloudFiles() {
    return this.getCloudFiles().filter(f => !f.deleted);
  },

  getRecentlyDeletedCloudFiles() {
    return this.getCloudFiles().filter(f => f.deleted);
  },

  getCloudFileById(id) {
    if (!id) return null;
    const files = this.getCloudFiles();
    return files.find(f => f.id === id || f.driveFileId === id || f.quotationId === id) || null;
  },

  saveCloudFile(fileData) {
    try {
      const files = this.getCloudFiles();
      const id = fileData.id || `cf_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const settings = this.getCloudSettings();
      
      const newFile = {
        id,
        quotationId: fileData.quotationId || null,
        driveFileId: fileData.driveFileId || null,
        fileName: fileData.fileName || "Quotation.pdf",
        mimeType: fileData.mimeType || "application/pdf",
        folderName: fileData.folderName || "VisionX QuoteGen Pro",
        size: fileData.size || 0,
        visibility: fileData.visibility || settings.defaultVisibility || "public",
        shareUrl: fileData.shareUrl || null,
        createdAt: fileData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deleted: Boolean(fileData.deleted),
        deletedAt: fileData.deletedAt || null,
        ownerEmail: fileData.ownerEmail || localStorage.getItem("gdrive_user_email") || "user@visionx.com",
        allowedEmails: fileData.allowedEmails || [...settings.allowedEmails],
        viewCount: fileData.viewCount || 0,
        lastOpenedAt: fileData.lastOpenedAt || null,
        customerName: fileData.customerName || fileData.clientName || "",
        companyName: fileData.companyName || "",
        quotationNumber: fileData.quotationNumber || fileData.refNo || "",
        shareHistory: fileData.shareHistory || [
          { action: "Created & Uploaded", timestamp: new Date().toISOString() }
        ],
      };

      const existingIdx = files.findIndex(f => f.id === id || (f.driveFileId && f.driveFileId === newFile.driveFileId));
      if (existingIdx >= 0) {
        files[existingIdx] = { ...files[existingIdx], ...newFile, updatedAt: new Date().toISOString() };
      } else {
        files.unshift(newFile);
      }

      localStorage.setItem(STORAGE_KEYS.CLOUD_FILES, JSON.stringify(files));
      this.logCloudSyncEvent({
        action: existingIdx >= 0 ? "Renamed" : "Uploaded",
        fileName: newFile.fileName,
        details: `File ${newFile.fileName} (${newFile.visibility}) synced to local metadata database.`
      });
      window.dispatchEvent(new Event("cloudFilesUpdated"));
      return newFile;
    } catch (e) {
      console.error("Error saving cloud file:", e);
      return null;
    }
  },

  updateCloudFile(id, updates) {
    const file = this.getCloudFileById(id);
    if (!file) return null;
    return this.saveCloudFile({ ...file, ...updates, updatedAt: new Date().toISOString() });
  },

  softDeleteCloudFile(id) {
    const file = this.getCloudFileById(id);
    if (!file) return false;
    
    const updatedHistory = [...(file.shareHistory || []), { action: "Moved to Recently Deleted", timestamp: new Date().toISOString() }];
    this.saveCloudFile({
      ...file,
      deleted: true,
      deletedAt: new Date().toISOString(),
      shareHistory: updatedHistory,
    });

    this.logCloudSyncEvent({
      action: "Deleted",
      fileName: file.fileName,
      details: `Moved ${file.fileName} to Recently Deleted.`
    });
    return true;
  },

  restoreCloudFile(id) {
    const file = this.getCloudFileById(id);
    if (!file) return false;

    const updatedHistory = [...(file.shareHistory || []), { action: "Restored from Recently Deleted", timestamp: new Date().toISOString() }];
    this.saveCloudFile({
      ...file,
      deleted: false,
      deletedAt: null,
      shareHistory: updatedHistory,
    });

    this.logCloudSyncEvent({
      action: "Restored",
      fileName: file.fileName,
      details: `Restored ${file.fileName} to active files.`
    });
    return true;
  },

  permanentDeleteCloudFile(id) {
    try {
      const files = this.getCloudFiles();
      const target = files.find(f => f.id === id);
      const filtered = files.filter(f => f.id !== id);
      localStorage.setItem(STORAGE_KEYS.CLOUD_FILES, JSON.stringify(filtered));

      if (target) {
        this.logCloudSyncEvent({
          action: "Deleted",
          fileName: target.fileName,
          details: `Permanently deleted ${target.fileName}.`
        });
      }
      window.dispatchEvent(new Event("cloudFilesUpdated"));
      return true;
    } catch (e) {
      return false;
    }
  },

  bulkSoftDeleteCloudFiles(ids = []) {
    ids.forEach(id => this.softDeleteCloudFile(id));
  },

  bulkRestoreCloudFiles(ids = []) {
    ids.forEach(id => this.restoreCloudFile(id));
  },

  bulkPermanentDeleteCloudFiles(ids = []) {
    ids.forEach(id => this.permanentDeleteCloudFile(id));
  },

  incrementFileViewCount(id) {
    const file = this.getCloudFileById(id);
    if (!file) return;
    const viewCount = (file.viewCount || 0) + 1;
    const lastOpenedAt = new Date().toISOString();
    const updatedHistory = [...(file.shareHistory || []), { action: "Opened & Viewed", timestamp: lastOpenedAt }];
    this.saveCloudFile({ ...file, viewCount, lastOpenedAt, shareHistory: updatedHistory });
  },

  // ── 📜 CLOUD SYNC LOGS ──
  getCloudSyncLogs() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SYNC_LOGS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  logCloudSyncEvent({ action, fileName, details }) {
    try {
      const logs = this.getCloudSyncLogs();
      const newLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        action, // "Uploaded" | "Deleted" | "Restored" | "Renamed" | "Permission Changed"
        fileName: fileName || "Quotation File",
        timestamp: new Date().toISOString(),
        details: details || `Operation ${action} executed.`,
      };
      logs.unshift(newLog);
      // Keep last 100 log entries
      localStorage.setItem(STORAGE_KEYS.SYNC_LOGS, JSON.stringify(logs.slice(0, 100)));
      window.dispatchEvent(new Event("cloudLogsUpdated"));
    } catch (e) {
      console.error("Error logging sync event:", e);
    }
  },

  // ── 🧹 CLEAR ALL LOCAL DATA ──
  clearAllData() {
    localStorage.removeItem(STORAGE_KEYS.QUOTATIONS);
    localStorage.removeItem(STORAGE_KEYS.DRAFT);
    localStorage.removeItem(STORAGE_KEYS.COMPANY_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.REF_SEQ);
    localStorage.removeItem(STORAGE_KEYS.REF_DATE);
    localStorage.removeItem(STORAGE_KEYS.CLOUD_FILES);
    localStorage.removeItem(STORAGE_KEYS.SYNC_LOGS);
    window.dispatchEvent(new Event("quotationDataUpdated"));
  }
};
