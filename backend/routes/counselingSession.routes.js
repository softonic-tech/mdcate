import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import * as ctrl from "../controllers/counselingSession.controller.js";

const router = express.Router();
router.get("/", ctrl.getAllSessions);
router.get("/:id", ctrl.getSession);
router.post("/", protect, isAdmin, ctrl.createSession);
router.put("/:id", protect, isAdmin, ctrl.updateSession);
router.delete("/:id", protect, isAdmin, ctrl.deleteSession);

export default router;
