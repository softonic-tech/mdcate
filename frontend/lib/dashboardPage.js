/** Map pathname → dashboard page slug for per-page colour themes. */
export function getDashboardPageSlug(pathname) {
  if (!pathname?.startsWith("/dashboard")) return "home";
  const rest = pathname.replace(/^\/dashboard\/?/, "");
  if (!rest) return "home";
  if (rest.startsWith("billing")) return "billing";
  return rest.split("/")[0];
}
