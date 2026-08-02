/**
 * 📦 LocalDB — Offline-First Storage Engine with In-Memory Cache Optimization
 * Primary: In-Memory Fast Cache | Secondary: LocalStorage & IndexedDB
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
  backupFrequency: "every_export",
  defaultVisibility: "public",
  allowedEmails: ["client@example.com", "admin@VisionX.com"],
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

// ── 🚀 IN-MEMORY CACHE FOR INSTANT (<1ms) ACCESS ──
let _quotationsCache = null;
let _companyProfilesCache = null;
let _activeCompanyCache = null;
let _cloudFilesCache = null;

const invalidateCache = () => {
  _quotationsCache = null;
  _companyProfilesCache = null;
  _activeCompanyCache = null;
  _cloudFilesCache = null;
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

/**
 * 🧹 Sanitizes a quotation draft payload before saving to localStorage.
 * Strips base64 image strings and temporary binary blobs to prevent QuotaExceededError.
 */
export const sanitizeDraftForStorage = (draft) => {
  if (!draft || typeof draft !== "object") return draft;

  try {
    const clean = JSON.parse(JSON.stringify(draft));

    if (clean.projectDetails) {
      if (clean.projectDetails.companyLogo && typeof clean.projectDetails.companyLogo === "string" && clean.projectDetails.companyLogo.startsWith("data:")) {
        clean.projectDetails.companyLogo = "";
      }
    }

    if (clean.bankDetails) {
      if (clean.bankDetails.qrCodeImage && typeof clean.bankDetails.qrCodeImage === "string" && clean.bankDetails.qrCodeImage.startsWith("data:")) {
        clean.bankDetails.qrCodeImage = "";
      }
    }

    if (clean.signature) {
      if (clean.signature.signatureImage && typeof clean.signature.signatureImage === "string" && clean.signature.signatureImage.startsWith("data:")) {
        clean.signature.signatureImage = "";
      }
    }

    delete clean.previewPdfCache;
    delete clean.previewHtmlCache;
    delete clean.pdfBlob;
    delete clean.screenshot;

    return clean;
  } catch (e) {
    return draft;
  }
};

/**
 * 🛡️ Safe localStorage setItem helper wrapped in try/catch to catch QuotaExceededError
 */
export const safeLocalStorageSet = (key, value) => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    console.warn(`[localStorage Quota Warning] Failed to set '${key}':`, err?.message || err);
    try {
      localStorage.removeItem("previewPdfCache");
      localStorage.removeItem("gdrive_temp_cache");
      localStorage.setItem(key, value);
      return true;
    } catch (retryErr) {
      console.error(`[localStorage Quota Critical] Unrecoverable error setting '${key}':`, retryErr?.message || retryErr);
      return false;
    }
  }
};

export const localDB = {
  clearMemoryCache() {
    invalidateCache();
  },

  // ── 📝 DRAFT MANAGEMENT (SANITIZED & INDEXEDDB BACKED) ──
  saveDraft(draftPayload) {
    if (!draftPayload) {
      localStorage.removeItem(STORAGE_KEYS.DRAFT);
      return;
    }
    const clean = sanitizeDraftForStorage(draftPayload);
    safeLocalStorageSet(STORAGE_KEYS.DRAFT, JSON.stringify(clean));

    initIDB().then((db) => {
      if (db) {
        try {
          const tx = db.transaction(STORE_NAME, "readwrite");
          tx.objectStore(STORE_NAME).put({ ...draftPayload, id: "current_active_draft" });
        } catch (err) {}
      }
    });
  },

  getDraft() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DRAFT);
      const parsed = data ? JSON.parse(data) : null;
      if (parsed) {
        const profile = this.getCompanyProfile() || {};
        if (parsed.projectDetails && !parsed.projectDetails.companyLogo && profile.companyLogo) {
          parsed.projectDetails.companyLogo = profile.companyLogo;
        }
        if (parsed.bankDetails && !parsed.bankDetails.qrCodeImage && profile.bankDetails?.qrCodeImage) {
          parsed.bankDetails.qrCodeImage = profile.bankDetails.qrCodeImage;
        }
        if (parsed.signature && !parsed.signature.signatureImage && profile.signature?.signatureImage) {
          parsed.signature.signatureImage = profile.signature.signatureImage;
        }
      }
      return parsed;
    } catch (e) {
      return null;
    }
  },

  // ── 📄 QUOTATIONS MANAGEMENT (MEMORY CACHED) ──
  getQuotations() {
    if (_quotationsCache !== null) return _quotationsCache;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUOTATIONS);
      _quotationsCache = data ? JSON.parse(data) : [];
      return _quotationsCache;
    } catch (e) {
      console.error("LocalDB Read Error:", e);
      _quotationsCache = [];
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

      _quotationsCache = list;
      safeLocalStorageSet(STORAGE_KEYS.QUOTATIONS, JSON.stringify(list));

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
      _quotationsCache = filtered;
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

  // ── 🏢 MULTI-COMPANY PROFILES MANAGEMENT (MEMORY CACHED) ──
  getCompanyProfiles() {
    if (_companyProfilesCache !== null) return _companyProfilesCache;
    try {
      const data = localStorage.getItem("quotegen_company_profiles_list");
      if (data) {
        const list = JSON.parse(data);
        if (Array.isArray(list) && list.length > 0) {
          _companyProfilesCache = list;
          return list;
        }
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
      _companyProfilesCache = initialList;
      localStorage.setItem("quotegen_company_profiles_list", JSON.stringify(initialList));
      localStorage.setItem("quotegen_active_company_id", "cp_default");
      return initialList;
    } catch (e) {
      console.error("Error reading company profiles list:", e);
      _companyProfilesCache = [DEFAULT_COMPANY_PROFILE];
      return [DEFAULT_COMPANY_PROFILE];
    }
  },

  getDefaultCompanyProfile() {
    const list = this.getCompanyProfiles();
    return list.find(p => p.isDefault) || list[0] || DEFAULT_COMPANY_PROFILE;
  },

  getActiveCompanyProfile() {
    if (_activeCompanyCache !== null) return _activeCompanyCache;
    const activeId = localStorage.getItem("quotegen_active_company_id");
    const list = this.getCompanyProfiles();
    if (activeId) {
      const found = list.find(p => p.id === activeId);
      if (found) {
        _activeCompanyCache = found;
        return found;
      }
    }
    const def = this.getDefaultCompanyProfile();
    _activeCompanyCache = def;
    return def;
  },

  getCompanyProfile() {
    return this.getActiveCompanyProfile();
  },

  saveCompanyProfile(profileData) {
    const active = this.getActiveCompanyProfile();
    const id = profileData?.id || active?.id || "cp_default";
    return this.saveCompanyProfileById({ ...profileData, id });
  },

  setActiveCompanyProfileId(id) {
    _activeCompanyCache = null;
    localStorage.setItem("quotegen_active_company_id", id);
    window.dispatchEvent(new Event("quotationDataUpdated"));
  },

  setDefaultCompanyProfile(id) {
    _companyProfilesCache = null;
    _activeCompanyCache = null;
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
      _companyProfilesCache = null;
      _activeCompanyCache = null;
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

  deleteCompanyProfileById(id) {
    try {
      _companyProfilesCache = null;
      _activeCompanyCache = null;
      const list = this.getCompanyProfiles();
      if (list.length <= 1) return false;

      const filtered = list.filter(p => p.id !== id);
      const wasActive = localStorage.getItem("quotegen_active_company_id") === id;

      if (filtered.length > 0 && !filtered.some(p => p.isDefault)) {
        filtered[0].isDefault = true;
      }

      localStorage.setItem("quotegen_company_profiles_list", JSON.stringify(filtered));
      if (wasActive) {
        const nextActive = filtered.find(p => p.isDefault) || filtered[0];
        localStorage.setItem("quotegen_active_company_id", nextActive.id);
      }

      window.dispatchEvent(new Event("quotationDataUpdated"));
      return true;
    } catch (e) {
      console.error("Error deleting company profile:", e);
      return false;
    }
  },

  getCompanyProfileLegacy() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPANY_PROFILE);
      return data ? { ...DEFAULT_COMPANY_PROFILE, ...JSON.parse(data) } : DEFAULT_COMPANY_PROFILE;
    } catch (e) {
      return DEFAULT_COMPANY_PROFILE;
    }
  },

  // ── 🎨 MATERIALS LIST MASTER ──
  getMaterialsList() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MATERIALS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveMaterialsList(materials) {
    try {
      localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
      return true;
    } catch (e) {
      return false;
    }
  },

  // ── 📊 CLOUD FILES & BACKUP LOGS (MEMORY CACHED) ──
  getCloudFiles() {
    if (_cloudFilesCache !== null) return _cloudFilesCache;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLOUD_FILES);
      _cloudFilesCache = data ? JSON.parse(data) : [];
      return _cloudFilesCache;
    } catch (e) {
      _cloudFilesCache = [];
      return [];
    }
  },

  saveCloudFile(fileRecord) {
    try {
      const list = this.getCloudFiles();
      const id = fileRecord.id || fileRecord.driveFileId || `file_${Date.now()}`;
      const updated = {
        ...fileRecord,
        id,
        updatedAt: new Date().toISOString(),
        createdAt: fileRecord.createdAt || new Date().toISOString(),
        isDeleted: fileRecord.isDeleted || false,
      };

      const existingIdx = list.findIndex(f => f.id === id || (f.driveFileId && f.driveFileId === fileRecord.driveFileId));
      if (existingIdx >= 0) {
        list[existingIdx] = updated;
      } else {
        list.unshift(updated);
      }

      _cloudFilesCache = list;
      localStorage.setItem(STORAGE_KEYS.CLOUD_FILES, JSON.stringify(list));
      window.dispatchEvent(new Event("cloudFilesUpdated"));
      return updated;
    } catch (e) {
      return null;
    }
  },

  updateCloudFile(id, updates) {
    const list = this.getCloudFiles();
    const idx = list.findIndex(f => f.id === id || f.driveFileId === id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
      _cloudFilesCache = list;
      localStorage.setItem(STORAGE_KEYS.CLOUD_FILES, JSON.stringify(list));
      window.dispatchEvent(new Event("cloudFilesUpdated"));
      return list[idx];
    }
    return null;
  },

  softDeleteCloudFile(id) {
    return this.updateCloudFile(id, { isDeleted: true, deletedAt: new Date().toISOString() });
  },

  restoreCloudFile(id) {
    return this.updateCloudFile(id, { isDeleted: false, deletedAt: null });
  },

  permanentDeleteCloudFile(id) {
    const list = this.getCloudFiles().filter(f => f.id !== id && f.driveFileId !== id);
    _cloudFilesCache = list;
    localStorage.setItem(STORAGE_KEYS.CLOUD_FILES, JSON.stringify(list));
    window.dispatchEvent(new Event("cloudFilesUpdated"));
    return true;
  },

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
      const updated = { ...this.getCloudSettings(), ...settings };
      localStorage.setItem(STORAGE_KEYS.CLOUD_SETTINGS, JSON.stringify(updated));
      return updated;
    } catch (e) {
      return null;
    }
  },

  getActiveCloudFiles() {
    return this.getCloudFiles().filter(f => !f.isDeleted);
  },

  deleteCloudFile(id) {
    return this.softDeleteCloudFile(id);
  },

  getCloudSyncLogs() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SYNC_LOGS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  logCloudSyncEvent(eventRecord) {
    try {
      const logs = this.getCloudSyncLogs();
      const entry = {
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        ...eventRecord,
      };
      logs.unshift(entry);
      const trimmed = logs.slice(0, 100);
      localStorage.setItem(STORAGE_KEYS.SYNC_LOGS, JSON.stringify(trimmed));
      window.dispatchEvent(new Event("cloudSyncLogsUpdated"));
      return entry;
    } catch (e) {
      return null;
    }
  },

  exportBackupJSON() {
    try {
      const backupData = {
        version: "2.0 Enterprise",
        exportedAt: new Date().toISOString(),
        companyProfiles: this.getCompanyProfiles(),
        activeCompanyId: localStorage.getItem("quotegen_active_company_id"),
        quotations: this.getQuotations(),
        cloudFiles: this.getCloudFiles(),
        cloudSettings: this.getCloudSettings(),
        materials: this.getMaterialsList(),
      };
      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `VisionX_QuoteGen_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } catch (e) {
      console.error("Export backup failed:", e);
      return false;
    }
  },

  importBackupJSON(parsedData) {
    try {
      if (!parsedData || typeof parsedData !== "object") return false;
      const data = parsedData.data || parsedData;

      if (Array.isArray(data.companyProfiles) && data.companyProfiles.length > 0) {
        localStorage.setItem("quotegen_company_profiles_list", JSON.stringify(data.companyProfiles));
      }
      if (data.activeCompanyId) {
        localStorage.setItem("quotegen_active_company_id", data.activeCompanyId);
      }
      if (Array.isArray(data.quotations) && data.quotations.length > 0) {
        data.quotations.forEach(q => this.saveQuotation(q));
      }
      if (Array.isArray(data.cloudFiles) && data.cloudFiles.length > 0) {
        data.cloudFiles.forEach(f => this.saveCloudFile(f));
      }
      if (data.cloudSettings) {
        this.saveCloudSettings(data.cloudSettings);
      }
      if (Array.isArray(data.materials)) {
        this.saveMaterialsList(data.materials);
      }

      this.clearMemoryCache();
      window.dispatchEvent(new Event("quotationDataUpdated"));
      window.dispatchEvent(new Event("cloudFilesUpdated"));
      return true;
    } catch (e) {
      console.error("Import backup failed:", e);
      return false;
    }
  },

  clearAllData() {
    this.clearMemoryCache();
    localStorage.removeItem(STORAGE_KEYS.QUOTATIONS);
    localStorage.removeItem("quotegen_company_profiles_list");
    localStorage.removeItem("quotegen_active_company_id");
    localStorage.removeItem(STORAGE_KEYS.COMPANY_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.CLOUD_FILES);
    localStorage.removeItem(STORAGE_KEYS.SYNC_LOGS);
    localStorage.removeItem(STORAGE_KEYS.CLOUD_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.MATERIALS);
    window.dispatchEvent(new Event("quotationDataUpdated"));
    window.dispatchEvent(new Event("cloudFilesUpdated"));
    return true;
  },

  getStorageMetrics() {
    const list = this.getQuotations();
    const cloudList = this.getCloudFiles();
    const totalQuotations = list.length;
    const quotationsBytes = JSON.stringify(list).length;
    const cloudBytes = JSON.stringify(cloudList).length;
    const totalBytes = quotationsBytes + cloudBytes;
    const usedKB = (totalBytes / 1024).toFixed(1);
    const usedMB = (totalBytes / (1024 * 1024)).toFixed(2);
    return { totalQuotations, totalBytes, usedKB, usedMB, cloudCount: cloudList.length };
  },

  getCloudFileById(id) {
    if (!id) return null;
    const list = this.getCloudFiles();
    return list.find(f => f.id === id || f.driveFileId === id || f.quotationId === id) || null;
  }
};
