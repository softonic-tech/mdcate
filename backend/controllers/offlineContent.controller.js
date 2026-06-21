import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/offlineContent.service.js";

export const downloadContent = asyncHandler(async (req, res) => {
  const data = await service.downloadService({ userId: req.user._id, ...req.body });
  res.status(201).json({ success: true, data });
});
export const getOfflineContent = asyncHandler(async (req, res) => {
  const data = await service.getOfflineService(req.user._id);
  res.json({ success: true, data });
});
export const deleteOfflineContent = asyncHandler(async (req, res) => {
  await service.deleteOfflineService(req.params.id, req.user._id);
  res.json({ success: true, message: "Removed" });
});
