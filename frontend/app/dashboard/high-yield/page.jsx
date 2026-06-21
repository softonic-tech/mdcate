"use client";

import { useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import { getHighYieldFacts } from "@/api/highYieldFact.api";
import { formatDate, truncate } from "@/lib/utils";

export default function HighYieldUserPage() {
  const { data, loading, error, execute } = useApi(getHighYieldFacts);

  useEffect(() => {
    execute();
  }, []);

  const facts = data || [];

  return (
    <div className="min-h-screen px-6 py-8 bg-[var(--midnight)] text-[var(--cloud)]">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          🔥 High Yield Facts
        </h1>
        <p className="text-[var(--graphite)] mt-1">
          Quick revision important exam points
        </p>
      </div>

      {/* STATES */}
      {loading && (
        <p className="text-[var(--graphite)]">Loading facts...</p>
      )}

      {error && (
        <p className="text-[var(--danger)]">{error}</p>
      )}

      {/* GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

        {facts.map((fact) => (
          <div
            key={fact._id}
            className="p-5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md hover:translate-y-[-4px] transition-all"
          >

            {/* TITLE */}
            <h2 className="text-lg font-semibold text-white mb-2">
              {fact.title || "Untitled Fact"}
            </h2>

            {/* CONTENT */}
            <p className="text-sm text-[var(--mist)] mb-3">
              {truncate(fact.content, 120)}
            </p>

            {/* META */}
            <p className="text-xs text-[var(--graphite)] mb-3">
              📚 {fact.subjectId?.name} • {fact.chapterId?.name || "General"}
            </p>

            {/* BADGES */}
            <div className="flex flex-wrap gap-2 text-xs">

              <span className="px-2 py-1 rounded bg-[rgba(20,184,166,0.15)] text-[#2dd4bf]">
                🔥 Priority {fact.priority}
              </span>

             <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  fact.sourceType === "manual"
                    ? "bg-[rgba(20,184,166,0.15)] text-[#2dd4bf]"
                    : fact.sourceType === "auto"
                    ? "bg-[rgba(239,68,68,0.15)] text-red-400"
                    : fact.sourceType === "pastpaper"
                    ? "bg-[rgba(99,102,241,0.15)] text-indigo-300"
                    : "bg-white/5 text-gray-400"
                }`}
              >
                {fact.sourceType === "auto" && (
                  <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded">
                    🤖 AI Generated
                  </span>
                )}
              </span>

              <span className="px-2 py-1 rounded bg-white/5 text-gray-400">
                📅 {formatDate(fact.createdAt)}
              </span>

            </div>

          </div>
        ))}

      </div>
    </div>
  );
}