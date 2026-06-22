"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { usePathname } from "next/navigation";

const DashboardSearchContext = createContext(null);

const DEFAULT_CONFIG = { placeholder: "Search…", enabled: false };

export function DashboardSearchProvider({ children }) {
  const [query, setQuery] = useState("");
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const pathname = usePathname();

  useEffect(() => {
    setQuery("");
  }, [pathname]);

  const registerSearch = useCallback((next) => {
    setConfig({
      placeholder: next.placeholder || "Search…",
      enabled: next.enabled !== false,
    });
  }, []);

  const unregisterSearch = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
  }, []);

  const clearQuery = useCallback(() => setQuery(""), []);

  const value = useMemo(
    () => ({
      query,
      setQuery,
      clearQuery,
      placeholder: config.placeholder,
      enabled: config.enabled,
      registerSearch,
      unregisterSearch,
    }),
    [query, config, registerSearch, unregisterSearch, clearQuery]
  );

  return (
    <DashboardSearchContext.Provider value={value}>
      {children}
    </DashboardSearchContext.Provider>
  );
}

export function useDashboardSearch() {
  const ctx = useContext(DashboardSearchContext);
  if (!ctx) {
    throw new Error("useDashboardSearch must be used within DashboardSearchProvider");
  }
  return ctx;
}
