"use client";

import { useMemo } from "react";
import { useTheme } from "@/context/ThemeContext";

function readVar(name) {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** Read chart / UI colour tokens from styles/theme.css (single source of truth). */
export function useCssTheme() {
  const { theme } = useTheme();

  return useMemo(() => {
    const v = (token) => readVar(token);

    return {
      chart: {
        grid: v("--chart-grid"),
        tick: v("--chart-tick"),
        primary: v("--chart-primary"),
        primaryLight: v("--chart-primary-light"),
        highlight: v("--chart-highlight"),
        success: v("--chart-success"),
        track: v("--chart-track"),
        palette: [
          v("--accent-1"),
          v("--accent-2"),
          v("--accent-3"),
          v("--accent-4"),
          v("--accent-5"),
          v("--accent-6"),
        ],
        tooltip: {
          background: v("--chart-tooltip-bg"),
          border: `1px solid ${v("--chart-tooltip-border")}`,
          borderRadius: "8px",
          color: v("--chart-tooltip-text"),
          fontSize: "13px",
          boxShadow: v("--chart-tooltip-shadow"),
        },
      },
    };
  }, [theme]);
}
