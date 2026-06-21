"use client";

import CrudPage from "@/components/tables/CrudPage";
import { mnemonicHooks, subjectHooks, useChaptersBySubject } from "@/hooks/useResource";
import { FormInput, FormTextarea, FormSelect } from "@/components/forms/FormFields";
import { getName, formatDate, truncate } from "@/lib/utils";

const columns = [
  { key: "title", label: "Title" },
  { key: "content", label: "Content", render: (row) => <span className="text-text-muted text-xs">{truncate(row.content, 60)}</span> },
  { key: "subjectId", label: "Subject", render: (row) => getName(row.subjectId) },
  { key: "chapterId", label: "Chapter", render: (row) => getName(row.chapterId, "—") },
  { key: "createdAt", label: "Created", render: (row) => formatDate(row.createdAt) },
];

const defaultValues = { title: "", content: "", subjectId: "", chapterId: "" };

const toFormValues = (row) => ({
  title: row.title, content: row.content,
  subjectId: typeof row.subjectId === "object" ? row.subjectId._id : row.subjectId,
  chapterId: typeof row.chapterId === "object" ? row.chapterId?._id : row.chapterId || "",
});

function MnemonicForm({ values, handleChange }) {
  const subjects = subjectHooks.useList();
  const chapters = useChaptersBySubject(values.subjectId);
  const subjectOptions = (subjects.data?.data || []).map((s) => ({ value: s._id, label: `${s.name} (${s.board})` }));
  const chapterOptions = (chapters.data?.data || []).map((c) => ({ value: c._id, label: c.name }));

  return (
    <>
      <FormInput label="Title" name="title" value={values.title} onChange={handleChange} required />
      <FormTextarea label="Content" name="content" value={values.content} onChange={handleChange} required rows={4} />
      <div className="grid grid-cols-2 gap-4">
        <FormSelect label="Subject" name="subjectId" value={values.subjectId} onChange={handleChange} required options={subjectOptions} placeholder="Select subject" />
        <FormSelect label="Chapter" name="chapterId" value={values.chapterId} onChange={handleChange} options={chapterOptions} placeholder="Optional" />
      </div>
    </>
  );
}

function renderForm(values, handleChange) {
  return <MnemonicForm values={values} handleChange={handleChange} />;
}

export default function MnemonicsPage() {
  return (
    <CrudPage
      title="Mnemonics"
      hooks={mnemonicHooks}
      columns={columns}
      renderForm={renderForm}
      defaultValues={defaultValues}
      toFormValues={toFormValues}
      modalSize="lg"
    />
  );
}
