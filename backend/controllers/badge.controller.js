import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/badge.service.js";

export const createBadge = asyncHandler(async (req, res) => {
  const badge = await service.createBadgeService(req.body);
  res.status(201).json({ success: true, data: badge });
});

export const getBadges = asyncHandler(async (req, res) => {
  const badges = await service.getBadgesService();
  res.json({ success: true, count: badges.length, data: badges });
});

export const getBadge = asyncHandler(async (req, res) => {
  const badge = await service.getBadgeByIdService(req.params.id);
  res.json({ success: true, data: badge });
});

export const updateBadge = asyncHandler(async (req, res) => {
  const badge = await service.updateBadgeService(req.params.id, req.body);
  res.json({ success: true, data: badge });
});

export const deleteBadge = asyncHandler(async (req, res) => {
  await service.deleteBadgeService(req.params.id);
  res.json({ success: true, message: "Badge deleted" });
});
