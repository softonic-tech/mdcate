"use client";
import { useState, useEffect } from "react";
import { createContactMessage, getContactMessages } from "@/api/contact.api";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);

  const [form, setForm] = useState({
    email: "",
    subject: "",
    message: "",
  });

  const load = () => {
    getContactMessages()
      .then((r) => setMsgs(r?.data || []))
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const handleSend = async () => {
    if (!form.email || !form.subject || !form.message)
      return toast.error("Fill all fields");

    try {
      await createContactMessage(form);

      toast.success("Message sent ✅");

      setForm({ email: "", subject: "", message: "" });
      setOpen(false);
      load();
    } catch {
      toast.error("Failed to send");
    }
  };

  return (
    <div style={container}>
      {/* HEADER */}
      <div style={header}>
        <h1 style={title}>Support Center</h1>

        <button style={primaryBtn} onClick={() => setOpen(true)}>
          📩 Contact Support
        </button>
      </div>

      {/* MESSAGES */}
      <div style={{ marginTop: 20 }}>
        <h3 style={sectionTitle}>Your Messages</h3>

        {msgs.length === 0 ? (
          <p style={{ color: "#64748b" }}>No messages yet</p>
        ) : (
          <div style={grid}>
            {msgs.map((m) => (
              <div key={m._id} style={card}>
                <div style={row}>
                  <p style={subject}>{m.subject}</p>

                  <span
                    style={{
                      ...badge,
                      background:
                        m.status === "resolved"
                          ? "#065f46"
                          : "#78350f",
                    }}
                  >
                    {m.status}
                  </span>
                </div>

                <p style={msg}>{m.message}</p>

                {m.response && (
                  <div style={reply}>
                    💬 {m.response}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {open && (
        <div style={overlay}>
          <div style={modal}>
            <h2 style={{ marginBottom: 10 }}>Send Message</h2>

            <input
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              style={input}
            />

            <input
              placeholder="Subject"
              value={form.subject}
              onChange={(e) =>
                setForm({ ...form, subject: e.target.value })
              }
              style={input}
            />

            <textarea
              placeholder="Your message..."
              value={form.message}
              onChange={(e) =>
                setForm({ ...form, message: e.target.value })
              }
              rows={4}
              style={input}
            />

            <div style={btnRow}>
              <button style={cancelBtn} onClick={() => setOpen(false)}>
                Cancel
              </button>

              <button style={primaryBtn} onClick={handleSend}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const container = {
  padding: 24,
  maxWidth: 900,
  margin: "0 auto",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const title = {
  fontSize: 26,
  fontWeight: 700,
};

const sectionTitle = {
  fontSize: 18,
  fontWeight: 600,
  marginBottom: 10,
};

const grid = {
  display: "grid",
  gap: 12,
};

const card = {
  background: "#1e293b",
  padding: 14,
  borderRadius: 10,
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const subject = {
  fontWeight: 600,
};

const badge = {
  padding: "3px 8px",
  borderRadius: 6,
  fontSize: 11,
  color: "#fff",
};

const msg = {
  marginTop: 6,
  color: "#cbd5f5",
};

const reply = {
  marginTop: 10,
  background: "#020617",
  padding: 8,
  borderRadius: 6,
  fontSize: 13,
};

const primaryBtn = {
  padding: "8px 16px",
  borderRadius: 8,
  background: "#0ea5e9",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};

const cancelBtn = {
  padding: "8px 16px",
  borderRadius: 8,
  background: "#334155",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};

const input = {
  width: "100%",
  padding: "10px",
  borderRadius: 8,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#fff",
  marginBottom: 10,
};

const btnRow = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 8,
};

const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modal = {
  background: "#1e293b",
  padding: 20,
  borderRadius: 12,
  width: 400,
};