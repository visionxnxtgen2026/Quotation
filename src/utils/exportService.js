import { exportEnterprisePDF } from "./pdfExporter.js";

/**
 * 📦 ExportService — Enterprise Multi-Format Quotation Exporter
 * Architecture:
 * - PDFGenerator  → html2canvas + jsPDF  (real PDF)
 * - WordGenerator → docx (npm)           (real OOXML .docx)
 * - ExcelGenerator  (future)
 * - ImageGenerator  (future)
 * - HTMLGenerator   (future)
 */

// ---------------------------------------------------------------------------
// PDF Generator
// ---------------------------------------------------------------------------
export const PDFGenerator = {
  id: "pdf",
  name: "PDF Document",
  ext: ".pdf",
  mime: "application/pdf",
  subtitle: "Print-ready • Best for clients • Preserves layout exactly • Supports multiple pages",
  generate: async (element, filename, mappedData) => {
    return await exportEnterprisePDF(element, filename, mappedData);
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const esc = (str) =>
  String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const fmt = (val) => (val !== undefined && val !== null && val !== "" ? String(val) : "—");
const fmtMoney = (val) => {
  const n = Number(val);
  return isNaN(n) ? "—" : `₹ ${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
};

// Convert a base64 data URL to a Uint8Array (used for embedded images)
const dataUrlToUint8Array = (dataUrl) => {
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

// Fetch an image URL and return its bytes + mime type
const fetchImageBytes = async (src) => {
  try {
    if (!src || src.trim() === "") return null;
    if (src.startsWith("data:")) {
      const mime = src.split(";")[0].split(":")[1] || "image/png";
      return { bytes: dataUrlToUint8Array(src), mime };
    }
    const res = await fetch(src);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const mime = res.headers.get("content-type") || "image/png";
    return { bytes: new Uint8Array(buf), mime };
  } catch {
    return null;
  }
};

const mimeToImageType = (mime) => {
  if (!mime) return "PNG";
  if (mime.includes("jpeg") || mime.includes("jpg")) return "JPEG";
  if (mime.includes("gif")) return "GIF";
  if (mime.includes("bmp")) return "BMP";
  return "PNG";
};

// ---------------------------------------------------------------------------
// Word Generator — Real OOXML .docx via `docx` npm package
// ---------------------------------------------------------------------------
export const WordGenerator = {
  id: "docx",
  name: "Microsoft Word (.docx)",
  ext: ".docx",
  mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  subtitle: "Editable document • Ideal for making changes later • Preserves headings, tables & formatting",

  generate: async (_element, filename, mappedData = {}) => {
    // Lazily import the docx library (tree-shakeable, keeps bundle small when not used)
    const {
      Document,
      Packer,
      Paragraph,
      Table,
      TableRow,
      TableCell,
      TextRun,
      HeadingLevel,
      AlignmentType,
      WidthType,
      ShadingType,
      BorderStyle,
      ImageRun,
      PageOrientation,
      VerticalAlign,
      convertInchesToTwip,
    } = await import("docx");

    // ------------------------------------------------------------------
    // Extract data from mappedData
    // ------------------------------------------------------------------
    const d = mappedData;
    const companyName = fmt(d.companyName);
    const companyTagline = fmt(d.companyTagline);
    const companyAddress = fmt(d.companyAddress);
    const companyPhone = fmt(d.companyPhone);
    const companyEmail = fmt(d.companyEmail);
    const gstNo = fmt(d.gstNo);
    const website = fmt(d.website);

    const clientName = fmt(d.clientName);
    const clientCompany = fmt(d.clientCompany);
    const clientAddress = fmt(d.clientAddress);
    const clientPhone = fmt(d.clientPhone);
    const clientEmail = fmt(d.clientEmail);

    const projectName = fmt(d.projectName);
    const refNo = fmt(d.referenceNo || d.quotationNo);
    const dateStr = fmt(d.date);
    const paintBrand = fmt(d.paintBrand);

    const sections = d.sections || d.rateSections || [];
    const bankDetails = d.bankDetails || {};
    const signature = d.signature || {};
    const textAreas = d.textAreas || {};
    const validity = fmt(d.validity);

    const grandTotal = fmtMoney(d.grandTotal);
    const discount = d.discountPercent || d.discount || 0;
    const subtotal = fmtMoney(d.subtotal || d.baseTotalNum);

    // ------------------------------------------------------------------
    // Color palette
    // ------------------------------------------------------------------
    const COLOR = {
      headerBg: "0F172A",   // slate-900
      headerFg: "FFFFFF",
      subheaderBg: "1E293B", // slate-800
      subheaderFg: "FFFFFF",
      rowAltBg: "F8FAFC",   // slate-50
      rowBorderColor: "CBD5E1",
      accentGreen: "059669",
      accentBlue: "2563EB",
      labelGray: "64748B",
      bodyText: "0F172A",
    };

    const borderStyle = {
      style: BorderStyle.SINGLE,
      size: 4,
      color: COLOR.rowBorderColor,
    };
    const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };

    // ------------------------------------------------------------------
    // Reusable style helpers
    // ------------------------------------------------------------------
    const h1 = (text) =>
      new Paragraph({
        text,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 120 },
        run: { color: COLOR.bodyText, bold: true, size: 36 },
      });

    const h2 = (text) =>
      new Paragraph({
        text,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 80 },
        run: { color: COLOR.headerBg, bold: true, size: 28 },
      });

    const h3 = (text) =>
      new Paragraph({
        children: [new TextRun({ text, bold: true, size: 24, color: COLOR.headerBg })],
        spacing: { before: 200, after: 60 },
      });

    const body = (text, opts = {}) =>
      new Paragraph({
        children: [new TextRun({ text: fmt(text), size: 20, color: COLOR.bodyText, ...opts })],
        spacing: { before: 40, after: 40 },
      });

    const labelValue = (label, value) =>
      new Paragraph({
        children: [
          new TextRun({ text: `${label}: `, bold: true, size: 20, color: COLOR.labelGray }),
          new TextRun({ text: fmt(value), size: 20, color: COLOR.bodyText }),
        ],
        spacing: { before: 40, after: 40 },
      });

    const spacer = (spacing = 200) =>
      new Paragraph({ text: "", spacing: { before: spacing, after: 0 } });

    const sectionDivider = () =>
      new Paragraph({
        text: "",
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR.rowBorderColor } },
        spacing: { before: 160, after: 160 },
      });

    // Header cell helper
    const headerCell = (text, widthPct) =>
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text, bold: true, size: 18, color: COLOR.headerFg })],
            alignment: AlignmentType.LEFT,
          }),
        ],
        width: { size: widthPct, type: WidthType.PERCENTAGE },
        shading: { fill: COLOR.headerBg, type: ShadingType.SOLID },
        borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        verticalAlign: VerticalAlign.CENTER,
      });

    const dataCell = (text, widthPct, opts = {}) =>
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: fmt(text), size: 18, color: opts.color || COLOR.bodyText, bold: opts.bold || false })],
            alignment: opts.align || AlignmentType.LEFT,
          }),
        ],
        width: { size: widthPct, type: WidthType.PERCENTAGE },
        shading: opts.shade ? { fill: opts.shade, type: ShadingType.SOLID } : undefined,
        borders: {
          top: borderStyle,
          bottom: borderStyle,
          left: borderStyle,
          right: borderStyle,
        },
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        verticalAlign: VerticalAlign.CENTER,
      });

    // ------------------------------------------------------------------
    // Logo image (optional)
    // ------------------------------------------------------------------
    const logoSrc = d.companyLogo || d.projectDetails?.companyLogo || "";
    const logoData = logoSrc ? await fetchImageBytes(logoSrc) : null;

    // ------------------------------------------------------------------
    // Build document children array
    // ------------------------------------------------------------------
    const children = [];

    // ---------- HEADER: Company info + optional logo ----------
    if (logoData) {
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: logoData.bytes,
              type: mimeToImageType(logoData.mime),
              transformation: { width: 120, height: 60 },
            }),
          ],
          spacing: { after: 80 },
        })
      );
    }

    children.push(
      new Paragraph({
        children: [new TextRun({ text: companyName, bold: true, size: 40, color: COLOR.headerBg })],
        spacing: { after: 40 },
      })
    );
    if (companyTagline !== "—") {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: companyTagline, size: 20, color: COLOR.labelGray, italics: true })],
          spacing: { after: 40 },
        })
      );
    }
    if (companyAddress !== "—") children.push(labelValue("Address", companyAddress));
    if (companyPhone !== "—") children.push(labelValue("Phone", companyPhone));
    if (companyEmail !== "—") children.push(labelValue("Email", companyEmail));
    if (gstNo !== "—") children.push(labelValue("GST No", gstNo));
    if (website !== "—") children.push(labelValue("Website", website));

    children.push(sectionDivider());

    // ---------- Document Title ----------
    children.push(h1("QUOTATION PROPOSAL"));
    children.push(labelValue("Reference No", refNo));
    children.push(labelValue("Date", dateStr));
    children.push(labelValue("Project", projectName));
    if (paintBrand !== "—") children.push(labelValue("Brand Specification", paintBrand));

    children.push(sectionDivider());

    // ---------- Client Details ----------
    children.push(h2("Client Details"));
    children.push(labelValue("Client Name", clientName));
    if (clientCompany !== "—") children.push(labelValue("Company", clientCompany));
    if (clientAddress !== "—") children.push(labelValue("Address", clientAddress));
    if (clientPhone !== "—") children.push(labelValue("Phone", clientPhone));
    if (clientEmail !== "—") children.push(labelValue("Email", clientEmail));

    children.push(sectionDivider());

    // ---------- Rate Sections / Items ----------
    if (sections.length > 0) {
      children.push(h2("Itemized Rate Breakdown"));

      for (const sec of sections) {
        children.push(h3(sec.title || "Work Category"));

        const rows = sec.rows || sec.items || [];
        if (rows.length > 0) {
          // Header row
          const tableRows = [
            new TableRow({
              children: [
                headerCell("#", 5),
                headerCell("Work Description", 45),
                headerCell("Labour (₹)", 15),
                headerCell("Material (₹)", 15),
                headerCell("Total (₹)", 20),
              ],
              tableHeader: true,
            }),
          ];

          rows.forEach((row, i) => {
            const shade = i % 2 === 1 ? COLOR.rowAltBg : "FFFFFF";
            tableRows.push(
              new TableRow({
                children: [
                  dataCell(String(i + 1), 5, { shade }),
                  dataCell(row.desc || row.work || row.description || "", 45, { shade }),
                  dataCell(fmt(row.labour), 15, { shade, align: AlignmentType.RIGHT }),
                  dataCell(fmt(row.material), 15, { shade, align: AlignmentType.RIGHT }),
                  dataCell(
                    row.total !== undefined
                      ? `₹ ${Number(row.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                      : "—",
                    20,
                    { shade, align: AlignmentType.RIGHT, bold: true }
                  ),
                ],
              })
            );
          });

          // Section subtotal row
          const secTotal =
            rows.reduce((acc, r) => acc + Number(r.total || 0), 0);
          tableRows.push(
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Section Total", bold: true, size: 18, color: COLOR.headerFg })] })],
                  columnSpan: 4,
                  shading: { fill: COLOR.subheaderBg, type: ShadingType.SOLID },
                  borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                  margins: { top: 60, bottom: 60, left: 100, right: 100 },
                }),
                dataCell(
                  `₹ ${secTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
                  20,
                  { shade: COLOR.subheaderBg, bold: true, color: "FFFFFF", align: AlignmentType.RIGHT }
                ),
              ],
            })
          );

          children.push(
            new Table({
              rows: tableRows,
              width: { size: 100, type: WidthType.PERCENTAGE },
            })
          );
          children.push(spacer(120));
        }
      }

      // Grand Total block
      children.push(sectionDivider());
      const totalsTable = new Table({
        rows: [
          new TableRow({
            children: [
              dataCell("Subtotal", 70, { shade: COLOR.rowAltBg, bold: true }),
              dataCell(subtotal, 30, { shade: COLOR.rowAltBg, align: AlignmentType.RIGHT }),
            ],
          }),
          ...(Number(discount) > 0
            ? [
                new TableRow({
                  children: [
                    dataCell(`Discount (${discount}%)`, 70, { shade: "FFF8F0" }),
                    dataCell(`- ${fmtMoney((Number(d.baseTotalNum || 0) * Number(discount)) / 100)}`, 30, {
                      shade: "FFF8F0",
                      align: AlignmentType.RIGHT,
                      color: "DC2626",
                    }),
                  ],
                }),
              ]
            : []),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "GRAND TOTAL", bold: true, size: 26, color: COLOR.headerFg })] })],
                width: { size: 70, type: WidthType.PERCENTAGE },
                shading: { fill: COLOR.headerBg, type: ShadingType.SOLID },
                borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                margins: { top: 100, bottom: 100, left: 120, right: 120 },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: grandTotal, bold: true, size: 26, color: "34D399" })],
                    alignment: AlignmentType.RIGHT,
                  }),
                ],
                width: { size: 30, type: WidthType.PERCENTAGE },
                shading: { fill: COLOR.headerBg, type: ShadingType.SOLID },
                borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                margins: { top: 100, bottom: 100, left: 120, right: 120 },
              }),
            ],
          }),
        ],
        width: { size: 100, type: WidthType.PERCENTAGE },
      });
      children.push(totalsTable);
      children.push(spacer(200));
    }

    // ---------- Text Areas ----------
    const textSections = [
      { key: "coverLetter", label: "Cover Letter" },
      { key: "scopeOfWork", label: "Scope of Work" },
      { key: "exclusions", label: "Exclusions" },
      { key: "termsConditions", label: "Terms & Conditions" },
    ];
    for (const ts of textSections) {
      const text = textAreas[ts.key] || d[ts.key] || "";
      if (!text || text.trim() === "") continue;
      children.push(h2(ts.label));
      text.split("\n").forEach((line) => {
        children.push(body(line.trim() || " "));
      });
      children.push(spacer(80));
    }

    if (validity && validity !== "—") {
      children.push(h2("Validity Clause"));
      children.push(body(validity));
      children.push(spacer(80));
    }

    // ---------- Payment Terms ----------
    const paymentTermsList = d.paymentTermsList || [];
    if (paymentTermsList.length > 0) {
      children.push(h2("Payment Terms"));
      const ptRows = [
        new TableRow({
          children: [headerCell("Milestone", 60), headerCell("Percentage", 40)],
          tableHeader: true,
        }),
        ...paymentTermsList.map((pt, i) =>
          new TableRow({
            children: [
              dataCell(pt.stage || pt.label || "", 60, { shade: i % 2 === 1 ? COLOR.rowAltBg : "FFFFFF" }),
              dataCell(`${pt.percent || 0}%`, 40, {
                shade: i % 2 === 1 ? COLOR.rowAltBg : "FFFFFF",
                align: AlignmentType.CENTER,
                bold: true,
              }),
            ],
          })
        ),
      ];
      children.push(new Table({ rows: ptRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
      children.push(spacer(160));
    }

    // ---------- Bank Details ----------
    const hasBankData = bankDetails.bankName || bankDetails.accountNumber || bankDetails.ifscCode;
    if (hasBankData) {
      children.push(h2("Bank Details"));
      const bankFields = [
        ["Bank Name", bankDetails.bankName],
        ["Account Holder", bankDetails.accountHolder],
        ["Account Number", bankDetails.accountNumber],
        ["IFSC Code", bankDetails.ifscCode],
        ["Branch", bankDetails.branch],
        ["UPI ID", bankDetails.upiId],
      ];
      const bankRows = bankFields
        .filter(([, v]) => v && v.trim() !== "")
        .map(([label, value], i) =>
          new TableRow({
            children: [
              dataCell(label, 40, { shade: i % 2 === 1 ? COLOR.rowAltBg : "FFFFFF", bold: true }),
              dataCell(value, 60, { shade: i % 2 === 1 ? COLOR.rowAltBg : "FFFFFF" }),
            ],
          })
        );
      if (bankRows.length > 0) {
        children.push(new Table({ rows: bankRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
      }
      children.push(spacer(160));
    }

    // ---------- Authorized Signature ----------
    children.push(sectionDivider());
    children.push(h2("Authorized Signature"));

    // Signature image (optional)
    const sigImgSrc = signature.signatureImage || "";
    const sigImgData = sigImgSrc ? await fetchImageBytes(sigImgSrc) : null;
    if (sigImgData) {
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: sigImgData.bytes,
              type: mimeToImageType(sigImgData.mime),
              transformation: { width: 150, height: 60 },
            }),
          ],
          spacing: { after: 80 },
        })
      );
    }

    if (signature.name) children.push(labelValue("Name", signature.name));
    if (signature.designation) children.push(labelValue("Designation", signature.designation));
    if (signature.phone) children.push(labelValue("Phone", signature.phone));
    if (signature.email) children.push(labelValue("Email", signature.email));

    children.push(spacer(300));
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `Generated by VisionX QuoteGen Pro  •  ${new Date().toLocaleDateString("en-GB")}`, size: 16, color: COLOR.labelGray, italics: true }),
        ],
        alignment: AlignmentType.CENTER,
      })
    );

    // ------------------------------------------------------------------
    // Assemble document
    // ------------------------------------------------------------------
    const doc = new Document({
      creator: companyName !== "—" ? companyName : "VisionX QuoteGen Pro",
      title: `${projectName} — ${refNo}`,
      description: `Quotation Proposal — ${companyName}`,
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(0.8),
                bottom: convertInchesToTwip(0.8),
                left: convertInchesToTwip(1.0),
                right: convertInchesToTwip(1.0),
              },
              orientation: PageOrientation.PORTRAIT,
            },
          },
          children,
        },
      ],
    });

    // ------------------------------------------------------------------
    // Pack to real OOXML Blob
    // ------------------------------------------------------------------
    const blob = await Packer.toBlob(doc);

    const docxFilename = filename.replace(/\.pdf$/i, ".docx");
    return { blob, filename: docxFilename };
  },
};

// ---------------------------------------------------------------------------
// Future format stubs
// ---------------------------------------------------------------------------
export const ExcelGenerator = {
  id: "xlsx",
  name: "Excel Spreadsheet (.xlsx)",
  ext: ".xlsx",
  subtitle: "Tabular itemized data export for financial accounting",
  disabled: true,
  generate: async () => { throw new Error("Excel export format coming soon."); },
};

export const ImageGenerator = {
  id: "png",
  name: "High-Res Image (.png)",
  ext: ".png",
  subtitle: "PNG image capture for quick social messaging & chat",
  disabled: true,
  generate: async () => { throw new Error("Image export format coming soon."); },
};

export const HTMLGenerator = {
  id: "html",
  name: "HTML Document (.html)",
  ext: ".html",
  subtitle: "Web-ready responsive HTML file for browser viewing",
  disabled: true,
  generate: async () => { throw new Error("HTML export format coming soon."); },
};

// ---------------------------------------------------------------------------
// ExportService facade
// ---------------------------------------------------------------------------
export const ExportService = {
  PDF: PDFGenerator,
  WORD: WordGenerator,
  EXCEL: ExcelGenerator,
  IMAGE: ImageGenerator,
  HTML: HTMLGenerator,

  exportFormat: async (formatId, element, filename, mappedData) => {
    switch (formatId) {
      case "word":
      case "docx":
        return await WordGenerator.generate(element, filename, mappedData);
      case "pdf":
      default:
        return await PDFGenerator.generate(element, filename, mappedData);
    }
  },
};
