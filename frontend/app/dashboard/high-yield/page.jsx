"use client";

import { useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import { getHighYieldFacts } from "@/api/highYieldFact.api";
import { formatDate, truncate } from "@/lib/utils";
import { Zap } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import { SkeletonCardGrid, SkeletonMeta } from "@/components/dashboard/Skeleton";
import { ListMeta } from "@/components/dashboard/StudyPageUI";

const sourceLabel = (type) => {
  if (type === "manual") return "Manual";
  if (type === "auto") return "AI Generated";
  if (type === "pastpaper") return "Past Paper";
  return type || "General";
};

export default function HighYieldUserPage() {
  const { data, loading, error, execute } = useApi(getHighYieldFacts);

  useEffect(() => {
    execute();
  }, []);

  const facts = data || [];

  return (
    <div className="page-shell study-page">
      <PageHeader
        eyebrow={{ icon: Zap, label: "Revision" }}
        title="High-Yield Facts"
        description="Quick revision points for exam-critical topics."
      />

      {loading ? (
        <>
          <SkeletonMeta />
          <SkeletonCardGrid count={6} />
        </>
      ) : error ? (
        <p className="text-error">{error}</p>
      ) : facts.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="No facts yet"
          description="High-yield revision facts will appear here once available."
        />
      ) : (
        <>
          <ListMeta end={facts.length} label="facts" />
          <div className="item-grid">
          {facts.map((fact) => (
            <article key={fact._id} className="item-card">
              <div className="item-card__body">
                <h3>{fact.title || "Untitled Fact"}</h3>
                <p className="item-card__desc">{truncate(fact.content, 140)}</p>
                <p className="item-card__meta">
                  {fact.subjectId?.name} · {fact.chapterId?.name || "General"}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                  <span className="badge badge--dark">Priority {fact.priority}</span>
                  <span className="badge badge--neutral">{sourceLabel(fact.sourceType)}</span>
                  <span className="badge badge--neutral">{formatDate(fact.createdAt)}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
        </>
      )}
    </div>
  );
}
