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

  // 3. Resolve Company Information (Company Settings takes precedence when useDefaults is true)
  const companyLogo = (useDefaults && companyProfile.companyLogo)
    ? companyProfile.companyLogo
    : (pd.companyLogo || rawInput.companyLogo || companyProfile.companyLogo || "");

  const companyName = (useDefaults && companyProfile.companyName)
    ? companyProfile.companyName
    : (pd.companyName || rawInput.companyName || companyProfile.companyName || "");

  const companyTagline = (useDefaults && companyProfile.companyTagline)
    ? companyProfile.companyTagline
    : (pd.companyTagline || rawInput.companyTagline || companyProfile.companyTagline || "");

  const companyAddress = (useDefaults && companyProfile.companyAddress)
    ? companyProfile.companyAddress
    : (pd.companyAddress || rawInput.companyAddress || companyProfile.companyAddress || "");

  const companyPhone = (useDefaults && companyProfile.companyPhone)
    ? companyProfile.companyPhone
    : (pd.companyPhone || rawInput.companyPhone || companyProfile.companyPhone || "");

  const companyAltPhone = (useDefaults && companyProfile.companyAltPhone)
    ? companyProfile.companyAltPhone
    : (pd.companyAltPhone || rawInput.companyAltPhone || companyProfile.companyAltPhone || "");

  const companyEmail = (useDefaults && companyProfile.companyEmail)
    ? companyProfile.companyEmail
    : (pd.companyEmail || rawInput.companyEmail || companyProfile.companyEmail || "");

  const gstNo = (useDefaults && companyProfile.gstNo)
    ? companyProfile.gstNo
    : (pd.gstNo || rawInput.gstNo || companyProfile.gstNo || "");

  const website = (useDefaults && companyProfile.website)
    ? companyProfile.website
    : (pd.website || rawInput.website || companyProfile.website || "");

  // 4. Resolve Client Information (Quotation-Specific)
  const clientName = pd.clientName || rawInput.clientName || "-";
  const clientCompany = pd.clientCompany || rawInput.clientCompany || "";
  const clientAddress = pd.clientAddress || rawInput.clientAddress || "";
  const clientEmail = pd.clientEmail || rawInput.clientEmail || "";
  const clientPhone = pd.clientPhone || rawInput.clientPhone || "";

  // 5. Resolve Project Information & Reference / Dates
  const projectName = pd.projectName || rawInput.projectName || "-";
  const subject = pd.subject || rawInput.subject || "";
  const referenceNo = pd.referenceNo || rawInput.quotationNo || rawInput.referenceNo || rawInput._id || "VXQ-2026";
  const quotationNo = referenceNo;
  const date = pd.date || rawInput.date || new Date().toISOString().split("T")[0];
  const expiryDate = pd.expiryDate || rawInput.expiryDate || "";
  const revision = pd.revision || rawInput.revision || "01";
  const paintBrand = (useDefaults && companyProfile.defaultPaintBrand)
    ? companyProfile.defaultPaintBrand
    : (pd.paintBrand || rawInput.paintBrand || companyProfile.defaultPaintBrand || "");
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
  const warrantyStr = (useDefaults && companyProfile.defaultWarranty)
    ? companyProfile.defaultWarranty
    : (pricing.warranty || rawInput.warranty || companyProfile.defaultWarranty || "3 Years Warranty");

  // 8. Text Areas & Terms (Company Settings single source of truth when useDefaults is true)
  const scopeOfWork = (useDefaults && (companyProfile.defaultNotes || companyProfile.defaultScope))
    ? (companyProfile.defaultNotes || companyProfile.defaultScope)
    : (textAreas.scopeOfWork || rawInput.scopeOfWork || companyProfile.defaultNotes || "");

  const exclusions = (useDefaults && companyProfile.defaultExclusions)
    ? companyProfile.defaultExclusions
    : (textAreas.exclusions || rawInput.exclusions || companyProfile.defaultExclusions || "");

  const termsConditions = (useDefaults && companyProfile.defaultTerms)
    ? companyProfile.defaultTerms
    : (textAreas.termsConditions || rawInput.termsConditions || companyProfile.defaultTerms || "");

  const termsArray = typeof termsConditions === "string"
    ? termsConditions.split("\n").map(t => t.trim()).filter(Boolean)
    : (Array.isArray(termsConditions) ? termsConditions : []);

  // 9. Bank Details (Company Settings single source of truth when useDefaults is true)
  const profileBank = companyProfile.bankDetails || {};
  const bankName = (useDefaults && profileBank.bankName) ? profileBank.bankName : (rawBank.bankName || profileBank.bankName || "");
  const accHolder = (useDefaults && profileBank.accountHolder) ? profileBank.accountHolder : (rawBank.accountHolder || rawBank.accHolder || profileBank.accountHolder || "");
  const accNo = (useDefaults && profileBank.accountNumber) ? profileBank.accountNumber : (rawBank.accountNumber || rawBank.accNo || profileBank.accountNumber || "");
  const ifsc = (useDefaults && profileBank.ifscCode) ? profileBank.ifscCode : (rawBank.ifscCode || rawBank.ifsc || profileBank.ifscCode || "");
  const upi = (useDefaults && profileBank.upiId) ? profileBank.upiId : (rawBank.upi || rawBank.upiId || profileBank.upiId || "");
  const branch = (useDefaults && profileBank.branch) ? profileBank.branch : (rawBank.branch || profileBank.branch || "");

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

  // 10. Signature & Signatory Metadata
  const sigName = (useDefaults && (companyProfile.signature?.name || companyProfile.companyName))
    ? (companyProfile.signature?.name || companyProfile.companyName)
    : (rawSig.name || rawSig.signatoryName || companyProfile.companyName || companyName);

  const sigDesignation = (useDefaults && companyProfile.signature?.designation)
    ? companyProfile.signature.designation
    : (rawSig.designation || "Authorized Signatory");

  const sigPhone = (useDefaults && companyProfile.signature?.phone)
    ? companyProfile.signature.phone
    : (rawSig.phone || companyPhone);

  const sigEmail = (useDefaults && companyProfile.signature?.email)
    ? companyProfile.signature.email
    : (rawSig.email || companyEmail);

  const signature = {
    name: sigName,
    signatoryName: sigName,
    designation: sigDesignation,
    companyName: companyName,
    phone: sigPhone,
    email: sigEmail,
    signatureImage: companyProfile.signature?.signatureImage || companyProfile.companySignature || rawSig.signatureImage || "",
  };

  // 11. Validity Clause
  const validity = (useDefaults && companyProfile.defaultValidity)
    ? companyProfile.defaultValidity
    : (rawInput.validity || "The price quoted here will be valid for 30 days from the date of issue.");

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
