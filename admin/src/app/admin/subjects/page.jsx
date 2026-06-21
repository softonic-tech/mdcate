"use client";

import CrudPage from "@/components/tables/CrudPage";
import { subjectHooks } from "@/hooks/useResource";
import { FormInput, FormSelect } from "@/components/forms/FormFields";
import StatusBadge from "@/components/ui/StatusBadge";
import { BOARDS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

const columns = [
  { key: "name", label: "Name" },
  {
    key: "board",
    label: "Board",
    render: (row) => (
      <StatusBadge variant={row.board === "KPK" ? "info" : row.board === "Punjab" ? "success" : "purple"}>
        {row.board}
      </StatusBadge>
    ),
  },
  { key: "slug", label: "Slug", render: (row) => <span className="text-text-muted">{row.slug}</span> },
  { key: "createdAt", label: "Created", render: (row) => formatDate(row.createdAt) },
];

const defaultValues = { name: "", board: "" };

const toFormValues = (row) => ({ name: row.name, board: row.board });

function renderForm(values, handleChange) {
  return (
    <>
      <FormInput label="Subject Name" name="name" value={values.name} onChange={handleChange} required placeholder="e.g. Biology" />
      <FormSelect label="Board" name="board" value={values.board} onChange={handleChange} required placeholder="Select board" options={BOARDS} />
    </>
  );
}

export default function SubjectsPage() {
  return (
    <CrudPage
      title="Subjects"
      hooks={subjectHooks}
      columns={columns}
      renderForm={renderForm}
      defaultValues={defaultValues}
      toFormValues={toFormValues}
    />
  );
}
