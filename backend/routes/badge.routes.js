import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import * as ctrl from "../controllers/badge.controller.js";

const router = express.Router();
router.get("/", ctrl.getBadges);
router.get("/:id", ctrl.getBadge);
router.post("/", protect, isAdmin, ctrl.createBadge);
router.put("/:id", protect, isAdmin, ctrl.updateBadge);
router.delete("/:id", protect, isAdmin, ctrl.deleteBadge);

export default router;
