import React from "react";
import { hasVal, hasPositiveNum } from "./templateUtils";

/**
 * OBSIDIAN — Premium Dark Luxury Template
 */
export default function ObsidianTemplate({ data }) {
  if (!data) return null;
  const quote = data;

  const validSections = (quote.sections || [])
    .map((sec) => ({
      ...sec,
      items: (sec.items || []).filter((item) => hasVal(item.desc) || hasPositiveNum(item.total)),
    }))
    .filter((sec) => sec.items.length > 0);

  const hasLogo = hasVal(quote.companyLogo);
  const hasCompanyName = hasVal(quote.companyName);
  const hasCompanyPhone = hasVal(quote.companyPhone);
  const hasCompanyEmail = hasVal(quote.companyEmail);
  const hasCompanyHeader = hasLogo || hasCompanyName || hasCompanyPhone || hasCompanyEmail;

  const hasDate = hasVal(quote.date);
  const hasRefNo = hasVal(quote.quotationNo);
  const hasDocHeader = hasDate || hasRefNo;

  const hasClientName = hasVal(quote.clientName);
  const hasClientAddress = hasVal(quote.clientAddress);
  const hasProjectName = hasVal(quote.projectName);
  const hasBrand = hasVal(quote.paintBrand);
  const hasWarranty = hasVal(quote.warranty);
  const hasClientSection = hasClientName || hasClientAddress || hasProjectName || hasBrand || hasWarranty;

  const hasSubject = hasVal(quote.subject);
  const hasStartDate = hasVal(quote.startDate);
  const hasEndDate = hasVal(quote.endDate);
  const hasTimeline = hasStartDate || hasEndDate;

  const hasSubtotal = hasPositiveNum(quote.subtotal);
  const hasDiscount = hasPositiveNum(quote.discount);
  const hasTax = hasPositiveNum(quote.tax);
  const hasGrandTotal = hasPositiveNum(quote.grandTotal) || hasSubtotal;

  const hasScope = hasVal(quote.scopeOfWork);
  const hasExclusions = hasVal(quote.exclusions);
  const hasTerms = Array.isArray(quote.terms) && quote.terms.filter(hasVal).length > 0;
  const validTerms = hasTerms ? quote.terms.filter(hasVal) : [];

  const bank = quote.bankDetails || {};
  const hasBankDetails = hasVal(bank.bankName) || hasVal(bank.accNo) || hasVal(bank.ifsc) || hasVal(bank.accHolder);

  const sig = quote.signature || {};
  const hasSignature = hasVal(sig.name) || hasVal(sig.designation) || hasVal(quote.companyName);
  const hasValidity = hasVal(quote.validity);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

        .obsidian-wrap * { box-sizing: border-box; }

        .obsidian-wrap {
          background: #0e0e10;
          min-height: 297mm;
          font-family: 'DM Sans', sans-serif;
          color: #e8e0d0;
          position: relative;
          overflow: hidden;
        }

        .gold-rule {
          height: 1px;
          background: linear-gradient(90deg, transparent, #c49c54 30%, #e8c87a 50%, #c49c54 70%, transparent);
          margin: 0;
        }

        .obs-header {
          padding: 44px 52px 32px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          position: relative;
        }

        .obs-logo-wrap {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .obs-company-name {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 700;
          color: #f0e6ce;
          letter-spacing: 0.02em;
          margin: 0 0 6px;
          line-height: 1;
        }

        .obs-company-sub {
          font-size: 11px;
          font-weight: 300;
          color: #8a8070;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin: 0;
        }

        .obs-meta { text-align: right; }

        .obs-label {
          font-family: 'Playfair Display', serif;
          font-size: 11px;
          font-style: italic;
          color: #c49c54;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin: 0 0 4px;
          display: block;
        }

        .obs-quotation-title {
          font-family: 'Playfair Display', serif;
          font-size: 38px;
          font-weight: 900;
          color: #f0e6ce;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin: 0 0 20px;
          line-height: 1;
        }

        .obs-ref-row {
          display: flex;
          justify-content: flex-end;
          gap: 32px;
          font-size: 12px;
        }

        .obs-ref-item {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
        }

        .obs-ref-val {
          font-weight: 500;
          color: #e8e0d0;
          font-size: 13px;
        }

        .obs-client-band {
          margin: 0 52px 36px;
          border: 1px solid rgba(196,156,84,0.2);
          padding: 28px 32px;
          position: relative;
          background: rgba(196,156,84,0.03);
        }

        .obs-client-eyebrow {
          font-size: 10px;
          font-weight: 500;
          color: #c49c54;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          margin: 0 0 10px;
        }

        .obs-client-name {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 600;
          color: #f0e6ce;
          margin: 0 0 6px;
        }

        .obs-client-addr {
          font-size: 13px;
          color: #7a7060;
          font-weight: 300;
          margin: 0;
          line-height: 1.6;
        }

        .obs-sections {
          padding: 0 52px;
          margin-bottom: 40px;
        }

        .obs-section { margin-bottom: 36px; }

        .obs-section-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }

        .obs-section-num {
          font-family: 'Playfair Display', serif;
          font-size: 11px;
          font-style: italic;
          color: #c49c54;
          min-width: 24px;
        }

        .obs-section-title {
          font-family: 'Playfair Display', serif;
          font-size: 13px;
          font-weight: 600;
          color: #d4c4a8;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          margin: 0;
        }

        .obs-section-line {
          flex: 1;
          height: 1px;
          background: rgba(196,156,84,0.15);
        }

        .obs-table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid rgba(196,156,84,0.12);
        }

        .obs-table thead tr {
          background: rgba(196,156,84,0.08);
          border-bottom: 1px solid rgba(196,156,84,0.2);
        }

        .obs-table th {
          padding: 12px 18px;
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #c49c54;
        }

        .obs-table th:first-child { text-align: left; }
        .obs-table th:not(:first-child) { text-align: center; width: 90px; }
        .obs-table th:last-child { text-align: right; width: 110px; }

        .obs-table tbody tr {
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }

        .obs-table td {
          padding: 16px 18px;
          font-size: 13px;
          color: #b8b0a0;
          font-weight: 300;
        }

        .obs-table td:first-child {
          font-weight: 400;
          color: #d8d0c0;
          white-space: pre-wrap;
          line-height: 1.6;
        }

        .obs-table td:not(:first-child) { text-align: center; }
        .obs-table td:last-child {
          text-align: right;
          font-weight: 600;
          color: #e8c87a;
          font-size: 14px;
        }

        .obs-section-total {
          text-align: right;
          padding: 10px 0 0;
          font-size: 11px;
        }

        .obs-section-total-label {
          color: #5a5248;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          margin-right: 12px;
          font-size: 10px;
        }

        .obs-section-total-val {
          color: #c49c54;
          font-weight: 600;
          font-size: 13px;
        }

        .obs-billing-wrap {
          padding: 0 52px;
          display: flex;
          justify-content: flex-end;
          margin-bottom: 48px;
        }

        .obs-billing-box {
          width: 340px;
          border: 1px solid rgba(196,156,84,0.25);
          position: relative;
          overflow: hidden;
        }

        .obs-billing-rows { padding: 24px 24px 16px; }

        .obs-billing-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 12px;
        }

        .obs-billing-row-label {
          color: #6a6258;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-size: 10px;
          font-weight: 500;
        }

        .obs-billing-row-val { color: #b8b0a0; font-weight: 400; }
        .obs-billing-discount { color: #6db891 !important; }

        .obs-grand-total-row {
          padding: 20px 24px;
          background: rgba(196,156,84,0.08);
          border-top: 1px solid rgba(196,156,84,0.2);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .obs-grand-label {
          font-family: 'Playfair Display', serif;
          font-size: 11px;
          font-style: italic;
          color: #c49c54;
          text-transform: uppercase;
          letter-spacing: 0.18em;
        }

        .obs-grand-val {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 700;
          color: #e8c87a;
        }

        .obs-bottom {
          margin: 0 52px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          border-top: 1px solid rgba(196,156,84,0.12);
          padding-top: 36px;
          padding-bottom: 52px;
        }

        .obs-bottom-title {
          font-size: 10px;
          font-weight: 600;
          color: #c49c54;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          margin: 0 0 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .obs-terms li {
          font-size: 12px;
          color: #7a7060;
          margin-bottom: 10px;
          line-height: 1.6;
          list-style: none;
        }

        .obs-bank-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 12px;
        }

        .obs-bank-label {
          color: #5a5248;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .obs-bank-val { color: #b8b0a0; font-weight: 400; }
        .obs-bank-val.gold { color: #c49c54; font-weight: 600; }

        .obs-footer {
          text-align: center;
          padding: 0 0 32px;
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: 10px;
          color: #3a3830;
          letter-spacing: 0.3em;
          text-transform: uppercase;
        }
      `}</style>

      <div className="obsidian-wrap">
        {/* ── HEADER ── */}
        {(hasCompanyHeader || hasDocHeader) && (
          <div className="obs-header">
            <div className="obs-logo-wrap">
              {hasLogo && (
                <img src={quote.companyLogo} alt="Logo" style={{ width: 56, height: 56, objectFit: "contain" }} />
              )}
              {(hasCompanyName || hasCompanyPhone || hasCompanyEmail) && (
                <div>
                  {hasCompanyName && <h1 className="obs-company-name">{quote.companyName}</h1>}
                  {(hasCompanyPhone || hasCompanyEmail) && (
                    <p className="obs-company-sub">
                      {hasCompanyPhone && quote.companyPhone}
                      {hasCompanyPhone && hasCompanyEmail && " \u00a0·\u00a0 "}
                      {hasCompanyEmail && quote.companyEmail}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="obs-meta">
              <h2 className="obs-quotation-title">Quotation</h2>
              {hasDocHeader && (
                <div className="obs-ref-row">
                  {hasDate && (
                    <div className="obs-ref-item">
                      <span className="obs-label">Date</span>
                      <span className="obs-ref-val">{quote.date}</span>
                    </div>
                  )}
                  {hasRefNo && (
                    <div className="obs-ref-item">
                      <span className="obs-label">Reference</span>
                      <span className="obs-ref-val">{quote.quotationNo}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {(hasCompanyHeader || hasDocHeader) && <div className="gold-rule" style={{ margin: "0 52px" }} />}

        {/* ── CLIENT ── */}
        {hasClientSection && (
          <div className="obs-client-band" style={{ marginTop: 32 }}>
            <p className="obs-client-eyebrow">Prepared Exclusively For</p>
            {hasClientName && <h3 className="obs-client-name">{quote.clientName}</h3>}
            {hasProjectName && <p style={{ fontSize: 13, fontWeight: 500, color: "#d4c4a8", margin: "0 0 4px" }}>{quote.projectName}</p>}
            {hasClientAddress && <p className="obs-client-addr">{quote.clientAddress}</p>}
            {(hasBrand || hasWarranty) && (
              <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 12, color: "#c49c54", fontWeight: 500 }}>
                {hasBrand && <span>Brand: {quote.paintBrand}</span>}
                {hasWarranty && <span>Warranty: {quote.warranty} Years</span>}
              </div>
            )}
          </div>
        )}

        {/* ── SUBJECT ── */}
        {hasSubject && (
          <div style={{ margin: "0 52px 24px", padding: "12px 20px", borderLeft: "2px solid #c49c54", background: "rgba(196,156,84,0.04)" }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: "#c49c54", textTransform: "uppercase", letterSpacing: "0.2em", marginRight: 12 }}>Subject</span>
            <span style={{ fontSize: 13, color: "#e8e0d0" }}>{quote.subject}</span>
          </div>
        )}

        {/* ── TIMELINE ── */}
        {hasTimeline && (
          <div style={{ margin: "0 52px 24px", display: "flex", gap: 24, fontSize: 12, padding: "12px 20px", border: "1px solid rgba(196,156,84,0.15)", background: "rgba(196,156,84,0.02)" }}>
            {hasStartDate && <div><span style={{ color: "#c49c54", textTransform: "uppercase", fontSize: 10, marginRight: 6 }}>Start Date:</span> {quote.startDate}</div>}
            {hasEndDate && <div><span style={{ color: "#c49c54", textTransform: "uppercase", fontSize: 10, marginRight: 6 }}>Completion:</span> {quote.endDate}</div>}
          </div>
        )}

        {/* ── SECTIONS ── */}
        {validSections.length > 0 && (
          <div className="obs-sections">
            {validSections.map((sec, idx) => (
              <div className="obs-section" key={idx}>
                {hasVal(sec.title) && (
                  <div className="obs-section-header">
                    <span className="obs-section-num">0{idx + 1}</span>
                    <h4 className="obs-section-title">{sec.title}</h4>
                    <div className="obs-section-line" />
                  </div>
                )}

                <table className="obs-table">
                  <thead>
                    <tr>
                      <th>Description of Work</th>
                      <th>Labour</th>
                      <th>Material</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sec.items.map((item, i) => (
                      <tr key={i}>
                        <td>{item.desc}</td>
                        <td>Rs. {item.labour}</td>
                        <td>Rs. {item.material}</td>
                        <td>Rs. {item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {hasVal(sec.sectionTotal) && (
                  <div className="obs-section-total">
                    <span className="obs-section-total-label">Section Total</span>
                    <span className="obs-section-total-val">Rs. {sec.sectionTotal}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── BILLING ── */}
        {hasGrandTotal && (
          <div className="obs-billing-wrap">
            <div className="obs-billing-box">
              <div className="obs-billing-rows">
                {hasSubtotal && (
                  <div className="obs-billing-row">
                    <span className="obs-billing-row-label">Subtotal</span>
                    <span className="obs-billing-row-val">Rs. {quote.subtotal}</span>
                  </div>
                )}
                {hasDiscount && (
                  <div className="obs-billing-row">
                    <span className="obs-billing-row-label">Discount</span>
                    <span className="obs-billing-row-val obs-billing-discount">− Rs. {quote.discount}</span>
                  </div>
                )}
                {hasTax && (
                  <div className="obs-billing-row">
                    <span className="obs-billing-row-label">GST / Tax</span>
                    <span className="obs-billing-row-val">Rs. {quote.tax}</span>
                  </div>
                )}
              </div>
              <div className="obs-grand-total-row">
                <span className="obs-grand-label">Grand Total</span>
                <span className="obs-grand-val">Rs. {quote.grandTotal}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── BOTTOM ── */}
        {(hasScope || hasTerms || hasExclusions || hasBankDetails || hasValidity || hasSignature) && (
          <div className="obs-bottom">
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {hasScope && (
                <div>
                  <p className="obs-bottom-title">Scope of Work</p>
                  <p style={{ fontSize: 12, color: "#b8b0a0", lineHeight: 1.6, whiteSpace: "pre-wrap", margin: 0 }}>{quote.scopeOfWork}</p>
                </div>
              )}
              {hasTerms && (
                <div>
                  <p className="obs-bottom-title">Terms &amp; Conditions</p>
                  <ul className="obs-terms" style={{ padding: 0, margin: 0 }}>
                    {validTerms.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
              )}
              {hasExclusions && (
                <div>
                  <p className="obs-bottom-title">Exclusions</p>
                  <p style={{ fontSize: 12, color: "#b8b0a0", lineHeight: 1.6, whiteSpace: "pre-wrap", margin: 0 }}>{quote.exclusions}</p>
                </div>
              )}
            </div>

            <div>
              {hasBankDetails && (
                <>
                  <p className="obs-bottom-title">Payment Details</p>
                  {hasVal(bank.bankName) && (
                    <div className="obs-bank-row">
                      <span className="obs-bank-label">Bank</span>
                      <span className="obs-bank-val">{bank.bankName}</span>
                    </div>
                  )}
                  {hasVal(bank.accNo) && (
                    <div className="obs-bank-row">
                      <span className="obs-bank-label">Account No.</span>
                      <span className="obs-bank-val">{bank.accNo}</span>
                    </div>
                  )}
                  {hasVal(bank.ifsc) && (
                    <div className="obs-bank-row">
                      <span className="obs-bank-label">IFSC Code</span>
                      <span className="obs-bank-val gold">{bank.ifsc}</span>
                    </div>
                  )}
                  {hasVal(bank.accHolder) && (
                    <div className="obs-bank-row">
                      <span className="obs-bank-label">Account Holder</span>
                      <span className="obs-bank-val">{bank.accHolder}</span>
                    </div>
                  )}
                </>
              )}

              {hasValidity && (
                <div style={{ marginTop: 20 }}>
                  <span style={{ fontSize: 10, color: "#c49c54", textTransform: "uppercase", letterSpacing: "0.18em", display: "block", marginBottom: 4 }}>Validity</span>
                  <p style={{ fontSize: 11, color: "#8a8070", margin: 0 }}>{quote.validity}</p>
                </div>
              )}

              {hasSignature && (
                <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid rgba(196,156,84,0.1)", textAlign: "right" }}>
                  <div style={{ width: 160, height: 1, background: "rgba(196,156,84,0.3)", marginLeft: "auto", marginBottom: 8 }} />
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#f0e6ce", margin: 0 }}>
                    {sig.name || quote.companyName}
                  </p>
                  {hasVal(sig.designation) && (
                    <p style={{ fontSize: 10, fontWeight: 500, color: "#8a8070", textTransform: "uppercase", letterSpacing: "0.15em", margin: "2px 0 0" }}>
                      {sig.designation}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="gold-rule" style={{ margin: "0 52px", marginBottom: 24 }} />
        <div className="obs-footer">VisionX Intelligence — Premium Document</div>
      </div>
    </>
  );
}