"use client";

import { useState, useEffect } from "react";
import { getMnemonics } from "@/api/mnemonic.api";
import { getSubjectsApi } from "@/api/subject.api";
import { Lightbulb, BookOpen } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import { SkeletonCardGrid } from "@/components/dashboard/Skeleton";
import { FilterPanel, FilterField } from "@/components/dashboard/StudyPageUI";

export default function MnemonicsPage() {
  const [mnemonics, setMnemonics] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubjectsApi()
      .then((r) => setSubjects(r?.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const p = filter ? { subjectId: filter } : {};
    getMnemonics(p)
      .then((r) => setMnemonics(r?.data || []))
      .catch(() => setMnemonics([]))
      .finally(() => setLoading(false));
  }, [filter]);

  const hasActiveFilters = filter !== "";

  return (
    <div className="page-shell study-page">
      <PageHeader
        eyebrow={{ icon: Lightbulb, label: "Memory aids" }}
        title="Mnemonic Library"
        description="Short memory tricks to help you recall complex topics faster."
      />

      <FilterPanel
        hasActiveFilters={hasActiveFilters}
        onClear={() => setFilter("")}
        ariaLabel="Filter mnemonics"
      >
        <FilterField label="Subject" icon={BookOpen}>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by subject">
            <option value="">All subjects</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </FilterField>
      </FilterPanel>

      {loading ? (
        <SkeletonCardGrid count={6} />
      ) : mnemonics.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="No mnemonics found"
          description="Try another subject or check back later."
        />
      ) : (
        <div className="item-grid">
          {mnemonics.map((m) => (
            <article key={m._id} className="item-card">
              <div className="item-card__body">
                <h3>{m.title}</h3>
                <p className="item-card__desc">{m.content}</p>
                {m.subjectId?.name && <p className="item-card__meta">{m.subjectId.name}</p>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
