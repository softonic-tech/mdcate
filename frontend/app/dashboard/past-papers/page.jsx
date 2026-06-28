"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import { SkeletonItemCards } from "@/components/dashboard/Skeleton";
import {
  FilterPanel,
  FilterField,
  FilterRow,
  ListMeta,
} from "@/components/dashboard/StudyPageUI";
import { usePageSearch } from "@/hooks/usePageSearch";
import { BookOpen } from "lucide-react";
import { getTestsApi, getTestApi } from "@/api/test.api";
import {
  createAttempt,
  getMyAttempts,
} from "@/api/testAttempt.api";
import { getSubjectsApi } from "@/api/subject.api";

function formatCountdown(totalSeconds) {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

const normalizeAnswers = (arr = []) => {
  const map = {};
  arr.forEach((a) => {
    map[String(a.questionId)] = a.selectedOption;
  });
  return map;
};

export default function PastPapersPage() {
  const { query, clearQuery } = usePageSearch("Search papers…");
  const [papers, setPapers] = useState([]);
  const [attempts, setAttempts] = useState([]);

  const [active, setActive] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const [subjects, setSubjects] = useState([]);
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const latestAttempt = useRef({ active: null, answers: {} });
  latestAttempt.current = { active, answers };
  // ================= LOAD =================
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const p = await getTestsApi({ type: "pastPaper" });
      const a = await getMyAttempts();
      const s = await getSubjectsApi();

      setPapers(p?.data || []);
      setAttempts(a?.data || []);
      setSubjects(s?.data || s?.subjects || s || []);
    } catch {
      toast.error("Failed to load past papers");
    } finally {
      setLoading(false);
    }
  };

  // ================= MAP ATTEMPTS =================
  const attemptMap = useMemo(() => {
    const map = {};
    attempts.forEach((a) => {
      const id = String(a.testId?._id || a.testId);
      map[id] = a;
    });
    return map;
  }, [attempts]);

  // ================= FILTER =================
 const filtered = useMemo(() => {
  return papers.filter((p) => {
    const titleMatch = p.title
      ?.toLowerCase()
      .includes(query.toLowerCase());

    const subjectMatch =
      subjectFilter === "all"
        ? true
        : String(p.subjectId?._id || p.subjectId) ===
          String(subjectFilter);

    const yearMatch =
      yearFilter === "all"
        ? true
        : String(p.paperYear || "") === String(yearFilter);

    return titleMatch && subjectMatch && yearMatch;
  });
}, [papers, query, subjectFilter, yearFilter]);

  const availableYears = useMemo(() => {
    const years = papers
      .map((p) => p.paperYear)
      .filter(Boolean);
    return [...new Set(years)].sort((a, b) => b - a);
  }, [papers]);

  const questionCount = (paper) =>
    paper.questions?.length || paper.questionCount || 0;

  // ================= START TEST =================
  const start = async (paper) => {
    try {
      const r = await getTestApi(paper._id);
      setActive(r?.data);
      setAnswers({});
      setResult(null);
    } catch {
      toast.error("Failed to open paper");
    }
  };

  // ================= SUBMIT =================
  const submit = useCallback(async (fromTimer = false) => {
    const { active: act, answers: ans } = latestAttempt.current;
    if (!act) return;
    try {
      const payload = Object.entries(ans).map(
        ([questionId, selectedOption]) => ({
          questionId,
          selectedOption,
        })
      );

      const r = await createAttempt({
        testId: act._id,
        answers: payload,
      });

      setResult({
        ...r?.data,
        questions: act.questions,
        answers: payload,
      });

      setSecondsLeft(null);
      toast.success(fromTimer ? "Time's up — paper submitted." : "Submitted!");
      loadData();
    } catch {
      toast.error("Submit failed");
    }
  }, []);

  useEffect(() => {
    setSecondsLeft(null);
    if (!active || result) return;

    const totalSec = Math.max(0, Math.floor(Number(active.duration) * 60));
    if (totalSec <= 0) return;

    let remaining = totalSec;
    setSecondsLeft(remaining);

    const id = setInterval(() => {
      remaining -= 1;
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(id);
        submit(true);
      }
    }, 1000);

    return () => clearInterval(id);
  }, [active?._id, result, submit]);

  // ================= VIEW SOLUTION =================
  const openResult = async (paper, attempt) => {
    const res = await getTestApi(paper._id);

    setResult({
      ...attempt,
      questions: res?.data?.questions || [],
      answers: attempt.answers || [],
    });
  };

  // ================= RESULT SCREEN =================
  if (result) {
    const answersMap = {};
    (result.answers || []).forEach((a) => {
      answersMap[a.questionId] = a.selectedOption;
    });
    return (
      <div className="page-shell study-page exam-session">
        <h1 className="exam-session__title exam-session__title--lg">
          Solutions
        </h1>

        <div className="exam-card">
          <p className="exam-result-score">
            {result.score}/{result.totalQuestions}
          </p>
          <p className="exam-result-meta">
            Percentile: {result.percentile}%
          </p>
        </div>

        {(result.questions || []).map((q, i) => {
          const selected = answersMap[q._id];
          const correct = q.correctAnswer;
          const isCorrect = Number(selected) === Number(correct);

          return (
            <div key={q._id} className="exam-card">
              <p className="exam-card__question">
                Q{i + 1}. {q.text}
              </p>

              <div>
                {q.options?.map((o, idx) => {
                  const isUser = selected === idx;
                  const isAns = correct === idx;

                  return (
                    <div
                      key={idx}
                      className={`exam-solution-option${
                        isAns
                          ? " exam-solution-option--correct"
                          : isUser
                          ? " exam-solution-option--wrong"
                          : " exam-solution-option--neutral"
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}. {o}
                    </div>
                  );
                })}
              </div>

              <p className={`exam-verdict ${isCorrect ? "exam-verdict--correct" : "exam-verdict--wrong"}`}>
                {isCorrect
                  ? "Correct"
                  : `Wrong (Correct: ${String.fromCharCode(65 + correct)})`}
              </p>

              {q.explanation && (
                <p className="exam-explanation">💡 {q.explanation}</p>
              )}
            </div>
          );
        })}

        <div className="exam-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setResult(null);
              setActive(null);
            }}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // ================= ACTIVE TEST =================
  if (active) {
    const qs = active.questions || [];
    const durationMin = Math.max(0, Number(active.duration) || 0);
    const hasLimit = durationMin > 0;

    return (
      <div className="page-shell study-page exam-session">
        <h1 className="exam-session__title exam-session__title--lg">
          {active.title}
        </h1>

        <p className="exam-session__hint">
          {qs.length} MCQs
          {active.paperYear ? ` · ${active.paperYear}` : ""}
        </p>

        {hasLimit && (
          <div className="exam-timer-bar">
            <span className="exam-timer-bar__meta">
              Time limit: <strong>{durationMin} min</strong> to complete
            </span>
            {secondsLeft !== null && (
              <span
                className={`exam-timer-bar__countdown${
                  secondsLeft <= 60 ? " exam-timer-bar__countdown--urgent" : ""
                }`}
              >
                {formatCountdown(secondsLeft)} left
              </span>
            )}
          </div>
        )}

        {!hasLimit && (
          <p className="exam-session__hint">
            No time limit — complete at your own pace.
          </p>
        )}

        {qs.map((q, i) => (
          <div key={q._id} className="exam-card">
            <p className="exam-card__question">
              Q{i + 1}. {q.text}
            </p>

            {q.options?.map((o, idx) => (
              <label key={idx} className="exam-option">
                <input
                  type="radio"
                  name={q._id}
                  checked={answers[q._id] === idx}
                  onChange={() =>
                    setAnswers((p) => ({
                      ...p,
                      [q._id]: idx,
                    }))
                  }
                />
                <span>
                  {String.fromCharCode(65 + idx)}. {o}
                </span>
              </label>
            ))}
          </div>
        ))}

        <div className="exam-actions">
          <button type="button" className="btn-primary" onClick={() => submit(false)}>
            Submit
          </button>
          <button type="button" className="btn-ghost" onClick={() => setActive(null)}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  const hasActiveFilters =
    Boolean(query.trim()) || subjectFilter !== "all" || yearFilter !== "all";

  const clearFilters = () => {
    clearQuery();
    setSubjectFilter("all");
    setYearFilter("all");
  };

  // ================= MAIN =================
  return (
    <div className="page-shell study-page">
      <PageHeader
        eyebrow={{ icon: BookOpen, label: "Archive" }}
        title="Past Papers & Solutions"
        description="Attempt past papers and review detailed solutions."
      />

      <FilterPanel hasActiveFilters={hasActiveFilters} onClear={clearFilters} ariaLabel="Filter past papers">
        <FilterRow>
          <FilterField label="Subject" icon={BookOpen}>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              aria-label="Subject"
            >
              <option value="all">All subjects</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </FilterField>
          {availableYears.length > 0 && (
            <FilterField label="Year" icon={BookOpen}>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                aria-label="Year"
              >
                <option value="all">All years</option>
                {availableYears.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </FilterField>
          )}
        </FilterRow>
      </FilterPanel>

      {loading ? (
        <SkeletonItemCards count={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No papers found"
          description="Try a different search or subject filter."
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
          <ListMeta end={filtered.length} label={`paper${filtered.length === 1 ? "" : "s"}`} />
          <div className="data-list">
          {filtered.map((p) => {
            const old = attemptMap[p._id];

            return (
              <article key={p._id} className="item-card">
                <div className="item-card__body">
                <header className="item-card__head">
                  <h3 className="item-card__head-title">{p.title}</h3>
                  <div className="flex gap-2">
                    {p.paperYear && (
                      <span className="badge badge--dark">{p.paperYear}</span>
                    )}
                    {old && <span className="badge badge--success">Solved</span>}
                  </div>
                </header>

                <p className="item-card__meta">
                  {questionCount(p)} MCQs
                  {p.duration ? ` · ${p.duration} min` : ""}
                  {p.subjectId?.name ? ` · ${p.subjectId.name}` : ""}
                </p>

                {old ? (
                  <>
                    <p className="item-card__meta">
                      Score: {old.score}/{old.totalQuestions}
                    </p>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => openResult(p, old)}
                    >
                      View Solution
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => start(p)}
                  >
                    Start Test
                  </button>
                )}
                </div>
              </article>
            );
          })}
          </div>
        </>
      )}
    </div>
  );
}