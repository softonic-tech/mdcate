"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UpgradeModal from "@/components/billing/UpgradeModal";
import SubscriptionGate from "@/components/billing/SubscriptionGate";
import { DashboardSearchProvider } from "@/context/DashboardSearchContext";
import { useAuth } from "@/context/AuthContext";
import { getMySubscription } from "@/api/billing.api";
import { getDashboardPageSlug } from "@/lib/dashboardPage";
import {
  hasActiveSubscription,
  requiresSubscription,
} from "@/lib/subscriptionAccess";
import {
  isUpgradeModalDismissed,
  dismissUpgradeModal,
  clearUpgradeModalDismissed,
} from "@/lib/upgradeModalDismiss";

function isDashboardHome(pathname) {
  return pathname === "/dashboard" || pathname === "/dashboard/";
}

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const pathname = usePathname();
  const pageSlug = getDashboardPageSlug(pathname);
  const { user } = useAuth();
  const promptedRef = useRef(false);

  const userId = user?.id || user?._id;

  const handleToggle = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleDismissUpgrade = useCallback(() => {
    if (userId) dismissUpgradeModal(userId);
    setShowUpgrade(false);
    promptedRef.current = true;
  }, [userId]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!sidebarOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [sidebarOpen]);

  useEffect(() => {
    if (!user || user.role === "admin") {
      setShowUpgrade(false);
      return;
    }

    if (
      pathname.startsWith("/dashboard/billing") ||
      requiresSubscription(pathname) ||
      !isDashboardHome(pathname)
    ) {
      setShowUpgrade(false);
      return;
    }

    if (isUpgradeModalDismissed(userId) || promptedRef.current) {
      setShowUpgrade(false);
      return;
    }

    let cancelled = false;

    const checkSubscription = async () => {
      let active = hasActiveSubscription(user);

      try {
        const res = await getMySubscription();
        const data = res?.data || res;
        if (data) active = Boolean(data.isActive);
      } catch {
        active = hasActiveSubscription(user);
      }

      if (cancelled) return;

      if (active) {
        if (userId) clearUpgradeModalDismissed(userId);
        setShowUpgrade(false);
        return;
      }

      if (!isUpgradeModalDismissed(userId) && !promptedRef.current) {
        promptedRef.current = true;
        setShowUpgrade(true);
      }
    };

    checkSubscription();

    return () => {
      cancelled = true;
    };
  }, [user, userId, pathname]);

  return (
    <ProtectedRoute>
      <DashboardSearchProvider>
        <SubscriptionGate>
          <div
            className={`dash-layout dash-layout--study${sidebarOpen ? " dash-layout--sidebar-open" : ""}`}
            data-dash-page={pageSlug}
          >
            <Sidebar isOpen={sidebarOpen} onClose={handleClose} />
            <Header onMenuToggle={handleToggle} sidebarOpen={sidebarOpen} />
            <div className="dash-main">
              <main className="dash-content">{children}</main>
              <Footer />
            </div>
          </div>
        </SubscriptionGate>
        <UpgradeModal open={showUpgrade} onClose={handleDismissUpgrade} />
      </DashboardSearchProvider>
    </ProtectedRoute>
  );
}
