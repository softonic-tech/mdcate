import Badge from "../models/badge.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import { publishToQueue, QUEUES } from "../config/rabbitmq.config.js";

export const createBadgeService = async (data) => {
  const exists = await Badge.findOne({ name: data.name });
  if (exists) throw ApiError.conflict("Badge already exists");
  return Badge.create(data);
};

export const getBadgesService = async () => {
  return Badge.find().sort({ createdAt: -1 });
};

export const getBadgeByIdService = async (id) => {
  const badge = await Badge.findById(id);
  if (!badge) throw ApiError.notFound("Badge not found");
  return badge;
};

export const updateBadgeService = async (id, data) => {
  const badge = await Badge.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!badge) throw ApiError.notFound("Badge not found");
  return badge;
};

export const deleteBadgeService = async (id) => {
  const badge = await Badge.findByIdAndDelete(id);
  if (!badge) throw ApiError.notFound("Badge not found");
};

export const checkAndAwardBadges = async (userId, event, eventData = {}) => {
  const user = await User.findById(userId);
  if (!user) return;

  const allBadges = await Badge.find();
  const userBadgeIds = user.badges.map((b) => b.toString());

  for (const badge of allBadges) {
    if (userBadgeIds.includes(badge._id.toString())) continue;

    let earned = false;

    switch (badge.criteria.type) {
      case "login_streak":
        if (event === "daily_login" && eventData.streak >= badge.criteria.value) {
          earned = true;
        }
        break;
      case "quiz_completion":
        if (event === "quiz_completion") {
          const TestAttempt = (await import("../models/testAttempt.model.js")).default;
          const attemptCount = await TestAttempt.countDocuments({ userId });
          if (attemptCount >= badge.criteria.value) earned = true;
        }
        break;
      case "high_score":
        if (
          event === "quiz_completion" &&
          eventData.totalQuestions > 0 &&
          eventData.score / eventData.totalQuestions >= badge.criteria.value / 100
        ) {
          earned = true;
        }
        break;
      case "points_threshold":
        if (user.points >= badge.criteria.value) earned = true;
        break;
    }

    if (earned) {
      user.badges.push(badge._id);
      publishToQueue(QUEUES.NOTIFICATION, {
        userId: userId.toString(),
        type: "achievement",
        title: "New Badge Earned",
        message: `You earned the "${badge.name}" badge! ${badge.description}`,
      });
    }
  }

  if (user.isModified("badges")) {
    await user.save({ validateBeforeSave: false });
  }
};
