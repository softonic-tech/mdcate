"use client";

import Link from "next/link";

export default function GlobalError({ error, reset }) {
  return (
    <div className="utility-page">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="22" stroke="var(--coral)" strokeWidth="2" opacity="0.3" />
        <path d="M24 16v10M24 32h.01" stroke="var(--coral)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <h2 className="utility-page__title">Something went wrong</h2>
      <p className="utility-page__text">
        {error?.message || "An unexpected error occurred. Please try again."}
      </p>
      <div className="utility-page__actions">
        <button type="button" className="btn-primary" onClick={reset}>
          Try Again
        </button>
        <Link href="/" className="btn-ghost">
          Go Home
        </Link>
      </div>
    </div>
  );
}
