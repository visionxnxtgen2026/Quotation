import JSZip from "jszip";
import { localDB } from "./localDB";
import { googleDriveProvider } from "./googleDriveProvider";

/**
 * 📦 WorkspaceBackupProvider — Full Device Migration & Backup Engine using JSZip & Google Drive API.
 * Compresses quotations, company profiles, images, settings, and database snapshots into a single ZIP archive.
 */
class WorkspaceBackupProvider {
  /** Get device & platform info for backup manifest */
  getDeviceInfo() {
    const ua = navigator.userAgent;
    let platform = "Web";
    if (ua.includes("Win")) platform = "Windows";
    else if (ua.includes("Android")) platform = "Android";
    else if (ua.includes("Mac")) platform = "macOS";
    else if (ua.includes("Linux")) platform = "Linux";
    else if (ua.includes("iPhone") || ua.includes("iPad")) platform = "iOS";

    const deviceName = `${platform} (${navigator.language || "en-US"})`;
    return { platform, deviceName, userAgent: ua };
  }

  /**
   * 1. CREATE WORKSPACE BACKUP ZIP
   * Packs quotations, profiles, images, and settings into a single JSZip package.
   */
  async createWorkspaceZip(onProgress = null) {
    if (onProgress) onProgress("Preparing Workspace...", 10);
    const zip = new JSZip();
    const deviceInfo = this.getDeviceInfo();
    const nowIso = new Date().toISOString();

    const quotations = localDB.getQuotations();
    const companyProfiles = localDB.getCompanyProfiles();
    const activeCompanyId = localStorage.getItem("quotegen_active_company_id") || "";
    const cloudFiles = localDB.getCloudFiles();
    const cloudSettings = localDB.getCloudSettings();
    const syncLogs = localDB.getCloudSyncLogs();

    // App preferences & settings
    const appSettings = {
      autoSaveDraft: localStorage.getItem("autoSaveDraftEnabled"),
      refSeq: localStorage.getItem("quotation_ref_seq"),
      refDate: localStorage.getItem("quotation_ref_date"),
      gdriveAutoSync: localStorage.getItem("gdrive_auto_sync_setting"),
      draft: localStorage.getItem("previewDraft") ? JSON.parse(localStorage.getItem("previewDraft")) : null,
    };

    // 1. Create Manifest
    if (onProgress) onProgress("Compressing Database & Manifest...", 30);
    const manifest = {
      appName: "VisionX QuoteGen Pro",
      appVersion: "2.0-cloud",
      databaseVersion: 1,
      backupDate: nowIso,
      platform: deviceInfo.platform,
      deviceName: deviceInfo.deviceName,
      totalQuotations: quotations.length,
      totalCompanyProfiles: companyProfiles.length,
      totalCloudFiles: cloudFiles.length,
    };
    zip.file("manifest.json", JSON.stringify(manifest, null, 2));

    // 2. Add Database JSON files
    const dbFolder = zip.folder("database");
    dbFolder.file("quotations.json", JSON.stringify(quotations, null, 2));
    dbFolder.file("company_profiles.json", JSON.stringify(companyProfiles, null, 2));
    dbFolder.file("active_company_id.txt", activeCompanyId);
    dbFolder.file("cloud_files.json", JSON.stringify(cloudFiles, null, 2));
    dbFolder.file("cloud_settings.json", JSON.stringify(cloudSettings, null, 2));
    dbFolder.file("sync_logs.json", JSON.stringify(syncLogs, null, 2));
    dbFolder.file("app_settings.json", JSON.stringify(appSettings, null, 2));

    // 3. Extract & compress base64 images into images/ folder
    if (onProgress) onProgress("Compressing Logos & Signatures...", 60);
    const imgFolder = zip.folder("images");
    let imgCount = 0;

    companyProfiles.forEach((prof, idx) => {
      const pId = prof.id || `profile_${idx}`;
      if (prof.companyLogo && prof.companyLogo.startsWith("data:image")) {
        const base64Data = prof.companyLogo.split(",")[1];
        if (base64Data) imgFolder.file(`logo_${pId}.png`, base64Data, { base64: true });
        imgCount++;
      }
      if (prof.companySeal && prof.companySeal.startsWith("data:image")) {
        const base64Data = prof.companySeal.split(",")[1];
        if (base64Data) imgFolder.file(`seal_${pId}.png`, base64Data, { base64: true });
        imgCount++;
      }
      if (prof.companySignature && prof.companySignature.startsWith("data:image")) {
        const base64Data = prof.companySignature.split(",")[1];
        if (base64Data) imgFolder.file(`signature_${pId}.png`, base64Data, { base64: true });
        imgCount++;
      }
      if (prof.bankDetails?.qrCodeImage && prof.bankDetails.qrCodeImage.startsWith("data:image")) {
        const base64Data = prof.bankDetails.qrCodeImage.split(",")[1];
        if (base64Data) imgFolder.file(`bank_qr_${pId}.png`, base64Data, { base64: true });
        imgCount++;
      }
    });

    if (onProgress) onProgress("Finalizing ZIP Archive...", 85);
    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    if (onProgress) onProgress("Archive Created Successfully", 100);
    return { blob: zipBlob, manifest, fileName: this.formatBackupFileName(nowIso) };
  }

  /** Format backup file name: Backup_2026-08-01_14-30.zip */
  formatBackupFileName(isoString) {
    const d = new Date(isoString || Date.now());
    const datePart = d.toISOString().slice(0, 10);
    const hours = String(d.getHours()).padStart(2, "0");
    const mins = String(d.getMinutes()).padStart(2, "0");
    return `Backup_${datePart}_${hours}-${mins}.zip`;
  }

  /**
   * 2. UPLOAD WORKSPACE ZIP TO GOOGLE DRIVE
   */
  async uploadWorkspaceBackup(onProgress = null) {
    const isConnected = await googleDriveProvider.isConnected();
    if (!isConnected) {
      throw new Error("Google Drive not connected. Please connect Google Drive in Settings.");
    }

    const { blob, fileName } = await this.createWorkspaceZip(onProgress);

    if (onProgress) onProgress("Uploading ZIP to Google Drive...", 90);

    const rootId = await googleDriveProvider.getOrCreateFolder("VisionX QuoteGen Pro", "root");
    const backupsFolderId = await googleDriveProvider.getOrCreateFolder("Workspace Backups", rootId);

    const uploadRes = await googleDriveProvider.upsertFile(backupsFolderId, fileName, blob, "application/zip");

    localDB.logCloudSyncEvent({
      action: "Uploaded",
      fileName,
      details: `Complete Workspace ZIP (${(blob.size / (1024 * 1024)).toFixed(2)} MB) backed up to Google Drive.`
    });

    if (onProgress) onProgress("✓ Workspace Backup Completed!", 100);
    return { ...uploadRes, fileName, size: blob.size };
  }

  /**
   * 3. FETCH AVAILABLE WORKSPACE BACKUPS FROM GOOGLE DRIVE
   */
  async fetchWorkspaceBackupsList() {
    const isConnected = await googleDriveProvider.isConnected();
    if (!isConnected) return [];

    try {
      const rootId = await googleDriveProvider.getOrCreateFolder("VisionX QuoteGen Pro", "root");
      const backupsFolderId = await googleDriveProvider.getOrCreateFolder("Workspace Backups", rootId);

      const query = encodeURIComponent(`'${backupsFolderId}' in parents and trashed=false`);
      const res = await googleDriveProvider.driveApiFetch(
        `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,size,createdTime,modifiedTime,webViewLink)&orderBy=createdTime desc`
      );

      const items = (res.files || []).map((f) => ({
        id: f.id,
        fileName: f.name,
        size: Number(f.size || 0),
        createdTime: f.createdTime || f.modifiedTime,
        driveUrl: f.webViewLink,
        deviceName: f.name.includes("Windows") ? "Windows PC" : f.name.includes("Android") ? "Android Phone" : "Workspace Device",
      }));

      return items;
    } catch (e) {
      console.warn("Error fetching workspace backups list:", e);
      return [];
    }
  }

  /**
   * 4. DOWNLOAD & VALIDATE BACKUP ZIP
   */
  async downloadAndVerifyBackup(driveFileId) {
    const token = await googleDriveProvider.authenticate();
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${driveFileId}?alt=media`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error("Failed to download workspace backup archive from Google Drive.");
    }

    const blob = await res.blob();
    const zip = await JSZip.loadAsync(blob);

    // Verify manifest presence
    const manifestFile = zip.file("manifest.json");
    if (!manifestFile) {
      throw new Error("Unable to restore backup. Invalid ZIP archive (Missing manifest.json).");
    }

    const manifestText = await manifestFile.async("string");
    const manifest = JSON.parse(manifestText);

    // Verify database folder
    const qFile = zip.file("database/quotations.json");
    const pFile = zip.file("database/company_profiles.json");
    if (!qFile || !pFile) {
      throw new Error("Unable to restore backup. Database files missing or corrupted.");
    }

    return { zip, manifest, blob };
  }

  /**
   * 5. RESTORE WORKSPACE FROM ZIP (Mode: "replace" | "merge")
   */
  async restoreWorkspace(driveFileId, mode = "replace", onProgress = null) {
    if (onProgress) onProgress("Downloading Workspace Backup...", 20);
    const { zip, manifest } = await this.downloadAndVerifyBackup(driveFileId);

    if (onProgress) onProgress("Extracting & Validating Archives...", 50);

    const quotationsText = await zip.file("database/quotations.json").async("string");
    const profilesText = await zip.file("database/company_profiles.json").async("string");

    let activeCompanyId = "";
    const activeIdFile = zip.file("database/active_company_id.txt");
    if (activeIdFile) activeCompanyId = await activeIdFile.async("string");

    let cloudFiles = [];
    const cloudFilesZip = zip.file("database/cloud_files.json");
    if (cloudFilesZip) cloudFiles = JSON.parse(await cloudFilesZip.async("string"));

    let cloudSettings = null;
    const cloudSettingsZip = zip.file("database/cloud_settings.json");
    if (cloudSettingsZip) cloudSettings = JSON.parse(await cloudSettingsZip.async("string"));

    let appSettings = null;
    const appSettingsZip = zip.file("database/app_settings.json");
    if (appSettingsZip) appSettings = JSON.parse(await appSettingsZip.async("string"));

    const restoredQuotations = JSON.parse(quotationsText);
    const restoredProfiles = JSON.parse(profilesText);

    if (onProgress) onProgress("Restoring Database & Quotations...", 80);

    if (mode === "replace") {
      // Clear existing local storage
      localStorage.setItem("quotegen_saved_quotations", JSON.stringify(restoredQuotations));
      localStorage.setItem("quotegen_company_profiles_list", JSON.stringify(restoredProfiles));
      if (activeCompanyId) localStorage.setItem("quotegen_active_company_id", activeCompanyId);
      if (cloudFiles.length > 0) localStorage.setItem("quotegen_cloud_files", JSON.stringify(cloudFiles));
      if (cloudSettings) localStorage.setItem("quotegen_cloud_settings", JSON.stringify(cloudSettings));
      if (appSettings?.draft) {
        if (localDB.saveDraft) localDB.saveDraft(appSettings.draft);
        else localStorage.setItem("previewDraft", JSON.stringify(appSettings.draft));
      }
      if (appSettings?.autoSaveDraft) localStorage.setItem("autoSaveDraftEnabled", appSettings.autoSaveDraft);
    } else {
      // MERGE MODE
      const currentQuotations = localDB.getQuotations();
      const currentProfiles = localDB.getCompanyProfiles();

      // Merge quotations by ID
      const mergedQuotationsMap = new Map();
      currentQuotations.forEach(q => mergedQuotationsMap.set(q._id || q.id, q));
      restoredQuotations.forEach(q => mergedQuotationsMap.set(q._id || q.id, q));

      // Merge profiles by ID
      const mergedProfilesMap = new Map();
      currentProfiles.forEach(p => mergedProfilesMap.set(p.id, p));
      restoredProfiles.forEach(p => mergedProfilesMap.set(p.id, p));

      localStorage.setItem("quotegen_saved_quotations", JSON.stringify(Array.from(mergedQuotationsMap.values())));
      localStorage.setItem("quotegen_company_profiles_list", JSON.stringify(Array.from(mergedProfilesMap.values())));
    }

    localDB.logCloudSyncEvent({
      action: "Restored",
      fileName: manifest.deviceName ? `Workspace (${manifest.deviceName})` : "Workspace Backup",
      details: `Workspace restored successfully in ${mode.toUpperCase()} mode.`
    });

    // Fire global events to refresh all open pages
    window.dispatchEvent(new Event("quotationDataUpdated"));
    window.dispatchEvent(new Event("cloudFilesUpdated"));
    window.dispatchEvent(new Event("cloudSettingsUpdated"));

    if (onProgress) onProgress("✓ Workspace Restored Successfully!", 100);
    return { success: true, manifest };
  }
}

export const workspaceBackupProvider = new WorkspaceBackupProvider();
