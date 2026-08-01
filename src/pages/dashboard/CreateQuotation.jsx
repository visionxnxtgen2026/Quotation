import React, { useState, useEffect, useRef } from "react";
import {
  Save, Eye, CheckCircle2, AlertCircle, RotateCcw, Plus, Trash2,
  Building2, FileText, ShieldCheck, Download, User, Tag, Calendar,
  Copy, Loader2, Info, Clock, CheckSquare, Landmark, PenTool,
  DollarSign, Sparkles, Layers, TableProperties, ArrowLeft, ArrowRight,
  Image as ImageIcon, Upload, XCircle, Calculator, Check, Settings
} from "lucide-react";
import Stepper from "../../components/mobile/Stepper";
import CategoryRateTable from "../../components/quotation/CategoryRateTable";
import { admobManager } from "../../utils/admobManager";
import { localDB } from "../../utils/localDB";
import { triggerAutoSync } from "../../utils/googleDriveProvider";

const STEPS = [
  { key: "project",   title: "Details" },
  { key: "materials", title: "Rates" },
  { key: "terms",     title: "Terms" },
  { key: "preview",   title: "Review" },
];

/**
 * 🚀 CreateQuotation — Premium Enterprise-Grade Mobile Quotation Builder
 * Features intelligent Company Profile Defaults toggle & robust draft lifecycle:
 * - Discard Draft completely purges draft from all storage locations & memory.
 * - Prevents auto-save from recreating draft on blank/default initial state.
 */
export default function CreateQuotation({
  goBack, goToPreview, goToExport, goToDashboard, goToSettings,
  setQuotationId, quotationId, initialStep = 1
}) {
  const [currentStep, setCurrentStep] = useState(initialStep || 1);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [showCompanyDefaultsDialog, setShowCompanyDefaultsDialog] = useState(false);
  const [useCompanyDefaultsToggle, setUseCompanyDefaultsToggle] = useState(true);
  const [showCustomTermsOverride, setShowCustomTermsOverride] = useState(false);

  const [pendingDraft, setPendingDraft] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draftSavedStatus, setDraftSavedStatus] = useState(false);
  const [errors, setErrors] = useState({});

  // Flag to track explicit draft discard in current session
  const isDraftDiscardedRef = useRef(false);

  // Input Field References for Programmatic Focus Navigation
  const clientNameRef = useRef(null);
  const projectNameRef = useRef(null);
  const logoInputRef = useRef(null);

  // Fetch latest company profile for compact summary card & pre-fill (Single Source of Truth)
  const [companyProfile, setCompanyProfile] = useState(() => localDB.getCompanyProfile() || {});

  // Re-fetch profile if settings change
  useEffect(() => {
    const handleProfileUpdate = () => {
      setCompanyProfile(localDB.getCompanyProfile() || {});
    };
    window.addEventListener("quotationDataUpdated", handleProfileUpdate);
    window.addEventListener("storage", handleProfileUpdate);
    return () => {
      window.removeEventListener("quotationDataUpdated", handleProfileUpdate);
      window.removeEventListener("storage", handleProfileUpdate);
    };
  }, []);

  const defaultInitialState = {
    projectDetails: {
      companyLogo: "", companyName: "", clientName: "", clientCompany: "",
      clientPhone: "", clientEmail: "", clientAddress: "", projectName: "",
      referenceNo: "", date: new Date().toISOString().split("T")[0],
      expiryDate: "", revision: "01", subject: "Quotation for Painting & Surface Finishing", paintBrand: "Asian Paints Royale / Dulux"
    },
    areaDetails: {
      interiorArea: "",
      exteriorArea: "",
      totalArea: ""
    },
    rateSections: [
      {
        id: 1, title: "Interior - Premium Finish", workingArea: "250",
        rows: [
          { id: 101, work: "Surface Preparation, Wall Putty (3 Coats)", labour: 5, material: 3, total: 8 },
          { id: 102, work: "Primer (1 Coat)", labour: 1, material: 1, total: 2 },
        ]
      },
      {
        id: 2, title: "Interior - Satin Enamel Finish", workingArea: "180",
        rows: [
          { id: 201, work: "Satin Enamel Application (2 Coats)", labour: 6, material: 4, total: 10 },
        ]
      },
      {
        id: 3, title: "Exterior - Weatherproof Coat", workingArea: "400",
        rows: [
          { id: 301, work: "Exterior Weatherproof Emulsion (2 Coats)", labour: 4, material: 5, total: 9 },
        ]
      }
    ],
    pricing: { discount: "", warranty: "3" },
    timeline: { startDate: "", endDate: "" },
    textAreas: {
      coverLetter: "Dear Client,\n\nWe are pleased to submit our quotation for the painting and surface preparation work for your project. Our team uses top-tier materials and expert craftsmanship to ensure long-lasting quality.\n\nPlease review the itemized rate breakdown, timeline, and terms below. We look forward to working with you.",
      scopeOfWork: "1. Surface cleaning, wall scraping, and sanding.\n2. Application of premium wall putty (3 coats) with smooth sanding.\n3. Application of primer coat.\n4. Application of premium emulsion topcoats (2 coats).",
      exclusions: "1. Civil and structural masonry repair work.\n2. Electrical and plumbing fitting alterations.\n3. Exterior scaffolding above 25 feet unless explicitly specified.",
      termsConditions: "1. Quotation is valid for 30 days from date of issue.\n2. Work will commence within 3 business days of receiving advance payment.\n3. Any modifications to scope will be billed separately upon mutual consent."
    },
    paymentTermsList: [
      { id: 1, stage: "Advance", percent: "50" },
      { id: 2, stage: "Mid Work", percent: "30" },
      { id: 3, stage: "Completion", percent: "20" }
    ],
    paymentTerms: { step1: "Advance", step2: "Mid Work", step3: "Completion" },
    paymentPercents: { p1: "50", p2: "30", p3: "20" },
    validity: "The price quoted here will be valid for 30 days from the date of issue.",
    bankDetails: { bankName: "", accountHolder: "", accountNumber: "", ifscCode: "", branch: "" },
    signature: { name: "", designation: "", phone: "", email: "" },
    useCompanyProfileDefaults: true
  };

  const applyCompanyDefaults = (currentForm) => {
    const profile = localDB.getCompanyProfile();
    if (!profile) return { ...currentForm, useCompanyProfileDefaults: true };
    return {
      ...currentForm,
      useCompanyProfileDefaults: true,
      projectDetails: {
        ...currentForm.projectDetails,
        companyLogo: profile.companyLogo || currentForm.projectDetails?.companyLogo || "",
        companyName: profile.companyName || currentForm.projectDetails?.companyName || "",
        companyTagline: profile.companyTagline || currentForm.projectDetails?.companyTagline || "",
        companyAddress: profile.companyAddress || currentForm.projectDetails?.companyAddress || "",
        companyPhone: profile.companyPhone || currentForm.projectDetails?.companyPhone || "",
        companyEmail: profile.companyEmail || currentForm.projectDetails?.companyEmail || "",
        gstNo: profile.gstNo || currentForm.projectDetails?.gstNo || "",
        website: profile.website || currentForm.projectDetails?.website || "",
        paintBrand: profile.defaultPaintBrand || currentForm.projectDetails?.paintBrand || "",
      },
      pricing: {
        ...currentForm.pricing,
        warranty: profile.defaultWarranty || currentForm.pricing?.warranty || ""
      },
      textAreas: {
        ...currentForm.textAreas,
        termsConditions: profile.defaultTerms || currentForm.textAreas?.termsConditions || "",
        scopeOfWork: profile.defaultNotes || profile.defaultScope || currentForm.textAreas?.scopeOfWork || "",
        exclusions: profile.defaultExclusions || currentForm.textAreas?.exclusions || "",
      },
      bankDetails: {
        bankName: profile.bankDetails?.bankName || "",
        accountHolder: profile.bankDetails?.accountHolder || "",
        accountNumber: profile.bankDetails?.accountNumber || "",
        ifscCode: profile.bankDetails?.ifscCode || "",
        branch: profile.bankDetails?.branch || "",
        upiId: profile.bankDetails?.upiId || "",
        qrCodeImage: profile.bankDetails?.qrCodeImage || ""
      },
      signature: {
        name: profile.signature?.name || profile.companyName || "",
        designation: profile.signature?.designation || "",
        phone: profile.signature?.phone || profile.companyPhone || "",
        email: profile.signature?.email || profile.companyEmail || "",
        signatureImage: profile.signature?.signatureImage || profile.companySignature || ""
      }
    };
  };

  const clearCompanyDefaults = (currentForm) => {
    return {
      ...currentForm,
      useCompanyProfileDefaults: false,
      projectDetails: {
        ...currentForm.projectDetails,
        companyLogo: "",
        companyName: "",
        companyTagline: "",
        companyAddress: "",
        companyPhone: "",
        companyEmail: "",
        gstNo: "",
        website: "",
        paintBrand: "",
      },
      pricing: { ...currentForm.pricing, warranty: "" },
      textAreas: {
        ...currentForm.textAreas,
        termsConditions: "",
        scopeOfWork: "",
        exclusions: "",
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
        designation: "",
        phone: "",
        email: "",
        signatureImage: ""
      }
    };
  };

  /**
   * Evaluates whether quotation data contains genuine user-entered progress.
   * Returns false for untouched/blank default initial state.
   */
  const hasMeaningfulUserData = (data) => {
    if (!data) return false;

    const clientName = data.projectDetails?.clientName?.trim() || "";
    const projectName = data.projectDetails?.projectName?.trim() || "";
    const clientEmail = data.projectDetails?.clientEmail?.trim() || "";
    const clientPhone = data.projectDetails?.clientPhone?.trim() || "";
    const clientAddress = data.projectDetails?.clientAddress?.trim() || "";

    // A genuine user draft MUST have explicit user-entered client/project details
    if (clientName || projectName || clientEmail || clientPhone || clientAddress) {
      return true;
    }

    // Or user added custom rate sections or modified work items
    const rateSections = data.rateSections || [];
    if (rateSections.length > 3) return true;

    for (const sec of rateSections) {
      for (const row of sec.rows || []) {
        const work = row.work?.trim() || "";
        const labour = Number(row.labour) || 0;
        const material = Number(row.material) || 0;

        if (work && work !== "Surface Preparation, Wall Putty (3 Coats)" && work !== "Primer (1 Coat)" && work !== "Satin Enamel Application (2 Coats)" && work !== "Exterior Weatherproof Emulsion (2 Coats)") {
          return true;
        }
        if (work === "Surface Preparation, Wall Putty (3 Coats)" && (labour !== 5 || material !== 3)) {
          return true;
        }
        if (work === "Primer (1 Coat)" && (labour !== 1 || material !== 1)) {
          return true;
        }
      }
    }

    return false;
  };

  const generateReferenceNo = (existingRefNo = "") => {
    if (existingRefNo && existingRefNo.trim() !== "") {
      return existingRefNo;
    }

    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const prefix = `VXQ-${dateStr}-`;

    let maxSeq = 0;
    try {
      const savedQuotations = localDB.getQuotations() || [];
      savedQuotations.forEach(q => {
        const ref = q.quotationNo || q.projectDetails?.referenceNo || q._id || "";
        if (ref.includes(dateStr)) {
          const parts = ref.split("-");
          const seqNum = parseInt(parts[parts.length - 1], 10);
          if (!isNaN(seqNum) && seqNum > maxSeq) {
            maxSeq = seqNum;
          }
        }
      });
    } catch (e) {
      console.warn("Error scanning existing quotation reference numbers:", e);
    }

    const storedDate = localStorage.getItem("quotation_ref_date");
    const storedSeq = parseInt(localStorage.getItem("quotation_ref_seq") || "0", 10);

    let nextSeq = 1;
    if (storedDate === dateStr) {
      nextSeq = Math.max(maxSeq + 1, storedSeq + 1);
    } else {
      nextSeq = Math.max(maxSeq + 1, 1);
    }

    localStorage.setItem("quotation_ref_date", dateStr);
    localStorage.setItem("quotation_ref_seq", nextSeq.toString());

    return `${prefix}${nextSeq.toString().padStart(4, "0")}`;
  };

  const [formData, setFormData] = useState(() => {
    const fresh = { ...defaultInitialState, projectDetails: { ...defaultInitialState.projectDetails, referenceNo: generateReferenceNo() } };
    return applyCompanyDefaults(fresh);
  });

  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [showResetSheet, setShowResetSheet] = useState(false);

  // Check on Mount if Company Profile Settings exist -> Trigger Confirmation Dialog
  useEffect(() => {
    if (quotationId) return;
    const profile = localDB.getCompanyProfile();
    const hasCompanySettings = profile && (profile.companyName || profile.companyAddress || profile.companyEmail);
    const savedDraft = localStorage.getItem("previewDraft");

    if (hasCompanySettings && !savedDraft) {
      setShowCompanyDefaultsDialog(true);
    }
  }, [quotationId]);

  // Load Existing Quotation details when editing
  useEffect(() => {
    if (quotationId) {
      const existing = localDB.getQuotationById(quotationId);
      if (existing) {
        setFormData(existing);
        if (existing.useCompanyProfileDefaults !== undefined) {
          setUseCompanyDefaultsToggle(existing.useCompanyProfileDefaults);
        }
        setIsSaved(true);
      }
    }
  }, [quotationId]);

  // Detect Unfinished Draft on Component Mount
  useEffect(() => {
    if (quotationId) return;

    const isAutoSaveEnabled = localStorage.getItem("autoSaveDraftEnabled") !== "false";
    if (!isAutoSaveEnabled) return;

    const savedDraft = localStorage.getItem("previewDraft");
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (hasMeaningfulUserData(parsed)) {
          if (parsed.rateTable && !parsed.rateSections) {
            parsed.rateSections = [{ id: Date.now(), title: "Material & Labour Rates", workingArea: "", rows: parsed.rateTable }];
            delete parsed.rateTable;
          }
          setPendingDraft(parsed);
          setShowDraftModal(true);
        } else {
          localStorage.removeItem("previewDraft");
          localStorage.removeItem("quotegen_draft");
          localStorage.removeItem("draft");
        }
      } catch (e) {
        console.error("Error reading saved draft:", e);
        localStorage.removeItem("previewDraft");
        localStorage.removeItem("quotegen_draft");
        localStorage.removeItem("draft");
      }
    }
  }, [quotationId]);

  // Debounced Auto-Save Effect (500ms for instant real-time responsiveness)
  useEffect(() => {
    const isAutoSaveEnabled = localStorage.getItem("autoSaveDraftEnabled") !== "false";
    if (!isAutoSaveEnabled) return;

    const timer = setTimeout(() => {
      if (!isDraftDiscardedRef.current && hasMeaningfulUserData(formData)) {
        const draftPayload = {
          ...(useCompanyDefaultsToggle ? applyCompanyDefaults(formData) : formData),
          useCompanyProfileDefaults: useCompanyDefaultsToggle,
          savedStep: currentStep,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem("previewDraft", JSON.stringify(draftPayload));
        window.dispatchEvent(new Event("quotationDataUpdated"));
        setDraftSavedStatus(true);
        setTimeout(() => setDraftSavedStatus(false), 2500);
      } else {
        localStorage.removeItem("previewDraft");
        localStorage.removeItem("quotegen_draft");
        localStorage.removeItem("draft");
        window.dispatchEvent(new Event("quotationDataUpdated"));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData, currentStep, useCompanyDefaultsToggle]);

  const handleNestedChange = (section, field, value) => {
    isDraftDiscardedRef.current = false;
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
    setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  /**
   * 🧹 PERMANENTLY DISCARD DRAFT HANDLER
   */
  const handleDiscardDraft = () => {
    isDraftDiscardedRef.current = true;
    
    // 1. Purge all possible draft storage keys
    localStorage.removeItem("previewDraft");
    localStorage.removeItem("quotegen_draft");
    localStorage.removeItem("draft");
    sessionStorage.removeItem("previewDraft");
    sessionStorage.removeItem("quotegen_draft");

    // 2. Clear in-memory draft state
    setPendingDraft(null);
    setShowDraftModal(false);

    // 3. Reset form to fresh blank state
    const fresh = {
      ...defaultInitialState,
      projectDetails: {
        ...defaultInitialState.projectDetails,
        referenceNo: generateReferenceNo()
      }
    };
    setFormData(applyCompanyDefaults(fresh));
    window.dispatchEvent(new Event("quotationDataUpdated"));
    showToast("Draft discarded successfully.", "info");
  };

  const handleCompanyDefaultsToggle = (enable) => {
    setUseCompanyDefaultsToggle(enable);
    if (enable) {
      setFormData(prev => applyCompanyDefaults(prev));
      showToast("Company defaults active", "success");
    } else {
      setFormData(prev => clearCompanyDefaults(prev));
      showToast("Company defaults disabled - custom entry enabled", "info");
    }
  };

  const copyReferenceNo = () => {
    const ref = formData.projectDetails?.referenceNo || "";
    if (ref) {
      navigator.clipboard.writeText(ref);
      showToast("✓ Reference Number Copied", "success");
    }
  };

  // Company Logo Upload Handler (For Custom Entry Mode)
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("Logo file size must be under 5MB", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target.result;
      handleNestedChange("projectDetails", "companyLogo", dataUrl);
      showToast("Company logo updated!", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    handleNestedChange("projectDetails", "companyLogo", "");
    showToast("Logo removed", "info");
  };

  // Area Calculator Handler
  const handleAreaChange = (field, val) => {
    isDraftDiscardedRef.current = false;
    setFormData(prev => {
      const updatedArea = { ...prev.areaDetails, [field]: val };
      const interior = Number(field === "interiorArea" ? val : updatedArea.interiorArea) || 0;
      const exterior = Number(field === "exteriorArea" ? val : updatedArea.exteriorArea) || 0;
      updatedArea.totalArea = (interior + exterior).toString();
      return { ...prev, areaDetails: updatedArea };
    });
  };

  // Rate Table Handlers
  const handleRateChange = (secId, itemId, field, val) => {
    isDraftDiscardedRef.current = false;
    setFormData(prev => {
      const updated = prev.rateSections.map(sec => {
        if (sec.id !== secId) return sec;
        const updatedRows = (sec.rows || []).map(r => {
          if (r.id !== itemId) return r;
          const updatedRow = { ...r, [field]: val };
          if (field === "labour" || field === "material") {
            const l = Number(field === "labour" ? val : updatedRow.labour) || 0;
            const m = Number(field === "material" ? val : updatedRow.material) || 0;
            updatedRow.total = l + m;
          }
          return updatedRow;
        });
        return { ...sec, rows: updatedRows };
      });
      return { ...prev, rateSections: updated };
    });
  };

  const addCategorySection = () => {
    isDraftDiscardedRef.current = false;
    setFormData(prev => {
      const newSec = {
        id: Date.now(),
        title: `Category #${prev.rateSections.length + 1}`,
        workingArea: "",
        rows: [
          { id: Date.now() + 1, work: "", labour: 0, material: 0, total: 0 }
        ]
      };
      return { ...prev, rateSections: [...prev.rateSections, newSec] };
    });
  };

  const deleteCategorySection = (secId) => {
    isDraftDiscardedRef.current = false;
    setFormData(prev => ({
      ...prev,
      rateSections: prev.rateSections.filter(sec => sec.id !== secId)
    }));
  };

  const handleCategoryTitleChange = (secId, titleVal) => {
    isDraftDiscardedRef.current = false;
    setFormData(prev => ({
      ...prev,
      rateSections: prev.rateSections.map(sec => sec.id === secId ? { ...sec, title: titleVal } : sec)
    }));
  };

  const handleCategoryAreaChange = (secId, areaVal) => {
    isDraftDiscardedRef.current = false;
    setFormData(prev => ({
      ...prev,
      rateSections: prev.rateSections.map(sec => sec.id === secId ? { ...sec, workingArea: areaVal } : sec)
    }));
  };

  const addRowToSection = (secId) => {
    isDraftDiscardedRef.current = false;
    setFormData(prev => ({
      ...prev,
      rateSections: prev.rateSections.map(sec => {
        if (sec.id !== secId) return sec;
        return {
          ...sec,
          rows: [...(sec.rows || []), { id: Date.now(), work: "", labour: 0, material: 0, total: 0 }]
        };
      })
    }));
  };

  const deleteRowFromSection = (secId, itemId) => {
    isDraftDiscardedRef.current = false;
    setFormData(prev => ({
      ...prev,
      rateSections: prev.rateSections.map(sec => {
        if (sec.id !== secId) return sec;
        return {
          ...sec,
          rows: (sec.rows || []).filter(r => r.id !== itemId)
        };
      })
    }));
  };

  // Payment Terms Dynamic Rows Handlers
  const handlePaymentStageChange = (id, field, val) => {
    isDraftDiscardedRef.current = false;
    setFormData(prev => {
      const updatedList = (prev.paymentTermsList || []).map(item => {
        if (item.id !== id) return item;
        return { ...item, [field]: val };
      });
      const newTermsObj = {};
      const newPercentsObj = {};
      updatedList.forEach((item, idx) => {
        newTermsObj[`step${idx + 1}`] = item.stage;
        newPercentsObj[`p${idx + 1}`] = item.percent;
      });
      return {
        ...prev,
        paymentTermsList: updatedList,
        paymentTerms: newTermsObj,
        paymentPercents: newPercentsObj
      };
    });
  };

  const addPaymentStage = () => {
    isDraftDiscardedRef.current = false;
    setFormData(prev => {
      const currentList = prev.paymentTermsList || [];
      const newStage = { id: Date.now(), stage: `Stage #${currentList.length + 1}`, percent: "0" };
      const updatedList = [...currentList, newStage];
      const newTermsObj = {};
      const newPercentsObj = {};
      updatedList.forEach((item, idx) => {
        newTermsObj[`step${idx + 1}`] = item.stage;
        newPercentsObj[`p${idx + 1}`] = item.percent;
      });
      return {
        ...prev,
        paymentTermsList: updatedList,
        paymentTerms: newTermsObj,
        paymentPercents: newPercentsObj
      };
    });
  };

  const deletePaymentStage = (id) => {
    isDraftDiscardedRef.current = false;
    setFormData(prev => {
      const updatedList = (prev.paymentTermsList || []).filter(item => item.id !== id);
      const newTermsObj = {};
      const newPercentsObj = {};
      updatedList.forEach((item, idx) => {
        newTermsObj[`step${idx + 1}`] = item.stage;
        newPercentsObj[`p${idx + 1}`] = item.percent;
      });
      return {
        ...prev,
        paymentTermsList: updatedList,
        paymentTerms: newTermsObj,
        paymentPercents: newPercentsObj
      };
    });
  };

  const grandTotalAmount = formData.rateSections.reduce((acc, sec) => {
    const secRate = (sec.rows || []).reduce((rAcc, r) => rAcc + (Number(r.total) || (Number(r.labour || 0) + Number(r.material || 0))), 0);
    const area = Number(sec.workingArea || 0);
    const est = area > 0 ? (area * secRate) : secRate;
    return acc + est;
  }, 0);

  const discountPercentNum = Number(formData.pricing?.discount || 0);
  const finalDiscountedTotal = grandTotalAmount - (grandTotalAmount * discountPercentNum / 100);

  const paymentTermsTotalPercent = (formData.paymentTermsList || []).reduce((acc, r) => acc + (Number(r.percent) || 0), 0);

  const buildPayload = () => {
    const qId = quotationId || formData._id || formData.projectDetails?.referenceNo || `VXQ-${Date.now()}`;
    const baseForm = useCompanyDefaultsToggle ? applyCompanyDefaults(formData) : formData;
    return {
      ...baseForm,
      useCompanyProfileDefaults: useCompanyDefaultsToggle,
      _id: qId,
      id: qId,
      clientName: baseForm.projectDetails?.clientName || "Client",
      quotationNo: baseForm.projectDetails?.referenceNo || qId,
      grandTotal: finalDiscountedTotal
    };
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.projectDetails?.clientName?.trim()) {
      newErrors.clientName = "Client Name is required.";
      isValid = false;
    }
    if (!formData.projectDetails?.projectName?.trim()) {
      newErrors.projectName = "Project Name is required.";
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      setCurrentStep(1);
      showToast("Please fill in required fields (Client Name & Project Name)", "error");
      setTimeout(() => {
        if (newErrors.clientName && clientNameRef.current) {
          clientNameRef.current.focus();
        } else if (newErrors.projectName && projectNameRef.current) {
          projectNameRef.current.focus();
        }
      }, 100);
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (isSaving) return false;
    if (!validateForm()) return false;

    setIsSaving(true);

    setTimeout(() => {
      let currentRef = formData.projectDetails?.referenceNo;
      const existingQuotations = localDB.getQuotations() || [];
      const isDuplicate = existingQuotations.some(q => q._id !== (quotationId || formData._id) && (q.quotationNo === currentRef || q.projectDetails?.referenceNo === currentRef));

      if (isDuplicate) {
        const freshRef = generateReferenceNo();
        currentRef = freshRef;
        setFormData(prev => ({ ...prev, projectDetails: { ...prev.projectDetails, referenceNo: freshRef } }));
        showToast(`Reference updated to next available: ${freshRef}`, "info");
      }

      const payload = buildPayload();
      payload.projectDetails.referenceNo = currentRef;
      payload.quotationNo = currentRef;

      localDB.saveQuotation(payload);
      localStorage.setItem("previewDraft", JSON.stringify(payload));
      window.dispatchEvent(new Event("quotationDataUpdated"));
      triggerAutoSync("save", payload);
      setIsSaved(true);
      setIsSaving(false);
      if (setQuotationId) setQuotationId(payload._id);
      showToast("✓ Quotation Saved Successfully", "success");
    }, 400);

    return true;
  };

  const handleExportClick = () => {
    if (!isSaved) return;
    admobManager.showInterstitial("Export PDF");
    goToExport();
  };

  const handlePreviewClick = () => {
    if (!validateForm()) return;
    const saved = handleSave();
    if (saved) {
      goToPreview();
    }
  };

  const handleNextStepClick = () => {
    if (currentStep === 1) {
      if (!validateForm()) return;
    }
    setCurrentStep(c => c + 1);
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans pb-36 text-slate-900 selection:bg-blue-500 selection:text-white">
      
      {/* 📌 STICKY TOP HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-2xs print:hidden pt-[env(safe-area-inset-top,0px)]">
        <div className="flex items-center justify-between h-16 px-4 max-w-4xl mx-auto w-full select-none gap-2">
          {/* Left: Back Button */}
          <div className="flex items-center shrink-0">
            <button
              onClick={goBack || goToDashboard}
              className="w-10 h-10 flex items-center justify-center rounded-2xl text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft size={20} strokeWidth={2.2} />
            </button>
          </div>

          {/* Center: Title & Subtitle */}
          <div className="flex-1 text-center min-w-0 px-2">
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight truncate leading-tight">
              {currentStep === 4 ? "Review & Complete" : "Create Quotation"}
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate -mt-0.5">
              Build a professional quotation with AI-powered suggestions
            </p>
          </div>

          {/* Right: Undo, Preview, Save Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setShowResetSheet(true)}
              className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
              title="Reset Form"
              aria-label="Reset Form"
            >
              <RotateCcw size={16} />
            </button>
            
            <button
              onClick={handlePreviewClick}
              className="px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100/80 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all border border-blue-200/60 active:scale-95"
              title="Preview"
            >
              <Eye size={15} />
              <span className="hidden sm:inline">Preview</span>
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-70"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              <span>Save</span>
            </button>
          </div>
        </div>
      </header>

      {/* 📊 STEP WIZARD PROGRESS INDICATOR */}
      <Stepper steps={STEPS} currentStep={currentStep} onStepClick={setCurrentStep} />

      {/* 🔔 FLOATING TOAST NOTIFICATION */}
      {toast.show && (
        <div className={`fixed top-28 left-4 right-4 max-w-md mx-auto z-[100] px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-top-3 duration-200 ${
          toast.type === "success" ? "bg-slate-900 text-white border border-slate-800" : "bg-red-600 text-white"
        }`}>
          {toast.type === "success" ? <CheckCircle2 size={18} className="text-emerald-400 shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
          <span className="flex-1">{toast.message}</span>
        </div>
      )}

      {/* 📄 STEP CONTENT CONTAINER */}
      <main className="max-w-4xl mx-auto px-4 pt-5 space-y-6">

        {/* ======================================================
            STEP 1 - DETAILS
           ====================================================== */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* 🌟 COMPACT COMPANY PROFILE SUMMARY CARD (WHEN TOGGLE IS ON) */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border font-extrabold ${
                    useCompanyDefaultsToggle
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}>
                    {useCompanyDefaultsToggle ? <CheckCircle2 size={20} /> : <Sparkles size={20} />}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                      {useCompanyDefaultsToggle ? "Using Company Profile Defaults" : "Custom Company Details Entry"}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {useCompanyDefaultsToggle
                        ? "Company logo, bank info & terms are loaded automatically from settings."
                        : "Toggle ON to load saved company profile defaults automatically."}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCompanyDefaultsToggle(!useCompanyDefaultsToggle)}
                  className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                    useCompanyDefaultsToggle ? "bg-blue-600" : "bg-slate-300"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    useCompanyDefaultsToggle ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>

              {/* Compact Loaded Details Summary Box */}
              {useCompanyDefaultsToggle && (
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      {companyProfile.companyLogo ? (
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-0.5 overflow-hidden shadow-2xs">
                          <img src={companyProfile.companyLogo} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm border border-blue-100">
                          {companyProfile.companyName ? companyProfile.companyName.charAt(0) : "V"}
                        </div>
                      )}
                      <div>
                        <h5 className="text-xs font-black text-slate-900">{companyProfile.companyName || "Saved Company Profile"}</h5>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {companyProfile.companyPhone ? `Contact: ${companyProfile.companyPhone}` : "Company Contact Loaded"}
                          {companyProfile.companyEmail ? ` • ${companyProfile.companyEmail}` : ""}
                        </p>
                      </div>
                    </div>

                    {goToSettings && (
                      <button
                        type="button"
                        onClick={goToSettings}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-blue-600 border border-blue-200/80 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Settings size={13} />
                        <span>Edit Company Settings</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/60 text-[11px] font-semibold text-slate-600">
                    <div className="flex items-center gap-1.5 text-emerald-700">
                      <Check size={14} className="text-emerald-500 shrink-0" />
                      <span>Company Profile Loaded</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-700">
                      <Check size={14} className="text-emerald-500 shrink-0" />
                      <span>Bank Details Loaded</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-700">
                      <Check size={14} className="text-emerald-500 shrink-0" />
                      <span>Default Terms Loaded</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-700">
                      <Check size={14} className="text-emerald-500 shrink-0" />
                      <span>Scope &amp; Exclusions</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 1. Project Details Card (Quotation Specific Fields) */}
            <FormCard
              sectionNumber="1"
              title="Project Details"
              subtitle="Client info & project reference details"
              icon={<Building2 size={20} />}
            >
              <div className="space-y-4">
                {/* Full Editable Company Logo & Details (Shown ONLY if toggle is OFF) */}
                {!useCompanyDefaultsToggle && (
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-4 mb-2 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 w-full sm:w-auto">
                        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-2xs overflow-hidden flex items-center justify-center shrink-0 p-1">
                          {formData.projectDetails.companyLogo ? (
                            <img src={formData.projectDetails.companyLogo} alt="Logo" className="w-full h-full object-contain" />
                          ) : (
                            <ImageIcon size={24} className="text-slate-400" />
                          )}
                        </div>
                        <div>
                          <h5 className="text-xs font-extrabold text-slate-900">Custom Company Logo</h5>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Appears on top of printable PDF header</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <input
                          type="file"
                          ref={logoInputRef}
                          onChange={handleLogoUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition-all"
                        >
                          <Upload size={14} />
                          <span>{formData.projectDetails.companyLogo ? "Change Logo" : "Upload Logo"}</span>
                        </button>
                        {formData.projectDetails.companyLogo && (
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                            title="Remove Logo"
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    <FormInput
                      label="Company Name"
                      value={formData.projectDetails.companyName}
                      onChange={e => handleNestedChange("projectDetails", "companyName", e.target.value)}
                      placeholder="e.g. VisionX Enterprises"
                    />
                  </div>
                )}

                {/* Quotation Specific Fields (Always Visible) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    inputRef={clientNameRef}
                    name="clientName"
                    label="Client Name *"
                    value={formData.projectDetails.clientName}
                    onChange={e => handleNestedChange("projectDetails", "clientName", e.target.value)}
                    placeholder="e.g. John Doe"
                    error={errors.clientName}
                  />

                  <FormInput
                    inputRef={projectNameRef}
                    name="projectName"
                    label="Project Name *"
                    value={formData.projectDetails.projectName}
                    onChange={e => handleNestedChange("projectDetails", "projectName", e.target.value)}
                    placeholder="e.g. Villa Painting Work"
                    error={errors.projectName}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    label="Reference Number (Auto-Generated)"
                    value={formData.projectDetails.referenceNo}
                    readOnly={true}
                    rightAction={
                      <button
                        type="button"
                        onClick={copyReferenceNo}
                        className="p-2 text-blue-600 hover:bg-blue-100/70 rounded-xl transition-colors cursor-pointer"
                        title="Copy Reference"
                      >
                        <Copy size={16} />
                      </button>
                    }
                  />

                  <FormInput
                    label="Quotation Date"
                    type="date"
                    value={formData.projectDetails.date}
                    onChange={e => handleNestedChange("projectDetails", "date", e.target.value)}
                  />
                </div>

                <FormInput
                  label="Brand Specification"
                  value={formData.projectDetails.paintBrand}
                  onChange={e => handleNestedChange("projectDetails", "paintBrand", e.target.value)}
                  placeholder="e.g. Asian Paints Royale / Dulux Velvet"
                />

                <FormTextarea
                  label="Project / Site Address"
                  rows={2}
                  value={formData.projectDetails.clientAddress}
                  onChange={e => handleNestedChange("projectDetails", "clientAddress", e.target.value)}
                  placeholder="Full site location or billing address..."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    label="Client Contact Number"
                    type="tel"
                    value={formData.projectDetails.clientPhone}
                    onChange={e => handleNestedChange("projectDetails", "clientPhone", e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                  />

                  <FormInput
                    label="Client Email"
                    type="email"
                    value={formData.projectDetails.clientEmail}
                    onChange={e => handleNestedChange("projectDetails", "clientEmail", e.target.value)}
                    placeholder="client@example.com"
                  />
                </div>
              </div>
            </FormCard>

            {/* 2. Area Details Card */}
            <FormCard
              sectionNumber="2"
              title="Area Details"
              subtitle="Total interior and exterior floor/wall area measurements"
              icon={<Calculator size={20} />}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    label="Total Interior Area (Sqft)"
                    type="number"
                    inputMode="decimal"
                    value={formData.areaDetails.interiorArea}
                    onChange={e => handleAreaChange("interiorArea", e.target.value)}
                    placeholder="e.g. 1200"
                  />

                  <FormInput
                    label="Total Exterior Area (Sqft)"
                    type="number"
                    inputMode="decimal"
                    value={formData.areaDetails.exteriorArea}
                    onChange={e => handleAreaChange("exteriorArea", e.target.value)}
                    placeholder="e.g. 800"
                  />
                </div>

                <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      ∑
                    </div>
                    <div>
                      <h6 className="text-xs font-extrabold text-slate-900">Total Calculated Area</h6>
                      <p className="text-[11px] text-slate-500 font-medium">Automatic sum of interior + exterior area</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-blue-700">
                      {formData.areaDetails.totalArea || (Number(formData.areaDetails.interiorArea || 0) + Number(formData.areaDetails.exteriorArea || 0))} Sqft
                    </span>
                  </div>
                </div>
              </div>
            </FormCard>

            {/* 3. Cover Letter Card */}
            <FormCard
              sectionNumber="3"
              title="Cover Letter"
              subtitle="Personalized intro message for client proposal"
              icon={<FileText size={20} />}
            >
              <div className="space-y-4">
                <FormInput
                  label="Subject Line"
                  value={formData.projectDetails.subject}
                  onChange={e => handleNestedChange("projectDetails", "subject", e.target.value)}
                  placeholder="e.g. Quotation for Interior & Exterior Painting Work"
                />

                <FormTextarea
                  label="Cover Letter Body"
                  rows={4}
                  value={formData.textAreas.coverLetter}
                  onChange={e => handleNestedChange("textAreas", "coverLetter", e.target.value)}
                  placeholder="Enter cover letter contents..."
                />
              </div>
            </FormCard>

            {/* 4. Project Timeline Card */}
            <FormCard
              sectionNumber="4"
              title="Project Timeline"
              subtitle="Estimated start date and completion schedule"
              icon={<Clock size={20} />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Start Date"
                  type="date"
                  value={formData.timeline.startDate}
                  onChange={e => handleNestedChange("timeline", "startDate", e.target.value)}
                />

                <FormInput
                  label="Completion Date"
                  type="date"
                  value={formData.timeline.endDate}
                  onChange={e => handleNestedChange("timeline", "endDate", e.target.value)}
                />
              </div>
            </FormCard>

            {/* 6. Bank Details Card (Shown ONLY when Toggle is OFF) */}
            {!useCompanyDefaultsToggle && (
              <FormCard
                sectionNumber="6"
                title="Bank Details"
                subtitle="Payment deposit and bank account info"
                icon={<Landmark size={20} />}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput
                      label="Bank Name"
                      value={formData.bankDetails.bankName}
                      onChange={e => handleNestedChange("bankDetails", "bankName", e.target.value)}
                      placeholder="e.g. HDFC Bank"
                    />

                    <FormInput
                      label="Account Holder"
                      value={formData.bankDetails.accountHolder}
                      onChange={e => handleNestedChange("bankDetails", "accountHolder", e.target.value)}
                      placeholder="e.g. VisionX Enterprises"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormInput
                      label="Account Number"
                      value={formData.bankDetails.accountNumber}
                      onChange={e => handleNestedChange("bankDetails", "accountNumber", e.target.value)}
                      placeholder="e.g. 50100234567"
                    />

                    <FormInput
                      label="IFSC Code"
                      value={formData.bankDetails.ifscCode}
                      onChange={e => handleNestedChange("bankDetails", "ifscCode", e.target.value)}
                      placeholder="e.g. HDFC0001234"
                    />

                    <FormInput
                      label="Branch"
                      value={formData.bankDetails.branch}
                      onChange={e => handleNestedChange("bankDetails", "branch", e.target.value)}
                      placeholder="e.g. MG Road Branch"
                    />
                  </div>
                </div>
              </FormCard>
            )}
          </div>
        )}

        {/* ======================================================
            STEP 2 - RATES
           ====================================================== */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <FormCard
              sectionNumber="1"
              title="Rate Table (Labour + Material)"
              subtitle="Itemized work categories, rates, and area calculations"
              icon={<TableProperties size={20} />}
            >
              <div className="space-y-4">
                {formData.rateSections.map((sec, secIdx) => (
                  <CategoryRateTable
                    key={sec.id || secIdx}
                    section={sec}
                    secIndex={secIdx}
                    editable={true}
                    onTitleChange={handleCategoryTitleChange}
                    onWorkingAreaChange={handleCategoryAreaChange}
                    onItemChange={handleRateChange}
                    onAddItem={addRowToSection}
                    onDeleteItem={deleteRowFromSection}
                    onDeleteSection={deleteCategorySection}
                    canDeleteSection={formData.rateSections.length > 1}
                  />
                ))}

                {/* Add New Rate Section Button */}
                <button
                  type="button"
                  onClick={addCategorySection}
                  className="w-full border-2 border-dashed border-slate-300 hover:border-blue-600 bg-white hover:bg-blue-50/50 text-slate-700 hover:text-blue-700 rounded-2xl py-4 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs font-extrabold text-xs uppercase tracking-wider active:scale-98"
                >
                  <div className="w-7 h-7 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0 font-bold">
                    <Plus size={16} />
                  </div>
                  <span>+ Add Paint Section / Rate Category</span>
                </button>
              </div>
            </FormCard>

            {/* Step 2 Grand Total Summary Banner */}
            <div className="bg-slate-900 rounded-3xl p-5 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-slate-800 flex items-center justify-center text-emerald-400 shrink-0 font-black">
                  ₹
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white leading-tight">Rate Categories Subtotal</h3>
                  <p className="text-slate-400 text-xs mt-0.5 font-medium">Combined total across all active rate sections</p>
                </div>
              </div>
              <div className="text-right w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                <div className="text-2xl font-black text-emerald-400 tracking-tight">
                  ₹{grandTotalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* SECTION 4: Pricing (Discount %, Warranty Years & Final Grand Total) */}
            <FormCard
              sectionNumber="4"
              title="Pricing"
              subtitle="Discounts, warranty, and grand total calculations"
              icon={<DollarSign size={20} />}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    label="Discount (%)"
                    type="number"
                    inputMode="decimal"
                    value={formData.pricing.discount}
                    onChange={e => handleNestedChange("pricing", "discount", e.target.value)}
                    placeholder="e.g. 5"
                  />

                  <FormInput
                    label="Warranty Years"
                    type="text"
                    value={formData.pricing.warranty}
                    onChange={e => handleNestedChange("pricing", "warranty", e.target.value)}
                    placeholder="e.g. 3 Years Warranty"
                  />
                </div>

                {/* Detailed Financial Calculation Breakdown Card */}
                <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl space-y-3 border border-slate-800">
                  <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2.5">
                    <span className="text-slate-400 font-medium">Rate Categories Subtotal</span>
                    <span className="font-extrabold text-white">
                      ₹{grandTotalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  {discountPercentNum > 0 && (
                    <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2.5">
                      <span className="text-slate-400 font-medium">Discount ({discountPercentNum}%)</span>
                      <span className="font-extrabold text-red-400">
                        - ₹{(grandTotalAmount * discountPercentNum / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 shrink-0 font-black">
                        ₹
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-white leading-tight">Final Auto Grand Total</h3>
                        <p className="text-slate-400 text-xs mt-0.5 font-medium">Calculated amount after discount</p>
                      </div>
                    </div>
                    <div className="text-right w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                      <div className="text-2xl font-black text-emerald-400 tracking-tight">
                        ₹{finalDiscountedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      {discountPercentNum > 0 && (
                        <span className="text-[11px] text-slate-400 font-medium">
                          (Includes {discountPercentNum}% Discount)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </FormCard>

          </div>
        )}

        {/* ======================================================
            STEP 3 - TERMS
           ====================================================== */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Compact Terms Summary Indicator (When Company Profile Toggle is ON) */}
            {useCompanyDefaultsToggle && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 font-bold shadow-2xs">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">Default Terms &amp; Scope Loaded</h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">Using saved payment terms, scope, exclusions &amp; validity from settings.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustomTermsOverride(!showCustomTermsOverride)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer transition-colors shrink-0"
                >
                  {showCustomTermsOverride ? "Hide Terms Form" : "Customize Terms"}
                </button>
              </div>
            )}

            {/* Show Terms Cards if Custom Mode is Active OR Toggle is OFF OR User Clicks Customize */}
            {(!useCompanyDefaultsToggle || showCustomTermsOverride) && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* 1. Payment Terms Card */}
                <FormCard
                  sectionNumber="1"
                  title="Payment Terms"
                  subtitle="Dynamic milestone rows with percentage validation"
                  icon={<DollarSign size={20} />}
                >
                  <div className="space-y-4">
                    {/* Header Validation Bar */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/90 rounded-2xl">
                      <span className="text-xs font-bold text-slate-700">Total Milestone Split</span>
                      <div className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 ${
                        paymentTermsTotalPercent === 100
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-amber-100 text-amber-900 border border-amber-200"
                      }`}>
                        {paymentTermsTotalPercent === 100 ? (
                          <>
                            <Check size={14} /> Total: 100% (Validated)
                          </>
                        ) : (
                          <>
                            ⚠️ Total: {paymentTermsTotalPercent}% (Must equal 100%)
                          </>
                        )}
                      </div>
                    </div>

                    {/* Dynamic Stage Rows */}
                    <div className="space-y-3">
                      {(formData.paymentTermsList || []).map((row, idx) => (
                        <div key={row.id || idx} className="flex items-center gap-3">
                          <div className="flex-1">
                            <FormInput
                              placeholder={`Stage #${idx + 1} (e.g. Advance)`}
                              value={row.stage}
                              onChange={e => handlePaymentStageChange(row.id, "stage", e.target.value)}
                            />
                          </div>
                          <div className="w-32">
                            <FormInput
                              type="number"
                              inputMode="decimal"
                              placeholder="%"
                              value={row.percent}
                              onChange={e => handlePaymentStageChange(row.id, "percent", e.target.value)}
                              rightAction={<span className="text-slate-400 font-bold text-xs">%</span>}
                            />
                          </div>
                          {(formData.paymentTermsList || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() => deletePaymentStage(row.id)}
                              className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-colors cursor-pointer shrink-0"
                              title="Delete Stage"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add Stage Button */}
                    <button
                      type="button"
                      onClick={addPaymentStage}
                      className="w-full py-3 text-xs font-extrabold text-blue-600 bg-blue-50/60 hover:bg-blue-100/70 border border-blue-200/60 rounded-2xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus size={16} /> Add Payment Stage
                    </button>
                  </div>
                </FormCard>

                {/* 2. Validity Clause Card */}
                <FormCard
                  sectionNumber="2"
                  title="Validity Clause"
                  subtitle="Offer validity period and conditions"
                  icon={<PenTool size={20} />}
                >
                  <FormTextarea
                    label="Validity Clause"
                    rows={3}
                    value={formData.validity}
                    onChange={e => {
                      isDraftDiscardedRef.current = false;
                      setFormData(prev => ({ ...prev, validity: e.target.value }));
                    }}
                    placeholder="e.g. The price quoted here will be valid for 30 days from the date of issue."
                  />
                </FormCard>

                {/* 3. Scope of Work Card */}
                <FormCard
                  sectionNumber="3"
                  title="Scope of Work"
                  subtitle="Detailed description of work included"
                  icon={<CheckSquare size={20} />}
                >
                  <FormTextarea
                    label="Detailed Scope of Work"
                    rows={4}
                    value={formData.textAreas.scopeOfWork}
                    onChange={e => handleNestedChange("textAreas", "scopeOfWork", e.target.value)}
                    placeholder="Detail all included works..."
                  />
                </FormCard>

                {/* 4. Exclusions Card */}
                <FormCard
                  sectionNumber="4"
                  title="Exclusions"
                  subtitle="Work items or materials not covered in this quotation"
                  icon={<AlertCircle size={20} />}
                >
                  <FormTextarea
                    label="Excluded Items / Works"
                    rows={3}
                    value={formData.textAreas.exclusions}
                    onChange={e => handleNestedChange("textAreas", "exclusions", e.target.value)}
                    placeholder="e.g. Civil repairs, electrical alterations..."
                  />
                </FormCard>

                {/* 5. Terms & Conditions Card */}
                <FormCard
                  sectionNumber="5"
                  title="Terms & Conditions"
                  subtitle="Legal and contractual guidelines"
                  icon={<ShieldCheck size={20} />}
                >
                  <FormTextarea
                    label="Terms & Conditions"
                    rows={4}
                    value={formData.textAreas.termsConditions}
                    onChange={e => handleNestedChange("textAreas", "termsConditions", e.target.value)}
                    placeholder="Specify all terms & conditions..."
                  />
                </FormCard>
              </div>
            )}
          </div>
        )}

        {/* ======================================================
            STEP 4 - REVIEW
           ====================================================== */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Review Summary Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-blue-600" /> Quotation Review Summary
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Verify all quotation details before saving.</p>
              </div>

              <div className="space-y-3 pt-1 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    <User size={14} className="text-slate-400" /> Client Name
                  </span>
                  <span className="font-extrabold text-slate-900 text-right">{formData.projectDetails.clientName || "-"}</span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    <Building2 size={14} className="text-slate-400" /> Company
                  </span>
                  <span className="font-extrabold text-slate-900 text-right">
                    {companyProfile.companyName || formData.projectDetails.clientCompany || formData.projectDetails.companyName || "-"}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    <FileText size={14} className="text-slate-400" /> Project Name
                  </span>
                  <span className="font-extrabold text-slate-900 text-right">{formData.projectDetails.projectName || "-"}</span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    <Tag size={14} className="text-slate-400" /> Reference Number
                  </span>
                  <span className="font-mono font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg text-xs tracking-tight">
                    {formData.projectDetails.referenceNo}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    <Layers size={14} className="text-slate-400" /> Total Items
                  </span>
                  <span className="font-extrabold text-slate-900">{formData.rateSections.reduce((acc, sec) => acc + sec.rows.length, 0)} items</span>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" /> Date Created
                  </span>
                  <span className="font-extrabold text-slate-900">{formData.projectDetails.date || new Date().toISOString().split("T")[0]}</span>
                </div>
              </div>
            </div>

            {/* Signature & Signatory Designation Card */}
            <FormCard
              sectionNumber="Review"
              title="Authorized Signature"
              subtitle="Signatory details printed on quotation footer"
              icon={<PenTool size={20} />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Authorized Signatory"
                  value={formData.signature.name || companyProfile.signature?.name || companyProfile.companyName || ""}
                  onChange={e => handleNestedChange("signature", "name", e.target.value)}
                  placeholder="e.g. Sanjeev Kumar"
                />
                <FormInput
                  label="Designation"
                  value={formData.signature.designation || companyProfile.signature?.designation || ""}
                  onChange={e => handleNestedChange("signature", "designation", e.target.value)}
                  placeholder="e.g. Project Director"
                />
              </div>
            </FormCard>

            {/* Review Action Buttons */}
            <div className="space-y-4 pt-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-98 transition-all cursor-pointer disabled:opacity-75"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Saving Quotation...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Save Quotation</span>
                  </>
                )}
              </button>

              <button
                onClick={handlePreviewClick}
                className="w-full h-14 rounded-2xl bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-2 shadow-2xs active:scale-98 transition-all cursor-pointer"
              >
                <Eye size={16} className="text-blue-600" /> Generate Preview
              </button>

              {isSaved ? (
                <button
                  onClick={handleExportClick}
                  className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
                >
                  <Download size={16} /> Export PDF
                </button>
              ) : (
                <div className="w-full py-3.5 px-4 rounded-2xl bg-slate-100 border border-slate-200/80 text-center">
                  <p className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1.5">
                    <Info size={14} className="text-blue-600 shrink-0" /> Save quotation to enable PDF export.
                  </p>
                </div>
              )}

              <div className="pt-1 flex justify-center">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="text-slate-600 font-extrabold text-xs flex items-center gap-1.5 py-2.5 px-4 rounded-xl hover:bg-slate-200/60 active:scale-95 transition-all cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back to Terms
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 📌 PINNED STEPPER NAVIGATION BAR (STEPS 1–3) */}
        {currentStep < 4 && (
          <div className="flex gap-3 pt-4">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(c => c - 1)}
                className="flex-1 h-14 rounded-2xl border border-slate-200/90 bg-white text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-98 transition-all"
              >
                <ArrowLeft size={16} /> Back
              </button>
            )}
            <button
              onClick={handleNextStepClick}
              className="flex-1 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer ml-auto shadow-md shadow-blue-600/20 active:scale-98 transition-all"
            >
              <span>Next</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

      </main>

      {/* 🪄 COMPANY DEFAULTS DIALOG */}
      {showCompanyDefaultsDialog && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setShowCompanyDefaultsDialog(false)} />
          <div className="relative bg-white rounded-3xl p-6 shadow-2xl space-y-4 max-w-sm w-full animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Use Saved Company Information?</h3>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                We found saved company defaults. Do you want to automatically fill this quotation with your saved company details, bank details and default terms?
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  handleCompanyDefaultsToggle(false);
                  setShowCompanyDefaultsDialog(false);
                }}
                className="flex-1 h-12 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs cursor-pointer active:bg-slate-50"
              >
                Skip
              </button>
              <button
                onClick={() => {
                  handleCompanyDefaultsToggle(true);
                  setShowCompanyDefaultsDialog(false);
                }}
                className="flex-1 h-12 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer shadow-md shadow-blue-600/20 active:scale-98 transition-transform"
              >
                Use Defaults
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔄 RESTORE UNFINISHED DRAFT MODAL */}
      {showDraftModal && (
        <div className="fixed inset-0 z-[70] flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" />
          <div className="relative bg-white rounded-t-3xl p-6 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <RotateCcw size={20} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">Restore Unfinished Draft?</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">An unfinished quotation draft was found on this device.</p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleDiscardDraft}
                className="flex-1 h-12 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs cursor-pointer active:bg-slate-50"
              >
                Discard Draft
              </button>
              <button
                onClick={() => {
                  if (pendingDraft) {
                    setFormData(pendingDraft);
                    if (pendingDraft.savedStep) setCurrentStep(pendingDraft.savedStep);
                  }
                  setShowDraftModal(false);
                  showToast("Draft restored successfully!", "success");
                }}
                className="flex-1 h-12 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer shadow-md shadow-blue-600/20 active:scale-98 transition-transform"
              >
                Continue Editing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⚠️ RESET FORM BOTTOM SHEET */}
      {showResetSheet && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setShowResetSheet(false)} />
          <div className="relative bg-white rounded-t-3xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto" />
            <p className="font-bold text-slate-900 text-sm">Reset Quotation Form?</p>
            <p className="text-xs text-slate-500 font-medium">All unsaved fields will be reset to default initial values.</p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowResetSheet(false)} className="flex-1 h-12 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs cursor-pointer">Cancel</button>
              <button
                onClick={() => {
                  handleDiscardDraft();
                  setShowResetSheet(false);
                }}
                className="flex-1 h-12 rounded-xl bg-red-600 text-white font-bold text-xs cursor-pointer"
              >
                Reset Form
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/**
 * 📦 Premium Enterprise Section Card Container
 */
function FormCard({ sectionNumber, title, subtitle, children, icon }) {
  return (
    <section className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.05)] transition-all duration-200 space-y-5">
      <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
        {icon && (
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold border border-blue-100/60 shadow-2xs">
            {icon}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
              Section {sectionNumber}
            </span>
            <h3 className="text-base font-extrabold text-slate-900 leading-tight">{title}</h3>
          </div>
          {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div>
        {children}
      </div>
    </section>
  );
}

/**
 * 🔤 Premium Enterprise Form Input
 */
function FormInput({
  label,
  type = "text",
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  readOnly = false,
  disabled = false,
  error,
  rightAction,
  inputRef,
  id,
  autoComplete,
  inputMode,
  name
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          id={id}
          name={name}
          ref={inputRef}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          value={value || ""}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          readOnly={readOnly}
          disabled={disabled || readOnly}
          className={`w-full h-14 bg-slate-50/70 border rounded-2xl px-4 text-xs font-semibold text-slate-900 focus:outline-none transition-all ${
            error
              ? "border-red-500 bg-red-50/20 text-red-900 focus:border-red-600 focus:ring-4 focus:ring-red-500/10"
              : readOnly
              ? "bg-slate-100/90 border-slate-200 cursor-not-allowed font-mono text-slate-700 font-bold"
              : "border-slate-200/90 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          } ${rightAction ? "pr-12" : ""}`}
        />
        {rightAction && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightAction}
          </div>
        )}
      </div>
      {error && (
        <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}

/**
 * 📝 Premium Enterprise Form Textarea
 */
function FormTextarea({
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  rows = 4,
  readOnly = false,
  disabled = false,
  error,
  inputRef,
  id,
  name
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={id}
        name={name}
        ref={inputRef}
        rows={rows}
        value={value || ""}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled || readOnly}
        className={`w-full bg-slate-50/70 border rounded-2xl p-4 text-xs font-medium text-slate-900 focus:outline-none transition-all resize-y min-h-[140px] leading-relaxed ${
          error
            ? "border-red-500 bg-red-50/20 text-red-900 focus:border-red-600 focus:ring-4 focus:ring-red-500/10"
            : readOnly
            ? "bg-slate-100/90 border-slate-200 cursor-not-allowed font-mono text-slate-700 font-bold"
            : "border-slate-200/90 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
        }`}
      />
      {error && (
        <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}