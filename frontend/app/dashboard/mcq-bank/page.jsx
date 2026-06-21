
"use client";

import { useState, useEffect } from "react";
import { getMcqsApi } from "@/api/mcq.api";
import { getSubjectsApi } from "@/api/subject.api";
import { getChaptersBySubjectApi } from "@/api/chapter.api";

export default function Page() {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  const [filters, setFilters] = useState({
    subjectId: "all",
    chapterId: "all",
    difficulty: "all",
    search: "",
    page: 1,
  });

  const [selected, setSelected] = useState({});
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);

  // ================= NORMALIZER =================
  const normalize = (res) => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    return [];
  };

  // ================= SUBJECTS =================
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getSubjectsApi();
        setSubjects(normalize(res));
      } catch {
        setSubjects([]);
      }
    };
    load();
  }, []);

  // ================= CHAPTERS (FIXED) =================
  useEffect(() => {
    const load = async () => {
      try {
        if (!filters.subjectId || filters.subjectId === "all") {
          setChapters([]);
          return;
        }

        const res = await getChaptersBySubjectApi(filters.subjectId);
        setChapters(normalize(res));
      } catch {
        setChapters([]);
      }
    };

    load();
  }, [filters.subjectId]);

  // ================= MCQS =================
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        const params = {
          page: filters.page,
          limit: 20,
        };

        if (filters.subjectId !== "all")
          params.subjectId = filters.subjectId;

        if (filters.chapterId !== "all")
          params.chapterId = filters.chapterId;

        if (filters.difficulty !== "all")
          params.difficulty = filters.difficulty;

        if (filters.search)
          params.search = filters.search;

        const res = await getMcqsApi(params);

        setQuestions(normalize(res));
        setPagination(res?.pagination || null);
      } catch {
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [filters]);

  // ================= ANSWER =================
  const selectAnswer = (qid, idx) => {
    setSelected((p) => ({ ...p, [qid]: idx }));
  };

  const selectStyle = {
    padding: "10px",
    borderRadius: 6,
    border: "1px solid #334155",
    background: "#1e293b",
    color: "#fff",
  };

  // ================= RESET HELPERS =================
  const changeSubject = (val) => {
    setFilters({
      subjectId: val,
      chapterId: "all",
      difficulty: "all",
      search: "",
      page: 1,
    });
    setSelected({});
  };

  const changeChapter = (val) => {
    setFilters((p) => ({
      ...p,
      chapterId: val,
      page: 1,
    }));
    setSelected({});
  };

  return (
    <div style={{ padding: 20, maxWidth: 1000 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>
        MCQ Bank
      </h1>

      {/* ================= SEARCH ================= */}
      <input
        placeholder="Search MCQs..."
        value={filters.search}
        onChange={(e) =>
          setFilters((p) => ({
            ...p,
            search: e.target.value,
            page: 1,
          }))
        }
        style={{
          marginTop: 10,
          marginBottom: 10,
          padding: 10,
          width: "100%",
          borderRadius: 6,
          border: "1px solid #334155",
          background: "#1e293b",
          color: "#fff",
        }}
      />

      {/* ================= FILTERS ================= */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>

        {/* SUBJECT */}
        <select
          style={selectStyle}
          value={filters.subjectId}
          onChange={(e) => changeSubject(e.target.value)}
        >
          <option value="all">All Subjects</option>
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* CHAPTER */}
        <select
          style={selectStyle}
          value={filters.chapterId}
          onChange={(e) => changeChapter(e.target.value)}
          disabled={filters.subjectId === "all"}
        >
          <option value="all">All Chapters</option>
          {chapters.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* DIFFICULTY */}
        <select
          style={selectStyle}
          value={filters.difficulty}
          onChange={(e) =>
            setFilters((p) => ({
              ...p,
              difficulty: e.target.value,
              page: 1,
            }))
          }
        >
          <option value="all">All</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {/* ================= MCQS ================= */}
      {loading ? (
        <p>Loading...</p>
      ) : questions.length === 0 ? (
        <p>No MCQs found</p>
      ) : (
       questions.map((q, i) => {
  const done = selected[q._id] !== undefined;
  const selectedAns = selected[q._id];

  return (
    <div
      key={q._id}
      style={{
        background: "#1e293b",
        marginTop: 12,
        padding: 15,
        borderRadius: 8,
      }}
    >
      {/* QUESTION */}
      <p style={{ fontWeight: 600 }}>
        {i + 1}. {q.text}
      </p>

      {/* TAG */}
      <span
        style={{
          fontSize: 12,
          padding: "2px 8px",
          borderRadius: 6,
          background:
            q.difficulty === "easy"
              ? "green"
              : q.difficulty === "medium"
              ? "orange"
              : "red",
          color: "#fff",
        }}
      >
        {q.difficulty}
      </span>

      {/* OPTIONS */}
      {q.options.map((opt, idx) => {
        let bg = "transparent";

        if (done && idx === q.correctAnswer) {
          bg = "#166534"; // correct
        } else if (done && idx === selectedAns) {
          bg = "#991b1b"; // wrong selected
        }

        return (
          <div
            key={idx}
            onClick={() => !done && selectAnswer(q._id, idx)}
            style={{
              padding: 8,
              marginTop: 5,
              border: "1px solid #334155",
              borderRadius: 6,
              cursor: done ? "default" : "pointer",
              background: bg,
            }}
          >
            {opt}
          </div>
        );
      })}

      {/* ================= EXPLANATION (FIXED LOGIC) ================= */}
      {done && (
        <div
          style={{
            marginTop: 10,
            padding: 10,
            borderRadius: 6,
            background:
              selectedAns === q.correctAnswer
                ? "#064e3b"
                : "#6b0f0f",
            color: "#fff",
          }}
        >
          <b>
            {selectedAns === q.correctAnswer
              ? "Correct"
              : "False"}
          </b>

          {/* show explanation ONLY if exists */}
          {q.explanation ? (
            <p style={{ marginTop: 5 }}>
              {q.explanation}
            </p>
          ) : (
            <p style={{ marginTop: 5, opacity: 0.7 }}>
              No explanation available
            </p>
          )}
        </div>
      )}
    </div>
  );
})
      )}

      {/* ================= PAGINATION ================= */}
      {pagination?.totalPages > 1 && (
        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
          <button
            disabled={filters.page <= 1}
            onClick={() =>
              setFilters((p) => ({
                ...p,
                page: p.page - 1,
              }))
            }
            style={selectStyle}
          >
            Prev
          </button>

          <span style={{ color: "#fff" }}>
            Page {filters.page} / {pagination.totalPages}
          </span>

          <button
            disabled={!pagination?.hasNext}
            onClick={() =>
              setFilters((p) => ({
                ...p,
                page: p.page + 1,
              }))
            }
            style={selectStyle}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}