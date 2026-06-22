"use client";

import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";
import Link from "next/link";
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

const QUICK_LINKS = [
  { name: "MCQ Bank", href: "/dashboard/mcq-bank", icon: ClipboardList, desc: "Practice questions" },
  { name: "Tests", href: "/dashboard/tests", icon: FileText, desc: "Mock & quiz" },
  { name: "Past Papers", href: "/dashboard/past-papers", icon: BookOpen, desc: "Real exam papers" },
  { name: "Chapter Videos", href: "/dashboard/chapter-videos", icon: PlayCircle, desc: "Video lectures" },
  { name: "Flashcards", href: "/dashboard/flashcards", icon: Layers, desc: "Spaced review" },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3, desc: "Track progress" },
  { name: "Challenges", href: "/dashboard/challenges", icon: CalendarCheck, desc: "Daily goals" },
  { name: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy, desc: "Your rank" },
];

const CHART_TOOLTIP = {
  background: "#161616",
  border: "1px solid #1c1c1c",
  borderRadius: "4px",
  color: "#d4d4d4",
  fontSize: "13px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
};

const CHART_GRID = "#252526";
const CHART_TICK = "#858585";
const CHART_PRIMARY = "#007acc";
const CHART_PRIMARY_LIGHT = "#1a8ad4";
const CHART_HIGHLIGHT = "#9cdcfe";
const CHART_PALETTE = ["#007acc", "#1a8ad4", "#9cdcfe", "#4ec9b0"];

export default function DashboardHome() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const displayName = profile?.username || user?.username || "Student";

  return (
    <div className="page-shell study-page dash-home">
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
          return (
            <Link key={item.href} href={item.href} className="quick-card">
              <div className="quick-card__icon">
                <Icon size={22} strokeWidth={1.8} />
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
              <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="w" stroke={CHART_TICK} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke={CHART_TICK} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={CHART_TOOLTIP} />
              <Line type="monotone" dataKey="t" stroke={CHART_PRIMARY} strokeWidth={2.5} dot={{ r: 4, fill: CHART_PRIMARY }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="stat-card">
          <h3 className="stat-card__label">Subject Accuracy</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[{ s: "Bio", v: 80 }, { s: "Chem", v: 65 }, { s: "Phy", v: 72 }, { s: "Eng", v: 88 }]}>
              <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="s" stroke={CHART_TICK} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke={CHART_TICK} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={CHART_TOOLTIP} />
              <Bar dataKey="v" radius={[6, 6, 0, 0]}>
                {CHART_PALETTE.map((color, i) => (
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
                  <Cell fill={CHART_PRIMARY} />
                  <Cell fill="#222222" />
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
              <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="d" stroke={CHART_TICK} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke={CHART_TICK} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={CHART_TOOLTIP} />
              <Area type="monotone" dataKey="h" stroke={CHART_PRIMARY} fill={CHART_PRIMARY} fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="stat-card stat-card--center">
          <h3 className="stat-card__label">Mock Distribution</h3>
          <div className="stat-card__chart-wrap">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={[{ value: 40 }, { value: 60 }]} innerRadius={48} outerRadius={82} paddingAngle={4} dataKey="value">
                  <Cell fill={CHART_HIGHLIGHT} />
                  <Cell fill="#222222" />
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
              <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="d" stroke={CHART_TICK} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke={CHART_TICK} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={CHART_TOOLTIP} />
              <Line type="monotone" dataKey="s" stroke={CHART_HIGHLIGHT} strokeWidth={2.5} dot={{ r: 4, fill: CHART_HIGHLIGHT }} />
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
              <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" stroke={CHART_TICK} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="w" stroke={CHART_TICK} tick={{ fontSize: 12 }} width={56} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={CHART_TOOLTIP} />
              <Bar dataKey="mcq" fill={CHART_PRIMARY} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
