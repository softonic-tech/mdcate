"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
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

const S = {
  page: {
    padding: 20,
    background: "#0f172a",
    minHeight: "100vh",
    color: "#fff",
  },

  card: {
    background: "#1e293b",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },

  btn: {
    padding: "10px 16px",
    borderRadius: 8,
    border: "none",
    background: "#0ea5e9",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
  },

  btnGray: {
    padding: "10px 16px",
    borderRadius: 8,
    border: "none",
    background: "#334155",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
  },

  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #334155",
    background: "#1e293b",
    color: "#fff",
  },
};

// ✅ FIX: normalize answers safely
const normalizeAnswers = (arr = []) => {
  const map = {};
  arr.forEach((a) => {
    map[String(a.questionId)] = a.selectedOption;
  });
  return map;
};

export default function PastPapersPage() {
  const [papers, setPapers] = useState([]);
  const [attempts, setAttempts] = useState([]);

  const [active, setActive] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const [search, setSearch] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [secondsLeft, setSecondsLeft] = useState(null);
  const latestAttempt = useRef({ active: null, answers: {} });
  latestAttempt.current = { active, answers };
  // ================= LOAD =================
  useEffect(() => {
    loadData();
  }, []);

const loadData = async () => {
  try {
    const p = await getTestsApi({ type: "pastPaper" });
    const a = await getMyAttempts();
    const s = await getSubjectsApi(); 

    setPapers(p?.data || []);
    setAttempts(a?.data || []);
    setSubjects(s?.data || s?.subjects || s || []);
  } catch {
    toast.error("Failed to load past papers");
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
      .includes(search.toLowerCase());

    const subjectMatch =
      subjectFilter === "all"
        ? true
        : String(p.subjectId?._id || p.subjectId) ===
          String(subjectFilter);

    return titleMatch && subjectMatch;
  });
}, [papers, search, subjectFilter]);

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
      <div style={S.page}>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>
          Solutions
        </h1>

        <div style={S.card}>
          <h2 style={{ color: "#2dd4bf", fontSize: 32 }}>
            {result.score}/{result.totalQuestions}
          </h2>
          <p style={{ color: "#94a3b8" }}>
            Percentile: {result.percentile}%
          </p>
        </div>

        {(result.questions || []).map((q, i) => {
          const selected = answersMap[q._id];
          const correct = q.correctAnswer; 
         const isCorrect = Number(selected) === Number(correct);

          return (
            <div key={q._id} style={S.card}>
              <p style={{ fontWeight: 700 }}>
                Q{i + 1}. {q.text}
              </p>

              <div style={{ marginTop: 10 }}>
                {q.options?.map((o, idx) => {
                  const isUser = selected === idx;
                  const isAns = correct === idx;

                  return (
                    <div
                      key={idx}
                      style={{
                        padding: 8,
                        marginBottom: 6,
                        borderRadius: 6,
                        background: isAns
                          ? "#14532d"
                          : isUser
                          ? "#7f1d1d"
                          : "#0f172a",
                        color: isAns
                          ? "#22c55e"
                          : isUser
                          ? "#ef4444"
                          : "#cbd5e1",
                      }}
                    >
                      {String.fromCharCode(65 + idx)}. {o}
                    </div>
                  );
                })}
              </div>

              <p
                style={{
                  marginTop: 8,
                  fontWeight: 700,
                  color: isCorrect ? "#22c55e" : "#ef4444",
                }}
              >
                {isCorrect
                  ? "Correct"
                  : `Wrong (Correct: ${String.fromCharCode(
                      65 + correct
                    )})`}
              </p>

              {q.explanation && (
                <p style={{ color: "#94a3b8" }}>
                  💡 {q.explanation}
                </p>
              )}
            </div>
          );
        })}

        <button
          style={S.btn}
          onClick={() => {
            setResult(null);
            setActive(null);
          }}
        >
          Back
        </button>
      </div>
    );
  }

  // ================= ACTIVE TEST =================
  if (active) {
    const qs = active.questions || [];
    const durationMin = Math.max(0, Number(active.duration) || 0);
    const hasLimit = durationMin > 0;

    return (
      <div style={S.page}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>
          {active.title}
        </h1>

        {hasLimit && (
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 10,
              marginBottom: 16,
              padding: "12px 16px",
              borderRadius: 8,
              background: "rgba(30, 58, 95, 0.95)",
              border: "1px solid rgba(51, 65, 85, 0.9)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "8px 16px",
              fontSize: 14,
            }}
          >
            <span style={{ color: "#94a3b8" }}>
              Time limit: <strong style={{ color: "#e2e8f0" }}>{durationMin} min</strong> to complete
            </span>
            {secondsLeft !== null && (
              <span
                style={{
                  fontWeight: 800,
                  fontVariantNumeric: "tabular-nums",
                  fontSize: 18,
                  color: secondsLeft <= 60 ? "#f87171" : "#38bdf8",
                }}
              >
                {formatCountdown(secondsLeft)} left
              </span>
            )}
          </div>
        )}

        {!hasLimit && (
          <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 16 }}>
            No time limit — complete at your own pace.
          </p>
        )}

        {qs.map((q, i) => (
          <div key={q._id} style={S.card}>
            <p style={{ fontWeight: 700 }}>
              Q{i + 1}. {q.text}
            </p>

            {q.options?.map((o, idx) => (
              <label
                key={idx}
                style={{ display: "block", marginTop: 6 }}
              >
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
                {" "}
                {String.fromCharCode(65 + idx)}. {o}
              </label>
            ))}
          </div>
        ))}

        <button style={S.btn} onClick={() => submit(false)}>
          Submit
        </button>

        <button
          style={{ ...S.btnGray, marginLeft: 10 }}
          onClick={() => setActive(null)}
        >
          Cancel
        </button>
      </div>
    );
  }

  // ================= MAIN =================
  return (
    <div style={S.page}>
      <h1 style={{ fontSize: 26, fontWeight: 800 }}>
        Past Papers & Solutions
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 10,
          marginTop: 12,
        }}
      >
      {/* SEARCH */}
      <input
        style={S.input}
        placeholder="Search paper..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* SUBJECT FILTER */}
      <select
        style={S.input}
        value={subjectFilter}
        onChange={(e) => setSubjectFilter(e.target.value)}
      >
        <option value="all">All Subjects</option>

        {subjects.map((s) => (
          <option key={s._id} value={s._id}>
            {s.name}
          </option>
        ))}
      </select>
    </div>
      <div style={{ marginTop: 20 }}>
        {filtered.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>
            No papers found
          </p>
        ) : (
          filtered.map((p) => {
            const old = attemptMap[p._id];

            return (
              <div key={p._id} style={S.card}>
                <h3 style={{ fontWeight: 800 }}>
                  {p.title}
                </h3>

                <p style={{ color: "#94a3b8" }}>
                  {p.questions?.length || 0} Questions
                </p>

                {old ? (
                  <>
                    <span
                      onClick={() =>
                        openResult(p, old)
                      }
                      style={{
                        display: "inline-block",
                        marginTop: 10,
                        padding: "4px 10px",
                        borderRadius: 20,
                        background: "#14532d",
                        color: "#86efac",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      ✅ Solved (View Solution)
                    </span>

                    <p
                      style={{
                        marginTop: 8,
                        fontSize: 13,
                        color: "#cbd5e1",
                      }}
                    >
                      Score: {old.score}/
                      {old.totalQuestions}
                    </p>
                  </>
                ) : (
                  <button
                    style={{ ...S.btn, marginTop: 10 }}
                    onClick={() => start(p)}
                  >
                    Start Test
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}