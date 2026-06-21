"use client";

import Link from "next/link";

export default function GlobalError({ error, reset }) {
  return (
    <div className="page-loader" style={{ gap: "16px" }}>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="22" stroke="var(--coral)" strokeWidth="2" opacity="0.3" />
        <path d="M24 16v10M24 32h.01" stroke="var(--coral)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <h2 style={{ color: "var(--white)", fontSize: "20px", fontFamily: "var(--font-display)" }}>
        Something went wrong
      </h2>
      <p style={{ color: "var(--graphite)", fontSize: "14px", maxWidth: "400px", textAlign: "center" }}>
        {error?.message || "An unexpected error occurred. Please try again."}
      </p>
      <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
        <button
          onClick={reset}
          style={{
            padding: "10px 24px",
            background: "var(--teal)",
            color: "var(--white)",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
          }}
        >
          Try Again
        </button>
        <Link
          href="/"
          style={{
            padding: "10px 24px",
            background: "rgba(255,255,255,0.05)",
            color: "var(--mist)",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
