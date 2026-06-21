import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import * as ctrl from "../controllers/studyPlan.controller.js";

const router = express.Router();

router.use(protect);

router.post("/", ctrl.createStudyPlan);
router.get("/", ctrl.getStudyPlan);
router.put("/:id", ctrl.updateStudyPlan);
router.delete("/:id", ctrl.deleteStudyPlan);

export default router;