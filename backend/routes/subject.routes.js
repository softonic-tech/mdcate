import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import * as ctrl from "../controllers/subject.controller.js";

const router = express.Router();
router.get("/", ctrl.getSubjects);
router.post("/", protect, isAdmin, ctrl.createSubject);
router.put("/:id", protect, isAdmin, ctrl.updateSubject);
router.delete("/:id", protect, isAdmin, ctrl.deleteSubject);

export default router;
