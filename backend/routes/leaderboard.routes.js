import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import * as ctrl from "../controllers/leaderboard.controller.js";

const router = express.Router();
router.get("/top", ctrl.getTopLeaderboard);
router.get("/me", protect, ctrl.getMyRank);

export default router;
