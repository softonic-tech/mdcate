import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import * as ctrl from "../controllers/flashcard.controller.js";

const router = express.Router();
router.use(protect);
router.get("/", ctrl.getFlashcards);
router.get("/due", ctrl.getDueFlashcards);
router.post("/", ctrl.createFlashcard);
router.get("/:id", ctrl.getFlashcard);
router.put("/:id", ctrl.updateFlashcard);
router.post("/:id/review", ctrl.reviewFlashcard);
router.delete("/:id", ctrl.deleteFlashcard);

export default router;
