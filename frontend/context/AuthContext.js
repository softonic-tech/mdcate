"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { getMeApi, logoutApi } from "@/api/auth.api";
import { setToken, removeToken, getToken } from "@/api/client";

const AuthContext = createContext(null);

const normalizeUser = (userData) => {
  if (!userData) return null;
  const id = userData.id || userData._id;
  if (!id) return userData;
  return { ...userData, id, _id: id };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ──────────────────────────────────────────────
  // 1. On mount — capture OAuth token from URL
  //    Google/Facebook redirect back with ?token=xxx
  // ──────────────────────────────────────────────
  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
      // Clean the token from URL without full reload
      const cleanUrl = pathname;
      window.history.replaceState({}, "", cleanUrl);
    }
  }, [searchParams, pathname]);

  // ──────────────────────────────────────────────
  // 2. On mount — fetch current user
  //    Works via Bearer (localStorage) OR httpOnly cookie
  //    This is what keeps the user logged in after refresh
  // ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      // If no token in localStorage AND we're on an auth page,
      // still try getMeApi (cookie might work), but don't block
      try {
        const res = await getMeApi();
        if (!cancelled) {
          const userData = res?.user || res?.data || null;
          setUser(normalizeUser(userData));
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          removeToken(); // stale token, clean up
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUser();
    return () => {
      cancelled = true;
    };
  }, []);

  // ──────────────────────────────────────────────
  // 3. Redirect logged-in users away from auth pages
  // ──────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;
    if (user && pathname.startsWith("/auth")) {
      const redirectTo = user.role === "admin" ? "/admin/dashboard" : "/dashboard";
      router.replace(redirectTo);
    }
  }, [user, loading, pathname, router]);

  // ──────────────────────────────────────────────
  // Login — called after successful loginApi
  // Saves token to localStorage + sets user in state
  // ──────────────────────────────────────────────
  const login = useCallback((apiResponse) => {
    // apiResponse shape from backend:
    // { success, message, token, data: { id, username, email, role, ... } }
    const token = apiResponse?.token;
    const userData = apiResponse?.data || apiResponse;

    if (token) setToken(token);
    setUser(normalizeUser(userData));
  }, []);

  // ──────────────────────────────────────────────
  // Logout — clears everything
  // ──────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await logoutApi(); // clears httpOnly cookie on backend
    } catch {
      // logout even if API fails
    }
    removeToken();
    setUser(null);
    router.push("/auth/login");
  }, [router]);

  const value = useMemo(
    () => ({ user, login, logout, loading, setUser }),
    [user, login, logout, loading]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
