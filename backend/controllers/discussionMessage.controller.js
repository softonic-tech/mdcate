import asyncHandler from "../utils/asyncHandler.js";
import cloudinary from "../config/cloudinary.js";
import * as service from "../services/discussionMessage.service.js";

export const createTextMessage = asyncHandler(async (req, res) => {
  const data = await service.createTextMessageService({ ...req.body, userId: req.user._id });
  res.status(201).json({ success: true, data });
});
export const createVoiceMessage = asyncHandler(async (req, res) => {
  if (!req.file) throw new Error("Voice file required");
  const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "voice_messages",
    resource_type: "video",
  });
  const data = await service.createVoiceMessageService({
    threadId: req.body.threadId,
    userId: req.user._id,
    audioUrl: result.secure_url,
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
