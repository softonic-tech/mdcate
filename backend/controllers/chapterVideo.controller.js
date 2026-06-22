import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/chapterVideo.service.js";
import { createSignedS3Url } from "../utils/s3SignedUrl.js";

export const createChapterVideo = asyncHandler(async (req, res) => {
  const video = await service.createChapterVideoService(req.body);
  res.status(201).json({ success: true, data: video });
});

export const getChapterVideos = asyncHandler(async (req, res) => {
  const isAdmin = req.user?.role === "admin";
  const result = await service.getChapterVideosService(req.query, {
    includeUnpublished: isAdmin && req.query.includeUnpublished === "true",
  });
  res.json({ success: true, ...result });
});

export const getChapterVideo = asyncHandler(async (req, res) => {
  const isAdmin = req.user?.role === "admin";
  const video = await service.getChapterVideoByIdService(req.params.id, {
    includeUnpublished: isAdmin,
  });
  res.json({ success: true, data: video });
});

export const watchChapterVideo = asyncHandler(async (req, res) => {
  const video = await service.getChapterVideoByIdService(req.params.id);
  const streamUrl = await createSignedS3Url(video.videoUrl, {
    expiresIn: 3600,
    disposition: `inline; filename="${encodeURIComponent(video.title)}.mp4"`,
  });

  res.json({
    success: true,
    data: {
      streamUrl,
      title: video.title,
      expiresIn: 3600,
    },
  });
});

export const updateChapterVideo = asyncHandler(async (req, res) => {
  const video = await service.updateChapterVideoService(req.params.id, req.body);
  res.json({ success: true, data: video });
});

export const deleteChapterVideo = asyncHandler(async (req, res) => {
  await service.deleteChapterVideoService(req.params.id);
  res.json({ success: true, message: "Chapter video deleted" });
});
