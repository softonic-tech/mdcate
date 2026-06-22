import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import * as ctrl from "../controllers/video.controller.js";

const router = express.Router();
router.get("/", protect, ctrl.getVideos);
router.get("/:id", protect, ctrl.getVideo);
router.post("/", protect, ctrl.createVideo);
router.post("/:id/reprocess", protect, ctrl.reprocessVideo);
router.put("/:id", protect, isAdmin, ctrl.updateVideo);
router.delete("/:id", protect, isAdmin, ctrl.deleteVideo);

export default router;
