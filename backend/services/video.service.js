import Video from "../models/video.model.js";
import ApiError from "../utils/ApiError.js";
import { publishToQueue, QUEUES } from "../config/rabbitmq.config.js";

export const createVideoService = async (data) => {
  const video = await Video.create(data);

  publishToQueue(QUEUES.VIDEO_PROCESS, {
    videoId: video._id.toString(),
    url: video.url,
    userId: data.userId?.toString(),
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

export const getVideoByIdService = async (id) => {
  const video = await Video.findById(id)
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
