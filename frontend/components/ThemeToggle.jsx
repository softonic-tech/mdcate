"use client";

import { memo } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

function ThemeToggle({ className = "", size = 20, showLabel = false }) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? <Sun size={size} aria-hidden="true" /> : <Moon size={size} aria-hidden="true" />}
      {showLabel && (
        <span className="theme-toggle__label">
          {isDark ? "Light" : "Dark"}
        </span>
      )}
    </button>
  );
}

export default memo(ThemeToggle);
