import asyncHandler from "../utils/asyncHandler.js";
import * as userService from "../services/user.service.js";

export const getBio = asyncHandler(async (req, res) => {
  const bio = await userService.getBioService(req.user.id);
  res.status(200).json({ success: true, data: { bio } });
});

export const updateBio = asyncHandler(async (req, res) => {
  const bio = await userService.updateBioService(req.user.id, req.body.bio);
  res.status(200).json({ success: true, data: { bio } });
});

export const deleteBio = asyncHandler(async (req, res) => {
  await userService.deleteBioService(req.user.id);
  res.status(200).json({ success: true, message: "Bio deleted" });
});

export const getAcademic = asyncHandler(async (req, res) => {
  const academic = await userService.getAcademicService(req.user.id);
  res.status(200).json({ success: true, data: { academic } });
});

export const updateAcademic = asyncHandler(async (req, res) => {
  const academic = await userService.updateAcademicService(req.user.id, req.body);
  res.status(200).json({ success: true, data: { academic } });
});

export const deleteAcademic = asyncHandler(async (req, res) => {
  await userService.deleteAcademicService(req.user.id);
  res.status(200).json({ success: true, message: "Academic info deleted" });
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsersService(req.query);
  res.status(200).json({ success: true, count: users.length, data: users });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const user = await userService.updateUserRoleService(req.params.id, req.body.role);
  res.status(200).json({ success: true, data: user });
});
