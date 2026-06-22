import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { uploadToS3 } from "../utils/s3Upload.js";
import * as service from "../services/discussionMessage.service.js";

export const createTextMessage = asyncHandler(async (req, res) => {
  const data = await service.createTextMessageService({ ...req.body, userId: req.user._id });
  res.status(201).json({ success: true, data });
});

export const createVoiceMessage = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest("Voice file required");

  const audioUrl = await uploadToS3({
    buffer: req.file.buffer,
    mimetype: req.file.mimetype,
    keyPrefix: "voice_messages",
    filename: req.file.originalname || "voice.webm",
  });

  const data = await service.createVoiceMessageService({
    threadId: req.body.threadId,
    userId: req.user._id,
    audioUrl,
  });
  res.status(201).json({ success: true, data });
});

export const getMessages = asyncHandler(async (req, res) => {
  const data = await service.getMessagesService(req.params.threadId);
  res.json({ success: true, count: data.length, data });
});

export const deleteMessage = asyncHandler(async (req, res) => {
  await service.deleteMessageService(req.params.id, req.user._id);
  res.json({ success: true, message: "Message deleted" });
});
