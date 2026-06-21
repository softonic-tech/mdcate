import TestAttempt from "../models/testAttempt.model.js";
import Test from "../models/test.model.js";
import Question from "../models/question.model.js";
import User from "../models/user.model.js";
import Performance from "../models/performance.model.js";
import ApiError from "../utils/ApiError.js";
import { publishToQueue, QUEUES } from "../config/rabbitmq.config.js";

export const createAttemptService = async (data) => {
  const { userId, testId, answers, timeSpent } = data;

  const existingAttempt = await TestAttempt.findOne({ userId, testId });
  if (existingAttempt) throw ApiError.conflict("You already attempted this test");

  if (!answers || answers.length === 0) {
    throw ApiError.badRequest("Answers required");
  }

  const test = await Test.findById(testId);
  if (!test) throw ApiError.notFound("Test not found");

  const testQuestionIds = test.questions.map((id) => id.toString());
  const questionIds = answers.map((a) => a.questionId);
  const questions = await Question.find({ _id: { $in: questionIds } });

  const questionMap = {};
  questions.forEach((q) => {
    questionMap[q._id.toString()] = q;
  });

  let score = 0;
  const processedAnswers = [];

  for (const ans of answers) {
    const qId = ans.questionId.toString();

    if (!testQuestionIds.includes(qId)) {
      throw ApiError.badRequest("Invalid question in answers");
    }

    const q = questionMap[qId];
    if (!q) throw ApiError.badRequest("Question not found");

    if (ans.selectedOption >= q.options.length) {
      throw ApiError.badRequest("Selected option invalid");
    }

    const isCorrect = ans.selectedOption === q.correctAnswer;
    if (isCorrect) score += 1;

    processedAnswers.push({
      questionId: ans.questionId,
      selectedOption: ans.selectedOption,
      isCorrect,
      timeSpent: ans.timeSpent || 0,
    });
  }

  const totalQuestions = processedAnswers.length;

  // Calculate percentile
  const allAttempts = await TestAttempt.find({ testId });
  const belowCount = allAttempts.filter((a) => a.score < score).length;
  const percentile =
    allAttempts.length > 0
      ? Math.round((belowCount / allAttempts.length) * 100)
      : 100;

  const attempt = await TestAttempt.create({
    userId,
    testId,
    answers: processedAnswers,
    score,
    totalQuestions,
    percentile,
    timeSpent: timeSpent || 0,
    completedAt: new Date(),
  });

  await User.findByIdAndUpdate(userId, { $inc: { points: score } });

  // Record performance per subject
  if (test.subjectId) {
    await Performance.create({
      userId,
      subjectId: test.subjectId,
      chapterId: test.chapterId,
      totalQuestions,
      correctAnswers: score,
      timeSpent: timeSpent || 0,
    });
  }

  publishToQueue(QUEUES.BADGE_CHECK, {
    userId: userId.toString(),
    event: "quiz_completion",
    score,
    totalQuestions,
  });

  return attempt;
};

export const getAttemptsService = async (filters = {}) => {
  const query = {};
  if (filters.userId) query.userId = filters.userId;
  if (filters.testId) query.testId = filters.testId;

  return TestAttempt.find(query)
    .populate("userId", "username email")
    .populate("testId", "title type")
    .sort({ completedAt: -1 });
};

export const getUserAttemptsService = async (userId) => {
  return TestAttempt.find({ userId })
    .populate("testId", "title type subjectId")
    .sort({ completedAt: -1 });
};

export const getAttemptByIdService = async (id) => {
  const attempt = await TestAttempt.findById(id)
    .populate("testId")
    .populate("answers.questionId");
  if (!attempt) throw ApiError.notFound("Attempt not found");
  return attempt;
};

export const deleteAttemptService = async (id) => {
  const a = await TestAttempt.findByIdAndDelete(id);
  if (!a) throw ApiError.notFound("Attempt not found");
};
