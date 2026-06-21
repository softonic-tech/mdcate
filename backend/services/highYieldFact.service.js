import HighYieldFact from "../models/highYieldFact.model.js";
import ApiError from "../utils/ApiError.js";


// ✅ CREATE
export const createFact = async (data) => {
  return await HighYieldFact.create(data);
};

// ✅ GET ALL (filters + sorting)
// export const getFacts = async (query) => {
//   const {
//     subjectId,
//     chapterId,
//     category,
//     minPriority,
//     limit = 20,
//     page = 1,
//   } = query;

//   const filter = { isActive: true };

//   if (subjectId) filter.subjectId = subjectId;
//   if (chapterId) filter.chapterId = chapterId;
//   if (category) filter.category = category;
//   if (minPriority) filter.priority = { $gte: Number(minPriority) };

//   const facts = await HighYieldFact.find(filter)
//     .sort({ priority: -1, examFrequency: -1 })
//     .limit(limit)
//     .skip((page - 1) * limit);

//   return facts;
// };
export const getFacts = async (query) => {
  const { subjectId, chapterId, category, minPriority, limit = 20, page = 1 } = query;

  const filter = { isActive: true };

  if (subjectId) filter.subjectId = subjectId;
  if (chapterId) filter.chapterId = chapterId;
  if (category) filter.category = category;
  if (minPriority) filter.priority = { $gte: Number(minPriority) };

  return await HighYieldFact.find(filter)
    .populate("subjectId", "name board")
    .populate("chapterId", "name")
    .sort({ priority: -1, examFrequency: -1 })
    .limit(limit)
    .skip((page - 1) * limit);
};
// 🔥 EXAM BOOSTER
export const getExamBoosterFacts = async () => {
  return await HighYieldFact.find({
    priority: { $gte: 4 },
    isActive: true,
  }).sort({ examFrequency: -1 });
};

// ⚡ DAILY FACTS
export const getDailyFacts = async () => {
  return await HighYieldFact.aggregate([
    { $match: { isActive: true } },
    { $sample: { size: 10 } },
  ]);
};

// 🧠 WEAK TOPIC FACTS (basic version)
export const getWeakFacts = async (weakChapterIds) => {
  return await HighYieldFact.find({
    chapterId: { $in: weakChapterIds },
  }).sort({ priority: -1 });
};

export const updateFact = async (id, data) => {
  return await HighYieldFact.findByIdAndUpdate(id, data, {
    new: true,
  });
};

export const deleteFact = async (id) => {
  return await HighYieldFact.findByIdAndDelete(id);
};