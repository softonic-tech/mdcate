import { Dna, FlaskConical, Zap, PenLine, Puzzle, BarChart3, BookOpen } from "lucide-react";

const SUBJECT_ICON_MAP = [
  { match: /bio/i, Icon: Dna, color: "#22c55e" },
  { match: /chem/i, Icon: FlaskConical, color: "#3b82f6" },
  { match: /phys/i, Icon: Zap, color: "#f59e0b" },
  { match: /eng/i, Icon: PenLine, color: "#ec4899" },
  { match: /logic/i, Icon: Puzzle, color: "#8b5cf6" },
  { match: /analyt|reason/i, Icon: BarChart3, color: "#06b6d4" },
];

export function getSubjectVisual(name = "") {
  const found = SUBJECT_ICON_MAP.find(({ match }) => match.test(name));
  return found || { Icon: BookOpen, color: "var(--accent-1)" };
}

export const normalizeList = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return [];
};

export const SECTION_SIZE = 50;
