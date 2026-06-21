"use client";

import { useState } from "react";
import DataTable from "@/components/tables/DataTable";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { FormInput, FormTextarea, FormSelect } from "@/components/forms/FormFields";
import { subjectHooks, useChaptersBySubject, useCreateChapter, useUpdateChapter, useDeleteChapter } from "@/hooks/useResource";
import useForm from "@/hooks/useForm";
import { Plus, X } from "lucide-react";
import { getName, formatDate } from "@/lib/utils";

export default function ChaptersPage() {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [modal, setModal] = useState({ open: false, mode: "create", item: null });
  const [confirm, setConfirm] = useState({ open: false, id: null });

  const subjects = subjectHooks.useList();
  const chapters = useChaptersBySubject(selectedSubject);
  const createMut = useCreateChapter();
  const updateMut = useUpdateChapter();
  const deleteMut = useDeleteChapter();

  const { values, handleChange, setField, reset } = useForm({
    name: "", subjectId: "", summary: "", highYieldPoints: [],
  });

  const [hypInput, setHypInput] = useState("");

  const subjectOptions = (subjects.data?.data || []).map((s) => ({ value: s._id, label: `${s.name} (${s.board})` }));

  const openCreate = () => {
    reset({ name: "", subjectId: selectedSubject, summary: "", highYieldPoints: [] });
    setModal({ open: true, mode: "create", item: null });
  };

  const openEdit = (row) => {
    reset({
      name: row.name,
      subjectId: typeof row.subjectId === "object" ? row.subjectId._id : row.subjectId,
      summary: row.summary || "",
      highYieldPoints: row.highYieldPoints || [],
    });
    setModal({ open: true, mode: "edit", item: row });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name: values.name, subjectId: values.subjectId, summary: values.summary, highYieldPoints: values.highYieldPoints };
    try {
      if (modal.mode === "create") await createMut.mutateAsync(payload);
      else await updateMut.mutateAsync({ id: modal.item._id, data: payload });
      setModal({ open: false, mode: "create", item: null });
    } catch {}
  };

  const addHYP = () => {
    if (hypInput.trim()) {
      setField("highYieldPoints", [...values.highYieldPoints, hypInput.trim()]);
      setHypInput("");
    }
  };

  const removeHYP = (idx) => {
    setField("highYieldPoints", values.highYieldPoints.filter((_, i) => i !== idx));
  };

  const columns = [
    { key: "name", label: "Chapter Name" },
    { key: "subjectId", label: "Subject", render: (row) => getName(row.subjectId) },
    { key: "highYieldPoints", label: "HY Points", render: (row) => row.highYieldPoints?.length || 0 },
    { key: "createdAt", label: "Created", render: (row) => formatDate(row.createdAt) },
    {
      key: "_actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="btn-ghost btn-sm text-primary">Edit</button>
          <button onClick={() => setConfirm({ open: true, id: row._id })} className="btn-ghost btn-sm text-danger">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Chapters</h1>
        <button onClick={openCreate} className="btn-primary" disabled={!selectedSubject}>
          <Plus size={16} /> Add Chapter
        </button>
      </div>

      <div className="mb-4 max-w-sm">
        <FormSelect
          label="Filter by Subject"
          name="selectedSubject"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          options={subjectOptions}
          placeholder="Select a subject first"
        />
      </div>

      {selectedSubject ? (
        <DataTable
          columns={columns}
          data={chapters.data?.data || []}
          loading={chapters.isLoading}
          error={chapters.error}
          onRetry={chapters.refetch}
          emptyMessage="No chapters for this subject"
        />
      ) : (
        <div className="card p-10 text-center text-text-muted text-sm">
          Select a subject above to view its chapters
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, mode: "create", item: null })}
        title={modal.mode === "create" ? "Add Chapter" : "Edit Chapter"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput label="Chapter Name" name="name" value={values.name} onChange={handleChange} required />
          <FormSelect label="Subject" name="subjectId" value={values.subjectId} onChange={handleChange} required options={subjectOptions} placeholder="Select subject" />
          <FormTextarea label="Summary" name="summary" value={values.summary} onChange={handleChange} rows={3} />

          {/* High Yield Points */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">High Yield Points</label>
            <div className="flex gap-2 mb-2">
              <input value={hypInput} onChange={(e) => setHypInput(e.target.value)} className="input-base flex-1" placeholder="Add a point..." />
              <button type="button" onClick={addHYP} className="btn-secondary btn-sm">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {values.highYieldPoints.map((p, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-blue-50 text-primary text-xs px-2 py-1 rounded-lg">
                  {p}
                  <button type="button" onClick={() => removeHYP(i)}><X size={12} /></button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={() => setModal({ open: false, mode: "create", item: null })} className="btn-secondary btn-sm">Cancel</button>
            <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="btn-primary btn-sm">
              {createMut.isPending || updateMut.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null })}
        onConfirm={async () => { await deleteMut.mutateAsync(confirm.id); setConfirm({ open: false, id: null }); }}
        loading={deleteMut.isPending}
      />
    </div>
  );
}
