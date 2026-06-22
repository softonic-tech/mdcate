"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after loading is done and there's no user
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  // Show loader while checking auth
  if (loading) {
    return (
      <div className="page-loader">
        <div className="loader-spinner" />
        <p className="loader-text">Loading medprep.study…</p>
      </div>
    );
  }

  // Not authenticated — render nothing while redirect happens
  if (!user) return null;

  return children;
}
