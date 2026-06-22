"use client";

import CrudPage from "@/components/tables/CrudPage";
import { pricingPlanHooks } from "@/hooks/useResource";
import { FormInput, FormTextarea, FormCheckbox } from "@/components/forms/FormFields";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";

const columns = [
  { key: "name", label: "Name" },
  { key: "slug", label: "Slug", render: (row) => <span className="text-text-muted">{row.slug}</span> },
  {
    key: "price",
    label: "Price (PKR)",
    render: (row) => (row.price === 0 ? "Free" : row.price.toLocaleString()),
  },
  { key: "durationDays", label: "Days" },
  { key: "periodLabel", label: "Period label" },
  {
    key: "isPopular",
    label: "Popular",
    render: (row) => (row.isPopular ? <StatusBadge variant="success">Yes</StatusBadge> : "—"),
  },
  {
    key: "isActive",
    label: "Active",
    render: (row) => (
      <StatusBadge variant={row.isActive ? "success" : "warning"}>
        {row.isActive ? "Active" : "Hidden"}
      </StatusBadge>
    ),
  },
  { key: "sortOrder", label: "Order" },
  { key: "createdAt", label: "Created", render: (row) => formatDate(row.createdAt) },
];

const defaultValues = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  durationDays: 90,
  periodLabel: "",
  featuresText: "",
  tier: 0,
  sortOrder: 0,
  isPopular: false,
  isActive: true,
};

const toFormValues = (row) => ({
  name: row.name,
  slug: row.slug,
  description: row.description || "",
  price: row.price,
  durationDays: row.durationDays,
  periodLabel: row.periodLabel || "",
  featuresText: (row.features || []).join("\n"),
  tier: row.tier ?? 0,
  sortOrder: row.sortOrder ?? 0,
  isPopular: Boolean(row.isPopular),
  isActive: row.isActive !== false,
});

const toPayload = (values) => ({
  ...values,
  price: Number(values.price),
  durationDays: Number(values.durationDays),
  tier: Number(values.tier),
  sortOrder: Number(values.sortOrder),
  features: values.featuresText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean),
});

function renderForm(values, handleChange) {
  return (
    <>
      <FormInput label="Plan name" name="name" value={values.name} onChange={handleChange} required />
      <FormInput label="Slug" name="slug" value={values.slug} onChange={handleChange} required placeholder="pro" />
      <FormTextarea label="Description" name="description" value={values.description} onChange={handleChange} rows={2} />
      <FormInput label="Price (PKR)" name="price" type="number" value={values.price} onChange={handleChange} required />
      <FormInput label="Duration (days)" name="durationDays" type="number" value={values.durationDays} onChange={handleChange} required />
      <FormInput label="Period label" name="periodLabel" value={values.periodLabel} onChange={handleChange} placeholder="/ 3 months" />
      <FormInput label="Tier" name="tier" type="number" value={values.tier} onChange={handleChange} />
      <FormInput label="Sort order" name="sortOrder" type="number" value={values.sortOrder} onChange={handleChange} />
      <FormTextarea
        label="Features (one per line)"
        name="featuresText"
        value={values.featuresText}
        onChange={handleChange}
        rows={6}
      />
      <FormCheckbox label="Mark as popular" name="isPopular" checked={values.isPopular} onChange={handleChange} />
      <FormCheckbox label="Active on landing page" name="isActive" checked={values.isActive} onChange={handleChange} />
    </>
  );
}

export default function PricingPlansPage() {
  return (
    <CrudPage
      title="Pricing Plans"
      hooks={pricingPlanHooks}
      columns={columns}
      renderForm={renderForm}
      defaultValues={defaultValues}
      toFormValues={toFormValues}
      transformSubmit={toPayload}
    />
  );
}
