import api from "./client";

export const getNotifications = () =>
  api.get("/notifications");
export const markNotificationAsRead = (id) =>
  api.patch(`/notifications/${id}/read`);
// ✅ New function for marking as unread
export const markNotificationAsUnread = (id) =>
  api.patch(`/notifications/${id}/unread`);
export const markAllAsRead = () =>
  api.patch("/notifications/read-all");

export const deleteNotification = (id) =>
  api.delete(`/notifications/${id}`);

export const getUnreadCount = async () => {
  return api.get("/notifications/unread-count");
};