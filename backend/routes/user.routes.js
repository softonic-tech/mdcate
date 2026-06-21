import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import * as ctrl from "../controllers/user.controller.js";

const router = express.Router();

router.route("/bio").get(protect, ctrl.getBio).put(protect, ctrl.updateBio).delete(protect, ctrl.deleteBio);
router.route("/academic").get(protect, ctrl.getAcademic).put(protect, ctrl.updateAcademic).delete(protect, ctrl.deleteAcademic);
router.get("/all", protect, isAdmin, ctrl.getAllUsers);
router.put("/:id/role", protect, isAdmin, ctrl.updateUserRole);

export default router;
