import API from "./client.js";

// Full leaderboard (limit=0 returns all players)
export const getTopLeaderboard = (limit = 0) =>
  API.get("/leaderboard/top", { params: { limit } });

// My Rank
export const getMyRank = () =>
  API.get("/leaderboard/user");