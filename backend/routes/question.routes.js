import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import * as ctrl from "../controllers/question.controller.js";

const router = express.Router();
router.get("/", ctrl.getQuestions);
router.get("/random", ctrl.getRandomQuestions);
router.get("/:id", ctrl.getQuestion);
router.post("/", protect, isAdmin, ctrl.createQuestion);
router.post("/bulk", protect, isAdmin, ctrl.bulkCreateQuestions);
router.put("/:id", protect, isAdmin, ctrl.updateQuestion);
router.delete("/:id", protect, isAdmin, ctrl.deleteQuestion);

export default router;
