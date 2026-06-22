import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import { uploadMcqFile } from "../middlewares/uploadMcq.middleware.js";
import * as ctrl from "../controllers/question.controller.js";

const router = express.Router();
router.get("/", ctrl.getQuestions);
router.get("/random", ctrl.getRandomQuestions);
router.get("/:id", ctrl.getQuestion);
router.post("/", protect, isAdmin, ctrl.createQuestion);
router.post("/bulk", protect, isAdmin, ctrl.bulkCreateQuestions);
router.post("/import/preview", protect, isAdmin, uploadMcqFile, ctrl.previewMcqImport);
router.post("/import/confirm", protect, isAdmin, ctrl.confirmMcqImport);
router.put("/:id", protect, isAdmin, ctrl.updateQuestion);
router.delete("/:id", protect, isAdmin, ctrl.deleteQuestion);

export default router;
