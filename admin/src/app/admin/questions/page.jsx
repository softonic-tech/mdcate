"use client";

import { useState, useCallback } from "react";
import DataTable from "@/components/tables/DataTable";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StatusBadge from "@/components/ui/StatusBadge";
import { FormInput, FormTextarea, FormSelect, FormCheckbox } from "@/components/forms/FormFields";
import { questionHooks, subjectHooks, useChaptersBySubject, useBulkCreateQuestions } from "@/hooks/useResource";
import useForm from "@/hooks/useForm";
import { Plus, Upload, X } from "lucide-react";
import { getName, formatDate, truncate } from "@/lib/utils";
import { DIFFICULTIES } from "@/lib/constants";

export default function QuestionsPage() {
  const [modal, setModal] = useState({ open: false, mode: "create", item: null });
  const [bulkModal, setBulkModal] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [bulkJson, setBulkJson] = useState("");
  const [filterSubject, setFilterSubject] = useState("");

  const questions = questionHooks.useList({ subjectId: filterSubject || undefined });
  const subjects = subjectHooks.useList();
  const createMut = questionHooks.useCreate();
  const updateMut = questionHooks.useUpdate();
  const removeMut = questionHooks.useRemove();
  const bulkMut = useBulkCreateQuestions();

  const { values, handleChange, setField, reset } = useForm({
    text: "", options: ["", ""], correctAnswer: 0, explanation: "",
    subjectId: "", chapterId: "", difficulty: "medium", tags: [],
    isPastPaper: false, paperYear: "",
  });

  const [tagInput, setTagInput] = useState("");
  const chapters = useChaptersBySubject(values.subjectId);
  const subjectOptions = (subjects.data?.data || []).map((s) => ({ value: s._id, label: `${s.name} (${s.board})` }));
  const chapterOptions = (chapters.data?.data || []).map((c) => ({ value: c._id, label: c.name }));

  const openCreate = () => {
    reset({ text: "", options: ["", ""], correctAnswer: 0, explanation: "", subjectId: "", chapterId: "", difficulty: "medium", tags: [], isPastPaper: false, paperYear: "" });
    setModal({ open: true, mode: "create", item: null });
  };

  const openEdit = (row) => {
    reset({
      text: row.text,
      options: [...row.options],
      correctAnswer: row.correctAnswer,
      explanation: row.explanation || "",
      subjectId: typeof row.subjectId === "object" ? row.subjectId._id : row.subjectId,
      chapterId: typeof row.chapterId === "object" ? row.chapterId._id : row.chapterId,
      difficulty: row.difficulty,
      tags: row.tags || [],
      isPastPaper: row.isPastPaper || false,
      paperYear: row.paperYear || "",
    });
    setModal({ open: true, mode: "edit", item: row });
  };

  const closeModal = () => setModal({ open: false, mode: "create", item: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...values,
      correctAnswer: Number(values.correctAnswer),
      paperYear: values.paperYear ? Number(values.paperYear) : null,
      options: values.options.filter(Boolean),
    };
    try {
      if (modal.mode === "create") await createMut.mutateAsync(payload);
      else await updateMut.mutateAsync({ id: modal.item._id, data: payload });
      closeModal();
    } catch {}
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(bulkJson);
      await bulkMut.mutateAsync(Array.isArray(parsed) ? parsed : [parsed]);
      setBulkModal(false);
      setBulkJson("");
    } catch (err) {
      if (err instanceof SyntaxError) {
        alert("Invalid JSON format");
      }
    }
  };

  const addOption = () => setField("options", [...values.options, ""]);
  const removeOption = (idx) => setField("options", values.options.filter((_, i) => i !== idx));
  const updateOption = (idx, val) => {
    const opts = [...values.options];
    opts[idx] = val;
    setField("options", opts);
  };

  const diffVariant = { easy: "success", medium: "warning", hard: "danger" };

  const columns = [
    { key: "text", label: "Question", render: (row) => <span title={row.text}>{truncate(row.text, 50)}</span> },
    { key: "subjectId", label: "Subject", render: (row) => getName(row.subjectId) },
    { key: "chapterId", label: "Chapter", render: (row) => getName(row.chapterId) },
    {
      key: "difficulty", label: "Difficulty",
      render: (row) => <StatusBadge variant={diffVariant[row.difficulty]}>{row.difficulty}</StatusBadge>,
    },
    { key: "options", label: "Options", render: (row) => row.options?.length || 0 },
    { key: "isPastPaper", label: "Past Paper", render: (row) => row.isPastPaper ? <StatusBadge variant="info">Yes</StatusBadge> : "—" },
    {
      key: "_actions", label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="btn-ghost btn-sm text-primary">Edit</button>
          <button onClick={() => setConfirm({ open: true, id: row._id })} className="btn-ghost btn-sm text-danger">Delete</button>
        </div>
      ),
    },
  ];

  const items = (questions.data?.data || []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Questions</h1>
        <div className="flex gap-2">
          <button onClick={() => setBulkModal(true)} className="btn-secondary">
            <Upload size={16} /> Bulk Import
          </button>
          <button onClick={openCreate} className="btn-primary">
            <Plus size={16} /> Add Question
          </button>
        </div>
      </div>

      <div className="mb-4 max-w-sm">
        <FormSelect name="filterSubject" value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} options={subjectOptions} placeholder="Filter by subject" />
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={questions.isLoading}
        error={questions.error}
        onRetry={questions.refetch}
        pagination={questions.data?.pagination ? { page: questions.data.pagination.page, totalPages: questions.data.pagination.totalPages, onPageChange: () => {} } : undefined}
      />

      {/* Create/Edit Modal */}
      <Modal open={modal.open} onClose={closeModal} title={modal.mode === "create" ? "Add Question" : "Edit Question"} size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormTextarea label="Question Text" name="text" value={values.text} onChange={handleChange} required rows={3} />

          <div className="grid grid-cols-2 gap-4">
            <FormSelect label="Subject" name="subjectId" value={values.subjectId} onChange={handleChange} required options={subjectOptions} placeholder="Select subject" />
            <FormSelect label="Chapter" name="chapterId" value={values.chapterId} onChange={handleChange} required options={chapterOptions} placeholder={values.subjectId ? "Select chapter" : "Select subject first"} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormSelect label="Difficulty" name="difficulty" value={values.difficulty} onChange={handleChange} options={DIFFICULTIES} />
            <FormInput label="Correct Answer (index)" name="correctAnswer" type="number" value={values.correctAnswer} onChange={handleChange} required />
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Options</label>
            <div className="space-y-2">
              {values.options.map((opt, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${Number(values.correctAnswer) === idx ? "bg-success text-white" : "bg-surface-alt text-text-muted"}`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <input value={opt} onChange={(e) => updateOption(idx, e.target.value)} className="input-base flex-1" placeholder={`Option ${idx + 1}`} required />
                  {values.options.length > 2 && (
                    <button type="button" onClick={() => removeOption(idx)} className="text-danger"><X size={16} /></button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addOption} className="btn-ghost btn-sm mt-2 text-primary">+ Add Option</button>
          </div>

          <FormTextarea label="Explanation" name="explanation" value={values.explanation} onChange={handleChange} rows={2} />

          <div className="grid grid-cols-2 gap-4">
            <FormCheckbox label="Past Paper Question" name="isPastPaper" checked={values.isPastPaper} onChange={handleChange} />
            {values.isPastPaper && (
              <FormInput label="Paper Year" name="paperYear" type="number" value={values.paperYear} onChange={handleChange} placeholder="e.g. 2023" />
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Tags</label>
            <div className="flex gap-2 mb-2">
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} className="input-base flex-1" placeholder="Add tag..." />
              <button type="button" onClick={() => { if (tagInput.trim()) { setField("tags", [...values.tags, tagInput.trim()]); setTagInput(""); } }} className="btn-secondary btn-sm">Add</button>
            </div>
            <div className="flex flex-wrap gap-1">
              {values.tags.map((t, i) => (
                <span key={i} className="badge-status bg-gray-100 text-gray-700 gap-1">
                  {t} <button type="button" onClick={() => setField("tags", values.tags.filter((_, j) => j !== i))}><X size={10} /></button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={closeModal} className="btn-secondary btn-sm">Cancel</button>
            <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="btn-primary btn-sm">
              {createMut.isPending || updateMut.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Bulk Import Modal */}
      <Modal open={bulkModal} onClose={() => setBulkModal(false)} title="Bulk Import Questions" size="lg">
        <form onSubmit={handleBulkSubmit} className="space-y-4">
          <p className="text-sm text-text-secondary">Paste a JSON array of questions. Each question needs: text, options, correctAnswer, subjectId, chapterId.</p>
          <FormTextarea name="bulkJson" value={bulkJson} onChange={(e) => setBulkJson(e.target.value)} rows={12} placeholder='[{ "text": "...", "options": [...], "correctAnswer": 0, "subjectId": "...", "chapterId": "..." }]' />
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={() => setBulkModal(false)} className="btn-secondary btn-sm">Cancel</button>
            <button type="submit" disabled={bulkMut.isPending} className="btn-primary btn-sm">
              {bulkMut.isPending ? "Importing..." : "Import"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null })}
        onConfirm={async () => { await removeMut.mutateAsync(confirm.id); setConfirm({ open: false, id: null }); }}
        loading={removeMut.isPending}
      />
    </div>
  );
}
