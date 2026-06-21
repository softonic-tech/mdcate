"use client";
import { useState, useEffect } from "react";
import { getMnemonics } from "@/api/mnemonic.api";
import { getSubjectsApi } from "@/api/subject.api";
export default function MnemonicsPage() {
  const [mnemonics, setMnemonics] = useState([]); const [subjects, setSubjects] = useState([]); const [filter, setFilter] = useState("");
  useEffect(() => { getSubjectsApi().then(r => setSubjects(r?.data || [])).catch(() => {}); }, []);
  useEffect(() => { const p = filter ? { subjectId: filter } : {}; getMnemonics(p).then(r => setMnemonics(r?.data || [])).catch(() => {}); }, [filter]);
  return (<div style={{ padding: 20 }}><h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Mnemonic Library</h1>
    <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #334155", background: "#1e293b", color: "#e2e8f0", marginBottom: 16 }}>
      <option value="">All</option>{subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
    </select>
    {mnemonics.map(m => (<div key={m._id} style={{ background: "#1e293b", borderRadius: 8, padding: 16, marginBottom: 8 }}>
      <h3 style={{ fontWeight: 600 }}>{m.title}</h3><p style={{ color: "#94a3b8", marginTop: 4 }}>{m.content}</p>
      <p style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>{m.subjectId?.name}</p>
    </div>))}
  </div>);
}
