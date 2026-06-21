"use client";
import { useState, useEffect } from "react";
import { getVideos, createVideo, getVideo } from "@/api/video.api";
import toast from "react-hot-toast";
export default function VideoSummarizerPage() {
  const [videos, setVideos] = useState([]); const [url, setUrl] = useState(""); const [selected, setSelected] = useState(null);
  const load = () => getVideos().then(r => setVideos(r?.data || [])).catch(() => {});
  useEffect(() => { load(); }, []);
  const submit = async () => { if (!url) return; try { await createVideo({ url }); toast.success("Video submitted for processing"); setUrl(""); load(); } catch { toast.error("Failed"); } };
  const view = async (id) => { try { const r = await getVideo(id); setSelected(r?.data); } catch {} };
  return (<div style={{ padding: 20 }}><h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Video Summarizer</h1>
    <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
      <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Paste video URL..." style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: "1px solid #334155", background: "#0f172a", color: "#e2e8f0" }} />
      <button onClick={submit} style={{ padding: "8px 16px", borderRadius: 6, background: "#0ea5e9", color: "#fff", border: "none", cursor: "pointer" }}>Process</button>
    </div>
    {selected && <div style={{ background: "#1e293b", borderRadius: 8, padding: 16, marginBottom: 20 }}>
      <button onClick={() => setSelected(null)} style={{ color: "#38bdf8", background: "none", border: "none", cursor: "pointer", marginBottom: 8 }}>Close</button>
      <h3 style={{ fontWeight: 600 }}>{selected.title || selected.url}</h3>
      <p style={{ fontSize: 11, color: "#64748b" }}>Status: {selected.status}</p>
      {selected.summary && <><h4 style={{ fontWeight: 600, marginTop: 12 }}>Summary</h4><p style={{ color: "#94a3b8" }}>{selected.summary}</p></>}
      {selected.keyPoints?.length > 0 && <><h4 style={{ fontWeight: 600, marginTop: 12 }}>Key Points</h4><ul style={{ color: "#94a3b8", paddingLeft: 20 }}>{selected.keyPoints.map((p, i) => <li key={i}>{p}</li>)}</ul></>}
    </div>}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
      {videos.map(v => (<div key={v._id} onClick={() => view(v._id)} style={{ background: "#1e293b", borderRadius: 8, padding: 16, cursor: "pointer" }}>
        <p style={{ fontWeight: 600 }}>{v.title || v.url?.substring(0, 50)}</p>
        <p style={{ color: "#64748b", fontSize: 12 }}>Status: <span style={{ color: v.status === "completed" ? "#2dd4bf" : v.status === "processing" ? "#fbbf24" : "#94a3b8" }}>{v.status}</span></p>
      </div>))}
    </div>
  </div>);
}
