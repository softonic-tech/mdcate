import DiscussionMessage from "../models/discussionMessage.model.js";
import DiscussionThread from "../models/discussionThread.model.js";
import ApiError from "../utils/ApiError.js";

export const createTextMessageService = async (data) => {
  const msg = await DiscussionMessage.create({ ...data, type: "text" });
  await DiscussionThread.findByIdAndUpdate(data.threadId, {
    $inc: { messageCount: 1 },
    lastMessageAt: new Date(),
  });
  return msg;
};

export const createVoiceMessageService = async (data) => {
  const msg = await DiscussionMessage.create({ ...data, type: "voice" });
  await DiscussionThread.findByIdAndUpdate(data.threadId, {
    $inc: { messageCount: 1 },
    lastMessageAt: new Date(),
  });
  return msg;
};

export const getMessagesService = async (threadId) => {
  return DiscussionMessage.find({ threadId })
    .populate("userId", "username profilePicture")
    .sort({ createdAt: 1 });
};

export const deleteMessageService = async (id, userId) => {
  const msg = await DiscussionMessage.findOneAndDelete({ _id: id, userId });
  if (!msg) throw ApiError.notFound("Message not found or unauthorized");

  await DiscussionThread.findByIdAndUpdate(msg.threadId, {
    $inc: { messageCount: -1 },
  });
};
