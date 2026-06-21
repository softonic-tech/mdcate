import express from "express";
import * as counselingCtrl from "../controllers/counselingSession.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";

const router = express.Router();

// Public
router.get("/sessions", counselingCtrl.getAllSessions);
router.get("/:id", counselingCtrl.getSessionById);

// Admin
router.post("/admin/counseling", protect, isAdmin, counselingCtrl.createSession);
router.put("/admin/counseling/:id", protect, isAdmin, counselingCtrl.updateSession);
router.delete("/admin/counseling/:id", protect, isAdmin, counselingCtrl.deleteSession);

// // Student join/leave
// router.post("/:id/join", protect, counselingCtrl.joinSession);
// router.post("/:id/leave", protect, counselingCtrl.leaveSession);

export default router;