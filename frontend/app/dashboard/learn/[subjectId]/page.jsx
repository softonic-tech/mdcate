"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Layers, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { getLearnChaptersApi } from "@/api/learning.api";
import { getSubjectVisual } from "@/lib/learn";

export default function LearnChaptersPage() {
  const { subjectId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user || !subjectId) return;

    setLoading(true);
    getLearnChaptersApi(subjectId)
      .then((res) => setData(res?.data || res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [subjectId, user, authLoading]);

  const subject = data?.subject;
  const chapters = data?.chapters || [];
  const { Icon, color } = getSubjectVisual(subject?.name || "");

  return (
    <div className="page-shell study-page learn-page">
      <Link href="/dashboard/learn" className="learn-back-link">
        <ChevronLeft size={16} /> All subjects
      </Link>

      <PageHeader
        eyebrow={{ icon: Icon, label: subject?.board || "Subject" }}
        title={subject?.name || "Chapters"}
        description="Choose a chapter to see practice sections of 50 MCQs each."
      />

      {loading ? (
        <p className="text-muted">Loading chapters…</p>
      ) : chapters.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No chapters yet"
          description="This subject has no chapters with MCQs yet."
        />
      ) : (
        <div className="learn-chapters-grid">
          {chapters.map((chapter) => (
            <Link
              key={chapter._id}
              href={`/dashboard/learn/${subjectId}/${chapter._id}`}
              className="learn-chapter-card"
              style={{ "--learn-accent": color }}
            >
              <div className="learn-chapter-card__head">
                <h3>{chapter.name}</h3>
                {chapter.completedSections > 0 &&
                  chapter.completedSections === chapter.totalSections &&
                  chapter.totalSections > 0 && (
                    <span className="badge badge--success">
                      <CheckCircle2 size={12} /> Done
                    </span>
                  )}
              </div>
              {chapter.summary && (
                <p className="learn-chapter-card__summary">{chapter.summary}</p>
              )}
              <div className="learn-chapter-card__meta">
                <span>{chapter.questionCount || 0} MCQs</span>
                <span>·</span>
                <span>{chapter.totalSections || 0} sections</span>
              </div>
              <div className="learn-chapter-card__bar">
                <div
                  className="learn-chapter-card__bar-fill"
                  style={{ width: `${chapter.progressPercent || 0}%` }}
                />
              </div>
              <p className="learn-chapter-card__progress">
                {chapter.questionsAnswered > 0
                  ? `${chapter.questionsAnswered}/${chapter.questionCount || 0} MCQs practiced`
                  : "Not started yet"}
                {chapter.completedSections > 0 &&
                  ` · ${chapter.completedSections}/${chapter.totalSections || 0} sections done`}
              </p>
              <span className="learn-chapter-card__cta">
                View sections <ChevronRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
