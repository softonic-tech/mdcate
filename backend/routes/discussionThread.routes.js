import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import * as ctrl from "../controllers/discussionThread.controller.js";

const router = express.Router();
router.use(protect);
router.post("/", ctrl.createThread);
router.get("/", ctrl.getThreads);
router.get("/:id", ctrl.getThread);
router.delete("/:id", ctrl.deleteThread);

export default router;
