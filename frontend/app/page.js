"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
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
            Affordable plans designed for Pakistani students. Start with a{" "}
            <strong>7-day free trial</strong>, upgrade when ready via JazzCash or Easypaisa.
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

      <style jsx global>{`
        /* ════════════════════════════════════════════
           COMPONENT STYLES
        ════════════════════════════════════════════ */

        /* ── Navbar ── */
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          z-index: 1000;
          padding: 14px 0;
          transition: background var(--duration-normal) var(--ease-out), padding var(--duration-normal) var(--ease-out);
        }
        .navbar--scrolled {
          background: rgba(11, 17, 32, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(45, 212, 191, 0.08);
          padding: 10px 0;
        }
        .navbar__inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          min-height: 52px;
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 20px;
          box-sizing: border-box;
        }
        .navbar__logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
          min-width: 0;
        }
        .navbar__logo-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
        }
        .navbar__logo-video .navbar__logo-video-el {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .navbar__logo-text {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.25rem;
          color: var(--white);
          letter-spacing: -0.02em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .navbar__logo-accent {
          background: linear-gradient(135deg, var(--teal-400) 0%, var(--teal-300) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .navbar__links {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .navbar__links-inner {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .navbar__links-btns {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .navbar__link {
          font-size: 0.88rem;
          font-weight: 500;
          color: var(--mist);
          padding: 8px 14px;
          border-radius: var(--radius-full);
          transition: all var(--duration-fast) var(--ease-out);
        }
        .navbar__link:hover {
          color: var(--white);
          background: rgba(255, 255, 255, 0.06);
        }
        .navbar__btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 0.9rem;
          font-weight: 600;
          padding: 9px 20px;
          border-radius: var(--radius-full);
          border: 1px solid transparent;
          transition:
            background-color var(--duration-fast) var(--ease-out),
            border-color var(--duration-fast) var(--ease-out),
            color var(--duration-fast) var(--ease-out),
            box-shadow var(--duration-fast) var(--ease-out),
            transform var(--duration-fast) var(--ease-out);
        }
        .navbar__btn--ghost {
          color: var(--cloud);
          background: rgba(15, 23, 42, 0.4);
          border-color: rgba(148, 163, 184, 0.4);
        }
        .navbar__btn--ghost:hover {
          color: var(--white);
          background: rgba(15, 23, 42, 0.85);
          border-color: rgba(148, 163, 184, 0.8);
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.6);
          transform: translateY(-1px);
        }
        .navbar__btn--primary {
          background: linear-gradient(135deg, var(--teal) 0%, var(--teal-400) 100%);
          color: var(--midnight);
          box-shadow: 0 18px 45px rgba(45, 212, 191, 0.4);
        }
        .navbar__btn--primary:hover {
          background: linear-gradient(135deg, var(--teal-400) 0%, var(--teal-300) 100%);
          color: var(--midnight);
          box-shadow: 0 22px 55px rgba(45, 212, 191, 0.55);
          transform: translateY(-1px);
        }
        .navbar__hamburger {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 6px;
          width: 44px;
          height: 44px;
          min-width: 44px;
          min-height: 44px;
          padding: 0;
          background: none;
          border: none;
          cursor: pointer;
          border-radius: var(--radius-sm);
          transition: background var(--duration-fast) var(--ease-out);
        }
        .navbar__hamburger:hover,
        .navbar__hamburger:focus-visible {
          background: rgba(255, 255, 255, 0.08);
        }
        .navbar__hamburger:focus-visible {
          outline: 2px solid var(--teal);
          outline-offset: 2px;
        }
        .hamburger-line {
          display: block;
          width: 22px;
          height: 2px;
          background: var(--white);
          border-radius: 2px;
          transition: transform 0.25s var(--ease-out), opacity 0.2s;
        }
        .navbar__hamburger--open .hamburger-line:nth-child(1) {
          transform: translateY(8px) rotate(45deg);
        }
        .navbar__hamburger--open .hamburger-line:nth-child(2) {
          opacity: 0;
        }
        .navbar__hamburger--open .hamburger-line:nth-child(3) {
          transform: translateY(-8px) rotate(-45deg);
        }

        @media (max-width: 900px) {
          .navbar { padding: 10px 0; }
          .navbar__inner { padding: 0 16px; }
          .navbar__logo { position: relative; z-index: 1001; }
          .navbar__logo-text { font-size: 1.05rem; max-width: 140px; }
          .navbar__logo-icon { width: 36px; height: 36px; }
          .navbar__hamburger {
            display: flex;
            position: relative;
            z-index: 1001;
          }
          .navbar__links {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100vw;
            height: 100vh;
            z-index: 1000;
            background:
              radial-gradient(circle at top left, rgba(45, 212, 191, 0.12), transparent 55%),
              radial-gradient(circle at bottom right, rgba(56, 189, 248, 0.16), transparent 55%),
              rgba(11, 17, 32, 0.96);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 80px 20px 28px;
            box-sizing: border-box;
            overflow-y: auto;
            opacity: 0;
            transform: translateY(-10px);
            pointer-events: none;
            transition:
              opacity 220ms var(--ease-out),
              transform 220ms var(--ease-out);
          }
          .navbar__links--open {
            opacity: 1;
            transform: translateY(0);
            pointer-events: auto;
          }
          .navbar__links-inner {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            width: 100%;
            max-width: 320px;
          }
          .navbar__link {
            font-size: 1.15rem;
            padding: 14px 20px;
            width: 100%;
            text-align: center;
            border-radius: var(--radius-md);
            background: rgba(15, 23, 42, 0.7);
            border: 1px solid rgba(148, 163, 184, 0.25);
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.5);
            transform: translateY(10px);
            opacity: 0;
            transition:
              opacity 200ms var(--ease-out),
              transform 220ms var(--ease-out),
              background 180ms var(--ease-out),
              border-color 180ms var(--ease-out),
              box-shadow 180ms var(--ease-out);
          }
          .navbar__links--open .navbar__link {
            opacity: 1;
            transform: translateY(0);
          }
          .navbar__links--open .navbar__link:nth-child(1) { transition-delay: 40ms; }
          .navbar__links--open .navbar__link:nth-child(2) { transition-delay: 70ms; }
          .navbar__links--open .navbar__link:nth-child(3) { transition-delay: 100ms; }
          .navbar__links--open .navbar__link:nth-child(4) { transition-delay: 130ms; }
          .navbar__links--open .navbar__link:nth-child(5) { transition-delay: 160ms; }
          .navbar__links--open .navbar__link:nth-child(6) { transition-delay: 190ms; }
          .navbar__link:hover {
            background: rgba(15, 23, 42, 0.9);
            border-color: rgba(45, 212, 191, 0.6);
            box-shadow: 0 24px 60px rgba(45, 212, 191, 0.28);
          }
          .navbar__links-btns {
            flex-direction: column;
            width: 100%;
            margin-top: 26px;
            gap: 10px;
          }
          .navbar__links-btns .navbar__btn {
            width: 100%;
            justify-content: center;
            padding: 14px 24px;
            font-size: 1rem;
          }
        }

        @media (max-width: 480px) {
          .navbar__inner { padding: 0 12px; }
          .navbar__logo-text { font-size: 0.95rem; max-width: 120px; }
          .navbar__logo-icon { width: 32px; height: 32px; }
          .navbar__links { padding: 64px 16px 20px; }
          .navbar__link { font-size: 1.1rem; padding: 12px 16px; }
        }

        /* ── Buttons ── */
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 0.95rem;
          padding: 12px 28px;
          border-radius: var(--radius-full);
          transition: all var(--duration-fast) var(--ease-out);
          text-decoration: none;
          cursor: pointer;
          border: none;
        }
        .btn--primary {
          background: var(--teal);
          color: var(--white);
        }
        .btn--primary:hover {
          background: var(--teal-400);
          color: var(--midnight);
          box-shadow: var(--shadow-teal);
          transform: translateY(-2px);
        }
        .btn--outline {
          background: transparent;
          color: var(--cloud);
          border: 1.5px solid var(--steel);
        }
        .btn--outline:hover {
          border-color: var(--teal);
          color: var(--teal-300);
          background: rgba(14, 165, 160, 0.05);
        }
        .btn--lg {
          padding: 16px 36px;
          font-size: 1.05rem;
        }
        .btn--full {
          width: 100%;
          justify-content: center;
        }

        /* ── Section Headers ── */
        .section-tag {
          display: inline-block;
          font-family: var(--font-body);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--teal-400);
          margin-bottom: 16px;
          padding: 8px 18px;
          background: rgba(45, 212, 191, 0.08);
          border: 1px solid rgba(45, 212, 191, 0.15);
          border-radius: var(--radius-full);
        }
        .section-header {
          text-align: center;
          margin-bottom: var(--space-4xl);
        }
        .section-title {
          font-family: var(--font-display);
          font-size: clamp(2rem, 4.5vw, 3.2rem);
          font-weight: 800;
          color: var(--white);
          margin-bottom: 20px;
          letter-spacing: -0.03em;
          line-height: 1.15;
          word-spacing: normal;
        }
        .section-desc {
          font-family: var(--font-body);
          font-size: 1.1rem;
          font-weight: 400;
          color: var(--mist);
          max-width: 620px;
          margin: 0 auto;
          line-height: 1.75;
        }

        /* ════════════════════════════════════════
           HERO SECTION
        ════════════════════════════════════════ */
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 120px 0 40px;
          overflow: hidden;
        }
        .hero__video-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .hero__video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .hero__video-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, var(--midnight) 0%, rgba(11,17,32,0.7) 40%, rgba(11,17,32,0.85) 70%, var(--midnight) 100%),
            linear-gradient(90deg, var(--midnight) 0%, transparent 50%);
        }
        .hero__particles {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
        }
        .hero__particle {
          position: absolute;
          border-radius: 50%;
          opacity: 0.15;
          animation: floatParticle 12s infinite ease-in-out;
        }
        .hero__particle--1 { width: 300px; height: 300px; background: var(--teal); top: 10%; right: -5%; animation-delay: 0s; }
        .hero__particle--2 { width: 200px; height: 200px; background: var(--sky); bottom: 20%; left: -3%; animation-delay: -3s; }
        .hero__particle--3 { width: 150px; height: 150px; background: var(--amber); top: 50%; left: 30%; animation-delay: -6s; }
        .hero__particle--4 { width: 100px; height: 100px; background: var(--violet); top: 20%; left: 50%; animation-delay: -9s; }
        .hero__particle--5 { width: 180px; height: 180px; background: var(--teal-400); bottom: 10%; right: 20%; animation-delay: -4s; }
        .hero__particle--6 { width: 120px; height: 120px; background: var(--rose); top: 60%; right: 40%; animation-delay: -7s; }
        @keyframes floatParticle {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .hero__inner {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }
        .hero__badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--teal-300);
          background: rgba(45, 212, 191, 0.08);
          border: 1px solid rgba(45, 212, 191, 0.2);
          border-radius: var(--radius-full);
          padding: 8px 18px;
          margin-bottom: 24px;
          animation: fadeInUp 0.8s var(--ease-out) both;
        }
        .hero__badge-dot {
          width: 6px;
          height: 6px;
          background: var(--teal-400);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .hero__title {
          font-family: var(--font-display);
          font-size: clamp(2.5rem, 5.5vw, 4.2rem);
          font-weight: 800;
          line-height: 1.08;
          letter-spacing: -0.03em;
          margin-bottom: 28px;
          animation: fadeInUp 0.8s 0.1s var(--ease-out) both;
        }
        .hero__subtitle {
          font-family: var(--font-body);
          font-size: 1.15rem;
          font-weight: 400;
          color: var(--mist);
          line-height: 1.75;
          max-width: 540px;
          margin-bottom: 36px;
          animation: fadeInUp 0.8s 0.2s var(--ease-out) both;
        }
        .hero__actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 48px;
          animation: fadeInUp 0.8s 0.3s var(--ease-out) both;
        }
        .hero__stats {
          display: flex;
          align-items: center;
          gap: 32px;
          animation: fadeInUp 0.8s 0.4s var(--ease-out) both;
        }
        .hero__stat-number {
          font-family: var(--font-display);
          font-size: 1.7rem;
          font-weight: 800;
          color: var(--white);
          display: block;
          letter-spacing: -0.02em;
          min-width: 4.5ch;
          font-variant-numeric: tabular-nums;
        }
        .hero__stat-label {
          font-family: var(--font-body);
          font-size: 0.8rem;
          color: var(--graphite);
          font-weight: 500;
          letter-spacing: 0.01em;
        }
        .hero__stat-divider {
          width: 1px;
          height: 40px;
          background: var(--steel);
        }

        /* Hero Visual / Mockup */
        .hero__visual {
          position: relative;
          animation: fadeInUp 1s 0.3s var(--ease-out) both;
        }
        .hero__mockup {
          position: relative;
        }
        .hero__mockup-img {
          width: 100%;
          height: auto;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .hero__float-card {
          position: absolute;
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(16, 29, 58, 0.9);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-md);
          padding: 12px 16px;
          box-shadow: var(--shadow-lg);
          animation: floatCard 4s infinite ease-in-out;
        }
        .hero__float-card--score { top: 15%; left: -40px; animation-delay: 0s; }
        .hero__float-card--streak { bottom: 25%; right: -30px; animation-delay: -1.5s; }
        .hero__float-card--rank { bottom: -10px; left: 20%; animation-delay: -3s; }
        @keyframes floatCard {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .float-card__icon {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
        }
        .float-card__icon svg {
          width: 20px;
          height: 20px;
        }
        .float-card__icon--green { background: rgba(16, 185, 129, 0.15); color: var(--success); }
        .float-card__icon--amber { background: rgba(245, 158, 11, 0.15); color: var(--amber); }
        .float-card__icon--teal { background: rgba(14, 165, 160, 0.15); color: var(--teal-400); }
        .float-card__label {
          font-size: 0.72rem;
          color: var(--graphite);
          font-weight: 500;
        }
        .float-card__value {
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--white);
        }

        /* Trusted By */
        .hero__trusted {
          position: relative;
          z-index: 2;
          margin-top: 60px;
          padding-top: 40px;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
        }
        .hero__trusted-label {
          text-align: center;
          font-size: 0.82rem;
          color: var(--graphite);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 20px;
        }
        .hero__trusted-logos {
          display: flex;
          justify-content: center;
          gap: 40px;
          flex-wrap: wrap;
        }
        .hero__trusted-item {
          font-family: var(--font-body);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--steel);
          letter-spacing: 0.06em;
          opacity: 0.6;
          transition: opacity var(--duration-fast);
        }
        .hero__trusted-item:hover { opacity: 1; }

        @media (max-width: 900px) {
          .hero__inner { grid-template-columns: 1fr; text-align: center; }
          .hero__subtitle { margin-left: auto; margin-right: auto; }
          .hero__actions { justify-content: center; }
          .hero__stats { justify-content: center; }
          .hero__visual { max-width: 500px; margin: 0 auto; }
          .hero__float-card--score { left: 0; }
          .hero__float-card--streak { right: 0; }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ════════════════════════════════════════
           FEATURES
        ════════════════════════════════════════ */
        .features {
          padding: var(--space-5xl) 0;
          background: var(--deep-navy);
          position: relative;
        }
        .features::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(14,165,160,0.06) 0%, transparent 70%);
          pointer-events: none;
        }
        .features__grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        .feature-card {
          position: relative;
          background: var(--navy);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: var(--radius-lg);
          padding: 28px;
          overflow: hidden;
          transition: all var(--duration-normal) var(--ease-out);
          animation: fadeInUp 0.6s var(--ease-out) both;
        }
        .feature-card:hover {
          border-color: var(--card-accent);
          transform: translateY(-4px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .feature-card__glow {
          position: absolute;
          bottom: -60px;
          right: -60px;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: var(--card-accent);
          opacity: 0;
          filter: blur(50px);
          transition: opacity var(--duration-normal);
        }
        .feature-card:hover .feature-card__glow {
          opacity: 0.12;
        }
        .feature-card__head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .feature-card__icon {
          font-size: 1.8rem;
          color: var(--card-accent);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .feature-card__icon svg {
          width: 28px;
          height: 28px;
        }
        .feature-card__tag {
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--card-accent);
          background: rgba(255, 255, 255, 0.03);
          padding: 4px 10px;
          border-radius: var(--radius-full);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .feature-card__title {
          font-family: var(--font-display);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--white);
          margin-bottom: 10px;
          letter-spacing: -0.01em;
        }
        .feature-card__desc {
          font-family: var(--font-body);
          font-size: 0.9rem;
          color: var(--mist);
          line-height: 1.65;
        }

        /* ════════════════════════════════════════
           HOW IT WORKS
        ════════════════════════════════════════ */
        .how-it-works {
          padding: var(--space-5xl) 0;
          background: var(--midnight);
        }
        .steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
          position: relative;
        }
        .steps__line {
          position: absolute;
          top: 60px;
          left: 12.5%;
          right: 12.5%;
          height: 2px;
          background: linear-gradient(90deg, var(--steel), var(--teal), var(--steel));
          opacity: 0.3;
        }
        .step {
          text-align: center;
          position: relative;
          animation: fadeInUp 0.6s var(--ease-out) both;
        }
        .step__number {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--teal-400);
          margin-bottom: 12px;
        }
        .step__icon {
          width: 72px;
          height: 72px;
          margin: 0 auto 20px;
          background: var(--navy);
          border: 2px solid var(--steel);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          position: relative;
          z-index: 2;
          transition: all var(--duration-normal) var(--ease-out);
          color: var(--teal-400);
        }
        .step__icon svg {
          width: 28px;
          height: 28px;
        }
        .step:hover .step__icon {
          border-color: var(--teal);
          box-shadow: var(--shadow-teal);
          transform: scale(1.08);
        }
        .step__title {
          font-family: var(--font-display);
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--white);
          margin-bottom: 10px;
          letter-spacing: -0.01em;
        }
        .step__desc {
          font-family: var(--font-body);
          font-size: 0.88rem;
          color: var(--mist);
          line-height: 1.65;
          max-width: 240px;
          margin: 0 auto;
        }
        @media (max-width: 768px) {
          .steps { grid-template-columns: 1fr 1fr; }
          .steps__line { display: none; }
        }
        @media (max-width: 480px) {
          .steps { grid-template-columns: 1fr; }
        }

        /* ════════════════════════════════════════
           SUBJECTS
        ════════════════════════════════════════ */
        .subjects {
          padding: var(--space-5xl) 0;
          background: var(--deep-navy);
        }
        .subjects__grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }
        .subject-card {
          background: var(--navy);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: var(--radius-lg);
          padding: 28px;
          text-align: center;
          transition: all var(--duration-normal) var(--ease-out);
          animation: fadeInUp 0.6s var(--ease-out) both;
        }
        .subject-card:hover {
          border-color: var(--subj-color);
          transform: translateY(-4px);
        }
        .subject-card__icon {
          font-size: 2.5rem;
          margin-bottom: 16px;
          color: var(--subj-color);
          display: flex;
          justify-content: center;
        }
        .subject-card__icon svg {
          width: 40px;
          height: 40px;
        }
        .subject-card__name {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--white);
          margin-bottom: 8px;
          letter-spacing: -0.01em;
        }
        .subject-card__board {
          font-size: 0.75rem;
          color: var(--mist);
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .subject-card__stats {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-bottom: 16px;
        }
        .subject-card__stat-val {
          font-weight: 700;
          font-size: 1rem;
          color: var(--white);
          display: block;
        }
        .subject-card__stat-label {
          font-size: 0.72rem;
          color: var(--graphite);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .subject-card__bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 16px;
        }
        .subject-card__bar-fill {
          height: 100%;
          width: 0%;
          background: var(--subj-color);
          border-radius: 2px;
          transition: width 1.5s var(--ease-out);
        }
        .subject-card:hover .subject-card__bar-fill {
          width: 100%;
        }
        .subject-card__link {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--subj-color);
          transition: all var(--duration-fast);
        }
        .subject-card__link:hover {
          letter-spacing: 0.02em;
        }

        /* ════════════════════════════════════════
           DASHBOARD PREVIEW
        ════════════════════════════════════════ */
        .dashboard-preview {
          padding: var(--space-5xl) 0;
          background: var(--midnight);
        }
        .dashboard-preview__wrapper {
          position: relative;
          max-width: 1100px;
          margin: 0 auto;
        }
        .dashboard-preview__frame {
          background: var(--navy);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-xl);
        }
        .dashboard-preview__topbar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(0, 0, 0, 0.3);
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }
        .topbar-dots {
          display: flex;
          gap: 6px;
        }
        .topbar-dots span {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--steel);
        }
        .topbar-dots span:first-child { background: var(--coral); }
        .topbar-dots span:nth-child(2) { background: var(--amber); }
        .topbar-dots span:last-child { background: var(--success); }
        .topbar-url {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--graphite);
        }
        .dashboard-preview__img {
          width: 100%;
          height: auto;
        }
        .dashboard-preview__callouts {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .callout {
          position: absolute;
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(16, 29, 58, 0.92);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(45, 212, 191, 0.15);
          border-radius: var(--radius-md);
          padding: 12px 16px;
          animation: floatCard 5s infinite ease-in-out;
        }
        .callout--left { left: -20px; top: 40%; }
        .callout--right { right: -20px; bottom: 30%; animation-delay: -2s; }
        .callout__dot {
          width: 8px;
          height: 8px;
          background: var(--teal-400);
          border-radius: 50%;
          flex-shrink: 0;
        }
        .callout__content strong {
          display: block;
          font-size: 0.85rem;
          color: var(--white);
          font-weight: 600;
        }
        .callout__content span {
          font-size: 0.75rem;
          color: var(--graphite);
        }
        @media (max-width: 768px) {
          .callout { display: none; }
        }

        /* ════════════════════════════════════════
           CASE STUDIES
        ════════════════════════════════════════ */
        .case-studies {
          padding: var(--space-5xl) 0;
          background: var(--midnight);
        }
        .case-studies__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 28px;
          margin-top: 40px;
        }
        .case-studies__card {
          background: var(--deep-navy);
          border: 1px solid var(--slate);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: border-color var(--duration-fast) var(--ease-out);
        }
        .case-studies__card:hover {
          border-color: var(--teal);
        }
        .case-studies__video-wrap {
          position: relative;
          aspect-ratio: 16/9;
          background: var(--navy);
        }
        .case-studies__loader-video {
          position: absolute;
          width: 1px;
          height: 1px;
          opacity: 0;
          pointer-events: none;
          z-index: -1;
        }
        .case-studies__video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .case-studies__title {
          font-family: var(--font-display);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--white);
          padding: 16px 20px;
          margin: 0;
        }

        /* ════════════════════════════════════════
           TESTIMONIALS
        ════════════════════════════════════════ */
        .testimonials {
          padding: var(--space-5xl) 0;
          background: var(--deep-navy);
        }
        .testimonials__carousel {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }
        .testimonial-card {
          background: var(--navy);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: var(--radius-lg);
          padding: 28px;
          transition: all var(--duration-normal) var(--ease-out);
          opacity: 0.5;
          transform: scale(0.97);
        }
        .testimonial-card--active {
          opacity: 1;
          transform: scale(1);
          border-color: rgba(45, 212, 191, 0.2);
          box-shadow: var(--shadow-teal);
        }
        .testimonial-card__stars {
          color: var(--amber);
          font-size: 0.9rem;
          margin-bottom: 16px;
          letter-spacing: 2px;
        }
        .testimonial-card__text {
          font-family: var(--font-body);
          font-size: 0.95rem;
          color: var(--cloud);
          line-height: 1.75;
          margin-bottom: 20px;
          font-style: italic;
        }
        .testimonial-card__author {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .testimonial-card__avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--steel);
        }
        .testimonial-card__avatar--initials {
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--steel);
          color: var(--white);
          font-size: 0.85rem;
          font-weight: 700;
        }
        .testimonial-card__name {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--white);
        }
        .testimonial-card__score {
          font-family: var(--font-body);
          font-size: 0.78rem;
          color: var(--teal-400);
          font-weight: 600;
        }
        .testimonials__dots {
          display: flex;
          justify-content: center;
          gap: 8px;
        }
        .testimonials__dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--steel);
          border: none;
          cursor: pointer;
          transition: all var(--duration-fast);
        }
        .testimonials__dot--active {
          background: var(--teal);
          width: 24px;
          border-radius: 4px;
        }

        /* ════════════════════════════════════════
           CHALLENGES
        ════════════════════════════════════════ */
        .challenges {
          padding: var(--space-5xl) 0;
          background: var(--midnight);
        }
        .challenges__inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }
        .challenges__badges {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 28px;
        }
        .badge-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--navy);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: var(--radius-full);
          padding: 8px 16px;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--cloud);
          transition: all var(--duration-fast) var(--ease-out);
        }
        .badge-chip:hover {
          border-color: var(--teal);
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }
        .badge-chip__icon { 
          font-size: 1rem; 
          display: flex;
          align-items: center;
          color: var(--teal-400);
        }
        .badge-chip__icon svg {
          width: 18px;
          height: 18px;
        }
        .challenges__img {
          width: 100%;
          height: auto;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
        }
        @media (max-width: 768px) {
          .challenges__inner { grid-template-columns: 1fr; }
        }

        /* ════════════════════════════════════════
           PRICING
        ════════════════════════════════════════ */
        .pricing {
          padding: var(--space-5xl) 0;
          background: var(--midnight);
        }
        .pricing__grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          align-items: start;
        }
        .pricing-card {
          background: var(--navy);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: var(--radius-xl);
          padding: 36px 28px;
          position: relative;
          transition: all var(--duration-normal) var(--ease-out);
        }
        .pricing-card:hover {
          transform: translateY(-4px);
        }
        .pricing-card--skeleton {
          pointer-events: none;
        }
        .pricing-card--skeleton:hover {
          transform: none;
        }
        .pricing-skeleton__line {
          height: 14px;
          border-radius: 6px;
          margin-bottom: 12px;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.04) 25%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0.04) 75%
          );
          background-size: 200% 100%;
          animation: landingShimmer 1.2s ease-in-out infinite;
        }
        .pricing-skeleton__line--title {
          height: 22px;
          width: 55%;
          margin-bottom: 16px;
        }
        .pricing-skeleton__line--price {
          height: 36px;
          width: 70%;
          margin: 20px 0;
        }
        .pricing-skeleton__line--short {
          width: 40%;
        }
        @keyframes landingShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .pricing-card--popular {
          border-color: var(--teal);
          box-shadow: var(--shadow-teal);
          transform: scale(1.04);
          z-index: 2;
        }
        .pricing-card--popular:hover {
          transform: scale(1.04) translateY(-4px);
        }
        .pricing-card__badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--teal);
          color: var(--white);
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 5px 16px;
          border-radius: var(--radius-full);
        }
        .pricing-card__name {
          font-family: var(--font-display);
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--white);
          margin-bottom: 6px;
          letter-spacing: -0.01em;
        }
        .pricing-card__desc {
          font-family: var(--font-body);
          font-size: 0.85rem;
          color: var(--mist);
          margin-bottom: 24px;
        }
        .pricing-card__price {
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-bottom: 28px;
        }
        .pricing-card__currency {
          font-family: var(--font-body);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--graphite);
        }
        .pricing-card__amount {
          font-family: var(--font-display);
          font-size: 2.8rem;
          font-weight: 800;
          color: var(--white);
          letter-spacing: -0.03em;
        }
        .pricing-card__period {
          font-size: 0.85rem;
          color: var(--graphite);
          font-weight: 500;
        }
        .pricing-card__features {
          list-style: none;
          margin-bottom: 28px;
        }
        .pricing-card__features li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.88rem;
          color: var(--mist);
          padding: 7px 0;
        }
        @media (max-width: 900px) {
          .pricing__grid { grid-template-columns: 1fr; max-width: 420px; margin: 0 auto; }
          .pricing-card--popular { transform: none; }
        }

        /* ════════════════════════════════════════
           CTA / COUNTDOWN
        ════════════════════════════════════════ */
        .cta-section {
          padding: var(--space-5xl) 0;
          background: var(--deep-navy);
          position: relative;
          overflow: hidden;
        }
        .cta-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, rgba(14,165,160,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .cta-section__inner {
          position: relative;
          text-align: center;
        }
        .cta-section__title {
          font-family: var(--font-display);
          font-size: clamp(2rem, 4.5vw, 3.2rem);
          font-weight: 800;
          color: var(--white);
          margin-bottom: 40px;
          line-height: 1.15;
          letter-spacing: -0.03em;
        }
        .cta-section__countdown {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 32px;
        }
        .countdown-block {
          background: var(--navy);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: var(--radius-lg);
          padding: 20px 24px;
          min-width: 90px;
        }
        .countdown-block__val {
          font-family: var(--font-display);
          font-size: 2.2rem;
          font-weight: 800;
          color: var(--teal-400);
          display: block;
          letter-spacing: -0.02em;
        }
        .countdown-block__label {
          font-family: var(--font-body);
          font-size: 0.72rem;
          color: var(--graphite);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 500;
        }
        .cta-section__text {
          font-size: 1.1rem;
          color: var(--mist);
          max-width: 560px;
          margin: 0 auto 32px;
          line-height: 1.7;
        }

        /* ════════════════════════════════════════
           CONTACT
        ════════════════════════════════════════ */
        .contact {
          padding: var(--space-5xl) 0;
          background: var(--midnight);
        }
        .contact__inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: start;
        }
        .contact__info {
          text-align: left;
        }
        .contact__info .section-title {
          display: block;
          text-align: left;
        }
        .contact__info .section-desc {
          margin: 0;
          max-width: 480px;
        }
        .contact__methods {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-top: 32px;
        }
        .contact__method {
          display: flex;
          align-items: center;
          gap: 14px;
          background: var(--navy);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: var(--radius-md);
          padding: 16px 20px;
          transition: all var(--duration-fast);
        }
        .contact__method:hover {
          border-color: var(--teal);
        }
        .contact__method-icon {
          font-size: 1.4rem;
          color: var(--teal-400);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .contact__method-icon svg {
          width: 24px;
          height: 24px;
        }
        .contact__method-label {
          font-size: 0.78rem;
          color: var(--graphite);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .contact__method-value {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--white);
        }
        a.contact__method-value {
          text-decoration: none;
          transition: color 0.2s ease;
        }
        a.contact__method-value:hover {
          color: var(--teal-300);
        }
        .contact__form {
          background: var(--navy);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: var(--radius-xl);
          padding: 32px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--mist);
          margin-bottom: 6px;
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 12px 16px;
          background: var(--deep-navy);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-md);
          color: var(--white);
          font-family: var(--font-body);
          font-size: 0.92rem;
          transition: border-color var(--duration-fast);
          outline: none;
        }
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: var(--teal);
        }
        .form-group select {
          appearance: none;
          cursor: pointer;
        }
        .form-group textarea {
          resize: vertical;
        }
        @media (max-width: 768px) {
          .contact__inner { grid-template-columns: 1fr; }
        }

        /* ════════════════════════════════════════
           FOOTER
        ════════════════════════════════════════ */
        .footer {
          padding: var(--space-4xl) 0 var(--space-xl);
          background: var(--deep-navy);
          border-top: 1px solid rgba(255, 255, 255, 0.04);
        }
        .footer__grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 40px;
          margin-bottom: 48px;
        }
        .footer__tagline {
          font-size: 0.9rem;
          color: var(--graphite);
          margin: 16px 0;
          line-height: 1.6;
          max-width: 300px;
        }
        .footer__social {
          display: flex;
          gap: 8px;
        }
        .footer__social-link {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--navy);
          border: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--mist);
          transition: all var(--duration-fast);
        }
        .footer__social-link:hover {
          border-color: var(--teal);
          color: var(--teal-400);
        }
        .footer__col h4 {
          font-family: var(--font-display);
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--white);
          margin-bottom: 18px;
          letter-spacing: -0.01em;
        }
        .footer__col a {
          display: block;
          font-family: var(--font-body);
          font-size: 0.85rem;
          color: var(--mist);
          padding: 6px 0;
          transition: color var(--duration-fast);
        }
        .footer__col a:hover {
          color: var(--teal-300);
        }
        .footer__bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          font-size: 0.82rem;
          color: var(--graphite);
        }
        @media (max-width: 768px) {
          .footer__grid { grid-template-columns: 1fr 1fr 1fr; gap: 24px; }
          .footer__brand { grid-column: 1 / -1; text-align: center; display: flex; flex-direction: column; align-items: center; }
          .footer__brand .navbar__logo { justify-content: center; }
          .footer__tagline { max-width: none; margin-left: auto; margin-right: auto; }
          .footer__social { justify-content: center; }
          .footer__col { text-align: center; }
          .footer__bottom { flex-direction: column; gap: 8px; text-align: center; }
        }

        /* ════════════════════════════════════════
           GLOBAL MOBILE FRIENDLY (landing)
        ════════════════════════════════════════ */
        @media (max-width: 768px) {
          .section-header { margin-bottom: 28px; }
          .section-tag { font-size: 0.7rem; }
          .section-title { font-size: clamp(1.5rem, 5vw, 2.2rem); margin-bottom: 12px; }
          .section-desc { font-size: 0.95rem; padding: 0 8px; }
          .hero {
            min-height: auto;
            padding: 100px 0 32px;
          }
          .hero__inner { gap: 32px; }
          .hero__badge { font-size: 0.75rem; padding: 6px 14px; margin-bottom: 16px; }
          .hero__title { font-size: clamp(1.75rem, 6vw, 2.5rem); margin-bottom: 16px; }
          .hero__subtitle { font-size: 0.95rem; margin-bottom: 24px; }
          .hero__actions {
            flex-direction: column;
            gap: 12px;
            margin-bottom: 28px;
          }
          .hero__actions .btn { width: 100%; justify-content: center; }
          .hero__stats {
            flex-wrap: wrap;
            justify-content: center;
            gap: 16px;
          }
          .hero__stat-divider { display: none; }
          .hero__stat { text-align: center; }
          .hero__stat-number { font-size: 1.4rem; }
          .hero__stat-label { font-size: 0.72rem; }
          .hero__trusted { margin-top: 40px; padding-top: 28px; }
          .hero__trusted-logos { gap: 20px; }
          .hero__trusted-item { font-size: 0.9rem; }
          .features { padding: var(--space-4xl) 0; }
          .features__grid { grid-template-columns: 1fr; gap: 16px; }
          .how-it-works { padding: var(--space-4xl) 0; }
          .steps { grid-template-columns: 1fr; gap: 24px; }
          .steps__line { display: none; }
          .step { max-width: 100%; }
          .subjects { padding: var(--space-4xl) 0; }
          .subjects__grid { grid-template-columns: 1fr; }
          .dashboard-preview { padding: var(--space-4xl) 0; }
          .dashboard-preview__wrapper { padding: 0 8px; }
          .case-studies { padding: var(--space-4xl) 0; }
          .case-studies__grid { grid-template-columns: 1fr; gap: 20px; margin-top: 24px; }
          .testimonials { padding: var(--space-4xl) 0; }
          .testimonials__carousel { grid-template-columns: 1fr; }
          .challenges { padding: var(--space-4xl) 0; }
          .challenges__inner { grid-template-columns: 1fr; gap: 32px; text-align: center; }
          .challenges__content .section-desc { margin-left: auto; margin-right: auto; }
          .pricing { padding: var(--space-4xl) 0; }
          .cta-section { padding: var(--space-4xl) 0; }
          .cta-section__title { font-size: clamp(1.5rem, 5vw, 2rem); margin-bottom: 24px; }
          .cta-section__countdown { flex-wrap: wrap; justify-content: center; gap: 12px; }
          .countdown-block { min-width: 70px; padding: 14px 16px; }
          .countdown-block__val { font-size: 1.75rem; }
          .contact { padding: var(--space-4xl) 0; }
          .contact__form { padding: 20px; }
          .footer { padding: var(--space-3xl) 0 var(--space-lg); }
          .footer__grid { gap: 28px; margin-bottom: 32px; }
        }
        @media (max-width: 480px) {
          .hero { padding: 88px 0 24px; }
          .hero__title { font-size: 1.6rem; }
          .hero__stats { gap: 12px; }
          .hero__stat-number { font-size: 1.25rem; }
          .feature-card { padding: 20px; }
          .step__number { font-size: 2rem; }
          .countdown-block { min-width: 64px; padding: 12px; }
          .countdown-block__val { font-size: 1.5rem; }
          .footer__grid { grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
          .footer__brand { grid-column: 1 / -1; text-align: center; display: flex; flex-direction: column; align-items: center; }
          .footer__brand .navbar__logo { justify-content: center; }
          .footer__tagline { max-width: none; margin-left: auto; margin-right: auto; }
          .footer__social { justify-content: center; }
          .footer__col { text-align: center; }
        }
      `}</style>
    </>
  );
}
