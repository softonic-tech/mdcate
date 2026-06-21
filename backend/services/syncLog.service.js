import SyncLog from "../models/syncLog.model.js";

export const createSyncLog = async ({ userId, deviceId, dataType }) => {
  return SyncLog.create({ userId, deviceId, dataType });
};

export const getUserSyncLogs = async (userId) => {
  return SyncLog.find({ userId }).sort({ syncedAt: -1 });
};

export const getLatestSync = async (userId, dataType) => {
  return SyncLog.findOne({ userId, dataType }).sort({ syncedAt: -1 });
};
