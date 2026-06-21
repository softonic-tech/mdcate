import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import * as ctrl from "../controllers/syncLog.controller.js";

const router = express.Router();
router.use(protect);
router.post("/", ctrl.createSyncLog);
router.get("/", ctrl.getUserSyncLogs);

export default router;
