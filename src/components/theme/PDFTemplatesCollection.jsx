import React from "react";
import QuotationTemplate from "../quotation/QuotationTemplate";

export function CorporateBlueTemplate({ data }) {
  return <QuotationTemplate data={data} templateKey="corporate-blue" />;
}

export function MinimalWhiteTemplate({ data }) {
  return <QuotationTemplate data={data} templateKey="minimal-white" />;
}

export function ConstructionTemplate({ data }) {
  return <QuotationTemplate data={data} templateKey="construction-yellow" />;
}

export function LuxuryGoldTemplate({ data }) {
  return <QuotationTemplate data={data} templateKey="luxury-gold" />;
}

export function PaintContractorTemplate({ data }) {
  return <QuotationTemplate data={data} templateKey="paint-contractor" />;
}

export function ModernGradientTemplate({ data }) {
  return <QuotationTemplate data={data} templateKey="modern-gradient" />;
}

export function ExecutiveProposalTemplate({ data }) {
  return <QuotationTemplate data={data} templateKey="executive-proposal" />;
}

export function InvoiceHybridTemplate({ data }) {
  return <QuotationTemplate data={data} templateKey="invoice-hybrid" />;
}

export function ClassicBusinessTemplate({ data }) {
  return <QuotationTemplate data={data} templateKey="classic-business" />;
}

export function CreativeStudioTemplate({ data }) {
  return <QuotationTemplate data={data} templateKey="creative-studio" />;
}
