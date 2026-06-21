import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/counselingParticipant.service.js";

export const joinSession = asyncHandler(async (req, res) => {
  const data = await service.joinSession(req.params.id, req.user._id);
  res.json({ success: true, message: "Joined session", data });
});
export const leaveSession = asyncHandler(async (req, res) => {
  await service.leaveSession(req.params.id, req.user._id);
  res.json({ success: true, message: "Left session" });
});
export const getParticipants = asyncHandler(async (req, res) => {
  const data = await service.getParticipantsBySession(req.params.id);
  res.json({ success: true, count: data.length, data });
});
