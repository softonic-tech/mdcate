import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import * as ctrl from "../controllers/challenge.controller.js";

const router = express.Router();
router.get("/", ctrl.getChallenges);
router.get("/:id", ctrl.getChallenge);
router.post("/", protect, isAdmin, ctrl.createChallenge);
router.put("/:id", protect, isAdmin, ctrl.updateChallenge);
router.delete("/:id", protect, isAdmin, ctrl.deleteChallenge);

export default router;
