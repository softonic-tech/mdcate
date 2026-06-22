import { consumeFromQueue, QUEUES } from "../config/rabbitmq.config.js";
import { processVideoJob } from "../services/videoProcessing.service.js";

export const startVideoWorker = async () => {
  await consumeFromQueue(QUEUES.VIDEO_PROCESS, async (data) => {
    const { videoId, url, userId } = data;

    try {
      await processVideoJob({ videoId, url, userId });
    } catch {
      // processVideoJob already logs the full error before rethrowing
    }
  });

  console.log("Video processing worker started");
};
