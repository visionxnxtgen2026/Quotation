import { BaseStorageProvider } from "./storageProvider";

/**
 * 🟢 GoogleDriveProvider — Client-Side Offline-First Google Drive Integration
 * Uses OAuth 2.0 Implicit Grant / Google Identity Services.
 * Requires NO backend, NO passwords, and NO refresh tokens.
 * Scoped permissions: https://www.googleapis.com/auth/drive.file (App created files only)
 */

const DEFAULT_CLIENT_ID = "1048602283896-demo.apps.googleusercontent.com"; // Fallback client ID
const SCOPES = "https://www.googleapis.com/auth/drive.file";

export default class GoogleDriveProvider extends BaseStorageProvider {
  constructor() {
    super("GoogleDriveProvider");
    this.accessToken = localStorage.getItem("gdrive_access_token") || null;
    this.tokenExpiry = Number(localStorage.getItem("gdrive_token_expiry")) || 0;
  }

  /** Check if currently authenticated with a valid unexpired access token */
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
    localStorage.removeItem("gdrive_access_token");
    localStorage.removeItem("gdrive_token_expiry");
  }

  saveToken(token, expiresInSeconds = 3600) {
    this.accessToken = token;
    this.tokenExpiry = Date.now() + expiresInSeconds * 1000;
    localStorage.setItem("gdrive_access_token", token);
    localStorage.setItem("gdrive_token_expiry", String(this.tokenExpiry));
  }

  /** Authenticate user via Google Identity Services Token Client */
  async authenticate() {
    if (await this.isConnected()) return this.accessToken;

    return new Promise((resolve, reject) => {
      // 1. Check if Google GIS script is available
      if (window.google?.accounts?.oauth2) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: window.ENV_GOOGLE_CLIENT_ID || DEFAULT_CLIENT_ID,
          scope: SCOPES,
          callback: (response) => {
            if (response.error) {
              reject(new Error(`Google Authentication failed: ${response.error}`));
              return;
            }
            if (response.access_token) {
              this.saveToken(response.access_token, response.expires_in || 3600);
              resolve(response.access_token);
            } else {
              reject(new Error("No access token returned from Google"));
            }
          },
          onerror: (err) => reject(err),
        });
        client.requestAccessToken();
      } else {
        // Fallback popup or user prompt for Access Token
        const manualToken = prompt(
          "Enter your Google OAuth Access Token (or ensure Google GIS script is enabled):"
        );
        if (manualToken && manualToken.trim()) {
          this.saveToken(manualToken.trim());
          resolve(manualToken.trim());
        } else {
          reject(new Error("Google Identity Services script not loaded. Please connect to internet to authenticate."));
        }
      }
    });
  }

  /** Helper to make authorized fetch requests to Google Drive v3 API */
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

  /** Finds an existing folder by name inside parentId, or creates a new one */
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

  /** Resolves folder hierarchy: My Drive / Quotation App / YYYY / MonthName */
  async resolveFolderHierarchy(dateObj = new Date()) {
    const yearStr = String(dateObj.getFullYear());
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthStr = monthNames[dateObj.getMonth()];

    // 1. Root "Quotation App"
    const rootFolderId = await this.getOrCreateFolder("Quotation App", "root");
    // 2. Year Folder "2026"
    const yearFolderId = await this.getOrCreateFolder(yearStr, rootFolderId);
    // 3. Month Folder "July"
    const monthFolderId = await this.getOrCreateFolder(monthStr, yearFolderId);

    return {
      folderId: monthFolderId,
      folderPath: `My Drive / Quotation App / ${yearStr} / ${monthStr}`,
    };
  }

  /** Uploads PDF Blob to Google Drive using Multipart API */
  async uploadFile({ fileName, pdfBlob, date = new Date() }) {
    const token = await this.authenticate();
    const { folderId, folderPath } = await this.resolveFolderHierarchy(date);

    const metadata = {
      name: fileName,
      mimeType: "application/pdf",
      parents: [folderId],
    };

    // Construct Multipart Request Body
    const boundary = "-------314159265358979323846";
    const delimiter = "\r\n--" + boundary + "\r\n";
    const closeDelimiter = "\r\n--" + boundary + "--";

    let blobData;
    if (typeof pdfBlob === "string") {
      // Base64 string handling
      const base64Content = pdfBlob.includes(",") ? pdfBlob.split(",")[1] : pdfBlob;
      const byteCharacters = atob(base64Content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      blobData = new Blob([new Uint8Array(byteNumbers)], { type: "application/pdf" });
    } else {
      blobData = pdfBlob;
    }

    const metadataPart =
      delimiter +
      "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
      JSON.stringify(metadata);

    const mediaPartHeader =
      delimiter + "Content-Type: application/pdf\r\n\r\n";

    const multipartRequestBody = new Blob(
      [metadataPart, mediaPartHeader, blobData, closeDelimiter],
      { type: `multipart/related; boundary=${boundary}` }
    );

    const uploadRes = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      throw new Error(`Google Drive PDF upload failed: ${err}`);
    }

    const file = await uploadRes.json();
    return {
      fileId: file.id,
      driveUrl: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
      downloadUrl: file.webContentLink,
      folderPath,
      uploadedAt: new Date().toISOString(),
    };
  }
}
