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
import { Layers } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import { CustomSelect } from "@/components/dashboard/CustomSelect";
import EmptyState from "@/components/dashboard/EmptyState";
import { StatStrip, FilterPills } from "@/components/dashboard/StudyPageUI";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";

const FLASHCARD_MODE_OPTIONS = [
  { value: "all", label: "All Cards" },
  { value: "review", label: "Review Due" },
];

export default function FlashcardsPage() {
  const [cards, setCards] = useState([]);
  const [due, setDue] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [mode, setMode] = useState("all");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ front: "", back: "", subjectId: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      const res1 = await getFlashcards();
      const res2 = await getDueFlashcards();
      const cardsData = res1?.data?.data ?? res1?.data ?? [];
      const dueData = res2?.data?.data ?? res2?.data ?? [];
      setCards(Array.isArray(cardsData) ? cardsData : []);
      setDue(Array.isArray(dueData) ? dueData : []);
    } catch {
      setCards([]);
      setDue([]);
    }
  };

  useEffect(() => {
    load();
    getSubjectsApi()
      .then((res) => {
        const data = res?.data?.data || res?.data || res || [];
        setSubjects(Array.isArray(data) ? data : []);
      })
      .catch(() => setSubjects([]));
  }, []);

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
    } catch {
      toast.error("Failed");
    }
  };

  const handleReview = async (quality) => {
    const card = due[currentIdx];
    if (!card) return;
    try {
      await reviewFlashcard(card._id, quality);
      if (currentIdx < due.length - 1) {
        setCurrentIdx((i) => i + 1);
        setFlipped(false);
      } else {
        toast.success("Review completed");
        setMode("all");
        setCurrentIdx(0);
        setFlipped(false);
        load();
      }
    } catch {
      toast.error("Review failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteFlashcard(deleteTarget);
      toast.success("Deleted");
      setDeleteTarget(null);
      load();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (mode === "review" && due.length > 0) {
    const card = due[currentIdx];
    return (
      <div className="page-shell study-page">
        <PageHeader title={`Review (${currentIdx + 1}/${due.length})`} />
        <div className="flashcard-progress">
          {due.map((_, i) => (
            <span
              key={i}
              className={`flashcard-progress__dot ${i === currentIdx ? "flashcard-progress__dot--active" : ""}`}
            />
          ))}
        </div>
        <div className="flashcard-review" onClick={() => setFlipped(!flipped)} role="button" tabIndex={0}>
          <span className="flashcard-review__label">{flipped ? "Answer" : "Question"}</span>
          <p className="flashcard-review__text">{flipped ? card.back : card.front}</p>
        </div>
        <p className="text-muted text-center mt-sm">
          Tap card to flip
        </p>
        {flipped && (
          <div className="flashcard-actions">
            <button type="button" className="btn-danger btn-ghost" onClick={() => handleReview(1)}>Again</button>
            <button type="button" className="btn-ghost" onClick={() => handleReview(3)}>Hard</button>
            <button type="button" className="btn-primary" onClick={() => handleReview(4)}>Good</button>
            <button type="button" className="btn-ghost" onClick={() => handleReview(5)}>Easy</button>
          </div>
        )}
        <button type="button" className="btn-ghost mt-md" onClick={() => setMode("all")}>
          Exit review
        </button>
      </div>
    );
  }

  return (
    <div className="page-shell study-page">
      <PageHeader
        eyebrow={{ icon: Layers, label: "Spaced repetition" }}
        title="Flashcards"
        description="Create cards and review them on a smart schedule."
        actions={
          <button type="button" className="btn-ghost" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Add Card"}
          </button>
        }
      />

      {cards.length > 0 && (
        <StatStrip
          items={[
            { label: "Total cards", value: cards.length },
            { label: "Due today", value: due.length, accent: due.length > 0 },
          ]}
        />
      )}

      <FilterPills
        label="View"
        icon={Layers}
        options={FLASHCARD_MODE_OPTIONS}
        value={mode}
        onChange={(val) => {
          if (val === "review" && due.length === 0) return;
          if (val === "review") {
            setMode("review");
            setCurrentIdx(0);
            setFlipped(false);
          } else {
            setMode("all");
          }
        }}
        ariaLabel="Flashcard view mode"
      />

      {showForm && (
        <div className="content-card content-card--spaced">
          <div className="form-group">
            <label htmlFor="fc-front">Front</label>
            <input id="fc-front" value={form.front} onChange={(e) => setForm({ ...form, front: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="fc-back">Back</label>
            <input id="fc-back" value={form.back} onChange={(e) => setForm({ ...form, back: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="fc-subject">Subject</label>
            <CustomSelect
              id="fc-subject"
              value={form.subjectId}
              onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </CustomSelect>
          </div>
          <button type="button" className="btn-primary" onClick={handleCreate}>
            Save
          </button>
        </div>
      )}

      {cards.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No flashcards yet"
          description="Add your first card to start reviewing."
        />
      ) : (
        <div className="item-grid">
          {cards.map((c) => (
            <div key={c._id} className="item-card">
              <div className="item-card__body">
                <h3>{c.front}</h3>
                <p className="item-card__desc">{c.back}</p>
                <p className="item-card__meta">
                  Next review: {c.nextReview ? new Date(c.nextReview).toLocaleDateString() : "Now"}
                </p>
                <div className="item-card__actions">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => {
                      setForm({ front: c.front, back: c.back, subjectId: c.subjectId || "" });
                      setEditId(c._id);
                      setShowForm(true);
                    }}
                  >
                    Edit
                  </button>
                  <button type="button" className="btn-danger btn-ghost" onClick={() => setDeleteTarget(c._id)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete flashcard?"
        message="This card will be permanently removed from your deck."
        confirmLabel="Delete"
        cancelLabel="Keep card"
        loading={deleting}
      />
    </div>
  );
}
