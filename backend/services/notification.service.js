import Notification from "../models/notification.model.js";

// Admin-only
export const createNotificationService = async (data) => {
  return Notification.create({
    ...data,
    sourceType: data.sourceType || "manual",
  });
};
export const updateNotificationService = async (id, data) => {
  return Notification.findByIdAndUpdate(id, data, { new: true });
};

export const deleteNotificationService = async (id) => {
  return Notification.findByIdAndDelete(id);
};

export const getNotificationsService = async (userId, query = {}) => {
  const filter = {
    isDeleted: { $ne: true },
    $or: [{ userId }, { userId: null }],
  };

  // optional filter by type
  if (query.type) {
    filter.type = query.type;
  }

  return Notification.find(filter).sort({ createdAt: -1 });
};

// Get notification by ID
export const getNotificationByIdService = async (id) => {
  return Notification.findById(id);
};

// User actions
export const markAsReadService = async (userId, notifId) => {
  const notif = await Notification.findById(notifId);
  if (!notif) throw new Error("Notification not found");

  if (!notif.readBy.some(id => id.toString() === userId.toString())) {
    notif.readBy.push(userId);
    await notif.save();
  }

  return notif;
};

export const markAsUnreadService = async (userId, notifId) => {
  const notif = await Notification.findById(notifId);
  if (!notif) throw new Error("Notification not found");

  notif.readBy = notif.readBy.filter(
  id => id.toString() !== userId.toString()
);
  await notif.save();

  return notif;
};

export const markAllAsReadService = async (userId) => {
  return Notification.updateMany(
    {
      isDeleted: { $ne: true },
      $or: [{ userId: null }, { userId }],
      readBy: { $nin: [userId] },
    },
    {
      $addToSet: { readBy: userId },
    }
  );
};
// Get unread count for a user
export const getUnreadCountService = async (userId) => {
  return Notification.countDocuments({
    isDeleted: { $ne: true },
    $or: [{ userId: null }, { userId }],
    readBy: { $nin: [userId] },
  });
};