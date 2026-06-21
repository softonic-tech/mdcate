"use client";
import { useState, useEffect } from "react";
import { getThreads, createThread, deleteThread } from "@/api/discussionThread.api";
import { getThreadMessages, createTextMessage } from "@/api/discussionMessage.api";
import { getSubjectsApi } from "@/api/subject.api";
import toast from "react-hot-toast";
export default function DiscussionPage() {
  const [threads, setThreads] = useState([]); const [subjects, setSubjects] = useState([]);
  const [active, setActive] = useState(null); const [messages, setMessages] = useState([]); const [msg, setMsg] = useState("");
  const [showNew, setShowNew] = useState(false); const [newThread, setNewThread] = useState({ title: "", subjectId: "" });
  const loadThreads = () => getThreads().then(r => setThreads(r?.data || [])).catch(() => {});
  useEffect(() => { loadThreads(); getSubjectsApi().then(r => setSubjects(r?.data || [])).catch(() => {}); }, []);
  const openThread = async (t) => { setActive(t); try { const r = await getThreadMessages(t._id); setMessages(r?.data || []); } catch {} };
  const sendMsg = async () => { if (!msg.trim() || !active) return; try { await createTextMessage({ threadId: active._id, content: msg }); setMsg(""); const r = await getThreadMessages(active._id); setMessages(r?.data || []); } catch { toast.error("Failed"); } };
  const handleNewThread = async () => { if (!newThread.title || !newThread.subjectId) return; try { await createThread(newThread); toast.success("Created"); setShowNew(false); setNewThread({ title: "", subjectId: "" }); loadThreads(); } catch { toast.error("Failed"); } };
  const inp = { padding: "8px 12px", borderRadius: 6, border: "1px solid #334155", background: "#0f172a", color: "#e2e8f0", width: "100%" };
  if (active) return (<div style={{ padding: 20, maxWidth: 700 }}>
    <button onClick={() => setActive(null)} style={{ color: "#38bdf8", background: "none", border: "none", cursor: "pointer", marginBottom: 12 }}>Back to threads</button>
    <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{active.title}</h2>
    <div style={{ maxHeight: 400, overflowY: "auto", marginBottom: 12 }}>{messages.map(m => (<div key={m._id} style={{ background: "#1e293b", borderRadius: 8, padding: 10, marginBottom: 6 }}>
      <p style={{ fontSize: 12, color: "#64748b" }}>{m.userId?.username || "User"}</p>
      <p>{m.content}</p>
    </div>))}</div>
    <div style={{ display: "flex", gap: 8 }}><input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} placeholder="Type a message..." style={{...inp, flex: 1}} /><button onClick={sendMsg} style={{ padding: "8px 16px", borderRadius: 6, background: "#0ea5e9", color: "#fff", border: "none", cursor: "pointer" }}>Send</button></div>
  </div>);
  return (<div style={{ padding: 20 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}><h1 style={{ fontSize: 24, fontWeight: 700 }}>Discussion Room</h1>
    <button onClick={() => setShowNew(!showNew)} style={{ padding: "8px 16px", borderRadius: 6, background: "#0ea5e9", color: "#fff", border: "none", cursor: "pointer" }}>{showNew ? "Cancel" : "New Thread"}</button></div>
    {showNew && <div style={{ background: "#1e293b", borderRadius: 8, padding: 16, marginBottom: 16 }}>
      <input placeholder="Thread title" value={newThread.title} onChange={e => setNewThread(t => ({...t, title: e.target.value}))} style={{...inp, marginBottom: 8}} />
      <select value={newThread.subjectId} onChange={e => setNewThread(t => ({...t, subjectId: e.target.value}))} style={{...inp, marginBottom: 8}}>
        <option value="">Subject</option>{subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
      </select><button onClick={handleNewThread} style={{ padding: "8px 16px", borderRadius: 6, background: "#0ea5e9", color: "#fff", border: "none", cursor: "pointer" }}>Create</button>
    </div>}
    {threads.map(t => (<div key={t._id} onClick={() => openThread(t)} style={{ background: "#1e293b", borderRadius: 8, padding: 16, marginBottom: 8, cursor: "pointer" }}>
      <h3 style={{ fontWeight: 600 }}>{t.title}</h3><p style={{ color: "#94a3b8", fontSize: 12 }}>by {t.createdBy?.username} | {t.subjectId?.name} | {t.messageCount || 0} messages</p>
    </div>))}
  </div>);
}
