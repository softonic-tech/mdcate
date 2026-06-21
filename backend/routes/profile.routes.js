import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.js";
import * as ctrl from "../controllers/profile.controller.js";

const router = express.Router();

router.get("/", protect, ctrl.getProfile);
router.route("/pic")
  .post(protect, upload.single("profilePicture"), ctrl.uploadProfilePicture)
  .put(protect, upload.single("profilePicture"), ctrl.updateProfilePicture)
  .delete(protect, ctrl.deleteProfilePicture);

export default router;
