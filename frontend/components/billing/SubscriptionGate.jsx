"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  billingUpgradeUrl,
  hasActiveSubscription,
  requiresSubscription,
} from "@/lib/subscriptionAccess";

/**
 * Redirects unpaid users away from premium dashboard routes.
 */
export default function SubscriptionGate({ children }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;
    if (!requiresSubscription(pathname)) return;
    if (hasActiveSubscription(user)) return;
    router.replace(billingUpgradeUrl());
  }, [user, loading, pathname, router]);

  if (loading) return children;

  if (user && requiresSubscription(pathname) && !hasActiveSubscription(user)) {
    return null;
  }

  return children;
}
