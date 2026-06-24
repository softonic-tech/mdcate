import express from "express";

import {
  protect,
  optionalAuth,
} from "../middlewares/auth.middleware.js";
import { requireActiveSubscription } from "../middlewares/subscription.middleware.js";

import * as ctrl from "../controllers/notes.controller.js";

import {
  uploadNotesFiles,
} from "../middlewares/uploadNotes.middleware.js";

const router = express.Router();

router.get("/", optionalAuth, ctrl.getNotes);

router.get("/me", protect, requireActiveSubscription, ctrl.getMyNotes);

router.get("/:id", optionalAuth, ctrl.getNote);

router.post(
  "/",
  protect,
  requireActiveSubscription,
  uploadNotesFiles,
  ctrl.createNote
);

router.put(
  "/:id",
  protect,
  requireActiveSubscription,
  uploadNotesFiles,
  ctrl.updateNote
);

router.delete("/:id", protect, requireActiveSubscription, ctrl.deleteNote);

export default router;