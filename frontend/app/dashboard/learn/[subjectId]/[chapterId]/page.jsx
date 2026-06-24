"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ListOrdered, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import { StatStrip } from "@/components/dashboard/StudyPageUI";
import { useAuth } from "@/context/AuthContext";
import { getLearnSectionsApi } from "@/api/learning.api";

export default function LearnSectionsPage() {
  const { subjectId, chapterId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user || !chapterId) return;

    setLoading(true);
    getLearnSectionsApi(chapterId)
      .then((res) => setData(res?.data || res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [chapterId, user, authLoading]);

  const chapter = data?.chapter;
  const sections = data?.sections || [];
  const subjectName =
    typeof chapter?.subjectId === "object" ? chapter.subjectId?.name : "";

  return (
    <div className="page-shell study-page learn-page">
      <Link href={`/dashboard/learn/${subjectId}`} className="learn-back-link">
        <ChevronLeft size={16} /> {subjectName || "Back to chapters"}
      </Link>

      <PageHeader
        eyebrow={{ icon: ListOrdered, label: "Sections" }}
        title={chapter?.name || "Chapter sections"}
        description="Each section has up to 50 MCQs. Progress is saved automatically as you practice."
      />

      {!loading && data && (
        <StatStrip
          items={[
            { label: "Total MCQs", value: data.totalQuestions || 0 },
            { label: "Sections", value: data.totalSections || 0 },
            {
              label: "Completed",
              value: data.completedSections || 0,
              success: true,
            },
            {
              label: "Practiced",
              value: `${data.questionsAnswered || 0}/${data.totalQuestions || 0}`,
              accent: true,
              progress: data.progressPercent || 0,
            },
          ]}
        />
      )}

      {loading ? (
        <p className="text-muted">Loading sections…</p>
      ) : sections.length === 0 ? (
        <EmptyState
          icon={ListOrdered}
          title="No MCQs in this chapter"
          description="Add questions to this chapter in the admin panel to create sections."
        />
      ) : (
        <div className="learn-sections-grid">
          {sections.map((section) => (
            <Link
              key={section.sectionIndex}
              href={`/dashboard/learn/${subjectId}/${chapterId}/section/${section.sectionIndex}`}
              className={`learn-section-card${section.completed ? " learn-section-card--done" : ""}${section.inProgress ? " learn-section-card--active" : ""}`}
            >
              <div className="learn-section-card__head">
                <h3>{section.label}</h3>
                {section.completed && (
                  <span className="badge badge--success">
                    <CheckCircle2 size={12} /> Completed
                  </span>
                )}
                {!section.completed && section.inProgress && (
                  <span className="badge badge--dark">In progress</span>
                )}
              </div>
              <p className="learn-section-card__meta">
                Questions {section.questionStart}–{section.questionEnd} ·{" "}
                {section.questionCount} MCQs
              </p>
              {section.progress && (
                <p className="learn-section-card__score">
                  {section.completed
                    ? `Score: ${section.progress.scorePercent}% (${section.progress.correctAnswers}/${section.progress.totalQuestions})`
                    : `${section.progress.questionsAnswered || 0}/${section.progress.totalQuestions || section.questionCount} answered`}
                </p>
              )}
              <span className="learn-section-card__cta">
                {section.completed ? "Review section" : "Continue practice"}{" "}
                <ChevronRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
