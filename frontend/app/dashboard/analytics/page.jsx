"use client";
import { useState, useEffect } from "react";
import { getAnalytics } from "@/api/performance.api";
export default function AnalyticsPage() {
  const [data, setData] = useState(null); const [loading, setLoading] = useState(true);
  useEffect(() => { getAnalytics().then(r => setData(r?.data)).catch(() => {}).finally(() => setLoading(false)); }, []);
  if (loading) return <div style={{ padding: 20 }}>Loading analytics...</div>;
  if (!data?.overall) return <div style={{ padding: 20 }}><h1 style={{ fontSize: 24, fontWeight: 700 }}>Analytics</h1><p style={{ color: "#94a3b8", marginTop: 12 }}>No performance data yet. Complete some tests to see analytics.</p></div>;
  return (<div style={{ padding: 20 }}><h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Performance Analytics</h1>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
      <div style={{ background: "#1e293b", borderRadius: 8, padding: 16 }}><p style={{ color: "#94a3b8", fontSize: 13 }}>Overall Accuracy</p><p style={{ fontSize: 28, fontWeight: 800, color: "#2dd4bf" }}>{data.overall.accuracy}%</p></div>
      <div style={{ background: "#1e293b", borderRadius: 8, padding: 16 }}><p style={{ color: "#94a3b8", fontSize: 13 }}>Total Questions</p><p style={{ fontSize: 28, fontWeight: 800 }}>{data.overall.totalQuestions}</p></div>
      <div style={{ background: "#1e293b", borderRadius: 8, padding: 16 }}><p style={{ color: "#94a3b8", fontSize: 13 }}>Time Spent</p><p style={{ fontSize: 28, fontWeight: 800 }}>{Math.round(data.overall.totalTimeSpent/60)}m</p></div>
    </div>
    <h3 style={{ fontWeight: 600, marginBottom: 8 }}>By Subject</h3>
    {data.subjects?.map(s => (<div key={s.subjectId} style={{ background: "#1e293b", borderRadius: 8, padding: 12, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontWeight: 600 }}>{s.subjectName}</span>
      <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#94a3b8" }}>
        <span>Accuracy: <b style={{ color: s.accuracy >= 70 ? "#2dd4bf" : s.accuracy >= 40 ? "#fbbf24" : "#ef4444" }}>{s.accuracy}%</b></span>
        <span>{s.totalQuestions} Qs</span><span>{s.attempts} attempts</span>
      </div>
    </div>))}
    {data.weakestTopics?.length > 0 && <><h3 style={{ fontWeight: 600, marginTop: 20, marginBottom: 8 }}>Weakest Topics</h3>
      {data.weakestTopics.map(w => (<div key={w.subjectId} style={{ background: "#1e293b", borderRadius: 8, padding: 12, marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
        <span>{w.subjectName}</span><span style={{ color: "#ef4444", fontWeight: 600 }}>{w.accuracy}%</span>
      </div>))}</>}
  </div>);
}
