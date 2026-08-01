/**
 * Automatically generates a unique quotation reference number in format: QTN-YYYYMMDD-XXXX
 * Maintains a running sequence counter in localStorage and resets to 0001 when a new day starts.
 */
export const generateReferenceNo = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;

  const storedDate = localStorage.getItem("quotation_ref_date");
  let sequence = parseInt(localStorage.getItem("quotation_ref_seq") || "0", 10);

  if (storedDate !== dateStr) {
    // New day detected -> reset sequence counter to 1
    sequence = 1;
  } else {
    // Same day -> increment sequence counter
    sequence += 1;
  }

  localStorage.setItem("quotation_ref_date", dateStr);
  localStorage.setItem("quotation_ref_seq", String(sequence));

  const seqStr = String(sequence).padStart(4, "0");
  return `QTN-${dateStr}-${seqStr}`;
};
