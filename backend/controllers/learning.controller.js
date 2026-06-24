import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/learning.service.js";

export const getSubjectsOverview = asyncHandler(async (req, res) => {
  const data = await service.getSubjectsOverviewService(req.user._id);
  res.json({ success: true, count: data.length, data });
});

export const getChaptersOverview = asyncHandler(async (req, res) => {
  const data = await service.getChaptersOverviewService(
    req.params.subjectId,
    req.user._id
  );
  res.json({ success: true, data });
});

export const getChapterSections = asyncHandler(async (req, res) => {
  const data = await service.getChapterSectionsService(
    req.params.chapterId,
    req.user._id
  );
  res.json({ success: true, data });
});

export const saveSectionProgress = asyncHandler(async (req, res) => {
  const data = await service.saveSectionProgressService(
    req.user._id,
    req.params.chapterId,
    req.params.sectionIndex,
    req.body
  );
  res.json({ success: true, data });
});

export const completeSection = asyncHandler(async (req, res) => {
  const data = await service.completeSectionService(
    req.user._id,
    req.params.chapterId,
    req.params.sectionIndex,
    req.body
  );
  res.status(201).json({ success: true, data });
});
