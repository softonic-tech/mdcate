"use client";

import { useCachedFetch } from "./useCachedFetch";

export function useLandingData() {
  const { data, loading } = useCachedFetch("/public/landing", {
    cacheKey: "landing",
    ttlMs: 5 * 60 * 1000,
  });

  return { data, loading };
}

export function formatStat(n) {
  if (n == null || Number.isNaN(n)) return "0";
  return Number(n).toLocaleString();
}

export const LANDING_SUBJECTS = [
  "Biology",
  "Chemistry",
  "Physics",
  "English",
  "Logical Reasoning",
  "Analytical",
];

export function subjectKey(name = "") {
  const key = name.toLowerCase();
  if (key.includes("bio")) return "biology";
  if (key.includes("chem")) return "chemistry";
  if (key.includes("phys")) return "physics";
  if (key.includes("english")) return "english";
  if (key.includes("logic") || key.includes("reason")) return "logical reasoning";
  return key.trim();
}

export function mergeLandingSubjects(apiSubjects = []) {
  const aggregated = new Map();

  for (const subject of apiSubjects) {
    const key = subjectKey(subject.name);
    const existing = aggregated.get(key);

    if (!existing) {
      aggregated.set(key, {
        _id: subject._id,
        name: LANDING_SUBJECTS.find((label) => subjectKey(label) === key) || subject.name,
        board: subject.board,
        chapterCount: subject.chapterCount || 0,
        questionCount: subject.questionCount || 0,
      });
      continue;
    }

    existing.chapterCount += subject.chapterCount || 0;
    existing.questionCount += subject.questionCount || 0;
  }

  return LANDING_SUBJECTS.map((label) => {
    const key = subjectKey(label);
    return (
      aggregated.get(key) || {
        name: label,
        chapterCount: 0,
        questionCount: 0,
      }
    );
  });
}

export function subjectMeta(name = "") {
  const key = subjectKey(name);
  const meta = {
    biology: { color: "var(--success)", key: "biology" },
    chemistry: { color: "var(--sky)", key: "chemistry" },
    physics: { color: "var(--amber)", key: "physics" },
    english: { color: "var(--violet)", key: "english" },
    "logical reasoning": { color: "var(--rose)", key: "logic" },
    analytical: { color: "var(--indigo)", key: "analytical" },
  };

  return meta[key] || { color: "var(--teal)", key: "default" };
}
