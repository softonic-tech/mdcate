"use client";

import { memo, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  BookOpen,
  FileText,
  ClipboardList,
  Brain,
  Video,
  BarChart3,
  Layers,
  MessageSquare,
  Award,
  Lightbulb,
  Zap,
  CalendarCheck,
  Download,
  Bell,
  HelpCircle,
  Users,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV_SECTIONS = [
  {
    label: "Main",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Profile", href: "/dashboard/profile", icon: User },
    ],
  },
  {
    label: "Learning",
    items: [
      { name: "MCQ Bank", href: "/dashboard/mcq-bank", icon: ClipboardList },
      { name: "Tests", href: "/dashboard/tests", icon: FileText },
      { name: "Past Papers", href: "/dashboard/past-papers", icon: BookOpen },
      { name: "Books & Notes", href: "/dashboard/books", icon: BookOpen },
      { name: "Video Summarizer", href: "/dashboard/video-summarizer", icon: Video },
    ],
  },
  {
    label: "Practice",
    items: [
      { name: "Flashcards", href: "/dashboard/flashcards", icon: Layers },
      { name: "Daily Challenges", href: "/dashboard/challenges", icon: CalendarCheck },
      { name: "High-Yield Facts", href: "/dashboard/high-yield", icon: Zap },
      { name: "Mnemonics", href: "/dashboard/mnemonics", icon: Lightbulb },
    ],
  },
  {
    label: "Community",
    items: [
      { name: "Discussion Room", href: "/dashboard/discussion", icon: MessageSquare },
      { name: "Counseling Room", href: "/dashboard/counseling", icon: Users },
      { name: "Leaderboard", href: "/dashboard/leaderboard", icon: Award },
    ],
  },
  {
    label: "Tools",
    items: [
      { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { name: "Offline Mode", href: "/dashboard/offline", icon: Download },
      { name: "Study Plan", href: "/dashboard/study-plan", icon: CalendarCheck },
      { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
      { name: "Contact Us", href: "/dashboard/contact", icon: HelpCircle },
    ],
  },
];

function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleNavClick = useCallback(() => {
    if (window.innerWidth < 1024) onClose();
  }, [onClose]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
        {/* Logo */}
        <div className="sidebar__logo">
          <Link href="/dashboard" className="sidebar__logo-link" onClick={handleNavClick}>
            <div className="sidebar__logo-icon">
              <video autoPlay muted loop playsInline className="sidebar__logo-video">
                <source src="/logo.mp4" type="video/mp4" />
              </video>
            </div>
            <span className="sidebar__logo-text">
              Med<span className="sidebar__logo-accent">Prep</span>
            </span>
          </Link>
          <button className="sidebar__close" onClick={onClose} aria-label="Close sidebar">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar__nav">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="sidebar__section">
              <span className="sidebar__section-label">{section.label}</span>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar__link ${isActive ? "sidebar__link--active" : ""}`}
                    onClick={handleNavClick}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="sidebar__footer">
          <button className="sidebar__logout" onClick={logout}>
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default memo(Sidebar);
