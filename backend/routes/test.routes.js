import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import * as ctrl from "../controllers/test.controller.js";

const router = express.Router();
router.get("/", ctrl.getTests);
router.get("/:id", ctrl.getTest);
router.post("/", protect, isAdmin, ctrl.createTest);
router.post("/adaptive", protect, ctrl.generateAdaptiveTest);
router.put("/:id", protect, isAdmin, ctrl.updateTest);
router.delete("/:id", protect, isAdmin, ctrl.deleteTest);

export default router;
