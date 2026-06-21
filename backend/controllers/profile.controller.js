import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import * as profileService from "../services/profile.service.js";

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.getUserProfile(req.user._id);
  if (!profile) throw ApiError.notFound("User not found");
  res.status(200).json({ success: true, data: profile });
});

export const uploadProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest("No file uploaded");
  const url = await profileService.saveProfilePicture(req.user._id, req.file.buffer, req.file.mimetype);
  res.status(200).json({ success: true, data: { profilePicture: url } });
});

export const updateProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest("No file uploaded");
  const url = await profileService.updateProfilePictureService(req.user._id, req.file.buffer, req.file.mimetype);
  res.status(200).json({ success: true, data: { profilePicture: url } });
});

export const deleteProfilePicture = asyncHandler(async (req, res) => {
  await profileService.deleteProfilePictureService(req.user._id);
  res.status(200).json({ success: true, message: "Profile picture deleted" });
});
