import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import * as ctrl from "../controllers/testAttempt.controller.js";

const router = express.Router();
router.post("/", protect, ctrl.createAttempt);
router.get("/me", protect, ctrl.getUserAttempts);
router.get("/:id", protect, ctrl.getAttempt);
router.get("/", protect, isAdmin, ctrl.getAttempts);
router.delete("/:id", protect, isAdmin, ctrl.deleteAttempt);

export default router;
