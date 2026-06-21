import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/challengeAttempt.service.js";

export const createChallengeAttempt = asyncHandler(async (req, res) => {
  const attempt = await service.createChallengeAttempt({ userId: req.user._id, ...req.body });
  res.status(201).json({ success: true, data: attempt });
});
export const getAllAttempts = asyncHandler(async (req, res) => {
  const data = await service.getAllAttempts();
  res.json({ success: true, count: data.length, data });
});
export const getUserAttempts = asyncHandler(async (req, res) => {
  const data = await service.getUserAttempts(req.user._id);
  res.json({ success: true, count: data.length, data });
});
