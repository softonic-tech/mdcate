import express from "express";
import {
  createContactMessage,
  getContactMessages,
  updateContactMessage,
  deleteContactMessage
} from "../controllers/contactMessage.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";

const router = express.Router();

// User sends a message
router.post("/", protect, createContactMessage);

// Get messages (user sees own, admin sees all)
router.get("/messages", protect, getContactMessages);

// Admin responds / updates message status
router.put("/:id/respond", protect, isAdmin, updateContactMessage);

// Admin deletes a message
router.delete("/:id", protect, isAdmin, deleteContactMessage);

export default router;