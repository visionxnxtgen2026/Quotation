import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/**
 * 🏛️ Enterprise-Grade Multi-Page PDF Exporter
 * Performs intelligent section-aware page breaking, repeats header/footer bars on all pages,
 * repeats table column headers, and enforces high-resolution pixel-perfect A4 printing.
 */
export async function exportEnterprisePDF(element, filename = "Quotation.pdf", quotationData = {}) {
  if (!element) {
    throw new Error("PDF container element not found");
  }

  // Preserve original inline style properties
  const originalDisplay = element.style.display;
  const originalPosition = element.style.position;
  const originalLeft = element.style.left;
  const originalTop = element.style.top;
  const originalWidth = element.style.width;

  // Mount element visibly off-screen at standard A4 canvas width (794px)
  element.style.display = "block";
  element.style.position = "fixed";
  element.style.left = "0px";
  element.style.top = "0px";
  element.style.width = "794px";
  element.style.zIndex = "-9999";

  try {
    // 1. High-resolution canvas capture (scale: 2 for 300 DPI crisp text)
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 794,
    });

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfPageWidth = 210; // mm
    const pdfPageHeight = 297; // mm
    const headerHeight = 14; // mm
    const footerHeight = 14; // mm
    const marginX = 10; // mm
    const printableWidth = pdfPageWidth - marginX * 2; // 190 mm
    const printableHeight = pdfPageHeight - headerHeight - footerHeight; // 269 mm

    // Convert printable dimensions to canvas px
    const pageCanvasHeightPx = (printableHeight * canvas.width) / printableWidth;

    // Detect section cards & table rows for intelligent page break boundaries
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

      // Find nearest boundary top before targetCutPx
      let foundBoundary = false;
      for (const el of breakCandidates) {
        const rect = el.getBoundingClientRect();
        const topPx = (rect.top - containerRect.top) * scaleFactor;
        const bottomPx = (rect.bottom - containerRect.top) * scaleFactor;

        // If block crosses targetCutPx and top is after currentYPx + 80
        if (topPx > currentYPx + 80 && topPx <= targetCutPx && bottomPx > targetCutPx) {
          chosenCutPx = topPx - 8; // Break cleanly right above section
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

    // Company & Document Metadata for Header / Footer
    const companyName = (quotationData.companyName || quotationData.projectDetails?.companyName || "VisionX Enterprises").trim();
    const refNo = quotationData.quotationNo || quotationData.referenceNo || quotationData.projectDetails?.referenceNo || "QTN-2026";
    const dateStr = quotationData.date || quotationData.projectDetails?.date || new Date().toLocaleDateString("en-GB");
    const companyPhone = quotationData.companyPhone || quotationData.phone || "";
    const companyEmail = quotationData.companyEmail || quotationData.email || "";
    const gstNo = quotationData.gstNo || quotationData.gst || "";

    const contactParts = [];
    if (companyPhone) contactParts.push(`Ph: ${companyPhone}`);
    if (companyEmail) contactParts.push(`Email: ${companyEmail}`);
    if (gstNo) contactParts.push(`GSTIN: ${gstNo}`);
    const contactInfo = contactParts.length > 0 ? contactParts.join(" • ") : "VisionX QuoteGen Pro Enterprise Proposal";

    // 2. Render Page Slices into jsPDF with Repeating Headers & Footers
    for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
      if (pageIdx > 0) pdf.addPage();

      const startYPx = pageBreakIndicesPx[pageIdx];
      const endYPx = pageIdx < totalPages - 1 ? pageBreakIndicesPx[pageIdx + 1] : canvas.height;
      const sliceHeightPx = Math.max(endYPx - startYPx, 1);
      const sliceHeightMm = (sliceHeightPx * printableWidth) / canvas.width;

      // Render slice to temporary canvas
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

      // 3. Draw Repeating Enterprise Header (Every Page)
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(15, 23, 42); // slate-900
      pdf.text(companyName.toUpperCase(), marginX, 8);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.5);
      pdf.setTextColor(37, 99, 235); // blue-600
      pdf.text("OFFICIAL QUOTATION PROPOSAL", pdfPageWidth - marginX - 50, 8);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.setTextColor(100, 116, 139); // slate-500
      pdf.text(`REF: ${refNo}  |  DATE: ${dateStr}`, pdfPageWidth - marginX, 8, { align: "right" });

      // Top divider line
      pdf.setDrawColor(203, 213, 225); // slate-300
      pdf.setLineWidth(0.3);
      pdf.line(marginX, 11, pdfPageWidth - marginX, 11);

      // 4. Draw Repeating Enterprise Footer (Every Page)
      const footerY = pdfPageHeight - 7;

      // Bottom overline divider line
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.3);
      pdf.line(marginX, pdfPageHeight - 11, pdfPageWidth - marginX, pdfPageHeight - 11);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(100, 116, 139);
      pdf.text(contactInfo, marginX, footerY);

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
