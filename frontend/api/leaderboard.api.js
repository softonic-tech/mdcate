import API from "./client.js";

// Top 10
export const getTopLeaderboard = () =>
  API.get("/leaderboard/top");

// My Rank
export const getMyRank = () =>
  API.get("/leaderboard/user");