import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import * as ctrl from "../controllers/performance.controller.js";

const router = express.Router();
router.use(protect);
router.get("/me", ctrl.getUserPerformance);
router.get("/analytics", ctrl.getAnalytics);
router.post("/", ctrl.createPerformance);
router.get("/", isAdmin, ctrl.getPerformances);
router.put("/:id", isAdmin, ctrl.updatePerformance);
router.delete("/:id", isAdmin, ctrl.deletePerformance);

export default router;
