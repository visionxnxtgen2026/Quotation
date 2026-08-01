/**
 * Helper utilities for dynamic template rendering
 */

// Returns true if value is non-empty, non-null, non-undefined, and not a blank placeholder
export const hasVal = (val) => {
  if (val === null || val === undefined) return false;
  if (typeof val === "string") {
    const trimmed = val.trim();
    return (
      trimmed !== "" &&
      trimmed !== "null" &&
      trimmed !== "undefined" &&
      trimmed !== "N/A" &&
      trimmed !== "-"
    );
  }
  if (typeof val === "number") return !isNaN(val) && val > 0;
  if (Array.isArray(val)) return val.length > 0 && val.some((item) => hasVal(item));
  if (typeof val === "object") return Object.values(val).some((item) => hasVal(item));
  return Boolean(val);
};

// Returns true for non-zero numbers or non-zero numeric strings
export const hasPositiveNum = (val) => {
  if (val === null || val === undefined) return false;
  const num = Number(val);
  return !isNaN(num) && num > 0;
};

// Returns true if any item in the array has a valid non-zero or non-empty value for key
export const hasColValue = (items, key) => {
  if (!Array.isArray(items) || items.length === 0) return false;
  return items.some((item) => {
    const val = item[key];
    if (key === "labour" || key === "material" || key === "rate" || key === "total" || key === "amount" || key === "qty" || key === "quantity") {
      return hasPositiveNum(val);
    }
    return hasVal(val);
  });
};

// ---------------------------------------------------------------------------
// TEMPLATE REGISTRY
// Maps every template id to its metadata including the default output format.
// outputFormat: "pdf" | "docx"
// Users can override this per-template; the choice is persisted in localStorage.
// ---------------------------------------------------------------------------
export const TEMPLATE_REGISTRY = [
  {
    id: "classic",
    name: "Classic",
    color: "bg-slate-700",
    description: "Traditional professional proposal layout",
    outputFormat: "pdf",
  },
  {
    id: "modern",
    name: "Modern",
    color: "bg-blue-600",
    description: "Clean contemporary client-facing proposal",
    outputFormat: "pdf",
  },
  {
    id: "corporate",
    name: "Corporate",
    color: "bg-slate-900",
    description: "Board-level enterprise presentation",
    outputFormat: "pdf",
  },
  {
    id: "compact",
    name: "Compact",
    color: "bg-emerald-600",
    description: "Concise single-page summary",
    outputFormat: "pdf",
  },
  {
    id: "creative",
    name: "Creative",
    color: "bg-purple-600",
    description: "Visual premium design proposal",
    outputFormat: "pdf",
  },
  {
    id: "grouped",
    name: "Grouped",
    color: "bg-rose-600",
    description: "Category-based rate breakdown",
    outputFormat: "pdf",
  },
  {
    id: "obsidian",
    name: "Obsidian",
    color: "bg-amber-500",
    description: "Dark premium proposal with gold accents",
    outputFormat: "pdf",
  },
  {
    id: "sovereign",
    name: "Sovereign",
    color: "bg-red-700",
    description: "High-end executive proposal",
    outputFormat: "pdf",
  },
  {
    id: "executive",
    name: "Executive",
    color: "bg-blue-900",
    description: "Formal executive summary layout",
    outputFormat: "pdf",
  },
  {
    id: "businesspro",
    name: "Business Pro",
    color: "bg-slate-800",
    description: "Full-featured business proposal",
    outputFormat: "pdf",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    color: "bg-amber-600",
    description: "Enterprise-grade detailed proposal",
    outputFormat: "pdf",
  },
  {
    id: "contractor",
    name: "Contractor",
    color: "bg-emerald-800",
    description: "Contractor estimate & work order",
    outputFormat: "pdf",
  },
  {
    id: "signature",
    name: "Signature",
    color: "bg-yellow-600",
    description: "Editable contract for signing",
    outputFormat: "docx",
  },
];

// Supported output formats (xlsx and png are future placeholders)
export const OUTPUT_FORMATS = [
  {
    id: "pdf",
    label: "PDF",
    icon: "📄",
    desc: "Print-ready PDF",
    enabled: true,
  },
  {
    id: "docx",
    label: "Word",
    icon: "📝",
    desc: "Editable .docx",
    enabled: true,
  },
  {
    id: "xlsx",
    label: "Excel",
    icon: "📊",
    desc: "Coming Soon",
    enabled: false,
  },
  {
    id: "png",
    label: "Image",
    icon: "🖼️",
    desc: "Coming Soon",
    enabled: false,
  },
];

/** Storage key for a template's user-chosen output format */
const formatKey = (templateId) => `templateOutputFormat_${templateId}`;

/** Get the resolved output format for a template (user override → registry default) */
export const getTemplateOutputFormat = (templateId) => {
  const saved = localStorage.getItem(formatKey(templateId));
  if (saved) return saved;
  const entry = TEMPLATE_REGISTRY.find((t) => t.id === templateId);
  return entry?.outputFormat || "pdf";
};

/** Persist a user's output format choice for a template */
export const setTemplateOutputFormat = (templateId, formatId) => {
  localStorage.setItem(formatKey(templateId), formatId);
};

/** Get full registry entry for a template id */
export const getTemplateById = (templateId) =>
  TEMPLATE_REGISTRY.find((t) => t.id === templateId) || TEMPLATE_REGISTRY[0];
