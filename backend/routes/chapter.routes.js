import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import * as ctrl from "../controllers/chapter.controller.js";

const router = express.Router();
router.get("/subject/:subjectId", ctrl.getChaptersBySubject);
router.post("/", protect, isAdmin, ctrl.createChapter);
router.put("/:id", protect, isAdmin, ctrl.updateChapter);
router.delete("/:id", protect, isAdmin, ctrl.deleteChapter);

export default router;
