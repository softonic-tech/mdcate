import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/video.service.js";

export const createVideo = asyncHandler(async (req, res) => {
  const video = await service.createVideoService({ ...req.body, userId: req.user._id });
  res.status(201).json({ success: true, data: video });
});
export const getVideos = asyncHandler(async (req, res) => {
  const data = await service.getVideosService(req.query);
  res.json({ success: true, count: data.length, data });
});
export const getVideo = asyncHandler(async (req, res) => {
  const data = await service.getVideoByIdService(req.params.id);
  res.json({ success: true, data });
});
export const updateVideo = asyncHandler(async (req, res) => {
  const data = await service.updateVideoService(req.params.id, req.body);
  res.json({ success: true, data });
});
export const deleteVideo = asyncHandler(async (req, res) => {
  await service.deleteVideoService(req.params.id);
  res.json({ success: true, message: "Video deleted" });
});
