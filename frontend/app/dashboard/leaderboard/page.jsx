"use client";
import { useState, useEffect } from "react";
import { getTopLeaderboard, getMyRank } from "@/api/leaderboard.api";
export default function LeaderboardPage() {
  const [top, setTop] = useState([]); const [rank, setRank] = useState(null);
  useEffect(() => { getTopLeaderboard().then(r => setTop(r?.data || [])).catch(() => {}); getMyRank().then(r => setRank(r?.data)).catch(() => {}); }, []);
  return (<div style={{ padding: 20, maxWidth: 600 }}><h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Leaderboard</h1>
    {rank && <div style={{ background: "#1e293b", borderRadius: 8, padding: 16, marginBottom: 20 }}><p style={{ color: "#94a3b8" }}>Your Rank</p><p style={{ fontSize: 28, fontWeight: 800, color: "#2dd4bf" }}>#{rank.rank} <span style={{ fontSize: 16, color: "#94a3b8" }}>({rank.points} pts)</span></p></div>}
    <div>{top.map((u, i) => (<div key={u._id} style={{ display: "flex", alignItems: "center", gap: 12, background: "#1e293b", borderRadius: 8, padding: 12, marginBottom: 8 }}>
      <span style={{ fontSize: 20, fontWeight: 800, color: i < 3 ? "#fbbf24" : "#94a3b8", width: 32 }}>#{i+1}</span>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#334155", overflow: "hidden" }}>{u.profilePicture && <img src={u.profilePicture} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}</div>
      <div style={{ flex: 1 }}><p style={{ fontWeight: 600 }}>{u.username}</p></div>
      <span style={{ fontWeight: 700, color: "#2dd4bf" }}>{u.points} pts</span>
    </div>))}</div>
  </div>);
}
