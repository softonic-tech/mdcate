import asyncHandler from "../utils/asyncHandler.js";
import { getLandingStatsService } from "../services/publicLanding.service.js";

export const getLandingStats = asyncHandler(async (_req, res) => {
  const data = await getLandingStatsService();
  res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
  res.json({ success: true, data });
});
