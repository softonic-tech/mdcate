/**
 * Seed past-paper PDFs into the database.
 *
 * Reads the 3 MDCAT PDFs from the project root, parses them with the same
 * pipeline the admin panel uses, then inserts Questions + Test records.
 *
 * Usage:
 *   node scripts/seedPastPapers.js
 *   node scripts/seedPastPapers.js --clear   (delete existing past-paper tests first)
 */

import mongoose from "mongoose";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env") });

import Subject from "../models/subject.model.js";
import Chapter from "../models/chapter.model.js";
import Question from "../models/question.model.js";
import Test from "../models/test.model.js";
import { PDFParse } from "pdf-parse";
import { parseStructuredMcqs, dedupeMcqs } from "../utils/mcqParse.util.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/mdcate";
const ROOT_DIR = resolve(__dirname, "../../");
const PAST_PAPER_CHAPTER = "Past Papers";

const PDF_FILES = [
  {
    path: resolve(ROOT_DIR, "KMU_MDCAT_2024_Code_A_Subjectwise_With_Answers.pdf"),
    title: "KMU MDCAT 2024 Code A",
    paperYear: 2024,
    duration: 210,
  },
  {
    path: resolve(ROOT_DIR, "KMU_MDCAT_2023_Reconduct_Code_B_Solved.pdf"),
    title: "KMU MDCAT 2023 Reconduct Code B",
    paperYear: 2023,
    duration: 210,
  },
  {
    path: resolve(ROOT_DIR, "ETEA_MDCAT_2023_Solved_200_MCQs.pdf"),
    title: "ETEA MDCAT 2023 (200 MCQs)",
    paperYear: 2023,
    duration: 210,
  },
];

// Subjects needed for MDCAT papers. Board must be one of KPK/Punjab/Federal.
const REQUIRED_SUBJECTS = [
  { name: "Biology", board: "Federal" },
  { name: "Chemistry", board: "Federal" },
  { name: "Physics", board: "Federal" },
  { name: "English", board: "Federal" },
  { name: "Logical Reasoning", board: "Federal" },
];

const SECTION_RULES = [
  { re: /biology|^bio$/i, name: "Biology" },
  { re: /physics|^phy$/i, name: "Physics" },
  { re: /chemistry|^chem$/i, name: "Chemistry" },
  { re: /english|^eng$/i, name: "English" },
  { re: /logic|reason|analytical/i, name: "Logical Reasoning" },
  { re: /math/i, name: "Mathematics" },
];

async function ensureSubjects() {
  const map = {};
  for (const { name, board } of REQUIRED_SUBJECTS) {
    const slug = `${name}-${board}`.toLowerCase().replace(/\s+/g, "-");
    const subject = await Subject.findOneAndUpdate(
      { slug },
      { $setOnInsert: { name, board, slug } },
      { upsert: true, new: true }
    );
    map[name.toLowerCase()] = subject;
    console.log(`  Subject: ${subject.name} (${subject.board}) — ${subject._id}`);
  }
  return map;
}

async function getOrCreateChapter(subjectId) {
  const existing = await Chapter.findOne({ subjectId, name: PAST_PAPER_CHAPTER });
  if (existing) return existing;
  return Chapter.create({
    name: PAST_PAPER_CHAPTER,
    subjectId,
    summary: "Auto-created for past paper MCQ imports",
  });
}

function matchSection(sectionName, subjectMap) {
  const key = String(sectionName || "").toLowerCase();
  const rule = SECTION_RULES.find((r) => r.re.test(key));
  if (!rule) return null;
  return subjectMap[rule.name.toLowerCase()] || null;
}

async function extractPdfText(filePath) {
  const buffer = readFileSync(filePath);
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();
  return result?.text || "";
}

async function seedPaper(paperDef, subjectMap) {
  console.log(`\n→ ${paperDef.title}`);

  const text = await extractPdfText(paperDef.path);
  if (!text.trim()) {
    console.log("  ✗ Could not extract text from PDF — skipping");
    return;
  }
  console.log(`  Extracted ${text.length} chars`);

  const parsed = parseStructuredMcqs(text);
  const questions = dedupeMcqs(parsed.questions || []);
  console.log(
    `  Parsed ${questions.length} questions (${parsed.errors?.length || 0} errors, format: ${parsed.format || "structured"})`
  );

  if (!questions.length) {
    console.log("  ✗ No questions parsed — skipping");
    return;
  }

  // Build section → { subjectId, chapterId } mapping
  const sectionNames = [...new Set(questions.map((q) => q.section).filter(Boolean))];
  const sectionMapping = {};

  for (const sectionName of sectionNames) {
    const subject = matchSection(sectionName, subjectMap);
    if (!subject) {
      console.log(`  ⚠ Section "${sectionName}" has no matching subject — those MCQs will be skipped`);
      continue;
    }
    const chapter = await getOrCreateChapter(subject._id);
    sectionMapping[sectionName] = { subjectId: subject._id, chapterId: chapter._id };
  }

  // If no sections detected (ETEA or AI-parsed), use Biology as default
  let defaultSubjectId = null;
  let defaultChapterId = null;
  if (!sectionNames.length) {
    const defaultSubject = subjectMap["biology"];
    if (defaultSubject) {
      const chapter = await getOrCreateChapter(defaultSubject._id);
      defaultSubjectId = defaultSubject._id;
      defaultChapterId = chapter._id;
      console.log(`  No sections detected — assigning all MCQs to Biology`);
    }
  }

  // Prepare payload
  const payload = questions
    .map((q) => {
      const section = q.section || "GENERAL";
      const mapped = sectionMapping[section];
      const subjectId = mapped?.subjectId || defaultSubjectId;
      const chapterId = mapped?.chapterId || defaultChapterId;
      if (!subjectId || !chapterId) return null;

      return {
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || "",
        difficulty: q.difficulty || "medium",
        tags: q.tags || [],
        subjectId,
        chapterId,
        isPastPaper: true,
        paperYear: paperDef.paperYear,
      };
    })
    .filter(Boolean);

  if (!payload.length) {
    console.log("  ✗ No valid questions after mapping — skipping");
    return;
  }

  // Bulk insert questions (skip duplicates)
  let created = 0;
  let skipped = 0;
  const ids = [];

  for (const q of payload) {
    try {
      const exists = await Question.findOne({
        text: q.text,
        subjectId: q.subjectId,
        chapterId: q.chapterId,
      });
      if (exists) {
        ids.push(exists._id);
        skipped++;
        continue;
      }
      const doc = await Question.create(q);
      ids.push(doc._id);
      created++;
    } catch (err) {
      // duplicate key errors are expected and fine
    }
  }

  console.log(`  Questions: ${created} created, ${skipped} already existed`);

  if (!ids.length) {
    console.log("  ✗ No question IDs — skipping test creation");
    return;
  }

  // Determine primary subject for the Test record
  const primarySectionName = sectionNames[0];
  const primarySubjectId =
    sectionMapping[primarySectionName]?.subjectId || defaultSubjectId;

  // Check if a test with this title already exists
  const existingTest = await Test.findOne({ title: paperDef.title, type: "pastPaper" });
  if (existingTest) {
    console.log(`  Test already exists (${existingTest._id}) — updating question list`);
    await Test.findByIdAndUpdate(existingTest._id, {
      questions: ids,
      questionCount: ids.length,
    });
    return;
  }

  const test = await Test.create({
    title: paperDef.title,
    type: "pastPaper",
    subjectId: primarySubjectId,
    chapterId: null,
    duration: paperDef.duration,
    paperYear: paperDef.paperYear,
    questionCount: ids.length,
    questions: ids,
  });

  console.log(`  ✓ Test created: ${test._id} with ${ids.length} MCQs`);
}

async function clearExistingPastPapers() {
  const titles = PDF_FILES.map((p) => p.title);
  const deleted = await Test.deleteMany({ title: { $in: titles }, type: "pastPaper" });
  console.log(`  Cleared ${deleted.deletedCount} existing past-paper test(s)`);
}

async function run() {
  const clearFirst = process.argv.includes("--clear");

  await mongoose.connect(MONGODB_URI);
  console.log("✓ Connected to MongoDB\n");

  if (clearFirst) {
    console.log("Clearing existing past papers...");
    await clearExistingPastPapers();
    console.log();
  }

  console.log("Ensuring required subjects exist...");
  const subjectMap = await ensureSubjects();

  for (const paperDef of PDF_FILES) {
    await seedPaper(paperDef, subjectMap);
  }

  console.log("\n✓ Past paper seed complete");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
