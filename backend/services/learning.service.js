import mongoose from "mongoose";
import Subject from "../models/subject.model.js";
import Chapter from "../models/chapter.model.js";
import Question from "../models/question.model.js";
import SectionProgress from "../models/sectionProgress.model.js";
import Performance from "../models/performance.model.js";
import ApiError from "../utils/ApiError.js";
import { getChapterByIdService } from "./chapter.service.js";

export const SECTION_SIZE = 50;

const learningQuestionFilter = { isPastPaper: { $ne: true } };

const toObjectId = (value) => {
  if (!value) return null;
  if (value instanceof mongoose.Types.ObjectId) return value;
  if (typeof value === "object" && value._id) return toObjectId(value._id);
  if (!mongoose.Types.ObjectId.isValid(String(value))) return null;
  return new mongoose.Types.ObjectId(String(value));
};

const countSections = (questionCount) =>
  questionCount > 0 ? Math.ceil(questionCount / SECTION_SIZE) : 0;

const resolveSubjectId = (chapter) =>
  toObjectId(chapter?.subjectId?._id || chapter?.subjectId);

const upsertSectionProgress = async ({
  userId,
  chapterId,
  sectionIndex,
  totalQuestions,
  questionsAnswered,
  correctAnswers,
  timeSpent = 0,
  status = "in_progress",
}) => {
  const scorePercent =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;

  const update = {
    userId,
    chapterId,
    sectionIndex,
    status,
    totalQuestions,
    questionsAnswered,
    correctAnswers,
    scorePercent,
    timeSpent: Number(timeSpent) || 0,
  };

  if (status === "completed") {
    update.completedAt = new Date();
  }

  return SectionProgress.findOneAndUpdate(
    { userId, chapterId, sectionIndex },
    update,
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
  );
};

export const getSubjectsOverviewService = async (userId) => {
  const subjects = await Subject.find().sort({ name: 1 }).lean();
  const userObjectId = toObjectId(userId);

  const [questionCounts, chapterCounts] = await Promise.all([
    Question.aggregate([
      { $match: learningQuestionFilter },
      { $group: { _id: "$subjectId", count: { $sum: 1 } } },
    ]),
    Chapter.aggregate([{ $group: { _id: "$subjectId", count: { $sum: 1 } } }]),
  ]);

  const questionMap = Object.fromEntries(
    questionCounts.map((row) => [row._id?.toString(), row.count])
  );
  const chapterMap = Object.fromEntries(
    chapterCounts.map((row) => [row._id?.toString(), row.count])
  );

  let completedBySubject = {};
  let practicedBySubject = {};

  if (userObjectId) {
    const progressStats = await SectionProgress.aggregate([
      { $match: { userId: userObjectId } },
      {
        $lookup: {
          from: "chapters",
          localField: "chapterId",
          foreignField: "_id",
          as: "chapter",
        },
      },
      { $unwind: "$chapter" },
      {
        $group: {
          _id: "$chapter.subjectId",
          completedSections: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          questionsAnswered: { $sum: "$questionsAnswered" },
        },
      },
    ]);

    completedBySubject = Object.fromEntries(
      progressStats.map((row) => [row._id?.toString(), row.completedSections])
    );
    practicedBySubject = Object.fromEntries(
      progressStats.map((row) => [row._id?.toString(), row.questionsAnswered])
    );
  }

  return subjects.map((subject) => {
    const key = subject._id.toString();
    const questionCount = questionMap[key] || 0;
    const completedSections = completedBySubject[key] || 0;
    const questionsAnswered = practicedBySubject[key] || 0;

    return {
      ...subject,
      chapterCount: chapterMap[key] || 0,
      questionCount,
      completedSections,
      questionsAnswered,
      progressPercent:
        questionCount > 0
          ? Math.min(100, Math.round((questionsAnswered / questionCount) * 100))
          : 0,
    };
  });
};

export const getChaptersOverviewService = async (subjectId, userId) => {
  const subjectObjectId = toObjectId(subjectId);
  if (!subjectObjectId) throw ApiError.badRequest("Invalid subject id");

  const subject = await Subject.findById(subjectObjectId);
  if (!subject) throw ApiError.notFound("Subject not found");

  const chapters = await Chapter.find({ subjectId: subjectObjectId })
    .sort({ name: 1 })
    .lean();

  const questionCounts = await Question.aggregate([
    {
      $match: {
        subjectId: subjectObjectId,
        ...learningQuestionFilter,
      },
    },
    { $group: { _id: "$chapterId", count: { $sum: 1 } } },
  ]);

  const questionMap = Object.fromEntries(
    questionCounts.map((row) => [row._id?.toString(), row.count])
  );

  const chapterIds = chapters.map((c) => c._id);
  const userObjectId = toObjectId(userId);
  let progressByChapter = {};

  if (userObjectId && chapterIds.length) {
    const progress = await SectionProgress.find({
      userId: userObjectId,
      chapterId: { $in: chapterIds },
    }).lean();

    progressByChapter = progress.reduce((acc, row) => {
      const key = row.chapterId.toString();
      if (!acc[key]) {
        acc[key] = { completedSections: 0, questionsAnswered: 0, items: [] };
      }
      if (row.status === "completed") acc[key].completedSections += 1;
      acc[key].questionsAnswered += row.questionsAnswered || 0;
      acc[key].items.push(row);
      return acc;
    }, {});
  }

  const chapterRows = chapters.map((chapter) => {
    const key = chapter._id.toString();
    const qCount = questionMap[key] || 0;
    const totalSections = countSections(qCount);
    const stats = progressByChapter[key] || {
      completedSections: 0,
      questionsAnswered: 0,
    };

    return {
      ...chapter,
      questionCount: qCount,
      totalSections,
      completedSections: stats.completedSections,
      questionsAnswered: stats.questionsAnswered,
      progressPercent:
        qCount > 0
          ? Math.min(100, Math.round((stats.questionsAnswered / qCount) * 100))
          : 0,
    };
  });

  return { subject, chapters: chapterRows };
};

export const getChapterSectionsService = async (chapterId, userId) => {
  const chapterObjectId = toObjectId(chapterId);
  if (!chapterObjectId) throw ApiError.badRequest("Invalid chapter id");

  const chapter = await getChapterByIdService(chapterObjectId);

  const totalQuestions = await Question.countDocuments({
    chapterId: chapterObjectId,
    ...learningQuestionFilter,
  });

  const totalSections = countSections(totalQuestions);
  const userObjectId = toObjectId(userId);

  const progressRows = userObjectId
    ? await SectionProgress.find({
        userId: userObjectId,
        chapterId: chapterObjectId,
      }).lean()
    : [];

  const progressMap = Object.fromEntries(
    progressRows.map((row) => [Number(row.sectionIndex), row])
  );

  const sections = [];
  for (let i = 0; i < totalSections; i += 1) {
    const start = i * SECTION_SIZE + 1;
    const end = Math.min((i + 1) * SECTION_SIZE, totalQuestions);
    const progress = progressMap[i] || null;

    sections.push({
      sectionIndex: i,
      label: `Section ${i + 1}`,
      questionStart: start,
      questionEnd: end,
      questionCount: end - start + 1,
      completed: progress?.status === "completed",
      inProgress: progress?.status === "in_progress" && (progress?.questionsAnswered || 0) > 0,
      progress,
    });
  }

  const completedSections = progressRows.filter(
    (row) => row.status === "completed"
  ).length;
  const questionsAnswered = progressRows.reduce(
    (sum, row) => sum + (row.questionsAnswered || 0),
    0
  );

  return {
    chapter,
    totalQuestions,
    totalSections,
    completedSections,
    questionsAnswered,
    progressPercent:
      totalQuestions > 0
        ? Math.min(100, Math.round((questionsAnswered / totalQuestions) * 100))
        : 0,
    sections,
  };
};

export const saveSectionProgressService = async (
  userId,
  chapterId,
  sectionIndex,
  { questionsAnswered, correctAnswers, totalQuestions, timeSpent, status = "in_progress" }
) => {
  const userObjectId = toObjectId(userId);
  const chapterObjectId = toObjectId(chapterId);
  const index = Number(sectionIndex);

  if (!userObjectId) throw ApiError.unauthorized("User not found");
  if (!chapterObjectId) throw ApiError.badRequest("Invalid chapter id");
  if (!Number.isInteger(index) || index < 0) {
    throw ApiError.badRequest("Invalid section index");
  }

  const chapter = await getChapterByIdService(chapterObjectId);

  const chapterQuestionCount = await Question.countDocuments({
    chapterId: chapterObjectId,
    ...learningQuestionFilter,
  });

  const totalSections = countSections(chapterQuestionCount);
  if (index >= totalSections) {
    throw ApiError.badRequest("Section does not exist for this chapter");
  }

  const answered = Number(questionsAnswered) || 0;
  const correct = Number(correctAnswers) || 0;
  const total = Number(totalQuestions) || 0;

  if (answered <= 0) {
    throw ApiError.badRequest("Answer at least one question to save progress");
  }

  const nextStatus = status === "completed" ? "completed" : "in_progress";

  if (nextStatus === "completed" && total > 0 && answered < total) {
    throw ApiError.badRequest("Answer all questions before completing this section");
  }

  const progress = await upsertSectionProgress({
    userId: userObjectId,
    chapterId: chapterObjectId,
    sectionIndex: index,
    totalQuestions: total || answered,
    questionsAnswered: answered,
    correctAnswers: correct,
    timeSpent,
    status: nextStatus,
  });

  if (nextStatus === "completed") {
    try {
      await Performance.create({
        userId: userObjectId,
        subjectId: resolveSubjectId(chapter),
        chapterId: chapterObjectId,
        totalQuestions: answered,
        correctAnswers: correct,
        timeSpent: Number(timeSpent) || 0,
      });
    } catch {
      // Progress is already saved — analytics failure must not block the user.
    }
  }

  return progress;
};

export const completeSectionService = async (
  userId,
  chapterId,
  sectionIndex,
  payload
) =>
  saveSectionProgressService(userId, chapterId, sectionIndex, {
    ...payload,
    status: "completed",
  });
