import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import * as ctrl from "../controllers/counselingParticipant.controller.js";

const router = express.Router();
router.post("/:id/join", protect, ctrl.joinSession);
router.post("/:id/leave", protect, ctrl.leaveSession);
router.get("/:id", protect, ctrl.getParticipants);

export default router;
