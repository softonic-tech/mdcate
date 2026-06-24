import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/leaderboard.service.js";

export const getTopLeaderboard = asyncHandler(async (req, res) => {
  const limitParam = req.query.limit;
  const limit =
    limitParam === undefined || limitParam === ""
      ? 10
      : Number(limitParam);
  const data = await service.getTopUsers(limit);
  res.json({ success: true, count: data.length, data });
});
export const getMyRank = asyncHandler(async (req, res) => {
  const data = await service.getUserRank(req.user._id);
  res.json({ success: true, data });
});
