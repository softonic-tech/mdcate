import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import * as ctrl from "../controllers/examCountdown.controller.js";

const router = express.Router();
router.get("/", protect, ctrl.getExams);
router.post("/", protect, isAdmin, ctrl.createExam);
router.put("/:id", protect, isAdmin, ctrl.updateExam);
router.delete("/:id", protect, isAdmin, ctrl.deleteExam);

export default router;
