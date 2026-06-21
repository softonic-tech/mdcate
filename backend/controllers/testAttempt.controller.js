import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/testAttempt.service.js";

export const createAttempt = asyncHandler(async (req, res) => {
  const data = await service.createAttemptService({
    userId: req.user._id,
    testId: req.body.testId,
    answers: req.body.answers,
    timeSpent: req.body.timeSpent,
  });
  res.status(201).json({ success: true, data });
});

export const getAttempts = asyncHandler(async (req, res) => {
  const data = await service.getAttemptsService(req.query);
  res.json({ success: true, data });
});

export const getUserAttempts = asyncHandler(async (req, res) => {
  const data = await service.getUserAttemptsService(req.user._id);
  res.json({ success: true, count: data.length, data });
});

export const getAttempt = asyncHandler(async (req, res) => {
  const data = await service.getAttemptByIdService(req.params.id);
  res.json({ success: true, data });
});

export const deleteAttempt = asyncHandler(async (req, res) => {
  await service.deleteAttemptService(req.params.id);
  res.json({ success: true, message: "Attempt deleted" });
});
