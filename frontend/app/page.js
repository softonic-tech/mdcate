"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { CONTACT_INFO, CONTACT_SUBJECTS } from "@/constants/contact";
import {
  useLandingData,
  formatStat,
  subjectMeta,
  mergeLandingSubjects,
} from "@/hooks/useLandingData";

/* ─────────────────────────────────────────────
   medprep.study — Landing Page
   Medical Entrance Test Preparation Platform
───────────────────────────────────────────── */

// ━━━ Navbar ━━
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Subjects", href: "#subjects" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Pricing", href: "#pricing" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <nav className="navbar navbar--scrolled" role="banner">
      <div className="navbar__inner">
        <Link href="/" className="navbar__logo" onClick={() => setMenuOpen(false)}>
          <div className="navbar__logo-icon navbar__logo-video">
            <video autoPlay muted loop playsInline className="navbar__logo-video-el">
              <source src="/logo.mp4" type="video/mp4" />
            </video>
          </div>
          <span className="navbar__logo-text">
            medprep<span className="navbar__logo-accent">.study</span>
          </span>
        </Link>

        <div className="navbar__actions">
          <ThemeToggle className="theme-toggle--navbar" size={18} />

        <button
          type="button"
          className={`navbar__hamburger ${menuOpen ? "navbar__hamburger--open" : ""}`}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="navbar-menu"
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
        </div>

        <div
          className={`navbar__links ${menuOpen ? "navbar__links--open" : ""}`}
          id="navbar-menu"
          aria-hidden={!menuOpen}
          onClick={(e) => e.target === e.currentTarget && setMenuOpen(false)}
        >
          <div className="navbar__links-inner" onClick={(e) => e.stopPropagation()}>
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="navbar__link"
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </a>
            ))}

            {!loading && (
              <div className="navbar__links-btns">
                {user ? (
                  <a
                    href="/dashboard"
                    className="navbar__btn navbar__btn--primary"
                    onClick={() => setMenuOpen(false)}
                  >
                    Go to Dashboard
                  </a>
                ) : (
                  <>
                    <a
                      href="/auth/login"
                      className="navbar__btn navbar__btn--ghost"
                      onClick={() => setMenuOpen(false)}
                    >
                      Log In
                    </a>
                    <a
                      href="/auth/signup"
                      className="navbar__btn navbar__btn--primary"
                      onClick={() => setMenuOpen(false)}
                    >
                      Get Started Free
                    </a>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

// ━━━ Hero Section ━━━
function Hero({ landing }) {
  const totals = landing?.totals || {};
  const nextExam = landing?.nextExam;
  const questionCount = totals.questions || 0;
  const studentCount = totals.students || 0;
  const avgPercentile = totals.avgPercentile;
  const hasStats = studentCount > 0 || questionCount > 0 || avgPercentile > 0;

  const [count, setCount] = useState(() => ({
    students: studentCount,
    questions: questionCount,
    score: avgPercentile || 0,
  }));

  useEffect(() => {
    const targets = {
      students: studentCount || 0,
      questions: questionCount || 0,
      score: avgPercentile || 0,
    };
    if (!targets.students && !targets.questions && !targets.score) return;

    // Cached / instant data — skip count-up animation to avoid flash
    if (
      count.students === targets.students &&
      count.questions === targets.questions &&
      count.score === targets.score
    ) {
      return;
    }

    const duration = 1200;
    const steps = 40;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount({
        students: Math.floor(targets.students * ease),
        questions: Math.floor(targets.questions * ease),
        score: Math.floor(targets.score * ease),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [studentCount, questionCount, avgPercentile]);

  const boards = landing?.boards?.length
    ? landing.boards.join(", ")
    : "KPK, Punjab, and Federal";

  return (
    <section className="hero">
      {/* Background Video Slot */}
      <div className="hero__video-bg">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/images/hero-poster.jpg"
          className="hero__video"
        >
          <source src="/logo.mp4" type="video/mp4" />
        </video>
        <div className="hero__video-overlay" />
      </div>

      {/* Decorative Elements */}
      <div className="hero__particles">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`hero__particle hero__particle--${i + 1}`} />
        ))}
      </div>

      <div className="hero__inner container">
        <div className="hero__content">
          <div className="hero__badge">
            <span className="hero__badge-dot" />
            {nextExam
              ? `${nextExam.title} — ${nextExam.daysRemaining} days left`
              : "MDCAT Preparation — Updated Syllabus"}
          </div>

          <h1 className="hero__title">
            Your Path to Medical College
            <br />
            Starts Here
          </h1>

          <p className="hero__subtitle">
            The most comprehensive AI-powered platform for MDCAT, NUMS, and
            medical entrance exam preparation. Practice with{" "}
            {questionCount > 0 ? `${formatStat(questionCount)}+` : "thousands of"} MCQs,
            adaptive mock tests, past papers, and personalized analytics — aligned
            with {boards} boards.
          </p>

          <div className="hero__actions">
            <a href="/auth/signup" className="btn btn--primary btn--lg">
              <span>Start Preparing Free</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M4 10h12m0 0l-4-4m4 4l-4 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <a href="#demo" className="btn btn--outline btn--lg">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 6.5l5 3.5-5 3.5V6.5z" fill="currentColor" />
              </svg>
              <span>Watch Demo</span>
            </a>
          </div>

          {/* Stats */}
          <div className="hero__stats">
            <div className="hero__stat">
              <span className="hero__stat-number">
                {hasStats ? `${count.students.toLocaleString()}+` : "—"}
              </span>
              <span className="hero__stat-label">Active Students</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="hero__stat-number">
                {hasStats ? `${count.questions.toLocaleString()}+` : "—"}
              </span>
              <span className="hero__stat-label">Practice MCQs</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="hero__stat-number">
                {hasStats && avgPercentile > 0 ? `${formatStat(count.score)}%` : "—"}
              </span>
              <span className="hero__stat-label">Avg. Test Percentile</span>
            </div>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="hero__visual">
          <div className="hero__mockup">
            <Image
              src="/images/analytics-dashboard.jpeg"
              alt="medprep.study Dashboard"
              width={600}
              height={420}
              className="hero__mockup-img"
              priority
            />
            {/* Floating Cards */}
            <div className="hero__float-card hero__float-card--score">
              <div className="float-card__icon float-card__icon--green">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 10l4 4 8-8" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <div className="float-card__label">Mock Score</div>
                <div className="float-card__value">187 / 200</div>
              </div>
            </div>
            <div className="hero__float-card hero__float-card--streak">
              <div className="float-card__icon float-card__icon--amber">
                {Icons.flame}
              </div>
              <div>
                <div className="float-card__label">Daily Streak</div>
                <div className="float-card__value">14 Days</div>
              </div>
            </div>
            <div className="hero__float-card hero__float-card--rank">
              <div className="float-card__icon float-card__icon--teal">
                {Icons.trophy}
              </div>
              <div>
                <div className="float-card__label">Your Rank</div>
                <div className="float-card__value">#24 of 12,400</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trusted By */}
      <div className="hero__trusted">
        <div className="container">
          <p className="hero__trusted-label">
            Trusted by students preparing for
          </p>
          <div className="hero__trusted-logos">
            {["MDCAT", "NUMS", "ETEA", "AKU", "SZABMU"].map((name) => (
              <div key={name} className="hero__trusted-item">
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ━━━ SVG Icons ━━━
const Icons = {
  book: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  target: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  fileText: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  ),
  bookOpen: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  cpu: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" />
      <line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" />
      <line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" />
      <line x1="20" y1="14" x2="23" y2="14" />
      <line x1="1" y1="9" x2="4" y2="9" />
      <line x1="1" y1="14" x2="4" y2="14" />
    </svg>
  ),
  video: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23,7 16,12 23,17" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  barChart: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  layers: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12,2 2,7 12,12 22,7" />
      <polyline points="2,17 12,22 22,17" />
      <polyline points="2,12 12,17 22,12" />
    </svg>
  ),
  messageCircle: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  ),
  award: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88" />
    </svg>
  ),
  lightbulb: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="18" x2="15" y2="18" />
      <line x1="10" y1="22" x2="14" y2="22" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  ),
  wifi: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  ),
  user: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  flask: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6v5l4 9H5l4-9V3z" />
      <line x1="9" y1="3" x2="15" y2="3" />
      <path d="M7 17h10" />
    </svg>
  ),
  rocket: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  ),
  dna: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 15c6.667-6 13.333 0 20-6" />
      <path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993" />
      <path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993" />
      <path d="M17 6l-2.5-2.5" />
      <path d="M14 8l-3-3" />
      <path d="M7 18l2.5 2.5" />
      <path d="M10 16l3 3" />
    </svg>
  ),
  beaker: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 3h15" />
      <path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3" />
      <path d="M6 14h12" />
    </svg>
  ),
  zap: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
    </svg>
  ),
  penTool: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  ),
  puzzle: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 1.998c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.878.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z" />
    </svg>
  ),
  flame: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  ),
  trophy: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  ),
  brain: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  ),
  mail: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  phone: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
  headphones: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  ),
  check: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 10l4 4 8-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

// ━━━ Features Grid ━━━
const features = [
  {
    icon: Icons.book,
    title: "85,000+ MCQ Bank",
    desc: "Questions categorized by subject, chapter, and difficulty. Every answer includes detailed explanations.",
    tag: "Core",
    color: "var(--teal)",
  },
  {
    icon: Icons.target,
    title: "Adaptive Mock Tests",
    desc: "Timed mocks with scoring, percentiles, and tests that dynamically adjust difficulty as you improve.",
    tag: "Smart",
    color: "var(--sky)",
  },
  {
    icon: Icons.fileText,
    title: "Past Papers & Solutions",
    desc: "All previous MDCAT papers with step-by-step interactive solutions and pattern analysis.",
    tag: "Essential",
    color: "var(--amber)",
  },
  {
    icon: Icons.bookOpen,
    title: "Books & Notes",
    desc: "KPK, Punjab, and Federal textbooks with integrated notes, formula shortcuts, and quick references.",
    tag: "Library",
    color: "var(--violet)",
  },
  // {
  //   icon: Icons.cpu,
  //   title: "AI Chapter Summaries",
  //   desc: "AI-generated summaries of long chapters for fast revision with extracted high-yield points.",
  //   tag: "AI Powered",
  //   color: "var(--teal-400)",
  // },
  {
    icon: Icons.video,
    title: "Video Summarizer",
    desc: "Upload or link any lecture video. AI generates summary, key points, flashcards, and MCQs.",
    tag: "AI Powered",
    color: "var(--rose)",
  },
  {
    icon: Icons.barChart,
    title: "Performance Analytics",
    desc: "Track accuracy by topic, time per subject, weakest areas, progress charts, and leaderboard rankings.",
    tag: "Insights",
    color: "var(--info)",
  },
  {
    icon: Icons.layers,
    title: "Smart Flashcards",
    desc: "Spaced repetition algorithm ensures you review cards at the optimal time for memory retention.",
    tag: "Smart",
    color: "var(--success)",
  },
  {
    icon: Icons.messageCircle,
    title: "Discussion Room",
    desc: "Text and voice chat with fellow students. Ask doubts, share tips, and study together in real-time.",
    tag: "Community",
    color: "var(--indigo)",
  },
  {
    icon: Icons.award,
    title: "Badges & Rewards",
    desc: "Earn points for daily logins, quiz completions, and high-score streaks. Stay motivated every day.",
    tag: "Gamified",
    color: "var(--amber-light)",
  },
  {
    icon: Icons.lightbulb,
    title: "Mnemonics & Fact Cards",
    desc: "Curated mnemonics by topic plus high-yield fact cards for last-minute revision sessions.",
    tag: "Quick Recall",
    color: "var(--coral)",
  },
  {
    icon: Icons.wifi,
    title: "Offline & Multi-Device",
    desc: "Download tests, notes, and flashcards for offline study. Syncs seamlessly across all your devices.",
    tag: "Anywhere",
    color: "var(--steel)",
  },
];

function Features({ landing }) {
  const questionCount = landing?.totals?.questions || 0;
  const testCount = landing?.totals?.tests || 0;

  const dynamicFeatures = features.map((f, i) => {
    if (i === 0 && questionCount > 0) {
      return { ...f, title: `${formatStat(questionCount)}+ MCQ Bank` };
    }
    if (i === 1 && testCount > 0) {
      return { ...f, title: `${formatStat(testCount)}+ Mock Tests` };
    }
    return f;
  });

  return (
    <section className="features" id="features">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Features</span>
          <h2 className="section-title">
            Everything You Need to Ace Your Exam
          </h2>
          <p className="section-desc">
            From AI-powered learning to comprehensive question banks — we have
            built every tool a medical aspirant needs under one roof.
          </p>
        </div>

        <div className="features__grid">
          {dynamicFeatures.map((f, i) => (
            <div
              key={i}
              className="feature-card"
              style={{ "--card-accent": f.color, animationDelay: `${i * 60}ms` }}
            >
              <div className="feature-card__head">
                <span className="feature-card__icon">{f.icon}</span>
                <span className="feature-card__tag">{f.tag}</span>
              </div>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__desc">{f.desc}</p>
              <div className="feature-card__glow" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ━━━ How It Works ━━━
const steps = [
  {
    num: "01",
    title: "Create Your Profile",
    desc: "Sign up with your assigned credentials, upload your photo, and set your exam target date.",
    icon: Icons.user,
  },
  {
    num: "02",
    title: "Take a Diagnostic Test",
    desc: "A quick adaptive test identifies your strengths, weaknesses, and creates a personalized study plan.",
    icon: Icons.flask,
  },
  {
    num: "03",
    title: "Study Smart, Not Hard",
    desc: "Use AI summaries, flashcards, books, and targeted practice to focus on what matters most.",
    icon: Icons.target,
  },
  {
    num: "04",
    title: "Track & Improve",
    desc: "Monitor your progress through analytics, climb the leaderboard, and watch your scores rise.",
    icon: Icons.rocket,
  },
];

function HowItWorks() {
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">How It Works</span>
          <h2 className="section-title">
            From Sign Up to Top Scorer
          </h2>
          <p className="section-desc">
            Four simple steps to transform your medical entrance exam preparation.
          </p>
        </div>

        <div className="steps">
          <div className="steps__line" />
          {steps.map((s, i) => (
            <div key={i} className="step" style={{ animationDelay: `${i * 150}ms` }}>
              <div className="step__number">{s.num}</div>
              <div className="step__icon">{s.icon}</div>
              <h3 className="step__title">{s.title}</h3>
              <p className="step__desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ━━━ Subjects Showcase ━━━
const SUBJECT_ICONS = {
  biology: Icons.dna,
  chemistry: Icons.beaker,
  physics: Icons.zap,
  english: Icons.penTool,
  logic: Icons.puzzle,
  analytical: Icons.barChart,
  default: Icons.book,
};

function Subjects({ landing }) {
  const subjects = mergeLandingSubjects(landing?.subjects || []);
  const boards = landing?.boards?.length
    ? landing.boards.join(", ")
    : "KPK, Punjab, and Federal";

  return (
    <section className="subjects" id="subjects">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Subjects</span>
          <h2 className="section-title">
            Complete Coverage, Every Subject
          </h2>
          <p className="section-desc">
            Aligned with {boards} boards. Every chapter, every topic, every
            question type covered.
          </p>
        </div>

        <div className="subjects__grid">
          {subjects.map((s, i) => {
            const meta = subjectMeta(s.name);
            const icon = SUBJECT_ICONS[meta.key] || SUBJECT_ICONS.default;
            return (
            <div
              key={s._id || s.name}
              className="subject-card"
              style={{ "--subj-color": meta.color, animationDelay: `${i * 100}ms` }}
            >
              <div className="subject-card__icon">{icon}</div>
              <h3 className="subject-card__name">{s.name}</h3>
              {s.board && <p className="subject-card__board">{s.board} board</p>}
              <div className="subject-card__stats">
                <div className="subject-card__stat">
                  <span className="subject-card__stat-val">{s.chapterCount}</span>
                  <span className="subject-card__stat-label">Chapters</span>
                </div>
                <div className="subject-card__stat">
                  <span className="subject-card__stat-val">{formatStat(s.questionCount)}</span>
                  <span className="subject-card__stat-label">MCQs</span>
                </div>
              </div>
              <div className="subject-card__bar">
                <div
                  className="subject-card__bar-fill"
                  style={{
                    width: `${Math.min(100, Math.max(8, (s.questionCount / Math.max(...subjects.map((x) => x.questionCount || 1), 1)) * 100))}%`,
                  }}
                />
              </div>
              <Link href="/auth/signup" className="subject-card__link">
                Start practicing →
              </Link>
            </div>
          );
          })}
        </div>
      </div>
    </section>
  );
}

// ━━━ Dashboard Preview ━━━
function DashboardPreview({ landing }) {
  const studentCount = landing?.totals?.students || 0;

  return (
    <section className="dashboard-preview">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Analytics</span>
          <h2 className="section-title">
            Know Exactly Where You Stand
          </h2>
          <p className="section-desc">
            Real-time performance analytics, leaderboards, and AI-powered
            insights to keep you on track.
          </p>
        </div>

        <div className="dashboard-preview__wrapper">
          <div className="dashboard-preview__frame">
            <div className="dashboard-preview__topbar">
              <div className="topbar-dots">
                <span /><span /><span />
              </div>
              <span className="topbar-url">app.medprep.study/dashboard</span>
            </div>
            <Image
              src="/images/analytics-dashboard.jpeg"
              alt="Performance Analytics Dashboard"
              width={1100}
              height={650}
              className="dashboard-preview__img"
            />
          </div>

          {/* Feature Callouts */}
          <div className="dashboard-preview__callouts">
            <div className="callout callout--left">
              <div className="callout__dot" />
              <div className="callout__content">
                <strong>Leaderboard</strong>
                <span>
                  {studentCount > 0
                    ? `${formatStat(studentCount)}+ students ranked in real-time`
                    : "Top candidates ranked in real-time"}
                </span>
              </div>
            </div>
            <div className="callout callout--right">
              <div className="callout__dot" />
              <div className="callout__content">
                <strong>Weak Topics</strong>
                <span>AI identifies areas needing more practice</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ━━━ Case Studies / Demo Videos ━━━
const caseStudyVideos = [
  { id: 1, src: "/casestudies1.mp4", title: "Case Study 1" },
  { id: 2, src: "/casestudies2.mp4", title: "Case Study 2" },
  { id: 3, src: "/casestudies3.mp4", title: "Case Study 3" },
];

function CaseStudyCard({ src, title }) {
  const [poster, setPoster] = useState(null);
  const loaderRef = useRef(null);

  useEffect(() => {
    const video = loaderRef.current;
    if (!video) return;

    const captureFrame = () => {
      try {
        video.currentTime = 0;
      } catch (e) {
        setPoster(null);
        return;
      }
    };

    const onSeeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          setPoster(canvas.toDataURL("image/jpeg", 0.85));
        }
      } catch (e) {
        setPoster(null);
      }
    };

    video.addEventListener("loadeddata", captureFrame);
    video.addEventListener("seeked", onSeeked);
    if (video.readyState >= 2) captureFrame();

    return () => {
      video.removeEventListener("loadeddata", captureFrame);
      video.removeEventListener("seeked", onSeeked);
    };
  }, [src]);

  return (
    <div className="case-studies__card">
      <div className="case-studies__video-wrap">
        <video
          ref={loaderRef}
          src={src}
          preload="metadata"
          muted
          playsInline
          className="case-studies__loader-video"
          aria-hidden
        />
        <video
          src={src}
          controls
          playsInline
          preload="metadata"
          className="case-studies__video"
          poster={poster ?? undefined}
        >
          Your browser does not support the video tag.
        </video>
      </div>
      <h3 className="case-studies__title">{title}</h3>
    </div>
  );
}

function CaseStudies() {
  return (
    <section className="case-studies" id="demo">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">See It In Action</span>
          <h2 className="section-title">
            Case Studies &amp; Demos
          </h2>
          <p className="section-desc">
            Watch how students use medprep.study to ace their preparation.
          </p>
        </div>
        <div className="case-studies__grid">
          {caseStudyVideos.map((v) => (
            <CaseStudyCard key={v.id} src={v.src} title={v.title} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ━━━ Testimonials ━━━
function TestimonialAvatar({ name, avatar }) {
  if (avatar) {
    return (
      <Image
        src={avatar}
        alt={name}
        width={48}
        height={48}
        className="testimonial-card__avatar"
      />
    );
  }
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="testimonial-card__avatar testimonial-card__avatar--initials" aria-hidden>
      {initials}
    </div>
  );
}

function Testimonials({ landing }) {
  const testimonials = landing?.featuredStudents?.length
    ? landing.featuredStudents.map((s) => ({
        name: s.name,
        score: s.scoreLabel,
        text: s.quote,
        avatar: s.avatar,
      }))
    : [];

  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!testimonials.length) return undefined;
    const t = setInterval(() => setActive((p) => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, [testimonials.length]);

  if (!testimonials.length) {
    return (
      <section className="testimonials" id="testimonials">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Success Stories</span>
            <h2 className="section-title">
              Join Students on medprep.study
            </h2>
            <p className="section-desc">
              Be among the first to climb the leaderboard and share your success story.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="testimonials" id="testimonials">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Success Stories</span>
          <h2 className="section-title">
            Hear From Our Top Scorers
          </h2>
        </div>

        <div className="testimonials__carousel">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`testimonial-card ${i === active ? "testimonial-card--active" : ""}`}
            >
              <div className="testimonial-card__stars">★★★★★</div>
              <blockquote className="testimonial-card__text">
                &ldquo;{t.text}&rdquo;
              </blockquote>
              <div className="testimonial-card__author">
                <TestimonialAvatar name={t.name} avatar={t.avatar} />
                <div>
                  <div className="testimonial-card__name">{t.name}</div>
                  <div className="testimonial-card__score">{t.score}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="testimonials__dots">
          {testimonials.map((_, i) => (
            <button
              key={i}
              className={`testimonials__dot ${i === active ? "testimonials__dot--active" : ""}`}
              onClick={() => setActive(i)}
              aria-label={`Show testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ━━━ Daily Challenges / Gamification ━━━
function Challenges({ landing }) {
  const badgeList = landing?.badges?.length
    ? landing.badges.map((b) => ({ icon: Icons.award, label: b.name }))
    : [
        { icon: Icons.flame, label: "7-Day Streak" },
        { icon: Icons.trophy, label: "Quiz Master" },
        { icon: Icons.zap, label: "Speed Demon" },
        { icon: Icons.brain, label: "Brain Power" },
        { icon: Icons.target, label: "Perfect Score" },
        { icon: Icons.book, label: "Bookworm" },
      ];

  const challengeCount = landing?.totals?.activeChallenges;

  return (
    <section className="challenges" id="challenges">
      <div className="container">
        <div className="challenges__inner">
          <div className="challenges__content">
            <span className="section-tag">Daily Challenges</span>
            <h2 className="section-title" style={{ textAlign: "left" }}>
              Stay Sharp With Daily Battles
            </h2>
            <p className="section-desc" style={{ textAlign: "left", maxWidth: "520px" }}>
              {challengeCount != null && challengeCount > 0
                ? `${challengeCount} active challenge${challengeCount === 1 ? "" : "s"} right now. `
                : ""}
              New question sets, flashcard decks, and mini tests released regularly.
              Compete with peers, earn badges, and build unstoppable momentum.
            </p>

            <div className="challenges__badges">
              {badgeList.map((b, i) => (
                <div key={i} className="badge-chip">
                  <span className="badge-chip__icon">{b.icon}</span>
                  <span className="badge-chip__label">{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="challenges__visual">
            <Image
              src="/images/a.png"
              alt="Daily Challenges Preview"
              width={500}
              height={400}
              className="challenges__img"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ━━━ Pricing ━━━
function Pricing({ plans = [], loadingPlans = false }) {
  const { user } = useAuth();

  const getCtaHref = (plan) => {
    if (plan.price <= 0) return "/auth/signup";
    if (user) return `/dashboard/billing?plan=${plan.slug}`;
    return `/auth/signup?plan=${plan.slug}`;
  };

  const getCtaLabel = (plan) => {
    if (plan.price <= 0) return "Start Free";
    if (plan.slug === "ultimate") return "Go Ultimate";
    return "Get Pro Access";
  };

  return (
    <section className="pricing" id="pricing">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Pricing</span>
          <h2 className="section-title">
            Invest in Your Future
          </h2>
          <p className="section-desc">
            Affordable plans designed for Pakistani students. Subscribe via manual JazzCash, Easypaisa, or
            bank transfer.
          </p>
        </div>

        <div className="pricing__grid">
          {loadingPlans && plans.length === 0
            ? Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="pricing-card pricing-card--skeleton" aria-hidden="true">
                  <div className="pricing-skeleton__line pricing-skeleton__line--title" />
                  <div className="pricing-skeleton__line" />
                  <div className="pricing-skeleton__line pricing-skeleton__line--price" />
                  <div className="pricing-skeleton__line" />
                  <div className="pricing-skeleton__line pricing-skeleton__line--short" />
                </div>
              ))
            : (plans.length ? plans : []).map((p) => (
            <div
              key={p._id || p.slug}
              className={`pricing-card ${p.isPopular ? "pricing-card--popular" : ""}`}
            >
              {p.isPopular && (
                <div className="pricing-card__badge">Most Popular</div>
              )}
              <h3 className="pricing-card__name">{p.name}</h3>
              <p className="pricing-card__desc">{p.description}</p>
              <div className="pricing-card__price">
                <span className="pricing-card__currency">PKR</span>
                <span className="pricing-card__amount">
                  {p.price === 0 ? "0" : p.price.toLocaleString()}
                </span>
                <span className="pricing-card__period">
                  {p.periodLabel || (p.price === 0 ? "Forever" : "")}
                </span>
              </div>
              <ul className="pricing-card__features">
                {(p.features || []).map((f, j) => (
                  <li key={j}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3 8.5l3.5 3.5 6.5-7"
                        stroke="var(--teal)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={getCtaHref(p)}
                className={`btn btn--full ${p.isPopular ? "btn--primary" : "btn--outline"}`}
              >
                {getCtaLabel(p)}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ━━━ CTA / Countdown ━━━
function CtaSection({ landing }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const nextExam = landing?.nextExam;
  const studentCount = landing?.totals?.students || 0;

  useEffect(() => {
    if (!nextExam?.examDate) return undefined;
    const examDate = new Date(nextExam.examDate);
    const tick = () => {
      const diff = examDate.getTime() - Date.now();
      if (diff <= 0) return;
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [nextExam?.examDate]);

  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-section__inner">
          <h2 className="cta-section__title">
            {nextExam ? (
              <>
                {nextExam.title} is Coming.
                <br />
                Are You Ready?
              </>
            ) : (
              <>
                Your Exam is Coming.
                <br />
                Are You Ready?
              </>
            )}
          </h2>

          {nextExam?.examDate && (
          <div className="cta-section__countdown">
            {[
              { val: timeLeft.days, label: "Days" },
              { val: timeLeft.hours, label: "Hours" },
              { val: timeLeft.mins, label: "Minutes" },
              { val: timeLeft.secs, label: "Seconds" },
            ].map((t, i) => (
              <div key={i} className="countdown-block">
                <span className="countdown-block__val">
                  {String(t.val).padStart(2, "0")}
                </span>
                <span className="countdown-block__label">{t.label}</span>
              </div>
            ))}
          </div>
          )}

          <p className="cta-section__text">
            Every day counts. Join{" "}
            {studentCount > 0 ? `${formatStat(studentCount)}+` : ""} students already
            preparing with medprep.study and give yourself the best chance at your
            dream medical college.
          </p>

          <a href="/auth/signup" className="btn btn--primary btn--lg">
            Start Your Journey Today
          </a>
        </div>
      </div>
    </section>
  );
}

// ━━━ Contact ━━━
function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="container">
        <div className="contact__inner">
          <div className="contact__info">
            <span className="section-tag">{CONTACT_INFO.eyebrow}</span>
            <h2 className="section-title">
              We&apos;re Here to Help
            </h2>
            <p className="section-desc">
              {CONTACT_INFO.description}
            </p>
            <div className="contact__methods">
              {CONTACT_INFO.methods.map((method) => (
                <div key={method.id} className="contact__method">
                  <div className="contact__method-icon">
                    {method.id === "email" && Icons.mail}
                    {method.id === "whatsapp" && Icons.phone}
                    {method.id === "live-chat" && Icons.headphones}
                  </div>
                  <div>
                    <div className="contact__method-label">{method.label}</div>
                    {method.href ? (
                      <a className="contact__method-value" href={method.href}>
                        {method.value}
                      </a>
                    ) : (
                      <div className="contact__method-value">{method.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form className="contact__form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="Enter your full name" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="your@email.com" />
            </div>
            <div className="form-group">
              <label>Subject</label>
              <select>
                {CONTACT_SUBJECTS.map((subject) => (
                  <option key={subject}>{subject}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea rows={4} placeholder="How can we help you?" />
            </div>
            <button type="submit" className="btn btn--primary btn--full">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

// ━━━ Footer ━━━
const FOOTER_LINKS = {
  platform: [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Subjects", href: "#subjects" },
    { label: "Pricing", href: "#pricing" },
    { label: "Get Started", href: "/auth/signup", internal: true },
  ],
  resources: [
    { label: "MCQ Bank", href: "/dashboard/mcq-bank", internal: true },
    { label: "Mock Tests", href: "/dashboard/tests", internal: true },
    { label: "Past Papers", href: "/dashboard/past-papers", internal: true },
    { label: "Video Summarizer", href: "/dashboard/video-summarizer", internal: true },
    { label: "Daily Challenges", href: "#challenges" },
  ],
  company: [
    { label: "Contact", href: "#contact" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Demo Videos", href: "#demo" },
    { label: "Sign In", href: "/auth/login", internal: true },
    { label: "Email Support", href: CONTACT_INFO.methods[0].href, external: true },
  ],
};

function FooterLink({ link }) {
  if (link.internal) {
    return <Link href={link.href}>{link.label}</Link>;
  }

  return (
    <a
      href={link.href}
      {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {link.label}
    </a>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Link href="/" className="navbar__logo">
              <div className="navbar__logo-icon navbar__logo-video">
                <video autoPlay muted loop playsInline className="navbar__logo-video-el">
                  <source src="/logo.mp4" type="video/mp4" />
                </video>
              </div>
              <span className="navbar__logo-text">
                medprep<span className="navbar__logo-accent">.study</span>
              </span>
            </Link>
            <p className="footer__tagline">
              Pakistan&apos;s most comprehensive AI-powered medical entrance
              exam preparation platform.
            </p>
            <div className="footer__social">
              <a
                href={CONTACT_INFO.methods[0].href}
                className="footer__social-link"
                aria-label="Email"
                target="_blank"
                rel="noopener noreferrer"
              >
                @
              </a>
              <a
                href={CONTACT_INFO.methods[1].href}
                className="footer__social-link"
                aria-label="WhatsApp"
                target="_blank"
                rel="noopener noreferrer"
              >
                W
              </a>
            </div>
          </div>

          <div className="footer__col">
            <h4>Platform</h4>
            {FOOTER_LINKS.platform.map((link) => (
              <FooterLink key={link.label} link={link} />
            ))}
          </div>

          <div className="footer__col">
            <h4>Resources</h4>
            {FOOTER_LINKS.resources.map((link) => (
              <FooterLink key={link.label} link={link} />
            ))}
          </div>

          <div className="footer__col">
            <h4>Company</h4>
            {FOOTER_LINKS.company.map((link) => (
              <FooterLink key={link.label} link={link} />
            ))}
          </div>
        </div>

        <div className="footer__bottom">
          <p>© 2026 medprep.study. All rights reserved.</p>
          <p>
            Made with 💚 for Pakistan&apos;s future doctors.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ━━━ Main Page ━━━
export default function LandingPage() {
  const { data: landing, loading } = useLandingData();

  return (
    <>
      <Navbar />
      <Hero landing={landing} />
      <Features landing={landing} />
      <HowItWorks />
      <Subjects landing={landing} />
      <DashboardPreview landing={landing} />
      <CaseStudies />
      <Testimonials landing={landing} />
      <Challenges landing={landing} />
      <Pricing
        plans={landing?.pricingPlans || []}
        loadingPlans={loading && !(landing?.pricingPlans?.length)}
      />
      <CtaSection landing={landing} />
      <Contact />
      <Footer />

      
    </>
  );
}
