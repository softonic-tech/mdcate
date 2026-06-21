"use client";

import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";
import Link from "next/link";
import { Activity } from "lucide-react";
import {
  ClipboardList,
  FileText,
  BookOpen,
  Brain,
  Layers,
  BarChart3,
  CalendarCheck,
  Trophy,
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

const QUICK_LINKS = [
  { name: "MCQ Bank", href: "/dashboard/mcq-bank", icon: ClipboardList, color: "var(--teal)" },
  { name: "Tests", href: "/dashboard/tests", icon: FileText, color: "var(--sky)" },
  { name: "Past Papers", href: "/dashboard/past-papers", icon: BookOpen, color: "var(--amber)" },
  { name: "Flashcards", href: "/dashboard/flashcards", icon: Layers, color: "var(--coral)" },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3, color: "var(--info)" },
  { name: "Challenges", href: "/dashboard/challenges", icon: CalendarCheck, color: "var(--success)" },
  { name: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy, color: "var(--amber-light)" },
];

export default function DashboardHome() {
  const { user } = useAuth();
  const { profile } = useProfile();

  const displayName = profile?.username || user?.username || "Student";

  return (
    <div className="dash-home">
      {/* Welcome banner */}
<section className="dash-home__welcome">
  <div className="dash-home__welcome-text">
    <h1>Welcome back, {displayName}!</h1>
    <p>Ready to ace the MDCAT? Pick up where you left off or explore something new.</p>
  </div>
  <div className="dash-home__welcome-art">
    <div
      style={{
        width: "120px",
        height: "120px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--teal-100)",
        borderRadius: "50%",
        border: "2px dashed var(--teal-300)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      }}
    >
      <Activity size={48} color="var(--teal-300)" strokeWidth={1.8} />
    </div>
  </div>
</section>
      {/* Quick links grid */}
      <section className="dash-home__grid">
        {QUICK_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="dash-home__card">
              <div className="dash-home__card-icon" style={{ color: item.color }}>
                <Icon size={26} strokeWidth={1.8} />
              </div>
              <span className="dash-home__card-name">{item.name}</span>
            </Link>
          );
        })}
      </section>

{/* ================= PREMIUM GLASSMORPH DASHBOARD GRAPHS ================= */}
<section
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: "30px",
    marginTop: "30px",
  }}
>

  {/* 1️⃣ Weekly Tests Line */}
  <div className="dash-home__stat glass-card">
    <h3 className="dash-home__stat-label">Weekly Tests</h3>
    <ResponsiveContainer width="100%" height={220}>
      <LineChart
        data={[
          { w: "W1", t: 4 },
          { w: "W2", t: 6 },
          { w: "W3", t: 5 },
          { w: "W4", t: 8 },
        ]}
      >
        <CartesianGrid stroke="#ffffff33" strokeDasharray="3 3" />
        <XAxis dataKey="w" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip contentStyle={{ background: "#0f172aAA", border: "none" }} />
        <Line type="monotone" dataKey="t" stroke="var(--teal)" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>

  {/* 2️⃣ Subject Accuracy Bar */}
  <div className="dash-home__stat glass-card">
    <h3 className="dash-home__stat-label">Subject Accuracy</h3>
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={[
          { s: "Bio", v: 80 },
          { s: "Chem", v: 65 },
          { s: "Phy", v: 72 },
          { s: "Eng", v: 88 },
        ]}
      >
        <CartesianGrid stroke="#ffffff33" strokeDasharray="3 3" />
        <XAxis dataKey="s" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip contentStyle={{ background: "#0f172aAA", border: "none" }} />
        <Bar dataKey="v" radius={[8, 8, 0, 0]}>
          {["var(--teal)", "var(--amber)", "var(--violet)", "var(--sky)"].map((color, i) => (
            <Cell key={i} fill={color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>

  {/* 3️⃣ Rank Donut */}
  <div className="dash-home__stat glass-card" style={{ textAlign: "center" }}>
    <h3 className="dash-home__stat-label">Current Rank</h3>
    <div style={{ position: "relative", width: "100%", height: "240px" }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={[{ value: 8 }, { value: 92 }]}
            innerRadius={70}
            outerRadius={100}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            <Cell fill="var(--danger)" />
            <Cell fill="var(--slate)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: "28px",
        fontWeight: 700
      }}>8%</div>
    </div>
  </div>

  {/* 4️⃣ Study Hours Area */}
  <div className="dash-home__stat glass-card">
    <h3 className="dash-home__stat-label">Study Hours</h3>
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart
        data={[
          { d: "Mon", h: 2 },
          { d: "Tue", h: 3 },
          { d: "Wed", h: 4 },
          { d: "Thu", h: 3 },
          { d: "Fri", h: 5 },
        ]}
      >
        <CartesianGrid stroke="#ffffff33" strokeDasharray="3 3" />
        <XAxis dataKey="d" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip contentStyle={{ background: "#0f172aAA", border: "none" }} />
        <Area type="monotone" dataKey="h" stroke="var(--success)" fill="var(--success)" fillOpacity={0.25} strokeWidth={3} />
      </AreaChart>
    </ResponsiveContainer>
  </div>

  {/* 5️⃣ Mock Distribution Pie */}
 {/* 5️⃣ Mock Distribution Pie (Professional, Different Style) */}
<div className="dash-home__stat glass-card" style={{ textAlign: "center", position: "relative" }}>
  <h3 className="dash-home__stat-label">Mock Distribution</h3>
  <ResponsiveContainer width="100%" height={240}>
    <PieChart>
      <Pie
        data={[
          { name: "Full Test", value: 40 },
          { name: "Subject Test", value: 60 },
        ]}
        innerRadius={50}        // smaller inner radius than Current Rank
        outerRadius={90}        // slightly larger outer radius
        paddingAngle={6}        // adds space between slices
        dataKey="value"
        startAngle={0}          // different start angle for variation
        endAngle={360}
      >
        <Cell fill="var(--teal)" />
        <Cell fill="var(--amber)" />
      </Pie>
    </PieChart>
  </ResponsiveContainer>
  
  {/* Center Text */}
  <div style={{
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "20px",
    fontWeight: 700,
    color: "var(--cloud)"
  }}>
    40 / 60
  </div>
</div>

  {/* 6️⃣ Daily Streak Line */}
  <div className="dash-home__stat glass-card">
    <h3 className="dash-home__stat-label">Daily Streak</h3>
    <ResponsiveContainer width="100%" height={220}>
      <LineChart
        data={[
          { d: "M", s: 1 },
          { d: "T", s: 2 },
          { d: "W", s: 3 },
          { d: "T", s: 4 },
          { d: "F", s: 5 },
        ]}
      >
        <CartesianGrid stroke="#ffffff33" strokeDasharray="3 3" />
        <XAxis dataKey="d" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip contentStyle={{ background: "#0f172aAA", border: "none" }} />
        <Line type="monotone" dataKey="s" stroke="var(--violet)" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>

  {/* 7️⃣ MCQs Practiced Bar Chart */}
{/* 7️⃣ MCQs Practiced Horizontal Bar Chart */}
<div className="dash-home__stat glass-card">
  <h3 className="dash-home__stat-label">MCQs Practiced</h3>
  <ResponsiveContainer width="100%" height={220}>
    <BarChart
      layout="vertical"      // <-- Horizontal bars
      data={[
        { w: "Week 1", mcq: 3000 },
        { w: "Week 2", mcq: 5000 },
        { w: "Week 3", mcq: 8000 },
        { w: "Week 4", mcq: 15000 },
      ]}
      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
    >
      <CartesianGrid stroke="#ffffff33" strokeDasharray="3 3" />
      <XAxis type="number" stroke="#94a3b8" />          {/* Value axis */}
      <YAxis type="category" dataKey="w" stroke="#94a3b8" /> {/* Week labels */}
      <Tooltip contentStyle={{ background: "#0f172aAA", border: "none" }} />
      <Bar dataKey="mcq" fill="var(--sky)" radius={[8, 8, 8, 8]} />
    </BarChart>
  </ResponsiveContainer>
</div>

</section>
    </div>
  );
}
