import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import * as ctrl from "../controllers/contactMessage.controller.js";

const router = express.Router();
router.post("/", protect, ctrl.createContactMessage);
router.get("/messages", protect, ctrl.getContactMessages);
router.put("/:id/respond", protect, isAdmin, ctrl.updateContactMessage);
router.delete("/:id", protect, isAdmin, ctrl.deleteContactMessage);

export default router;
