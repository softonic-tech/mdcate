import User from "../models/user.model.js";

export const getTopUsers = async (limit = 10) => {
  const query = User.find()
    .select("username profilePicture points streak")
    .sort({ points: -1 });

  if (limit > 0) {
    query.limit(limit);
  }

  return query;
};

export const getUserRank = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;

  const higherUsers = await User.countDocuments({
    points: { $gt: user.points },
  });

  return {
    rank: higherUsers + 1,
    points: user.points,
    streak: user.streak,
  };
};
