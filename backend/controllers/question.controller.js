import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/question.service.js";
import * as importService from "../services/mcqImport.service.js";

export const createQuestion = asyncHandler(async (req, res) => {
  const question = await service.createQuestionService(req.body);
  res.status(201).json({ success: true, data: question });
});

export const bulkCreateQuestions = asyncHandler(async (req, res) => {
  const results = await service.bulkCreateQuestionsService(req.body.questions);
  res.status(201).json({ success: true, data: results });
});

export const previewMcqImport = asyncHandler(async (req, res) => {
  const { subjectId, chapterId, mode = "auto" } = req.body;
  const data = await importService.previewMcqImport({
    file: req.file,
    subjectId,
    chapterId,
    mode,
  });
  res.json({ success: true, data });
});

export const confirmMcqImport = asyncHandler(async (req, res) => {
  const { questions, subjectId, chapterId } = req.body;
  const data = await importService.confirmMcqImport({ questions, subjectId, chapterId });
  res.status(201).json({ success: true, data });
});

export const getQuestions = asyncHandler(async (req, res) => {
  const result = await service.getQuestionsService(req.query);
  res.json({ success: true, ...result });
});

export const getRandomQuestions = asyncHandler(async (req, res) => {
  const questions = await service.getRandomQuestionsService(req.query);
  res.json({ success: true, count: questions.length, data: questions });
});

export const getQuestion = asyncHandler(async (req, res) => {
  const question = await service.getQuestionByIdService(req.params.id);
  res.json({ success: true, data: question });
});

export const updateQuestion = asyncHandler(async (req, res) => {
  const question = await service.updateQuestionService(req.params.id, req.body);
  res.json({ success: true, data: question });
});

export const deleteQuestion = asyncHandler(async (req, res) => {
  await service.deleteQuestionService(req.params.id);
  res.json({ success: true, message: "Question deleted" });
});
