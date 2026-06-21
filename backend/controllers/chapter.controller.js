import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/chapter.service.js";

export const createChapter = asyncHandler(async (req, res) => {
  const chapter = await service.createChapterService(req.body);
  res.status(201).json({ success: true, data: chapter });
});

export const getChaptersBySubject = asyncHandler(async (req, res) => {
  const chapters = await service.getChaptersBySubjectService(req.params.subjectId);
  res.json({ success: true, count: chapters.length, data: chapters });
});

export const updateChapter = asyncHandler(async (req, res) => {
  const chapter = await service.updateChapterService(req.params.id, req.body);
  res.json({ success: true, data: chapter });
});

export const deleteChapter = asyncHandler(async (req, res) => {
  await service.deleteChapterService(req.params.id);
  res.json({ success: true, message: "Chapter deleted" });
});
