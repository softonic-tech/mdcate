"use client";

import { useEffect } from "react";
import { useDashboardSearch } from "@/context/DashboardSearchContext";

export function usePageSearch(placeholder) {
  const { query, clearQuery, registerSearch, unregisterSearch } = useDashboardSearch();

  useEffect(() => {
    registerSearch({ placeholder, enabled: true });
    return () => unregisterSearch();
  }, [placeholder, registerSearch, unregisterSearch]);

  return { query, clearQuery };
}
