"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getTestsApi,
  getTestApi,
  generateAdaptiveTest,
} from "@/api/test.api";
import { createAttempt } from "@/api/testAttempt.api";
import { getSubjectsApi } from "@/api/subject.api";
import { getMyAttempts } from "@/api/testAttempt.api";
import toast from "react-hot-toast";

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
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },

  btn: {
    padding: "8px 16px",
    borderRadius: 6,
    background: "#267bdc",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
  },

  btnSec: {
    padding: "8px 16px",
    borderRadius: 6,
    background: "#334155",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },

  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #334155",
    background: "#1e293b",
    color: "#fff",
    width: "100%",
  },

  select: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #334155",
    background: "#1e293b",
    color: "#fff",
  },
};

export default function MockTestsPage() {
  const [tests, setTests] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [active, setActive] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [solutionTest, setSolutionTest] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const latestAttempt = useRef({ active: null, answers: {} });
  latestAttempt.current = { active, answers };

  // ================= LOAD =================
  useEffect(() => {
    loadData();
  }, []);

  // const loadData = async () => {
  //   try {
  //     const t = await getTestsApi();
  //     const s = await getSubjectsApi();

  //     console.log("TESTS:", t);
  //     console.log("SUBJECTS:", s);

  //     setTests(t?.data || []);

  //     // ✅ FIX HERE
  //     setSubjects(
  //       s?.data ||
  //       s?.subjects ||
  //       s ||
  //       []
  //     );
  //   } catch {
  //     toast.error("Failed to load tests");
  //   }
  // };

  const loadData = async () => {
  try {
    const t = await getTestsApi();
    const s = await getSubjectsApi();
    const a = await getMyAttempts(); // ✅ ADD THIS

    setTests(t?.data || []);
    setSubjects(s?.data || s?.subjects || s || []);
    setAttempts(a?.data || []); // ✅ ADD THIS
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

  const calculateScore = (questions, answers) => {
  let score = 0;

  questions.forEach(q => {
    const userAns = answers.find(
      a => String(a.questionId) === String(q._id)
    )?.selectedOption;

    if (Number(userAns) === Number(q.correctAnswer)) {
      score++;
    }
  });

  return score;
};

const openSolution = async (test) => {
  try {
    const r = await getTestApi(test._id);
    setSolutionTest(r?.data);
  } catch {
    toast.error("Failed to load solution");
  }
};
  // ================= FILTERED TESTS =================
  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      const titleMatch = t.title
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const typeMatch =
        typeFilter === "all"
          ? true
          : t.type === typeFilter;

      const subjectMatch =
        subjectFilter === "all"
          ? true
          : String(t.subjectId?._id || t.subjectId) ===
            String(subjectFilter);

      return titleMatch && typeMatch && subjectMatch;
    });
  }, [tests, search, typeFilter, subjectFilter]);

  // ================= START TEST =================
  const start = async (test) => {
    try {
      const r = await getTestApi(test._id);

      setActive(r?.data);
      setAnswers({});
      setResult(null);
    } catch {
      toast.error("Failed to open test");
    }
  };

  // ================= GENERATE ADAPTIVE =================
  const genAdaptive = async (sid) => {
    try {
      const r = await generateAdaptiveTest({
        subjectId: sid,
        count: 30,
      });

      const full = await getTestApi(r?.data?._id);

      setActive(full?.data);
      setAnswers({});
      setResult(null);

      toast.success("Adaptive test ready!");
    } catch {
      toast.error("Failed");
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

      setResult(r?.data);
      setSecondsLeft(null);
      toast.success(fromTimer ? "Time's up — test submitted." : "Submitted!");
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

  // ================= RESULT =================
  if (result) {
    return (
      <div style={S.page}>
        <h2 style={{ fontSize: 24, fontWeight: 700 }}>
          Result
        </h2>

        <div style={S.card}>
          <p
            style={{
              fontSize: 38,
              fontWeight: 800,
              color: "#2bdbc3",
            }}
          >
            {result.score}/{result.totalQuestions}
          </p>

          <p style={{ color: "#94a3b8" }}>
            Percentile: {result.percentile}%
          </p>
        </div>

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
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>
          {active.title}
        </h2>

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
                  color: secondsLeft <= 60 ? "#f87171" : "#2dd4bf",
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

            {q.options?.map((o, j) => (
              <label
                key={j}
                style={{
                  display: "block",
                  padding: "4px 0",
                }}
              >
                <input
                  type="radio"
                  name={q._id}
                  checked={answers[q._id] === j}
                  onChange={() =>
                    setAnswers((p) => ({
                      ...p,
                      [q._id]: j,
                    }))
                  }
                  style={{ marginRight: 8 }}
                />
                {String.fromCharCode(65 + j)}. {o}
              </label>
            ))}
          </div>
        ))}

        <button style={S.btn} onClick={() => submit(false)}>
          Submit ({Object.keys(answers).length}/{qs.length})
        </button>

        <button
          style={{ ...S.btnSec, marginLeft: 10 }}
          onClick={() => setActive(null)}
        >
          Cancel
        </button>
      </div>
    );
  }
  // ================= SOLUTION VIEW =================
if (solutionTest) {
  const qs = solutionTest.questions || [];

  return (
    <div style={S.page}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>
        {solutionTest.title} - Solution
      </h2>

      {qs.map((q, i) => (
        <div key={q._id} style={S.card}>
          <p style={{ fontWeight: 700 }}>
            Q{i + 1}. {q.text}
          </p>

          {q.options?.map((o, j) => {
            const isCorrect = q.correctAnswer === j;

            return (
              <p
                key={j}
                style={{
                  color: isCorrect ? "#22c55e" : "#cbd5e1",
                  fontWeight: isCorrect ? 700 : 400,
                }}
              >
                {String.fromCharCode(65 + j)}. {o}
                {isCorrect && " ✅"}
              </p>
            );
          })}
        </div>
      ))}

      <button
        style={S.btnSec}
        onClick={() => setSolutionTest(null)}
      >
        Back
      </button>
    </div>
  );
}
  // ================= MAIN PAGE =================
  return (
    <div style={S.page}>
      <h1 style={{ fontSize: 26, fontWeight: 800 }}>
        Tests
      </h1>

      {/* FILTER */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <input
          placeholder="Search tests..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={S.input}
        />

        <select
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(e.target.value)
          }
          style={S.select}
        >
          <option value="all">All Types</option>
          <option value="mock">Mock</option>
          <option value="quiz">Quiz</option>
          <option value="adaptive">Adaptive</option>
          <option value="pastPaper">Past Paper</option>
        </select>

        {/* ✅ SUBJECT FILTER FIXED */}
        <select
          value={subjectFilter}
          onChange={(e) =>
            setSubjectFilter(e.target.value)
          }
          style={S.select}
        >
          <option value="all">All Subjects</option>

          {subjects.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* TEST LIST */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill,minmax(280px,1fr))",
          gap: 16,
        }}
      >
        {filteredTests.map((t) => (
          <div key={t._id} style={S.card}>
            <h3 style={{ fontWeight: 700 }}>
              {t.title}
            </h3>

            <p
              style={{
                fontSize: 13,
                color: "#94a3b8",
              }}
            >
              {t.questions?.length || 0} Qs |{" "}
              {t.duration || 0} min | {t.type}
            </p>

            {/* ✅ SUBJECT SHOW FIXED */}
            <p
              style={{
                fontSize: 13,
                color: "#cbd5e1",
                margin: "8px 0",
              }}
            >
              Subject: {t.subjectId?.name || "N/A"}
            </p>

           {attemptMap[t._id] ? (
              <button
                style={{ ...S.btn, background: "#066428" }}
                onClick={() => openSolution(t)}
              >
                View Solution
              </button>
            ) : (
              <button
                style={S.btn}
                onClick={() => start(t)}
              >
                Start Test
              </button>
            )}
          </div>
        ))}
        
      </div>
    </div>
  );
}