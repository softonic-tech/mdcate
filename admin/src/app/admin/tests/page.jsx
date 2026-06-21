
"use client";

import { useEffect } from "react";

import CrudPage from "@/components/tables/CrudPage";

import {
  testHooks,
  subjectHooks,
  useChaptersBySubject,
  questionHooks,
} from "@/hooks/useResource";

import {
  FormInput,
  FormSelect,
} from "@/components/forms/FormFields";

import StatusBadge from "@/components/ui/StatusBadge";

import { getName, formatDate } from "@/lib/utils";

import {
  TEST_TYPES,
  QUESTION_COUNTS,
} from "@/lib/constants";

// ================= TYPE COLORS =================
const typeVariant = {
  mock: "info",
  quiz: "success",
  adaptive: "purple",
  pastPaper: "warning",
};

// ================= TABLE =================
const columns = [
  { key: "title", label: "Title" },

  {
    key: "type",
    label: "Type",
    render: (row) => (
      <StatusBadge variant={typeVariant[row.type]}>
        {row.type}
      </StatusBadge>
    ),
  },

  {
    key: "subjectId",
    label: "Subject",
    render: (row) => getName(row.subjectId),
  },

  {
    key: "questionCount",
    label: "Questions",
    render: (row) => row.questionCount,
  },

  {
    key: "duration",
    label: "Duration",
    render: (row) =>
      row.duration ? `${row.duration} min` : "—",
  },

  {
    key: "createdAt",
    label: "Created",
    render: (row) => formatDate(row.createdAt),
  },
];

// ================= DEFAULT =================
const defaultValues = {
  title: "",
  type: "quiz",
  subjectId: "",
  chapterId: "",
  duration: 30,
  questionCount: 30,
  paperYear: "",
  questions: [],
};

// ================= FORM =================
function TestForm({ values, handleChange }) {
  const subjects = subjectHooks.useList();
  const chapters = useChaptersBySubject(values.subjectId);
  const questions = questionHooks.useList();

  // ================= OPTIONS =================
  const subjectOptions = (subjects.data?.data || []).map((s) => ({
    value: s._id,
    label: `${s.name} (${s.board})`,
  }));

  const chapterOptions = (chapters.data?.data || []).map((c) => ({
    value: c._id,
    label: c.name,
  }));

  const allQuestions = questions.data?.data || [];

  // ================= FILTER QUESTIONS =================
  const filteredQuestions = allQuestions.filter((q) => {
    if (!values.subjectId) return false;

    const qSubject =
      typeof q.subjectId === "object"
        ? q.subjectId?._id
        : q.subjectId;

    const qChapter =
      typeof q.chapterId === "object"
        ? q.chapterId?._id
        : q.chapterId;

    if (qSubject !== values.subjectId) return false;

    if (values.chapterId && qChapter !== values.chapterId)
      return false;

    return true;
  });

  const selectedQuestions = values.questions || [];
  const maxCount = Number(values.questionCount);

  // ================= SUBJECT CHANGE =================
  const onSubjectChange = (e) => {
    const value = e.target.value;

    handleChange({
      target: { name: "subjectId", value },
    });

    // reset chapter + questions
    handleChange({
      target: { name: "chapterId", value: "" },
    });

    handleChange({
      target: { name: "questions", value: [] },
    });
  };

  // ================= CHAPTER CHANGE =================
  const onChapterChange = (e) => {
    const value = e.target.value;

    handleChange({
      target: { name: "chapterId", value },
    });

    handleChange({
      target: { name: "questions", value: [] },
    });
  };

  return (
    <>
      {/* TITLE */}
      <FormInput
        label="Title"
        name="title"
        value={values.title}
        onChange={handleChange}
        required
      />

      {/* TYPE + COUNT */}
      <div className="grid grid-cols-2 gap-4">
        <FormSelect
          label="Type"
          name="type"
          value={values.type}
          onChange={handleChange}
          options={TEST_TYPES}
        />

        <FormSelect
          label="Question Count"
          name="questionCount"
          value={values.questionCount}
          onChange={handleChange}
          options={QUESTION_COUNTS.map((n) => ({
            value: n,
            label: String(n),
          }))}
        />
      </div>

      {/* SUBJECT + CHAPTER */}
      <div className="grid grid-cols-2 gap-4">
        <FormSelect
          label="Subject"
          name="subjectId"
          value={values.subjectId}
          onChange={onSubjectChange}
          placeholder="Select subject"
          options={subjectOptions}
        />

        <FormSelect
          label="Chapter"
          name="chapterId"
          value={values.chapterId}
          onChange={onChapterChange}
          disabled={!values.subjectId}
          placeholder={
            values.subjectId
              ? "Select chapter"
              : "Select subject first"
          }
          options={chapterOptions}
        />
      </div>

      {/* QUESTIONS */}
      <div className="mt-4">
        <label className="block mb-2 font-medium">
          Select Questions ({selectedQuestions.length}/{maxCount})
        </label>

        {!values.subjectId ? (
          <p className="text-sm text-gray-500">
            Select subject first
          </p>
        ) : filteredQuestions.length === 0 ? (
          <p className="text-sm text-gray-500">
            No questions found
          </p>
        ) : (
          <div className="border rounded-lg h-64 overflow-y-auto p-3 space-y-2">
            {filteredQuestions.map((q) => {
              const checked = selectedQuestions.includes(q._id);

              const disableNew =
                !checked && selectedQuestions.length >= maxCount;

              return (
                <label
                  key={q._id}
                  className="flex gap-2 items-start p-2 border rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disableNew}
                    onChange={(e) => {
                      let updated = [...selectedQuestions];

                      if (e.target.checked) {
                        updated.push(q._id);
                      } else {
                        updated = updated.filter((id) => id !== q._id);
                      }

                      handleChange({
                        target: {
                          name: "questions",
                          value: updated,
                        },
                      });
                    }}
                  />

                  <div>
                    <p className="text-sm font-medium">
                      {q.text}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        )}

        <p className="text-sm text-gray-500 mt-2">
          Select exactly {maxCount} questions
        </p>
      </div>
    </>
  );
}

// ================= FORM WRAPPER =================
function renderForm(values, handleChange) {
  return (
    <TestForm
      values={values}
      handleChange={handleChange}
    />
  );
}

// ================= EDIT =================
const toFormValues = (row) => ({
  title: row.title,
  type: row.type,
  subjectId:
    typeof row.subjectId === "object"
      ? row.subjectId._id
      : row.subjectId || "",
  chapterId:
    typeof row.chapterId === "object"
      ? row.chapterId?._id
      : row.chapterId || "",
  duration: row.duration,
  questionCount: row.questionCount,
  paperYear: row.paperYear || "",
  questions:
    row.questions?.map((q) =>
      typeof q === "object" ? q._id : q
    ) || [],
});

// ================= SUBMIT =================
const transformSubmit = (values) => {
  const count = Number(values.questionCount);

  if (values.questions.length !== count) {
    throw new Error(`Select exactly ${count} questions`);
  }

  return {
    ...values,
    duration: Number(values.duration),
    questionCount: count,
    paperYear: values.paperYear
      ? Number(values.paperYear)
      : null,
    chapterId: values.chapterId || null,
    questions: values.questions,
  };
};

// ================= PAGE =================
export default function TestsPage() {
  return (
    <CrudPage
      title="Tests"
      hooks={testHooks}
      columns={columns}
      renderForm={renderForm}
      defaultValues={defaultValues}
      toFormValues={toFormValues}
      transformSubmit={transformSubmit}
      modalSize="lg"
    />
  );
}