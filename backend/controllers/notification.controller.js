import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/notification.service.js";
import { pushUnreadCount } from "../utils/pushUnreadCount.js";

// Admin-only
export const createNotification = asyncHandler(async (req, res) => {
  const data = await service.createNotificationService(req.body);
  res.status(201).json({ success: true, data });
});

export const updateNotification = asyncHandler(async (req, res) => {
  const data = await service.updateNotificationService(req.params.id, req.body);
  res.json({ success: true, data });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  await service.deleteNotificationService(req.params.id);
  res.json({ success: true, message: "Notification deleted" });
});

export const getAllNotifications = asyncHandler(async (req, res) => {
  const data = await service.getNotificationsService(
    req.user._id,
    req.query
  );

  res.json({
    success: true,
    data
  });
});

export const getNotificationById = asyncHandler(async (req, res) => {
  const data = await service.getNotificationByIdService(req.params.id);
  res.json({ success: true, data });
});

// User-only
export const markAsRead = asyncHandler(async (req, res) => {
  const data = await service.markAsReadService(req.user._id, req.params.id);
  const count = await pushUnreadCount(req.user._id);
  res.json({ success: true, data, unreadCount: count });
});

export const markAsUnread = asyncHandler(async (req, res) => {
  const data = await service.markAsUnreadService(req.user._id, req.params.id);
  const count = await pushUnreadCount(req.user._id);
  res.json({ success: true, data, unreadCount: count });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await service.markAllAsReadService(req.user._id);
  const count = await pushUnreadCount(req.user._id);
  res.json({ success: true, message: "All notifications marked as read", unreadCount: count });
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "User not authenticated" });
  }
  const count = await service.getUnreadCountService(req.user._id);
  res.json({ success: true, data: { count } });
});