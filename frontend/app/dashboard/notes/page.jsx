
"use client";

import { useEffect, useState } from "react";

import NotesCard from "@/components/notes/NotesCard";
import AddNoteModal from "@/components/notes/AddNoteModal";
import ViewNoteModal from "@/components/notes/ViewNoteModal";
import { toast } from "react-hot-toast";
import {
  getNotes,
  createNote,
  getNoteById,
  deleteNote,
  updateNote,
} from "@/api/notes.api";

import { getSubjectsApi } from "@/api/subject.api";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const [viewNote, setViewNote] = useState(null);
  const [editNote, setEditNote] = useState(null);

  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState({
    search: "",
    subjectId: "",
    type: "",
    page: 1,
  });

  const limit = 12;

  // ================= NORMALIZE =================
  const normalize = (res) => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data)) return res.data;
    return [];
  };
  const extractArray = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return [];
};
  // ================= SUBJECTS =================
  useEffect(() => {
  const loadSubjects = async () => {
    try {
      const res = await getSubjectsApi();

      const subjectsData = extractArray(res);

      setSubjects(subjectsData);
    } catch (err) {
      console.log("SUBJECT ERROR:", err);
      setSubjects([]);
    }
  };

  loadSubjects();
}, []);

  // ================= NOTES (FIXED SEARCH + PAGINATION + DEBOUNCE) =================
useEffect(() => {
  const timer = setTimeout(async () => {
    try {
      setLoading(true);

      const res = await getNotes({
        search: filters.search.trim(),
        subjectId: filters.subjectId,
        type: filters.type,
        page: filters.page,
        limit,
      });

      console.log("FULL RESPONSE:", res);

      const notesArray = extractArray(res);

      console.log("EXTRACTED NOTES:", notesArray);

      setNotes(notesArray);

      setTotal(res?.pagination?.total || 0);

    } catch (err) {
      console.log("GET NOTES ERROR:", err);
      setNotes([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, 400);

  return () => clearTimeout(timer);
}, [filters]);

  const totalPages = Math.ceil(total / limit);

  // ================= FIX SUBJECT NAME =================
  const getSubjectName = (note) => {
    const subject = subjects.find(
      (s) => s._id === (note.subjectId?._id || note.subjectId)
    );
    return subject?.name || "Unknown Subject";
  };

  // ================= CRUD =================
const handleSubmit = async (data) => {
  try {
    setLoading(true);

    if (editNote) {
      await updateNote(editNote._id, data);
      toast.success("Note updated");
    } else {
      await createNote(data);
      toast.success("Note created");
    }

    const res = await getNotes({
      search: filters.search.trim(),
      subjectId: filters.subjectId,
      type: filters.type,
      page: filters.page,
      limit,
    });

      if (res?.success) {
        const notesData = res?.data?.data || [];

      setNotes(notesData);
      setTotal(res?.pagination?.total || 0);
    }
    
    setOpenModal(false);
    setEditNote(null);

  } catch (err) {
    console.log(err);
    toast.error("Error saving note");
  } finally {
    setLoading(false);
  }
};

  const handleDelete = async (note) => {
    if (!confirm("Delete note?")) return;

    await deleteNote(note._id);
    setNotes((prev) => prev.filter((n) => n._id !== note._id));
  };

const handleView = async (note) => {
  try {
    const res = await getNoteById(note._id);

    const noteData =
      res?.data?.data ??
      res?.data ??
      res ??
      null;

    setViewNote(noteData);
  } catch (err) {
    console.log("VIEW ERROR:", err);
    setViewNote(null);
  }
};

  return (
    <div className="notes-page">
      
      {/* HEADER */}
      <div className="notes-header">
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: 700 }}>
            Notes Library
          </h1>
          <p style={{ color: "#9ca3af", fontSize: 14 }}>
            Manage formulas, shortcuts & summaries
          </p>
        </div>

        <button
          onClick={() => {
            setEditNote(null);
            setOpenModal(true);
          }}
          style={{
            padding: "10px 16px",
            background: "#2563eb",
            color: "#fff",
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          + Add Note
        </button>
      </div>

      {/* FILTER BAR (FIXED UI) */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 20,
          flexWrap: "wrap",
          alignItems: "center",
          background: "#0f172a",
          padding: 12,
          borderRadius: 10,
        }}
      >

        {/* SEARCH FIXED */}
        <input
          placeholder="Search notes..."
          value={filters.search}
          onChange={(e) =>
            setFilters((p) => ({
              ...p,
              search: e.target.value,
              page: 1,
            }))
          }
          style={{
            flex: 1,
            minWidth: 280,
            padding: "14px",
            borderRadius: 10,
            border: "1px solid #334155",
            background: "#1e293b",
            color: "#fff",
            fontSize: 15,
            outline: "none",
          }}
        />

        {/* SUBJECT FIX */}
        <select
          value={filters.subjectId}
          onChange={(e) =>
            setFilters((p) => ({
              ...p,
              subjectId: e.target.value,
              page: 1,
            }))
          }
          style={{
            padding: "12px",
            borderRadius: 10,
            background: "#1e293b",
            color: "#fff",
            border: "1px solid #334155",
            minWidth: 180,
          }}
        >
          <option value="">All Subjects</option>
          {subjects?.length > 0 &&
            subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
        </select>

        {/* TYPE FIX (WHITE ISSUE FIXED) */}
        <select
          value={filters.type}
          onChange={(e) =>
            setFilters((p) => ({
              ...p,
              type: e.target.value,
              page: 1,
            }))
          }
          style={{
            padding: "12px",
            borderRadius: 10,
            background: "#1e293b",
            color: "#fff",
            border: "1px solid #334155",
            minWidth: 160,
          }}
        >
          <option value="">All Types</option>
          <option value="formula">Formula</option>
          <option value="shortcut">Shortcut</option>
          <option value="summary">Summary</option>
          <option value="general">General</option>
        </select>

      </div>

      {/* NOTES GRID */}
      <div className="notes-grid" style={{ marginTop: 20 }}>
        {loading ? (
          <p>Loading...</p>
        ) : notes.length === 0 ? (
          <p>No notes found</p>
        ) : (
          notes.map((note) => (
            <NotesCard
              key={note._id}
              note={note}
              subjectName={getSubjectName(note)} // ✅ FIXED
              onView={(note) => setViewNote(note)}
              onEdit={(n) => {
                setEditNote(n);
                setOpenModal(true);
              }}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* PAGINATION FIXED */}
      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() =>
                setFilters((p) => ({
                  ...p,
                  page: i + 1,
                }))
              }
              style={{
                padding: "6px 12px",
                margin: 4,
                borderRadius: 6,
                background:
                  filters.page === i + 1 ? "#2563eb" : "#1e293b",
                color: "#fff",
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* MODALS */}
      <AddNoteModal
        open={openModal}
        note={editNote}
        subjects={subjects}
        onClose={() => {
          setOpenModal(false);
          setEditNote(null);
        }}
        onSubmit={handleSubmit}
      />

      <ViewNoteModal
        note={viewNote}
        onClose={() => setViewNote(null)}
      />

    </div>
  );
}