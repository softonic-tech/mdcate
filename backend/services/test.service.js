import Test from "../models/test.model.js";
import Question from "../models/question.model.js";
import ApiError from "../utils/ApiError.js";
import mongoose from "mongoose";

export const createTestService = async (data) => {
  if (!data.questions || data.questions.length === 0) {
    throw ApiError.badRequest("Test must contain questions");
  }

  const ids = data.questions.map((id) => new mongoose.Types.ObjectId(id));

  const questions = await Question.find({ _id: { $in: ids } });
  if (questions.length !== ids.length) {
    throw ApiError.badRequest("Some questions do not exist");
  }

  const isPastPaper = data.type === "pastPaper";

  if (isPastPaper) {
    data.questionCount = ids.length;
    data.chapterId = data.chapterId || null;
  } else {
    const wrongSubject = questions.some(
      (q) => q.subjectId.toString() !== data.subjectId
    );
    if (wrongSubject) {
      throw ApiError.badRequest("All questions must belong to the same subject");
    }

    if (data.chapterId) {
      const wrongChapter = questions.some(
        (q) => q.chapterId.toString() !== data.chapterId
      );
      if (wrongChapter) {
        throw ApiError.badRequest("All questions must belong to the same chapter");
      }
    }
  }

  return Test.create(data);
};

export const generateAdaptiveTestService = async ({ userId, subjectId, count = 30 }) => {
  const TestAttempt = mongoose.model("TestAttempt");
  const Performance = mongoose.model("Performance");

  const recentPerformance = await Performance.find({ userId, subjectId })
    .sort({ date: -1 })
    .limit(5);

  let targetDifficulty = "medium";
  if (recentPerformance.length > 0) {
    const avgAccuracy =
      recentPerformance.reduce(
        (sum, p) => sum + p.correctAnswers / p.totalQuestions,
        0
      ) / recentPerformance.length;

    if (avgAccuracy > 0.8) targetDifficulty = "hard";
    else if (avgAccuracy < 0.4) targetDifficulty = "easy";
  }

  const difficultyDistribution = {
    easy: { easy: 0.6, medium: 0.3, hard: 0.1 },
    medium: { easy: 0.2, medium: 0.6, hard: 0.2 },
    hard: { easy: 0.1, medium: 0.3, hard: 0.6 },
  };

  const dist = difficultyDistribution[targetDifficulty];
  const questions = [];

  for (const [difficulty, ratio] of Object.entries(dist)) {
    const qCount = Math.round(count * ratio);
    const qs = await Question.aggregate([
      {
        $match: {
          subjectId: new mongoose.Types.ObjectId(subjectId),
          difficulty,
        },
      },
      { $sample: { size: qCount } },
    ]);
    questions.push(...qs);
  }

  const test = await Test.create({
    title: `Adaptive Test - ${new Date().toISOString().split("T")[0]}`,
    type: "adaptive",
    subjectId,
    questions: questions.map((q) => q._id),
    questionCount: questions.length,
    duration: Math.round(questions.length * 1.5),
  });

  return test;
};

export const getTestsService = async (filters = {}) => {
  const query = {};
  if (filters.type) query.type = filters.type;
  if (filters.subjectId) query.subjectId = filters.subjectId;
  if (filters.paperYear) query.paperYear = Number(filters.paperYear);

  return Test.find(query)
    .populate("subjectId", "name board")
    .populate("chapterId", "name")
    .sort(filters.type === "pastPaper" ? { paperYear: -1, createdAt: -1 } : { createdAt: -1 });
};

export const getTestByIdService = async (id) => {
  const test = await Test.findById(id).populate("questions");
  if (!test) throw ApiError.notFound("Test not found");
  return test;
};

export const updateTestService = async (id, data) => {
  if (data.questions) {
    const ids = data.questions.map((id) => new mongoose.Types.ObjectId(id));
    const questions = await Question.find({ _id: { $in: ids } });

    if (questions.length !== ids.length) {
      throw ApiError.badRequest("Some questions do not exist");
    }

    if (data.type === "pastPaper" || (await Test.findById(id))?.type === "pastPaper") {
      data.questionCount = ids.length;
    }
  }

  const test = await Test.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!test) throw ApiError.notFound("Test not found");
  return test;
};

export const deleteTestService = async (id) => {
  const test = await Test.findByIdAndDelete(id);
  if (!test) throw ApiError.notFound("Test not found");
};
