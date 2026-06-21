import CounselingParticipant from "../models/counselingParticipant.model.js";
import CounselingSession from "../models/counselingSession.model.js";
import ApiError from "../utils/ApiError.js";

export const joinSession = async (sessionId, userId) => {
  const session = await CounselingSession.findById(sessionId);
  if (!session) throw ApiError.notFound("Session does not exist");

  const participantCount = await CounselingParticipant.countDocuments({ sessionId });
  if (session.maxParticipants && participantCount >= session.maxParticipants) {
    throw ApiError.badRequest("Session is full");
  }

  const existing = await CounselingParticipant.findOne({ sessionId, userId });
  if (existing) return existing;

  return CounselingParticipant.create({ sessionId, userId });
};

export const leaveSession = async (sessionId, userId) => {
  const result = await CounselingParticipant.findOneAndDelete({ sessionId, userId });
  if (!result) throw ApiError.notFound("You are not in this session");
  return result;
};

export const getParticipantsBySession = async (sessionId) => {
  return CounselingParticipant.find({ sessionId })
    .populate("userId", "username email profilePicture");
};
