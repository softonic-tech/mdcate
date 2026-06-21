import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/discussionThread.service.js";

export const createThread = asyncHandler(async (req, res) => {
  const data = await service.createThreadService({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, data });
});
export const getThreads = asyncHandler(async (req, res) => {
  const data = await service.getThreadsService(req.query);
  res.json({ success: true, count: data.length, data });
});
export const getThread = asyncHandler(async (req, res) => {
  const data = await service.getThreadByIdService(req.params.id);
  res.json({ success: true, data });
});
export const deleteThread = asyncHandler(async (req, res) => {
  await service.deleteThreadService(req.params.id, req.user._id);
  res.json({ success: true, message: "Thread deleted" });
});
