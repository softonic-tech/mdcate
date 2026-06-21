import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/contactMessage.service.js";

export const createContactMessage = asyncHandler(async (req, res) => {
  const data = await service.createMessage({ userId: req.user._id, ...req.body });
  res.status(201).json({ success: true, data });
});
export const getContactMessages = asyncHandler(async (req, res) => {
  const data = await service.getMessages(req.user._id, req.user.role === "admin");
  res.json({ success: true, data });
});
export const updateContactMessage = asyncHandler(async (req, res) => {
  const data = await service.updateMessageStatus(req.params.id, req.body.status, req.body.response);
  res.json({ success: true, data });
});
export const deleteContactMessage = asyncHandler(async (req, res) => {
  await service.deleteMessage(req.params.id);
  res.json({ success: true, message: "Message deleted" });
});
