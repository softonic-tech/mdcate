/**
 * Seed script - Populates database with dummy data for testing all routes
 * Run: node scripts/seed.js
 * Options: --clear (clears all collections before seeding)
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

// Import models
import User from "../models/user.model.js";
import Badge from "../models/badge.model.js";
import Subject from "../models/subject.model.js";
import Chapter from "../models/chapter.model.js";
import Book from "../models/book.model.js";
import Question from "../models/question.model.js";
import Video from "../models/video.model.js";
import Flashcard from "../models/flashcard.model.js";
import Notes from "../models/notes.model.js";
import Mnemonic from "../models/mnemonic.model.js";
import HighYieldFact from "../models/highYieldFact.model.js";
import Test from "../models/test.model.js";
import TestAttempt from "../models/testAttempt.model.js";
import Challenge from "../models/challenge.model.js";
import ChallengeAttempt from "../models/challengeAttempt.model.js";
import Notification from "../models/notification.model.js";
import Device from "../models/device.model.js";
import ContactMessage from "../models/contactMessage.model.js";
import Performance from "../models/performance.model.js";
import StudyPlan from "../models/studyPlan.model.js";
import ExamCountdown from "../models/examCountdown.model.js";
import DiscussionThread from "../models/discussionThread.model.js";
import DiscussionMessage from "../models/discussionMessage.model.js";
import OfflineContent from "../models/offlineContent.model.js";
import SyncLog from "../models/syncLog.model.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/medprep-study";

const clearFirst = process.argv.includes("--clear");

const ids = {};

async function connectDB() {
  await mongoose.connect(MONGODB_URI);
  console.log("✓ Connected to MongoDB");
}

async function clearCollections() {
  const collections = [
    SyncLog, OfflineContent,
    DiscussionMessage, DiscussionThread, ExamCountdown, StudyPlan,
    Performance, ContactMessage, Device, Notification, ChallengeAttempt,
    Challenge, TestAttempt, Test, HighYieldFact, Mnemonic, Notes,
    Flashcard, Video, Question, Book, Chapter, Subject, Badge, User,
  ];
  for (const Model of collections) {
    await Model.deleteMany({});
    console.log(`  Cleared ${Model.modelName}`);
  }
  console.log("✓ All collections cleared\n");
}

async function seed() {
  console.log("Starting seed...\n");

  // 1. Badges (no deps)
  const badges = await Badge.insertMany([
    { name: "First Login", description: "Logged in for the first time", criteria: { type: "login_streak", value: 1 }, imageUrl: "" },
    { name: "Week Warrior", description: "7 day streak", criteria: { type: "login_streak", value: 7 }, imageUrl: "" },
    { name: "Quiz Master", description: "Complete 10 quizzes", criteria: { type: "quiz_completion", value: 10 }, imageUrl: "" },
    { name: "High Scorer", description: "Score 90% on a test", criteria: { type: "high_score", value: 90 }, imageUrl: "" },
    { name: "Points Champion", description: "Reach 1000 points", criteria: { type: "points_threshold", value: 1000 }, imageUrl: "" },
  ]);
  ids.badges = badges.map((b) => b._id);
  console.log(`✓ Badges: ${badges.length}`);

  // 2. Users (no deps) - save one by one so pre-save bcrypt hook runs
  const userData = [
    {
      username: "admin",
      email: "admin@test.com",
      password: "password123",
      role: "admin",
      isVerified: true,
      points: 500,
      streak: 5,
      badges: [ids.badges[0], ids.badges[1]],
      academic: { studentName: "Admin User", batch: "2024", college: "Test College", targetExam: "MDCAT" },
    },
    {
      username: "student1",
      email: "student1@test.com",
      password: "password123",
      role: "user",
      isVerified: true,
      points: 250,
      streak: 3,
      badges: [ids.badges[0]],
      academic: { studentName: "Student One", batch: "2025", college: "Medical College", targetExam: "MDCAT" },
    },
    {
      username: "student2",
      email: "student2@test.com",
      password: "password123",
      role: "user",
      points: 100,
      academic: { studentName: "Student Two", batch: "2025", targetExam: "MDCAT" },
    },
  ];
  const users = [];
  for (const data of userData) {
    const user = new User(data);
    await user.save();
    users.push(user);
  }
  ids.users = users.map((u) => u._id);
  console.log(`✓ Users: ${users.length}`);

  // 3. Subjects (no deps - slug is set by pre-save, but insertMany skips it, so set manually)
  const subjects = await Subject.insertMany([
    { name: "Biology", board: "KPK", slug: "biology-kpk" },
    { name: "Chemistry", board: "Punjab", slug: "chemistry-punjab" },
    { name: "Physics", board: "Federal", slug: "physics-federal" },
  ]);
  ids.subjects = subjects.map((s) => s._id);
  console.log(`✓ Subjects: ${subjects.length}`);

  // 4. Chapters (depends on Subject)
  const chapters = await Chapter.insertMany([
    { name: "Cell Biology", subjectId: ids.subjects[0], summary: "Basics of cells", highYieldPoints: ["Cell structure", "Mitosis"] },
    { name: "Organic Chemistry", subjectId: ids.subjects[1], summary: "Organic compounds", highYieldPoints: ["Functional groups"] },
    { name: "Mechanics", subjectId: ids.subjects[2], summary: "Motion and forces", highYieldPoints: ["Newton's laws"] },
  ]);
  ids.chapters = chapters.map((c) => c._id);
  console.log(`✓ Chapters: ${chapters.length}`);

  // 5. Books (depends on Subject)
  const books = await Book.insertMany([
    { title: "Biology Textbook", subjectId: ids.subjects[0], board: "KPK", fileUrl: "https://example.com/bio.pdf", coverImage: "" },
    { title: "Chemistry Guide", subjectId: ids.subjects[1], board: "Punjab", fileUrl: "https://example.com/chem.pdf", coverImage: "" },
  ]);
  ids.books = books.map((b) => b._id);
  console.log(`✓ Books: ${books.length}`);

  // 6. Questions (depends on Subject, Chapter)
  const questions = await Question.insertMany([
    { text: "What is the powerhouse of the cell?", options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi"], correctAnswer: 1, subjectId: ids.subjects[0], chapterId: ids.chapters[0], difficulty: "easy", explanation: "Mitochondria produces ATP" },
    { text: "Which organelle contains DNA?", options: ["Mitochondria", "Nucleus", "Both", "Neither"], correctAnswer: 2, subjectId: ids.subjects[0], chapterId: ids.chapters[0], difficulty: "medium" },
    { text: "What is the chemical formula of water?", options: ["H2O", "CO2", "O2", "H2O2"], correctAnswer: 0, subjectId: ids.subjects[1], chapterId: ids.chapters[1], difficulty: "easy" },
    { text: "Force equals mass times?", options: ["Velocity", "Acceleration", "Distance", "Time"], correctAnswer: 1, subjectId: ids.subjects[2], chapterId: ids.chapters[2], difficulty: "easy" },
    { text: "What is Newton's first law?", options: ["F=ma", "Inertia", "Action-reaction", "Gravity"], correctAnswer: 1, subjectId: ids.subjects[2], chapterId: ids.chapters[2], difficulty: "medium", isPastPaper: true, paperYear: 2023 },
  ]);
  ids.questions = questions.map((q) => q._id);
  console.log(`✓ Questions: ${questions.length}`);

  // 7. Videos (depends on User)
  const videos = await Video.insertMany([
    { url: "https://youtube.com/watch?v=dummy1", title: "Cell Biology Intro", userId: ids.users[0], status: "completed", summary: "Intro to cells", keyPoints: ["Cell membrane", "Organelles"] },
    { url: "https://youtube.com/watch?v=dummy2", title: "Organic Chemistry Basics", userId: ids.users[1], status: "processing" },
  ]);
  ids.videos = videos.map((v) => v._id);
  console.log(`✓ Videos: ${videos.length}`);

  // 8. Flashcards (depends on User, Subject, optional Chapter)
  const flashcards = await Flashcard.insertMany([
    { front: "Mitochondria", back: "Powerhouse of the cell", subjectId: ids.subjects[0], chapterId: ids.chapters[0], userId: ids.users[0], source: "manual" },
    { front: "Nucleus", back: "Contains DNA", subjectId: ids.subjects[0], chapterId: ids.chapters[0], userId: ids.users[0], source: "manual" },
    { front: "H2O", back: "Water", subjectId: ids.subjects[1], userId: ids.users[1], source: "manual" },
  ]);
  ids.flashcards = flashcards.map((f) => f._id);
  console.log(`✓ Flashcards: ${flashcards.length}`);

  // 9. Notes (depends on User, Subject, optional Chapter)
  const notes = await Notes.insertMany([
    { title: "Cell Notes", content: "Cells are the basic unit of life.", subjectId: ids.subjects[0], chapterId: ids.chapters[0], userId: ids.users[0], type: "summary", sourceType: "text" },
    { title: "F=ma", content: "Force = mass × acceleration", subjectId: ids.subjects[2], chapterId: ids.chapters[2], userId: ids.users[1], type: "formula", sourceType: "text" },
  ]);
  ids.notes = notes.map((n) => n._id);
  console.log(`✓ Notes: ${notes.length}`);

  // 10. Mnemonics (depends on Subject, optional Chapter, optional User)
  const mnemonics = await Mnemonic.insertMany([
    { title: "Kingdom Order", content: "King Philip Came Over For Good Spaghetti", subjectId: ids.subjects[0], chapterId: ids.chapters[0], createdBy: ids.users[0] },
    { title: "pH scale", content: "Acidic < 7, Neutral = 7, Basic > 7", subjectId: ids.subjects[1], createdBy: ids.users[0] },
  ]);
  ids.mnemonics = mnemonics.map((m) => m._id);
  console.log(`✓ Mnemonics: ${mnemonics.length}`);

  // 11. HighYieldFacts (depends on Subject, optional Chapter)
  const highYieldFacts = await HighYieldFact.insertMany([
    { content: "Mitochondria have their own DNA", subjectId: ids.subjects[0], chapterId: ids.chapters[0], category: "important" },
    { content: "Water has high specific heat capacity", subjectId: ids.subjects[1], category: "formula" },
  ]);
  ids.highYieldFacts = highYieldFacts.map((h) => h._id);
  console.log(`✓ HighYieldFacts: ${highYieldFacts.length}`);

  // 12. Tests (depends on Subject, optional Chapter, Questions, optional User)
  const tests = await Test.insertMany([
    { title: "Biology Quiz 1", type: "quiz", subjectId: ids.subjects[0], chapterId: ids.chapters[0], duration: 30, questions: [ids.questions[0], ids.questions[1]], questionCount: 10, createdBy: ids.users[0] },
    { title: "Chemistry Mock", type: "mock", subjectId: ids.subjects[1], duration: 60, questions: [ids.questions[2]], questionCount: 30, createdBy: ids.users[0] },
    { title: "Physics Past Paper 2023", type: "pastPaper", subjectId: ids.subjects[2], duration: 90, questions: [ids.questions[3], ids.questions[4]], questionCount: 50, paperYear: 2023 },
  ]);
  ids.tests = tests.map((t) => t._id);
  console.log(`✓ Tests: ${tests.length}`);

  // 13. TestAttempts (depends on User, Test)
  const testAttempts = await TestAttempt.insertMany([
    { userId: ids.users[0], testId: ids.tests[0], answers: [{ questionId: ids.questions[0], selectedOption: 1, isCorrect: true, timeSpent: 10 }, { questionId: ids.questions[1], selectedOption: 2, isCorrect: true, timeSpent: 15 }], score: 2, totalQuestions: 2, percentile: 85, timeSpent: 25 },
    { userId: ids.users[1], testId: ids.tests[0], answers: [{ questionId: ids.questions[0], selectedOption: 0, isCorrect: false, timeSpent: 5 }], score: 0, totalQuestions: 2, percentile: 20, timeSpent: 30 },
  ]);
  ids.testAttempts = testAttempts.map((ta) => ta._id);
  console.log(`✓ TestAttempts: ${testAttempts.length}`);

  // 14. Challenges (depends on optional Test)
  const now = new Date();
  const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const challenges = await Challenge.insertMany([
    { title: "Daily Quiz", type: "daily", startDate: now, endDate: new Date(now.getTime() + 24 * 60 * 60 * 1000), contentType: "quiz", testId: ids.tests[0], points: 50, isActive: true },
    { title: "Weekly Challenge", type: "weekly", startDate: now, endDate: weekLater, contentType: "miniTest", testId: ids.tests[1], points: 200, isActive: true },
  ]);
  ids.challenges = challenges.map((c) => c._id);
  console.log(`✓ Challenges: ${challenges.length}`);

  // 15. ChallengeAttempts (depends on User, Challenge)
  const challengeAttempts = await ChallengeAttempt.insertMany([
    { userId: ids.users[0], challengeId: ids.challenges[0], score: 100 },
    { userId: ids.users[1], challengeId: ids.challenges[0], score: 75 },
  ]);
  ids.challengeAttempts = challengeAttempts.map((ca) => ca._id);
  console.log(`✓ ChallengeAttempts: ${challengeAttempts.length}`);

  // 16. Notifications (depends on User)
  const notifications = await Notification.insertMany([
    { userId: ids.users[0], type: "reminder", title: "Study Reminder", message: "Time to study Biology!", isRead: false },
    { userId: ids.users[0], type: "achievement", title: "Badge Earned", message: "You earned Week Warrior!", isRead: true },
    { userId: ids.users[1], type: "exam", title: "MDCAT Countdown", message: "30 days until exam", isRead: false },
  ]);
  ids.notifications = notifications.map((n) => n._id);
  console.log(`✓ Notifications: ${notifications.length}`);

  // 17. Devices (depends on User)
  const devices = await Device.insertMany([
    { userId: ids.users[0], deviceId: "device-001", deviceType: "desktop", pushToken: null },
    { userId: ids.users[1], deviceId: "device-002", deviceType: "mobile", pushToken: "fcm-token-dummy" },
  ]);
  ids.devices = devices.map((d) => d._id);
  console.log(`✓ Devices: ${devices.length}`);

  // 18. ContactMessages (depends on User)
  const contactMessages = await ContactMessage.insertMany([
    { userId: ids.users[0], email: "admin@test.com", subject: "Question about subscription", message: "How do I upgrade?", status: "pending" },
    { userId: ids.users[1], email: "student1@test.com", subject: "Bug report", message: "App crashes on login", status: "resolved", response: "Fixed in v1.1" },
  ]);
  ids.contactMessages = contactMessages.map((cm) => cm._id);
  console.log(`✓ ContactMessages: ${contactMessages.length}`);

  // 19. Performance (depends on User, Subject, optional Chapter)
  const performances = await Performance.insertMany([
    { userId: ids.users[0], subjectId: ids.subjects[0], chapterId: ids.chapters[0], totalQuestions: 20, correctAnswers: 18, timeSpent: 600 },
    { userId: ids.users[1], subjectId: ids.subjects[1], totalQuestions: 10, correctAnswers: 7, timeSpent: 300 },
  ]);
  ids.performances = performances.map((p) => p._id);
  console.log(`✓ Performance: ${performances.length}`);

  // 20. StudyPlans (depends on User — multiple plans per user)
  const studyPlans = await StudyPlan.insertMany([
    {
      userId: ids.users[0],
      title: "Complete Biology revision",
      deadline: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      status: "pending",
    },
    {
      userId: ids.users[0],
      title: "Practice Chemistry MCQs",
      deadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      status: "pending",
    },
    {
      userId: ids.users[1],
      title: "Physics chapter review",
      deadline: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      status: "pending",
    },
  ]);
  ids.studyPlans = studyPlans.map((sp) => sp._id);
  console.log(`✓ StudyPlans: ${studyPlans.length}`);

  // 21. ExamCountdowns (optional User)
  const examDate = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
  const examCountdowns = await ExamCountdown.insertMany([
    { title: "MDCAT 2025", examDate, isActive: true, createdBy: ids.users[0] },
    { title: "Mock Test Day", examDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), isActive: true },
  ]);
  ids.examCountdowns = examCountdowns.map((ec) => ec._id);
  console.log(`✓ ExamCountdowns: ${examCountdowns.length}`);

  // 22. DiscussionThreads (depends on User, Subject)
  const discussionThreads = await DiscussionThread.insertMany([
    { title: "Cell division help", createdBy: ids.users[0], subjectId: ids.subjects[0], messageCount: 2 },
    { title: "Organic chemistry tips", createdBy: ids.users[1], subjectId: ids.subjects[1], messageCount: 1 },
  ]);
  ids.discussionThreads = discussionThreads.map((dt) => dt._id);
  console.log(`✓ DiscussionThreads: ${discussionThreads.length}`);

  // 23. DiscussionMessages (depends on User, DiscussionThread)
  const discussionMessages = await DiscussionMessage.insertMany([
    { threadId: ids.discussionThreads[0], userId: ids.users[0], type: "text", content: "Can someone explain mitosis?" },
    { threadId: ids.discussionThreads[0], userId: ids.users[1], type: "text", content: "Sure! Mitosis has 4 phases: prophase, metaphase, anaphase, telophase." },
    { threadId: ids.discussionThreads[1], userId: ids.users[1], type: "text", content: "Best way to memorize functional groups?" },
  ]);
  ids.discussionMessages = discussionMessages.map((dm) => dm._id);
  console.log(`✓ DiscussionMessages: ${discussionMessages.length}`);

  // 24. OfflineContent (depends on User)
  const offlineContents = await OfflineContent.insertMany([
    { userId: ids.users[0], contentType: "test", contentId: ids.tests[0] },
    { userId: ids.users[0], contentType: "note", contentId: ids.notes[0] },
    { userId: ids.users[0], contentType: "flashcard", contentId: ids.flashcards[0] },
    { userId: ids.users[0], contentType: "book", contentId: ids.books[0] },
  ]);
  ids.offlineContents = offlineContents.map((oc) => oc._id);
  console.log(`✓ OfflineContent: ${offlineContents.length}`);

  // 27. SyncLogs (depends on User)
  const syncLogs = await SyncLog.insertMany([
    { userId: ids.users[0], deviceId: "device-001", dataType: "flashcards" },
    { userId: ids.users[0], deviceId: "device-001", dataType: "notes" },
    { userId: ids.users[1], deviceId: "device-002", dataType: "tests" },
  ]);
  ids.syncLogs = syncLogs.map((sl) => sl._id);
  console.log(`✓ SyncLogs: ${syncLogs.length}`);

  console.log("\n✓ Seed completed successfully!");
  console.log("\nTest credentials:");
  console.log("  Admin:    admin@test.com / password123");
  console.log("  Student1: student1@test.com / password123");
  console.log("  Student2: student2@test.com / password123");
}

async function run() {
  try {
    await connectDB();
    if (clearFirst) {
      console.log("Clearing collections...\n");
      await clearCollections();
    }
    await seed();
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
    process.exit(0);
  }
}

run();
