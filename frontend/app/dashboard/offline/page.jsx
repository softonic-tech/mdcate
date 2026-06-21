"use client";
import { useState, useEffect } from "react";
import { getOfflineContent, deleteOfflineContent } from "@/api/offlineContent.api";
import toast from "react-hot-toast";
export default function OfflinePage() {
  const [content, setContent] = useState([]);
  const load = () => getOfflineContent().then(r => setContent(r?.data || [])).catch(() => {});
  useEffect(() => { load(); }, []);
  const remove = async (id) => { await deleteOfflineContent(id); toast.success("Removed"); load(); };
  return (<div style={{ padding: 20 }}><h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Offline Downloads</h1>
    <p style={{ color: "#94a3b8", marginBottom: 16 }}>Content you have downloaded for offline access.</p>
    {content.length === 0 ? <p style={{ color: "#64748b" }}>No offline content. Download tests, notes, or flashcards to access them offline.</p> :
      content.map(c => (<div key={c._id} style={{ background: "#1e293b", borderRadius: 8, padding: 12, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
        <div><p style={{ fontWeight: 600 }}>{c.contentType}</p><p style={{ color: "#64748b", fontSize: 12 }}>Downloaded: {new Date(c.downloadedAt).toLocaleDateString()}</p></div>
        <button onClick={() => remove(c._id)} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}>Remove</button>
      </div>))}
  </div>);
}
