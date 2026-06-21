"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getTestApi } from "@/api/test.api";
import { getChallenges } from "@/api/challenge.api";
import {
  createChallengeAttempt,
  getMyChallengeAttempts,
} from "@/api/challengeAttempt.api";

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [filter, setFilter] = useState("all");

  const [activeTest, setActiveTest] = useState(null); // ✅ FIXED
  const [answers, setAnswers] = useState({}); // MCQ answers

useEffect(() => {
  let mounted = true;

  const load = async () => {
    const ch =
      filter === "all"
        ? await getChallenges({})
        : await getChallenges({ type: filter });

    const at = await getMyChallengeAttempts();

    if (mounted) {
      setChallenges(ch?.data || []);
      setAttempts(at?.data || []);
    }
  };

  load();

  return () => {
    mounted = false;
  };
}, [filter]);

  // ================= FETCH =================
  const fetchData = async () => {
    try {
      const ch =
        filter === "all"
          ? await getChallenges({})
          : await getChallenges({ type: filter });

      const at = await getMyChallengeAttempts();

      setChallenges(ch?.data || []);
      setAttempts(at?.data || []);
    } catch (err) {
      toast.error("Failed to load challenges");
    }
  };

  // ================= OPEN TEST =================
const openTest = async (challenge) => {
  try {
    console.log("CHALLENGE:", challenge);

    const testId =
      challenge.testId?._id || challenge.testId;

    if (!testId || typeof testId !== "string") {
      throw new Error("Invalid testId");
    }

    console.log("FINAL TEST ID:", testId);

    const res = await getTestApi(testId);
    console.log("FULL RES:", res);
    const testData = res?.data;
    console.log("TEST DATA CHECK:", res?.data);
    if (!testData) throw new Error("Test not found");

    setActiveTest({
      challenge,
      test: testData,
    });

    setAnswers({});
  } catch (err) {
    console.log("ERROR:", err);
    toast.error(err.message || "Failed to load test");
  }
};
  // ================= SUBMIT =================
  const submitChallenge = async () => {
    try {
     
      await createChallengeAttempt({
      challengeId: activeTest.challenge._id,
      score: activeTest.challenge.points || 0,
    });
     

      toast.success("Test Completed 🎉");

      setActiveTest(null);
      setAnswers({});

       await fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Submission failed");
    }
  };


const attemptedSet = new Set(
  attempts
    .filter((a) => a?.challengeId)
    .map((a) => String(a.challengeId?._id || a.challengeId))
);
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>🔥 Daily & Weekly Challenges</h1>

      {/* FILTER */}
      <div style={styles.filterBar}>
        {["all", "daily", "weekly"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            style={{
              ...styles.filterBtn,
              background: filter === t ? "#0ea5e9" : "#1e293b",
            }}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* LIST */}
      {challenges.map((c) => {
        const isDone = attemptedSet.has(String(c._id));
        return (
          <div key={c._id} style={styles.card}>
            <div style={styles.row}>
              <h3>{c.title}</h3>

              <span
                style={{
                  ...styles.badge,
                  background: c.type === "daily" ? "#16a34a" : "#f59e0b",
                }}
              >
                {c.type}
              </span>
            </div>

            <p style={styles.info}>
              ⭐ {c.points} Points | 📅{" "}
              {new Date(c.endDate).toLocaleDateString()}
            </p>

            {isDone ? (
              <p style={styles.done}>✅ Completed</p>
            ) : (
              <button style={styles.button} onClick={() => openTest(c)}>
                Solve Challenge
              </button>
            )}
          </div>
        );
      })}

      {/* ================= REAL TEST MODAL ================= */}
      {activeTest && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>{activeTest.test.title}</h2>

            {activeTest.test.questions?.map((q, index) => (
              <div key={index} style={{ marginBottom: 15 }}>
                
                <p style={{ fontSize: 14 }}>
                  {index + 1}. {q.text}
                </p>

                {q.options.map((opt, i) => (
                  <label key={i} style={{ display: "block", fontSize: 13 }}>
                    <input
                      type="radio"
                      name={`q-${index}`}
                      value={opt}
                      onChange={() =>
                        setAnswers((prev) => ({
                          ...prev,
                          [index]: opt,
                        }))
                      }
                    />
                    {" "}{opt}
                  </label>
                ))}

              </div>
            ))}

            {/* BUTTONS */}
            <div style={styles.modalActions}>
              <button style={styles.submitBtn} onClick={submitChallenge}>
                Submit Test
              </button>

              <button
                style={styles.cancelBtn}
                onClick={() => setActiveTest(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  container: {
    padding: 20,
    background: "#0f172a",
    minHeight: "100vh",
    color: "#fff",
  },

  heading: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },

  filterBar: {
    display: "flex",
    gap: 10,
    marginBottom: 15,
  },

  filterBtn: {
    padding: "6px 12px",
    border: "none",
    borderRadius: 6,
    color: "#fff",
    cursor: "pointer",
  },

  card: {
    background: "#1e293b",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
  },

  badge: {
    fontSize: 11,
    padding: "3px 10px",
    borderRadius: 6,
    color: "#fff",
  },

  info: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 6,
  },

  button: {
    marginTop: 10,
    padding: "7px 14px",
    background: "#0ea5e9",
    border: "none",
    borderRadius: 6,
    color: "#fff",
  },

  done: {
    marginTop: 10,
    color: "#2dd4bf",
    fontWeight: 600,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  modal: {
    width: 450,
    background: "#0f172a",
    padding: 20,
    borderRadius: 10,
  },

  modalActions: {
    display: "flex",
    gap: 10,
    marginTop: 15,
  },

  submitBtn: {
    flex: 1,
    padding: 8,
    background: "#16a34a",
    borderRadius: 6,
    color: "#fff",
  },

  cancelBtn: {
    flex: 1,
    padding: 8,
    background: "#ef4444",
    borderRadius: 6,
    color: "#fff",
  },
};