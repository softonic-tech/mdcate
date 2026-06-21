import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/syncLog.service.js";

export const createSyncLog = asyncHandler(async (req, res) => {
  const data = await service.createSyncLog({ userId: req.user._id, ...req.body });
  res.status(201).json({ success: true, data });
});
export const getUserSyncLogs = asyncHandler(async (req, res) => {
  const data = await service.getUserSyncLogs(req.user._id);
  res.json({ success: true, count: data.length, data });
});
