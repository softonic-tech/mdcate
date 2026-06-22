
"use client";

import { useEffect, useState, useRef } from "react";

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
import { StickyNote } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import { SkeletonCardGrid, SkeletonMeta } from "@/components/dashboard/Skeleton";
import {
  FilterPanel,
  FilterField,
  FilterRow,
  ListMeta,
  PaginationBar,
} from "@/components/dashboard/StudyPageUI";
import { usePageSearch } from "@/hooks/usePageSearch";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import { BookOpen, Tag } from "lucide-react";

export default function NotesPage() {
  const { query, clearQuery } = usePageSearch("Search notes…");
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const [viewNote, setViewNote] = useState(null);
  const [editNote, setEditNote] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState({
    subjectId: "",
    type: "",
    page: 1,
  });
  const prevQueryRef = useRef(query);

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
  if (prevQueryRef.current !== query) {
    prevQueryRef.current = query;
    setFilters((p) => ({ ...p, page: 1 }));
    return;
  }

  const timer = setTimeout(async () => {
    try {
      setLoading(true);

      const res = await getNotes({
        search: query.trim(),
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
}, [filters, query]);

  const totalPages = Math.ceil(total / limit);
  const pageStart = total ? (filters.page - 1) * limit + 1 : 0;
  const pageEnd = Math.min(filters.page * limit, total);
  const hasActiveFilters = Boolean(query.trim() || filters.subjectId || filters.type);

  const clearFilters = () => {
    clearQuery();
    setFilters({ subjectId: "", type: "", page: 1 });
  };

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
      search: query.trim(),
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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteNote(deleteTarget._id);
      setNotes((prev) => prev.filter((n) => n._id !== deleteTarget._id));
      toast.success("Note deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete note");
    } finally {
      setDeleting(false);
    }
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
    <div className="page-shell study-page">
      <PageHeader
        eyebrow={{ icon: StickyNote, label: "Notes" }}
        title="Notes Library"
        description="Manage formulas, shortcuts, and summaries."
        actions={
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setEditNote(null);
              setOpenModal(true);
            }}
          >
            Add Note
          </button>
        }
      />

      <FilterPanel hasActiveFilters={hasActiveFilters} onClear={clearFilters} ariaLabel="Filter notes">
        <FilterRow>
          <FilterField label="Subject" icon={BookOpen}>
            <select
              value={filters.subjectId}
              onChange={(e) => setFilters((p) => ({ ...p, subjectId: e.target.value, page: 1 }))}
              aria-label="Subject"
            >
              <option value="">All subjects</option>
              {subjects?.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Type" icon={Tag}>
            <select
              value={filters.type}
              onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value, page: 1 }))}
              aria-label="Note type"
            >
              <option value="">All types</option>
              <option value="formula">Formula</option>
              <option value="shortcut">Shortcut</option>
              <option value="summary">Summary</option>
              <option value="general">General</option>
            </select>
          </FilterField>
        </FilterRow>
      </FilterPanel>

      {loading ? <SkeletonMeta /> : notes.length > 0 ? (
        <ListMeta start={pageStart} end={pageEnd} total={total} label="notes" />
      ) : null}

      {loading ? (
        <SkeletonCardGrid count={6} />
      ) : (
      <div className="item-grid">
        {notes.length === 0 ? (
          <EmptyState
            icon={StickyNote}
            title="No notes found"
            description="Try different filters or add a new note."
            className="span-full"
          />
        ) : (
          notes.map((note) => (
            <NotesCard
              key={note._id}
              note={note}
              subjectName={getSubjectName(note)}
              onView={(n) => setViewNote(n)}
              onEdit={(n) => {
                setEditNote(n);
                setOpenModal(true);
              }}
              onDelete={(n) => setDeleteTarget(n)}
            />
          ))
        )}
      </div>
      )}

      <PaginationBar
        page={filters.page}
        totalPages={totalPages}
        onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
      />

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

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete note?"
        message={
          deleteTarget
            ? `"${deleteTarget.title}" will be permanently removed. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Keep note"
        loading={deleting}
      />

    </div>
  );
}