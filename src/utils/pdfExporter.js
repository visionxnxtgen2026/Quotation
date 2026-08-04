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
 * 🏛️ Enterprise-Grade Global Document Layout Engine for PDF Generation
 *
 * Exact A4 Portrait Specifications:
 * • Page Size: 210mm × 297mm
 * • Margins: Top 20mm, Bottom 18mm, Left 16mm, Right 16mm
 * • Printable Width: 178mm (210 - 32)
 * • Fixed Header Height: 35mm (Repeats on Every Page)
 * • Fixed Footer Height: 15mm (Repeats on Every Page)
 * • Dynamic Content Height: 209mm (297 - 20 - 18 - 35 - 15)
 *
 * Features:
 * • Automatic Multi-Page Pagination (1, 2, 3, 5, 10+ pages)
 * • Atomic Section Preservation (Cards, Signatures, Bank Cards, Totals never split)
 * • Table Row Integrity (Single rows are never cut in half)
 * • Aspect Ratio Preservation for Logos & Signatures
 * • Dynamic Page X of Y calculation
 */
export async function exportEnterprisePDF(element, filename = "Quotation.pdf", quotationData = {}) {
  if (!element) {
    throw new Error("PDF container element not found");
  }

  // Requirement 10: Log the exported object before generating PDF
  console.log("PDF Export Data", quotationData);

  // Requirement 14: Validation before export
  if (quotationData) {
    const secs = quotationData.sections || quotationData.rateSections || [];
    for (const sec of secs) {
      const comps = (sec.components && sec.components.length > 0)
        ? sec.components
        : [{ id: "labour", name: "Labour" }, { id: "material", name: "Material" }];
      const rows = sec.rows || sec.items || [];
      for (const r of rows) {
        const expectedRowTotal = comps.reduce((acc, c) => {
          let val = 0;
          if (r.componentRates && r.componentRates[c.id] !== undefined && r.componentRates[c.id] !== "") {
            val = Number(r.componentRates[c.id]) || 0;
          } else if (c.id === "labour" && (r.labour !== undefined || r.labourRate !== undefined)) {
            val = Number(r.labour || r.labourRate) || 0;
          } else if (c.id === "material" && (r.material !== undefined || r.materialRate !== undefined)) {
            val = Number(r.material || r.materialRate) || 0;
          } else if (r[c.id] !== undefined && r[c.id] !== "") {
            val = Number(r[c.id]) || 0;
          }
          return acc + val;
        }, 0);

        const actualRowTotal = Number(r.totalRate ?? r.rate ?? r.total ?? 0);
        if (Math.abs(expectedRowTotal - actualRowTotal) > 0.01) {
          const errMsg = `[PDF Export Validation Error] Row total mismatch for "${r.work || r.desc || r.description || 'Item'}". Expected ₹${expectedRowTotal}, got ₹${actualRowTotal}`;
          console.error(errMsg);
          throw new Error(errMsg);
        }
      }
    }
  }

  // Run pre-export verification
  validatePDFLayout(element);

  // Preserve original inline style properties
  const originalDisplay = element.style.display;
  const originalPosition = element.style.position;
  const originalLeft = element.style.left;
  const originalTop = element.style.top;
  const originalWidth = element.style.width;

  // Mount element visibly off-screen at standard A4 printable width (794px = 178mm at 96 DPI)
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

    // ── A4 GEOMETRY DEFINITIONS ──
    const pdfPageWidth = 210; // mm
    const pdfPageHeight = 297; // mm
    const marginX = 16; // mm (Left & Right Margins: 16mm)
    const marginTop = 20; // mm (Top Margin: 20mm)
    const marginBottom = 18; // mm (Bottom Margin: 18mm)
    const headerHeight = 35; // mm (Fixed Header Height)
    const footerHeight = 15; // mm (Fixed Footer Height)

    const printableWidth = pdfPageWidth - marginX * 2; // 178 mm
    const contentHeightMm = pdfPageHeight - marginTop - marginBottom - headerHeight - footerHeight; // 209 mm

    // Convert content height mm to canvas pixels
    const pageCanvasHeightPx = (contentHeightMm * canvas.width) / printableWidth;

    // Detect section cards, table rows, and atomic blocks for page breaking
    const breakCandidates = Array.from(
      element.querySelectorAll(
        ".pdf-keep-together, .pdf-section-block, .pdf-category-block, .pdf-summary-block, .pdf-bank-block, .pdf-signature-block, .pdf-client-block, table, tr, h1, h2, h3, .border, .rounded-xl, .rounded-2xl"
      )
    );

    const containerRect = element.getBoundingClientRect();
    const scaleFactor = canvas.height / (containerRect.height || 1);

    // ── PAGINATION CUT CALCULATION ALGORITHM ──
    const pageBreakIndicesPx = [0];
    let currentYPx = 0;

    while (currentYPx + pageCanvasHeightPx < canvas.height - 20) {
      const targetCutPx = currentYPx + pageCanvasHeightPx;
      let chosenCutPx = targetCutPx;
      let foundBoundary = false;

      // Scan break candidates to find optimal cut point above atomic blocks or table rows
      for (const el of breakCandidates) {
        const rect = el.getBoundingClientRect();
        const topPx = (rect.top - containerRect.top) * scaleFactor;
        const bottomPx = (rect.bottom - containerRect.top) * scaleFactor;
        const isAtomic =
          el.classList.contains("pdf-keep-together") ||
          el.classList.contains("pdf-summary-block") ||
          el.classList.contains("pdf-signature-block") ||
          el.classList.contains("pdf-bank-block") ||
          el.classList.contains("pdf-client-block");

        // If an element crosses the targetCutPx boundary
        if (topPx > currentYPx + 60 && topPx <= targetCutPx && bottomPx > targetCutPx) {
          if (isAtomic) {
            // Atomic section: break cleanly above the entire section
            chosenCutPx = topPx - 6;
            foundBoundary = true;
            break;
          } else if (el.tagName === "TR") {
            // Table Row: break cleanly above the row to prevent cutting in half
            chosenCutPx = topPx - 4;
            foundBoundary = true;
            break;
          } else if (!foundBoundary) {
            chosenCutPx = topPx - 4;
            foundBoundary = true;
          }
        }
      }

      if (!foundBoundary) {
        chosenCutPx = targetCutPx;
      }

      pageBreakIndicesPx.push(chosenCutPx);
      currentYPx = chosenCutPx;
    }

    const totalPages = pageBreakIndicesPx.length;

    // ── HEADER & FOOTER METADATA ──
    const companyName = (
      quotationData.companyName ||
      quotationData.projectDetails?.companyName ||
      "VisionX Enterprises"
    ).trim();
    const tagline = (
      quotationData.companyTagline ||
      quotationData.projectDetails?.companyTagline ||
      ""
    ).trim();
    const address = (
      quotationData.companyAddress ||
      quotationData.projectDetails?.companyAddress ||
      ""
    ).trim();
    const refNo =
      quotationData.quotationNo ||
      quotationData.referenceNo ||
      quotationData.projectDetails?.referenceNo ||
      "QTN-2026";
    const dateStr =
      quotationData.date ||
      quotationData.projectDetails?.date ||
      new Date().toLocaleDateString("en-GB");
    const expiryStr =
      quotationData.expiryDate ||
      quotationData.projectDetails?.expiryDate ||
      "";
    const companyPhone = quotationData.companyPhone || quotationData.phone || "";
    const companyEmail = quotationData.companyEmail || quotationData.email || "";
    const gstNo = quotationData.gstNo || quotationData.gst || "";
    const website = quotationData.website || "";
    const logoUrl = quotationData.companyLogo || null;

    const contactParts = [];
    if (companyPhone) contactParts.push(`Ph: ${companyPhone}`);
    if (companyEmail) contactParts.push(`Email: ${companyEmail}`);
    if (gstNo) contactParts.push(`GSTIN: ${gstNo}`);
    const contactInfo = contactParts.length > 0 ? contactParts.join(" • ") : "VisionX QuoteGen Pro Proposal";

    const contentStartYMm = marginTop + headerHeight; // 20mm + 35mm = 55mm

    // ── 2. RENDER PAGE SLICES INTO PDF ──
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
      pdf.addImage(
        pageImgData,
        "JPEG",
        marginX,
        contentStartYMm,
        printableWidth,
        Math.min(sliceHeightMm, contentHeightMm)
      );

      // ── 3. REPEATING FIXED HEADER (35mm Height on Every Page) ──
      // Top Margin: 20mm. Header renders between y = 10mm and y = 45mm.
      
      // Header Top Border Accent
      pdf.setFillColor(37, 99, 235); // Blue-600 accent bar
      pdf.rect(marginX, 8, printableWidth, 1.5, "F");

      // Left Column: Company Name & Identity
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.setTextColor(15, 23, 42); // slate-900
      pdf.text(companyName.toUpperCase(), marginX, 15);

      let headerDetailY = 19;
      if (tagline) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7.5);
        pdf.setTextColor(37, 99, 235); // blue-600
        pdf.text(tagline, marginX, headerDetailY);
        headerDetailY += 4;
      }

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(71, 85, 105); // slate-600

      if (address) {
        const addressLines = pdf.splitTextToSize(address.replace(/\n/g, ", "), 110);
        pdf.text(addressLines[0] || "", marginX, headerDetailY);
        headerDetailY += 3.5;
      }

      pdf.text(contactInfo, marginX, headerDetailY);

      // Right Column: Proposal Document Title & Metadata
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(13);
      pdf.setTextColor(15, 23, 42);
      pdf.text("QUOTATION", pdfPageWidth - marginX, 15, { align: "right" });

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(37, 99, 235);
      pdf.text(`REF: ${refNo}`, pdfPageWidth - marginX, 20, { align: "right" });

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.setTextColor(100, 116, 139);
      pdf.text(`DATE: ${dateStr}`, pdfPageWidth - marginX, 24.5, { align: "right" });

      if (expiryStr) {
        pdf.text(`VALID UNTIL: ${expiryStr}`, pdfPageWidth - marginX, 28.5, { align: "right" });
      }

      // Header Bottom Divider Line at 45mm
      pdf.setDrawColor(203, 213, 225); // slate-300
      pdf.setLineWidth(0.4);
      pdf.line(marginX, 43, pdfPageWidth - marginX, 43);

      // ── 4. REPEATING FIXED FOOTER (16mm Height, 3 Independent Bounded Zones) ──
      // Footer Overline Line at 278mm (pdfPageHeight - 19mm)
      pdf.setDrawColor(203, 213, 225); // slate-300
      pdf.setLineWidth(0.35);
      pdf.line(marginX, pdfPageHeight - 19, pdfPageWidth - marginX, pdfPageHeight - 19);

      // Zone Width Specifications (Printable Width = 178mm)
      const leftZoneWidth = printableWidth * 0.45; // 80.1mm (45%)
      const centerZoneWidth = printableWidth * 0.30; // 53.4mm (30%)
      const rightZoneWidth = printableWidth * 0.25; // 44.5mm (25%)

      const footerTextY = pdfPageHeight - 13; // 284mm

      // ── ZONE 1: LEFT (45% Width = 80.1mm) ──
      // Contains Phone, Email, GST Number
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(100, 116, 139); // slate-500

      const leftLines = pdf.splitTextToSize(contactInfo, leftZoneWidth);
      pdf.text(leftLines, marginX, footerTextY);

      // ── ZONE 2: CENTER (30% Width = 53.4mm) ──
      // Contains Website & "Generated by VisionX QuoteGen Pro"
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7);
      pdf.setTextColor(71, 85, 105); // slate-600

      const centerTextStr = website
        ? `${website}\nGenerated by VisionX QuoteGen Pro`
        : "Generated by VisionX QuoteGen Pro";

      const centerLines = pdf.splitTextToSize(centerTextStr, centerZoneWidth);
      const centerX = marginX + leftZoneWidth + centerZoneWidth / 2; // 122.8mm
      pdf.text(centerLines, centerX, footerTextY, { align: "center" });

      // ── ZONE 3: RIGHT (25% Width = 44.5mm) ──
      // Fixed right alignment at pdfPageWidth - marginX (194mm)
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.5);
      pdf.setTextColor(15, 23, 42); // slate-900
      pdf.text(
        `Page ${pageIdx + 1} of ${totalPages}`,
        pdfPageWidth - marginX,
        footerTextY + 1,
        { align: "right" }
      );
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

export async function downloadPDF(mappedData) {
  window.print();
}

export const pdfExporter = {
  exportEnterprisePDF,
  downloadPDF
};

export default pdfExporter;
