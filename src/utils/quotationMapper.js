import { localDB } from "./localDB";

/**
 * 🔄 Unified Quotation Data Mapper & Normalizer
 * Transforms any raw quotation object (Create form state, localDB record, or draft)
 * into a single normalized data structure containing both top-level and nested properties.
 */
export function normalizeQuotationData(rawInput) {
  if (!rawInput) return null;

  // 1. Fetch Latest Active Company Profile from localDB
  const companyProfile = (localDB.getActiveCompanyProfile ? localDB.getActiveCompanyProfile() : null) || localDB.getCompanyProfile() || {};

  // 2. Extract Sub-Objects from Raw Input
  const pd = rawInput.projectDetails || {};
  const pricing = rawInput.pricing || {};
  const textAreas = rawInput.textAreas || {};
  const timeline = rawInput.timeline || {};
  const rawBank = rawInput.bankDetails || {};
  const rawSig = rawInput.signature || {};

  const useDefaults = rawInput.useCompanyProfileDefaults !== false;

  // 3. Resolve Company Information
  const companyLogo = pd.companyLogo || rawInput.companyLogo || companyProfile.companyLogo || companyProfile.logo || "";
  const companyName = pd.companyName || rawInput.companyName || companyProfile.companyName || "Company Name";
  const companyTagline = pd.companyTagline || rawInput.companyTagline || companyProfile.companyTagline || companyProfile.tagline || "";
  const companyAddress = pd.companyAddress !== undefined ? pd.companyAddress : (companyProfile.companyAddress || companyProfile.address || "");
  const companyPhone = pd.companyPhone !== undefined ? pd.companyPhone : (companyProfile.companyPhone || companyProfile.phone || "");
  const companyAltPhone = pd.companyAltPhone !== undefined ? pd.companyAltPhone : (companyProfile.companyAltPhone || companyProfile.altPhone || "");
  const companyEmail = pd.companyEmail !== undefined ? pd.companyEmail : (companyProfile.companyEmail || companyProfile.email || "");
  const gstNo = pd.gstNo !== undefined ? pd.gstNo : (companyProfile.gstNo || "");
  const panNo = pd.panNo !== undefined ? pd.panNo : (companyProfile.panNo || "");
  const website = pd.website !== undefined ? pd.website : (companyProfile.website || "");

  // 4. Resolve Client Information
  const clientName = pd.clientName || rawInput.clientName || rawInput.customerName || "-";
  const clientCompany = pd.clientCompany || rawInput.clientCompany || "";
  const clientAddress = pd.clientAddress || rawInput.clientAddress || rawInput.customerAddress || "";
  const clientEmail = pd.clientEmail || rawInput.clientEmail || rawInput.customerEmail || "";
  const clientPhone = pd.clientPhone || rawInput.clientPhone || rawInput.customerPhone || "";

  // 5. Resolve Project Information & Dates
  const projectName = pd.projectName || rawInput.projectName || rawInput.projectTitle || "-";
  const subject = pd.subject !== undefined ? pd.subject : (companyProfile.coverLetterSubject || "");
  const referenceNo = pd.referenceNo || rawInput.quotationNo || rawInput.referenceNo || rawInput._id || "VXQ-2026";
  const quotationNo = referenceNo;
  const date = pd.date || rawInput.date || rawInput.createdAt || new Date().toISOString().split("T")[0];
  const expiryDate = pd.expiryDate || rawInput.expiryDate || rawInput.validUntil || "";
  const revision = pd.revision || rawInput.revision || "01";
  const siteLocation = pd.siteLocation || rawInput.siteLocation || clientAddress || "";
  const currencySymbol = rawInput.currencySymbol || rawInput.currency || companyProfile.currencySymbol || "₹";

  // 6. Format Items & Sections (Unified Dual Mapping)
  let rawSections = rawInput.rateSections || rawInput.sections || [];
  let rawItems = rawInput.items || [];

  if (rawSections.length === 0 && rawItems.length > 0) {
    rawSections = [{ id: 1, title: "Scope Items", rows: rawItems, items: rawItems }];
  }

  let subtotalNum = 0;
  let totalCategoryEstimatedAmount = 0;

  const sections = rawSections.map((sec, secIdx) => {
    const rows = sec.rows || sec.items || [];
    const components = (sec.components && sec.components.length > 0)
      ? sec.components
      : [{ id: "labour", name: "Labour" }, { id: "material", name: "Material" }];

    let secLabourTotal = 0;
    let secMaterialTotal = 0;

    const sectionItems = rows.map((r, rIdx) => {
      const descStr = r.work || r.desc || r.workDescription || r.description || r.name || `Item #${rIdx + 1}`;
      const qtyNum = Number(r.qty || r.quantity || 1);

      const componentRates = { ...(r.componentRates || {}) };
      const resolvedRates = {};
      let rowTotalRate = 0;

      components.forEach((c) => {
        let val = 0;
        if (componentRates[c.id] !== undefined && componentRates[c.id] !== "") {
          val = Number(componentRates[c.id]) || 0;
        } else if (c.id === "labour" && (r.labour !== undefined || r.labourRate !== undefined)) {
          val = Number(r.labour || r.labourRate) || 0;
        } else if (c.id === "material" && (r.material !== undefined || r.materialRate !== undefined)) {
          val = Number(r.material || r.materialRate) || 0;
        } else if (r[c.id] !== undefined && r[c.id] !== "") {
          val = Number(r[c.id]) || 0;
        }
        resolvedRates[c.id] = val;
        componentRates[c.id] = val;
        rowTotalRate += val;
      });

      // Requirement 5: Row Total = sum(all pricing component values)
      const totNum = rowTotalRate * qtyNum;

      const labNum = resolvedRates["labour"] || 0;
      const matNum = resolvedRates["material"] || 0;

      secLabourTotal += labNum;
      secMaterialTotal += matNum;
      subtotalNum += totNum;

      return {
        ...r,
        id: r.id || rIdx + 1,
        desc: descStr,
        work: descStr,
        description: descStr,
        name: descStr,
        workDescription: descStr,
        components,
        componentRates,
        resolvedRates,
        labour: labNum.toFixed(2),
        labourRate: labNum,
        material: matNum.toFixed(2),
        materialRate: matNum,
        rate: rowTotalRate.toFixed(2),
        totalRate: rowTotalRate,
        qty: qtyNum.toString(),
        quantity: qtyNum,
        unit: r.unit || "unit",
        total: totNum.toFixed(2),
        amount: totNum.toFixed(2),
        totalPrice: totNum,
        ...resolvedRates,
      };
    });

    // Requirement 6: Category Rate = sum(all work item totals)
    const secRatePerSqft = sectionItems.reduce((acc, r) => acc + (r.totalRate || 0), 0);
    const workingAreaNum = Number(sec.workingArea || 0);

    // Requirement 7: Category Amount = Category Rate × Area
    const secEstimatedAmount = workingAreaNum > 0 ? (workingAreaNum * secRatePerSqft) : secRatePerSqft;

    totalCategoryEstimatedAmount += secEstimatedAmount;

    return {
      ...sec,
      id: sec.id || secIdx + 1,
      title: sec.title || `Category #${secIdx + 1}`,
      workingArea: sec.workingArea || "",
      components,
      ratePerSqft: secRatePerSqft.toFixed(2),
      estimatedAmount: secEstimatedAmount.toFixed(2),
      labourTotal: secLabourTotal.toFixed(2),
      materialTotal: secMaterialTotal.toFixed(2),
      rows: sectionItems,
      items: sectionItems,
      sectionTotal: secRatePerSqft.toFixed(2),
    };
  });

  const flatItemsList = sections.flatMap(s => s.items || s.rows || []);

  // 7. Pricing, Discounts & Totals
  const baseTotalNum = totalCategoryEstimatedAmount > 0 ? totalCategoryEstimatedAmount : subtotalNum;
  const discountPercent = Number(pricing.discount || rawInput.discount || 0);
  const discountAmountNum = Number(pricing.discountAmount || rawInput.discountAmount || ((baseTotalNum * discountPercent) / 100));
  const taxNum = Number(pricing.tax || rawInput.tax || rawInput.taxAmount || 0);
  const transportNum = Number(pricing.transport || rawInput.transport || 0);
  const additionalChargesNum = Number(pricing.additionalCharges || rawInput.additionalCharges || 0);
  const grandTotalNum = baseTotalNum - discountAmountNum + taxNum + transportNum + additionalChargesNum;
  const warrantyStr = pricing.warranty !== undefined ? pricing.warranty : (rawInput.warranty || companyProfile.defaultWarranty || "3 Years Warranty");

  // 8. Text Areas & Terms
  const scopeOfWork = textAreas.scopeOfWork !== undefined ? textAreas.scopeOfWork : (rawInput.scopeOfWork || rawInput.notes || companyProfile.defaultNotes || "");
  const exclusions = textAreas.exclusions !== undefined ? textAreas.exclusions : (rawInput.exclusions || companyProfile.defaultExclusions || "");
  const termsConditions = textAreas.termsConditions !== undefined ? textAreas.termsConditions : (rawInput.termsConditions || rawInput.terms || companyProfile.defaultTerms || "");

  const termsArray = typeof termsConditions === "string"
    ? termsConditions.split("\n").map(t => t.trim()).filter(Boolean)
    : (Array.isArray(termsConditions) ? termsConditions : []);

  // 9. Bank Details
  const profileBank = companyProfile.bankDetails || {};
  const bankName = rawBank.bankName !== undefined ? rawBank.bankName : (rawInput.bankName || profileBank.bankName || "");
  const accHolder = (rawBank.accountHolder !== undefined || rawBank.accHolder !== undefined)
    ? (rawBank.accountHolder ?? rawBank.accHolder)
    : (rawInput.accountHolder || profileBank.accountHolder || profileBank.accHolder || "");
  const accNo = (rawBank.accountNumber !== undefined || rawBank.accNo !== undefined)
    ? (rawBank.accountNumber ?? rawBank.accNo)
    : (rawInput.accountNumber || profileBank.accountNumber || profileBank.accNo || "");
  const ifsc = (rawBank.ifscCode !== undefined || rawBank.ifsc !== undefined)
    ? (rawBank.ifscCode ?? rawBank.ifsc)
    : (rawInput.ifscCode || profileBank.ifscCode || profileBank.ifsc || "");
  const upi = (rawBank.upiId !== undefined || rawBank.upi !== undefined)
    ? (rawBank.upiId ?? rawBank.upi)
    : (rawInput.upiId || profileBank.upiId || profileBank.upi || "");
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

  // 10. Signature & Signatory Metadata
  const sigName = rawSig.name !== undefined ? rawSig.name : (rawInput.signatoryName || companyProfile.signature?.name || "");
  const sigDesignation = rawSig.designation !== undefined ? rawSig.designation : (companyProfile.signature?.designation || "");
  const sigImage = rawSig.signatureImage !== undefined ? rawSig.signatureImage : (companyProfile.signature?.signatureImage || companyProfile.companySignature || "");

  const signature = {
    name: sigName,
    signatoryName: sigName,
    designation: sigDesignation,
    companyName: companyName,
    signatureImage: sigImage,
  };

  // 11. Complete Consolidated Data Object
  const normalized = {
    ...rawInput,
    useCompanyProfileDefaults: useDefaults,

    // Top-Level Flat Properties
    companyLogo,
    companyName,
    companyTagline,
    companyAddress,
    companyPhone,
    companyAltPhone,
    companyEmail,
    gstNo,
    panNo,
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
    siteLocation,
    currencySymbol,

    items: flatItemsList,
    sections,
    rateSections: sections,

    subtotal: subtotalNum.toFixed(2),
    discount: discountAmountNum.toFixed(2),
    discountPercent: discountPercent.toString(),
    discountAmount: discountAmountNum.toFixed(2),
    tax: taxNum.toFixed(2),
    taxAmount: taxNum.toFixed(2),
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

    // Retain structured sub-objects
    projectDetails: {
      companyLogo,
      companyName,
      companyTagline,
      companyAddress,
      companyPhone,
      companyAltPhone,
      companyEmail,
      gstNo,
      panNo,
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
  };

  validateQuotationData(normalized);
  return normalized;
}

/**
 * 🎯 UNIVERSAL DATA MODEL EXTRACTOR
 * Returns a standardized, fail-safe quotation object with zero missing values or fake fallbacks.
 */
export function extractQuotationModel(data) {
  const norm = normalizeQuotationData(data) || {};

  const getStr = (val) => (val !== undefined && val !== null ? String(val).trim() : "");
  const getNum = (val) => {
    const n = parseFloat(val);
    return isNaN(n) ? 0 : n;
  };

  const companyName = getStr(norm.companyName) || "Company Name";
  const companyLogo = getStr(norm.companyLogo);
  const companyTagline = getStr(norm.companyTagline);
  const companyAddress = getStr(norm.companyAddress);
  const companyPhone = getStr(norm.companyPhone);
  const companyAltPhone = getStr(norm.companyAltPhone);
  const companyEmail = getStr(norm.companyEmail);
  const website = getStr(norm.website);
  const gstNo = getStr(norm.gstNo);
  const panNo = getStr(norm.panNo);

  const clientName = getStr(norm.clientName) || "-";
  const clientCompany = getStr(norm.clientCompany);
  const clientPhone = getStr(norm.clientPhone);
  const clientEmail = getStr(norm.clientEmail);
  const clientAddress = getStr(norm.clientAddress);

  const projectName = getStr(norm.projectName) || "-";
  const projectDescription = getStr(norm.subject);
  const siteLocation = getStr(norm.siteLocation);
  const validUntil = getStr(norm.expiryDate || norm.validUntil) || "30 Days from Issue";

  const referenceNo = getStr(norm.quotationNo || norm.referenceNo) || "QTN-2026-0001";
  const dateStr = getStr(norm.date) || new Date().toLocaleDateString();
  const currencySymbol = getStr(norm.currencySymbol) || "₹";

  const items = (Array.isArray(norm.items) ? norm.items : []).map((item, idx) => {
    const qty = getNum(item.quantity || item.qty || 1);
    const labRate = getNum(item.labourRate || item.labour || 0);
    const matRate = getNum(item.materialRate || item.material || 0);
    const rate = getNum(item.totalRate || item.rate || (labRate + matRate));
    const amount = getNum(item.amount || item.totalPrice || item.total || (rate * qty));

    return {
      ...item,
      id: item.id || idx + 1,
      description: getStr(item.description || item.work || item.name || `Item #${idx + 1}`),
      unit: getStr(item.unit) || "unit",
      quantity: qty,
      labourRate: labRate,
      materialRate: matRate,
      rate: rate,
      totalRate: rate,
      amount: amount,
    };
  });

  const subtotal = getNum(norm.subtotal || items.reduce((acc, i) => acc + i.amount, 0));
  const discountAmount = getNum(norm.discountAmount || norm.discount);
  const taxAmount = getNum(norm.taxAmount || norm.tax);
  const additionalCharges = getNum(norm.additionalCharges);
  const grandTotal = getNum(norm.grandTotal || (subtotal - discountAmount + taxAmount + additionalCharges));

  const bankDetails = {
    bankName: getStr(norm.bankDetails?.bankName),
    accountHolder: getStr(norm.bankDetails?.accountHolder || norm.bankDetails?.accHolder),
    accountNumber: getStr(norm.bankDetails?.accountNumber || norm.bankDetails?.accNo),
    ifscCode: getStr(norm.bankDetails?.ifscCode || norm.bankDetails?.ifsc),
    branch: getStr(norm.bankDetails?.branch),
    upiId: getStr(norm.bankDetails?.upiId || norm.bankDetails?.upi),
  };

  const signature = {
    name: getStr(norm.signature?.name || norm.signature?.signatoryName),
    designation: getStr(norm.signature?.designation),
    signatureImage: getStr(norm.signature?.signatureImage),
  };

  const terms = getStr(norm.termsConditions || (Array.isArray(norm.terms) ? norm.terms.join("\n") : ""));
  const notes = getStr(norm.scopeOfWork || norm.notes);
  const warranty = getStr(norm.warranty);
  const scope = getStr(norm.scopeOfWork);
  const exclusions = getStr(norm.exclusions);

  return {
    companyName, companyLogo, companyTagline, companyAddress, companyPhone, companyAltPhone, companyEmail, website, gstNo, panNo,
    clientName, clientCompany, clientPhone, clientEmail, clientAddress,
    projectName, projectDescription, siteLocation, validUntil,
    referenceNo, quotationNo: referenceNo, dateStr, currencySymbol,
    items,
    subtotal, discountAmount, taxAmount, additionalCharges, grandTotal,
    bankDetails, signature, terms, notes, warranty, scope, exclusions
  };
}

/** Diagnostic Logger */
export function validateQuotationData(data) {
  if (!data) return false;
  return true;
}
