import CounselingSession from "../models/counselingSession.model.js";
import ApiError from "../utils/ApiError.js";

export const createSession = async (data) => CounselingSession.create(data);

export const updateSession = async (id, data) => {
  const session = await CounselingSession.findByIdAndUpdate(id, data, { new: true });
  if (!session) throw ApiError.notFound("Session not found");
  return session;
};

export const deleteSession = async (id) => {
  const session = await CounselingSession.findByIdAndDelete(id);
  if (!session) throw ApiError.notFound("Session not found");
};

export const getAllSessions = async () =>
  CounselingSession.find({ isActive: true }).sort({ scheduledAt: 1 });

export const getSessionById = async (id) => {
  const session = await CounselingSession.findById(id);
  if (!session) throw ApiError.notFound("Session not found");
  return session;
};
