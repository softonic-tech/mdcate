"use client";

import CrudPage from "@/components/tables/CrudPage";
import { badgeHooks } from "@/hooks/useResource";
import { FormInput, FormTextarea, FormSelect } from "@/components/forms/FormFields";
import { BADGE_CRITERIA_TYPES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

const columns = [
  { key: "name", label: "Name" },
  { key: "description", label: "Description", render: (row) => <span className="text-text-muted text-xs">{row.description}</span> },
  { key: "criteria", label: "Type", render: (row) => row.criteria?.type || "—" },
  { key: "criteriaVal", label: "Threshold", render: (row) => row.criteria?.value ?? "—" },
  { key: "createdAt", label: "Created", render: (row) => formatDate(row.createdAt) },
];

const defaultValues = { name: "", description: "", criteriaType: "custom", criteriaValue: 1, imageUrl: "" };

const toFormValues = (row) => ({
  name: row.name,
  description: row.description,
  criteriaType: row.criteria?.type || "custom",
  criteriaValue: row.criteria?.value || 1,
  imageUrl: row.imageUrl || "",
});

const transformSubmit = (v) => ({
  name: v.name,
  description: v.description,
  criteria: { type: v.criteriaType, value: Number(v.criteriaValue) },
  imageUrl: v.imageUrl,
});

function renderForm(values, handleChange) {
  return (
    <>
      <FormInput label="Badge Name" name="name" value={values.name} onChange={handleChange} required />
      <FormTextarea label="Description" name="description" value={values.description} onChange={handleChange} required rows={2} />
      <div className="grid grid-cols-2 gap-4">
        <FormSelect label="Criteria Type" name="criteriaType" value={values.criteriaType} onChange={handleChange} options={BADGE_CRITERIA_TYPES} />
        <FormInput label="Criteria Value" name="criteriaValue" type="number" value={values.criteriaValue} onChange={handleChange} required />
      </div>
      <FormInput label="Image URL" name="imageUrl" value={values.imageUrl} onChange={handleChange} placeholder="https://..." />
    </>
  );
}

export default function BadgesPage() {
  return (
    <CrudPage
      title="Badges"
      hooks={badgeHooks}
      columns={columns}
      renderForm={renderForm}
      defaultValues={defaultValues}
      toFormValues={toFormValues}
      transformSubmit={transformSubmit}
    />
  );
}
