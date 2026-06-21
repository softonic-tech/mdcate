"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "@/lib/services";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check stored token on mount
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const stored = localStorage.getItem("admin_user");

    if (token && stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("admin_user");
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authService.login({ email, password });
    console.log(res);
    if (res.data?.role !== "admin") {
      throw new Error("Access denied. Admin only.");
    }
    localStorage.setItem("admin_token", res.token);
    localStorage.setItem("admin_user", JSON.stringify(res.data));
    setUser(res.data);
    router.push("/admin/dashboard");
    return res;
  }, [router]);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
