import { localDB } from "./localDB";

/**
 * 🔄 Unified Quotation Data Mapper & Normalizer
 * Transforms any raw quotation object (Create form state, localDB record, or draft)
 * into a single normalized data structure containing both top-level and nested properties.
 * Company Settings acts as the single source of truth whenever useCompanyProfileDefaults is true (default).
 */
export function normalizeQuotationData(rawInput) {
  if (!rawInput) return null;

  // 1. Fetch Latest Saved Company Settings from localDB (Single Source of Truth)
  const companyProfile = localDB.getCompanyProfile() || {};

  // 2. Extract Sub-Objects from Raw Input
  const pd = rawInput.projectDetails || {};
  const pricing = rawInput.pricing || {};
  const textAreas = rawInput.textAreas || {};
  const timeline = rawInput.timeline || {};
  const rawBank = rawInput.bankDetails || {};
  const rawSig = rawInput.signature || {};
  const paymentTerms = rawInput.paymentTerms || {};
  const paymentPercents = rawInput.paymentPercents || {};

  // Determine whether Company Profile Defaults toggle is enabled (defaults to true)
  const useDefaults = rawInput.useCompanyProfileDefaults !== false;

  // 3. Resolve Company Information (User-entered quotation values override company defaults)
  const companyLogo = pd.companyLogo !== undefined ? pd.companyLogo : (companyProfile.companyLogo || "");
  const companyName = pd.companyName !== undefined ? pd.companyName : (companyProfile.companyName || "");
  const companyTagline = pd.companyTagline !== undefined ? pd.companyTagline : (companyProfile.companyTagline || companyProfile.tagline || "");
  const companyAddress = pd.companyAddress !== undefined ? pd.companyAddress : (companyProfile.companyAddress || companyProfile.address || "");
  const companyPhone = pd.companyPhone !== undefined ? pd.companyPhone : (companyProfile.companyPhone || companyProfile.phone || "");
  const companyAltPhone = pd.companyAltPhone !== undefined ? pd.companyAltPhone : (companyProfile.companyAltPhone || companyProfile.altPhone || "");
  const companyEmail = pd.companyEmail !== undefined ? pd.companyEmail : (companyProfile.companyEmail || companyProfile.email || "");
  const gstNo = pd.gstNo !== undefined ? pd.gstNo : (companyProfile.gstNo || "");
  const website = pd.website !== undefined ? pd.website : (companyProfile.website || "");

  // 4. Resolve Client Information (Quotation-Specific)
  const clientName = pd.clientName || rawInput.clientName || "-";
  const clientCompany = pd.clientCompany || rawInput.clientCompany || "";
  const clientAddress = pd.clientAddress || rawInput.clientAddress || "";
  const clientEmail = pd.clientEmail || rawInput.clientEmail || "";
  const clientPhone = pd.clientPhone || rawInput.clientPhone || "";

  // 5. Resolve Project Information & Reference / Dates
  const projectName = pd.projectName || rawInput.projectName || "-";
  const subject = pd.subject !== undefined ? pd.subject : (companyProfile.coverLetterSubject || "");
  const referenceNo = pd.referenceNo || rawInput.quotationNo || rawInput.referenceNo || rawInput._id || "VXQ-2026";
  const quotationNo = referenceNo;
  const date = pd.date || rawInput.date || new Date().toISOString().split("T")[0];
  const expiryDate = pd.expiryDate || rawInput.expiryDate || "";
  const revision = pd.revision || rawInput.revision || "01";
  const paintBrand = pd.paintBrand !== undefined ? pd.paintBrand : (companyProfile.defaultPaintBrand || "");
  const siteLocation = pd.siteLocation || rawInput.siteLocation || clientAddress || "";

  // 6. Format Rate Sections & Items Table
  const rawSections = rawInput.rateSections || rawInput.sections || [];
  let subtotalNum = 0;
  let totalCategoryEstimatedAmount = 0;

  const sections = rawSections.map((sec, secIdx) => {
    const rows = sec.rows || sec.items || [];
    let secLabourTotal = 0;
    let secMaterialTotal = 0;

    const sectionItems = rows.map((r, rIdx) => {
      const descStr = r.work || r.desc || r.workDescription || r.description || `Item #${rIdx + 1}`;
      const labNum = Number(r.labour || 0);
      const matNum = Number(r.material || 0);
      const qtyNum = Number(r.qty || 1);
      const rateNum = Number(r.rate || labNum + matNum);
      const totNum = Number(r.total || (rateNum * qtyNum));

      secLabourTotal += labNum;
      secMaterialTotal += matNum;
      subtotalNum += totNum;

      return {
        id: r.id || rIdx + 1,
        desc: descStr,
        work: descStr,
        description: descStr,
        workDescription: descStr,
        labour: labNum.toFixed(2),
        material: matNum.toFixed(2),
        rate: rateNum.toFixed(2),
        qty: qtyNum.toString(),
        unit: r.unit || "",
        total: totNum.toFixed(2),
        amount: totNum.toFixed(2),
      };
    });

    const secRatePerSqft = rows.reduce((acc, r) => acc + (Number(r.total) || (Number(r.labour || 0) + Number(r.material || 0))), 0);
    const workingAreaNum = Number(sec.workingArea || 0);
    const secEstimatedAmount = workingAreaNum > 0 ? (workingAreaNum * secRatePerSqft) : secRatePerSqft;

    totalCategoryEstimatedAmount += secEstimatedAmount;

    return {
      id: sec.id || secIdx + 1,
      title: sec.title || `Category #${secIdx + 1}`,
      workingArea: sec.workingArea || "",
      ratePerSqft: secRatePerSqft.toFixed(2),
      estimatedAmount: secEstimatedAmount.toFixed(2),
      labourTotal: secLabourTotal.toFixed(2),
      materialTotal: secMaterialTotal.toFixed(2),
      rows: sectionItems,
      items: sectionItems,
      sectionTotal: secRatePerSqft.toFixed(2),
    };
  });

  // 7. Pricing, Discounts & Totals
  const baseTotalNum = totalCategoryEstimatedAmount > 0 ? totalCategoryEstimatedAmount : subtotalNum;
  const discountPercent = Number(pricing.discount || rawInput.discount || 0);
  const discountAmountNum = (baseTotalNum * discountPercent) / 100;
  const taxNum = Number(pricing.tax || rawInput.tax || 0);
  const transportNum = Number(pricing.transport || rawInput.transport || 0);
  const additionalChargesNum = Number(pricing.additionalCharges || rawInput.additionalCharges || 0);
  const grandTotalNum = baseTotalNum - discountAmountNum + taxNum + transportNum + additionalChargesNum;
  const warrantyStr = pricing.warranty !== undefined ? pricing.warranty : (companyProfile.defaultWarranty || "3 Years Warranty");

  // 8. Text Areas & Terms (User-entered text overrides defaults; empty string is preserved)
  const scopeOfWork = textAreas.scopeOfWork !== undefined ? textAreas.scopeOfWork : (companyProfile.defaultNotes || companyProfile.defaultScope || "");
  const exclusions = textAreas.exclusions !== undefined ? textAreas.exclusions : (companyProfile.defaultExclusions || "");
  const termsConditions = textAreas.termsConditions !== undefined ? textAreas.termsConditions : (companyProfile.defaultTerms || "");

  const termsArray = typeof termsConditions === "string"
    ? termsConditions.split("\n").map(t => t.trim()).filter(Boolean)
    : (Array.isArray(termsConditions) ? termsConditions : []);

  // 9. Bank Details (User-entered values override company defaults)
  const profileBank = companyProfile.bankDetails || {};
  const bankName = rawBank.bankName !== undefined ? rawBank.bankName : (profileBank.bankName || "");
  const accHolder = (rawBank.accountHolder !== undefined || rawBank.accHolder !== undefined)
    ? (rawBank.accountHolder ?? rawBank.accHolder)
    : (profileBank.accountHolder || profileBank.accHolder || "");
  const accNo = (rawBank.accountNumber !== undefined || rawBank.accNo !== undefined)
    ? (rawBank.accountNumber ?? rawBank.accNo)
    : (profileBank.accountNumber || profileBank.accNo || "");
  const ifsc = (rawBank.ifscCode !== undefined || rawBank.ifsc !== undefined)
    ? (rawBank.ifscCode ?? rawBank.ifsc)
    : (profileBank.ifscCode || profileBank.ifsc || "");
  const upi = (rawBank.upiId !== undefined || rawBank.upi !== undefined)
    ? (rawBank.upiId ?? rawBank.upi)
    : (profileBank.upiId || profileBank.upi || "");
  const branch = rawBank.branch !== undefined ? rawBank.branch : (profileBank.branch || "");

  const bankDetails = {
    bankName,
    accHolder,
    accountHolder: accHolder,
    accNo,
    accountNumber: accNo,
    ifsc,
    ifscCode: ifsc,
    upi,
    upiId: upi,
    branch,
  };

  // 10. Signature & Signatory Metadata (User-entered values override company defaults; empty string is preserved)
  const sigName = rawSig.name !== undefined ? rawSig.name : (companyProfile.signature?.name || companyProfile.companyName || "");
  const sigDesignation = rawSig.designation !== undefined ? rawSig.designation : (companyProfile.signature?.designation || "");
  const sigPhone = rawSig.phone !== undefined ? rawSig.phone : (companyProfile.signature?.phone || companyPhone || "");
  const sigEmail = rawSig.email !== undefined ? rawSig.email : (companyProfile.signature?.email || companyEmail || "");

  const signature = {
    name: sigName,
    signatoryName: sigName,
    designation: sigDesignation,
    companyName: companyName,
    phone: sigPhone,
    email: sigEmail,
    signatureImage: rawSig.signatureImage !== undefined ? rawSig.signatureImage : (companyProfile.signature?.signatureImage || companyProfile.companySignature || ""),
  };

  // 11. Validity Clause
  const validity = rawInput.validity !== undefined ? rawInput.validity : (companyProfile.defaultValidity || "The price quoted here will be valid for 30 days from the date of issue.");

  // 12. Complete Consolidated Data Object
  const normalized = {
    ...rawInput,
    useCompanyProfileDefaults: useDefaults,

    // Top-Level Flat Properties for All Templates
    companyLogo,
    companyName,
    companyTagline,
    companyAddress,
    companyPhone,
    companyAltPhone,
    companyEmail,
    gstNo,
    website,

    clientName,
    clientCompany,
    clientAddress,
    clientPhone,
    clientEmail,

    projectName,
    subject,
    referenceNo,
    quotationNo,
    date,
    expiryDate,
    revision,
    paintBrand,
    siteLocation,

    sections,
    rateSections: sections,

    subtotal: subtotalNum.toFixed(2),
    discount: discountAmountNum > 0 ? discountAmountNum.toFixed(2) : (discountPercent > 0 ? `${discountPercent}%` : "0.00"),
    discountPercent: discountPercent.toString(),
    discountAmount: discountAmountNum.toFixed(2),
    tax: taxNum.toFixed(2),
    transport: transportNum.toFixed(2),
    additionalCharges: additionalChargesNum.toFixed(2),
    grandTotal: grandTotalNum.toFixed(2),
    warranty: warrantyStr,

    scopeOfWork,
    exclusions,
    notes: scopeOfWork,
    termsConditions,
    terms: termsArray,

    startDate: timeline.startDate || "",
    endDate: timeline.endDate || "",
    timeline,

    bankDetails,
    signature,
    validity,

    // Retain structured sub-objects for form compatibility
    projectDetails: {
      companyLogo,
      companyName,
      companyTagline,
      companyAddress,
      companyPhone,
      companyAltPhone,
      companyEmail,
      gstNo,
      website,
      clientName,
      clientCompany,
      clientAddress,
      clientPhone,
      clientEmail,
      projectName,
      subject,
      referenceNo,
      quotationNo,
      date,
      expiryDate,
      revision,
      paintBrand,
    },
    pricing: {
      subtotal: subtotalNum.toFixed(2),
      discount: discountPercent.toString(),
      discountAmount: discountAmountNum.toFixed(2),
      tax: taxNum.toFixed(2),
      grandTotal: grandTotalNum.toFixed(2),
      warranty: warrantyStr,
    },
    textAreas: {
      scopeOfWork,
      exclusions,
      termsConditions,
    },
    paymentTerms,
    paymentPercents,
  };

  validateQuotationData(normalized);
  return normalized;
}

/**
 * 🔍 Diagnostic Data Flow Logger
 */
export function validateQuotationData(data) {
  if (!data) {
    console.warn("[QuotationMapper] Validation failed: Data object is null or undefined.");
    return false;
  }

  const checkField = (key, val) => {
    if (!val || (typeof val === "string" && !val.trim()) || (Array.isArray(val) && val.length === 0)) {
      console.info(`[QuotationMapper] Field Notice: '${key}' is unpopulated.`);
    } else {
      console.log(`[QuotationMapper] Field Verified: '${key}' ->`, typeof val === "object" ? "Object/Array" : val);
    }
  };

  console.groupCollapsed(`[QuotationMapper] Validating Quotation [${data.quotationNo || "UNKNOWN"}]`);
  checkField("Company Name", data.companyName);
  checkField("Company Phone", data.companyPhone);
  checkField("Company Email", data.companyEmail);
  checkField("Bank Name", data.bankDetails?.bankName);
  checkField("Reference Number", data.quotationNo);
  checkField("Client Name", data.clientName);
  checkField("Grand Total", data.grandTotal);
  console.groupEnd();

  return true;
}
