import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import * as ctrl from "../controllers/challengeAttempt.controller.js";

const router = express.Router();
router.post("/", protect, ctrl.createChallengeAttempt);
router.get("/me", protect, ctrl.getUserAttempts);
router.get("/all", protect, isAdmin, ctrl.getAllAttempts);

export default router;
