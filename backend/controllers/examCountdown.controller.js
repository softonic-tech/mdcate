import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/examCountdown.service.js";

// CREATE EXAM
export const createExam = asyncHandler(async (req, res) => {
  const data = await service.createExam({
    ...req.body,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    data,
  });
});

// GET EXAMS
export const getExams = asyncHandler(async (req, res) => {
  const data = await service.getExamsWithCountdown();

  res.json({
    success: true,
    data,
  });
});

// UPDATE EXAM
export const updateExam = asyncHandler(async (req, res) => {
  const data = await service.updateExam(req.params.id, req.body);

  res.json({
    success: true,
    data,
  });
});

// DELETE EXAM
export const deleteExam = asyncHandler(async (req, res) => {
  await service.deleteExam(req.params.id);

  res.json({
    success: true,
    message: "Exam deleted",
  });
});