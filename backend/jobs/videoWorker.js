import { consumeFromQueue, QUEUES } from "../config/rabbitmq.config.js";
import Video from "../models/video.model.js";
import { emitToUser } from "../websocket/socket.js";

export const startVideoWorker = async () => {
  await consumeFromQueue(QUEUES.VIDEO_PROCESS, async (data) => {
    const { videoId, url, userId } = data;

    try {
      await Video.findByIdAndUpdate(videoId, { status: "processing" });

      // Placeholder for actual AI video processing integration
      // In production, this would call an AI service to generate:
      // - Summary
      // - Key points
      // - Flashcards
      // - MCQs
      await Video.findByIdAndUpdate(videoId, {
        status: "completed",
        summary: "Video processing complete. Connect AI service for actual summaries.",
        keyPoints: ["Connect AI video summarization service to enable this feature"],
      });

      if (userId) {
        emitToUser(userId, "video:processed", { videoId, status: "completed" });
      }
    } catch (error) {
      await Video.findByIdAndUpdate(videoId, { status: "failed" });

      if (userId) {
        emitToUser(userId, "video:processed", { videoId, status: "failed" });
      }
    }
  });

  console.log("Video processing worker started");
};
