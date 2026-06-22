import Video from "../models/video.model.js";
import { emitToUser } from "../websocket/socket.js";
import { getVideoContent } from "../utils/videoContent.util.js";
import { summarizeVideoTranscript } from "./videoAi.service.js";
import { toUserFriendlyVideoError, formatErrorForLog } from "../utils/videoError.util.js";

const notifyUser = (userId, payload) => {
  if (userId) {
    emitToUser(String(userId), "video:processed", payload);
  }
};

const updateStage = async (videoId, processingStage) => {
  await Video.findByIdAndUpdate(videoId, { processingStage });
};

export const processVideoJob = async ({ videoId, url, userId }) => {
  await Video.findByIdAndUpdate(videoId, {
    status: "processing",
    processingStage: "fetching_content",
    errorMessage: "",
  });

  try {
    const content = await getVideoContent(url, async (stage) => {
      await updateStage(videoId, stage);
    });

    await updateStage(videoId, "summarizing");

    const aiResult = await summarizeVideoTranscript({
      transcript: content.transcript,
      videoTitle: content.title,
    });

    const video = await Video.findByIdAndUpdate(
      videoId,
      {
        status: "completed",
        processingStage: "done",
        title: aiResult.title || content.title || "",
        summary: aiResult.summary,
        keyPoints: aiResult.keyPoints,
        aiFlashcards: aiResult.flashcards,
        aiQuestions: aiResult.questions,
        sourcePlatform: content.platform || "",
        contentMethod: content.method || "",
        errorMessage: "",
      },
      { new: true }
    );

    notifyUser(userId, { videoId, status: "completed" });
    return video;
  } catch (error) {
    const debugLog = formatErrorForLog(error);
    console.error(`Video processing failed for ${videoId}:\n${debugLog}`);
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }

    const friendlyMessage = toUserFriendlyVideoError(error);

    await Video.findByIdAndUpdate(videoId, {
      status: "failed",
      processingStage: "done",
      errorMessage: friendlyMessage,
    });

    notifyUser(userId, { videoId, status: "failed" });
    throw error;
  }
};
