import { BaseStorageProvider } from "./storageProvider";
import { localDB } from "./localDB";
import { Browser } from "@capacitor/browser";
import { App } from "@capacitor/app";

/**
 * ☁️ GoogleDriveProvider — Client-Side Google Drive Backup & Sync Engine
 * Uses Google Identity Services (GIS) OAuth 2.0.
 * All user data, PDFs, company settings, and backups are stored directly inside
 * the user's personal Google Drive folder: "VisionX QuoteGen Pro/".
 * No private server storage is used.
 */

const WEB_CLIENT_ID = "282167349922-86tv666uiaglf6mlqp3dq53nrgagrhqs.apps.googleusercontent.com";
const ANDROID_CLIENT_ID = "282167349922-3fi0sjaripsms762kglgvf1t1b83ou3g.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile";

const getClientId = (isNative = false) => {
  if (isNative) {
    return (
      import.meta.env?.VITE_GOOGLE_ANDROID_CLIENT_ID ||
      window.ENV_GOOGLE_ANDROID_CLIENT_ID ||
      localStorage.getItem("gdrive_android_client_id") ||
      ANDROID_CLIENT_ID
    )?.trim();
  }

  return (
    import.meta.env?.VITE_GOOGLE_CLIENT_ID ||
    window.ENV_GOOGLE_CLIENT_ID ||
    localStorage.getItem("gdrive_custom_client_id") ||
    WEB_CLIENT_ID
  )?.trim();
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
    this.deviceId = localStorage.getItem("gdrive_device_id") || `Device_${Math.random().toString(36).substring(2, 8)}`;
    localStorage.setItem("gdrive_device_id", this.deviceId);
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

  /** Check if running inside Capacitor Android / iOS Native WebView */
  isNativePlatform() {
    return (
      typeof window !== "undefined" &&
      window.Capacitor &&
      typeof window.Capacitor.isNativePlatform === "function" &&
      window.Capacitor.isNativePlatform()
    );
  }

  /** Main Router method for Platform Authentication */
  async authenticate() {
    if (await this.isConnected()) return this.accessToken;

    if (this.isNativePlatform()) {
      return await this.authenticateNative();
    } else {
      return await this.authenticateWeb();
    }
  }

  /** 🌐 WEB BROWSER: Google Identity Services (GIS) Flow */
  async authenticateWeb() {
    const clientId = getClientId(false); // Web Client ID

    return new Promise((resolve, reject) => {
      if (!window.google?.accounts?.oauth2) {
        reject(new Error("Google Identity Services SDK (gsi/client) is not loaded in window. Check internet connection."));
        return;
      }

      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: async (response) => {
          if (response.error) {
            const msg = response.error === "popup_closed_by_user"
              ? "Google OAuth popup closed before completion."
              : response.error === "access_denied"
                ? "Permission denied by user."
                : `Google Authentication failed: ${response.error}`;
            reject(new Error(msg));
            return;
          }

          if (response.access_token) {
            const token = response.access_token;
            await this.handleSuccessfulAuthToken(token, response.expires_in || 3600);
            resolve(token);
          }
        },
      });
      client.requestAccessToken();
    });
  }

  /** 📱 CAPACITOR NATIVE (Android / iOS): Native Custom Scheme Deep Link OAuth Flow */
  async authenticateNative() {
    const clientId = getClientId(true); // Android Client ID: 282167349922-3fi0sjaripsms762kglgvf1t1b83ou3g.apps.googleusercontent.com

    // Custom App Deep Link Scheme URI for Android APK (matches AndroidManifest / appId)
    const customSchemeUri = "com.visionx.quotegenpro://oauth2redirect";

    const rawRedirectUri = (
      import.meta.env?.VITE_ANDROID_OAUTH_REDIRECT_URI ||
      window.ENV_ANDROID_OAUTH_REDIRECT_URI ||
      localStorage.getItem("gdrive_android_redirect_uri") ||
      customSchemeUri
    )?.trim();

    console.log(`[Android OAuth Debug] Native Platform | Client ID: ${clientId} | redirect_uri: "${rawRedirectUri}"`);

    // 1. Check if Capacitor GoogleAuth plugin is available
    if (window.Capacitor?.Plugins?.GoogleAuth) {
      try {
        const GoogleAuth = window.Capacitor.Plugins.GoogleAuth;
        if (typeof GoogleAuth.initialize === "function") {
          await GoogleAuth.initialize({
            clientId: clientId,
            scopes: ["https://www.googleapis.com/auth/drive.file", "profile", "email"],
            grantOfflineAccess: true,
          });
        }
        const googleUser = await GoogleAuth.signIn();
        const token = googleUser.authentication?.accessToken || googleUser.accessToken;
        if (token) {
          await this.handleSuccessfulAuthToken(token, 3600, googleUser.email, googleUser.givenName || googleUser.name, googleUser.imageUrl);
          return token;
        }
      } catch (err) {
        console.warn("[Capacitor GoogleAuth Plugin Notice]:", err);
      }
    }

    // 2. Native OAuth Browser Redirect / Deep Link Fallback Flow
    return new Promise((resolve, reject) => {
      const redirectUri = rawRedirectUri;
      console.log(`[Android OAuth Debug] Launching Google OAuth with redirect_uri: "${redirectUri}"`);

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(clientId)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=token&` +
        `scope=${encodeURIComponent(SCOPES)}&` +
        `include_granted_scopes=true&` +
        `prompt=consent`;

      let unbindUrlListener = null;

      const cleanup = () => {
        if (unbindUrlListener && typeof unbindUrlListener.remove === "function") {
          unbindUrlListener.remove();
        }
        window.removeEventListener("capacitorAppUrlOpen", handleCustomEvent);
      };

      const handleUrl = async (urlStr) => {
        if (!urlStr) return;
        console.log(`[Android OAuth Debug] App Deep Link callback URL received: ${urlStr}`);

        // Automatically close Capacitor Browser window upon callback
        if (window.Capacitor?.Plugins?.Browser?.close) {
          try {
            await window.Capacitor.Plugins.Browser.close();
          } catch (e) {}
        }

        if (urlStr.includes("access_token=") || urlStr.includes("code=")) {
          cleanup();
          try {
            const queryString = urlStr.includes("#") ? urlStr.split("#")[1] : urlStr.split("?")[1] || "";
            const params = new URLSearchParams(queryString);
            const token = params.get("access_token");
            const expiresIn = Number(params.get("expires_in")) || 3600;

            if (token) {
              await this.handleSuccessfulAuthToken(token, expiresIn);
              resolve(token);
              return;
            }
          } catch (e) {
            reject(new Error(`Failed to parse native OAuth response: ${e.message}`));
          }
        }
      };

      const handleCustomEvent = (e) => {
        if (e.detail) handleUrl(e.detail);
      };

      window.addEventListener("capacitorAppUrlOpen", handleCustomEvent);

      if (window.Capacitor?.Plugins?.App?.addListener) {
        window.Capacitor.Plugins.App.addListener("appUrlOpen", (data) => {
          handleUrl(data.url);
        }).then(listener => {
          unbindUrlListener = listener;
        });
      }

      if (window.Capacitor?.Plugins?.Browser?.open) {
        window.Capacitor.Plugins.Browser.open({ url: authUrl });
      } else {
        window.location.href = authUrl;
      }

      setTimeout(() => {
        cleanup();
        reject(new Error(`Native Google Authentication timed out. Register "${redirectUri}" in Google Cloud Console and ensure Android custom URL scheme is configured.`));
      }, 120000);
    });
  }

  /** Helper to store user info & setup Google Drive folders */
  async handleSuccessfulAuthToken(token, expiresIn = 3600, email = "", name = "", picture = "") {
    try {
      if (!email) {
        const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userRes.ok) {
          const userInfo = await userRes.json();
          this.saveToken(token, expiresIn, userInfo.email, userInfo.name, userInfo.picture);
        } else {
          this.saveToken(token, expiresIn);
        }
      } else {
        this.saveToken(token, expiresIn, email, name, picture);
      }

      await this.getFolderStructure().catch(() => {});
    } catch (err) {
      this.saveToken(token, expiresIn);
    }
  }

  /** Disconnect Google Drive */
  async disconnect() {
    this.clearToken();
  }

  /** Internal helper for Google Drive API v3 requests */
  async driveApiFetch(url, options = {}) {
    const token = await this.authenticate();
    const res = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        this.clearToken();
        throw new Error("Google Drive authorization expired. Please sign in again.");
      }
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
   * Resolves the required enterprise folder structure:
   * VisionX QuoteGen Pro/
   * ├── Company Profiles/
   * │   └── <CompanyName>/
   * ├── Quotations/
   * │   └── <Year>/<Month>/
   * ├── Database/
   * ├── Backups/
   * └── Assets/
   */
  async getFolderStructure() {
    const rootId = await this.getOrCreateFolder("VisionX QuoteGen Pro", "root");

    const [companyProfilesId, quotationsId, databaseId, backupsId, assetsId] = await Promise.all([
      this.getOrCreateFolder("Company Profiles", rootId),
      this.getOrCreateFolder("Quotations", rootId),
      this.getOrCreateFolder("Database", rootId),
      this.getOrCreateFolder("Backups", rootId),
      this.getOrCreateFolder("Assets", rootId),
    ]);

    return {
      rootId,
      companyProfilesId,
      quotationsId,
      databaseId,
      backupsId,
      assetsId,
    };
  }

  /** Get nested Quotation Year/Month folder */
  async getQuotationMonthFolder(yearStr = "2026", monthStr = "August") {
    const folders = await this.getFolderStructure();
    const yearFolderId = await this.getOrCreateFolder(yearStr, folders.quotationsId);
    const monthFolderId = await this.getOrCreateFolder(monthStr, yearFolderId);
    return monthFolderId;
  }

  /** Get nested Company Profile folder */
  async getCompanyProfileFolder(companyName = "DefaultCompany") {
    const folders = await this.getFolderStructure();
    const safeName = companyName.replace(/[^a-zA-Z0-9_-]/g, "_");
    return await this.getOrCreateFolder(safeName, folders.companyProfilesId);
  }

  /** Conflict Handling: Creates `<FileName> (Device 2)` conflict copy if file changed concurrently */
  async upsertFileWithConflictHandling(folderId, fileName, content, mimeType = "application/json", isConflictCheck = true) {
    const token = await this.authenticate();

    // Check if file exists in folder
    const query = encodeURIComponent(`name='${fileName}' and '${folderId}' in parents and trashed=false`);
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,description)`;
    const searchRes = await this.driveApiFetch(searchUrl);
    const existingFile = searchRes.files && searchRes.files.length > 0 ? searchRes.files[0] : null;

    let targetFileName = fileName;
    let existingId = existingFile ? existingFile.id : null;

    // Check for multi-device conflict
    if (isConflictCheck && existingFile && existingFile.description && !existingFile.description.includes(this.deviceId)) {
      // Different device updated this file -> Create Conflict Copy
      const ext = fileName.includes(".") ? fileName.substring(fileName.lastIndexOf(".")) : "";
      const base = fileName.includes(".") ? fileName.substring(0, fileName.lastIndexOf(".")) : fileName;
      targetFileName = `${base} (Device 2)${ext}`;
      existingId = null; // Create new separate file for conflict copy

      window.dispatchEvent(
        new CustomEvent("quotationConflictDetected", {
          detail: { originalFile: fileName, conflictFile: targetFileName },
        })
      );
    }

    const boundary = "-------314159265358979323846";
    const delimiter = "\r\n--" + boundary + "\r\n";
    const closeDelimiter = "\r\n--" + boundary + "--";

    let bodyBlob;
    if (typeof content === "string" && mimeType === "application/json") {
      bodyBlob = new Blob([content], { type: "application/json" });
    } else if (content instanceof Blob) {
      bodyBlob = content;
    } else if (typeof content === "string" && content.startsWith("data:")) {
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
      name: targetFileName,
      mimeType,
      description: `Device: ${this.deviceId} • LastSync: ${new Date().toISOString()}`,
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
      throw new Error(`Google Drive upload file failed (${targetFileName}): ${err}`);
    }

    const resFile = await uploadRes.json();
    const nowIso = new Date().toISOString();
    localStorage.setItem("gdrive_last_sync_time", nowIso);
    this.lastSync = nowIso;
    window.dispatchEvent(new Event("gdriveStatusUpdated"));

    return {
      fileId: resFile.id,
      driveUrl: resFile.webViewLink || `https://drive.google.com/file/d/${resFile.id}/view`,
      downloadUrl: resFile.webContentLink,
      fileName: targetFileName,
    };
  }

  /** Uploads PDF, DOCX, or XLSX file into structured Year/Month folder */
  async uploadQuotationDocument({ fileName, fileBlob, mimeType = "application/pdf", quotationId = null, customerName = "", refNo = "" }) {
    const dateObj = new Date();
    const yearStr = String(dateObj.getFullYear());
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthStr = monthNames[dateObj.getMonth()];

    const monthFolderId = await this.getQuotationMonthFolder(yearStr, monthStr);
    const result = await this.upsertFileWithConflictHandling(monthFolderId, fileName, fileBlob, mimeType);

    const blobSize = fileBlob instanceof Blob ? fileBlob.size : 0;
    localDB.saveCloudFile({
      driveFileId: result.fileId,
      quotationId: quotationId || null,
      fileName: result.fileName,
      mimeType,
      folderName: `Quotations/${yearStr}/${monthStr}`,
      size: blobSize,
      visibility: "public",
      shareUrl: result.driveUrl,
      ownerEmail: this.userEmail || localStorage.getItem("gdrive_user_email") || "user@VisionX.com",
      allowedEmails: [],
      customerName,
      quotationNumber: refNo,
    });

    return result;
  }

  /** Make file public (Anyone with link -> Viewer) */
  async makeFilePublic(fileId) {
    try {
      const token = await this.authenticate();
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
    } catch (e) {
      console.warn("Set drive file public warning:", e);
    }
    return `https://drive.google.com/file/d/${fileId}/view`;
  }

  /** Invite user to Drive file */
  async inviteUserToFile(fileId, email, role = "Viewer") {
    try {
      const token = await this.authenticate();
      const driveRole = role === "Editor" ? "writer" : role === "Commenter" ? "commenter" : "reader";
      await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions?sendNotificationEmail=true`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: driveRole,
          type: "user",
          emailAddress: email,
        }),
      });
    } catch (e) {
      console.warn("Add drive permission user warning:", e);
    }
    return true;
  }

  /** Legacy helper fallback */
  async uploadPdf(opts) {
    return await this.uploadQuotationDocument({
      fileName: opts.fileName,
      fileBlob: opts.pdfBlob,
      mimeType: "application/pdf",
      quotationId: opts.quotationId,
      customerName: opts.customerName,
      refNo: opts.refNo,
    });
  }

  /** Auto-sync trigger for quotation or company profile updates */
  async triggerAutoSync(triggerType, data = {}) {
    if (!await this.isConnected()) return;
    try {
      const folders = await this.getFolderStructure();

      if (triggerType === "company_profile" || triggerType === "company_profile_update") {
        const companyName = data.companyName || "DefaultCompany";
        const companyFolderId = await this.getCompanyProfileFolder(companyName);

        if (data.logo) {
          await this.upsertFileWithConflictHandling(companyFolderId, "Logo.png", data.logo, "image/png", false);
        }
        if (data.signature) {
          await this.upsertFileWithConflictHandling(companyFolderId, "Signature.png", data.signature, "image/png", false);
        }
        await this.upsertFileWithConflictHandling(companyFolderId, "Settings.json", JSON.stringify(data, null, 2), "application/json", false);
      } else {
        // Sync entire database snapshot
        const allQuotations = localDB.getQuotations();
        const allProfiles = localDB.getCompanyProfiles();
        const dbSnapshot = {
          version: "2.0 Enterprise",
          lastSync: new Date().toISOString(),
          quotations: allQuotations,
          profiles: allProfiles,
        };

        await this.upsertFileWithConflictHandling(folders.databaseId, "quotation.db.json", JSON.stringify(dbSnapshot, null, 2), "application/json", false);
      }
    } catch (err) {
      console.warn("[Background Auto-Sync Notice]:", err);
    }
  }

  /** Execute full workspace synchronization */
  async syncNow() {
    return await this.triggerAutoSync("manual_full_sync");
  }

  /**
   * Permanently delete a file from Google Drive using its unique Google Drive File ID.
   * DELETE https://www.googleapis.com/drive/v3/files/{fileId}
   */
  async deleteFile(fileId) {
    if (!fileId) {
      throw new Error("Cannot delete file from Google Drive: missing Google Drive File ID.");
    }

    let token = await this.authenticate();
    const endpoint = `https://www.googleapis.com/drive/v3/files/${fileId}`;

    let res = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      if (res.status === 404) {
        console.warn(`[Google Drive Delete] File ${fileId} already deleted or not found (404). Proceeding with local removal.`);
        return true;
      }
      if (res.status === 401) {
        // Token expired -> Clear token & re-authenticate retry
        this.clearToken();
        token = await this.authenticate();
        res = await fetch(endpoint, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok || res.status === 404) {
          return true;
        }
      }
      const errText = await res.text();
      throw new Error(`Google Drive Delete error (${res.status}): ${errText}`);
    }

    return true;
  }

  /**
   * Set Google Drive File Visibility using Google Drive Permissions API.
   * - isPublic = true: POST https://www.googleapis.com/drive/v3/files/{fileId}/permissions
   *   Body: { role: "reader", type: "anyone" }
   * - isPublic = false: DELETE https://www.googleapis.com/drive/v3/files/{fileId}/permissions/{permissionId}
   * Returns: { success: true, webViewLink, isPublic }
   */
  async setFileVisibility(fileId, isPublic = true) {
    if (!fileId) throw new Error("Missing Google Drive File ID.");

    let token = await this.authenticate();
    
    if (isPublic) {
      const endpoint = `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`;
      const res = await fetch(endpoint, {
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

      if (!res.ok) {
        const errText = await res.text();
        console.warn("[Google Drive Permissions Error]:", errText);
      }
    } else {
      const listEndpoint = `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`;
      const listRes = await fetch(listEndpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (listRes.ok) {
        const data = await listRes.json();
        const anyonePerm = (data.permissions || []).find(p => p.type === "anyone");
        if (anyonePerm) {
          await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions/${anyonePerm.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      }
    }

    const getRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,webViewLink,webContentLink`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    let webViewLink = `https://drive.google.com/file/d/${fileId}/view`;
    if (getRes.ok) {
      const meta = await getRes.json();
      if (meta.webViewLink) webViewLink = meta.webViewLink;
    }

    return {
      success: true,
      fileId,
      webViewLink,
      isPublic,
    };
  }

  /**
   * Upload a single quotation PDF or JSON file to Google Drive "VisionX QuoteGen Pro/Quotations/"
   */
  async uploadSingleQuotation(quotationData) {
    let token = await this.authenticate();
    const folders = await this.ensureRootFolderStructure();
    
    const filename = `${quotationData.referenceNo || quotationData.quotationNo || "Quotation"}.json`;
    const content = JSON.stringify(quotationData, null, 2);

    const fileMeta = await this.upsertFileWithConflictHandling(
      folders.quotationsId,
      filename,
      content,
      "application/json",
      true
    );

    const fileId = fileMeta.id;
    const webViewLink = fileMeta.webViewLink || `https://drive.google.com/file/d/${fileId}/view`;

    await this.setFileVisibility(fileId, true);

    if (localDB.saveCloudFile) {
      localDB.saveCloudFile({
        id: quotationData.id || quotationData.referenceNo,
        quotationId: quotationData.id || quotationData.referenceNo,
        fileName: filename,
        fileId: fileId,
        driveFileId: fileId,
        driveShareUrl: webViewLink,
        webViewLink: webViewLink,
        createdAt: new Date().toISOString(),
        isPublic: true,
      });
    }

    return {
      fileId,
      driveFileId: fileId,
      driveShareUrl: webViewLink,
      webViewLink,
      isPublic: true,
    };
  }

  /**
   * Full quotation deletion workflow
   */
  async deleteQuotationBackup(fileOrId) {
    let driveFileId = null;
    let localRecordId = null;
    let quotationId = null;

    if (typeof fileOrId === "string") {
      localRecordId = fileOrId;
      const found = localDB.getCloudFiles ? localDB.getCloudFiles().find(f => f.id === fileOrId || f.driveFileId === fileOrId) : null;
      if (found) {
        driveFileId = found.driveFileId || found.fileId || found.id;
        quotationId = found.quotationId;
      } else {
        driveFileId = fileOrId;
      }
    } else if (fileOrId && typeof fileOrId === "object") {
      localRecordId = fileOrId.id;
      driveFileId = fileOrId.driveFileId || fileOrId.fileId || fileOrId.id;
      quotationId = fileOrId.quotationId;
    }

    if (driveFileId) {
      await this.deleteFile(driveFileId);
    }

    if (localDB.permanentDeleteCloudFile && localRecordId) {
      localDB.permanentDeleteCloudFile(localRecordId);
    } else if (localDB.deleteCloudFile && localRecordId) {
      localDB.deleteCloudFile(localRecordId);
    }

    if (quotationId && localDB.deleteQuotation) {
      localDB.deleteQuotation(quotationId);
    } else if (localRecordId && localDB.deleteQuotation) {
      localDB.deleteQuotation(localRecordId);
    }

    window.dispatchEvent(new Event("cloudFilesUpdated"));
    window.dispatchEvent(new Event("gdriveStatusUpdated"));
    window.dispatchEvent(new Event("quotationDataUpdated"));

    return true;
  }
}

export const googleDriveProvider = new GoogleDriveProvider();

export const triggerAutoSync = (type, data) => {
  return googleDriveProvider.triggerAutoSync(type, data);
};
