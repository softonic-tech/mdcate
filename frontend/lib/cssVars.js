/** Read a CSS custom property from :root (theme tokens in styles/theme.css). */
export function getCssVar(name) {
  if (typeof window === "undefined") return "";
  const key = name.startsWith("--") ? name : `--${name}`;
  return getComputedStyle(document.documentElement).getPropertyValue(key).trim();
}
