import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--midnight)",
        gap: "16px",
        padding: "24px",
      }}
    >
      <span style={{ fontSize: "64px", fontWeight: "800", color: "var(--teal)", fontFamily: "var(--font-display)" }}>
        404
      </span>
      <h2 style={{ color: "var(--white)", fontSize: "20px", fontFamily: "var(--font-display)" }}>
        Page Not Found
      </h2>
      <p style={{ color: "var(--graphite)", fontSize: "14px" }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
        <Link
          href="/"
          style={{
            padding: "10px 24px",
            background: "var(--teal)",
            color: "var(--white)",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
          }}
        >
          Go Home
        </Link>
        <Link
          href="/dashboard"
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
          Dashboard
        </Link>
      </div>
    </div>
  );
}
