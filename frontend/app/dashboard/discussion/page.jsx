"use client";

import { useState, useEffect } from "react";
import { getThreads, createThread } from "@/api/discussionThread.api";
import { getThreadMessages, createTextMessage } from "@/api/discussionMessage.api";
import { getSubjectsApi } from "@/api/subject.api";
import toast from "react-hot-toast";
import { MessageSquare, ArrowLeft } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import { CustomSelect } from "@/components/dashboard/CustomSelect";

const normalizeSubjects = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return [];
};

export default function DiscussionPage() {
  const [threads, setThreads] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newThread, setNewThread] = useState({ title: "", subjectId: "" });

  const loadThreads = () =>
    getThreads()
      .then((r) => setThreads(r?.data || []))
      .catch(() => {});

  useEffect(() => {
    loadThreads();
    getSubjectsApi()
      .then((res) => setSubjects(normalizeSubjects(res)))
      .catch(() => setSubjects([]));
  }, []);

  const openThread = async (t) => {
    setActive(t);
    try {
      const r = await getThreadMessages(t._id);
      setMessages(r?.data || []);
    } catch {
      setMessages([]);
    }
  };

  const sendMsg = async () => {
    if (!msg.trim() || !active) return;
    try {
      await createTextMessage({ threadId: active._id, content: msg });
      setMsg("");
      const r = await getThreadMessages(active._id);
      setMessages(r?.data || []);
    } catch {
      toast.error("Failed to send message");
    }
  };

  const handleNewThread = async () => {
    if (!newThread.title || !newThread.subjectId) return;
    try {
      await createThread(newThread);
      toast.success("Thread created");
      setShowNew(false);
      setNewThread({ title: "", subjectId: "" });
      loadThreads();
    } catch {
      toast.error("Failed to create thread");
    }
  };

  if (active) {
    return (
      <div className="page-shell study-page">
        <button type="button" className="btn-ghost discussion-back" onClick={() => setActive(null)}>
          <ArrowLeft size={16} /> Back to threads
        </button>
        <PageHeader title={active.title} />
        <div className="chat-main">
          <div className="chat-messages">
            {messages.map((m) => (
              <div key={m._id} className="chat-message chat-message--other">
                <p className="chat-message__author">
                  {m.userId?.username || "User"}
                </p>
                <p>{m.content}</p>
              </div>
            ))}
          </div>
          <div className="chat-input-bar">
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMsg()}
              placeholder="Type a message…"
              aria-label="Message"
            />
            <button type="button" className="btn-primary" onClick={sendMsg}>
              Send
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell study-page">
      <PageHeader
        eyebrow={{ icon: MessageSquare, label: "Community" }}
        title="Discussion Room"
        description="Ask questions and discuss topics with fellow students."
        actions={
          <button type="button" className="btn-primary" onClick={() => setShowNew(!showNew)}>
            {showNew ? "Cancel" : "New Thread"}
          </button>
        }
      />

      {showNew && (
        <div className="content-card content-card--spaced">
          <div className="form-group">
            <label htmlFor="thread-title">Thread title</label>
            <input
              id="thread-title"
              placeholder="What do you want to discuss?"
              value={newThread.title}
              onChange={(e) => setNewThread((t) => ({ ...t, title: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label htmlFor="thread-subject">Subject</label>
            <CustomSelect
              id="thread-subject"
              value={newThread.subjectId}
              onChange={(e) => setNewThread((t) => ({ ...t, subjectId: e.target.value }))}
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </CustomSelect>
          </div>
          <button type="button" className="btn-primary" onClick={handleNewThread}>
            Create thread
          </button>
        </div>
      )}

      {threads.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No threads yet"
          description="Start the first discussion on a topic you are studying."
        />
      ) : (
        <div className="data-list">
          {threads.map((t) => (
            <button
              key={t._id}
              type="button"
              className="data-row"
              style={{ width: "100%", cursor: "pointer", textAlign: "left" }}
              onClick={() => openThread(t)}
            >
              <div className="data-row__main">
                <p className="data-row__title">{t.title}</p>
                <p className="data-row__sub">
                  by {t.createdBy?.username} · {t.subjectId?.name} · {t.messageCount || 0} messages
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
