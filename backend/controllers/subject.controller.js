import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/subject.service.js";

export const createSubject = asyncHandler(async (req, res) => {
  const subject = await service.createSubjectService(req.body);
  res.status(201).json({ success: true, data: subject });
});

export const getSubjects = asyncHandler(async (req, res) => {
  const subjects = await service.getSubjectsService(req.query);
  res.json({ success: true, count: subjects.length, data: subjects });
});

export const updateSubject = asyncHandler(async (req, res) => {
  const subject = await service.updateSubjectService(req.params.id, req.body);
  res.json({ success: true, data: subject });
});

export const deleteSubject = asyncHandler(async (req, res) => {
  await service.deleteSubjectService(req.params.id);
  res.json({ success: true, message: "Subject deleted" });
});
