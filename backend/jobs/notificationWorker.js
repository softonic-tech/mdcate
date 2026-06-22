import { consumeFromQueue, QUEUES } from "../config/rabbitmq.config.js";
import Notification from "../models/notification.model.js";
import { emitToUser } from "../websocket/socket.js";
import { pushUnreadCount } from "../utils/pushUnreadCount.js";

export const startNotificationWorker = async () => {
  await consumeFromQueue(QUEUES.NOTIFICATION, async (data) => {
    const { userId, type, title, message, metadata } = data;

    const notification = await Notification.create({
      userId,
      type: type || "system",
      title: title || "Notification",
      message,
      metadata: metadata || {},
    });

    emitToUser(userId, "notification:new", notification);
    await pushUnreadCount(userId);
  });

  console.log("Notification worker started");
};
