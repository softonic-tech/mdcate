/**
 * Import MCQs from a .docx file (paragraphs like: "N. [EASY] ...", A)-D), Correct Answer, Explanation).
 *
 * Usage:
 *   node scripts/import-questions-docx.js "<path-to.docx>" --subject-id <mongoId> --chapter-id <mongoId>
 *   node scripts/import-questions-docx.js "<path-to.docx>" --subject "Biology" --board KPK --chapter "Respiration"
 *
 * Options:
 *   --dry-run     Parse and print counts only (no DB writes)
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/medprep-pro";

const SECTION_LINE = /^SECTION\s+\d+/i;
const QUESTION_LINE = /^(\d+)\.\s*\[(EASY|MODERATE|MEDIUM|HARD|HARDER)\]\s*(.+)$/i;
const OPTION_LINE = /^([A-Z])\)\s*(.+)$/;
const CORRECT_LINE = /^Correct Answer:\s*([A-Z])\)?/i;
const EXPLANATION_LINE = /^Explanation:\s*(.*)$/i;

function mapDifficulty(raw) {
  const u = raw.toUpperCase();
  if (u === "EASY") return "easy";
  if (u === "MODERATE" || u === "MEDIUM") return "medium";
  if (u === "HARD" || u === "HARDER") return "hard";
  return "medium";
}

function parseDocxLines(lines) {
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
    });
  }

  return { questions, errors };
}

/** Compares on-screen question numbers in the file vs how many blocks actually exist. */
function reportDocxNumbering(lines) {
  const nums = [];
  for (const line of lines) {
    if (SECTION_LINE.test(line)) continue;
    const m = line.match(QUESTION_LINE);
    if (m) nums.push(Number(m[1]));
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
    `Found ${nums.length} question lines with labels from ${min} to ${max}. ` +
      `Labels ${min}–${max} are not consecutive: ${missing.length} numbers never appear in the document.`
  );
  if (dups.length) {
    console.log(`Duplicate labels in the file (same Q# twice): ${dups.map(([n, c]) => `${n}×${c}`).join(", ")}`);
    console.log("  (Importer keeps both blocks; Mongo may skip one if text+chapter match exactly.)");
  }
  if (missing.length <= 25) {
    console.log(`Missing labels: ${missing.join(", ")}`);
  } else {
    console.log(`First missing labels: ${missing.slice(0, 20).join(", ")} … (+${missing.length - 20} more)`);
  }
  console.log(
    "Section headings such as “(61–240)” are only titles—questions must be typed under them. " +
      "This file does not contain ~250 full MCQ blocks.\n"
  );
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
  const { value: raw } = await mammoth.extractRawText({ path: filePath });
  const lines = raw
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  reportDocxNumbering(lines);

  const { questions: parsed, errors } = parseDocxLines(lines);
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
      tags: [],
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
