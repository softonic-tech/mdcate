"use client";

import CrudPage from "@/components/tables/CrudPage";
import { examCountdownHooks } from "@/hooks/useResource";
import { FormInput, FormCheckbox } from "@/components/forms/FormFields";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";

const columns = [
  { key: "title", label: "Exam Title" },
  { key: "examDate", label: "Exam Date", render: (row) => formatDate(row.examDate) },
  {
    key: "daysLeft", label: "Days Left",
    render: (row) => {
      const diff = Math.ceil((new Date(row.examDate) - new Date()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? <span className="font-semibold text-primary">{diff} days</span> : <StatusBadge variant="danger">Passed</StatusBadge>;
    },
  },
  { key: "isActive", label: "Active", render: (row) => <StatusBadge variant={row.isActive ? "success" : "default"}>{row.isActive ? "Yes" : "No"}</StatusBadge> },
  { key: "createdAt", label: "Created", render: (row) => formatDate(row.createdAt) },
];

const defaultValues = { title: "", examDate: "", isActive: true };

const toFormValues = (row) => ({
  title: row.title, examDate: row.examDate?.slice(0, 10) || "", isActive: row.isActive,
});

function renderForm(values, handleChange) {
  return (
    <>
      <FormInput label="Exam Title" name="title" value={values.title} onChange={handleChange} required placeholder="e.g. MDCAT 2025" />
      <FormInput label="Exam Date" name="examDate" type="date" value={values.examDate} onChange={handleChange} required />
      <FormCheckbox label="Active" name="isActive" checked={values.isActive} onChange={handleChange} />
    </>
  );
}

export default function ExamCountdownsPage() {
  return (
    <CrudPage
      title="Exam Countdowns"
      hooks={examCountdownHooks}
      columns={columns}
      renderForm={renderForm}
      defaultValues={defaultValues}
      toFormValues={toFormValues}
    />
  );
}
