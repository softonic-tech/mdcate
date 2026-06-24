/** Paid-only dashboard routes — everything else is free for logged-in users */
const PREMIUM_ROUTE_PREFIXES = [
  "/dashboard/learn",
  "/dashboard/mcq-bank",
  "/dashboard/tests",
  "/dashboard/past-papers",
  "/dashboard/books",
  "/dashboard/chapter-videos",
  "/dashboard/video-summarizer",
];

export function hasActiveSubscription(user) {
  if (!user) return false;
  if (user.role === "admin") return true;
  return Boolean(user.subscription?.isActive);
}

export function requiresSubscription(pathname) {
  if (!pathname?.startsWith("/dashboard")) return false;
  return PREMIUM_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isFreeDashboardRoute(pathname) {
  if (!pathname?.startsWith("/dashboard")) return true;
  return !requiresSubscription(pathname);
}

export function billingUpgradeUrl() {
  return "/dashboard/billing?upgrade=required";
}

export function isPremiumHref(href) {
  return requiresSubscription(href);
}
