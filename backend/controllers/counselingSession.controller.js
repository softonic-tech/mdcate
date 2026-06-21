import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/counselingSession.service.js";

export const getAllSessions = asyncHandler(async (req, res) => {
  const data = await service.getAllSessions();
  res.json({ success: true, count: data.length, data });
});
export const getSession = asyncHandler(async (req, res) => {
  const data = await service.getSessionById(req.params.id);
  res.json({ success: true, data });
});
export const createSession = asyncHandler(async (req, res) => {
  const data = await service.createSession(req.body);
  res.status(201).json({ success: true, data });
});
export const updateSession = asyncHandler(async (req, res) => {
  const data = await service.updateSession(req.params.id, req.body);
  res.json({ success: true, data });
});
export const deleteSession = asyncHandler(async (req, res) => {
  await service.deleteSession(req.params.id);
  res.json({ success: true, message: "Session deleted" });
});
