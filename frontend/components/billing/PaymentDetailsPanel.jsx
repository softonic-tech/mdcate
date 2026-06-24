"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Smartphone, Building2, Copy, Info } from "lucide-react";

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <button type="button" className="billing-copy-btn" onClick={handleCopy} title="Copy">
      {copied ? "Copied" : <Copy size={14} />}
    </button>
  );
}

function DetailLine({ label, value }) {
  if (!value?.trim?.()) return null;
  return (
    <div className="billing-detail-line">
      <span className="billing-detail-line__label">{label}</span>
      <span className="billing-detail-line__value">{value}</span>
      <CopyButton value={value} />
    </div>
  );
}

export default function PaymentDetailsPanel({ settings, amount, compact = false }) {
  if (!settings) return null;

  const hasJazzcash = Boolean(settings.jazzcashNumber?.trim?.());
  const hasEasypaisa = Boolean(settings.easypaisaNumber?.trim?.());
  const hasBank =
    Boolean(settings.bankAccountNumber?.trim?.()) ||
    Boolean(settings.bankIban?.trim?.()) ||
    Boolean(settings.bankName?.trim?.());

  const hasAny = hasJazzcash || hasEasypaisa || hasBank;

  if (!hasAny) {
    return (
      <div className="billing-details billing-details--empty">
        <Info size={18} />
        <p>Payment account details are not set up yet. Please contact support or check back soon.</p>
      </div>
    );
  }

  return (
    <div className={`billing-details ${compact ? "billing-details--compact" : ""}`}>
      <div className="billing-details__header">
        <h3 className="section-title-sm">Where to send payment</h3>
        {amount != null && (
          <p className="billing-amount-due">
            Send exactly: <strong>PKR {Number(amount).toLocaleString()}</strong>
          </p>
        )}
        <p className="billing-checkout__hint">
          Transfer the plan amount using any method below, then upload your payment screenshot.
        </p>
      </div>

      <div className="billing-details__grid">
        {hasJazzcash && (
          <article className="billing-details__card">
            <div className="billing-details__card-head">
              <Smartphone size={18} />
              <h4>JazzCash</h4>
            </div>
            {settings.jazzcashAccountTitle && (
              <p className="billing-details__title">{settings.jazzcashAccountTitle}</p>
            )}
            <DetailLine label="Mobile number" value={settings.jazzcashNumber} />
          </article>
        )}

        {hasEasypaisa && (
          <article className="billing-details__card">
            <div className="billing-details__card-head">
              <Smartphone size={18} />
              <h4>Easypaisa</h4>
            </div>
            {settings.easypaisaAccountTitle && (
              <p className="billing-details__title">{settings.easypaisaAccountTitle}</p>
            )}
            <DetailLine label="Mobile number" value={settings.easypaisaNumber} />
          </article>
        )}

        {hasBank && (
          <article className="billing-details__card billing-details__card--wide">
            <div className="billing-details__card-head">
              <Building2 size={18} />
              <h4>Bank transfer</h4>
            </div>
            {settings.bankAccountTitle && (
              <p className="billing-details__title">{settings.bankAccountTitle}</p>
            )}
            <DetailLine label="Bank" value={settings.bankName} />
            <DetailLine label="Account number" value={settings.bankAccountNumber} />
            <DetailLine label="IBAN" value={settings.bankIban} />
          </article>
        )}
      </div>

      {settings.manualInstructions?.trim?.() && (
        <p className="billing-instructions">{settings.manualInstructions}</p>
      )}
    </div>
  );
}
