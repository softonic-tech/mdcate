import { emitToUser } from "../websocket/socket.js";
import { getUnreadCountService } from "../services/notification.service.js";

/** Recompute unread count and push to the user's socket room. */
export async function pushUnreadCount(userId) {
  if (!userId) return 0;
  const count = await getUnreadCountService(userId);
  emitToUser(String(userId), "unread-count", count);
  return count;
}
