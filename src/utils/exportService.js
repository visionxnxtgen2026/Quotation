import { exportEnterprisePDF } from "./pdfExporter.js";

/**
 * 📦 ExportService — Multi-Format Professional Export Engines
 * Architecture:
 * - PDFGenerator   → High-impact client presentation brochure (html2canvas + jsPDF)
 * - WordGenerator  → Clean Microsoft Word corporate document (docx)
 * - ExcelGenerator → Multi-worksheet ERP accounting workbook with formulas (exceljs)
 * - ImageGenerator → High-res social media snapshot graphic (html2canvas)
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
  return isNaN(n) ? "—" : `₹ ${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Convert base64 data URL to Uint8Array for image embedding
const dataUrlToUint8Array = (dataUrl) => {
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

// Fetch image bytes
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
// Word Generator — Clean Microsoft Word Corporate Document via `docx`
// ---------------------------------------------------------------------------
export const WordGenerator = {
  id: "docx",
  name: "Microsoft Word (.docx)",
  ext: ".docx",
  mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  subtitle: "Native Word Document • Editable business proposal layout • No card frames or background shadows",

  generate: async (_element, filename, mappedData = {}) => {
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
    const refNo = fmt(d.referenceNo || d.quotationNo || "QTN-2026");
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

    const FONT_FAMILY = "Calibri";
    const COLOR = {
      headerBg: "0F172A",
      headerFg: "FFFFFF",
      subheaderBg: "1E293B",
      rowAltBg: "F8FAFC",
      rowBorderColor: "CBD5E1",
      outerBorderColor: "94A3B8",
      labelGray: "64748B",
      bodyText: "0F172A",
    };

    const borderStyle = { style: BorderStyle.SINGLE, size: 4, color: COLOR.rowBorderColor };
    const outerBorderStyle = { style: BorderStyle.SINGLE, size: 6, color: COLOR.outerBorderColor };
    const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };

    const h1 = (text) =>
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 },
        children: [new TextRun({ text, bold: true, size: 32, font: FONT_FAMILY, color: COLOR.bodyText })],
      });

    const h2 = (text) =>
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        keepWithNext: true,
        spacing: { before: 240, after: 100 },
        children: [new TextRun({ text, bold: true, size: 26, font: FONT_FAMILY, color: COLOR.headerBg })],
      });

    const h3 = (text) =>
      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        keepWithNext: true,
        spacing: { before: 180, after: 80 },
        children: [new TextRun({ text, bold: true, size: 23, font: FONT_FAMILY, color: COLOR.headerBg })],
      });

    const body = (text, opts = {}) =>
      new Paragraph({
        children: [
          new TextRun({
            text: fmt(text),
            size: 21,
            font: FONT_FAMILY,
            color: opts.color || COLOR.bodyText,
            bold: opts.bold || false,
            italics: opts.italics || false,
          }),
        ],
        spacing: { before: 40, after: 40 },
      });

    const labelValue = (label, value) =>
      new Paragraph({
        children: [
          new TextRun({ text: `${label}: `, bold: true, size: 21, font: FONT_FAMILY, color: COLOR.labelGray }),
          new TextRun({ text: fmt(value), size: 21, font: FONT_FAMILY, color: COLOR.bodyText }),
        ],
        spacing: { before: 40, after: 40 },
      });

    const spacer = (spacing = 160) => new Paragraph({ text: "", spacing: { before: spacing, after: 0 } });

    const sectionDivider = () =>
      new Paragraph({
        text: "",
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR.rowBorderColor } },
        spacing: { before: 140, after: 140 },
      });

    const headerCell = (text, widthPct, align = AlignmentType.LEFT) =>
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text, bold: true, size: 20, font: FONT_FAMILY, color: COLOR.headerFg })],
            alignment: align,
          }),
        ],
        width: { size: widthPct, type: WidthType.PERCENTAGE },
        shading: { fill: COLOR.headerBg, type: ShadingType.SOLID },
        borders: { top: noBorder, bottom: borderStyle, left: noBorder, right: noBorder },
        margins: { top: 100, bottom: 100, left: 120, right: 120 },
        verticalAlign: VerticalAlign.CENTER,
      });

    const dataCell = (text, widthPct, opts = {}) =>
      new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: fmt(text),
                size: 20,
                font: FONT_FAMILY,
                color: opts.color || COLOR.bodyText,
                bold: opts.bold || false,
                italics: opts.italics || false,
              }),
            ],
            alignment: opts.align || AlignmentType.LEFT,
          }),
        ],
        width: { size: widthPct, type: WidthType.PERCENTAGE },
        shading: opts.shade ? { fill: opts.shade, type: ShadingType.SOLID } : undefined,
        borders: { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle },
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        verticalAlign: VerticalAlign.CENTER,
      });

    const logoSrc = d.companyLogo || d.projectDetails?.companyLogo || "";
    const logoData = logoSrc ? await fetchImageBytes(logoSrc) : null;
    const children = [];

    // ── 1. COMPANY HEADER & LOGO ──
    if (logoData) {
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: logoData.bytes,
              type: mimeToImageType(logoData.mime),
              transformation: { width: 140, height: 60 },
            }),
          ],
          spacing: { after: 100 },
        })
      );
    }

    children.push(
      new Paragraph({
        children: [new TextRun({ text: companyName.toUpperCase(), bold: true, size: 36, font: FONT_FAMILY, color: COLOR.headerBg })],
        spacing: { after: 40 },
      })
    );

    if (companyTagline !== "—") {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: companyTagline, size: 21, font: FONT_FAMILY, color: "2563EB", bold: true, italics: true })],
          spacing: { after: 40 },
        })
      );
    }

    if (companyAddress !== "—") children.push(labelValue("Address", companyAddress));
    if (companyPhone !== "—" || companyEmail !== "—") {
      const contactStr = [];
      if (companyPhone !== "—") contactStr.push(`Ph: ${companyPhone}`);
      if (companyEmail !== "—") contactStr.push(`Email: ${companyEmail}`);
      children.push(labelValue("Contact", contactStr.join("  •  ")));
    }
    if (gstNo !== "—") children.push(labelValue("GSTIN", gstNo));
    if (website !== "—") children.push(labelValue("Website", website));

    children.push(sectionDivider());

    // ── 2. DOCUMENT TITLE & METADATA ──
    children.push(h1("OFFICIAL QUOTATION PROPOSAL"));
    children.push(labelValue("Quotation Ref No", refNo));
    children.push(labelValue("Date of Issue", dateStr));
    children.push(labelValue("Project Title", projectName));
    if (paintBrand !== "—") children.push(labelValue("Brand Specification", paintBrand));

    children.push(sectionDivider());

    // ── 3. CLIENT DETAILS ──
    children.push(h2("Client & Site Details"));
    children.push(labelValue("Client Name", clientName));
    if (clientCompany !== "—") children.push(labelValue("Company", clientCompany));
    if (clientAddress !== "—") children.push(labelValue("Site / Delivery Address", clientAddress));
    if (clientPhone !== "—") children.push(labelValue("Contact Phone", clientPhone));
    if (clientEmail !== "—") children.push(labelValue("Email Address", clientEmail));

    children.push(sectionDivider());

    // ── 4. ITEMIZED RATE BREAKDOWN TABLES ──
    if (sections.length > 0) {
      children.push(h2("Itemized Rate Breakdown"));

      for (const sec of sections) {
        children.push(h3(sec.title || "Category Breakdown"));

        const rows = sec.rows || sec.items || [];
        if (rows.length > 0) {
          const tableRows = [
            new TableRow({
              children: [
                headerCell("#", 5, AlignmentType.CENTER),
                headerCell("Description of Work / Specification", 45, AlignmentType.LEFT),
                headerCell("Labour (₹)", 15, AlignmentType.RIGHT),
                headerCell("Material (₹)", 15, AlignmentType.RIGHT),
                headerCell("Total (₹)", 20, AlignmentType.RIGHT),
              ],
              tableHeader: true,
              cantSplit: true,
            }),
          ];

          rows.forEach((row, i) => {
            const shade = i % 2 === 1 ? COLOR.rowAltBg : "FFFFFF";
            tableRows.push(
              new TableRow({
                cantSplit: true,
                children: [
                  dataCell(String(i + 1), 5, { shade, align: AlignmentType.CENTER }),
                  dataCell(row.desc || row.work || row.description || "", 45, { shade }),
                  dataCell(fmt(row.labour), 15, { shade, align: AlignmentType.RIGHT }),
                  dataCell(fmt(row.material), 15, { shade, align: AlignmentType.RIGHT }),
                  dataCell(
                    row.total !== undefined
                      ? `₹ ${Number(row.total).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : "—",
                    20,
                    { shade, align: AlignmentType.RIGHT, bold: true }
                  ),
                ],
              })
            );
          });

          const secTotal = rows.reduce((acc, r) => acc + Number(r.total || 0), 0);
          tableRows.push(
            new TableRow({
              cantSplit: true,
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Category Total", bold: true, size: 20, font: FONT_FAMILY, color: COLOR.headerFg })] })],
                  columnSpan: 4,
                  shading: { fill: COLOR.subheaderBg, type: ShadingType.SOLID },
                  borders: { top: borderStyle, bottom: borderStyle, left: noBorder, right: noBorder },
                  margins: { top: 80, bottom: 80, left: 100, right: 100 },
                }),
                dataCell(
                  `₹ ${secTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  20,
                  { shade: COLOR.subheaderBg, bold: true, color: "FFFFFF", align: AlignmentType.RIGHT }
                ),
              ],
            })
          );

          children.push(new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
          children.push(spacer(140));
        }
      }

      // Grand Total Card Table
      children.push(sectionDivider());
      const totalsTable = new Table({
        rows: [
          new TableRow({
            cantSplit: true,
            children: [
              dataCell("Subtotal", 70, { shade: COLOR.rowAltBg, bold: true }),
              dataCell(subtotal, 30, { shade: COLOR.rowAltBg, align: AlignmentType.RIGHT, bold: true }),
            ],
          }),
          ...(Number(discount) > 0
            ? [
                new TableRow({
                  cantSplit: true,
                  children: [
                    dataCell(`Discount (${discount}%)`, 70, { shade: "FFF8F0" }),
                    dataCell(`- ${fmtMoney((Number(d.baseTotalNum || 0) * Number(discount)) / 100)}`, 30, {
                      shade: "FFF8F0",
                      align: AlignmentType.RIGHT,
                      color: "DC2626",
                      bold: true,
                    }),
                  ],
                }),
              ]
            : []),
          new TableRow({
            cantSplit: true,
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "GRAND TOTAL", bold: true, size: 26, font: FONT_FAMILY, color: COLOR.headerFg })] })],
                width: { size: 70, type: WidthType.PERCENTAGE },
                shading: { fill: COLOR.headerBg, type: ShadingType.SOLID },
                borders: { top: outerBorderStyle, bottom: outerBorderStyle, left: outerBorderStyle, right: noBorder },
                margins: { top: 120, bottom: 120, left: 140, right: 140 },
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: grandTotal, bold: true, size: 26, font: FONT_FAMILY, color: "34D399" })], alignment: AlignmentType.RIGHT })],
                width: { size: 30, type: WidthType.PERCENTAGE },
                shading: { fill: COLOR.headerBg, type: ShadingType.SOLID },
                borders: { top: outerBorderStyle, bottom: outerBorderStyle, left: noBorder, right: outerBorderStyle },
                margins: { top: 120, bottom: 120, left: 140, right: 140 },
              }),
            ],
          }),
        ],
        width: { size: 100, type: WidthType.PERCENTAGE },
      });
      children.push(totalsTable);
      children.push(spacer(180));
    }

    // ── 5. TERMS & BANK DETAILS ──
    const textSections = [
      { key: "coverLetter", label: "Cover Letter" },
      { key: "scopeOfWork", label: "Scope of Work" },
      { key: "exclusions", label: "Excluded Items & Services" },
      { key: "termsConditions", label: "Terms & Conditions" },
    ];

    for (const ts of textSections) {
      const text = textAreas[ts.key] || d[ts.key] || "";
      if (!text || text.trim() === "") continue;
      children.push(h2(ts.label));
      text.split("\n").forEach((line) => {
        if (line.trim()) children.push(body(line.trim()));
      });
      children.push(spacer(100));
    }

    if (validity && validity !== "—") {
      children.push(h2("Validity Clause"));
      children.push(body(validity));
      children.push(spacer(100));
    }

    // Bank Details Table
    if (bankDetails.bankName || bankDetails.accountNumber) {
      children.push(h2("Payment Details & Bank Transfer Info"));
      const bankFields = [
        ["Bank Name", bankDetails.bankName],
        ["Account Name", bankDetails.accountHolder],
        ["Account Number", bankDetails.accountNumber],
        ["IFSC Code", bankDetails.ifscCode],
        ["Branch", bankDetails.branch],
        ["UPI ID", bankDetails.upiId],
      ];
      const bankRows = bankFields
        .filter(([, v]) => v && v.trim() !== "")
        .map(([label, value], i) =>
          new TableRow({
            cantSplit: true,
            children: [
              dataCell(label, 40, { shade: i % 2 === 1 ? COLOR.rowAltBg : "FFFFFF", bold: true }),
              dataCell(value, 60, { shade: i % 2 === 1 ? COLOR.rowAltBg : "FFFFFF" }),
            ],
          })
        );
      if (bankRows.length > 0) children.push(new Table({ rows: bankRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
      children.push(spacer(160));
    }

    // Signature
    children.push(sectionDivider());
    children.push(h2("Authorized Signature"));

    const sigImgSrc = signature.signatureImage || "";
    const sigImgData = sigImgSrc ? await fetchImageBytes(sigImgSrc) : null;
    if (sigImgData) {
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: sigImgData.bytes,
              type: mimeToImageType(sigImgData.mime),
              transformation: { width: 140, height: 55 },
            }),
          ],
          spacing: { after: 60 },
        })
      );
    }

    if (signature.name) children.push(labelValue("Authorized Signatory", signature.name));
    if (signature.designation) children.push(labelValue("Designation", signature.designation));

    const doc = new Document({
      creator: companyName !== "—" ? companyName : "VisionX QuoteGen Pro",
      title: `${projectName} — ${refNo}`,
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(0.7),
                bottom: convertInchesToTwip(0.7),
                left: convertInchesToTwip(0.65),
                right: convertInchesToTwip(0.65),
              },
              orientation: PageOrientation.PORTRAIT,
            },
          },
          children,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    return { blob, filename: filename.replace(/\.(pdf|xlsx|png)$/i, ".docx") };
  },
};

// ---------------------------------------------------------------------------
// Excel Generator — Multi-Worksheet ERP Accounting Workbook via `exceljs`
// Creates 4 Worksheets: Quotation, Summary, Material Analysis, Payment Plan
// ---------------------------------------------------------------------------
export const ExcelGenerator = {
  id: "xlsx",
  name: "Microsoft Excel (.xlsx)",
  ext: ".xlsx",
  mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  subtitle: "Multi-Worksheet ERP Accounting Workbook • Quotation, Summary, Material & Payment sheets with formulas",

  generate: async (_element, filename, mappedData = {}) => {
    const { default: ExcelJS } = await import("exceljs");

    const d = mappedData;
    const companyName = fmt(d.companyName);
    const companyTagline = fmt(d.companyTagline);
    const companyAddress = fmt(d.companyAddress);
    const companyPhone = fmt(d.companyPhone);
    const companyEmail = fmt(d.companyEmail);
    const gstNo = fmt(d.gstNo);

    const clientName = fmt(d.clientName);
    const clientCompany = fmt(d.clientCompany);
    const clientAddress = fmt(d.clientAddress);
    const clientPhone = fmt(d.clientPhone);

    const projectName = fmt(d.projectName);
    const refNo = fmt(d.referenceNo || d.quotationNo || "QTN-2026");
    const dateStr = fmt(d.date || new Date().toLocaleDateString("en-GB"));

    const sections = d.sections || d.rateSections || [];
    const bankDetails = d.bankDetails || {};
    const signature = d.signature || {};

    const workbook = new ExcelJS.Workbook();
    workbook.creator = companyName !== "—" ? companyName : "VisionX QuoteGen Pro";
    workbook.lastModifiedBy = "VisionX QuoteGen Pro";

    const DARK_BLUE = "FF0F172A";
    const WHITE = "FFFFFFFF";
    const LIGHT_SLATE = "FFF8FAFC";
    const BORDER_COLOR = "FFCBD5E1";

    const thinBorder = {
      top: { style: "thin", color: { argb: BORDER_COLOR } },
      bottom: { style: "thin", color: { argb: BORDER_COLOR } },
      left: { style: "thin", color: { argb: BORDER_COLOR } },
      right: { style: "thin", color: { argb: BORDER_COLOR } },
    };

    // =========================================================================
    // WORKSHEET 1: Quotation (Itemized Rate Table)
    // =========================================================================
    const ws1 = workbook.addWorksheet("Quotation", {
      pageSetup: { paperSize: 9, orientation: "landscape", fitToWidth: 1 },
      views: [{ state: "frozen", ySplit: 11 }],
    });

    ws1.columns = [
      { header: "#", key: "col_index", width: 8 },
      { header: "Description of Work / Item Specification", key: "col_desc", width: 48 },
      { header: "Labour (₹)", key: "col_labour", width: 16 },
      { header: "Material (₹)", key: "col_material", width: 16 },
      { header: "Rate / Unit (₹)", key: "col_rate", width: 16 },
      { header: "Total Amount (₹)", key: "col_total", width: 22 },
    ];

    ws1.mergeCells("A1:F2");
    const b1 = ws1.getCell("A1");
    b1.value = companyName.toUpperCase();
    b1.font = { name: "Calibri", size: 16, bold: true, color: { argb: WHITE } };
    b1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK_BLUE } };
    b1.alignment = { vertical: "middle", horizontal: "center" };

    ws1.mergeCells("A3:F3");
    const sub1 = ws1.getCell("A3");
    sub1.value = `${companyTagline !== "—" ? companyTagline + "  •  " : ""}${companyAddress !== "—" ? companyAddress : ""}`;
    sub1.font = { name: "Calibri", size: 10, italic: true, color: { argb: "FF64748B" } };
    sub1.alignment = { vertical: "middle", horizontal: "center" };

    ws1.getCell("A5").value = "QUOTATION PROPOSAL";
    ws1.getCell("A5").font = { name: "Calibri", size: 12, bold: true, color: { argb: DARK_BLUE } };

    ws1.getCell("A6").value = "Ref No:"; ws1.getCell("A6").font = { bold: true }; ws1.getCell("B6").value = refNo;
    ws1.getCell("D6").value = "Date:"; ws1.getCell("D6").font = { bold: true }; ws1.getCell("E6").value = dateStr;
    ws1.getCell("A7").value = "Project:"; ws1.getCell("A7").font = { bold: true }; ws1.getCell("B7").value = projectName;
    ws1.getCell("D7").value = "GSTIN:"; ws1.getCell("D7").font = { bold: true }; ws1.getCell("E7").value = gstNo;
    ws1.getCell("A8").value = "Client:"; ws1.getCell("A8").font = { bold: true }; ws1.getCell("B8").value = `${clientName}${clientCompany !== "—" ? " (" + clientCompany + ")" : ""}`;
    ws1.getCell("D8").value = "Contact:"; ws1.getCell("D8").font = { bold: true }; ws1.getCell("E8").value = clientPhone;

    const hRow1 = ws1.getRow(11);
    hRow1.values = ["#", "Description of Work / Specification", "Labour (₹)", "Material (₹)", "Rate (₹)", "Total Amount (₹)"];
    hRow1.font = { name: "Calibri", size: 11, bold: true, color: { argb: WHITE } };
    hRow1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK_BLUE } };
    hRow1.alignment = { vertical: "middle", horizontal: "left" };
    hRow1.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
    hRow1.getCell(3).alignment = { vertical: "middle", horizontal: "right" };
    hRow1.getCell(4).alignment = { vertical: "middle", horizontal: "right" };
    hRow1.getCell(5).alignment = { vertical: "middle", horizontal: "right" };
    hRow1.getCell(6).alignment = { vertical: "middle", horizontal: "right" };

    ws1.autoFilter = "A11:F11";

    let rowIdx1 = 12;
    let rateStartRow = 12;

    sections.forEach((sec) => {
      ws1.mergeCells(`A${rowIdx1}:F${rowIdx1}`);
      const secCell = ws1.getCell(`A${rowIdx1}`);
      secCell.value = (sec.title || "Work Category").toUpperCase();
      secCell.font = { name: "Calibri", size: 10, bold: true, color: { argb: WHITE } };
      secCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E293B" } };
      rowIdx1++;

      const items = sec.rows || sec.items || [];
      items.forEach((item, i) => {
        const row = ws1.getRow(rowIdx1);
        const labourVal = Number(item.labour || 0);
        const matVal = Number(item.material || 0);
        const rateVal = Number(item.rate || item.total || 0);
        const itemTotal = Number(item.total || 0);

        row.values = [i + 1, item.desc || item.work || item.description || "", labourVal, matVal, rateVal, itemTotal];
        row.font = { name: "Calibri", size: 10 };
        row.alignment = { vertical: "middle", wrapText: true };
        row.getCell(1).alignment = { vertical: "middle", horizontal: "center" };

        row.getCell(3).numFmt = "₹ #,##0.00";
        row.getCell(4).numFmt = "₹ #,##0.00";
        row.getCell(5).numFmt = "₹ #,##0.00";
        row.getCell(6).alignment = { vertical: "middle", horizontal: "right" };
        row.getCell(6).numFmt = "₹ #,##0.00";
        row.getCell(6).font = { bold: true };

        for (let col = 1; col <= 6; col++) {
          const c = row.getCell(col);
          c.border = thinBorder;
          if (rowIdx1 % 2 === 1) {
            c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT_SLATE } };
          }
        }
        rowIdx1++;
      });
    });

    const rateEndRow = Math.max(rowIdx1 - 1, 12);
    rowIdx1++;

    // Grand Total Card Row using Excel SUM formula
    ws1.mergeCells(`A${rowIdx1}:E${rowIdx1}`);
    const totL = ws1.getCell(`A${rowIdx1}`);
    totL.value = "GRAND TOTAL";
    totL.font = { name: "Calibri", size: 13, bold: true, color: { argb: WHITE } };
    totL.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK_BLUE } };

    const totV = ws1.getCell(`F${rowIdx1}`);
    totV.value = { formula: `SUM(F${rateStartRow}:F${rateEndRow})` };
    totV.font = { name: "Calibri", size: 13, bold: true, color: { argb: "FF34D399" } };
    totV.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK_BLUE } };
    totV.alignment = { vertical: "middle", horizontal: "right" };
    totV.numFmt = "₹ #,##0.00";

    // =========================================================================
    // WORKSHEET 2: Summary (Financial Summary Sheet with Formulas)
    // =========================================================================
    const ws2 = workbook.addWorksheet("Summary", {
      pageSetup: { paperSize: 9, orientation: "portrait" },
      views: [{ state: "frozen", ySplit: 4 }],
    });

    ws2.columns = [
      { header: "Financial Category", key: "cat", width: 35 },
      { header: "Formula / Source", key: "src", width: 25 },
      { header: "Amount (₹)", key: "amt", width: 25 },
    ];

    ws2.mergeCells("A1:C2");
    const sBanner = ws2.getCell("A1");
    sBanner.value = `${companyName} — FINANCIAL SUMMARY SHEET`;
    sBanner.font = { name: "Calibri", size: 14, bold: true, color: { argb: WHITE } };
    sBanner.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK_BLUE } };
    sBanner.alignment = { vertical: "middle", horizontal: "center" };

    const sHead = ws2.getRow(4);
    sHead.values = ["Financial Category", "Source Formula", "Total Amount (₹)"];
    sHead.font = { bold: true, color: { argb: WHITE } };
    sHead.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK_BLUE } };

    const summaryRows = [
      ["Total Labour Cost", `SUM('Quotation'!C${rateStartRow}:C${rateEndRow})`, { formula: `SUM('Quotation'!C${rateStartRow}:C${rateEndRow})` }],
      ["Total Material Cost", `SUM('Quotation'!D${rateStartRow}:D${rateEndRow})`, { formula: `SUM('Quotation'!D${rateStartRow}:D${rateEndRow})` }],
      ["Base Subtotal Amount", `SUM('Quotation'!F${rateStartRow}:F${rateEndRow})`, { formula: `SUM('Quotation'!F${rateStartRow}:F${rateEndRow})` }],
      ["GST / Tax (18% Estimated)", "Base Subtotal * 18%", { formula: `C7 * 0.18` }],
      ["Discount (Promotional)", "Applied Discount", Number(d.discountAmount || 0)],
      ["NET PAYABLE GRAND TOTAL", "Subtotal + GST - Discount", { formula: `C7 + C8 - C9` }],
    ];

    summaryRows.forEach((r, idx) => {
      const row = ws2.getRow(idx + 5);
      row.values = [r[0], r[1], r[2]];
      row.font = { name: "Calibri", size: 10, bold: idx === 5 };
      row.getCell(3).numFmt = "₹ #,##0.00";
      row.getCell(3).alignment = { horizontal: "right" };
      for (let col = 1; col <= 3; col++) {
        row.getCell(col).border = thinBorder;
        if (idx === 5) {
          row.getCell(col).fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK_BLUE } };
          row.getCell(col).font = { bold: true, color: { argb: idx === 5 ? "FF34D399" : WHITE } };
        }
      }
    });

    // =========================================================================
    // WORKSHEET 3: Material Analysis (Inventory Cost Breakdown)
    // =========================================================================
    const ws3 = workbook.addWorksheet("Material Analysis", {
      pageSetup: { paperSize: 9, orientation: "portrait" },
      views: [{ state: "frozen", ySplit: 4 }],
    });

    ws3.columns = [
      { header: "#", key: "idx", width: 8 },
      { header: "Material Specification", key: "mat", width: 45 },
      { header: "Qty / Units", key: "qty", width: 15 },
      { header: "Unit Rate (₹)", key: "rate", width: 18 },
      { header: "Calculated Material Cost (₹)", key: "cost", width: 25 },
    ];

    ws3.mergeCells("A1:E2");
    const mBanner = ws3.getCell("A1");
    mBanner.value = `${companyName} — MATERIAL ANALYSIS & INVENTORY`;
    mBanner.font = { name: "Calibri", size: 14, bold: true, color: { argb: WHITE } };
    mBanner.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK_BLUE } };
    mBanner.alignment = { vertical: "middle", horizontal: "center" };

    const mHead = ws3.getRow(4);
    mHead.values = ["#", "Material Specification", "Quantity", "Unit Rate (₹)", "Material Cost (₹)"];
    mHead.font = { bold: true, color: { argb: WHITE } };
    mHead.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK_BLUE } };

    let mRowIdx = 5;
    sections.forEach((sec) => {
      const items = sec.rows || sec.items || [];
      items.forEach((item, i) => {
        const row = ws3.getRow(mRowIdx);
        const qtyVal = Number(item.qty || item.quantity || 1);
        const matRateVal = Number(item.material || 0);

        row.values = [i + 1, item.desc || item.work || "Material Item", qtyVal, matRateVal, { formula: `C${mRowIdx}*D${mRowIdx}` }];
        row.font = { name: "Calibri", size: 10 };
        row.getCell(1).alignment = { horizontal: "center" };
        row.getCell(3).alignment = { horizontal: "center" };
        row.getCell(4).numFmt = "₹ #,##0.00";
        row.getCell(5).numFmt = "₹ #,##0.00";
        row.getCell(5).font = { bold: true };
        for (let col = 1; col <= 5; col++) row.getCell(col).border = thinBorder;
        mRowIdx++;
      });
    });

    // =========================================================================
    // WORKSHEET 4: Payment Plan (Milestone Breakdown)
    // =========================================================================
    const ws4 = workbook.addWorksheet("Payment Plan", {
      pageSetup: { paperSize: 9, orientation: "portrait" },
      views: [{ state: "frozen", ySplit: 4 }],
    });

    ws4.columns = [
      { header: "#", key: "idx", width: 8 },
      { header: "Payment Milestone Stage", key: "stage", width: 45 },
      { header: "Percentage (%)", key: "pct", width: 18 },
      { header: "Calculated Amount (₹)", key: "amt", width: 25 },
    ];

    ws4.mergeCells("A1:D2");
    const pBanner = ws4.getCell("A1");
    pBanner.value = `${companyName} — PAYMENT PLAN & MILESTONES`;
    pBanner.font = { name: "Calibri", size: 14, bold: true, color: { argb: WHITE } };
    pBanner.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK_BLUE } };
    pBanner.alignment = { vertical: "middle", horizontal: "center" };

    const pHead = ws4.getRow(4);
    pHead.values = ["#", "Payment Milestone Stage", "Percentage (%)", "Calculated Amount (₹)"];
    pHead.font = { bold: true, color: { argb: WHITE } };
    pHead.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK_BLUE } };

    const paymentTermsList = d.paymentTermsList || [
      { stage: "Advance Commitment Deposit", percent: 30 },
      { stage: "Mid-Project Execution Milestone", percent: 50 },
      { stage: "Final Completion & Handover", percent: 20 },
    ];

    paymentTermsList.forEach((pt, i) => {
      const pIdx = i + 5;
      const row = ws4.getRow(pIdx);
      const pctVal = Number(pt.percent || 0) / 100;
      row.values = [i + 1, pt.stage || pt.label || "Milestone Stage", pctVal, { formula: `C${pIdx}*'Quotation'!F${rowIdx1 - 1}` }];
      row.font = { name: "Calibri", size: 10 };
      row.getCell(1).alignment = { horizontal: "center" };
      row.getCell(3).numFmt = "0.00%";
      row.getCell(3).alignment = { horizontal: "center" };
      row.getCell(4).numFmt = "₹ #,##0.00";
      row.getCell(4).font = { bold: true };
      for (let col = 1; col <= 4; col++) row.getCell(col).border = thinBorder;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const xlsxFilename = filename.replace(/\.(pdf|docx|png)$/i, ".xlsx");
    return { blob, filename: xlsxFilename };
  },
};

// ---------------------------------------------------------------------------
// Image Generator — High-Res PNG Exporter via `html2canvas`
// ---------------------------------------------------------------------------
export const ImageGenerator = {
  id: "png",
  name: "High-Res Image (.png)",
  ext: ".png",
  mime: "image/png",
  subtitle: "PNG image graphic snapshot for messaging",
  generate: async (element, filename) => {
    const { default: html2canvas } = await import("html2canvas");
    const target = element || document.getElementById("quotation-pdf-container");
    if (!target) throw new Error("Element not found for PNG image capture");

    const canvas = await html2canvas(target, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
    });
    const blob = await new Promise((res) => canvas.toBlob(res, "image/png", 1.0));
    const pngFilename = filename.replace(/\.(pdf|docx|xlsx)$/i, ".png");
    return { blob, filename: pngFilename };
  },
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
// ExportService facade with In-Memory Document Export Cache
// ---------------------------------------------------------------------------
const _exportDocumentCache = new Map();

export const clearExportCache = () => {
  _exportDocumentCache.clear();
};

export const ExportService = {
  PDF: PDFGenerator,
  WORD: WordGenerator,
  EXCEL: ExcelGenerator,
  IMAGE: ImageGenerator,
  HTML: HTMLGenerator,

  exportFormat: async (formatId, element, filename, mappedData) => {
    const qid = mappedData?.id || mappedData?.quotationNo || "draft";
    const updatedAt = mappedData?.updatedAt || "0";
    const tpl = mappedData?.template || "default";
    const cacheKey = `${qid}_${formatId}_${tpl}_${updatedAt}`;

    if (_exportDocumentCache.has(cacheKey)) {
      return _exportDocumentCache.get(cacheKey);
    }

    let result;
    switch (formatId) {
      case "word":
      case "docx":
        result = await WordGenerator.generate(element, filename, mappedData);
        break;
      case "excel":
      case "xlsx":
        result = await ExcelGenerator.generate(element, filename, mappedData);
        break;
      case "png":
      case "image":
        result = await ImageGenerator.generate(element, filename, mappedData);
        break;
      case "pdf":
      default:
        result = await PDFGenerator.generate(element, filename, mappedData);
        break;
    }

    if (result && result.blob) {
      _exportDocumentCache.set(cacheKey, result);
    }
    return result;
  },
};

