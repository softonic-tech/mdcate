import { consumeFromQueue, QUEUES } from "../config/rabbitmq.config.js";
import { checkAndAwardBadges } from "../services/badge.service.js";

export const startBadgeWorker = async () => {
  await consumeFromQueue(QUEUES.BADGE_CHECK, async (data) => {
    const { userId, event, ...eventData } = data;
    await checkAndAwardBadges(userId, event, eventData);
  });

  console.log("Badge worker started");
};
