"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getTestApi } from "@/api/test.api";
import { getChallenges } from "@/api/challenge.api";
import { createChallengeAttempt, getMyChallengeAttempts } from "@/api/challengeAttempt.api";
import { CalendarCheck } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import { FilterPills } from "@/components/dashboard/StudyPageUI";
import Modal from "@/components/dashboard/Modal";

const CHALLENGE_FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
];

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [activeTest, setActiveTest] = useState(null);
  const [answers, setAnswers] = useState({});

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

  const fetchData = async () => {
    try {
      const ch =
        filter === "all"
          ? await getChallenges({})
          : await getChallenges({ type: filter });
      const at = await getMyChallengeAttempts();
      setChallenges(ch?.data || []);
      setAttempts(at?.data || []);
    } catch {
      toast.error("Failed to load challenges");
    }
  };

  const openTest = async (challenge) => {
    try {
      const testId = challenge.testId?._id || challenge.testId;
      if (!testId || typeof testId !== "string") throw new Error("Invalid testId");
      const res = await getTestApi(testId);
      const testData = res?.data;
      if (!testData) throw new Error("Test not found");
      setActiveTest({ challenge, test: testData });
      setAnswers({});
    } catch (err) {
      toast.error(err.message || "Failed to load test");
    }
  };

  const submitChallenge = async () => {
    try {
      await createChallengeAttempt({
        challengeId: activeTest.challenge._id,
        score: activeTest.challenge.points || 0,
      });
      toast.success("Challenge completed");
      setActiveTest(null);
      setAnswers({});
      await fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Submission failed");
    }
  };

  const attemptedSet = new Set(
    attempts.filter((a) => a?.challengeId).map((a) => String(a.challengeId?._id || a.challengeId))
  );

  return (
    <div className="page-shell study-page">
      <PageHeader
        eyebrow={{ icon: CalendarCheck, label: "Practice" }}
        title="Daily & Weekly Challenges"
        description="Complete timed challenges to earn points and stay consistent."
      />

      <FilterPills
        label="Type"
        icon={CalendarCheck}
        options={CHALLENGE_FILTER_OPTIONS}
        value={filter}
        onChange={setFilter}
        ariaLabel="Challenge type"
      />

      {challenges.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No challenges available"
          description="Check back soon for new daily and weekly challenges."
        />
      ) : (
        <div className="data-list">
          {challenges.map((c) => {
            const isDone = attemptedSet.has(String(c._id));
            return (
              <div key={c._id} className="panel">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <h3 className="panel__title">{c.title}</h3>
                  <span className={`badge ${c.type === "daily" ? "badge--success" : "badge--warning"}`}>
                    {c.type}
                  </span>
                </div>
                <p className="panel__meta">
                  {c.points} points · Ends {new Date(c.endDate).toLocaleDateString()}
                </p>
                {isDone ? (
                  <span className="badge badge--success" style={{ marginTop: 10 }}>Completed</span>
                ) : (
                  <button type="button" className="btn-primary" style={{ marginTop: 12 }} onClick={() => openTest(c)}>
                    Solve Challenge
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={Boolean(activeTest)}
        onClose={() => setActiveTest(null)}
        title={activeTest?.test?.title || "Challenge"}
        subtitle="Answer all questions, then submit."
        size="lg"
        footer={
          <>
            <button type="button" className="btn-ghost" onClick={() => setActiveTest(null)}>
              Cancel
            </button>
            <button type="button" className="btn-primary" onClick={submitChallenge}>
              Submit
            </button>
          </>
        }
      >
        {activeTest?.test?.questions?.map((q, index) => (
          <div key={index} className="mcq-card" style={{ marginBottom: 12 }}>
            <p className="mcq-card__question">
              {index + 1}. {q.text}
            </p>
            <div className="mcq-options">
              {q.options.map((opt, i) => (
                <label key={i} className="mcq-option exam-option">
                  <input
                    type="radio"
                    name={`q-${index}`}
                    value={opt}
                    onChange={() => setAnswers((prev) => ({ ...prev, [index]: opt }))}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </Modal>
    </div>
  );
}
