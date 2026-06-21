"use client";

import { useState, useEffect, useRef } from "react";
import {
  getStudyPlan,
  saveStudyPlan,
  deleteStudyPlan,
  updateStudyPlan,
} from "@/api/studyPlan.api";
import toast from "react-hot-toast";

export default function StudyPlanPage() {
  const [plans, setPlans] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const remindedRef = useRef(new Set());
  const [form, setForm] = useState({
    title: "",
    deadline: "",
  });

  const checkReminders = (list) => {
  const now = new Date();

  list.forEach((plan) => {
    if (!plan.deadline) return;

    const diff = new Date(plan.deadline) - now;
    const daysLeft = diff / (1000 * 60 * 60 * 24);

    const key = plan._id;
    if (remindedRef.current.has(key)) return;

    // 🔥 7 days left
    if (daysLeft <= 7 && daysLeft > 6) {
      toast("📌 7 days left: " + plan.title);
      remindedRef.current.add(key);
    }

    // ⚠️ 1 day left
    if (daysLeft <= 1 && daysLeft > 0) {
      toast.error("⚠️ 1 day left: " + plan.title);
      remindedRef.current.add(key);
    }

    // ⛔ expired
    if (daysLeft <= 0) {
      toast.error("⛔ Deadline passed: " + plan.title);
      remindedRef.current.add(key);
    }
  });
};
  // ================= LOAD =================
  const load = async () => {
    try {
      const res = await getStudyPlan();
      const data = res?.data?.data ?? res?.data ?? [];
      setPlans(Array.isArray(data) ? data : []);
      checkReminders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
      setPlans([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // close dropdown on outside click
  useEffect(() => {
    const close = () => setMenuOpen(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);
  useEffect(() => {
  const interval = setInterval(() => {
    if (plans.length) {
      checkReminders(plans);
    }
  }, 60000); // every 1 min

  return () => clearInterval(interval);
}, [plans]);

  // ================= CREATE =================
  const openCreate = () => {
    setForm({ title: "", deadline: "" });
    setEditId(null);
    setOpen(true);
  };

  // ================= EDIT =================
  const openEdit = (plan) => {
    setForm({
      title: plan.title,
      deadline: plan.deadline?.split("T")[0],
    });
    setEditId(plan._id);
    setOpen(true);
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (editId) {
        await updateStudyPlan(editId, form);
        toast.success("Updated");
      } else {
        await saveStudyPlan(form);
        toast.success("Created");
      }

      setOpen(false);
      setEditId(null);
      setForm({ title: "", deadline: "" });
      load();
    } catch (err) {
      console.log(err.response?.data || err);
      toast.error(err.response?.data?.message || "Failed");
    }finally {
      setLoading(false);
    }
  };

  // ================= DELETE =================
  const removePlan = async (id) => {
    try {
      await deleteStudyPlan(id);
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  // ================= COMPLETE TOGGLE =================
  const toggleComplete = async (p) => {
    try {
      const newStatus =
        p.status === "completed" ? "pending" : "completed";

      await updateStudyPlan(p._id, { status: newStatus });
      toast.success("Updated");
      load();
    } catch {
      toast.error("Update failed");
    }
  };

  // ================= DAYS LEFT =================
  const getDaysLeft = (date) => {
    const diff = new Date(date) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div style={page}>
      {/* HEADER */}
      <div style={header}>
        <div>
          <h1>📚 Study Planner</h1>
          <p style={{ color: "#94a3b8" }}>
            Manage your tasks smartly
          </p>
        </div>

        <button onClick={openCreate} style={addBtn}>
          + Add Plan
        </button>
      </div>

      {/* CARDS */}
      <div style={grid}>
        {plans.length === 0 ? (
          <div style={emptyBox}>
            <h2>No Study Plans</h2>
            <button onClick={openCreate} style={addBtn}>
              Create Plan
            </button>
          </div>
        ) : (
          plans.map((p) => {
            const days = getDaysLeft(p.deadline);
            const isExpired = new Date(p.deadline) < new Date();

            const status =
              p.status === "completed"
                ? "completed"
                : isExpired
                ? "expired"
                : "pending";

            return (
              <div
                key={p._id}
                style={{ ...card, position: "relative" }}
              >
                {/* TOP */}
                <div style={topRow}>
                  <h3>{p.title}</h3>

                  {/* 3 DOT */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(menuOpen === p._id ? null : p._id);
                    }}
                    style={dotBtn}
                  >
                    ⋮
                  </button>

                  {/* MENU */}
                  {menuOpen === p._id && (
                    <div style={dropdown}>
                      <button
                        style={menuItem}
                        onClick={() => {
                          openEdit(p);
                          setMenuOpen(null);
                        }}
                      >
                        ✏️ Edit
                      </button>

                      <button
                        style={menuItem}
                        onClick={() => {
                          toggleComplete(p);
                          setMenuOpen(null);
                        }}
                      >
                        {p.status === "completed"
                          ? "↩ Undo"
                          : "✔ Complete"}
                      </button>

                      <button
                        style={{ ...menuItem, color: "red" }}
                        onClick={() => {
                          removePlan(p._id);
                          setMenuOpen(null);
                        }}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* DATE */}
                <p>📅 {new Date(p.deadline).toLocaleDateString()}</p>

                {/* DAYS LEFT */}
                <p style={{ color: days < 0 ? "red" : "green" }}>
                  {days < 0
                    ? `${Math.abs(days)} days overdue`
                    : `${days} days left`}
                </p>

                {/* STATUS BADGE */}
                <p
                  style={{
                    display: "inline-block",
                    padding: "4px 10px",
                    borderRadius: 20,
                    fontSize: 12,
                    color: "#fff",
                    marginTop: 8,
                    background:
                      status === "completed"
                        ? "#14532d"
                        : status === "expired"
                        ? "#7f1d1d"
                        : "#78350f",
                  }}
                >
                  {status}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL */}
      {open && (
        <div style={overlay}>
          <form onSubmit={handleSubmit} style={modal}>
            <h2>{editId ? "Update Plan" : "Create Plan"}</h2>

            <input
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              placeholder="Title"
              style={input}
            />

            <input
              type="date"
              value={form.deadline}
              onChange={(e) =>
                setForm({ ...form, deadline: e.target.value })
              }
              style={input}
            />

            <div style={btnRow}>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={cancelBtn}
              >
                Cancel
              </button>

              <button type="submit" style={saveBtn}>
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ========== STYLES ========== */

const page = { padding: 24, maxWidth: 1000, margin: "0 auto" };

const header = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 20,
};

const addBtn = {
  background: "#0ea5e9",
  border: "none",
  padding: "10px 16px",
  borderRadius: 8,
  color: "#fff",
  cursor: "pointer",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 12,
};

const card = {
  background: "#0f172a",
  padding: 16,
  borderRadius: 12,
  color: "#fff",
};

const topRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const dotBtn = {
  background: "transparent",
  border: "none",
  color: "#fff",
  fontSize: 22,
  cursor: "pointer",
};

const dropdown = {
  position: "absolute",
  right: 10,
  top: 35,
  background: "#1e293b",
  border: "1px solid #334155",
  borderRadius: 8,
  width: 140,
  display: "flex",
  flexDirection: "column",
  zIndex: 999,
};

const menuItem = {
  padding: "10px",
  background: "transparent",
  border: "none",
  color: "#fff",
  textAlign: "left",
  cursor: "pointer",
};

const emptyBox = {
  gridColumn: "1 / -1",
  textAlign: "center",
  padding: 40,
  border: "1px dashed #334155",
  borderRadius: 12,
  color: "#94a3b8",
};

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modal = {
  background: "#0f172a",
  padding: 20,
  borderRadius: 12,
  width: 400,
};

const input = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
};

const btnRow = {
  display: "flex",
  gap: 10,
};

const cancelBtn = {
  flex: 1,
  padding: 10,
  background: "#334155",
  border: "none",
  color: "#fff",
};

const saveBtn = {
  flex: 1,
  padding: 10,
  background: "#0ea5e9",
  border: "none",
  color: "#fff",
};