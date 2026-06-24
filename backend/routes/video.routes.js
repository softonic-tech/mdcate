import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import { requireActiveSubscription } from "../middlewares/subscription.middleware.js";
import * as ctrl from "../controllers/video.controller.js";

const router = express.Router();
router.get("/", protect, requireActiveSubscription, ctrl.getVideos);
router.get("/:id", protect, requireActiveSubscription, ctrl.getVideo);
router.post("/", protect, requireActiveSubscription, ctrl.createVideo);
router.post("/:id/reprocess", protect, requireActiveSubscription, ctrl.reprocessVideo);
router.put("/:id", protect, isAdmin, ctrl.updateVideo);
router.delete("/:id", protect, isAdmin, ctrl.deleteVideo);

export default router;
