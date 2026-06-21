import express from "express";
import {
  joinSession,
  leaveSession,
  getAllParticipants,
} from "../controllers/counselingParticipant.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// POST /api/v1/counseling-participants/:id/join
router.post("/:id/join", protect, joinSession);

// POST /api/v1/counseling-participants/:id/leave
router.post("/:id/leave", protect, leaveSession);

// GET /api/v1/counseling-participants/:id
router.get("/:id", protect, getAllParticipants); // maybe admin only if needed

export default router;