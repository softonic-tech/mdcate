import express from "express";
import {
  getTopLeaderboard,
  getMyRank,
} from "../controllers/leaderboard.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/top", getTopLeaderboard);
router.get("/user", protect, getMyRank);

export default router;