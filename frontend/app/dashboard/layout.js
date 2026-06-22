"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UpgradeModal from "@/components/billing/UpgradeModal";
import { DashboardSearchProvider } from "@/context/DashboardSearchContext";
import { useAuth } from "@/context/AuthContext";
import { getMySubscription } from "@/api/billing.api";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [trialDays, setTrialDays] = useState(null);
  const pathname = usePathname();
  const { user } = useAuth();

  const handleToggle = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setSidebarOpen(false);
  }, []);

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
    if (!user || user.role === "admin") return;
    if (pathname.startsWith("/dashboard/billing")) return;

    const sub = user.subscription;
    if (sub?.needsUpgrade) {
      setTrialDays(sub.daysRemaining ?? 0);
      setShowUpgrade(true);
      return;
    }

    getMySubscription()
      .then((res) => {
        const data = res?.data || res;
        if (data?.needsUpgrade) {
          setTrialDays(data.daysRemaining ?? 0);
          setShowUpgrade(true);
        }
      })
      .catch(() => {});
  }, [user, pathname]);

  return (
    <ProtectedRoute>
      <DashboardSearchProvider>
        <div className={`dash-layout dash-layout--study${sidebarOpen ? " dash-layout--sidebar-open" : ""}`}>
          <Sidebar isOpen={sidebarOpen} onClose={handleClose} />
          <Header onMenuToggle={handleToggle} sidebarOpen={sidebarOpen} />
          <div className="dash-main">
            <main className="dash-content">{children}</main>
            <Footer />
          </div>
        </div>
        <UpgradeModal
          open={showUpgrade}
          onClose={() => setShowUpgrade(false)}
          daysRemaining={trialDays ?? 0}
        />
      </DashboardSearchProvider>
    </ProtectedRoute>
  );
}
