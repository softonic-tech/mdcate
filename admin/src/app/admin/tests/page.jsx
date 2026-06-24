
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

const typeVariant = {
  mock: "info",
  quiz: "success",
  adaptive: "purple",
  pastPaper: "warning",
};

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
    render: (row) => row.questions?.length || row.questionCount,
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

function TestForm({ values, handleChange }) {
  const isPastPaper = values.type === "pastPaper";
  const subjects = subjectHooks.useList();
  const chapters = useChaptersBySubject(values.subjectId);
  const questions = questionHooks.useList({
    limit: 500,
    subjectId: values.subjectId || undefined,
    isPastPaper: isPastPaper ? "true" : undefined,
  });

  const subjectOptions = (subjects.data?.data || []).map((s) => ({
    value: s._id,
    label: `${s.name} (${s.board})`,
  }));

  const chapterOptions = (chapters.data?.data || []).map((c) => ({
    value: c._id,
    label: c.name,
  }));

  const allQuestions = questions.data?.data || [];

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
  const maxCount = isPastPaper
    ? Infinity
    : Number(values.questionCount);

  const onSubjectChange = (e) => {
    const value = e.target.value;

    handleChange({
      target: { name: "subjectId", value },
    });

    handleChange({
      target: { name: "chapterId", value: "" },
    });

    handleChange({
      target: { name: "questions", value: [] },
    });
  };

  const onChapterChange = (e) => {
    const value = e.target.value;

    handleChange({
      target: { name: "chapterId", value },
    });

    handleChange({
      target: { name: "questions", value: [] },
    });
  };

  const onTypeChange = (e) => {
    handleChange(e);
    if (e.target.value === "pastPaper") {
      handleChange({
        target: { name: "questions", value: [] },
      });
    }
  };

  return (
    <>
      <FormInput
        label="Title"
        name="title"
        value={values.title}
        onChange={handleChange}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <FormSelect
          label="Type"
          name="type"
          value={values.type}
          onChange={onTypeChange}
          options={TEST_TYPES}
        />

        {isPastPaper ? (
          <FormInput
            label="Paper Year"
            name="paperYear"
            type="number"
            value={values.paperYear}
            onChange={handleChange}
            placeholder="e.g. 2023"
          />
        ) : (
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
        )}
      </div>

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
          disabled={!values.subjectId || isPastPaper}
          placeholder={
            values.subjectId
              ? isPastPaper
                ? "Optional for past papers"
                : "Select chapter"
              : "Select subject first"
          }
          options={chapterOptions}
        />
      </div>

      <FormInput
        label="Duration (minutes)"
        name="duration"
        type="number"
        value={values.duration}
        onChange={handleChange}
        placeholder={isPastPaper ? "210" : "30"}
      />

      {isPastPaper && (
        <p className="text-sm text-text-secondary -mt-2">
          For full MDCAT papers, use the{" "}
          <strong>Past Papers</strong> admin page to upload a .docx file in one step.
        </p>
      )}

      <div className="mt-4">
        <label className="block mb-2 font-medium">
          Select Questions ({selectedQuestions.length}
          {!isPastPaper && `/${maxCount}`})
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

        {!isPastPaper && (
          <p className="text-sm text-gray-500 mt-2">
            Select exactly {maxCount} questions
          </p>
        )}
      </div>
    </>
  );
}

function renderForm(values, handleChange) {
  return (
    <TestForm
      values={values}
      handleChange={handleChange}
    />
  );
}

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

const transformSubmit = (values) => {
  const isPastPaper = values.type === "pastPaper";
  const count = isPastPaper
    ? values.questions.length
    : Number(values.questionCount);

  if (!isPastPaper && values.questions.length !== count) {
    throw new Error(`Select exactly ${count} questions`);
  }

  if (isPastPaper && values.questions.length === 0) {
    throw new Error("Select at least one question for the past paper");
  }

  return {
    ...values,
    duration: Number(values.duration) || 0,
    questionCount: count,
    paperYear: values.paperYear
      ? Number(values.paperYear)
      : null,
    chapterId: values.chapterId || null,
    questions: values.questions,
  };
};

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
