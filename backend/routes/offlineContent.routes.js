import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import * as ctrl from "../controllers/offlineContent.controller.js";

const router = express.Router();
router.use(protect);
router.post("/download", ctrl.downloadContent);
router.get("/", ctrl.getOfflineContent);
router.delete("/:id", ctrl.deleteOfflineContent);

export default router;
