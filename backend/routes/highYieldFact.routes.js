import express from "express";
import * as controller from "../controllers/highYieldFact.controller.js";

const router = express.Router();

router.post("/", controller.createFact);
router.post("/generate-auto",controller.generateAutoFacts);
router.get("/", controller.getFacts);
router.get("/exam-booster", controller.getExamBooster);
router.get("/daily", controller.getDailyFacts);

// 🔥 ADD THIS (UPDATE)
router.put("/:id", controller.updateFact);

// 🔥 OPTIONAL (DELETE)
router.delete("/:id", controller.deleteFact);

export default router;