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

  // ── 🏢 COMPANY PROFILE (SINGLE SOURCE OF TRUTH) ──
  getCompanyProfile() {
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

  saveCompanyProfile(profile) {
    try {
      const current = this.getCompanyProfile();
      const updated = { ...current, ...profile };
      localStorage.setItem(STORAGE_KEYS.COMPANY_PROFILE, JSON.stringify(updated));
      window.dispatchEvent(new Event("quotationDataUpdated"));
      return updated;
    } catch (e) {
      console.error("LocalDB Save Profile Error:", e);
      return null;
    }
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

      if (!parsed || (!parsed.quotations && !parsed.companyProfile)) {
        throw new Error("Invalid backup JSON format.");
      }

      if (Array.isArray(parsed.quotations)) {
        localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(parsed.quotations));
      }

      if (parsed.companyProfile) {
        localStorage.setItem(STORAGE_KEYS.COMPANY_PROFILE, JSON.stringify(parsed.companyProfile));
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

  // ── 🧹 CLEAR ALL LOCAL DATA ──
  clearAllData() {
    localStorage.removeItem(STORAGE_KEYS.QUOTATIONS);
    localStorage.removeItem(STORAGE_KEYS.DRAFT);
    localStorage.removeItem(STORAGE_KEYS.COMPANY_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.REF_SEQ);
    localStorage.removeItem(STORAGE_KEYS.REF_DATE);
    window.dispatchEvent(new Event("quotationDataUpdated"));
  }
};
