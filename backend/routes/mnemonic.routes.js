import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import * as ctrl from "../controllers/mnemonic.controller.js";

const router = express.Router();
router.get("/", ctrl.getMnemonics);
router.get("/:id", ctrl.getMnemonic);
router.post("/", protect, ctrl.createMnemonic);
router.put("/:id", protect, isAdmin, ctrl.updateMnemonic);
router.delete("/:id", protect, isAdmin, ctrl.deleteMnemonic);

export default router;
