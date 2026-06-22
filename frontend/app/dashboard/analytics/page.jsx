"use client";

import { useState, useEffect } from "react";
import { getAnalytics } from "@/api/performance.api";
import { BarChart3 } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import SectionTitle from "@/components/dashboard/SectionTitle";
import { StatStrip } from "@/components/dashboard/StudyPageUI";
import { SkeletonListRows, SkeletonStats } from "@/components/dashboard/Skeleton";

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then((r) => setData(r?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-shell study-page">
      <PageHeader
        eyebrow={{ icon: BarChart3, label: "Performance" }}
        title="Performance Analytics"
        description="Track accuracy, study time, and weak areas across subjects."
      />

      {loading ? (
        <>
          <SkeletonStats count={3} />
          <SectionTitle title="By Subject" />
          <SkeletonListRows count={4} />
          <SectionTitle title="Weakest Topics" />
          <SkeletonListRows count={3} />
        </>
      ) : !data?.overall ? (
        <EmptyState
          icon={BarChart3}
          title="No data yet"
          description="Complete some tests to see your performance analytics."
        />
      ) : (
        <>
          <StatStrip
            items={[
              { label: "Overall Accuracy", value: `${data.overall.accuracy}%`, accent: true },
              { label: "Total Questions", value: data.overall.totalQuestions },
              { label: "Time Spent", value: `${Math.round(data.overall.totalTimeSpent / 60)}m` },
            ]}
          />

          <SectionTitle title="By Subject" />
          <div className="data-list">
            {data.subjects?.map((s) => (
              <div key={s.subjectId} className="data-row">
                <div className="data-row__main">
                  <p className="data-row__title">{s.subjectName}</p>
                  <p className="data-row__sub">
                    {s.totalQuestions} questions · {s.attempts} attempts
                  </p>
                </div>
                <span
                  className={`badge ${
                    s.accuracy >= 70 ? "badge--success" : s.accuracy >= 40 ? "badge--warning" : "badge--danger"
                  }`}
                >
                  {s.accuracy}%
                </span>
              </div>
            ))}
          </div>

          {data.weakestTopics?.length > 0 && (
            <>
              <SectionTitle title="Weakest Topics" />
              <div className="data-list">
                {data.weakestTopics.map((w) => (
                  <div key={w.subjectId} className="data-row">
                    <div className="data-row__main">
                      <p className="data-row__title">{w.subjectName}</p>
                    </div>
                    <span className="badge badge--danger">{w.accuracy}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
