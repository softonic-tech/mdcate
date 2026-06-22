const SECTION_LINE = /^SECTION\s+\d+/i;
const QUESTION_LINE = /^(\d+)\.\s*\[(EASY|MODERATE|MEDIUM|HARD|HARDER)\]\s*(.+)$/i;
const OPTION_LINE = /^([A-Z])\)\s*(.+)$/;
const CORRECT_LINE = /^Correct Answer:\s*([A-Z])\)?/i;
const EXPLANATION_LINE = /^Explanation:\s*(.*)$/i;

export const mapDifficulty = (raw) => {
  const u = String(raw || "").toUpperCase();
  if (u === "EASY") return "easy";
  if (u === "MODERATE" || u === "MEDIUM") return "medium";
  if (u === "HARD" || u === "HARDER") return "hard";
  return "medium";
};

export const textToLines = (rawText = "") =>
  rawText
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

export const parseStructuredMcqs = (rawText = "") => {
  const lines = textToLines(rawText);
  const questions = [];
  const errors = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line || SECTION_LINE.test(line)) {
      i += 1;
      continue;
    }

    const qm = line.match(QUESTION_LINE);
    if (!qm) {
      i += 1;
      continue;
    }

    const [, , diffRaw, text] = qm;
    i += 1;
    const options = [];
    const optionLetters = [];

    while (i < lines.length) {
      const om = lines[i].match(OPTION_LINE);
      if (!om) break;
      optionLetters.push(om[1].toUpperCase());
      options.push(om[2].trim());
      i += 1;
    }

    if (options.length < 2) {
      errors.push({ line: text.slice(0, 60), reason: "fewer than 2 options" });
      continue;
    }

    if (i >= lines.length || !CORRECT_LINE.test(lines[i])) {
      errors.push({ line: text.slice(0, 60), reason: "missing Correct Answer line" });
      continue;
    }

    const cm = lines[i].match(CORRECT_LINE);
    const letter = cm[1].toUpperCase();
    i += 1;
    const correctIndex = optionLetters.indexOf(letter);
    if (correctIndex === -1) {
      errors.push({ line: text.slice(0, 60), reason: `correct letter ${letter} not in options` });
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
    });
  }

  return { questions, errors };
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
  };
};

export const dedupeMcqs = (questions) => {
  const seen = new Set();
  return questions.filter((question) => {
    const key = question.text.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
