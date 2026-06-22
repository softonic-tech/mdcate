"use client";

import Link from "next/link";
import { Sparkles, X } from "lucide-react";

export default function UpgradeModal({ open, onClose, daysRemaining }) {
  if (!open) return null;

  return (
    <div className="upgrade-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="upgrade-title">
      <div className="upgrade-modal">
        <button type="button" className="upgrade-modal__close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="upgrade-modal__icon" aria-hidden="true">
          <Sparkles size={28} />
        </div>

        <h2 id="upgrade-title" className="upgrade-modal__title">
          {daysRemaining === 0 ? "Your free trial has ended" : "Upgrade to keep learning"}
        </h2>
        <p className="upgrade-modal__desc">
          {daysRemaining === 0
            ? "Your 7-day free trial is over. Upgrade with JazzCash or Easypaisa to unlock the full MCQ bank, tests, AI tools, and more."
            : `You have ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left in your free trial. Upgrade now to avoid interruption.`}
        </p>

        <div className="upgrade-modal__actions">
          <Link href="/dashboard/billing" className="btn-primary btn--full">
            View plans & upgrade
          </Link>
          <button type="button" className="btn-ghost btn--full" onClick={onClose}>
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
