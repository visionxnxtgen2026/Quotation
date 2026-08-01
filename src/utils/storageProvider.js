/**
 * 📦 StorageProvider — Abstract Storage Architecture Layer
 * Decouples quotation management from specific cloud storage vendors.
 * Supports Google Drive, AWS S3, Cloudflare R2, Dropbox, and OneDrive in the future.
 */

export class BaseStorageProvider {
  constructor(providerName = "BaseStorageProvider") {
    this.providerName = providerName;
  }

  async authenticate() {
    throw new Error("authenticate() must be implemented by concrete subclass");
  }

  async uploadFile({ fileName, pdfBlob, metadata }) {
    throw new Error("uploadFile() must be implemented by concrete subclass");
  }

  async isConnected() {
    return false;
  }
}

export class StorageProviderFactory {
  static providerInstance = null;

  static getProvider(type = "googleDrive") {
    if (this.providerInstance) return this.providerInstance;

    if (type === "googleDrive") {
      const { default: GoogleDriveProvider } = require("./googleDriveProvider");
      this.providerInstance = new GoogleDriveProvider();
      return this.providerInstance;
    }

    throw new Error(`Unsupported storage provider type: ${type}`);
  }
}
