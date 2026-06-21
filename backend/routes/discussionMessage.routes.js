import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { uploadVoice } from "../middlewares/voiceUpload.middleware.js";
import * as ctrl from "../controllers/discussionMessage.controller.js";

const router = express.Router();
router.use(protect);
router.post("/text", ctrl.createTextMessage);
router.post("/voice", uploadVoice.single("voice"), ctrl.createVoiceMessage);
router.get("/:threadId", ctrl.getMessages);
router.delete("/:id", ctrl.deleteMessage);

export default router;
