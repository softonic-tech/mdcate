"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { getMcqsApi } from "@/api/mcq.api";
import { getSubjectsApi } from "@/api/subject.api";
import { getChaptersBySubjectApi } from "@/api/chapter.api";
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Target,
  RotateCcw,
  BookOpen,
  Layers,
} from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import { SkeletonMcqList, SkeletonStats } from "@/components/dashboard/Skeleton";
import {
  FilterPanel,
  FilterField,
  FilterRow,
  FilterPills,
  StatStrip,
  ListMeta,
  PaginationBar,
  PageTip,
} from "@/components/dashboard/StudyPageUI";
import { usePageSearch } from "@/hooks/usePageSearch";

const LETTERS = ["A", "B", "C", "D", "E", "F"];
const PAGE_SIZE = 20;

const DIFFICULTY_OPTIONS = [
  { value: "all", label: "All" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export default function Page() {
  const { query, clearQuery } = usePageSearch("Search question text…");
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [filters, setFilters] = useState({
    subjectId: "all",
    chapterId: "all",
    difficulty: "all",
    page: 1,
  });
  const [selected, setSelected] = useState({});
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const prevQueryRef = useRef(query);

  const normalize = (res) => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    return [];
  };

  useEffect(() => {
    getSubjectsApi()
      .then((res) => setSubjects(normalize(res)))
      .catch(() => setSubjects([]));
  }, []);

  useEffect(() => {
    if (!filters.subjectId || filters.subjectId === "all") {
      setChapters([]);
      return;
    }
    getChaptersBySubjectApi(filters.subjectId)
      .then((res) => setChapters(normalize(res)))
      .catch(() => setChapters([]));
  }, [filters.subjectId]);

  useEffect(() => {
    if (prevQueryRef.current !== query) {
      prevQueryRef.current = query;
      setFilters((p) => ({ ...p, page: 1 }));
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const params = { page: filters.page, limit: PAGE_SIZE };
        if (filters.subjectId !== "all") params.subjectId = filters.subjectId;
        if (filters.chapterId !== "all") params.chapterId = filters.chapterId;
        if (filters.difficulty !== "all") params.difficulty = filters.difficulty;
        if (query.trim()) params.search = query.trim();

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
  }, [filters, query]);

  const sessionStats = useMemo(() => {
    const answered = questions.filter((q) => selected[q._id] !== undefined).length;
    const correct = questions.filter((q) => selected[q._id] === q.correctAnswer).length;
    const accuracy = answered ? Math.round((correct / answered) * 100) : 0;
    return { answered, correct, accuracy, total: questions.length };
  }, [questions, selected]);

  const selectAnswer = (qid, idx) => {
    setSelected((p) => ({ ...p, [qid]: idx }));
  };

  const resetSession = () => setSelected({});

  const changeSubject = (val) => {
    clearQuery();
    setFilters({ subjectId: val, chapterId: "all", difficulty: "all", page: 1 });
    setSelected({});
  };

  const changeChapter = (val) => {
    setFilters((p) => ({ ...p, chapterId: val, page: 1 }));
    setSelected({});
  };

  const setDifficulty = (val) => {
    setFilters((p) => ({ ...p, difficulty: val, page: 1 }));
    setSelected({});
  };

  const hasActiveFilters =
    filters.subjectId !== "all" ||
    filters.chapterId !== "all" ||
    filters.difficulty !== "all" ||
    query.trim() !== "";

  const clearFilters = () => {
    clearQuery();
    setFilters({ subjectId: "all", chapterId: "all", difficulty: "all", page: 1 });
    setSelected({});
  };

  const pageStart = pagination ? (filters.page - 1) * PAGE_SIZE + 1 : 0;
  const pageEnd = pagination
    ? Math.min(filters.page * PAGE_SIZE, pagination.total ?? questions.length)
    : questions.length;

  return (
    <div className="page-shell study-page">
      <PageHeader
        eyebrow={{ icon: ClipboardList, label: "Practice" }}
        title="MCQ Bank"
        description="Filter by subject, pick an answer, and get instant feedback with explanations."
        actions={
          sessionStats.answered > 0 ? (
            <button type="button" className="btn-ghost study-page__reset" onClick={resetSession}>
              <RotateCcw size={15} />
              Reset answers
            </button>
          ) : null
        }
      />

      {loading ? (
        <SkeletonStats count={4} />
      ) : questions.length > 0 ? (
        <StatStrip
          items={[
            { label: "On this page", value: sessionStats.total },
            { label: "Answered", value: sessionStats.answered },
            { label: "Correct", value: sessionStats.correct, success: true },
            {
              label: "Accuracy",
              value: sessionStats.answered ? `${sessionStats.accuracy}%` : "—",
              accent: true,
              progress: sessionStats.total
                ? (sessionStats.answered / sessionStats.total) * 100
                : 0,
            },
          ]}
        />
      ) : null}

      <FilterPanel
        hasActiveFilters={hasActiveFilters}
        onClear={clearFilters}
        ariaLabel="Filter questions"
      >
        <FilterRow>
          <FilterField label="Subject" icon={BookOpen}>
            <select value={filters.subjectId} onChange={(e) => changeSubject(e.target.value)} aria-label="Subject">
              <option value="all">All subjects</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Chapter" icon={Layers}>
            <select
              value={filters.chapterId}
              onChange={(e) => changeChapter(e.target.value)}
              disabled={filters.subjectId === "all"}
              aria-label="Chapter"
            >
              <option value="all">All chapters</option>
              {chapters.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </FilterField>
        </FilterRow>
        <FilterPills
          label="Difficulty"
          icon={Target}
          options={DIFFICULTY_OPTIONS.map((d) => ({
            ...d,
            variant: d.value !== "all" ? d.value : undefined,
          }))}
          value={filters.difficulty}
          onChange={setDifficulty}
          ariaLabel="Difficulty"
        />
      </FilterPanel>

      {loading ? (
        <SkeletonMcqList count={3} />
      ) : questions.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No MCQs found"
          description="Try a different subject, chapter, or search term."
          action={
            hasActiveFilters ? (
              <button type="button" className="btn-primary" onClick={clearFilters}>
                Clear filters
              </button>
            ) : null
          }
        />
      ) : (
        <>
          <ListMeta
            start={pageStart}
            end={pageEnd}
            total={pagination?.total}
            label="questions"
            extra={
              <div className="study-page__page-dots" aria-label="Answer progress on this page">
                {questions.map((q) => {
                  const done = selected[q._id] !== undefined;
                  const ok = done && selected[q._id] === q.correctAnswer;
                  return (
                    <span
                      key={q._id}
                      className={`study-page__page-dot${done ? (ok ? " study-page__page-dot--correct" : " study-page__page-dot--wrong") : ""}`}
                      title={done ? (ok ? "Correct" : "Incorrect") : "Not answered"}
                    />
                  );
                })}
              </div>
            }
          />

          <div className="mcq-list">
            {questions.map((q, i) => {
              const done = selected[q._id] !== undefined;
              const selectedAns = selected[q._id];
              const isCorrect = selectedAns === q.correctAnswer;
              const questionNum = pageStart + i;
              const subjectName = q.subjectId?.name;
              const chapterName = q.chapterId?.name;

              let cardState = "";
              if (done) cardState = isCorrect ? " mcq-card--correct" : " mcq-card--wrong";

              return (
                <article key={q._id} className={`mcq-card${cardState}`}>
                  <header className="mcq-card__head">
                    <div className="mcq-card__head-left">
                      <span className="mcq-card__num">Q{questionNum}</span>
                      {(subjectName || chapterName) && (
                        <div className="mcq-card__meta">
                          {subjectName && <span>{subjectName}</span>}
                          {subjectName && chapterName && <span className="mcq-card__meta-sep">·</span>}
                          {chapterName && <span>{chapterName}</span>}
                        </div>
                      )}
                    </div>
                    <span className={`mcq-badge mcq-badge--${q.difficulty || "medium"}`}>
                      {q.difficulty || "medium"}
                    </span>
                  </header>

                  <p className="mcq-card__question">{q.text}</p>

                  <div className="mcq-options">
                    {q.options.map((opt, idx) => {
                      let optionClass = "mcq-option";
                      if (done) optionClass += " mcq-option--locked";
                      if (done && idx === q.correctAnswer) optionClass += " mcq-option--correct";
                      else if (done && idx === selectedAns) optionClass += " mcq-option--wrong";

                      return (
                        <div
                          key={idx}
                          role="button"
                          tabIndex={done ? -1 : 0}
                          className={optionClass}
                          onClick={() => !done && selectAnswer(q._id, idx)}
                          onKeyDown={(e) => {
                            if (!done && (e.key === "Enter" || e.key === " ")) {
                              e.preventDefault();
                              selectAnswer(q._id, idx);
                            }
                          }}
                          aria-disabled={done}
                        >
                          <span className="mcq-option__letter">{LETTERS[idx] || idx + 1}</span>
                          <span className="mcq-option__text">{opt}</span>
                          {done && idx === q.correctAnswer && (
                            <CheckCircle2 size={18} className="mcq-option__icon mcq-option__icon--correct" aria-hidden="true" />
                          )}
                          {done && idx === selectedAns && idx !== q.correctAnswer && (
                            <XCircle size={18} className="mcq-option__icon mcq-option__icon--wrong" aria-hidden="true" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {done && (
                    <div className={`mcq-feedback ${isCorrect ? "mcq-feedback--correct" : "mcq-feedback--wrong"}`}>
                      <div className="mcq-feedback__head">
                        {isCorrect ? (
                          <CheckCircle2 size={18} aria-hidden="true" />
                        ) : (
                          <XCircle size={18} aria-hidden="true" />
                        )}
                        <strong>{isCorrect ? "Correct!" : "Not quite — review the explanation"}</strong>
                      </div>
                      <p>{q.explanation || "No explanation available for this question."}</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </>
      )}

      <PaginationBar
        page={filters.page}
        totalPages={pagination?.totalPages}
        onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
        disabledNext={!pagination?.hasNext}
      />

      <PageTip>
        Tip: click an option or press Enter to submit your answer. Use the header search and filters to focus on one topic.
      </PageTip>
    </div>
  );
}
