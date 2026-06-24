"use client";

import Link from "next/link";
import { Sparkles, X } from "lucide-react";

export default function UpgradeModal({ open, onClose }) {
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
          Subscribe to keep learning
        </h2>
        <p className="upgrade-modal__desc">
          You need an active plan to access the full MCQ bank, tests, AI tools, and more. Choose a plan,
          pay via JazzCash, Easypaisa, or bank transfer, and upload your payment screenshot.
        </p>

        <div className="upgrade-modal__actions">
          <Link href="/dashboard/billing" className="btn-primary btn--full" onClick={onClose}>
            View plans & subscribe
          </Link>
          <button type="button" className="btn-ghost btn--full" onClick={onClose}>
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
