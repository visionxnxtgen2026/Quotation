import { BaseStorageProvider } from "./storageProvider";
import { localDB } from "./localDB";

/**
 * ☁️ GoogleDriveProvider — Client-Side Google Drive Backup & Sync Engine
 * Uses Google Identity Services (GIS) OAuth 2.0.
 * All user data, PDFs, company settings, and backups are stored directly inside
 * the user's personal Google Drive folder: "VisionX QuoteGen Pro/".
 * No private server storage is used.
 */

const DEFAULT_CLIENT_ID = "282167349922-86tv666uiaglf6mlqp3dq53nrgagrhqs.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile";

const getClientId = () => {
  const clientId = (
    import.meta.env?.VITE_GOOGLE_CLIENT_ID ||
    window.ENV_GOOGLE_CLIENT_ID ||
    localStorage.getItem("gdrive_custom_client_id") ||
    DEFAULT_CLIENT_ID
  )?.trim();

  if (!clientId || clientId.includes("demo")) {
    console.error("[GoogleDrive OAuth Error] Invalid or missing Google Client ID. Check VITE_GOOGLE_CLIENT_ID in .env");
  }

  return clientId;
};

export class GoogleDriveProvider extends BaseStorageProvider {
  constructor() {
    super("GoogleDriveProvider");
    this.accessToken = localStorage.getItem("gdrive_access_token") || null;
    this.tokenExpiry = Number(localStorage.getItem("gdrive_token_expiry")) || 0;
    this.userEmail = localStorage.getItem("gdrive_user_email") || "";
    this.userName = localStorage.getItem("gdrive_user_name") || "";
    this.userPicture = localStorage.getItem("gdrive_user_picture") || "";
    this.lastSync = localStorage.getItem("gdrive_last_sync_time") || null;
    this.autoSyncSetting = localStorage.getItem("gdrive_auto_sync_setting") || "every_save";
  }

  /** Check if currently authenticated with a valid token */
  async isConnected() {
    if (!this.accessToken) return false;
    if (Date.now() >= this.tokenExpiry) {
      this.clearToken();
      return false;
    }
    return true;
  }

  clearToken() {
    this.accessToken = null;
    this.tokenExpiry = 0;
    this.userEmail = "";
    this.userName = "";
    this.userPicture = "";
    localStorage.removeItem("gdrive_access_token");
    localStorage.removeItem("gdrive_token_expiry");
    localStorage.removeItem("gdrive_user_email");
    localStorage.removeItem("gdrive_user_name");
    localStorage.removeItem("gdrive_user_picture");
    localStorage.removeItem("gdrive_connected");
    window.dispatchEvent(new Event("gdriveStatusUpdated"));
  }

  saveToken(token, expiresInSeconds = 3600, email = "", name = "", picture = "") {
    this.accessToken = token;
    this.tokenExpiry = Date.now() + expiresInSeconds * 1000;
    if (email) this.userEmail = email;
    if (name) this.userName = name;
    if (picture) this.userPicture = picture;

    localStorage.setItem("gdrive_access_token", token);
    localStorage.setItem("gdrive_token_expiry", String(this.tokenExpiry));
    if (email) localStorage.setItem("gdrive_user_email", email);
    if (name) localStorage.setItem("gdrive_user_name", name);
    if (picture) localStorage.setItem("gdrive_user_picture", picture);
    localStorage.setItem("gdrive_connected", "true");
    window.dispatchEvent(new Event("gdriveStatusUpdated"));
  }

  /** Authenticate user via Google Identity Services Token Client */
  async authenticate() {
    if (await this.isConnected()) return this.accessToken;

    const clientId = getClientId();
    console.log("--------------------------------------------------");
    console.log("[GoogleDrive OAuth Init] Starting Google OAuth 2.0 Flow...");
    console.log("[GoogleDrive OAuth Init] Current Origin:", window.location.origin);
    console.log("[GoogleDrive OAuth Init] Loaded Client ID:", clientId);
    console.log("--------------------------------------------------");

    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.oauth2) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: SCOPES,
          callback: async (response) => {
            if (response.error) {
              console.error("[GoogleDrive OAuth Error Details]:", {
                clientId,
                origin: window.location.origin,
                error: response.error,
                details: response
              });
              const msg = response.error === "popup_closed_by_user"
                ? "Google OAuth popup closed before completion."
                : response.error === "access_denied"
                ? "Permission denied by user."
                : response.error === "invalid_client"
                ? `Error 401 (invalid_client): OAuth Client ID (${clientId}) not recognized for origin ${window.location.origin}. Please verify Authorized JavaScript Origins in Google Cloud Console.`
                : `Google Authentication failed: ${response.error}`;
              reject(new Error(msg));
              return;
            }

            if (response.access_token) {
              const token = response.access_token;
              console.log("[GoogleDrive OAuth Success] Access token received successfully!");

              // Fetch user info (email & name)
              let userEmail = "";
              let userName = "";
              let userPicture = "";
              try {
                const infoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
                  headers: { Authorization: `Bearer ${token}` }
                });
                if (infoRes.ok) {
                  const info = await infoRes.json();
                  userEmail = info.email || "";
                  userName = info.name || "";
                  userPicture = info.picture || "";
                  console.log("[GoogleDrive OAuth Success] Connected User:", userEmail);
                }
              } catch (e) {
                console.warn("[GoogleDrive] Userinfo fetch notice:", e);
              }

              this.saveToken(token, response.expires_in || 3600, userEmail, userName, userPicture);
              
              // Automatically trigger Auto-Restore on initial connection
              try {
                await this.autoRestore();
              } catch (restoreErr) {
                console.warn("[GoogleDrive] Auto-restore notice:", restoreErr);
              }

              resolve(token);
            } else {
              reject(new Error("No access token returned from Google"));
            }
          },
          onerror: (err) => {
            console.error("[GoogleDrive OAuth Script Error]:", err);
            reject(err);
          },
        });
        client.requestAccessToken();
      } else {
        const manualToken = prompt(
          "Enter your Google OAuth Access Token (or ensure Google GIS script is enabled):"
        );
        if (manualToken && manualToken.trim()) {
          this.saveToken(manualToken.trim());
          resolve(manualToken.trim());
        } else {
          reject(new Error("Google Identity Services script not loaded. Please check your internet connection."));
        }
      }
    });
  }


  /** Disconnect Google Drive account without deleting files */
  async disconnect() {
    if (this.accessToken && window.google?.accounts?.oauth2) {
      try {
        window.google.accounts.oauth2.revoke(this.accessToken, () => {});
      } catch (e) { }
    }
    this.clearToken();
  }

  /** Authorized API fetch wrapper */
  async driveApiFetch(url, options = {}) {
    const token = await this.authenticate();
    const headers = {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    };

    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      this.clearToken();
      throw new Error("Google Drive authorization expired. Please reconnect.");
    }
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Google Drive API error (${res.status}): ${errText}`);
    }
    return res.json();
  }

  /** Get or create a folder by name inside parentId */
  async getOrCreateFolder(folderName, parentId = "root") {
    const query = encodeURIComponent(
      `name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
    );
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`;
    
    const searchRes = await this.driveApiFetch(searchUrl);
    if (searchRes.files && searchRes.files.length > 0) {
      return searchRes.files[0].id;
    }

    // Create Folder
    const token = await this.authenticate();
    const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentId],
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      throw new Error(`Failed to create folder ${folderName}: ${err}`);
    }

    const created = await createRes.json();
    return created.id;
  }

  /**
   * Resolves the required folder structure:
   * VisionX QuoteGen Pro/
   * ├── Quotations/
   * ├── PDFs/
   * ├── Company/
   * ├── Drafts/
   * ├── Templates/
   * └── Backups/
   */
  async getFolderStructure() {
    const rootId = await this.getOrCreateFolder("VisionX QuoteGen Pro", "root");
    
    const [quotationsId, pdfsId, companyId, draftsId, templatesId, backupsId] = await Promise.all([
      this.getOrCreateFolder("Quotations", rootId),
      this.getOrCreateFolder("PDFs", rootId),
      this.getOrCreateFolder("Company", rootId),
      this.getOrCreateFolder("Drafts", rootId),
      this.getOrCreateFolder("Templates", rootId),
      this.getOrCreateFolder("Backups", rootId),
    ]);

    return {
      rootId,
      quotationsId,
      pdfsId,
      companyId,
      draftsId,
      templatesId,
      backupsId,
    };
  }

  /** Upserts a text/json or image file inside a folder */
  async upsertFile(folderId, fileName, content, mimeType = "application/json") {
    const token = await this.authenticate();

    // Check if file already exists in folder
    const query = encodeURIComponent(`name='${fileName}' and '${folderId}' in parents and trashed=false`);
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`;
    const searchRes = await this.driveApiFetch(searchUrl);
    const existingId = searchRes.files && searchRes.files.length > 0 ? searchRes.files[0].id : null;

    const boundary = "-------314159265358979323846";
    const delimiter = "\r\n--" + boundary + "\r\n";
    const closeDelimiter = "\r\n--" + boundary + "--";

    let bodyBlob;
    if (typeof content === "string" && mimeType === "application/json") {
      bodyBlob = new Blob([content], { type: "application/json" });
    } else if (content instanceof Blob) {
      bodyBlob = content;
    } else if (typeof content === "string" && content.startsWith("data:")) {
      // Base64 data URL
      const base64Data = content.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      bodyBlob = new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
    } else {
      bodyBlob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
    }

    const metadata = {
      name: fileName,
      mimeType,
      ...(existingId ? {} : { parents: [folderId] }),
    };

    const metadataPart = delimiter + "Content-Type: application/json; charset=UTF-8\r\n\r\n" + JSON.stringify(metadata);
    const mediaPartHeader = delimiter + `Content-Type: ${mimeType}\r\n\r\n`;
    const multipartRequestBody = new Blob([metadataPart, mediaPartHeader, bodyBlob, closeDelimiter], {
      type: `multipart/related; boundary=${boundary}`,
    });

    const endpoint = existingId
      ? `https://www.googleapis.com/upload/drive/v3/files/${existingId}?uploadType=multipart&fields=id,name,webViewLink,webContentLink`
      : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink`;

    const uploadRes = await fetch(endpoint, {
      method: existingId ? "PATCH" : "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      throw new Error(`Google Drive upload file failed (${fileName}): ${err}`);
    }

    const resFile = await uploadRes.json();
    return {
      fileId: resFile.id,
      driveUrl: resFile.webViewLink || `https://drive.google.com/file/d/${resFile.id}/view`,
      downloadUrl: resFile.webContentLink,
      fileName,
    };
  }

  /** Uploads PDF Blob into PDFs folder */
  async uploadPdf({ fileName, pdfBlob, visibility = null, allowedEmails = [], quotationId = null, customerName = "", refNo = "" }) {
    const folders = await this.getFolderStructure();
    const settings = localDB.getCloudSettings();
    const vis = visibility || settings.defaultVisibility || "public";
    const emails = Array.isArray(allowedEmails) && allowedEmails.length > 0 ? allowedEmails : (settings.allowedEmails || []);

    const result = await this.upsertFile(folders.pdfsId, fileName, pdfBlob, "application/pdf");
    
    // Set Drive file visibility / permissions
    if (result.fileId) {
      await this.setFileVisibility(result.fileId, vis, emails).catch(err => {
        console.warn("[GoogleDrive Permission Notice]:", err);
      });
    }

    // Save CloudFiles local metadata record
    const blobSize = pdfBlob instanceof Blob ? pdfBlob.size : typeof pdfBlob === "string" ? Math.round(pdfBlob.length * 0.75) : 0;
    localDB.saveCloudFile({
      driveFileId: result.fileId,
      quotationId: quotationId || null,
      fileName,
      mimeType: "application/pdf",
      folderName: "PDFs",
      size: blobSize,
      visibility: vis,
      shareUrl: result.driveUrl,
      ownerEmail: this.userEmail || localStorage.getItem("gdrive_user_email") || "user@visionx.com",
      allowedEmails: emails,
      customerName,
      quotationNumber: refNo,
    });

    return result;
  }

  /** Set file permissions: public (anyone reader) vs private (specific allowed emails) */
  async setFileVisibility(fileId, visibility = "public", allowedEmails = []) {
    const token = await this.authenticate();
    
    if (visibility === "public") {
      try {
        await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: "reader",
            type: "anyone",
          }),
        });

        // Get updated share URL
        const fileInfo = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,webViewLink,webContentLink`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json());

        return {
          success: true,
          shareUrl: fileInfo.webViewLink || `https://drive.google.com/file/d/${fileId}/view`,
        };
      } catch (e) {
        console.warn("[GoogleDrive] Public permission notice:", e);
        return { success: false, shareUrl: `https://drive.google.com/file/d/${fileId}/view` };
      }
    } else if (visibility === "private") {
      try {
        // List existing permissions to revoke 'anyone' public link access
        const permRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (permRes.ok) {
          const permData = await permRes.json();
          if (permData.permissions) {
            for (const p of permData.permissions) {
              if (p.type === "anyone") {
                await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions/${p.id}`, {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${token}` }
                }).catch(() => {});
              }
            }
          }
        }

        // Grant access to allowed emails
        if (Array.isArray(allowedEmails) && allowedEmails.length > 0) {
          for (const email of allowedEmails) {
            if (!email || !email.includes("@")) continue;
            try {
              await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  role: "reader",
                  type: "user",
                  emailAddress: email.trim(),
                }),
              });
            } catch (e) {
              console.warn(`[GoogleDrive] Private permission notice for ${email}:`, e);
            }
          }
        }

        return { success: true, shareUrl: null };
      } catch (e) {
        console.warn("[GoogleDrive] Private permission notice:", e);
        return { success: false, shareUrl: null };
      }
    }
  }

  /** Move file to trash on Google Drive */
  async deleteDriveFile(fileId) {
    if (!fileId) return false;
    const token = await this.authenticate();
    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ trashed: true }),
      });
      return res.ok;
    } catch (e) {
      console.warn("[GoogleDrive Delete File Notice]:", e);
      return false;
    }
  }

  /** Restore file from trash on Google Drive */
  async restoreDriveFile(fileId) {
    if (!fileId) return false;
    const token = await this.authenticate();
    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ trashed: false }),
      });
      return res.ok;
    } catch (e) {
      console.warn("[GoogleDrive Restore File Notice]:", e);
      return false;
    }
  }

  /** Rename file on Google Drive */
  async renameDriveFile(fileId, newName) {
    if (!fileId || !newName) return false;
    const token = await this.authenticate();
    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newName }),
      });
      return res.ok;
    } catch (e) {
      console.warn("[GoogleDrive Rename File Notice]:", e);
      return false;
    }
  }

  /** Uploads single Quotation JSON into Quotations folder */
  async uploadQuotation(quotationData) {
    const folders = await this.getFolderStructure();
    const refNo = quotationData.quotationNo || quotationData.projectDetails?.referenceNo || quotationData._id || `QTN-${Date.now()}`;
    const fileName = `${refNo}.json`;
    return this.upsertFile(folders.quotationsId, fileName, JSON.stringify(quotationData, null, 2), "application/json");
  }

  /** Uploads Company Profile & Settings files into Company folder */
  async uploadCompanyProfile() {
    const folders = await this.getFolderStructure();
    const profile = localDB.getCompanyProfile();

    await Promise.all([
      this.upsertFile(folders.companyId, "settings.json", JSON.stringify(profile, null, 2)),
      this.upsertFile(folders.companyId, "bank.json", JSON.stringify(profile.bankDetails || {}, null, 2)),
      this.upsertFile(folders.companyId, "payment_terms.json", JSON.stringify(profile.paymentTerms || {}, null, 2)),
      this.upsertFile(folders.companyId, "terms.json", JSON.stringify({
        defaultTerms: profile.defaultTerms || "",
        defaultNotes: profile.defaultNotes || "",
        defaultExclusions: profile.defaultExclusions || "",
        defaultWarranty: profile.defaultWarranty || "",
        validity: profile.defaultValidity || ""
      }, null, 2)),
    ]);

    if (profile.companyLogo && profile.companyLogo.startsWith("data:")) {
      await this.upsertFile(folders.companyId, "logo.png", profile.companyLogo, "image/png");
    }
  }

  /** Uploads active draft to Drafts folder */
  async uploadDraft(draftData) {
    if (!draftData) return null;
    const folders = await this.getFolderStructure();
    return this.upsertFile(folders.draftsId, "draft.json", JSON.stringify(draftData, null, 2));
  }

  /** Perform full immediate Backup Now */
  async backupAllNow(onProgress = null) {
    if (onProgress) onProgress("Initializing Cloud Backup...", 10);
    const folders = await this.getFolderStructure();

    if (onProgress) onProgress("Backing up Company Profile & Settings...", 30);
    await this.uploadCompanyProfile();

    if (onProgress) onProgress("Backing up Local Quotations...", 60);
    const quotations = localDB.getQuotations();
    for (let i = 0; i < quotations.length; i++) {
      await this.uploadQuotation(quotations[i]);
    }

    if (onProgress) onProgress("Backing up Active Drafts & Templates...", 85);
    const draft = localStorage.getItem("previewDraft");
    if (draft) {
      try {
        await this.uploadDraft(JSON.parse(draft));
      } catch (e) { }
    }

    const backupPayload = {
      app: "QuoteGen Pro",
      version: "2.0-cloud",
      exportedAt: new Date().toISOString(),
      companyProfile: localDB.getCompanyProfile(),
      quotations: localDB.getQuotations(),
      draft: localStorage.getItem("previewDraft") ? JSON.parse(localStorage.getItem("previewDraft")) : null,
    };
    await this.upsertFile(folders.backupsId, "quotegen_pro_backup.json", JSON.stringify(backupPayload, null, 2));

    const nowIso = new Date().toISOString();
    this.lastSync = nowIso;
    localStorage.setItem("gdrive_last_sync_time", nowIso);
    window.dispatchEvent(new Event("gdriveStatusUpdated"));

    if (onProgress) onProgress("✓ Full Backup Completed Successfully!", 100);
    return { success: true, count: quotations.length };
  }

  /** Fetch Remote Quotations List from Google Drive for Restore Screen */
  async fetchRemoteQuotationsList() {
    const token = await this.authenticate();
    const folders = await this.getFolderStructure();

    const query = encodeURIComponent(`'${folders.quotationsId}' in parents and trashed=false`);
    const res = await this.driveApiFetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,createdTime,modifiedTime,webViewLink)`);

    const items = [];
    if (res.files && res.files.length > 0) {
      for (const f of res.files) {
        try {
          const contentRes = await fetch(`https://www.googleapis.com/drive/v3/files/${f.id}?alt=media`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (contentRes.ok) {
            const qData = await contentRes.json();
            items.push({
              fileId: f.id,
              quotationNo: qData.quotationNo || qData.projectDetails?.referenceNo || f.name.replace(".json", ""),
              clientName: qData.clientName || qData.projectDetails?.clientName || "Client",
              projectName: qData.projectDetails?.projectName || qData.projectName || "Project",
              updatedAt: qData.updatedAt || f.modifiedTime || f.createdTime,
              data: qData,
              driveUrl: f.webViewLink,
            });
          }
        } catch (readErr) {
          console.warn("[GoogleDrive] Error parsing remote quotation file:", readErr);
        }
      }
    }

    return items;
  }

  /** Performs full bidirectional Sync (Upload Local + Fetch & Merge Remote) */
  async syncNow(onProgress = null) {
    if (onProgress) onProgress("Connecting to Google Drive...", 10);
    const token = await this.authenticate();
    const folders = await this.getFolderStructure();

    // 1. Upload Company Profile & Settings
    if (onProgress) onProgress("Syncing Company Settings...", 30);
    await this.uploadCompanyProfile();

    // 2. Upload Local Quotations
    if (onProgress) onProgress("Syncing Quotation History...", 60);
    const quotations = localDB.getQuotations();
    for (const q of quotations) {
      await this.uploadQuotation(q);
    }

    // 3. Upload Active Draft
    const draft = localStorage.getItem("previewDraft");
    if (draft) {
      try {
        await this.uploadDraft(JSON.parse(draft));
      } catch (e) { }
    }

    // 4. Upload Complete Weekly Backup JSON
    if (onProgress) onProgress("Creating Weekly Cloud Backup...", 80);
    const backupPayload = {
      app: "QuoteGen Pro",
      version: "2.0-cloud",
      exportedAt: new Date().toISOString(),
      companyProfile: localDB.getCompanyProfile(),
      quotations: localDB.getQuotations(),
      draft: localStorage.getItem("previewDraft") ? JSON.parse(localStorage.getItem("previewDraft")) : null,
    };
    await this.upsertFile(folders.backupsId, "quotegen_pro_backup.json", JSON.stringify(backupPayload, null, 2));

    // 5. Fetch Remote Quotations & Merge
    if (onProgress) onProgress("Checking for remote updates...", 90);
    const listQuery = encodeURIComponent(`'${folders.quotationsId}' in parents and trashed=false`);
    const remoteRes = await this.driveApiFetch(`https://www.googleapis.com/drive/v3/files?q=${listQuery}&fields=files(id,name)`);
    
    let restoredCount = 0;
    if (remoteRes.files && remoteRes.files.length > 0) {
      for (const remoteFile of remoteRes.files) {
        try {
          const fileContentRes = await fetch(`https://www.googleapis.com/drive/v3/files/${remoteFile.id}?alt=media`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (fileContentRes.ok) {
            const remoteQuote = await fileContentRes.json();
            if (remoteQuote && (remoteQuote._id || remoteQuote.id || remoteQuote.quotationNo)) {
              localDB.saveQuotation(remoteQuote);
              restoredCount++;
            }
          }
        } catch (readErr) {
          console.warn("[GoogleDrive] Remote file fetch notice:", readErr);
        }
      }
    }

    const nowIso = new Date().toISOString();
    this.lastSync = nowIso;
    localStorage.setItem("gdrive_last_sync_time", nowIso);
    window.dispatchEvent(new Event("gdriveStatusUpdated"));
    window.dispatchEvent(new Event("quotationDataUpdated"));

    if (onProgress) onProgress("✓ Cloud Sync Completed", 100);
    return { success: true, lastSync: nowIso, syncedCount: quotations.length + restoredCount };
  }

  /** Auto-Restores Cloud Data when connecting on a new device */
  async autoRestore(onProgress = null) {
    if (onProgress) onProgress("Searching for Google Drive backup...", 10);
    const token = await this.authenticate();
    const folders = await this.getFolderStructure();

    // Restore Company Settings
    try {
      const settingsQuery = encodeURIComponent(`name='settings.json' and '${folders.companyId}' in parents and trashed=false`);
      const settingsSearch = await this.driveApiFetch(`https://www.googleapis.com/drive/v3/files?q=${settingsQuery}&fields=files(id,name)`);
      if (settingsSearch.files && settingsSearch.files.length > 0) {
        const fileId = settingsSearch.files[0].id;
        const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const profile = await res.json();
          localDB.saveCompanyProfile(profile);
        }
      }
    } catch (e) {
      console.warn("[GoogleDrive] Auto-restore settings notice:", e);
    }

    // Restore Remote Quotations
    try {
      const qQuery = encodeURIComponent(`'${folders.quotationsId}' in parents and trashed=false`);
      const qSearch = await this.driveApiFetch(`https://www.googleapis.com/drive/v3/files?q=${qQuery}&fields=files(id,name)`);
      if (qSearch.files && qSearch.files.length > 0) {
        for (const f of qSearch.files) {
          const res = await fetch(`https://www.googleapis.com/drive/v3/files/${f.id}?alt=media`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const qData = await res.json();
            localDB.saveQuotation(qData);
          }
        }
      }
    } catch (e) {
      console.warn("[GoogleDrive] Auto-restore quotations notice:", e);
    }

    const nowIso = new Date().toISOString();
    this.lastSync = nowIso;
    localStorage.setItem("gdrive_last_sync_time", nowIso);
    window.dispatchEvent(new Event("gdriveStatusUpdated"));
    window.dispatchEvent(new Event("quotationDataUpdated"));
  }
}

export const googleDriveProvider = new GoogleDriveProvider();

/** Helper function to trigger background auto-sync based on user preferences */
export async function triggerAutoSync(triggerEvent = "save", payload = null) {
  try {
    const isConnected = await googleDriveProvider.isConnected();
    if (!isConnected) return;

    const setting = localStorage.getItem("gdrive_auto_sync_setting") || "every_save";
    if (setting === "never") return;

    if (
      setting === "realtime" ||
      (setting === "every_save" && triggerEvent === "save") ||
      (setting === "every_export" && triggerEvent === "export")
    ) {
      if (triggerEvent === "export" && payload?.fileName && payload?.pdfBlob) {
        await googleDriveProvider.uploadPdf(payload);
      } else if (triggerEvent === "save" && payload) {
        await googleDriveProvider.uploadQuotation(payload);
        await googleDriveProvider.uploadCompanyProfile();
      } else {
        await googleDriveProvider.syncNow();
      }
    }
  } catch (err) {
    console.warn("[GoogleDrive AutoSync Notice]:", err);
  }
}
