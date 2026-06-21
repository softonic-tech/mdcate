import Performance from "../models/performance.model.js";
import ApiError from "../utils/ApiError.js";

export const createPerformanceService = (data) => Performance.create(data);

export const getPerformancesService = () =>
  Performance.find()
    .populate("userId", "username email")
    .populate("subjectId", "name")
    .sort({ date: -1 });

export const getUserPerformanceService = (userId) =>
  Performance.find({ userId })
    .populate("subjectId", "name")
    .sort({ date: -1 });

export const getUserAnalyticsService = async (userId) => {
  const performances = await Performance.find({ userId })
    .populate("subjectId", "name")
    .sort({ date: -1 });

  if (performances.length === 0) return { subjects: [], overall: null };

  const subjectMap = {};

  for (const p of performances) {
    const key = p.subjectId?._id?.toString() || "unknown";
    if (!subjectMap[key]) {
      subjectMap[key] = {
        subjectId: p.subjectId?._id,
        subjectName: p.subjectId?.name || "Unknown",
        totalQuestions: 0,
        correctAnswers: 0,
        totalTimeSpent: 0,
        attempts: 0,
      };
    }
    subjectMap[key].totalQuestions += p.totalQuestions;
    subjectMap[key].correctAnswers += p.correctAnswers;
    subjectMap[key].totalTimeSpent += p.timeSpent;
    subjectMap[key].attempts += 1;
  }

  const subjects = Object.values(subjectMap).map((s) => ({
    ...s,
    accuracy: s.totalQuestions > 0
      ? Math.round((s.correctAnswers / s.totalQuestions) * 100)
      : 0,
  }));

  const weakest = subjects.sort((a, b) => a.accuracy - b.accuracy).slice(0, 3);

  const overall = {
    totalQuestions: subjects.reduce((sum, s) => sum + s.totalQuestions, 0),
    correctAnswers: subjects.reduce((sum, s) => sum + s.correctAnswers, 0),
    totalTimeSpent: subjects.reduce((sum, s) => sum + s.totalTimeSpent, 0),
    totalAttempts: subjects.reduce((sum, s) => sum + s.attempts, 0),
  };

  overall.accuracy =
    overall.totalQuestions > 0
      ? Math.round((overall.correctAnswers / overall.totalQuestions) * 100)
      : 0;

  return { subjects, weakestTopics: weakest, overall };
};

export const updatePerformanceService = (id, data) =>
  Performance.findByIdAndUpdate(id, data, { new: true, runValidators: true });

export const deletePerformanceService = (id) =>
  Performance.findByIdAndDelete(id);
