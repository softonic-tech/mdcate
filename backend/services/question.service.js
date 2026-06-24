import Question from "../models/question.model.js";
import ApiError from "../utils/ApiError.js";
import { paginate, paginatedResponse } from "../utils/pagination.js";

export const createQuestionService = async (data) => {
  const exists = await Question.findOne({
    text: data.text,
    subjectId: data.subjectId,
    chapterId: data.chapterId,
  });
  if (exists) throw ApiError.conflict("MCQ already exists in this chapter");
  return Question.create(data);
};

export const bulkCreateQuestionsService = async (questions, { returnIds = false } = {}) => {
  const results = { created: 0, skipped: 0, errors: [] };
  const ids = returnIds ? [] : undefined;

  for (const q of questions) {
    try {
      const exists = await Question.findOne({
        text: q.text,
        subjectId: q.subjectId,
        chapterId: q.chapterId,
      });

      if (exists) {
        if (returnIds) ids.push(exists._id);
        results.skipped += 1;
        continue;
      }

      const doc = await Question.create(q);
      if (returnIds) ids.push(doc._id);
      results.created += 1;
    } catch (err) {
      results.errors.push({ text: q.text?.substring(0, 50), error: err.message });
    }
  }

  return returnIds ? { ids, ...results } : results;
};

export const getQuestionsService = async (filters) => {
  const query = {};
  if (filters.subjectId) query.subjectId = filters.subjectId;
  if (filters.chapterId) query.chapterId = filters.chapterId;
  if (filters.difficulty) query.difficulty = filters.difficulty;
  if (filters.tag) query.tags = filters.tag;
  if (filters.isPastPaper !== undefined) {
    const val = filters.isPastPaper;
    const excludePastPaper = val === false || val === "false";
    query.isPastPaper = excludePastPaper ? { $ne: true } : true;
  }
  if (filters.paperYear) query.paperYear = Number(filters.paperYear);

  const { page, limit, skip } = paginate(filters);
  const [data, total] = await Promise.all([
    Question.find(query)
      .populate("subjectId", "name board")
      .populate("chapterId", "name")
      .sort({ createdAt: 1, _id: 1 })
      .skip(skip)
      .limit(limit),
    Question.countDocuments(query),
  ]);

  return paginatedResponse(data, total, page, limit);
};

export const getQuestionByIdService = async (id) => {
  const q = await Question.findById(id)
    .populate("subjectId", "name")
    .populate("chapterId", "name");
  if (!q) throw ApiError.notFound("Question not found");
  return q;
};

export const getRandomQuestionsService = async (filters) => {
  const match = {};
  if (filters.subjectId) match.subjectId = filters.subjectId;
  if (filters.chapterId) match.chapterId = filters.chapterId;
  if (filters.difficulty) match.difficulty = filters.difficulty;

  const count = Number(filters.count) || 10;

  return Question.aggregate([
    { $match: match },
    { $sample: { size: count } },
  ]);
};

export const updateQuestionService = async (id, data) => {
  if (data.options && data.correctAnswer >= data.options.length) {
    throw ApiError.badRequest("Correct answer index invalid");
  }

  const q = await Question.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!q) throw ApiError.notFound("Question not found");
  return q;
};

export const deleteQuestionService = async (id) => {
  const q = await Question.findByIdAndDelete(id);
  if (!q) throw ApiError.notFound("Question not found");
};
