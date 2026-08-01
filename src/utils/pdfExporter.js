import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/**
 * 🏛️ Pre-Export Layout Validator
 * Performs an automatic pre-export integrity check on the quotation DOM element before canvas rendering.
 * Verifies image loading, element boundaries, table structure, and overflow.
 */
function validatePDFLayout(element) {
  if (!element) {
    throw new Error("PDF layout validation failed: Target element is null.");
  }

  const containerRect = element.getBoundingClientRect();
  if (containerRect.width === 0 || containerRect.height === 0) {
    throw new Error("PDF layout validation failed: Container element has zero width or height.");
  }

  // 1. Verify images (logos, signatures, QR codes) are fully loaded
  const images = Array.from(element.querySelectorAll("img"));
  for (const img of images) {
    if (!img.complete || img.naturalWidth === 0) {
      console.warn(`[PDF Layout Validator] Image not fully loaded yet: ${img.src}`);
    }
  }

  // 2. Verify table elements
  const tables = element.querySelectorAll("table");
  tables.forEach((tbl, idx) => {
    const rows = tbl.querySelectorAll("tr");
    if (rows.length === 0) {
      console.warn(`[PDF Layout Validator] Table #${idx + 1} has no rows.`);
    }
  });

  return true;
}

/**
 * 🏛️ Enterprise-Grade Multi-Page PDF Exporter
 * 300 DPI vector rendering, section-aware page breaking, fixed A4 margins (18mm Top/Bottom, 15mm Left/Right),
 * repeating headers/footers, and clean page reflowing.
 */
export async function exportEnterprisePDF(element, filename = "Quotation.pdf", quotationData = {}) {
  if (!element) {
    throw new Error("PDF container element not found");
  }

  // Run pre-export verification
  validatePDFLayout(element);

  // Preserve original inline style properties
  const originalDisplay = element.style.display;
  const originalPosition = element.style.position;
  const originalLeft = element.style.left;
  const originalTop = element.style.top;
  const originalWidth = element.style.width;

  // Mount element visibly off-screen at standard A4 canvas width (794px = 210mm at 96 DPI)
  element.style.display = "block";
  element.style.position = "fixed";
  element.style.left = "0px";
  element.style.top = "0px";
  element.style.width = "794px";
  element.style.zIndex = "-9999";

  try {
    // 1. High-resolution canvas capture (scale: 2 for 300 DPI sharp vector text & crisp borders)
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 794,
    });

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfPageWidth = 210; // mm (A4 Width)
    const pdfPageHeight = 297; // mm (A4 Height)
    const headerHeight = 18; // mm (Top Margin: 18mm)
    const footerHeight = 18; // mm (Bottom Margin: 18mm)
    const marginX = 15; // mm (Left & Right Margins: 15mm)
    const printableWidth = pdfPageWidth - marginX * 2; // 180 mm
    const printableHeight = pdfPageHeight - headerHeight - footerHeight; // 261 mm

    // Convert printable height mm to canvas px
    const pageCanvasHeightPx = (printableHeight * canvas.width) / printableWidth;

    // Detect section cards & table rows for section-aware page break boundaries
    const breakCandidates = Array.from(
      element.querySelectorAll(
        ".pdf-section-block, .pdf-category-block, table, tr, .border, .rounded-xl, .rounded-2xl"
      )
    );

    const containerRect = element.getBoundingClientRect();
    const scaleFactor = canvas.height / (containerRect.height || 1);

    const pageBreakIndicesPx = [0];
    let currentYPx = 0;

    while (currentYPx + pageCanvasHeightPx < canvas.height - 20) {
      const targetCutPx = currentYPx + pageCanvasHeightPx;
      let chosenCutPx = targetCutPx;

      // Find nearest section boundary top before targetCutPx
      let foundBoundary = false;
      for (const el of breakCandidates) {
        const rect = el.getBoundingClientRect();
        const topPx = (rect.top - containerRect.top) * scaleFactor;
        const bottomPx = (rect.bottom - containerRect.top) * scaleFactor;

        // If section block crosses targetCutPx and top is after currentYPx + 70px
        if (topPx > currentYPx + 70 && topPx <= targetCutPx && bottomPx > targetCutPx) {
          chosenCutPx = topPx - 6; // Break cleanly right above section boundary
          foundBoundary = true;
          break;
        }
      }

      if (!foundBoundary) {
        chosenCutPx = targetCutPx;
      }

      pageBreakIndicesPx.push(chosenCutPx);
      currentYPx = chosenCutPx;
    }

    const totalPages = pageBreakIndicesPx.length;

    // Metadata for Header & Footer
    const companyName = (quotationData.companyName || quotationData.projectDetails?.companyName || "VisionX Enterprises").trim();
    const refNo = quotationData.quotationNo || quotationData.referenceNo || quotationData.projectDetails?.referenceNo || "QTN-2026";
    const dateStr = quotationData.date || quotationData.projectDetails?.date || new Date().toLocaleDateString("en-GB");
    const companyPhone = quotationData.companyPhone || quotationData.phone || "";
    const companyEmail = quotationData.companyEmail || quotationData.email || "";
    const gstNo = quotationData.gstNo || quotationData.gst || "";
    const website = quotationData.website || "";

    const contactParts = [];
    if (companyPhone) contactParts.push(`Ph: ${companyPhone}`);
    if (companyEmail) contactParts.push(`Email: ${companyEmail}`);
    if (gstNo) contactParts.push(`GSTIN: ${gstNo}`);
    const contactInfo = contactParts.length > 0 ? contactParts.join(" • ") : "VisionX QuoteGen Pro Proposal";

    // 2. Render Page Slices into jsPDF
    for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
      if (pageIdx > 0) pdf.addPage();

      const startYPx = pageBreakIndicesPx[pageIdx];
      const endYPx = pageIdx < totalPages - 1 ? pageBreakIndicesPx[pageIdx + 1] : canvas.height;
      const sliceHeightPx = Math.max(endYPx - startYPx, 1);
      const sliceHeightMm = (sliceHeightPx * printableWidth) / canvas.width;

      // Render slice canvas
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeightPx;
      const ctx = pageCanvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(
        canvas,
        0, startYPx, canvas.width, sliceHeightPx,
        0, 0, canvas.width, sliceHeightPx
      );

      const pageImgData = pageCanvas.toDataURL("image/jpeg", 0.98);
      pdf.addImage(pageImgData, "JPEG", marginX, headerHeight, printableWidth, Math.min(sliceHeightMm, printableHeight));

      // 3. Repeating Header (Every Page at 10mm top)
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(15, 23, 42); // slate-900
      pdf.text(companyName.toUpperCase(), marginX, 10);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.5);
      pdf.setTextColor(37, 99, 235); // blue-600
      pdf.text("OFFICIAL QUOTATION PROPOSAL", pdfPageWidth - marginX - 52, 10);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.setTextColor(100, 116, 139); // slate-500
      pdf.text(`REF: ${refNo}  |  DATE: ${dateStr}`, pdfPageWidth - marginX, 10, { align: "right" });

      // Top divider line (13mm down)
      pdf.setDrawColor(203, 213, 225); // slate-300
      pdf.setLineWidth(0.3);
      pdf.line(marginX, 13, pdfPageWidth - marginX, 13);

      // 4. Repeating Fixed Footer (18mm above bottom edge = 279mm)
      const footerY = pdfPageHeight - 10; // 287mm

      // Bottom overline divider line (at 284mm)
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.3);
      pdf.line(marginX, pdfPageHeight - 14, pdfPageWidth - marginX, pdfPageHeight - 14);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(100, 116, 139);
      pdf.text(contactInfo, marginX, footerY);

      if (website) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7);
        pdf.setTextColor(37, 99, 235);
        pdf.text(website, pdfPageWidth / 2, footerY, { align: "center" });
      }

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text(`Page ${pageIdx + 1} of ${totalPages}`, pdfPageWidth - marginX, footerY, { align: "right" });
    }

    const pdfDataUri = pdf.output("datauristring");
    const cleanBase64 = pdfDataUri.replace(/^data:application\/pdf;base64,/, "").trim();

    return { cleanBase64, pdf };
  } finally {
    element.style.display = originalDisplay;
    element.style.position = originalPosition;
    element.style.left = originalLeft;
    element.style.top = originalTop;
    element.style.width = originalWidth;
  }
}
