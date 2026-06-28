"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ChevronLeft,
  CheckCircle2,
  Target,
  Trophy,
} from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import McqPracticeList from "@/components/dashboard/McqPracticeList";
import { SkeletonMcqList } from "@/components/dashboard/Skeleton";
import { StatStrip } from "@/components/dashboard/StudyPageUI";
import { useAuth } from "@/context/AuthContext";
import { getMcqsApi } from "@/api/mcq.api";
import {
  completeLearnSectionApi,
  getLearnSectionsApi,
  saveLearnSectionProgressApi,
} from "@/api/learning.api";
import { normalizeList, SECTION_SIZE } from "@/lib/learn";

export default function LearnSectionPracticePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { subjectId, chapterId, sectionIndex } = useParams();
  const sectionNum = Number(sectionIndex);

  const [sectionMeta, setSectionMeta] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [saveState, setSaveState] = useState("idle");
  const saveTimerRef = useRef(null);
  const autoCompleteRef = useRef(false);
  const selectedRef = useRef(selected);
  const questionsRef = useRef(questions);
  const sectionMetaRef = useRef(sectionMeta);

  selectedRef.current = selected;
  questionsRef.current = questions;
  sectionMetaRef.current = sectionMeta;

  const computeStats = useCallback((qs, ans) => {
    const answered = qs.filter((q) => ans[q._id] !== undefined).length;
    const correct = qs.filter((q) => ans[q._id] === q.correctAnswer).length;
    const accuracy = answered ? Math.round((correct / answered) * 100) : 0;
    return { answered, correct, accuracy, total: qs.length };
  }, []);

  const persistProgress = useCallback(
    async (ans, { completed = false } = {}) => {
      const qs = questionsRef.current;
      const meta = sectionMetaRef.current;
      if (!meta || !chapterId || qs.length === 0) return;

      const stats = computeStats(qs, ans);
      if (stats.answered <= 0) return;

      setSaveState("saving");
      try {
        const api = completed ? completeLearnSectionApi : saveLearnSectionProgressApi;
        await api(chapterId, sectionNum, {
          questionsAnswered: stats.answered,
          correctAnswers: stats.correct,
          totalQuestions: stats.total,
        });

        setSaveState("saved");
        if (completed) {
          setFinished(true);
          setSectionMeta((prev) =>
            prev
              ? {
                  ...prev,
                  alreadyCompleted: true,
                  completed: true,
                  previousProgress: {
                    scorePercent: stats.accuracy,
                    correctAnswers: stats.correct,
                    totalQuestions: stats.total,
                    questionsAnswered: stats.answered,
                  },
                }
              : prev
          );
        }
      } catch (err) {
        setSaveState("error");
        if (completed) {
          toast.error(err?.message || "Could not save progress");
        }
      }
    },
    [chapterId, sectionNum, computeStats]
  );

  const scheduleSave = useCallback(
    (ans) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        persistProgress(ans, { completed: false });
      }, 700);
    },
    [persistProgress]
  );

  const load = useCallback(async () => {
    if (!chapterId || Number.isNaN(sectionNum)) return;
    setLoading(true);
    try {
      const sectionsRes = await getLearnSectionsApi(chapterId);
      const sectionsData = sectionsRes?.data || sectionsRes;
      const section = sectionsData?.sections?.find(
        (s) => Number(s.sectionIndex) === sectionNum
      );

      if (!section) {
        setSectionMeta(null);
        setQuestions([]);
        return;
      }

      setSectionMeta({
        ...section,
        chapter: sectionsData.chapter,
        alreadyCompleted: section.completed,
        previousProgress: section.progress,
      });
      setFinished(section.completed);

      const mcqRes = await getMcqsApi({
        chapterId,
        page: sectionNum + 1,
        limit: SECTION_SIZE,
        isPastPaper: false,
      });

      setQuestions(normalizeList(mcqRes));
    } catch {
      toast.error("Failed to load section");
      setSectionMeta(null);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [chapterId, sectionNum]);

  useEffect(() => {
    if (authLoading || !user) return;
    load();
  }, [load, user, authLoading]);

  useEffect(
    () => () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    },
    []
  );

  const sessionStats = useMemo(
    () => computeStats(questions, selected),
    [questions, selected, computeStats]
  );

  const allAnswered =
    questions.length > 0 && sessionStats.answered === questions.length;

  const selectAnswer = (qid, idx) => {
    setSelected((prev) => {
      const next = { ...prev, [qid]: idx };
      scheduleSave(next);
      return next;
    });
  };

  useEffect(() => {
    if (!allAnswered || submitting || finished || autoCompleteRef.current) return;
    autoCompleteRef.current = true;
    setSubmitting(true);
    persistProgress(selected, { completed: true })
      .then(() => toast.success("Section completed and saved!"))
      .catch(() => {
        autoCompleteRef.current = false;
      })
      .finally(() => setSubmitting(false));
  }, [allAnswered, finished, submitting, persistProgress, selected]);

  const handleComplete = async () => {
    if (!allAnswered || submitting) return;
    setSubmitting(true);
    try {
      await persistProgress(selected, { completed: true });
      toast.success("Section marked as completed!");
    } finally {
      setSubmitting(false);
    }
  };

  const chapterName = sectionMeta?.chapter?.name;
  const subjectName =
    typeof sectionMeta?.chapter?.subjectId === "object"
      ? sectionMeta.chapter.subjectId?.name
      : "";

  if (loading || authLoading) {
    return (
      <div className="page-shell study-page learn-page">
        <SkeletonMcqList count={5} />
      </div>
    );
  }

  if (!sectionMeta) {
    return (
      <div className="page-shell study-page learn-page">
        <EmptyState
          icon={Target}
          title="Section not found"
          description="This section does not exist or has no questions."
          action={
            <Link href={`/dashboard/learn/${subjectId}/${chapterId}`} className="btn-primary">
              Back to sections
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="page-shell study-page learn-page">
      <Link
        href={`/dashboard/learn/${subjectId}/${chapterId}`}
        className="learn-back-link"
      >
        <ChevronLeft size={16} /> {chapterName || "Back to sections"}
      </Link>

      <PageHeader
        eyebrow={{ icon: Target, label: subjectName || "Practice" }}
        title={sectionMeta.label}
        description={`Questions ${sectionMeta.questionStart}–${sectionMeta.questionEnd} · progress saves automatically as you answer.`}
        actions={
          <div className="learn-save-status">
            {sectionMeta.alreadyCompleted || finished ? (
              <span className="badge badge--success learn-done-badge">
                <CheckCircle2 size={14} /> Completed
              </span>
            ) : null}
            {saveState === "saving" && (
              <span className="learn-save-status__text">Saving…</span>
            )}
            {saveState === "saved" && !finished && (
              <span className="learn-save-status__text learn-save-status__text--ok">
                Progress saved
              </span>
            )}
          </div>
        }
      />

      {sectionMeta.alreadyCompleted && sectionMeta.previousProgress && (
        <div className="learn-complete-banner">
          <Trophy size={18} />
          <span>
            Saved progress: {sectionMeta.previousProgress.scorePercent}% (
            {sectionMeta.previousProgress.correctAnswers}/
            {sectionMeta.previousProgress.totalQuestions} correct)
          </span>
        </div>
      )}

      {questions.length > 0 && (
        <StatStrip
          items={[
            { label: "In section", value: sessionStats.total },
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
      )}

      {questions.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No questions in this section"
          description="Questions may still be importing for this chapter."
        />
      ) : (
        <>
          <McqPracticeList
            questions={questions}
            selected={selected}
            onSelect={selectAnswer}
            startNumber={sectionMeta.questionStart}
            locked={false}
          />

          <div className="learn-section-actions">
            <button
              type="button"
              className="btn-primary"
              disabled={!allAnswered || submitting}
              onClick={handleComplete}
            >
              {submitting
                ? "Saving…"
                : allAnswered
                  ? sectionMeta.alreadyCompleted || finished
                    ? "Update completion"
                    : "Complete section"
                  : `Answer all MCQs (${sessionStats.answered}/${sessionStats.total})`}
            </button>
            {(finished || sectionMeta.alreadyCompleted) && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() =>
                  router.push(`/dashboard/learn/${subjectId}/${chapterId}`)
                }
              >
                Back to sections
              </button>
            )}
            <Link
              href={`/dashboard/learn/${subjectId}/${chapterId}`}
              className="btn-ghost"
            >
              Exit
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
