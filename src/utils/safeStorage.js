/**
 * 🛡️ Safe LocalStorage Utility
 * Protects against QuotaExceededError by stripping heavy base64 assets/images,
 * trimming old history to latest 20 items, and catching storage errors cleanly.
 */

export function sanitizeQuotationForStorage(quotation) {
  if (!quotation || typeof quotation !== "object") return null;

  try {
    // Create a lightweight summary object without heavy base64 / blob fields
    const copy = { ...quotation };
    
    // Strip heavy base64 / blob fields
    delete copy.pdfBase64;
    delete copy.pdfBlob;
    delete copy.pdfDataUri;
    delete copy.signatureImage;
    delete copy.companyLogoBase64;

    if (copy.projectDetails) {
      const proj = { ...copy.projectDetails };
      delete proj.companyLogoBase64;
      delete proj.signatureBase64;
      copy.projectDetails = proj;
    }

    return copy;
  } catch (e) {
    return {
      id: quotation.id || quotation.quotationNumber || "QTN-2026-001",
      quotationNumber: quotation.quotationNumber || quotation.referenceNumber || "QTN-2026-001",
      clientName: quotation.clientName || quotation.clientDetails?.clientName || "Client Name",
      companyName: quotation.companyName || quotation.projectDetails?.companyName || "Company Name",
      date: quotation.date || quotation.dateCreated || "Today",
      totalAmount: quotation.totalAmount || quotation.total || 0,
    };
  }
}

export function safeLocalStorageSet(key, value) {
  try {
    let stringVal = typeof value === "string" ? value : JSON.stringify(value);
    localStorage.setItem(key, stringVal);
  } catch (err) {
    if (err.name === "QuotaExceededError" || err.code === 22 || err.code === 1014) {
      console.warn(`[SafeStorage] QuotaExceededError caught on key "${key}". Purging old history...`);
      try {
        // Prune old storage items to free up space
        const listStr = localStorage.getItem("quotation_history") || localStorage.getItem("local_quotations");
        if (listStr) {
          const list = JSON.parse(listStr);
          if (Array.isArray(list) && list.length > 20) {
            const trimmed = list.slice(0, 20);
            localStorage.setItem("quotation_history", JSON.stringify(trimmed));
          }
        }

        // Remove temporary heavy cache keys
        localStorage.removeItem("temp_pdf_cache");
        localStorage.removeItem("previewDraft_heavy");

        // Retry saving sanitized version
        let sanitized = value;
        if (typeof value === "object") {
          sanitized = sanitizeQuotationForStorage(value);
        }
        localStorage.setItem(key, typeof sanitized === "string" ? sanitized : JSON.stringify(sanitized));
      } catch (retryErr) {
        console.error("[SafeStorage] Storage retry failed cleanly:", retryErr);
      }
    }
  }
}

export function safeLocalStorageGet(key, fallback = null) {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (e) {
    return fallback;
  }
}
