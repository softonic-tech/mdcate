"use client";

import { Suspense } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/context/AuthContext";
import { ProfileProvider } from "@/context/ProfileContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "react-hot-toast";

function Providers({ children }) {
  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
    >
      <ThemeProvider>
        <AuthProvider>
          <ProfileProvider>{children}</ProfileProvider>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default function ClientLayout({ children }) {
  return (
    <Suspense
      fallback={
        <div className="page-loader">
          <video autoPlay muted loop playsInline className="page-loader__logo">
            <source src="/logo.mp4" type="video/mp4" />
          </video>
          <div className="loader-spinner" />
        </div>
      }
    >
      <Providers>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "var(--bg-card)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-medium)",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "var(--teal)", secondary: "var(--white)" },
            },
            error: {
              iconTheme: { primary: "var(--coral)", secondary: "var(--white)" },
            },
          }}
        />
      </Providers>
    </Suspense>
  );
}
