import User from "../models/user.model.js";
import Question from "../models/question.model.js";
import Chapter from "../models/chapter.model.js";
import Subject from "../models/subject.model.js";
import Test from "../models/test.model.js";
import TestAttempt from "../models/testAttempt.model.js";
import Badge from "../models/badge.model.js";
import ExamCountdown from "../models/examCountdown.model.js";
import Challenge from "../models/challenge.model.js";
import { getActivePlansService } from "./pricingPlan.service.js";

let landingCache = null;
let landingCacheAt = 0;
const LANDING_CACHE_MS = 60_000;

export const getLandingStatsService = async () => {
  if (landingCache && Date.now() - landingCacheAt < LANDING_CACHE_MS) {
    return landingCache;
  }

  const now = new Date();

  const [
    totalStudents,
    totalQuestions,
    totalTests,
    totalChapters,
    avgPercentileResult,
    subjects,
    questionCounts,
    chapterCounts,
    topStudents,
    badges,
    nextExam,
    activeChallenges,
    boards,
    pricingPlans,
  ] = await Promise.all([
    User.countDocuments({ role: "user" }),
    Question.countDocuments(),
    Test.countDocuments(),
    Chapter.countDocuments(),
    TestAttempt.aggregate([{ $group: { _id: null, avg: { $avg: "$percentile" } } }]),
    Subject.find().sort({ name: 1 }).lean(),
    Question.aggregate([{ $group: { _id: "$subjectId", count: { $sum: 1 } } }]),
    Chapter.aggregate([{ $group: { _id: "$subjectId", count: { $sum: 1 } } }]),
    User.find({ role: "user" })
      .select("username profilePicture points streak bio academic")
      .sort({ points: -1 })
      .limit(4)
      .lean(),
    Badge.find().sort({ createdAt: -1 }).limit(6).select("name description").lean(),
    ExamCountdown.findOne({ examDate: { $gte: now } }).sort({ examDate: 1 }).lean(),
    Challenge.countDocuments({ isActive: true }),
    Subject.distinct("board"),
    getActivePlansService(),
  ]);

  const questionMap = Object.fromEntries(
    questionCounts.map((row) => [row._id?.toString(), row.count])
  );
  const chapterMap = Object.fromEntries(
    chapterCounts.map((row) => [row._id?.toString(), row.count])
  );

  const subjectsWithCounts = subjects.map((subject) => ({
    _id: subject._id,
    name: subject.name,
    board: subject.board,
    chapterCount: chapterMap[subject._id.toString()] || 0,
    questionCount: questionMap[subject._id.toString()] || 0,
  }));

  const avgPercentile = avgPercentileResult[0]?.avg
    ? Math.round(avgPercentileResult[0].avg)
    : null;

  const featuredStudents = topStudents.map((user) => {
    const targetExam = user.academic?.targetExam?.trim();
    const scoreLabel = targetExam
      ? `${targetExam} · ${user.points} pts`
      : `${user.points} points · ${user.streak}-day streak`;

    const quote =
      user.bio?.trim() ||
      `Ranked among top performers on medprep.study with ${user.points} points and a ${user.streak}-day study streak.`;

    return {
      name: user.username,
      points: user.points,
      streak: user.streak,
      avatar: user.profilePicture || null,
      scoreLabel,
      quote,
    };
  });

  const result = {
    totals: {
      students: totalStudents,
      questions: totalQuestions,
      tests: totalTests,
      chapters: totalChapters,
      avgPercentile,
      activeChallenges,
    },
    subjects: subjectsWithCounts,
    boards: boards.filter(Boolean),
    badges: badges.map((badge) => ({
      name: badge.name,
      description: badge.description,
    })),
    featuredStudents,
    pricingPlans: (pricingPlans || []).map((plan) =>
      typeof plan.toObject === "function" ? plan.toObject() : plan
    ),
    nextExam: nextExam
      ? {
          title: nextExam.title,
          subject: nextExam.subject,
          examDate: nextExam.examDate,
          daysRemaining: Math.max(
            0,
            Math.ceil((new Date(nextExam.examDate).getTime() - Date.now()) / 86400000)
          ),
        }
      : null,
  };

  landingCache = result;
  landingCacheAt = Date.now();
  return result;
};
