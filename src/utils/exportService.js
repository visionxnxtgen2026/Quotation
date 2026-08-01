import { exportEnterprisePDF } from "./pdfExporter.js";

/**
 * 📦 ExportService — Enterprise Multi-Format Quotation Exporter
 * Architecture:
 * - PDFGenerator
 * - WordGenerator
 * - ExcelGenerator (Future Extension)
 * - ImageGenerator (Future Extension)
 */

export const PDFGenerator = {
  id: "pdf",
  name: "PDF Document",
  ext: ".pdf",
  mime: "application/pdf",
  subtitle: "Print-ready • Best for clients • Preserves layout exactly • Supports multiple pages",
  generate: async (element, filename, mappedData) => {
    return await exportEnterprisePDF(element, filename, mappedData);
  }
};

export const WordGenerator = {
  id: "docx",
  name: "Microsoft Word (.docx)",
  ext: ".docx",
  mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  subtitle: "Editable document • Ideal for making changes later • Preserves headings & tables",
  generate: async (element, filename, mappedData = {}) => {
    const title = mappedData.companyName || mappedData.projectDetails?.companyName || "Quotation Proposal";
    const refNo = mappedData.quotationNo || mappedData.referenceNo || mappedData.projectDetails?.referenceNo || "QTN-2026";
    const dateStr = mappedData.date || mappedData.projectDetails?.date || new Date().toLocaleDateString("en-GB");

    // Extract HTML layout from target container
    const contentHtml = element ? element.innerHTML : "";

    // MSO HTML Schema formatted for editable Microsoft Word document (.docx)
    const wordDocumentHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${title} - ${refNo}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page { size: 21cm 29.7cm; margin: 1.5cm 1.5cm 1.5cm 1.5cm; mso-page-orientation: portrait; }
          body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; font-size: 10pt; color: #0f172a; line-height: 1.5; background-color: #ffffff; }
          h1, h2, h3, h4, h5 { color: #0f172a; font-weight: bold; margin-top: 10pt; margin-bottom: 4pt; }
          p { margin-top: 0; margin-bottom: 4pt; }
          table { width: 100%; border-collapse: collapse; margin-top: 8pt; margin-bottom: 12pt; border: 1px solid #cbd5e1; }
          th { background-color: #f1f5f9; color: #1e293b; font-weight: bold; padding: 8px 10px; border: 1px solid #cbd5e1; font-size: 9pt; text-transform: uppercase; text-align: left; }
          td { padding: 8px 10px; border: 1px solid #cbd5e1; font-size: 9.5pt; vertical-align: middle; }
          .bg-slate-900 { background-color: #0f172a !important; color: #ffffff !important; }
          .bg-slate-800 { background-color: #1e293b !important; color: #ffffff !important; }
          .bg-slate-100 { background-color: #f1f5f9 !important; }
          .text-emerald-400 { color: #34d399 !important; }
          .text-emerald-600 { color: #059669 !important; }
          .text-blue-600 { color: #2563eb !important; }
          .font-mono { font-family: 'Consolas', 'Courier New', monospace; }
          img { max-height: 80px; object-fit: contain; }
        </style>
      </head>
      <body>
        <div style="max-width: 800px; margin: 0 auto;">
          ${contentHtml}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(["\ufeff", wordDocumentHtml], {
      type: "application/msword;charset=utf-8"
    });

    const cleanBase64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultStr = reader.result || "";
        const base64data = resultStr.includes(",") ? resultStr.split(",")[1] : "";
        resolve(base64data);
      };
      reader.readAsDataURL(blob);
    });

    const docxFilename = filename.replace(/\.pdf$/i, ".docx");

    return { blob, cleanBase64, filename: docxFilename };
  }
};

export const ExcelGenerator = {
  id: "xlsx",
  name: "Excel Spreadsheet (.xlsx)",
  ext: ".xlsx",
  subtitle: "Tabular itemized data export for financial accounting",
  disabled: true,
  generate: async () => {
    throw new Error("Excel export format coming soon.");
  }
};

export const ImageGenerator = {
  id: "png",
  name: "High-Res Image (.png)",
  ext: ".png",
  subtitle: "PNG image capture for quick social messaging & chat",
  disabled: true,
  generate: async () => {
    throw new Error("Image export format coming soon.");
  }
};

export const HTMLGenerator = {
  id: "html",
  name: "HTML Document (.html)",
  ext: ".html",
  subtitle: "Web-ready responsive HTML file for browser viewing",
  disabled: true,
  generate: async () => {
    throw new Error("HTML export format coming soon.");
  }
};

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
  }
};
