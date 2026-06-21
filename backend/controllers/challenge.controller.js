import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/challenge.service.js";

export const createChallenge = asyncHandler(async (req, res) => {
  const challenge = await service.createChallenge(req.body);
  res.status(201).json({ success: true, data: challenge });
});
export const getChallenges = asyncHandler(async (req, res) => {
  const data = await service.getChallenges(req.query);
  res.json({ success: true, count: data.length, data });
});
export const getChallenge = asyncHandler(async (req, res) => {
  const data = await service.getChallengeById(req.params.id);
  res.json({ success: true, data });
});
export const updateChallenge = asyncHandler(async (req, res) => {
  const data = await service.updateChallenge(req.params.id, req.body);
  res.json({ success: true, data });
});
export const deleteChallenge = asyncHandler(async (req, res) => {
  await service.deleteChallenge(req.params.id);
  res.json({ success: true, message: "Challenge deleted" });
});
