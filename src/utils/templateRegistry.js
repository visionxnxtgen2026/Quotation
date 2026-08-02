/**
 * 🎨 TemplateRegistry — Enterprise Template-Driven Architecture
 * Maps every template to exactly ONE output format (PDF, Word, Excel, Image).
 * Supports adding unlimited new templates dynamically.
 */

export const FORMAT_TYPES = [
  { id: "pdf", label: "PDF", name: "PDF Document", icon: "📄", description: "Print-ready vector PDF proposal" },
  { id: "docx", label: "WORD", name: "Microsoft Word", icon: "📝", description: "Native editable Word document (.docx)" },
  { id: "xlsx", label: "EXCEL", name: "Microsoft Excel", icon: "📊", description: "Itemized financial spreadsheet (.xlsx)" },
  { id: "png", label: "IMAGE", name: "High-Res Image", icon: "🖼️", description: "PNG graphic snapshot for messaging" },
];

export const TEMPLATE_COLLECTIONS = {
  pdf: [
    {
      id: "corporate-blue",
      name: "Corporate Blue",
      format: "pdf",
      industry: "IT & Technology",
      subtitle: "Modern corporate proposal for IT & Software",
      color: "bg-blue-600",
      rendererKey: "corporateblue",
    },
    {
      id: "minimal-white",
      name: "Minimal White",
      format: "pdf",
      industry: "Architecture & Consulting",
      subtitle: "Apple-inspired minimal design with generous whitespace",
      color: "bg-slate-800",
      rendererKey: "minimalwhite",
    },
    {
      id: "construction-yellow",
      name: "Construction Heavy",
      format: "pdf",
      industry: "Construction & Engineering",
      subtitle: "Industrial yellow & charcoal accents with project panel",
      color: "bg-amber-500",
      rendererKey: "construction",
    },
    {
      id: "luxury-gold",
      name: "Luxury Black & Gold",
      format: "pdf",
      industry: "Interior Design & Luxury",
      subtitle: "Black header with metallic gold accents & luxury typography",
      color: "bg-amber-600",
      rendererKey: "luxurygold",
    },
    {
      id: "paint-contractor",
      name: "Paint Contractor",
      format: "pdf",
      industry: "Painting & Decorating",
      subtitle: "Scope breakdown, surface prep & paint brand cards",
      color: "bg-teal-600",
      rendererKey: "paintcontractor",
    },
    {
      id: "modern-gradient",
      name: "Modern Gradient",
      format: "pdf",
      industry: "Startup & Digital Services",
      subtitle: "Vibrant gradient headers, rounded cards & colorful badges",
      color: "bg-indigo-600",
      rendererKey: "moderngradient",
    },
    {
      id: "executive-proposal",
      name: "Executive Proposal",
      format: "pdf",
      industry: "Enterprise & Boardroom",
      subtitle: "Executive cover header, financial summary & timeline",
      color: "bg-slate-900",
      rendererKey: "executiveproposal",
    },
    {
      id: "invoice-hybrid",
      name: "Invoice Hybrid",
      format: "pdf",
      industry: "Accounting & Finance",
      subtitle: "Quotation + Invoice hybrid layout with bank details & QR",
      color: "bg-emerald-600",
      rendererKey: "invoicehybrid",
    },
    {
      id: "classic-business",
      name: "Classic Business",
      format: "pdf",
      industry: "Traditional & Legal",
      subtitle: "Centered company header, formal serif typography & borders",
      color: "bg-slate-700",
      rendererKey: "classicbusiness",
    },
    {
      id: "creative-studio",
      name: "Creative Studio",
      format: "pdf",
      industry: "Creative Agency & Studio",
      subtitle: "Asymmetrical hero layout with dark contrast sidebar",
      color: "bg-rose-600",
      rendererKey: "creativestudio",
    },
  ],

  docx: [
    {
      id: "word-standard",
      name: "Editable Word Document",
      format: "docx",
      subtitle: "Native Microsoft Word Document (.docx)",
      color: "bg-blue-600",
      rendererKey: "docx",
    },
  ],

  xlsx: [
    {
      id: "excel-standard",
      name: "Excel Financial Spreadsheet",
      format: "xlsx",
      subtitle: "Native Microsoft Excel Worksheet (.xlsx)",
      color: "bg-emerald-600",
      rendererKey: "xlsx",
    },
  ],

  png: [
    {
      id: "image-standard",
      name: "High-Res Graphic Snapshot",
      format: "png",
      subtitle: "High-Resolution Image Snapshot (.png)",
      color: "bg-purple-600",
      rendererKey: "png",
    },
  ],
};

/** Get templates for a specific format */
export function getTemplatesByFormat(format = "pdf") {
  const normalized = format.toLowerCase();
  return TEMPLATE_COLLECTIONS[normalized] || TEMPLATE_COLLECTIONS.pdf;
}

/** Find template object by ID across all formats */
export function getTemplateDetails(templateId) {
  if (!templateId) return TEMPLATE_COLLECTIONS.pdf[0];
  for (const fmtKey in TEMPLATE_COLLECTIONS) {
    const found = TEMPLATE_COLLECTIONS[fmtKey].find((t) => t.id === templateId || t.rendererKey === templateId);
    if (found) return found;
  }
  return TEMPLATE_COLLECTIONS.pdf[0];
}

/** Get default template for a format */
export function getDefaultTemplateForFormat(format = "pdf") {
  const list = getTemplatesByFormat(format);
  return list[0] || TEMPLATE_COLLECTIONS.pdf[0];
}
