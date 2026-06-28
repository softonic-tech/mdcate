// ─────────────────────────────────────────────────────────────────────────────
// Supported MCQ templates
// ─────────────────────────────────────────────────────────────────────────────
// 1) Legacy template (one item per line block):
//      1. [EASY] Question stem
//      A) Option text
//      B) Option text
//      Correct Answer: A
//      Explanation: ...
//
// 2) "Q<n>." template used in the recent docx exports:
//      Q1. (Year: Past 2017 | Chapter: X | Difficulty: Moderate)
//      Question stem ...
//      A. Option text
//      B. Option text
//      C. Option text
//      D. Option text
//      Answer: AIDS                ← answer can be a letter OR the answer text
//      Explanation: ...            ← or "Answer: B. AIDS"
//
//    Metadata can also be pipe-delimited without parentheses, e.g.
//      Q12. Chapter: X | Topic: Y | Difficulty: Easy | Past-paper style
//
// Both templates flow through `parseStructuredMcqs`. If the input is run-on
// text (no line breaks survived the extraction), the regex-based fuzzy parser
// at the bottom picks up the same patterns.

const SECTION_LINE = /^SECTION\s+\d+/i;

// Legacy template
const LEGACY_QUESTION_LINE =
  /^(\d+)\.\s*\[(EASY|MODERATE|MEDIUM|HARD|HARDER)\]\s*(.+)$/i;
const LEGACY_OPTION_LINE = /^([A-Z])\)\s*(.+)$/;
const LEGACY_CORRECT_LINE = /^Correct Answer:\s*([A-Z])\)?/i;

// Shared / Q-template lines
const Q_HEADER_LINE = /^Q\s*(\d+)\.?\s*(.*)$/i;
const OPTION_LINE = /^([A-Z])\s*[.)]\s*(.+)$/;
const ANSWER_LINE = /^Answer\s*:\s*(.+)$/i;
const EXPLANATION_LINE = /^Explanation\s*:\s*(.*)$/i;
const ANSWER_LETTER_PREFIX = /^([A-Z])\s*[.)]\s*(.*)$/i;

// Metadata helpers
const METADATA_KEY_HEAD =
  /^(Chapter|Topic|Difficulty|Year|Source|Type|Section|Class|Subject|Board)\s*:/i;
const DIFFICULTY_TAG = /\bDifficulty\s*:\s*([A-Za-z]+)/i;
const YEAR_TAG = /\bYear\s*:\s*([A-Za-z]+)?\s*(\d{4})/i;
const TOPIC_TAG = /\bTopic\s*:\s*([^|)]+?)(?:\s*\||\s*\)|$)/i;

export const mapDifficulty = (raw) => {
  const u = String(raw || "").toUpperCase();
  if (u === "EASY") return "easy";
  if (u === "MODERATE" || u === "MEDIUM" || u === "INTERMEDIATE") return "medium";
  if (u === "HARD" || u === "HARDER" || u === "DIFFICULT") return "hard";
  return "medium";
};

export const textToLines = (rawText = "") =>
  String(rawText || "")
    .split(/\r?\n/)
    .map((line) => line.trim());

const normalizeForCompare = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/[\s\u00a0]+/g, " ")
    .replace(/[\u2018\u2019\u201c\u201d]/g, "'")
    .trim();

const stripTrailingPunctuation = (s) =>
  String(s || "").replace(/[\s.,;:!?)\]]+$/g, "");

// Find the option that matches the free-text answer.
// Tries exact normalized match, then "starts-with", then loose substring.
const findCorrectIndex = (options, answer) => {
  if (answer.letter) {
    const idx = options.findIndex((o) => o.letter === answer.letter);
    if (idx !== -1) return idx;
  }

  const target = normalizeForCompare(stripTrailingPunctuation(answer.text));
  if (!target) return -1;

  const normalized = options.map((o) =>
    normalizeForCompare(stripTrailingPunctuation(o.text))
  );

  let idx = normalized.findIndex((opt) => opt === target);
  if (idx !== -1) return idx;

  idx = normalized.findIndex(
    (opt) => opt && (opt.startsWith(target) || target.startsWith(opt))
  );
  if (idx !== -1) return idx;

  idx = normalized.findIndex(
    (opt) => opt && (opt.includes(target) || target.includes(opt))
  );
  return idx;
};

const extractMetadataFromHeader = (headerRest) => {
  const trimmed = String(headerRest || "").trim();
  if (!trimmed) return { metadata: "", remaining: "" };

  if (trimmed.startsWith("(")) {
    const close = trimmed.indexOf(")");
    if (close > 0) {
      return {
        metadata: trimmed.slice(1, close).trim(),
        remaining: trimmed.slice(close + 1).trim(),
      };
    }
  }

  if (METADATA_KEY_HEAD.test(trimmed)) {
    return { metadata: trimmed, remaining: "" };
  }

  return { metadata: "", remaining: trimmed };
};

const metadataToFields = (metadata) => {
  const meta = String(metadata || "");
  const difficultyRaw = (meta.match(DIFFICULTY_TAG) || [])[1] || "medium";
  const yearMatch = meta.match(YEAR_TAG);
  const isPastPaper = Boolean(yearMatch && /past/i.test(yearMatch[1] || ""));
  // Only persist paperYear when the metadata actually marks it as a past paper.
  // Tags like "Year: Practice 2026" use the year as a label, not an exam year.
  const paperYear = isPastPaper && yearMatch ? Number(yearMatch[2]) || null : null;
  const topicMatch = meta.match(TOPIC_TAG);
  const tags = topicMatch ? [topicMatch[1].trim()].filter(Boolean) : [];

  return {
    difficulty: mapDifficulty(difficultyRaw),
    isPastPaper,
    paperYear,
    tags,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Legacy line-based parser
// ─────────────────────────────────────────────────────────────────────────────
const parseLegacyFormat = (lines) => {
  const questions = [];
  const errors = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line || SECTION_LINE.test(line)) {
      i += 1;
      continue;
    }

    const qm = line.match(LEGACY_QUESTION_LINE);
    if (!qm) {
      i += 1;
      continue;
    }

    const [, , diffRaw, text] = qm;
    i += 1;
    const options = [];
    const optionLetters = [];

    while (i < lines.length) {
      const om = lines[i].match(LEGACY_OPTION_LINE);
      if (!om) break;
      optionLetters.push(om[1].toUpperCase());
      options.push(om[2].trim());
      i += 1;
    }

    if (options.length < 2) {
      errors.push({ line: text.slice(0, 60), reason: "fewer than 2 options" });
      continue;
    }

    if (i >= lines.length || !LEGACY_CORRECT_LINE.test(lines[i])) {
      errors.push({ line: text.slice(0, 60), reason: "missing Correct Answer line" });
      continue;
    }

    const cm = lines[i].match(LEGACY_CORRECT_LINE);
    const letter = cm[1].toUpperCase();
    i += 1;
    const correctIndex = optionLetters.indexOf(letter);
    if (correctIndex === -1) {
      errors.push({
        line: text.slice(0, 60),
        reason: `correct letter ${letter} not in options`,
      });
      continue;
    }

    let explanation = "";
    if (i < lines.length && EXPLANATION_LINE.test(lines[i])) {
      const em = lines[i].match(EXPLANATION_LINE);
      explanation = (em[1] || "").trim();
      i += 1;
    }

    questions.push({
      text: text.trim(),
      options,
      correctAnswer: correctIndex,
      explanation,
      difficulty: mapDifficulty(diffRaw),
      tags: [],
      isPastPaper: false,
      paperYear: null,
    });
  }

  return { questions, errors };
};

// ─────────────────────────────────────────────────────────────────────────────
// Q<n>. line-based parser (handles the new docx exports)
// ─────────────────────────────────────────────────────────────────────────────
const parseQHeaderFormat = (lines) => {
  const questions = [];
  const errors = [];
  let i = 0;

  const advanceToNextHeader = () => {
    while (i < lines.length && !Q_HEADER_LINE.test(lines[i])) i += 1;
  };

  while (i < lines.length) {
    const line = lines[i];
    if (!line) {
      i += 1;
      continue;
    }

    const qm = line.match(Q_HEADER_LINE);
    if (!qm) {
      i += 1;
      continue;
    }

    const headerRest = qm[2] || "";
    const { metadata: headerMeta, remaining: stemFromHeader } =
      extractMetadataFromHeader(headerRest);
    let metadata = headerMeta;
    const stemParts = [];
    if (stemFromHeader) stemParts.push(stemFromHeader);
    i += 1;

    // Collect stem lines until we hit options / answer / next question.
    while (i < lines.length) {
      const next = lines[i];
      if (!next) {
        i += 1;
        continue;
      }
      if (
        Q_HEADER_LINE.test(next) ||
        OPTION_LINE.test(next) ||
        ANSWER_LINE.test(next) ||
        EXPLANATION_LINE.test(next)
      ) {
        break;
      }
      if (stemParts.length === 0 && METADATA_KEY_HEAD.test(next)) {
        metadata += (metadata ? " | " : "") + next;
        i += 1;
        continue;
      }
      stemParts.push(next);
      i += 1;
    }

    // Collect options (allow wrap-around lines for long option text).
    const options = [];
    while (i < lines.length) {
      const next = lines[i];
      if (!next) {
        i += 1;
        continue;
      }
      if (
        Q_HEADER_LINE.test(next) ||
        ANSWER_LINE.test(next) ||
        EXPLANATION_LINE.test(next)
      ) {
        break;
      }
      const om = next.match(OPTION_LINE);
      if (om) {
        options.push({ letter: om[1].toUpperCase(), text: om[2].trim() });
        i += 1;
        continue;
      }
      if (options.length > 0) {
        const last = options[options.length - 1];
        last.text = `${last.text} ${next}`.trim();
        i += 1;
        continue;
      }
      break;
    }

    if (options.length < 2) {
      errors.push({
        line: stemParts.join(" ").slice(0, 60),
        reason: "fewer than 2 options",
      });
      advanceToNextHeader();
      continue;
    }

    while (i < lines.length && !lines[i]) i += 1;

    const answer = { letter: null, text: "" };
    if (i < lines.length && ANSWER_LINE.test(lines[i])) {
      const am = lines[i].match(ANSWER_LINE);
      let body = am[1].trim();
      i += 1;
      while (i < lines.length) {
        const next = lines[i];
        if (!next) {
          i += 1;
          continue;
        }
        if (
          Q_HEADER_LINE.test(next) ||
          EXPLANATION_LINE.test(next) ||
          OPTION_LINE.test(next)
        ) {
          break;
        }
        body += " " + next;
        i += 1;
      }
      const prefix = body.match(ANSWER_LETTER_PREFIX);
      if (prefix) {
        answer.letter = prefix[1].toUpperCase();
        answer.text = prefix[2].trim();
      } else {
        answer.text = body.trim();
      }
    } else {
      errors.push({
        line: stemParts.join(" ").slice(0, 60),
        reason: "missing Answer line",
      });
      advanceToNextHeader();
      continue;
    }

    while (i < lines.length && !lines[i]) i += 1;

    let explanation = "";
    if (i < lines.length && EXPLANATION_LINE.test(lines[i])) {
      const em = lines[i].match(EXPLANATION_LINE);
      explanation = (em[1] || "").trim();
      i += 1;
      while (i < lines.length) {
        const next = lines[i];
        if (!next) {
          i += 1;
          continue;
        }
        if (Q_HEADER_LINE.test(next)) break;
        explanation += " " + next;
        i += 1;
      }
    }

    const correctIndex = findCorrectIndex(options, answer);
    if (correctIndex === -1) {
      errors.push({
        line: stemParts.join(" ").slice(0, 60),
        reason: "could not match Answer to any option",
      });
      continue;
    }

    const { difficulty, isPastPaper, paperYear, tags } = metadataToFields(metadata);

    questions.push({
      text: stemParts.join(" ").trim(),
      options: options.map((o) => o.text),
      correctAnswer: correctIndex,
      explanation,
      difficulty,
      tags,
      isPastPaper,
      paperYear,
    });
  }

  return { questions, errors };
};

// ─────────────────────────────────────────────────────────────────────────────
// Regex-based fallback for "run-on" text where no line breaks survived.
// Splits on Q<n>. boundaries and pulls out A.B.C.D and Answer/Explanation
// using the marker words themselves as anchors.
// ─────────────────────────────────────────────────────────────────────────────
const FUZZY_QUESTION_SPLIT = /\bQ\s*\d+\.?\s+/g;
// Lazy capture between markers; we don't require whitespace before the marker
// because mammoth collapses it in the raw extraction.
const FUZZY_BLOCK_REGEX =
  /^([\s\S]*?)A\s*[.)]\s*([\s\S]+?)B\s*[.)]\s*([\s\S]+?)C\s*[.)]\s*([\s\S]+?)D\s*[.)]\s*([\s\S]+?)(?:E\s*[.)]\s*([\s\S]+?))?Answer\s*:\s*([\s\S]+?)(?:Explanation\s*:\s*([\s\S]+))?$/i;

const splitFuzzyBlocks = (text) => {
  const matches = [...String(text || "").matchAll(FUZZY_QUESTION_SPLIT)];
  if (matches.length === 0) return [];
  const blocks = [];
  for (let k = 0; k < matches.length; k += 1) {
    const start = matches[k].index + matches[k][0].length;
    const end = k + 1 < matches.length ? matches[k + 1].index : text.length;
    blocks.push(text.slice(start, end).trim());
  }
  return blocks;
};

const parseFuzzyFormat = (text) => {
  const blocks = splitFuzzyBlocks(text);
  const questions = [];
  const errors = [];

  for (const block of blocks) {
    const cleaned = block.replace(/\s+/g, " ").trim();
    const m = cleaned.match(FUZZY_BLOCK_REGEX);
    if (!m) {
      errors.push({ line: cleaned.slice(0, 60), reason: "fuzzy regex did not match" });
      continue;
    }

    const [, stemRaw, optA, optB, optC, optD, optE, answerRaw, explanationRaw] = m;

    let stem = stemRaw.trim();
    let metadata = "";
    if (stem.startsWith("(")) {
      const close = stem.indexOf(")");
      if (close > 0) {
        metadata = stem.slice(1, close).trim();
        stem = stem.slice(close + 1).trim();
      }
    } else if (METADATA_KEY_HEAD.test(stem)) {
      // Find transition where metadata ends and question stem starts.
      const transition = stem.match(/[a-z][A-Z]/);
      if (transition) {
        const idx = transition.index + 1;
        metadata = stem.slice(0, idx).trim();
        stem = stem.slice(idx).trim();
      }
    }

    const options = [
      { letter: "A", text: optA.trim() },
      { letter: "B", text: optB.trim() },
      { letter: "C", text: optC.trim() },
      { letter: "D", text: optD.trim() },
    ];
    if (optE) options.push({ letter: "E", text: optE.trim() });

    const answer = { letter: null, text: "" };
    const prefix = answerRaw.trim().match(ANSWER_LETTER_PREFIX);
    if (prefix) {
      answer.letter = prefix[1].toUpperCase();
      answer.text = prefix[2].trim();
    } else {
      answer.text = answerRaw.trim();
    }

    const correctIndex = findCorrectIndex(options, answer);
    if (correctIndex === -1) {
      errors.push({
        line: stem.slice(0, 60),
        reason: "could not match Answer to any option",
      });
      continue;
    }

    const { difficulty, isPastPaper, paperYear, tags } = metadataToFields(metadata);

    questions.push({
      text: stem,
      options: options.map((o) => o.text),
      correctAnswer: correctIndex,
      explanation: (explanationRaw || "").trim(),
      difficulty,
      tags,
      isPastPaper,
      paperYear,
    });
  }

  return { questions, errors };
};

// ─────────────────────────────────────────────────────────────────────────────
// KMU / MDCAT full-paper template (plain text, docx, pdf exports)
//
//   KMU MDCAT 2025 CODE D - Complete Questions
//
//   BIOLOGY
//   1. Question stem...
//   a. Option A
//   b. Option B
//   c. Option C
//   d. Option D
//
//   PHYSICS
//   82. Next question...
//   a. ...
//
// Optional answer key at the end:
//   ANSWER KEY
//   1. B
//   2. A
// ─────────────────────────────────────────────────────────────────────────────
const KMU_SECTION_LINE = /^([A-Z][A-Z0-9\s]{2,60})$/;
const KMU_END_MARKERS = /^(END OF PAPER|ANSWER KEY|ANSWER SHEET|KEY)$/i;
const KMU_SKIP_LINE =
  /^(?:\d+\s*-\s*\d+\s*:|Questions not clearly visible|\(Questions not|\(Option not visible)/i;
const KMU_QUESTION_LINE = /^(\d+)\.\s+(.+)$/;
const KMU_OPTION_LINE = /^([a-eA-E])\.\s*(.+)$/;
const KMU_ANSWER_KEY_LINE = /^(\d+)\s*[.)]?\s*([A-Ea-e])\b/;

const KMU_KNOWN_SECTIONS = new Set([
  "BIOLOGY",
  "PHYSICS",
  "CHEMISTRY",
  "ENGLISH",
  "LOGICAL REASONING",
  "ANALYTICAL REASONING",
  "MATHEMATICS",
  "MATH",
]);

const isKmuSectionLine = (line) => {
  if (!line || !KMU_SECTION_LINE.test(line)) return false;
  if (KMU_END_MARKERS.test(line)) return false;
  if (KMU_SKIP_LINE.test(line)) return false;
  const upper = line.toUpperCase();
  if (KMU_KNOWN_SECTIONS.has(upper)) return true;
  // Heuristic: all-caps words, no sentence punctuation, not a question stem.
  return /^[A-Z][A-Z\s]{3,}$/.test(line) && !line.includes("?");
};

const parseKmuAnswerKey = (lines) => {
  const keyStart = lines.findIndex((line) => KMU_END_MARKERS.test(line) && /KEY/i.test(line));
  if (keyStart === -1) return {};

  const answers = {};
  for (let i = keyStart + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line || isKmuSectionLine(line)) continue;
    const match = line.match(KMU_ANSWER_KEY_LINE);
    if (match) {
      answers[Number(match[1])] = match[2].toLowerCase().charCodeAt(0) - 97;
    }
  }
  return answers;
};

export const detectKmuMdcatFormat = (rawText = "") => {
  const lines = textToLines(rawText);
  const sectionCount = lines.filter(isKmuSectionLine).length;
  const optionCount = lines.filter((line) => KMU_OPTION_LINE.test(line)).length;
  const questionCount = lines.filter(
    (line) => KMU_QUESTION_LINE.test(line) && !KMU_OPTION_LINE.test(line)
  ).length;

  return sectionCount >= 2 && optionCount >= 8 && questionCount >= 5;
};

export const parseKmuMdcatFormat = (rawText = "") => {
  const lines = textToLines(rawText);
  const questions = [];
  const errors = [];
  const sectionCounts = {};
  const answerKey = parseKmuAnswerKey(lines);

  let detectedTitle = "";
  let currentSection = "GENERAL";
  let titleCaptured = false;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line) {
      i += 1;
      continue;
    }

    if (KMU_END_MARKERS.test(line) && /KEY/i.test(line)) {
      break;
    }

    if (line.toUpperCase() === "END OF PAPER") {
      break;
    }

    if (KMU_SKIP_LINE.test(line)) {
      i += 1;
      continue;
    }

    if (isKmuSectionLine(line)) {
      currentSection = line.toUpperCase().trim();
      sectionCounts[currentSection] = sectionCounts[currentSection] || 0;
      i += 1;
      continue;
    }

    if (!titleCaptured && !KMU_QUESTION_LINE.test(line)) {
      detectedTitle = line.trim();
      titleCaptured = true;
      i += 1;
      continue;
    }

    const qm = line.match(KMU_QUESTION_LINE);
    if (!qm) {
      i += 1;
      continue;
    }

    const paperNumber = Number(qm[1]);
    const stemParts = [qm[2].trim()];
    i += 1;

    const options = [];
    while (i < lines.length) {
      const next = lines[i];
      if (!next) {
        i += 1;
        continue;
      }
      if (isKmuSectionLine(next) || KMU_QUESTION_LINE.test(next) || KMU_END_MARKERS.test(next)) {
        break;
      }
      if (KMU_SKIP_LINE.test(next)) {
        i += 1;
        continue;
      }

      const om = next.match(KMU_OPTION_LINE);
      if (om) {
        options.push(om[2].trim());
        i += 1;
        continue;
      }

      if (options.length > 0 && options.length < 4) {
        break;
      }

      if (options.length === 0 && !KMU_ANSWER_KEY_LINE.test(next)) {
        stemParts.push(next);
        i += 1;
        continue;
      }
      break;
    }

    if (options.length < 2) {
      errors.push({
        line: stemParts.join(" ").slice(0, 60),
        reason: `section ${currentSection} #${paperNumber}: fewer than 2 options`,
      });
      continue;
    }

    let correctAnswer =
      answerKey[paperNumber] !== undefined ? answerKey[paperNumber] : -1;
    const needsAnswerKey = correctAnswer < 0;
    if (needsAnswerKey) correctAnswer = 0;

    if (correctAnswer >= options.length) {
      errors.push({
        line: stemParts.join(" ").slice(0, 60),
        reason: `section ${currentSection} #${paperNumber}: answer index out of range`,
      });
      continue;
    }

    const tags = [currentSection];
    if (needsAnswerKey) tags.push("needs-answer-key");

    sectionCounts[currentSection] = (sectionCounts[currentSection] || 0) + 1;

    questions.push({
      text: stemParts.join(" ").trim(),
      options,
      correctAnswer,
      explanation: needsAnswerKey ? "" : "",
      difficulty: "medium",
      tags,
      section: currentSection,
      paperNumber,
      isPastPaper: true,
      paperYear: null,
      needsAnswerKey,
    });
  }

  const sections = Object.entries(sectionCounts).map(([name, count]) => ({
    name,
    count,
  }));

  return {
    questions,
    errors,
    detectedTitle,
    sections,
    missingAnswerCount: questions.filter((q) => q.needsAnswerKey).length,
    format: "kmu_mdcat",
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// MDCAT Section-Aware parser
//
// Handles the three PDF formats from KMU 2024, KMU 2023 Reconduct, ETEA 2023:
//
//   Format A (KMU 2024):
//     BIOLOGY
//     Q1. Question stem?
//     a. Option A
//     b. Option B
//     Correct: b. Option B
//     Optional explanation text...
//
//   Format B (KMU 2023 Reconduct):
//     [BIOLOGY] Q001. Question stem?
//     a. Opt A b. Opt B [Correct]
//     c. Opt C d. Opt D
//     Correct: b. Opt B
//     Explanation: ...
//
//   Format C (ETEA 2023):
//     CHEMISTRY Questions 1 – 54
//     Q01. Question stem?
//     A. Option A
//     B. Option B
//     Correct: B. Option B
//     Explanation: ...
// ─────────────────────────────────────────────────────────────────────────────

const MDCAT_Q_LINE = /^Q\s*(\d+)\.\s*(.*)$/i;
const MDCAT_OPTION_LINE = /^([A-Ea-e])\.\s+(.+)$/;
const MDCAT_ANSWER_LINE = /^(?:Answer|Correct)\s*:\s*(.+)$/i;
const MDCAT_EXPLANATION_LINE = /^Explanation\s*:\s*(.*)$/i;
const MDCAT_SECTION_RE = /^([A-Z][A-Z\s]{2,50})$/;
const MDCAT_KNOWN_SECTIONS = new Set([
  "BIOLOGY", "PHYSICS", "CHEMISTRY", "ENGLISH",
  "LOGICAL REASONING", "ANALYTICAL REASONING", "MATHEMATICS", "MATH",
]);

const isMdcatSectionLine = (line) => {
  const upper = String(line || "").toUpperCase().trim();
  return MDCAT_KNOWN_SECTIONS.has(upper);
};

// Normalise raw PDF text into a clean, one-item-per-line representation.
const normalizeMdcatPdfText = (rawText) => {
  const lines = String(rawText || "").split(/\r?\n/);
  const out = [];

  for (const raw of lines) {
    const line = raw.trim();

    // Remove page markers
    if (/^Page\s+\d+(\s*\/\s*\d+)?$/i.test(line)) continue;
    if (/^--\s*\d+\s*of\s*\d+\s*--$/.test(line)) continue;

    // "[SECTION] Q001. stem" → expand into section line + Q line
    const inlineSection = line.match(/^\[([A-Z][A-Z\s]*)\]\s+(Q\s*\d+\..*)$/i);
    if (inlineSection) {
      out.push(inlineSection[1].trim().toUpperCase());
      out.push(inlineSection[2].trim());
      continue;
    }

    // "SECTION Questions 1 – 54" or "SECTION Questions N-M" → just "SECTION"
    const sectionWithRange = line.match(/^([A-Z][A-Z\s]+[A-Z])\s+Questions?\s+[\d–—-]/i);
    if (sectionWithRange) {
      out.push(sectionWithRange[1].trim().toUpperCase());
      continue;
    }

    // Split inline double-options: "a. Opt A b. Opt B [Correct]" → two lines
    // Only split when the line STARTS with a letter+period
    const inlineOpts = line.match(/^([A-Ea-e])\.\s+(.+?)\s+([B-Eb-e])\.\s+(.+)$/);
    if (inlineOpts) {
      out.push(`${inlineOpts[1]}. ${inlineOpts[2].replace(/\s*\[Correct\]/i, "").trim()}`);
      out.push(`${inlineOpts[3]}. ${inlineOpts[4].replace(/\s*\[Correct\]/i, "").trim()}`);
      continue;
    }

    // Strip stray [Correct] markers from single-option lines
    out.push(line.replace(/\s*\[Correct\]/gi, ""));
  }

  return out.join("\n");
};

export const detectMdcatSectionFormat = (rawText = "") => {
  const text = normalizeMdcatPdfText(rawText);
  const lines = textToLines(text);
  const qCount = lines.filter((l) => MDCAT_Q_LINE.test(l)).length;
  const answerCount = lines.filter((l) => MDCAT_ANSWER_LINE.test(l)).length;
  return qCount >= 5 && answerCount >= 3 && answerCount >= qCount * 0.5;
};

export const parseMdcatSectionFormat = (rawText = "") => {
  const text = normalizeMdcatPdfText(rawText);
  const lines = textToLines(text);
  const questions = [];
  const errors = [];
  const sectionCounts = {};

  let currentSection = "GENERAL";
  let detectedTitle = "";
  let titleCaptured = false;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line) { i += 1; continue; }

    // Detect section headers
    if (isMdcatSectionLine(line) && !MDCAT_Q_LINE.test(line) && !MDCAT_OPTION_LINE.test(line)) {
      currentSection = line.toUpperCase().trim();
      sectionCounts[currentSection] = sectionCounts[currentSection] || 0;
      i += 1;
      continue;
    }

    // Capture title from first non-question, non-section line
    if (!titleCaptured && !MDCAT_Q_LINE.test(line) && !MDCAT_OPTION_LINE.test(line)) {
      detectedTitle = line.trim();
      titleCaptured = true;
      i += 1;
      continue;
    }

    const qm = line.match(MDCAT_Q_LINE);
    if (!qm) { i += 1; continue; }

    const paperNumber = Number(qm[1]);
    const stemParts = [];
    if (qm[2].trim()) stemParts.push(qm[2].trim());
    i += 1;

    // Collect stem lines (continue until we see an option or answer)
    while (i < lines.length) {
      const next = lines[i];
      if (!next) { i += 1; continue; }
      if (MDCAT_Q_LINE.test(next) || MDCAT_OPTION_LINE.test(next) || MDCAT_ANSWER_LINE.test(next)) break;
      stemParts.push(next);
      i += 1;
    }

    // Collect options
    const options = [];
    while (i < lines.length) {
      const next = lines[i];
      if (!next) { i += 1; continue; }
      if (MDCAT_Q_LINE.test(next) || MDCAT_ANSWER_LINE.test(next)) break;
      const om = next.match(MDCAT_OPTION_LINE);
      if (om) {
        options.push({ letter: om[1].toUpperCase(), text: om[2].trim() });
        i += 1;
        continue;
      }
      // Wrap continuation of long option text
      if (options.length > 0 && !isMdcatSectionLine(next)) {
        options[options.length - 1].text += " " + next;
        i += 1;
        continue;
      }
      break;
    }

    if (options.length < 2) {
      errors.push({ line: stemParts.join(" ").slice(0, 60), reason: `Q${paperNumber}: fewer than 2 options` });
      continue;
    }

    // Skip blank lines before answer
    while (i < lines.length && !lines[i]) i += 1;

    // Read answer line (Correct: or Answer:)
    const answer = { letter: null, text: "" };
    if (i < lines.length && MDCAT_ANSWER_LINE.test(lines[i])) {
      const am = lines[i].match(MDCAT_ANSWER_LINE);
      const body = am[1].trim();
      i += 1;
      const prefix = body.match(/^([A-Ea-e])[.)]\s*(.*)$/);
      if (prefix) {
        answer.letter = prefix[1].toUpperCase();
        answer.text = prefix[2].trim();
      } else {
        answer.text = body;
      }
    } else {
      errors.push({ line: stemParts.join(" ").slice(0, 60), reason: `Q${paperNumber}: no answer line` });
      continue;
    }

    const correctIndex = findCorrectIndex(options, answer);
    if (correctIndex < 0) {
      errors.push({ line: stemParts.join(" ").slice(0, 60), reason: `Q${paperNumber}: answer not matched to option` });
      continue;
    }

    // Read optional explanation
    while (i < lines.length && !lines[i]) i += 1;
    let explanation = "";
    if (i < lines.length && MDCAT_EXPLANATION_LINE.test(lines[i])) {
      const em = lines[i].match(MDCAT_EXPLANATION_LINE);
      explanation = (em[1] || "").trim();
      i += 1;
      // Collect continuation lines
      while (i < lines.length) {
        const next = lines[i];
        if (!next) { i += 1; continue; }
        if (MDCAT_Q_LINE.test(next) || isMdcatSectionLine(next)) break;
        explanation += " " + next;
        i += 1;
      }
    } else if (i < lines.length && !MDCAT_Q_LINE.test(lines[i]) && !isMdcatSectionLine(lines[i])) {
      // Bare explanation (KMU 2024 style: no "Explanation:" prefix)
      explanation = lines[i];
      i += 1;
    }

    sectionCounts[currentSection] = (sectionCounts[currentSection] || 0) + 1;

    questions.push({
      text: stemParts.join(" ").trim(),
      options: options.map((o) => o.text),
      correctAnswer: correctIndex,
      explanation: explanation.trim(),
      difficulty: "medium",
      tags: [currentSection],
      section: currentSection,
      paperNumber,
      isPastPaper: true,
      paperYear: null,
    });
  }

  const sections = Object.entries(sectionCounts).map(([name, count]) => ({ name, count }));
  const yearFromTitle = detectedTitle.match(/\b(20\d{2})\b/);

  return {
    questions,
    errors,
    detectedTitle,
    sections,
    missingAnswerCount: 0,
    suggestedYear: yearFromTitle ? Number(yearFromTitle[1]) : null,
    format: "mdcat_section",
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────
export const parseStructuredMcqs = (rawText = "") => {
  // Try the MDCAT section-aware parser first (handles KMU/ETEA PDFs with Q<n>. + Correct:)
  if (detectMdcatSectionFormat(rawText)) {
    const mdcat = parseMdcatSectionFormat(rawText);
    if (mdcat.questions.length > 0) return mdcat;
  }

  if (detectKmuMdcatFormat(rawText)) {
    const kmu = parseKmuMdcatFormat(rawText);
    if (kmu.questions.length > 0) return kmu;
  }

  const lines = textToLines(rawText);

  const legacy = parseLegacyFormat(lines);
  if (legacy.questions.length > 0) return legacy;

  const qFormat = parseQHeaderFormat(lines);
  if (qFormat.questions.length > 0) return qFormat;

  return parseFuzzyFormat(rawText);
};

export const normalizeAiMcq = (item) => {
  const options = Array.isArray(item?.options)
    ? item.options.map((opt) => String(opt).trim()).filter(Boolean)
    : [];

  let correctAnswer = Number.isInteger(item?.correctAnswer) ? item.correctAnswer : -1;

  if (correctAnswer < 0 && item?.correctLetter) {
    const letter = String(item.correctLetter).toUpperCase();
    correctAnswer = letter.charCodeAt(0) - 65;
  }

  const text = String(item?.text || "").trim();

  if (!text || options.length < 2 || correctAnswer < 0 || correctAnswer >= options.length) {
    return null;
  }

  return {
    text,
    options,
    correctAnswer,
    explanation: String(item?.explanation || "").trim(),
    difficulty: mapDifficulty(item?.difficulty || "medium"),
    tags: Array.isArray(item?.tags) ? item.tags.map(String) : [],
    isPastPaper: Boolean(item?.isPastPaper),
    paperYear: item?.paperYear ? Number(item.paperYear) || null : null,
  };
};

export const dedupeMcqs = (questions) => {
  const seen = new Set();
  return questions.filter((question) => {
    const key = normalizeForCompare(question.text);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
