"use client";

import { useEffect } from "react";
import CrudPage from "@/components/tables/CrudPage";
import {
  highYieldFactHooks,
  subjectHooks,
  useChaptersBySubject,
} from "@/hooks/useResource";

import {
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
} from "@/components/forms/FormFields";

import { formatDate, truncate } from "@/lib/utils";


// 📊 TABLE COLUMNS
const columns = [
  {
    key: "title",
    label: "Title",
    render: (row) => row.title || "—",
  },
  {
    key: "content",
    label: "Fact",
    render: (row) => truncate(row.content, 70),
  },

  // ✅ FIXED SUBJECT DISPLAY (name + board)
  {
    key: "subjectId",
    label: "Subject",
    render: (row) =>
      typeof row.subjectId === "object"
        ? (
          <div>
            <div className="font-medium">
              {row.subjectId?.name || "—"}
            </div>
            <div className="text-xs text-gray-500">
              {row.subjectId?.board || "—"}
            </div>
          </div>
        )
        : "—",
  },

  {
    key: "priority",
    label: "🔥 Priority",
  },
  {
    key: "examFrequency",
    label: "📊 Exam Count",
  },
  {
    key: "isActive",
    label: "Status",
    render: (row) => (row.isActive ? "Active" : "Hidden"),
  },
  {
    key: "createdAt",
    label: "Created",
    render: (row) => formatDate(row.createdAt),
  },
];


// 🧾 DEFAULT VALUES
const defaultValues = {
  title: "",
  content: "",
  subjectId: "",
  chapterId: "",
  category: "general",
  priority: 1,
  examFrequency: 0,
  tags: "",
  isActive: true,
};


// 🔁 EDIT MAPPING
const toFormValues = (row) => ({
  title: row.title || "",
  content: row.content || "",
  subjectId:
    typeof row.subjectId === "object"
      ? row.subjectId._id
      : row.subjectId || "",

  chapterId:
    typeof row.chapterId === "object"
      ? row.chapterId?._id
      : row.chapterId || "",

  category: row.category || "general",
  priority: row.priority || 1,
  examFrequency: row.examFrequency || 0,
  tags: (row.tags || []).join(", "),
  isActive: row.isActive ?? true,
});


// 🧠 FORM COMPONENT
function FactForm({ values, handleChange }) {
  const subjects = subjectHooks.useList();
  const chapters = useChaptersBySubject(values.subjectId);

  // ✅ RESET chapter when subject changes (SAFE)
  useEffect(() => {
    handleChange({
      target: {
        name: "chapterId",
        value: "",
      },
    });
  }, [values.subjectId]);

  const subjectOptions = (subjects.data?.data || []).map((s) => ({
    value: s._id,
    label: `${s.name} (${s.board})`,
  }));

  const chapterOptions = (chapters.data?.data || []).map((c) => ({
    value: c._id,
    label: c.name,
  }));

  const categoryOptions = [
    { value: "general", label: "General" },
    { value: "important", label: "Important" },
    { value: "exam", label: "Exam" },
    { value: "formula", label: "Formula" },
  ];

  const priorityOptions = [
    { value: 1, label: "1 - Low" },
    { value: 2, label: "2" },
    { value: 3, label: "Medium" },
    { value: 4, label: "High" },
    { value: 5, label: "🔥 Very High Yield" },
  ];

  return (
    <div className="space-y-5">

      {/* TITLE */}
      <FormInput
        label="Title"
        name="title"
        value={values.title}
        onChange={handleChange}
        placeholder="Short heading (optional)"
      />

      {/* CONTENT */}
      <FormTextarea
        label="Fact Content"
        name="content"
        value={values.content}
        onChange={handleChange}
        required
        rows={3}
      />

      {/* SUBJECT + CHAPTER */}
      <div className="grid grid-cols-2 gap-4">

        <FormSelect
          label="Subject"
          name="subjectId"
          value={values.subjectId}
          onChange={handleChange}
          required
          options={[
            { value: "", label: "Select Subject" },
            ...subjectOptions,
          ]}
        />

        <FormSelect
          label="Chapter"
          name="chapterId"
          value={values.chapterId}
          onChange={handleChange}
          options={chapterOptions}
          disabled={!values.subjectId}
          placeholder={
            values.subjectId ? "Select chapter" : "Select subject first"
          }
        />
      </div>

      {/* CATEGORY + PRIORITY */}
      <div className="grid grid-cols-2 gap-4">

        <FormSelect
          label="Category"
          name="category"
          value={values.category}
          onChange={handleChange}
          options={categoryOptions}
        />

        <FormSelect
          label="Priority"
          name="priority"
          value={values.priority}
          onChange={handleChange}
          options={priorityOptions}
        />
      </div>

      {/* EXAM FREQUENCY */}
      <FormInput
        label="Exam Frequency"
        name="examFrequency"
        type="number"
        value={values.examFrequency}
        onChange={handleChange}
        placeholder="How many times appeared"
      />

      {/* TAGS */}
      <FormInput
        label="Tags"
        name="tags"
        value={values.tags}
        onChange={handleChange}
        placeholder="e.g DNA, replication, cell"
      />

      {/* ACTIVE */}
      <FormCheckbox
        label="Active"
        name="isActive"
        checked={values.isActive}
        onChange={handleChange}
      />
    </div>
  );
}


// 📦 WRAPPER
function renderForm(values, handleChange) {
  return <FactForm values={values} handleChange={handleChange} />;
}


// 🚀 MAIN PAGE
export default function HighYieldFactsPage() {
  return (
    <div className="w-full overflow-x-auto">
      <CrudPage
        title="🔥 High-Yield Facts"
        hooks={highYieldFactHooks}
        columns={columns}
        renderForm={renderForm}
        defaultValues={defaultValues}
        toFormValues={toFormValues}
      />
    </div>
  );
}