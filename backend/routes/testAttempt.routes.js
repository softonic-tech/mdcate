import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import { requireActiveSubscription } from "../middlewares/subscription.middleware.js";
import * as ctrl from "../controllers/testAttempt.controller.js";

const router = express.Router();
router.post("/", protect, requireActiveSubscription, ctrl.createAttempt);
router.get("/me", protect, requireActiveSubscription, ctrl.getUserAttempts);
router.get("/:id", protect, requireActiveSubscription, ctrl.getAttempt);
router.get("/", protect, isAdmin, ctrl.getAttempts);
router.delete("/:id", protect, isAdmin, ctrl.deleteAttempt);

export default router;
