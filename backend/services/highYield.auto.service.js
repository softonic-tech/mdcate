import HighYieldFact from "../models/highYieldFact.model.js";
import Question from "../models/question.model.js";
import Performance from "../models/performance.model.js";

// ------------------------------
// ANALYZE WEAK TOPICS (FIXED)
// ------------------------------
const analyzeWeakTopics = async () => {
  const performances = await Performance.find();

  const stats = {};

  performances.forEach((p) => {
    const key = p.chapterId?.toString();

    if (!key) return;

    if (!stats[key]) {
      stats[key] = { total: 0, correct: 0 };
    }

    stats[key].total += p.totalQuestions;
    stats[key].correct += p.correctAnswers;
  });

  const weak = {};

  Object.entries(stats).forEach(([chapterId, data]) => {
    const wrong = data.total - data.correct;

    weak[chapterId] = {
      total: data.total,
      wrong,
    };
  });

  return weak;
};

// ------------------------------
// ANALYZE PAST PAPERS
// ------------------------------
const analyzePastPapers = async () => {
  const questions = await Question.find({ isPastPaper: true });

  const map = {};

  questions.forEach((q) => {
    const id = q.chapterId?.toString();
    if (!id) return;

    map[id] = (map[id] || 0) + 1;
  });

  return map;
};

// ------------------------------
// MAIN GENERATOR
// ------------------------------
export const generateAutoHighYield = async () => {
  const weak = await analyzeWeakTopics();
  const past = await analyzePastPapers();

  const facts = [];

  // 🔥 Weak topics
  Object.entries(weak).forEach(([chapterId, stats]) => {
    const errorRate = stats.wrong / (stats.total || 1);

    if (errorRate > 0.3) {
      facts.push({
        title: "Weak Area Detected",
        content: `Students are making ${Math.round(errorRate * 100)}% mistakes in this chapter.`,
        chapterId,
        priority: 5,
        sourceType: "auto",
        category: "exam",
      });
    }
  });

  // 🔥 Past paper frequency
  Object.entries(past).forEach(([chapterId, count]) => {
    if (count > 5) {
      facts.push({
        title: "Frequently Asked Topic",
        content: `This chapter appeared ${count} times in past papers.`,
        chapterId,
        priority: 4,
        sourceType: "auto",
        category: "exam",
      });
    }
  });

  if (facts.length === 0) return [];

  const saved = await HighYieldFact.insertMany(facts);
  return saved;
};