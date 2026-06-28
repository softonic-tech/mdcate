import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import OpenAI from "openai";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import env from "../config/env.config.js";
import Subject from "../models/subject.model.js";
import Chapter from "../models/chapter.model.js";
import {
  dedupeMcqs,
  normalizeAiMcq,
  parseStructuredMcqs,
} from "../utils/mcqParse.util.js";
import { bulkCreateQuestionsService } from "./question.service.js";
import Test from "../models/test.model.js";

const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_AI_CHUNK = 8000;
const MIN_STRUCTURED_COUNT = 3;
const AI_MAX_TOKENS = 4000;

const DOCX_TYPES = new Set([
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
]);
const PDF_TYPES = new Set(["application/pdf"]);

const buildOpenAiClient = () => {
  if (!env.OPENAI_API_KEY) {
    throw ApiError.internal("OPENAI_API_KEY is not configured for AI import.");
  }
  return new OpenAI({ apiKey: env.OPENAI_API_KEY });
};

// mammoth.extractRawText collapses soft line breaks (Shift+Enter) inside a paragraph,
// which is exactly how many MCQ docx exports lay out one full question per paragraph.
// Converting via convertToHtml lets us preserve <br/> as real newlines so the
// structured parser can see one option per line.
const decodeHtmlEntities = (str) =>
  String(str || "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x?([0-9a-fA-F]+);/g, (_, code) =>
      String.fromCodePoint(parseInt(code, code.startsWith?.("x") ? 16 : 10))
    );

const htmlToPlainText = (html) =>
  decodeHtmlEntities(
    String(html || "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|h\d|li|tr|div|section|article)>/gi, "\n\n")
      .replace(/<[^>]+>/g, "")
  )
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

export const extractTextFromUpload = async (file) => {
  if (!file?.buffer?.length) {
    throw ApiError.badRequest("No file uploaded.");
  }

  if (file.size > MAX_FILE_BYTES) {
    throw ApiError.badRequest("File too large. Maximum size is 15 MB.");
  }

  const mime = file.mimetype || "";

  if (DOCX_TYPES.has(mime) || file.originalname?.toLowerCase().endsWith(".docx")) {
    const { value } = await mammoth.convertToHtml({ buffer: file.buffer });
    return { text: htmlToPlainText(value), fileType: "docx" };
  }

  if (PDF_TYPES.has(mime) || file.originalname?.toLowerCase().endsWith(".pdf")) {
    const parser = new PDFParse({ data: file.buffer });
    const result = await parser.getText();
    await parser.destroy();
    return { text: result?.text || "", fileType: "pdf" };
  }

  if (
    mime === "text/plain" ||
    file.originalname?.toLowerCase().endsWith(".txt")
  ) {
    return { text: file.buffer.toString("utf8"), fileType: "txt" };
  }

  throw ApiError.badRequest(
    "Unsupported file type. Upload a .txt, .docx, or .pdf file."
  );
};

export const validateImportTargets = async (subjectId, chapterId) => {
  if (!mongoose.Types.ObjectId.isValid(subjectId) || !mongoose.Types.ObjectId.isValid(chapterId)) {
    throw ApiError.badRequest("Valid subjectId and chapterId are required.");
  }

  const subject = await Subject.findById(subjectId);
  const chapter = await Chapter.findById(chapterId);

  if (!subject) throw ApiError.notFound("Subject not found");
  if (!chapter) throw ApiError.notFound("Chapter not found");
  if (String(chapter.subjectId) !== String(subject._id)) {
    throw ApiError.badRequest("Chapter does not belong to the selected subject.");
  }

  return { subject, chapter };
};

const PAST_PAPER_CHAPTER_NAME = "Past Papers";

const SECTION_SUBJECT_RULES = [
  { re: /biology|^bio$/, words: ["biology", "bio"] },
  { re: /physics|^phy$/, words: ["physics", "phy"] },
  { re: /chemistry|^chem$/, words: ["chemistry", "chem"] },
  { re: /english|^eng$/, words: ["english", "eng"] },
  { re: /logic|reason|analytical/, words: ["logic", "reasoning", "analytical"] },
  { re: /math/, words: ["math", "mathematics"] },
];

const matchSubjectForSection = (sectionName, subjects = []) => {
  const key = String(sectionName || "").toLowerCase();
  const rule = SECTION_SUBJECT_RULES.find((r) => r.re.test(key));
  if (!rule) return null;

  return (
    subjects.find((s) =>
      rule.words.some((w) => s.name?.toLowerCase().includes(w))
    ) || null
  );
};

const getOrCreatePastPaperChapter = async (subjectId) => {
  const existing = await Chapter.findOne({
    subjectId,
    name: PAST_PAPER_CHAPTER_NAME,
  });
  if (existing) return existing;

  return Chapter.create({
    name: PAST_PAPER_CHAPTER_NAME,
    subjectId,
    summary: "Auto-created for past paper MCQ imports",
  });
};

/** Map paper sections (BIOLOGY, PHYSICS, …) → subject + shared Past Papers chapter.
 *  Returns { mapping, unmatched } — never throws. Unmatched sections are skipped. */
export const resolvePastPaperSectionMapping = async (sections = []) => {
  if (!sections.length) {
    return { mapping: {}, unmatched: [] };
  }

  const subjects = await Subject.find().lean();
  const mapping = {};
  const unmatched = [];

  for (const section of sections) {
    const subject = matchSubjectForSection(section.name, subjects);
    if (!subject) {
      unmatched.push(section.name);
      continue;
    }

    const chapter = await getOrCreatePastPaperChapter(subject._id);
    mapping[section.name] = {
      subjectId: subject._id,
      chapterId: chapter._id,
      subjectName: subject.name,
    };
  }

  return { mapping, unmatched };
};

// Split on question boundaries (Q1., Q2., ...) so chunks never tear a question
// in half. Falls back to a hard split when a single question is larger than
// MAX_AI_CHUNK (unusual but possible for long explanations).
const chunkTextForAi = (text) => {
  if (text.length <= MAX_AI_CHUNK) return [text];

  const boundaryRegex = /\n\s*(?=(?:Q\s*\d+\.?\s|\d+\.\s*\[))/g;
  const segments = text.split(boundaryRegex).filter(Boolean);

  // If we couldn't find structural boundaries, fall back to overlapping hard splits.
  if (segments.length <= 1) {
    const chunks = [];
    let start = 0;
    while (start < text.length) {
      chunks.push(text.slice(start, start + MAX_AI_CHUNK));
      start += MAX_AI_CHUNK - 400;
    }
    return chunks;
  }

  const chunks = [];
  let buffer = "";
  for (const segment of segments) {
    if (buffer.length + segment.length + 1 > MAX_AI_CHUNK && buffer) {
      chunks.push(buffer);
      buffer = "";
    }
    if (segment.length > MAX_AI_CHUNK) {
      // Single huge segment – hard split it.
      if (buffer) {
        chunks.push(buffer);
        buffer = "";
      }
      let start = 0;
      while (start < segment.length) {
        chunks.push(segment.slice(start, start + MAX_AI_CHUNK));
        start += MAX_AI_CHUNK - 400;
      }
      continue;
    }
    buffer = buffer ? `${buffer}\n${segment}` : segment;
  }
  if (buffer) chunks.push(buffer);
  return chunks;
};

const parseMcqsWithAi = async (text) => {
  const client = buildOpenAiClient();
  const chunks = chunkTextForAi(text);
  const allQuestions = [];
  const errors = [];

  for (let index = 0; index < chunks.length; index += 1) {
    const chunk = chunks[index];
    const response = await client.chat.completions.create({
      model: env.OPENAI_MODEL,
      temperature: 0.1,
      max_tokens: AI_MAX_TOKENS,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: [
            "You extract multiple-choice questions from exam documents.",
            "Return JSON: { \"questions\": [ ... ] }",
            "Each question object:",
            "{",
            '  "text": "question stem",',
            '  "options": ["A text", "B text", "C text", "D text"],',
            '  "correctAnswer": 0,',
            '  "correctLetter": "A",',
            '  "explanation": "optional",',
            '  "difficulty": "easy|medium|hard"',
            "}",
            "Use zero-based correctAnswer index.",
            "Skip incomplete questions.",
            "Do not invent questions not present in the text.",
          ].join("\n"),
        },
        {
          role: "user",
          content: `Extract every complete MCQ from this document chunk (${index + 1}/${chunks.length}):\n\n${chunk}`,
        },
      ],
    });

    const raw = response.choices?.[0]?.message?.content;
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed?.questions) ? parsed.questions : [];
      for (const item of list) {
        const normalized = normalizeAiMcq(item);
        if (normalized) allQuestions.push(normalized);
        else errors.push({ reason: "AI returned an invalid MCQ block" });
      }
    } catch {
      errors.push({ reason: `Failed to parse AI response for chunk ${index + 1}` });
    }
  }

  return { questions: dedupeMcqs(allQuestions), errors };
};

export const previewMcqImport = async ({ file, subjectId, chapterId, mode = "auto" }) => {
  await validateImportTargets(subjectId, chapterId);
  const { text, fileType } = await extractTextFromUpload(file);

  if (!text.trim()) {
    throw ApiError.badRequest("Could not read any text from this file.");
  }

  let method = "structured";
  let questions = [];
  let errors = [];

  if (mode === "structured" || mode === "auto") {
    const structured = parseStructuredMcqs(text);
    questions = structured.questions;
    errors = structured.errors;
  }

  const needsAi =
    mode === "ai" ||
    (mode === "auto" && questions.length < MIN_STRUCTURED_COUNT);

  if (needsAi) {
    const aiResult = await parseMcqsWithAi(text);
    questions = aiResult.questions;
    errors = [...errors, ...aiResult.errors];
    method = "ai";
  }

  questions = dedupeMcqs(questions);

  return {
    method,
    fileType,
    characterCount: text.length,
    previewCount: questions.length,
    errorCount: errors.length,
    errors: errors.slice(0, 20),
    sample: questions.slice(0, 5),
    questions,
  };
};

const prepareMcqImportPayload = (
  questions,
  { subjectId, chapterId, defaultIsPastPaper = false, defaultPaperYear = null, sectionMapping = null }
) =>
  questions
    .map((question) => {
      const normalized = normalizeAiMcq(question);
      if (normalized) return { ...question, ...normalized };
      if (
        question?.text &&
        Array.isArray(question.options) &&
        question.options.length >= 2 &&
        Number.isInteger(question.correctAnswer)
      ) {
        return question;
      }
      return null;
    })
    .filter(Boolean)
    .map((question) => {
      const section = question.section || "GENERAL";
      const mapped = sectionMapping?.[section];
      const resolvedSubjectId = mapped?.subjectId || question.subjectId || subjectId;
      const resolvedChapterId = mapped?.chapterId || question.chapterId || chapterId;

      return {
        text: question.text,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation || "",
        difficulty: question.difficulty || "medium",
        tags: question.tags || [],
        subjectId: resolvedSubjectId,
        chapterId: resolvedChapterId,
        isPastPaper: defaultIsPastPaper || Boolean(question.isPastPaper),
        paperYear: defaultPaperYear
          ? Number(defaultPaperYear)
          : question.paperYear
            ? Number(question.paperYear)
            : null,
      };
    });

export const confirmMcqImport = async ({
  questions,
  subjectId,
  chapterId,
  returnIds = false,
  defaultIsPastPaper = false,
  defaultPaperYear = null,
}) => {
  await validateImportTargets(subjectId, chapterId);

  if (!Array.isArray(questions) || questions.length === 0) {
    throw ApiError.badRequest("No questions to import.");
  }

  const payload = prepareMcqImportPayload(questions, {
    subjectId,
    chapterId,
    defaultIsPastPaper,
    defaultPaperYear,
  });

  if (payload.length === 0) {
    throw ApiError.badRequest("All parsed questions were invalid.");
  }

  const result = await bulkCreateQuestionsService(payload, { returnIds });

  return {
    ...result,
    parsed: payload.length,
  };
};

export const previewPastPaperImport = async ({ file, mode = "auto" }) => {
  const { text, fileType } = await extractTextFromUpload(file);

  if (!text.trim()) {
    throw ApiError.badRequest("Could not read any text from this file.");
  }

  let method = "structured";
  let questions = [];
  let errors = [];
  let detectedTitle = "";
  let sections = [];
  let missingAnswerCount = 0;

  if (mode === "structured" || mode === "auto") {
    const structured = parseStructuredMcqs(text);
    questions = structured.questions;
    errors = structured.errors;
    detectedTitle = structured.detectedTitle || "";
    sections = structured.sections || [];
    missingAnswerCount = structured.missingAnswerCount || 0;
    if (structured.format === "kmu_mdcat") method = "kmu_mdcat";
    else if (structured.format === "mdcat_section") method = "mdcat_section";
  }

  const needsAi =
    mode === "ai" ||
    (mode === "auto" && questions.length < MIN_STRUCTURED_COUNT);

  if (needsAi) {
    const aiResult = await parseMcqsWithAi(text);
    questions = aiResult.questions;
    errors = [...errors, ...aiResult.errors];
    method = "ai";
  }

  questions = dedupeMcqs(questions);

  const yearFromTitle = detectedTitle.match(/\b(20\d{2})\b/);

  let sectionMapping = {};
  let sectionPreview = sections;

  let unmatchedSections = [];
  if (sections.length > 0) {
    const resolved = await resolvePastPaperSectionMapping(sections);
    sectionMapping = resolved.mapping;
    unmatchedSections = resolved.unmatched;
    sectionPreview = sections.map((section) => ({
      ...section,
      subjectName: sectionMapping[section.name]?.subjectName || null,
      unmatched: resolved.unmatched.includes(section.name),
    }));
  }

  return {
    method,
    fileType,
    characterCount: text.length,
    previewCount: questions.length,
    errorCount: errors.length,
    errors: errors.slice(0, 20),
    sample: questions.slice(0, 5),
    questions,
    detectedTitle,
    sections: sectionPreview,
    sectionMapping,
    unmatchedSections,
    missingAnswerCount,
    suggestedYear: yearFromTitle ? Number(yearFromTitle[1]) : null,
  };
};

export const confirmPastPaperImport = async ({
  questions,
  title,
  paperYear,
  duration,
  createdBy,
  defaultSubjectId,
}) => {
  if (!title?.trim()) {
    throw ApiError.badRequest("Past paper title is required.");
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    throw ApiError.badRequest("No questions to import.");
  }

  const sectionNames = [
    ...new Set(questions.map((q) => q.section).filter(Boolean)),
  ];
  const sections = sectionNames.map((name) => ({
    name,
    count: questions.filter((q) => q.section === name).length,
  }));

  let sectionMapping = {};

  if (sections.length > 0) {
    const resolved = await resolvePastPaperSectionMapping(sections);
    sectionMapping = resolved.mapping;
    // Unmatched sections are silently skipped — their questions will be filtered out below.
  } else if (defaultSubjectId) {
    // No sections detected (AI-parsed or non-KMU format) — use the selected subject.
    const subject = await Subject.findById(defaultSubjectId).lean();
    if (!subject) throw ApiError.notFound("Selected subject not found.");
    const chapter = await getOrCreatePastPaperChapter(subject._id);
    sectionMapping["GENERAL"] = {
      subjectId: subject._id,
      chapterId: chapter._id,
      subjectName: subject.name,
    };
    questions = questions.map((q) => ({ ...q, section: q.section || "GENERAL" }));
  } else {
    throw ApiError.badRequest(
      "No subject sections detected. Select a subject for this paper."
    );
  }

  const payload = prepareMcqImportPayload(questions, {
    sectionMapping,
    defaultIsPastPaper: true,
    defaultPaperYear: paperYear,
  }).filter(
    (question) =>
      question?.text &&
      Array.isArray(question.options) &&
      question.options.length >= 2 &&
      Number.isInteger(question.correctAnswer) &&
      question.subjectId &&
      question.chapterId
  );

  if (payload.length === 0) {
    throw ApiError.badRequest("All parsed questions were invalid or had unmatched sections.");
  }

  const result = await bulkCreateQuestionsService(payload, { returnIds: true });

  if (!result.ids?.length) {
    throw ApiError.badRequest("Could not create or match any questions.");
  }

  const primarySubjectId =
    sectionMapping[questions[0]?.section]?.subjectId || payload[0]?.subjectId;

  const test = await Test.create({
    title: title.trim(),
    type: "pastPaper",
    subjectId: primarySubjectId,
    chapterId: null,
    duration: duration
      ? Number(duration)
      : Math.max(210, Math.round(result.ids.length * 1.2)),
    paperYear: paperYear ? Number(paperYear) : null,
    questionCount: result.ids.length,
    questions: result.ids,
    createdBy,
  });

  return {
    test,
    created: result.created,
    skipped: result.skipped,
    errors: result.errors,
    parsed: payload.length,
    totalQuestions: result.ids.length,
    missingAnswerCount: questions.filter((q) => q.needsAnswerKey).length,
    sectionMapping,
  };
};
