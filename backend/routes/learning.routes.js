import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireActiveSubscription } from "../middlewares/subscription.middleware.js";
import * as ctrl from "../controllers/learning.controller.js";

const router = express.Router();

router.use(protect, requireActiveSubscription);

router.get("/subjects", ctrl.getSubjectsOverview);
router.get("/subjects/:subjectId/chapters", ctrl.getChaptersOverview);
router.get("/chapters/:chapterId/sections", ctrl.getChapterSections);
router.put(
  "/chapters/:chapterId/sections/:sectionIndex/progress",
  ctrl.saveSectionProgress
);
router.post(
  "/chapters/:chapterId/sections/:sectionIndex/complete",
  ctrl.completeSection
);

export default router;
