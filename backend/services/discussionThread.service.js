import DiscussionThread from "../models/discussionThread.model.js";
import ApiError from "../utils/ApiError.js";

export const createThreadService = async (data) => {
  return DiscussionThread.create(data);
};

export const getThreadsService = async (filters) => {
  const query = {};
  if (filters.subjectId) query.subjectId = filters.subjectId;

  return DiscussionThread.find(query)
    .populate("createdBy", "username profilePicture")
    .populate("subjectId", "name board")
    .sort({ lastMessageAt: -1 });
};

export const getThreadByIdService = async (id) => {
  const thread = await DiscussionThread.findById(id)
    .populate("createdBy", "username")
    .populate("subjectId", "name");
  if (!thread) throw ApiError.notFound("Thread not found");
  return thread;
};

export const deleteThreadService = async (id, userId) => {
  const thread = await DiscussionThread.findOneAndDelete({
    _id: id,
    createdBy: userId,
  });
  if (!thread) throw ApiError.notFound("Thread not found or unauthorized");
};
