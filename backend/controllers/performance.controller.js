import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/performance.service.js";

export const createPerformance = asyncHandler(async (req, res) => {
  const data = await service.createPerformanceService({ ...req.body, userId: req.user._id });
  res.status(201).json({ success: true, data });
});
export const getPerformances = asyncHandler(async (req, res) => {
  const data = await service.getPerformancesService();
  res.json({ success: true, data });
});
export const getUserPerformance = asyncHandler(async (req, res) => {
  const data = await service.getUserPerformanceService(req.user._id);
  res.json({ success: true, data });
});
export const getAnalytics = asyncHandler(async (req, res) => {
  const data = await service.getUserAnalyticsService(req.user._id);
  res.json({ success: true, data });
});
export const updatePerformance = asyncHandler(async (req, res) => {
  const data = await service.updatePerformanceService(req.params.id, req.body);
  res.json({ success: true, data });
});
export const deletePerformance = asyncHandler(async (req, res) => {
  await service.deletePerformanceService(req.params.id);
  res.json({ success: true, message: "Deleted" });
});
