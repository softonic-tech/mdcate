"use client";
import { useState, useEffect } from "react";
import {
  getFlashcards,
  getDueFlashcards,
  createFlashcard,
  updateFlashcard,
  reviewFlashcard,
  deleteFlashcard,
} from "@/api/flashcard.api";
import { getSubjectsApi } from "@/api/subject.api";
import toast from "react-hot-toast";

export default function FlashcardsPage() {
  const [cards, setCards] = useState([]);
  const [due, setDue] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [mode, setMode] = useState("all");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    front: "",
    back: "",
    subjectId: "",
  });

  // ================= LOAD =================
  const load = async () => {
  try {
    const res1 = await getFlashcards();
    const res2 = await getDueFlashcards();

    const cardsData = res1?.data?.data ?? res1?.data ?? [];
    const dueData = res2?.data?.data ?? res2?.data ?? [];

    setCards(Array.isArray(cardsData) ? cardsData : []);
    setDue(Array.isArray(dueData) ? dueData : []);
  } catch (err) {
    console.log(err);
    setCards([]);
    setDue([]);
  }
};
 
useEffect(() => {
  load();

  getSubjectsApi()
    .then((res) => {
      console.log("SUBJECT RAW:", res);

      const data =
        res?.data?.data ||   // axios + backend standard
        res?.data ||         // direct backend
        res || [];           // fallback

      setSubjects(Array.isArray(data) ? data : []);
    })
    .catch((err) => {
      console.log("Subject API error:", err);
      setSubjects([]);
    });
}, []);

  // ================= CREATE =================
const handleCreate = async () => {
  try {
    if (editId) {
      await updateFlashcard(editId, form);
      toast.success("Updated");
    } else {
      await createFlashcard(form);
      toast.success("Created");
    }

    setShowForm(false);
    setEditId(null);
    setForm({ front: "", back: "", subjectId: "" });

    load();
  } catch (err) {
    toast.error("Failed");
  }
};

  // ================= REVIEW =================
  const handleReview = async (quality) => {
    const card = due[currentIdx];
    if (!card) return;

    try {
      await reviewFlashcard(card._id, quality);

      toast.success(quality >= 3 ? "Got it!" : "Will review again");

      if (currentIdx < due.length - 1) {
        setCurrentIdx((i) => i + 1);
        setFlipped(false);
      } else {
        toast.success("Review completed!");
        setMode("all");
        setCurrentIdx(0);
        setFlipped(false);
        load();
      }
    } catch {
      toast.error("Review failed");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    try {
      await deleteFlashcard(id);
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  const inp = {
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid #334155",
    background: "#0f172a",
    color: "#e2e8f0",
    width: "100%",
  };

  // ================= REVIEW MODE =================
  if (mode === "review" && due.length > 0) {
    const card = due[currentIdx];

    return (
      <div style={{ padding: 20, maxWidth: 600 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
          Review ({currentIdx + 1}/{due.length})
        </h2>

        <div
          onClick={() => setFlipped(!flipped)}
          style={{
            background: "#1e293b",
            borderRadius: 12,
            padding: 32,
            minHeight: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 18, fontWeight: flipped ? 400 : 600 }}>
            {flipped ? card.back : card.front}
          </p>
        </div>

        <p style={{ color: "#94a3b8", textAlign: "center", marginTop: 8 }}>
          Tap to flip
        </p>

        {flipped && (
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
            <button onClick={() => handleReview(1)} style={btn("red")}>Again</button>
            <button onClick={() => handleReview(3)} style={btn("orange")}>Hard</button>
            <button onClick={() => handleReview(4)} style={btn("green")}>Good</button>
            <button onClick={() => handleReview(5)} style={btn("blue")}>Easy</button>
          </div>
        )}
      </div>
    );
  }

  // ================= UI =================
  return (
    <div style={{ padding: 20 }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Flashcards</h1>

        <div style={{ display: "flex", gap: 8 }}>
          {due.length > 0 && (
            <button
              onClick={() => {
                setMode("review");
                setCurrentIdx(0);
                setFlipped(false);
              }}
              style={primaryBtn}
            >
              Review ({due.length})
            </button>
          )}

          <button
            onClick={() => setShowForm(!showForm)}
            style={primaryBtn}
          >
            {showForm ? "Cancel" : "Add"}
          </button>
        </div>
      </div>

      {/* FORM */}
      {showForm && (
        <div style={{ background: "#1e293b", padding: 16, borderRadius: 8, marginBottom: 16 }}>
          <input
            placeholder="Front"
            value={form.front}
            onChange={(e) => setForm({ ...form, front: e.target.value })}
            style={{ ...inp, marginBottom: 8 }}
          />

          <input
            placeholder="Back"
            value={form.back}
            onChange={(e) => setForm({ ...form, back: e.target.value })}
            style={{ ...inp, marginBottom: 8 }}
          />

          <select
            value={form.subjectId}
            onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
            style={{ ...inp, marginBottom: 8 }}
          >
            <option value="">Subject</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          <button onClick={handleCreate} style={primaryBtn}>
            Save
          </button>
        </div>
      )}

      {/* CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
        {cards.map((c) => (
          <div key={c._id} style={{ background: "#1e293b", padding: 16, borderRadius: 8 }}>
            <p style={{ fontWeight: 600 }}>{c.front}</p>
            <p style={{ color: "#94a3b8", fontSize: 13 }}>{c.back}</p>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <span style={{ fontSize: 11, color: "#64748b" }}>
                Next: {c.nextReview ? new Date(c.nextReview).toLocaleDateString() : "Now"}
              </span>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
  
              {/* EDIT BUTTON */}
                <button
                  onClick={() => {
                    setForm({
                      front: c.front,
                      back: c.back,
                      subjectId: c.subjectId || "",
                    });
                    setEditId(c._id);
                    setShowForm(true);
                  }}
                  style={editBtn}
                >
                   Edit
                </button>

                {/* DELETE BUTTON */}
                <button
                  onClick={() => handleDelete(c._id)}
                  style={deleteBtn}
                >
                  Delete
                </button>

              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ================= STYLES =================
const primaryBtn = {
  padding: "8px 16px",
  borderRadius: 6,
  background: "#0ea5e9",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};

const btn = (color) => ({
  padding: "8px 16px",
  borderRadius: 6,
  background:
    color === "red"
      ? "#991b1b"
      : color === "orange"
      ? "#854d0e"
      : color === "green"
      ? "#166534"
      : "#0ea5e9",
  color: "#fff",
  border: "none",
  cursor: "pointer",
});
const editBtn = {
  padding: "6px 12px",
  borderRadius: "6px",
  background: "#18c2c2", // blue
  color: "#fff",
  border: "none",
  cursor: "pointer",
  fontSize: "12px",
  transition: "0.2s",
};

const deleteBtn = {
  padding: "6px 12px",
  borderRadius: "6px",
  background: "#267bdc", 
  color: "#fff",
  border: "none",
  cursor: "pointer",
  fontSize: "12px",
  transition: "0.2s",
};