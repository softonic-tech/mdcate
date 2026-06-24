"use client";

import { memo, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User,
  BookOpen,
  FileText,
  ClipboardList,
  Brain,
  Video,
  PlayCircle,
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
  CreditCard,
  X,
  LogOut,
  GraduationCap,
  Lock,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { billingUpgradeUrl, hasActiveSubscription } from "@/lib/subscriptionAccess";

const NAV_SECTIONS = [
  {
    label: "Main",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, premium: false },
      { name: "Profile", href: "/dashboard/profile", icon: User, premium: false },
    ],
  },
  {
    label: "Learning",
    items: [
      { name: "Start Learning", href: "/dashboard/learn", icon: GraduationCap, premium: true },
      { name: "MCQ Bank", href: "/dashboard/mcq-bank", icon: ClipboardList, premium: true },
      { name: "Tests", href: "/dashboard/tests", icon: FileText, premium: true },
      { name: "Past Papers", href: "/dashboard/past-papers", icon: BookOpen, premium: true },
      { name: "Books & Notes", href: "/dashboard/books", icon: BookOpen, premium: true },
      { name: "Chapter Videos", href: "/dashboard/chapter-videos", icon: PlayCircle, premium: true },
      { name: "Video Summarizer", href: "/dashboard/video-summarizer", icon: Video, premium: true },
    ],
  },
  {
    label: "Practice",
    items: [
      { name: "Flashcards", href: "/dashboard/flashcards", icon: Layers, premium: false },
      { name: "Daily Challenges", href: "/dashboard/challenges", icon: CalendarCheck, premium: false },
      { name: "High-Yield Facts", href: "/dashboard/high-yield", icon: Zap, premium: false },
      { name: "Mnemonics", href: "/dashboard/mnemonics", icon: Lightbulb, premium: false },
    ],
  },
  {
    label: "Community",
    items: [
      { name: "Discussion Room", href: "/dashboard/discussion", icon: MessageSquare, premium: false },
      { name: "Leaderboard", href: "/dashboard/leaderboard", icon: Award, premium: false },
    ],
  },
  {
    label: "Tools",
    items: [
      { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3, premium: false },
      { name: "Offline Mode", href: "/dashboard/offline", icon: Download, premium: false },
      { name: "Study Plan", href: "/dashboard/study-plan", icon: CalendarCheck, premium: false },
      { name: "Notifications", href: "/dashboard/notifications", icon: Bell, premium: false },
      { name: "Billing", href: "/dashboard/billing", icon: CreditCard, premium: false },
      { name: "Contact Us", href: "/dashboard/contact", icon: HelpCircle, premium: false },
    ],
  },
];

function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const subscribed = hasActiveSubscription(user);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const handleNavClick = useCallback(
    (item) => (e) => {
      if (item.premium && !subscribed) {
        e.preventDefault();
        router.push(billingUpgradeUrl());
      }
      if (window.matchMedia("(max-width: 1023px)").matches) onClose();
    },
    [subscribed, router, onClose]
  );

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${isOpen ? "sidebar--open" : ""}`}
        id="dash-sidebar"
        aria-label="Main navigation"
      >
        <div className="sidebar__logo">
          <Link href="/dashboard" className="sidebar__logo-link" onClick={() => onClose()}>
            <div className="sidebar__logo-icon">
              <video autoPlay muted loop playsInline className="sidebar__logo-video">
                <source src="/logo.mp4" type="video/mp4" />
              </video>
            </div>
            <span className="sidebar__logo-text">
              medprep<span className="sidebar__logo-accent">.study</span>
            </span>
          </Link>
          <button className="sidebar__close" onClick={onClose} aria-label="Close sidebar">
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar__nav">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="sidebar__section">
              <span className="sidebar__section-label">{section.label}</span>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const locked = item.premium && !subscribed;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar__link ${isActive ? "sidebar__link--active" : ""} ${locked ? "sidebar__link--locked" : ""}`}
                    onClick={handleNavClick(item)}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                    <span>{item.name}</span>
                    {locked && <Lock size={14} className="sidebar__link-lock" aria-hidden="true" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

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
