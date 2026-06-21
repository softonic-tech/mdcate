"use client";

import { useState } from "react";
import DataTable from "@/components/tables/DataTable";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { FormInput, FormSelect, FormFile } from "@/components/forms/FormFields";
import { bookHooks, subjectHooks } from "@/hooks/useResource";
import useForm from "@/hooks/useForm";
import { Plus } from "lucide-react";
import { getName, formatDate } from "@/lib/utils";
import { BOARDS } from "@/lib/constants";
import StatusBadge from "@/components/ui/StatusBadge";
import { presignBookUploads } from "@/lib/s3DirectUpload";
import Spinner from "@/components/ui/Spinner";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/lib/errors";

async function putToS3(uploadUrl, file, contentType) {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": contentType },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Upload failed (${res.status})`);
  }
}

export default function BooksPage() {
  const [modal, setModal] = useState({ open: false, mode: "create", item: null });
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [saving, setSaving] = useState(false);

  const books = bookHooks.useList();
  const subjects = subjectHooks.useList();
  const createMut = bookHooks.useCreate();
  const updateMut = bookHooks.useUpdate();
  const removeMut = bookHooks.useRemove();

  const { values, handleChange, reset } = useForm({
    title: "", subjectId: "", board: "", coverImage: null, file: null,
  });

  const subjectOptions = (subjects.data?.data || []).map((s) => ({ value: s._id, label: `${s.name} (${s.board})` }));

  const closeModal = () => {
    setSaving(false);
    setModal({ open: false, mode: "create", item: null });
  };

  const isSubmitting = saving || createMut.isPending || updateMut.isPending;

  const handleModalClose = () => {
    if (isSubmitting) return;
    closeModal();
  };

  const openCreate = () => {
    reset({ title: "", subjectId: "", board: "", coverImage: null, file: null });
    setModal({ open: true, mode: "create", item: null });
  };

  const openEdit = (row) => {
    reset({
      title: row.title,
      subjectId: typeof row.subjectId === "object" ? row.subjectId._id : row.subjectId,
      board: row.board,
      coverImage: null,
      file: null,
    });
    setModal({ open: true, mode: "edit", item: row });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (modal.mode === "create" && !values.file) {
      toast.error("PDF file is required");
      return;
    }

    setSaving(true);
    try {
      let fileUrl = modal.mode === "edit" ? modal.item.fileUrl || "" : "";
      let coverImage = modal.mode === "edit" ? modal.item.coverImage || "" : "";

      const presignPayload = {};
      if (values.file) presignPayload.pdfFileName = values.file.name;
      if (values.coverImage) presignPayload.coverContentType = values.coverImage.type;

      if (Object.keys(presignPayload).length > 0) {
        const presignRes = await presignBookUploads(presignPayload);
        const p = presignRes.data;

        if (values.file && p?.pdf) {
          await putToS3(p.pdf.uploadUrl, values.file, p.pdf.contentType);
          fileUrl = p.pdf.fileUrl;
        }
        if (values.coverImage && p?.cover) {
          await putToS3(p.cover.uploadUrl, values.coverImage, p.cover.contentType);
          coverImage = p.cover.fileUrl;
        }
      }

      if (modal.mode === "create" && !fileUrl) {
        toast.error("Could not upload PDF");
        return;
      }

      const payload = {
        title: values.title,
        subjectId: values.subjectId,
        board: values.board,
        fileUrl,
        coverImage: coverImage || "",
      };

      if (modal.mode === "create") {
        await createMut.mutateAsync(payload);
      } else {
        await updateMut.mutateAsync({ id: modal.item._id, data: payload });
      }
      closeModal();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "title", label: "Title" },
    { key: "subjectId", label: "Subject", render: (row) => getName(row.subjectId) },
    {
      key: "board", label: "Board",
      render: (row) => <StatusBadge variant={row.board === "KPK" ? "info" : row.board === "Punjab" ? "success" : "purple"}>{row.board}</StatusBadge>,
    },
    { key: "downloads", label: "Downloads" },
    { key: "createdAt", label: "Created", render: (row) => formatDate(row.createdAt) },
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

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Books</h1>
        <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Add Book</button>
      </div>

      <DataTable
        columns={columns}
        data={books.data?.data || []}
        loading={books.isLoading}
        error={books.error}
        onRetry={books.refetch}
      />

      <Modal open={modal.open} onClose={handleModalClose} title={modal.mode === "create" ? "Add Book" : "Edit Book"} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput label="Title" name="title" value={values.title} onChange={handleChange} required disabled={isSubmitting} />
          <FormSelect label="Subject" name="subjectId" value={values.subjectId} onChange={handleChange} required options={subjectOptions} placeholder="Select subject" disabled={isSubmitting} />
          <FormSelect label="Board" name="board" value={values.board} onChange={handleChange} required options={BOARDS} placeholder="Select board" disabled={isSubmitting} />
          <FormFile label="Cover Image" name="coverImage" onChange={handleChange} accept="image/*" disabled={isSubmitting} />
          <FormFile label="PDF File" name="file" onChange={handleChange} accept=".pdf" required={modal.mode === "create"} disabled={isSubmitting} />
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={handleModalClose} disabled={isSubmitting} className="btn-secondary btn-sm">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary btn-sm inline-flex items-center justify-center gap-2">
              {isSubmitting ? <Spinner size={16} className="text-white" /> : null}
              {isSubmitting ? "Saving…" : "Save"}
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
