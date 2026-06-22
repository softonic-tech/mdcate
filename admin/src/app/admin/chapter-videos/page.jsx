"use client";

import { useState } from "react";
import DataTable from "@/components/tables/DataTable";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StatusBadge from "@/components/ui/StatusBadge";
import { FormInput, FormTextarea, FormSelect, FormFile, FormCheckbox } from "@/components/forms/FormFields";
import {
  chapterVideoHooks,
  subjectHooks,
  bookHooks,
  useChaptersBySubject,
} from "@/hooks/useResource";
import useForm from "@/hooks/useForm";
import { Plus } from "lucide-react";
import { getName, formatDate, truncate } from "@/lib/utils";
import { presignChapterVideoUpload } from "@/lib/s3DirectUpload";
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

export default function ChapterVideosPage() {
  const [modal, setModal] = useState({ open: false, mode: "create", item: null });
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [saving, setSaving] = useState(false);

  const videos = chapterVideoHooks.useList({ includeUnpublished: "true", limit: 100 });
  const subjects = subjectHooks.useList();
  const books = bookHooks.useList({ limit: 200 });
  const createMut = chapterVideoHooks.useCreate();
  const updateMut = chapterVideoHooks.useUpdate();
  const removeMut = chapterVideoHooks.useRemove();

  const { values, handleChange, reset, setField } = useForm({
    title: "",
    description: "",
    subjectId: "",
    chapterId: "",
    bookId: "",
    sortOrder: 0,
    isPublished: true,
    videoFile: null,
  });

  const chapters = useChaptersBySubject(values.subjectId);
  const subjectOptions = (subjects.data?.data || []).map((s) => ({
    value: s._id,
    label: `${s.name} (${s.board})`,
  }));
  const chapterOptions = (chapters.data?.data || []).map((c) => ({
    value: c._id,
    label: c.name,
  }));
  const bookOptions = (books.data?.data || [])
    .filter((b) => !values.subjectId || String(b.subjectId?._id || b.subjectId) === values.subjectId)
    .map((b) => ({ value: b._id, label: b.title }));

  const closeModal = () => {
    setSaving(false);
    setModal({ open: false, mode: "create", item: null });
  };

  const openCreate = () => {
    reset({
      title: "",
      description: "",
      subjectId: "",
      chapterId: "",
      bookId: "",
      sortOrder: 0,
      isPublished: true,
      videoFile: null,
    });
    setModal({ open: true, mode: "create", item: null });
  };

  const openEdit = (row) => {
    reset({
      title: row.title,
      description: row.description || "",
      subjectId: typeof row.subjectId === "object" ? row.subjectId._id : row.subjectId,
      chapterId: typeof row.chapterId === "object" ? row.chapterId._id : row.chapterId,
      bookId: row.bookId ? (typeof row.bookId === "object" ? row.bookId._id : row.bookId) : "",
      sortOrder: row.sortOrder || 0,
      isPublished: row.isPublished !== false,
      videoFile: null,
    });
    setModal({ open: true, mode: "edit", item: row });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (modal.mode === "create" && !values.videoFile) {
      toast.error("Video file is required");
      return;
    }

    setSaving(true);
    try {
      let videoUrl = modal.mode === "edit" ? modal.item.videoUrl || "" : "";

      if (values.videoFile) {
        const presignRes = await presignChapterVideoUpload({
          videoFileName: values.videoFile.name,
          videoContentType: values.videoFile.type || "video/mp4",
        });
        const p = presignRes.data?.video;
        if (!p?.uploadUrl) throw new Error("Could not get upload URL");
        await putToS3(p.uploadUrl, values.videoFile, p.contentType);
        videoUrl = p.fileUrl;
      }

      if (!videoUrl) {
        toast.error("Video upload failed");
        return;
      }

      const payload = {
        title: values.title,
        description: values.description,
        subjectId: values.subjectId,
        chapterId: values.chapterId,
        bookId: values.bookId || undefined,
        sortOrder: Number(values.sortOrder) || 0,
        isPublished: values.isPublished,
        videoUrl,
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
    { key: "title", label: "Title", render: (row) => truncate(row.title, 40) },
    { key: "subjectId", label: "Subject", render: (row) => getName(row.subjectId) },
    { key: "chapterId", label: "Chapter", render: (row) => getName(row.chapterId) },
    { key: "bookId", label: "Book", render: (row) => (row.bookId ? getName(row.bookId) : "—") },
    {
      key: "isPublished",
      label: "Status",
      render: (row) => (
        <StatusBadge variant={row.isPublished ? "success" : "warning"}>
          {row.isPublished ? "Published" : "Draft"}
        </StatusBadge>
      ),
    },
    { key: "createdAt", label: "Added", render: (row) => formatDate(row.createdAt) },
    {
      key: "_actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="btn-ghost btn-sm text-primary">
            Edit
          </button>
          <button
            onClick={() => setConfirm({ open: true, id: row._id })}
            className="btn-ghost btn-sm text-danger"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const items = videos.data?.data || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Chapter Videos</h1>
          <p className="text-sm text-text-secondary mt-1">
            Upload chapter-wise lecture videos to S3 for students to watch.
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} /> Add Video
        </button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={videos.isLoading}
        error={videos.error}
        onRetry={videos.refetch}
      />

      <Modal
        open={modal.open}
        onClose={closeModal}
        title={modal.mode === "create" ? "Upload Chapter Video" : "Edit Chapter Video"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput label="Title" name="title" value={values.title} onChange={handleChange} required />
          <FormTextarea
            label="Description"
            name="description"
            value={values.description}
            onChange={handleChange}
            rows={2}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Subject"
              name="subjectId"
              value={values.subjectId}
              onChange={(e) => {
                handleChange(e);
                setField("chapterId", "");
                setField("bookId", "");
              }}
              required
              options={subjectOptions}
              placeholder="Select subject"
            />
            <FormSelect
              label="Chapter"
              name="chapterId"
              value={values.chapterId}
              onChange={handleChange}
              required
              options={chapterOptions}
              placeholder={values.subjectId ? "Select chapter" : "Select subject first"}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Book (optional)"
              name="bookId"
              value={values.bookId}
              onChange={handleChange}
              options={bookOptions}
              placeholder="Link to a book"
            />
            <FormInput
              label="Sort order"
              name="sortOrder"
              type="number"
              value={values.sortOrder}
              onChange={handleChange}
            />
          </div>

          <FormFile
            label={modal.mode === "edit" ? "Replace video (optional)" : "Video file (MP4/WebM)"}
            name="videoFile"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={(e) => setField("videoFile", e.target.files?.[0] || null)}
          />

          <FormCheckbox
            label="Published (visible to students)"
            name="isPublished"
            checked={values.isPublished}
            onChange={handleChange}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={closeModal} className="btn-secondary btn-sm" disabled={saving}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary btn-sm">
              {saving ? "Uploading..." : modal.mode === "create" ? "Upload & Save" : "Save changes"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null })}
        onConfirm={async () => {
          await removeMut.mutateAsync(confirm.id);
          setConfirm({ open: false, id: null });
        }}
        loading={removeMut.isPending}
      />
    </div>
  );
}
