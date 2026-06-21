"use client";

import { Suspense } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/context/AuthContext";
import { ProfileProvider } from "@/context/ProfileContext";
import { Toaster } from "react-hot-toast";

function Providers({ children }) {
  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
    >
      <AuthProvider>
        <ProfileProvider>{children}</ProfileProvider>
      </AuthProvider>
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
              background: "var(--navy)",
              color: "var(--cloud)",
              border: "1px solid rgba(255,255,255,0.08)",
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
