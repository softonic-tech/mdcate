"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getTestsApi,
  getTestApi,
  generateAdaptiveTest,
} from "@/api/test.api";
import { createAttempt, getMyAttempts } from "@/api/testAttempt.api";
import { getSubjectsApi } from "@/api/subject.api";
import toast from "react-hot-toast";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import { CustomSelect } from "@/components/dashboard/CustomSelect";
import {
  FilterPanel,
  FilterField,
  FilterRow,
  FilterPills,
  ListMeta,
  StatStrip,
} from "@/components/dashboard/StudyPageUI";
import { usePageSearch } from "@/hooks/usePageSearch";
import {
  FileText,
  BookOpen,
  Clock,
  HelpCircle,
  Sparkles,
  Zap,
  Play,
  Eye,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  Target,
  Timer,
  Tag,
} from "lucide-react";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

const TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "mock", label: "Mock" },
  { value: "quiz", label: "Quiz" },
  { value: "adaptive", label: "Adaptive" },
  { value: "pastPaper", label: "Past paper" },
];

const TYPE_META = {
  mock: { label: "Mock", badge: "test-badge--mock", icon: FileText },
  quiz: { label: "Quiz", badge: "test-badge--quiz", icon: Zap },
  adaptive: { label: "Adaptive", badge: "test-badge--adaptive", icon: Sparkles },
  pastPaper: { label: "Past paper", badge: "test-badge--paper", icon: BookOpen },
};

function formatCountdown(totalSeconds) {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function pct(score, total) {
  if (!total) return 0;
  return Math.round((score / total) * 100);
}

function TestTypeBadge({ type }) {
  const meta = TYPE_META[type] || { label: type || "Test", badge: "test-badge--default" };
  return <span className={`test-badge ${meta.badge}`}>{meta.label}</span>;
}

function TestCard({ test, attempt, onStart, onSolution }) {
  const meta = TYPE_META[test.type] || TYPE_META.mock;
  const Icon = meta.icon;
  const qCount = test.questions?.length || 0;
  const done = Boolean(attempt);
  const scorePct = done ? pct(attempt.score, attempt.totalQuestions) : null;

  return (
    <article className={`test-card${done ? " test-card--done" : ""}`}>
      <div className="test-card__top">
        <span className="test-card__icon" aria-hidden="true">
          <Icon size={20} strokeWidth={1.7} />
        </span>
        <TestTypeBadge type={test.type} />
      </div>

      <h3 className="test-card__title">{test.title}</h3>

      <div className="test-card__stats">
        <span>
          <HelpCircle size={14} aria-hidden="true" />
          {qCount} questions
        </span>
        <span>
          <Clock size={14} aria-hidden="true" />
          {test.duration ? `${test.duration} min` : "No limit"}
        </span>
      </div>

      {test.subjectId?.name && (
        <p className="test-card__subject">
          <BookOpen size={13} aria-hidden="true" />
          {test.subjectId.name}
        </p>
      )}

      {done && (
        <div className="test-card__score">
          <span className="test-card__score-label">Your score</span>
          <strong>
            {attempt.score}/{attempt.totalQuestions}
          </strong>
          <span className="test-card__score-pct">{scorePct}%</span>
        </div>
      )}

      <div className="test-card__actions">
        {done ? (
          <button type="button" className="btn-primary test-card__btn" onClick={() => onSolution(test)}>
            <Eye size={15} />
            Review solutions
          </button>
        ) : (
          <button type="button" className="btn-primary test-card__btn" onClick={() => onStart(test)}>
            <Play size={15} />
            Start test
          </button>
        )}
      </div>
    </article>
  );
}

export default function MockTestsPage() {
  const { query, clearQuery } = usePageSearch("Search tests…");
  const [tests, setTests] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [active, setActive] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [solutionTest, setSolutionTest] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [adaptiveSubject, setAdaptiveSubject] = useState("");
  const [generating, setGenerating] = useState(false);
  const latestAttempt = useRef({ active: null, answers: {} });
  latestAttempt.current = { active, answers };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const t = await getTestsApi();
      const s = await getSubjectsApi();
      const a = await getMyAttempts();
      setTests(t?.data || []);
      setSubjects(s?.data || s?.subjects || s || []);
      setAttempts(a?.data || []);
    } catch {
      toast.error("Failed to load tests");
    }
  };

  const attemptMap = useMemo(() => {
    const map = {};
    attempts.forEach((a) => {
      const id = String(a.testId?._id || a.testId);
      map[id] = a;
    });
    return map;
  }, [attempts]);

  const openSolution = async (test) => {
    try {
      const r = await getTestApi(test._id);
      setSolutionTest(r?.data);
    } catch {
      toast.error("Failed to load solution");
    }
  };

  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      const titleMatch = t.title?.toLowerCase().includes(query.toLowerCase());
      const typeMatch = typeFilter === "all" ? true : t.type === typeFilter;
      const subjectMatch =
        subjectFilter === "all"
          ? true
          : String(t.subjectId?._id || t.subjectId) === String(subjectFilter);
      return titleMatch && typeMatch && subjectMatch;
    });
  }, [tests, query, typeFilter, subjectFilter]);

  const completedCount = useMemo(
    () => filteredTests.filter((t) => attemptMap[t._id]).length,
    [filteredTests, attemptMap]
  );

  const start = async (test) => {
    try {
      const r = await getTestApi(test._id);
      setActive(r?.data);
      setAnswers({});
      setResult(null);
      setSolutionTest(null);
    } catch {
      toast.error("Failed to open test");
    }
  };

  const genAdaptive = async () => {
    if (!adaptiveSubject) {
      toast.error("Select a subject first");
      return;
    }
    setGenerating(true);
    try {
      const r = await generateAdaptiveTest({ subjectId: adaptiveSubject, count: 30 });
      const full = await getTestApi(r?.data?._id);
      setActive(full?.data);
      setAnswers({});
      setResult(null);
      setSolutionTest(null);
      toast.success("Adaptive test ready!");
    } catch {
      toast.error("Failed to generate adaptive test");
    } finally {
      setGenerating(false);
    }
  };

  const submit = useCallback(async (fromTimer = false) => {
    const { active: act, answers: ans } = latestAttempt.current;
    if (!act) return;
    try {
      const payload = Object.entries(ans).map(([questionId, selectedOption]) => ({
        questionId,
        selectedOption,
      }));

      const r = await createAttempt({ testId: act._id, answers: payload });
      setResult(r?.data);
      setSecondsLeft(null);
      setConfirmSubmit(false);
      await loadData();
      toast.success(fromTimer ? "Time's up — test submitted." : "Submitted!");
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Submit failed");
    }
  }, []);

  const requestSubmit = () => {
    const qs = active?.questions || [];
    const answered = Object.keys(answers).length;
    if (answered < qs.length) {
      setConfirmSubmit(true);
      return;
    }
    submit(false);
  };

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

  const exitSession = () => {
    setActive(null);
    setAnswers({});
    setResult(null);
    setSolutionTest(null);
    setSecondsLeft(null);
  };

  // ── Result screen ──
  if (result && active) {
    const answersMap = {};
    (result.answers || []).forEach((a) => {
      answersMap[String(a.questionId?._id || a.questionId)] = a.selectedOption;
    });
    const questions = active.questions || [];
    const scorePct = pct(result.score, result.totalQuestions);
    const wrong = result.totalQuestions - result.score;

    return (
      <div className="page-shell study-page exam-session">
        <div className="exam-result-hero">
          <div className="exam-result-hero__ring" style={{ "--pct": scorePct }}>
            <span className="exam-result-hero__pct">{scorePct}%</span>
          </div>
          <div className="exam-result-hero__info">
            <span className="badge badge--success exam-result-hero__badge">
              <Trophy size={14} />
              Test complete
            </span>
            <h1 className="exam-result-hero__title">{active.title}</h1>
            <p className="exam-result-hero__score">
              {result.score} / {result.totalQuestions} correct
            </p>
            <p className="exam-result-hero__meta">Percentile: {result.percentile}%</p>
          </div>
        </div>

        <StatStrip
          items={[
            { label: "Correct", value: result.score, success: true },
            { label: "Incorrect", value: wrong },
            { label: "Accuracy", value: `${scorePct}%`, accent: true, progress: scorePct },
          ]}
        />

        <div className="exam-section-label">
          <h2>Answer review</h2>
        </div>

        {questions.map((q, i) => {
          const qid = String(q._id);
          const selected = answersMap[qid];
          const correct = q.correctAnswer;
          const isCorrect = Number(selected) === Number(correct);
          const unanswered = selected === undefined;

          return (
            <article
              key={q._id}
              className={`exam-card exam-card--review${isCorrect ? " exam-card--correct" : unanswered ? "" : " exam-card--wrong"}`}
            >
              <header className="exam-card__head">
                <span className="exam-card__num">Q{i + 1}</span>
                <span className={`exam-card__verdict${isCorrect ? " exam-card__verdict--ok" : unanswered ? " exam-card__verdict--skip" : " exam-card__verdict--bad"}`}>
                  {isCorrect ? (
                    <>
                      <CheckCircle2 size={14} /> Correct
                    </>
                  ) : unanswered ? (
                    "Skipped"
                  ) : (
                    <>
                      <XCircle size={14} /> Wrong
                    </>
                  )}
                </span>
              </header>

              <p className="exam-card__question">{q.text}</p>

              <div className="exam-options">
                {q.options?.map((o, idx) => {
                  const isAns = correct === idx;
                  const isUser = selected === idx;
                  let cls = "exam-option exam-option--review";
                  if (isAns) cls += " exam-option--correct";
                  else if (isUser) cls += " exam-option--wrong";

                  return (
                    <div key={idx} className={cls}>
                      <span className="exam-option__letter">{LETTERS[idx] || idx + 1}</span>
                      <span className="exam-option__text">{o}</span>
                    </div>
                  );
                })}
              </div>

              {q.explanation && (
                <p className="exam-explanation">
                  <Target size={14} aria-hidden="true" />
                  {q.explanation}
                </p>
              )}
            </article>
          );
        })}

        <div className="exam-actions exam-actions--sticky">
          <button type="button" className="btn-primary" onClick={exitSession}>
            Back to tests
          </button>
        </div>
      </div>
    );
  }

  // ── Active test ──
  if (active) {
    const qs = active.questions || [];
    const durationMin = Math.max(0, Number(active.duration) || 0);
    const hasLimit = durationMin > 0;
    const answered = Object.keys(answers).length;
    const progress = qs.length ? (answered / qs.length) * 100 : 0;
    const totalSec = hasLimit ? durationMin * 60 : 0;
    const timeProgress = hasLimit && secondsLeft !== null ? (secondsLeft / totalSec) * 100 : 100;

    return (
      <div className="page-shell study-page exam-session">
        <div className="exam-toolbar">
          <button type="button" className="exam-toolbar__back btn-ghost" onClick={exitSession}>
            <ChevronLeft size={16} />
            Exit
          </button>
          <div className="exam-toolbar__center">
            <h1 className="exam-toolbar__title">{active.title}</h1>
            <p className="exam-toolbar__sub">
              {answered} of {qs.length} answered
            </p>
          </div>
          {hasLimit && secondsLeft !== null ? (
            <div className={`exam-toolbar__timer${secondsLeft <= 60 ? " exam-toolbar__timer--urgent" : ""}`}>
              <Timer size={16} />
              {formatCountdown(secondsLeft)}
            </div>
          ) : (
            <span className="exam-toolbar__open">No time limit</span>
          )}
        </div>

        <div className="exam-progress">
          <div className="exam-progress__bar" aria-hidden="true">
            <span className="exam-progress__fill" style={{ width: `${progress}%` }} />
          </div>
          {hasLimit && (
            <div className="exam-progress__time" aria-hidden="true">
              <span
                className={`exam-progress__time-fill${secondsLeft <= 60 ? " exam-progress__time-fill--urgent" : ""}`}
                style={{ width: `${timeProgress}%` }}
              />
            </div>
          )}
        </div>

        <div className="exam-nav-dots" aria-label="Answer progress">
          {qs.map((q, i) => {
            const done = answers[q._id] !== undefined;
            return (
              <button
                key={q._id}
                type="button"
                className={`exam-nav-dot${done ? " exam-nav-dot--done" : ""}`}
                title={`Question ${i + 1}${done ? " — answered" : ""}`}
                onClick={() => document.getElementById(`exam-q-${q._id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
              />
            );
          })}
        </div>

        {qs.map((q, i) => (
          <article key={q._id} id={`exam-q-${q._id}`} className="exam-card exam-card--active">
            <header className="exam-card__head">
              <span className="exam-card__num">Question {i + 1}</span>
              <span className="exam-card__of">of {qs.length}</span>
            </header>
            <p className="exam-card__question">{q.text}</p>

            <div className="exam-options">
              {q.options?.map((o, j) => {
                const selected = answers[q._id] === j;
                return (
                  <button
                    key={j}
                    type="button"
                    className={`exam-option${selected ? " exam-option--selected" : ""}`}
                    onClick={() => setAnswers((p) => ({ ...p, [q._id]: j }))}
                  >
                    <span className="exam-option__letter">{LETTERS[j] || j + 1}</span>
                    <span className="exam-option__text">{o}</span>
                  </button>
                );
              })}
            </div>
          </article>
        ))}

        <div className="exam-actions exam-actions--sticky">
          <button type="button" className="btn-primary" onClick={requestSubmit}>
            Submit test ({answered}/{qs.length})
          </button>
          <button type="button" className="btn-ghost" onClick={exitSession}>
            Cancel
          </button>
        </div>

        <ConfirmDialog
          open={confirmSubmit}
          onClose={() => setConfirmSubmit(false)}
          onConfirm={() => submit(false)}
          title="Submit with unanswered questions?"
          message={`You have ${qs.length - answered} question${qs.length - answered === 1 ? "" : "s"} left. Submit anyway?`}
          confirmLabel="Submit anyway"
          cancelLabel="Keep working"
          variant="primary"
        />
      </div>
    );
  }

  // ── Solution view (past attempt) ──
  if (solutionTest) {
    const qs = solutionTest.questions || [];
    const attempt = attemptMap[solutionTest._id];

    return (
      <div className="page-shell study-page exam-session">
        <div className="exam-toolbar exam-toolbar--solution">
          <button type="button" className="exam-toolbar__back btn-ghost" onClick={() => setSolutionTest(null)}>
            <ChevronLeft size={16} />
            Back
          </button>
          <div className="exam-toolbar__center">
            <h1 className="exam-toolbar__title">{solutionTest.title}</h1>
            <p className="exam-toolbar__sub">Solution review</p>
          </div>
          {attempt && (
            <span className="exam-toolbar__score">
              {attempt.score}/{attempt.totalQuestions}
            </span>
          )}
        </div>

        {qs.map((q, i) => (
          <article key={q._id} className="exam-card exam-card--review">
            <header className="exam-card__head">
              <span className="exam-card__num">Q{i + 1}</span>
            </header>
            <p className="exam-card__question">{q.text}</p>
            <div className="exam-options">
              {q.options?.map((o, j) => {
                const isCorrect = q.correctAnswer === j;
                return (
                  <div
                    key={j}
                    className={`exam-option exam-option--review${isCorrect ? " exam-option--correct" : ""}`}
                  >
                    <span className="exam-option__letter">{LETTERS[j] || j + 1}</span>
                    <span className="exam-option__text">
                      {o}
                      {isCorrect && (
                        <CheckCircle2 size={16} className="exam-option__check" aria-label="Correct answer" />
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
            {q.explanation && (
              <p className="exam-explanation">
                <Target size={14} aria-hidden="true" />
                {q.explanation}
              </p>
            )}
          </article>
        ))}
      </div>
    );
  }

  const hasActiveFilters =
    Boolean(query.trim()) || typeFilter !== "all" || subjectFilter !== "all";

  const clearFilters = () => {
    clearQuery();
    setTypeFilter("all");
    setSubjectFilter("all");
  };

  return (
    <div className="page-shell study-page tests-page">
      <PageHeader
        eyebrow={{ icon: FileText, label: "Exams" }}
        title="Tests"
        description="Mock exams, quick quizzes, and adaptive practice — timed or at your own pace."
      />

      <section className="test-adaptive-panel">
        <div className="test-adaptive-panel__icon" aria-hidden="true">
          <Sparkles size={22} />
        </div>
        <div className="test-adaptive-panel__body">
          <h2>Adaptive practice</h2>
          <p>Generate a 30-question test tailored to your weak areas in any subject.</p>
          <div className="test-adaptive-panel__row">
            <CustomSelect
              className="test-adaptive-panel__select"
              value={adaptiveSubject}
              onChange={(e) => setAdaptiveSubject(e.target.value)}
              aria-label="Subject for adaptive test"
            >
              <option value="">Choose subject…</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </CustomSelect>
            <button
              type="button"
              className="btn-primary"
              onClick={genAdaptive}
              disabled={generating || !adaptiveSubject}
            >
              <Sparkles size={15} />
              {generating ? "Generating…" : "Generate test"}
            </button>
          </div>
        </div>
      </section>

      {filteredTests.length > 0 && (
        <StatStrip
          items={[
            { label: "Available", value: filteredTests.length },
            { label: "Completed", value: completedCount, success: completedCount > 0 },
            {
              label: "Remaining",
              value: filteredTests.length - completedCount,
              accent: true,
            },
          ]}
        />
      )}

      <FilterPanel hasActiveFilters={hasActiveFilters} onClear={clearFilters} ariaLabel="Filter tests">
        <FilterRow>
          <FilterField label="Subject" icon={BookOpen}>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              aria-label="Subject"
            >
              <option value="all">All subjects</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </FilterField>
        </FilterRow>
        <FilterPills
          label="Type"
          icon={Tag}
          options={TYPE_OPTIONS}
          value={typeFilter}
          onChange={setTypeFilter}
          ariaLabel="Test type"
        />
      </FilterPanel>

      {filteredTests.length > 0 && (
        <ListMeta end={filteredTests.length} label={`test${filteredTests.length === 1 ? "" : "s"}`} />
      )}

      {filteredTests.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No tests found"
          description="Try a different search or filter, or generate an adaptive test above."
          action={
            hasActiveFilters ? (
              <button type="button" className="btn-primary" onClick={clearFilters}>
                Clear filters
              </button>
            ) : null
          }
        />
      ) : (
        <div className="test-grid">
          {filteredTests.map((t) => (
            <TestCard
              key={t._id}
              test={t}
              attempt={attemptMap[t._id]}
              onStart={start}
              onSolution={openSolution}
            />
          ))}
        </div>
      )}
    </div>
  );
}
