import OfflineContent from "../models/offlineContent.model.js";

export const downloadService = async (data) => {
  const exists = await OfflineContent.findOne({
    userId: data.userId,
    contentId: data.contentId,
  });
  if (exists) return exists;
  return OfflineContent.create(data);
};

export const getOfflineService = async (userId) => {
  return OfflineContent.find({ userId }).sort({ downloadedAt: -1 });
};

export const deleteOfflineService = async (id, userId) => {
  return OfflineContent.findOneAndDelete({ _id: id, userId });
};
