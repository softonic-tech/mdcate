"use client";

import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCssTheme } from "@/hooks/useCssTheme";
import {
  Activity,
  ClipboardList,
  FileText,
  BookOpen,
  Layers,
  BarChart3,
  CalendarCheck,
  Trophy,
  PlayCircle,
  GraduationCap,
  CreditCard,
  Lock,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import SectionTitle from "@/components/dashboard/SectionTitle";
import { billingUpgradeUrl, hasActiveSubscription, requiresSubscription } from "@/lib/subscriptionAccess";

const QUICK_LINKS = [
  { name: "Start Learning", href: "/dashboard/learn", icon: GraduationCap, desc: "Subject-by-subject path" },
  { name: "MCQ Bank", href: "/dashboard/mcq-bank", icon: ClipboardList, desc: "Practice questions" },
  { name: "Tests", href: "/dashboard/tests", icon: FileText, desc: "Mock & quiz" },
  { name: "Past Papers", href: "/dashboard/past-papers", icon: BookOpen, desc: "Real exam papers" },
  { name: "Chapter Videos", href: "/dashboard/chapter-videos", icon: PlayCircle, desc: "Video lectures" },
  { name: "Flashcards", href: "/dashboard/flashcards", icon: Layers, desc: "Spaced review" },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3, desc: "Track progress" },
  { name: "Challenges", href: "/dashboard/challenges", icon: CalendarCheck, desc: "Daily goals" },
  { name: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy, desc: "Your rank" },
];

export default function DashboardHome() {
  const { user } = useAuth();
  const router = useRouter();
  const { profile } = useProfile();
  const { chart } = useCssTheme();
  const displayName = profile?.username || user?.username || "Student";
  const subscribed = hasActiveSubscription(user);

  const handleQuickLink = (href) => (e) => {
    if (!subscribed && requiresSubscription(href)) {
      e.preventDefault();
      router.push(billingUpgradeUrl());
    }
  };

  return (
    <div className="page-shell study-page dash-home">
      {!subscribed && (
        <section className="content-card content-card--spaced dash-upgrade-banner">
          <div>
            <h2 className="section-title-sm">Subscribe to unlock full access</h2>
            <p className="text-muted">
              Start Learning, Past Papers, Video Summarizer, MCQ Bank, tests, books, and chapter videos
              require an active plan. Flashcards, challenges, analytics, and leaderboard are free.
            </p>
          </div>
          <Link href="/dashboard/billing" className="btn-primary">
            <CreditCard size={16} />
            View plans
          </Link>
        </section>
      )}

      <section className="welcome-banner">
        <div className="welcome-banner__text">
          <h1>Welcome back, {displayName}</h1>
          <p>
            Your personalized study hub — practice MCQs, watch lectures, and track progress in one place.
          </p>
        </div>
        <div className="welcome-banner__icon" aria-hidden="true">
          <Activity size={32} strokeWidth={1.6} />
        </div>
      </section>

      <SectionTitle title="Jump back in" description="Quick access to your most-used tools" />

      <div className="quick-grid">
        {QUICK_LINKS.map((item) => {
          const Icon = item.icon;
          const locked = !subscribed && requiresSubscription(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`quick-card${locked ? " quick-card--locked" : ""}`}
              onClick={handleQuickLink(item.href)}
            >
              <div className="quick-card__icon">
                <Icon size={22} strokeWidth={1.8} />
                {locked && <Lock size={12} className="quick-card__lock" aria-hidden="true" />}
              </div>
              <span className="quick-card__label">{item.name}</span>
            </Link>
          );
        })}
      </div>

      <SectionTitle title="Your progress" description="Overview of tests, accuracy, and study habits" />

      <div className="stats-grid">
        <div className="stat-card">
          <h3 className="stat-card__label">Weekly Tests</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={[{ w: "W1", t: 4 }, { w: "W2", t: 6 }, { w: "W3", t: 5 }, { w: "W4", t: 8 }]}>
              <CartesianGrid stroke={chart.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="w" stroke={chart.tick} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke={chart.tick} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chart.tooltip} />
              <Line type="monotone" dataKey="t" stroke={chart.primary} strokeWidth={2.5} dot={{ r: 4, fill: chart.primary }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="stat-card">
          <h3 className="stat-card__label">Subject Accuracy</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[{ s: "Bio", v: 80 }, { s: "Chem", v: 65 }, { s: "Phy", v: 72 }, { s: "Eng", v: 88 }]}>
              <CartesianGrid stroke={chart.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="s" stroke={chart.tick} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke={chart.tick} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chart.tooltip} />
              <Bar dataKey="v" radius={[6, 6, 0, 0]}>
                {chart.palette.map((color, i) => (
                  <Cell key={i} fill={color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="stat-card stat-card--center">
          <h3 className="stat-card__label">Current Rank</h3>
          <div className="stat-card__chart-wrap">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={[{ value: 8 }, { value: 92 }]} innerRadius={62} outerRadius={88} dataKey="value" startAngle={90} endAngle={-270}>
                  <Cell fill={chart.primary} />
                  <Cell fill={chart.track} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="stat-card__center-text">Top 8%</div>
          </div>
        </div>

        <div className="stat-card">
          <h3 className="stat-card__label">Study Hours</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={[{ d: "Mon", h: 2 }, { d: "Tue", h: 3 }, { d: "Wed", h: 4 }, { d: "Thu", h: 3 }, { d: "Fri", h: 5 }]}>
              <CartesianGrid stroke={chart.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="d" stroke={chart.tick} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke={chart.tick} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chart.tooltip} />
              <Area type="monotone" dataKey="h" stroke={chart.primary} fill={chart.primary} fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="stat-card stat-card--center">
          <h3 className="stat-card__label">Mock Distribution</h3>
          <div className="stat-card__chart-wrap">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={[{ value: 40 }, { value: 60 }]} innerRadius={48} outerRadius={82} paddingAngle={4} dataKey="value">
                  <Cell fill={chart.highlight} />
                  <Cell fill={chart.track} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="stat-card__center-text stat-card__center-text--sm">40 / 60</div>
          </div>
        </div>

        <div className="stat-card">
          <h3 className="stat-card__label">Daily Streak</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={[{ d: "M", s: 1 }, { d: "T", s: 2 }, { d: "W", s: 3 }, { d: "T", s: 4 }, { d: "F", s: 5 }]}>
              <CartesianGrid stroke={chart.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="d" stroke={chart.tick} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke={chart.tick} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chart.tooltip} />
              <Line type="monotone" dataKey="s" stroke={chart.highlight} strokeWidth={2.5} dot={{ r: 4, fill: chart.highlight }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="stat-card">
          <h3 className="stat-card__label">MCQs Practiced</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              layout="vertical"
              data={[
                { w: "Week 1", mcq: 3000 },
                { w: "Week 2", mcq: 5000 },
                { w: "Week 3", mcq: 8000 },
                { w: "Week 4", mcq: 15000 },
              ]}
              margin={{ top: 8, right: 16, left: 4, bottom: 8 }}
            >
              <CartesianGrid stroke={chart.grid} strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" stroke={chart.tick} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="w" stroke={chart.tick} tick={{ fontSize: 12 }} width={56} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chart.tooltip} />
              <Bar dataKey="mcq" fill={chart.primary} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
