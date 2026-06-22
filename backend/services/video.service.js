import Video from "../models/video.model.js";
import ApiError from "../utils/ApiError.js";
import { publishToQueue, QUEUES } from "../config/rabbitmq.config.js";
import { validateVideoUrl } from "../utils/videoUrl.util.js";
import { processVideoJob } from "./videoProcessing.service.js";

export const MAX_VIDEO_PROCESS_ATTEMPTS = 3;

const queueVideoProcessing = async ({ videoId, url, userId }) => {
  const queued = await publishToQueue(QUEUES.VIDEO_PROCESS, {
    videoId: videoId.toString(),
    url,
    userId: userId?.toString(),
  });

  if (!queued) {
    setImmediate(() => {
      processVideoJob({ videoId, url, userId }).catch(() => {
        // processVideoJob already logs the full error before rethrowing
      });
    });
  }
};

export const createVideoService = async (data) => {
  validateVideoUrl(data.url);

  const video = await Video.create({
    ...data,
    processingStage: "queued",
    attemptCount: 1,
  });

  await queueVideoProcessing({
    videoId: video._id,
    url: video.url,
    userId: data.userId,
  });

  return video;
};

export const getVideosService = async (filters = {}) => {
  const query = {};
  if (filters.userId) query.userId = filters.userId;
  if (filters.status) query.status = filters.status;

  return Video.find(query)
    .populate("questions", "text difficulty")
    .sort({ createdAt: -1 });
};

export const getVideoByIdService = async (id, userId) => {
  const query = { _id: id };
  if (userId) query.userId = userId;

  const video = await Video.findOne(query)
    .populate("questions")
    .populate("flashcards");

  if (!video) throw ApiError.notFound("Video not found");
  return video;
};

export const updateVideoService = async (id, data) => {
  const video = await Video.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!video) throw ApiError.notFound("Video not found");
  return video;
};

export const deleteVideoService = async (id) => {
  const video = await Video.findByIdAndDelete(id);
  if (!video) throw ApiError.notFound("Video not found");
};

export const reprocessVideoService = async (id, userId) => {
  const video = await Video.findOne({ _id: id, userId });
  if (!video) throw ApiError.notFound("Video not found");

  const attemptsUsed = video.attemptCount || 1;
  if (attemptsUsed >= MAX_VIDEO_PROCESS_ATTEMPTS) {
    throw ApiError.badRequest(
      `Maximum ${MAX_VIDEO_PROCESS_ATTEMPTS} processing attempts reached for this video.`
    );
  }

  await queueVideoProcessing({
    videoId: video._id,
    url: video.url,
    userId,
  });

  return Video.findByIdAndUpdate(
    video._id,
    {
      status: "pending",
      processingStage: "queued",
      errorMessage: "",
      attemptCount: attemptsUsed + 1,
    },
    { new: true }
  );
};
