"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GraduationCap, ChevronRight, BookOpen } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { getLearnSubjectsApi } from "@/api/learning.api";
import { getSubjectVisual, normalizeList } from "@/lib/learn";

export default function LearnSubjectsPage() {
  const { user, loading: authLoading } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;

    setLoading(true);
    getLearnSubjectsApi()
      .then((res) => setSubjects(normalizeList(res)))
      .catch(() => setSubjects([]))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  return (
    <div className="page-shell study-page learn-page">
      <PageHeader
        eyebrow={{ icon: GraduationCap, label: "Curriculum" }}
        title="Start Learning"
        description="Pick a subject and work through chapters section by section — 50 MCQs at a time."
      />

      {loading ? (
        <p className="text-muted">Loading subjects…</p>
      ) : subjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No subjects yet"
          description="Subjects will appear here once added in the admin panel."
        />
      ) : (
        <div className="learn-subjects-grid">
          {subjects.map((subject, i) => {
            const { Icon, color } = getSubjectVisual(subject.name);
            const progress = subject.progressPercent || 0;

            return (
              <Link
                key={subject._id}
                href={`/dashboard/learn/${subject._id}`}
                className="learn-subject-card"
                style={{ "--learn-accent": color, animationDelay: `${i * 60}ms` }}
              >
                <div className="learn-subject-card__icon">
                  <Icon size={28} strokeWidth={1.8} />
                </div>
                <h2 className="learn-subject-card__name">{subject.name}</h2>
                {subject.board && (
                  <p className="learn-subject-card__board">{subject.board} board</p>
                )}
                <div className="learn-subject-card__stats">
                  <div>
                    <span className="learn-subject-card__stat-val">
                      {subject.chapterCount || 0}
                    </span>
                    <span className="learn-subject-card__stat-label">Chapters</span>
                  </div>
                  <div>
                    <span className="learn-subject-card__stat-val">
                      {subject.questionCount || 0}
                    </span>
                    <span className="learn-subject-card__stat-label">MCQs</span>
                  </div>
                  {progress > 0 && (
                    <div>
                      <span className="learn-subject-card__stat-val">{progress}%</span>
                      <span className="learn-subject-card__stat-label">Done</span>
                    </div>
                  )}
                </div>
                <div className="learn-subject-card__bar">
                  <div
                    className="learn-subject-card__bar-fill"
                    style={{ width: `${Math.max(progress, progress > 0 ? 8 : 0)}%` }}
                  />
                </div>
                {subject.questionsAnswered > 0 && (
                  <p className="learn-subject-card__progress-text">
                    {subject.questionsAnswered} MCQs practiced
                    {subject.completedSections > 0 &&
                      ` · ${subject.completedSections} sections completed`}
                  </p>
                )}
                <span className="learn-subject-card__cta">
                  Open subject <ChevronRight size={16} />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
