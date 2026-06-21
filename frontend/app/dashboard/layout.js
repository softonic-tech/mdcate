"use client";

import { useState, useCallback } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggle = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <ProtectedRoute>
      <div className="dash-layout">
        <Sidebar isOpen={sidebarOpen} onClose={handleClose} />
        <div className="dash-main">
          <Header onMenuToggle={handleToggle} />
          <main className="dash-content">{children}</main>
          <Footer />
        </div>
      </div>
    </ProtectedRoute>
  );
}
