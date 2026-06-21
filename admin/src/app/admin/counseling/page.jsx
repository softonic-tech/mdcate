"use client";

import CrudPage from "@/components/tables/CrudPage";
import { counselingHooks } from "@/hooks/useResource";
import { FormInput, FormTextarea, FormCheckbox } from "@/components/forms/FormFields";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDateTime } from "@/lib/utils";

const columns = [
  { key: "title", label: "Title" },
  { key: "expertName", label: "Expert" },
  { key: "scheduledAt", label: "Scheduled", render: (row) => formatDateTime(row.scheduledAt) },
  { key: "duration", label: "Duration", render: (row) => `${row.duration} min` },
  { key: "maxParticipants", label: "Max" },
  { key: "isActive", label: "Active", render: (row) => <StatusBadge variant={row.isActive ? "success" : "default"}>{row.isActive ? "Yes" : "No"}</StatusBadge> },
];

const defaultValues = { title: "", sessionLink: "", expertName: "", scheduledAt: "", duration: 60, maxParticipants: 100, isActive: true, description: "" };

const toFormValues = (row) => ({
  title: row.title, sessionLink: row.sessionLink, expertName: row.expertName,
  scheduledAt: row.scheduledAt?.slice(0, 16) || "",
  duration: row.duration, maxParticipants: row.maxParticipants, isActive: row.isActive, description: row.description || "",
});

const transformSubmit = (v) => ({ ...v, duration: Number(v.duration), maxParticipants: Number(v.maxParticipants) });

function renderForm(values, handleChange) {
  return (
    <>
      <FormInput label="Title" name="title" value={values.title} onChange={handleChange} required />
      <FormInput label="Expert Name" name="expertName" value={values.expertName} onChange={handleChange} required />
      <FormInput label="Session Link" name="sessionLink" value={values.sessionLink} onChange={handleChange} required placeholder="https://meet.google.com/..." />
      <FormInput label="Scheduled At" name="scheduledAt" type="datetime-local" value={values.scheduledAt} onChange={handleChange} required />
      <div className="grid grid-cols-2 gap-4">
        <FormInput label="Duration (min)" name="duration" type="number" value={values.duration} onChange={handleChange} />
        <FormInput label="Max Participants" name="maxParticipants" type="number" value={values.maxParticipants} onChange={handleChange} />
      </div>
      <FormTextarea label="Description" name="description" value={values.description} onChange={handleChange} rows={2} />
      <FormCheckbox label="Active" name="isActive" checked={values.isActive} onChange={handleChange} />
    </>
  );
}

export default function CounselingPage() {
  return (
    <CrudPage
      title="Counseling Sessions"
      hooks={counselingHooks}
      columns={columns}
      renderForm={renderForm}
      defaultValues={defaultValues}
      toFormValues={toFormValues}
      transformSubmit={transformSubmit}
      modalSize="lg"
    />
  );
}
