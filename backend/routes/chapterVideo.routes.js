import express from "express";
import { protect, optionalAuth } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import * as ctrl from "../controllers/chapterVideo.controller.js";

const router = express.Router();

router.get("/", optionalAuth, ctrl.getChapterVideos);
router.get("/:id/watch", ctrl.watchChapterVideo);
router.get("/:id", optionalAuth, ctrl.getChapterVideo);
router.post("/", protect, isAdmin, ctrl.createChapterVideo);
router.put("/:id", protect, isAdmin, ctrl.updateChapterVideo);
router.delete("/:id", protect, isAdmin, ctrl.deleteChapterVideo);

export default router;
