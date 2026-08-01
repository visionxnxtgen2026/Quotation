import React from "react";
import { hasVal, hasPositiveNum } from "./templateUtils";

/**
 * SOVEREIGN — Premium Formal Template
 */
export default function SovereignTemplate({ data }) {
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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');

        .sovereign-wrap * { box-sizing: border-box; }

        .sovereign-wrap {
          background: #f8f6f1;
          min-height: 297mm;
          font-family: 'IBM Plex Sans', sans-serif;
          color: #1a1e2e;
          position: relative;
        }

        .sov-inner { position: relative; z-index: 1; }

        .sov-header-block {
          background: #0c1535;
          padding: 44px 52px 0;
          color: #f8f6f1;
        }

        .sov-header-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 32px;
        }

        .sov-company-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 30px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 0.04em;
          margin: 0 0 4px;
          line-height: 1;
        }

        .sov-company-sub {
          font-size: 11px;
          color: #8c97be;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin: 0;
        }

        .sov-seal { text-align: right; }

        .sov-seal-word {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 700;
          color: #c49c54;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          display: block;
          line-height: 1;
        }

        .sov-seal-sub {
          font-size: 9px;
          color: #5c6b9b;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          margin-top: 4px;
          display: block;
        }

        .sov-ref-strip {
          background: rgba(255,255,255,0.04);
          border-top: 1px solid rgba(255,255,255,0.08);
          margin: 0 -52px;
          padding: 14px 52px;
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .sov-ref-item { display: flex; flex-direction: column; gap: 2px; }

        .sov-ref-lbl {
          font-size: 9px;
          font-weight: 500;
          color: #5c6b9b;
          text-transform: uppercase;
          letter-spacing: 0.18em;
        }

        .sov-ref-val {
          font-size: 12px;
          font-weight: 600;
          color: #e2e8f0;
        }

        .sov-ref-divider {
          width: 1px;
          height: 24px;
          background: rgba(255,255,255,0.1);
        }

        .sov-client-block {
          margin: 36px 52px 32px;
          background: #ffffff;
          border: 1px solid #e2ded4;
          border-left: 4px solid #0c1535;
          padding: 24px 32px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }

        .sov-client-eyebrow {
          font-size: 9px;
          font-weight: 700;
          color: #8c97be;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          margin: 0 0 6px;
        }

        .sov-client-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px;
          font-weight: 700;
          color: #0c1535;
          margin: 0 0 4px;
        }

        .sov-client-addr {
          font-size: 12px;
          color: #5a6072;
          margin: 0;
          line-height: 1.6;
        }

        .sov-sections { padding: 0 52px; margin-bottom: 36px; }
        .sov-sec { margin-bottom: 32px; }

        .sov-sec-title-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 2px solid #0c1535;
          padding-bottom: 8px;
          margin-bottom: 16px;
        }

        .sov-sec-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 14px;
          font-weight: 700;
          color: #c49c54;
        }

        .sov-sec-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px;
          font-weight: 700;
          color: #0c1535;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0;
        }

        table.sov {
          width: 100%;
          border-collapse: collapse;
          background: #ffffff;
          border: 1px solid #e2ded4;
        }

        table.sov th {
          background: #f0ece3;
          padding: 11px 16px;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #0c1535;
          border-bottom: 1px solid #d4cebe;
        }

        table.sov th:first-child { text-align: left; }
        table.sov th:not(:first-child) { text-align: center; width: 90px; }
        table.sov th:last-child { text-align: right; width: 120px; }

        table.sov td {
          padding: 13px 16px;
          font-size: 12px;
          color: #2c3246;
          border-bottom: 1px solid #ede8de;
        }

        table.sov td:first-child { white-space: pre-wrap; line-height: 1.5; }
        table.sov td:not(:first-child) { text-align: center; }
        table.sov td:last-child { text-align: right; font-weight: 600; color: #0c1535; }

        .sov-sec-footer {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 16px;
          padding: 10px 16px;
          background: #f0ece3;
          border: 1px solid #e2ded4;
          border-top: none;
        }

        .sov-sec-total-lbl {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #5a6072;
        }

        .sov-sec-total-val {
          font-size: 13px;
          font-weight: 700;
          color: #0c1535;
        }

        .sov-totals-wrap {
          padding: 0 52px;
          display: flex;
          justify-content: flex-end;
          margin-bottom: 40px;
        }

        .sov-totals-panel {
          width: 340px;
          background: #ffffff;
          border: 1px solid #0c1535;
          box-shadow: 0 4px 12px rgba(12,21,53,0.06);
        }

        .sov-totals-rows { padding: 20px 24px 12px; }

        .sov-total-row {
          display: flex;
          justify-content: space-between;
          padding: 7px 0;
          font-size: 12px;
          border-bottom: 1px solid #f0ece3;
        }

        .sov-total-lbl { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: #5a6072; }
        .sov-total-val { font-weight: 600; color: #0c1535; }
        .sov-total-disc { color: #16a34a !important; }

        .sov-grand-bar {
          background: #0c1535;
          color: #ffffff;
          padding: 18px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sov-grand-lbl {
          font-family: 'Cormorant Garamond', serif;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #c49c54;
        }

        .sov-grand-val {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px;
          font-weight: 700;
          color: #ffffff;
        }

        .sov-bottom {
          margin: 0 52px 40px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 36px;
          padding-top: 28px;
          border-top: 1px solid #e2ded4;
        }

        .sov-bottom-head {
          font-family: 'Cormorant Garamond', serif;
          font-size: 14px;
          font-weight: 700;
          color: #0c1535;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          margin-bottom: 14px;
          display: block;
        }

        .sov-terms { padding: 0; margin: 0; list-style: none; }
        .sov-terms li { font-size: 11px; color: #4a5064; margin-bottom: 8px; line-height: 1.5; display: flex; gap: 8px; }
        .sov-term-bullet { width: 5px; height: 5px; background: #c49c54; margin-top: 5px; shrink-0; }

        .sov-bank-rows { background: #ffffff; border: 1px solid #e2ded4; padding: 16px 20px; }
        .sov-bank-row { display: flex; justify-between: space-between; padding: 6px 0; border-bottom: 1px solid #f0ece3; font-size: 11px; }
        .sov-bank-lbl { color: #8c97be; font-size: 9px; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 600; }
        .sov-bank-val { font-weight: 600; color: #0c1535; margin-left: auto; }

        .sov-official-footer {
          margin: 0 52px 40px;
          padding-top: 24px;
          border-top: 2px solid #0c1535;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .sov-footer-stamp-title { font-family: 'Cormorant Garamond', serif; font-size: 15px; font-weight: 700; color: #0c1535; display: block; }
        .sov-footer-stamp-sub { font-size: 9px; color: #8a8070; text-transform: uppercase; letter-spacing: 0.15em; }

        .sov-footer-sig { text-align: right; }
        .sov-sig-line { width: 150px; height: 1px; background: #0c1535; margin-bottom: 7px; margin-left: auto; }
        .sov-sig-lbl { font-size: 9px; font-weight: 600; color: #8a8070; text-transform: uppercase; letter-spacing: 0.2em; }
      `}</style>

      <div className="sovereign-wrap">
        <div className="sov-inner">

          {/* ── NAVY HEADER ── */}
          {(hasCompanyHeader || hasDocHeader) && (
            <div className="sov-header-block">
              <div className="sov-header-inner">
                <div style={{ display: "flex", itemsCenter: "center", gap: 18 }}>
                  {hasLogo && (
                    <img src={quote.companyLogo} alt="Logo" style={{ width: 56, height: 56, objectFit: "contain" }} />
                  )}
                  {(hasCompanyName || hasCompanyPhone || hasCompanyEmail) && (
                    <div>
                      {hasCompanyName && <h1 className="sov-company-name">{quote.companyName}</h1>}
                      {(hasCompanyPhone || hasCompanyEmail) && (
                        <p className="sov-company-sub">
                          {hasCompanyPhone && quote.companyPhone}
                          {hasCompanyPhone && hasCompanyEmail && " \u00a0|\u00a0 "}
                          {hasCompanyEmail && quote.companyEmail}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="sov-seal">
                  <span className="sov-seal-word">Quotation</span>
                  <span className="sov-seal-sub">Formal Proposal</span>
                </div>
              </div>

              {hasDocHeader && (
                <div className="sov-ref-strip">
                  {hasRefNo && (
                    <div className="sov-ref-item">
                      <span className="sov-ref-lbl">Reference No.</span>
                      <span className="sov-ref-val">{quote.quotationNo}</span>
                    </div>
                  )}
                  {hasRefNo && hasDate && <div className="sov-ref-divider" />}
                  {hasDate && (
                    <div className="sov-ref-item">
                      <span className="sov-ref-lbl">Date of Issue</span>
                      <span className="sov-ref-val">{quote.date}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── CLIENT ── */}
          {hasClientSection && (
            <div className="sov-client-block">
              <div className="sov-client-eyebrow">Submitted To</div>
              {hasClientName && <h3 className="sov-client-name">{quote.clientName}</h3>}
              {hasProjectName && <p style={{ fontSize: 13, fontWeight: 600, color: "#0c1535", margin: "0 0 4px" }}>{quote.projectName}</p>}
              {hasClientAddress && <p className="sov-client-addr">{quote.clientAddress}</p>}
              {(hasBrand || hasWarranty) && (
                <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 12, color: "#0c1535", fontWeight: 600 }}>
                  {hasBrand && <span>Brand: {quote.paintBrand}</span>}
                  {hasWarranty && <span>Warranty: {quote.warranty} Years</span>}
                </div>
              )}
            </div>
          )}

          {/* ── SUBJECT ── */}
          {hasSubject && (
            <div style={{ margin: "0 52px 24px", padding: "14px 20px", background: "#ffffff", border: "1px solid #e2ded4", borderLeft: "4px solid #c49c54" }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#c49c54", textTransform: "uppercase", letterSpacing: "0.2em", display: "block", marginBottom: 4 }}>Subject</span>
              <span style={{ fontSize: 13, color: "#1a1e2e", fontWeight: 500 }}>{quote.subject}</span>
            </div>
          )}

          {/* ── TIMELINE ── */}
          {hasTimeline && (
            <div style={{ margin: "0 52px 24px", display: "flex", gap: 24, fontSize: 12, padding: "12px 20px", background: "#ffffff", border: "1px solid #e2ded4" }}>
              {hasStartDate && <div><span style={{ color: "#8c97be", textTransform: "uppercase", fontSize: 10, fontWeight: 700, marginRight: 6 }}>Start Date:</span> {quote.startDate}</div>}
              {hasEndDate && <div><span style={{ color: "#8c97be", textTransform: "uppercase", fontSize: 10, fontWeight: 700, marginRight: 6 }}>Completion:</span> {quote.endDate}</div>}
            </div>
          )}

          {/* ── SECTIONS ── */}
          {validSections.length > 0 && (
            <div className="sov-sections">
              {validSections.map((sec, idx) => (
                <div className="sov-sec" key={idx}>
                  {hasVal(sec.title) && (
                    <div className="sov-sec-title-bar">
                      <span className="sov-sec-num">§ {String(idx + 1).padStart(2, "0")}</span>
                      <h4 className="sov-sec-title">{sec.title}</h4>
                    </div>
                  )}

                  <table className="sov">
                    <thead>
                      <tr>
                        <th>Description of Work / Item</th>
                        <th>Labour</th>
                        <th>Material</th>
                        <th>Amount (₹)</th>
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
                    <div className="sov-sec-footer">
                      <span className="sov-sec-total-lbl">Section Sub-Total</span>
                      <span className="sov-sec-total-val">Rs. {sec.sectionTotal}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── TOTALS ── */}
          {hasGrandTotal && (
            <div className="sov-totals-wrap">
              <div className="sov-totals-panel">
                <div className="sov-totals-rows">
                  {hasSubtotal && (
                    <div className="sov-total-row">
                      <span className="sov-total-lbl">Gross Amount</span>
                      <span className="sov-total-val">Rs. {quote.subtotal}</span>
                    </div>
                  )}
                  {hasDiscount && (
                    <div className="sov-total-row">
                      <span className="sov-total-lbl">Less: Discount</span>
                      <span className="sov-total-val sov-total-disc">− Rs. {quote.discount}</span>
                    </div>
                  )}
                  {hasTax && (
                    <div className="sov-total-row">
                      <span className="sov-total-lbl">Add: GST / Tax</span>
                      <span className="sov-total-val">Rs. {quote.tax}</span>
                    </div>
                  )}
                </div>
                <div className="sov-grand-bar">
                  <span className="sov-grand-lbl">Net Payable Amount</span>
                  <span className="sov-grand-val">Rs. {quote.grandTotal}</span>
                </div>
              </div>
            </div>
          )}

          {/* ── BOTTOM ── */}
          {(hasScope || hasTerms || hasExclusions || hasBankDetails || hasValidity || hasSignature) && (
            <div className="sov-bottom">
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {hasScope && (
                  <div>
                    <span className="sov-bottom-head">Scope of Work</span>
                    <p style={{ fontSize: 11, color: "#4a5064", lineHeight: 1.6, whiteSpace: "pre-wrap", margin: 0 }}>{quote.scopeOfWork}</p>
                  </div>
                )}
                {hasTerms && (
                  <div>
                    <span className="sov-bottom-head">Terms &amp; Conditions</span>
                    <ul className="sov-terms">
                      {validTerms.map((t, i) => (
                        <li key={i}>
                          <div className="sov-term-bullet" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {hasExclusions && (
                  <div>
                    <span className="sov-bottom-head">Exclusions</span>
                    <p style={{ fontSize: 11, color: "#4a5064", lineHeight: 1.6, whiteSpace: "pre-wrap", margin: 0 }}>{quote.exclusions}</p>
                  </div>
                )}
              </div>

              <div>
                {hasBankDetails && (
                  <>
                    <span className="sov-bottom-head">Bank Account Details</span>
                    <div className="sov-bank-rows">
                      {hasVal(bank.bankName) && (
                        <div className="sov-bank-row">
                          <span className="sov-bank-lbl">Bank Name</span>
                          <span className="sov-bank-val">{bank.bankName}</span>
                        </div>
                      )}
                      {hasVal(bank.accNo) && (
                        <div className="sov-bank-row">
                          <span className="sov-bank-lbl">Account No.</span>
                          <span className="sov-bank-val">{bank.accNo}</span>
                        </div>
                      )}
                      {hasVal(bank.ifsc) && (
                        <div className="sov-bank-row">
                          <span className="sov-bank-lbl">IFSC Code</span>
                          <span className="sov-bank-val">{bank.ifsc}</span>
                        </div>
                      )}
                      {hasVal(bank.accHolder) && (
                        <div className="sov-bank-row">
                          <span className="sov-bank-lbl">Account Holder</span>
                          <span className="sov-bank-val">{bank.accHolder}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {hasValidity && (
                  <div style={{ marginTop: 20 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#0c1535", textTransform: "uppercase", letterSpacing: "0.15em", display: "block", marginBottom: 4 }}>Validity Clause</span>
                    <p style={{ fontSize: 11, color: "#4a5064", margin: 0 }}>{quote.validity}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── OFFICIAL FOOTER ── */}
          {(hasSignature || hasCompanyName) && (
            <div className="sov-official-footer">
              <div className="sov-footer-stamp">
                <span className="sov-footer-stamp-title">{quote.companyName}</span>
                <span className="sov-footer-stamp-sub">VisionX Intelligence — Certified Document</span>
              </div>
              {hasSignature && (
                <div className="sov-footer-sig">
                  <div className="sov-sig-line" />
                  <span className="sov-sig-lbl">{sig.name || quote.companyName} {hasVal(sig.designation) ? `(${sig.designation})` : ""}</span>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}