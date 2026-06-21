import ChallengeAttempt from "../models/challengeAttempt.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import { publishToQueue, QUEUES } from "../config/rabbitmq.config.js";

export const createChallengeAttempt = async ({
  userId,
  challengeId,
  score = 0,
}) => {
  const existing = await ChallengeAttempt.findOne({
    userId,
    challengeId,
  });

  if (existing) {
    throw ApiError.conflict("You already attempted this challenge");
  }

  const attempt = await ChallengeAttempt.create({
    userId,
    challengeId,
    score,
    completedAt: new Date(),
  });

  await User.findByIdAndUpdate(userId, {
    $inc: { points: score },
  });

  return attempt;
};

export const getAllAttempts = async () => {
  return ChallengeAttempt.find()
    .populate("userId", "username email")
    .populate("challengeId", "title points")
    .sort({ completedAt: -1 });
};

export const getUserAttempts = async (userId) => {
  return ChallengeAttempt.find({ userId })
    .populate("challengeId", "title points type")
    .sort({ completedAt: -1 });
};
