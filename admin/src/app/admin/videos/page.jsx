"use client";

import CrudPage from "@/components/tables/CrudPage";
import { videoHooks } from "@/hooks/useResource";
import { FormInput, FormTextarea } from "@/components/forms/FormFields";
import StatusBadge from "@/components/ui/StatusBadge";
import { getName, formatDate, truncate } from "@/lib/utils";

const statusVariant = { pending: "warning", processing: "info", completed: "success", failed: "danger" };

const columns = [
  { key: "title", label: "Title", render: (row) => row.title || "Untitled" },
  { key: "url", label: "URL", render: (row) => <span className="text-text-muted text-xs">{truncate(row.url, 40)}</span> },
  { key: "userId", label: "User", render: (row) => getName(row.userId) },
  { key: "status", label: "Status", render: (row) => <StatusBadge variant={statusVariant[row.status]}>{row.status}</StatusBadge> },
  { key: "keyPoints", label: "Key Points", render: (row) => row.keyPoints?.length || 0 },
  { key: "createdAt", label: "Created", render: (row) => formatDate(row.createdAt) },
];

const defaultValues = { url: "", title: "", summary: "" };

const toFormValues = (row) => ({
  url: row.url, title: row.title || "", summary: row.summary || "",
});

function renderForm(values, handleChange) {
  return (
    <>
      <FormInput label="Video URL" name="url" value={values.url} onChange={handleChange} required placeholder="https://youtube.com/..." />
      <FormInput label="Title" name="title" value={values.title} onChange={handleChange} placeholder="Optional title" />
      <FormTextarea label="Summary" name="summary" value={values.summary} onChange={handleChange} rows={3} />
    </>
  );
}

export default function VideosPage() {
  return (
    <CrudPage
      title="Videos"
      hooks={videoHooks}
      columns={columns}
      renderForm={renderForm}
      defaultValues={defaultValues}
      toFormValues={toFormValues}
    />
  );
}
