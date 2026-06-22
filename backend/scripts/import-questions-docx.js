/**
 * Import MCQs from a .docx file.
 *
 * Supported templates (see backend/utils/mcqParse.util.js for full grammar):
 *   - Legacy: "N. [EASY] ...", "A) ...", "Correct Answer: A", "Explanation: ..."
 *   - Q-template (used by recent exports):
 *       "Q1. (Year: Past 2017 | Chapter: X | Difficulty: Moderate)"
 *       "Question stem..."
 *       "A. ..." "B. ..." "C. ..." "D. ..."
 *       "Answer: <letter or full answer text>"
 *       "Explanation: ..."
 *
 * Usage:
 *   node scripts/import-questions-docx.js "<path-to.docx>" --subject-id <mongoId> --chapter-id <mongoId>
 *   node scripts/import-questions-docx.js "<path-to.docx>" --subject "Biology" --board KPK --chapter "Respiration"
 *
 * Options:
 *   --dry-run          Parse and print counts only (no DB writes)
 *   --create-chapter   With --subject/--chapter, create chapter if missing
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";
import mammoth from "mammoth";

import Subject from "../models/subject.model.js";
import Chapter from "../models/chapter.model.js";
import { bulkCreateQuestionsService } from "../services/question.service.js";
import { parseStructuredMcqs } from "../utils/mcqParse.util.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/medprep-study";

const LEGACY_QUESTION_LINE =
  /^(\d+)\.\s*\[(EASY|MODERATE|MEDIUM|HARD|HARDER)\]\s*(.+)$/i;
const Q_HEADER_LINE = /^Q\s*(\d+)\.?\s*(.*)$/i;
const SECTION_LINE = /^SECTION\s+\d+/i;

const decodeHtmlEntities = (str) =>
  String(str || "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");

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

/** Compares on-screen question numbers in the file vs how many blocks actually exist. */
function reportDocxNumbering(lines) {
  const nums = [];
  for (const line of lines) {
    if (SECTION_LINE.test(line)) continue;
    const legacy = line.match(LEGACY_QUESTION_LINE);
    const newFormat = line.match(Q_HEADER_LINE);
    if (legacy) nums.push(Number(legacy[1]));
    else if (newFormat) nums.push(Number(newFormat[1]));
  }
  if (nums.length === 0) return;

  const max = Math.max(...nums);
  const min = Math.min(...nums);
  const set = new Set(nums);
  const missing = [];
  for (let n = min; n <= max; n += 1) {
    if (!set.has(n)) missing.push(n);
  }

  const dupMap = new Map();
  for (const n of nums) dupMap.set(n, (dupMap.get(n) || 0) + 1);
  const dups = [...dupMap.entries()].filter(([, c]) => c > 1);

  console.log("\n── Numbering in the Word file (not the database) ──");
  console.log(
    `Found ${nums.length} question headers labelled ${min} to ${max}. ` +
      `${missing.length} numbers in that range never appear in the document.`
  );
  if (dups.length) {
    console.log(`Duplicate labels in the file (same Q# twice): ${dups.map(([n, c]) => `${n}×${c}`).join(", ")}`);
    console.log("  (Importer keeps both blocks; Mongo may skip one if text+chapter match exactly.)");
  }
  if (missing.length && missing.length <= 25) {
    console.log(`Missing labels: ${missing.join(", ")}`);
  } else if (missing.length) {
    console.log(`First missing labels: ${missing.slice(0, 20).join(", ")} … (+${missing.length - 20} more)`);
  }
  console.log();
}

function parseArgs(argv) {
  const out = {
    file: null,
    subjectId: null,
    chapterId: null,
    subjectName: null,
    board: null,
    chapterName: null,
    dryRun: false,
    createChapter: false,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--dry-run") out.dryRun = true;
    else if (a === "--create-chapter") out.createChapter = true;
    else if (a === "--subject-id" && argv[i + 1]) {
      out.subjectId = argv[++i];
    } else if (a === "--chapter-id" && argv[i + 1]) {
      out.chapterId = argv[++i];
    } else if (a === "--subject" && argv[i + 1]) {
      out.subjectName = argv[++i];
    } else if (a === "--board" && argv[i + 1]) {
      out.board = argv[++i];
    } else if (a === "--chapter" && argv[i + 1]) {
      out.chapterName = argv[++i];
    } else if (!a.startsWith("--") && !out.file) {
      out.file = a;
    }
  }
  return out;
}

async function resolveSubjectChapter(args) {
  if (args.subjectId && args.chapterId) {
    const sub = await Subject.findById(args.subjectId);
    const ch = await Chapter.findById(args.chapterId);
    if (!sub) throw new Error(`Subject not found: ${args.subjectId}`);
    if (!ch) throw new Error(`Chapter not found: ${args.chapterId}`);
    if (String(ch.subjectId) !== String(sub._id)) {
      throw new Error("Chapter does not belong to the given subject");
    }
    return { subjectId: sub._id, chapterId: ch._id };
  }

  if (!args.subjectName || !args.board || !args.chapterName) {
    throw new Error(
      "Provide --subject-id AND --chapter-id, OR --subject, --board, and --chapter (see script header)."
    );
  }

  const subject = await Subject.findOne({
    name: new RegExp(`^${args.subjectName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
    board: args.board,
  });
  if (!subject) {
    throw new Error(`Subject not found: ${args.subjectName} (${args.board})`);
  }

  let chapter = await Chapter.findOne({
    subjectId: subject._id,
    name: new RegExp(`^${args.chapterName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
  });

  if (!chapter && args.createChapter) {
    chapter = await Chapter.create({
      name: args.chapterName,
      subjectId: subject._id,
      summary: "Imported from docx",
      highYieldPoints: [],
    });
    console.log(`✓ Created chapter "${chapter.name}" (${chapter._id})`);
  }

  if (!chapter) {
    throw new Error(
      `Chapter "${args.chapterName}" not found for this subject. Run with --create-chapter to create it.`
    );
  }

  return { subjectId: subject._id, chapterId: chapter._id };
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.file) {
    console.error(`Usage: node scripts/import-questions-docx.js "<file.docx>" --subject-id ... --chapter-id ...
   or: node scripts/import-questions-docx.js "<file.docx>" --subject Biology --board KPK --chapter Respiration [--create-chapter] [--dry-run]`);
    process.exit(1);
  }

  const filePath = resolve(process.cwd(), args.file);
  const { value: html } = await mammoth.convertToHtml({ path: filePath });
  const text = htmlToPlainText(html);
  const lines = text.split(/\r?\n/).map((l) => l.trim());

  reportDocxNumbering(lines);

  const { questions: parsed, errors } = parseStructuredMcqs(text);
  console.log(`Parsed ${parsed.length} valid MCQ blocks (${errors.length} malformed blocks skipped)`);
  if (errors.length && errors.length <= 20) {
    errors.forEach((e) => console.warn(`  skip: ${e.reason} — “${e.line}…”`));
  } else if (errors.length) {
    console.warn(`  (${errors.length} skip reasons; omitting details)`);
  }

  if (args.dryRun) {
    const byDiff = parsed.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {});
    console.log("By difficulty:", byDiff);
    process.exit(0);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("✓ Connected to MongoDB");

  try {
    const { subjectId, chapterId } = await resolveSubjectChapter(args);
    const payload = parsed.map((q) => ({
      ...q,
      subjectId,
      chapterId,
      tags: q.tags || [],
    }));

    const result = await bulkCreateQuestionsService(payload);
    console.log(`✓ bulk import: created ${result.created}, skipped ${result.skipped}`);
    if (result.errors?.length) {
      console.warn(`  ${result.errors.length} errors (first 5):`);
      result.errors.slice(0, 5).forEach((e) => console.warn(`    ${e.text}: ${e.error}`));
    }
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
