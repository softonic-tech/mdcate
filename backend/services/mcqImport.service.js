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

const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_AI_CHUNK = 10000;
const MIN_STRUCTURED_COUNT = 3;

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

export const extractTextFromUpload = async (file) => {
  if (!file?.buffer?.length) {
    throw ApiError.badRequest("No file uploaded.");
  }

  if (file.size > MAX_FILE_BYTES) {
    throw ApiError.badRequest("File too large. Maximum size is 15 MB.");
  }

  const mime = file.mimetype || "";

  if (DOCX_TYPES.has(mime) || file.originalname?.toLowerCase().endsWith(".docx")) {
    const { value } = await mammoth.extractRawText({ buffer: file.buffer });
    return { text: value || "", fileType: "docx" };
  }

  if (PDF_TYPES.has(mime) || file.originalname?.toLowerCase().endsWith(".pdf")) {
    const parser = new PDFParse({ data: file.buffer });
    const result = await parser.getText();
    await parser.destroy();
    return { text: result?.text || "", fileType: "pdf" };
  }

  throw ApiError.badRequest("Unsupported file type. Upload a .docx or .pdf file.");
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

const chunkTextForAi = (text) => {
  if (text.length <= MAX_AI_CHUNK) return [text];

  const chunks = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + MAX_AI_CHUNK));
    start += MAX_AI_CHUNK - 400;
  }
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

export const confirmMcqImport = async ({ questions, subjectId, chapterId }) => {
  await validateImportTargets(subjectId, chapterId);

  if (!Array.isArray(questions) || questions.length === 0) {
    throw ApiError.badRequest("No questions to import.");
  }

  const payload = questions
    .map((question) => normalizeAiMcq(question) || question)
    .filter(
      (question) =>
        question?.text &&
        Array.isArray(question.options) &&
        question.options.length >= 2 &&
        Number.isInteger(question.correctAnswer)
    )
    .map((question) => ({
      text: question.text,
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || "",
      difficulty: question.difficulty || "medium",
      tags: question.tags || [],
      subjectId,
      chapterId,
      isPastPaper: Boolean(question.isPastPaper),
      paperYear: question.paperYear ? Number(question.paperYear) : null,
    }));

  if (payload.length === 0) {
    throw ApiError.badRequest("All parsed questions were invalid.");
  }

  const result = await bulkCreateQuestionsService(payload);

  return {
    ...result,
    parsed: payload.length,
  };
};
