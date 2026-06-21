"use client";

import CrudPage from "@/components/tables/CrudPage";
import { challengeHooks, testHooks } from "@/hooks/useResource";
import { FormInput, FormSelect, FormCheckbox } from "@/components/forms/FormFields";
import StatusBadge from "@/components/ui/StatusBadge";
import { CHALLENGE_TYPES, CHALLENGE_CONTENT_TYPES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

const columns = [
  { key: "title", label: "Title" },
  { key: "type", label: "Type", render: (row) => <StatusBadge variant={row.type === "daily" ? "info" : "purple"}>{row.type}</StatusBadge> },
  { key: "contentType", label: "Content", render: (row) => row.contentType },
  { key: "points", label: "Points" },
  { key: "isActive", label: "Active", render: (row) => <StatusBadge variant={row.isActive ? "success" : "default"}>{row.isActive ? "Yes" : "No"}</StatusBadge> },
  { key: "startDate", label: "Start", render: (row) => formatDate(row.startDate) },
  { key: "endDate", label: "End", render: (row) => formatDate(row.endDate) },
];

const defaultValues = { title: "", type: "daily", startDate: "", endDate: "", contentType: "quiz", testId: "", points: 10, isActive: true };

const toFormValues = (row) => ({
  title: row.title, type: row.type,
  startDate: row.startDate?.slice(0, 10) || "",
  endDate: row.endDate?.slice(0, 10) || "",
  contentType: row.contentType, testId: row.testId || "", points: row.points, isActive: row.isActive,
});

const transformSubmit = (v) => ({
  ...v,
  points: Number(v.points),
  testId: v.testId || null,
});
function renderForm(values, handleChange) {
   const tests = testHooks.useList();

  const testOptions = (tests.data?.data || []).map((t) => ({
    value: t._id,
    label: t.title,
  }));
  return (
    <>
      <FormInput label="Title" name="title" value={values.title} onChange={handleChange} required />
      <div className="grid grid-cols-2 gap-4">
        <FormSelect label="Type" name="type" value={values.type} onChange={handleChange} options={CHALLENGE_TYPES} />
        <FormSelect label="Content Type" name="contentType" value={values.contentType} onChange={handleChange} options={CHALLENGE_CONTENT_TYPES} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormInput label="Start Date" name="startDate" type="date" value={values.startDate} onChange={handleChange} required />
        <FormInput label="End Date" name="endDate" type="date" value={values.endDate} onChange={handleChange} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormInput label="Points" name="points" type="number" value={values.points} onChange={handleChange} />
      {/* /<FormInput label="Test ID (optional)" name="testId" value={values.testId} onChange={handleChange} placeholder="Mongo ObjectId" /> */}
    <FormSelect
      label="Select Test"
      name="testId"
      value={values.testId}
      onChange={handleChange}
      options={testOptions}
      placeholder="Choose test"
    />
      </div>
      <FormCheckbox label="Active" name="isActive" checked={values.isActive} onChange={handleChange} />
    </>
  );
}

export default function ChallengesPage() {
  return (
    <CrudPage
      title="Challenges"
      hooks={challengeHooks}
      columns={columns}
      renderForm={renderForm}
      defaultValues={defaultValues}
      toFormValues={toFormValues}
      transformSubmit={transformSubmit}
    />
  );
}
