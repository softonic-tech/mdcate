import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/device.service.js";

export const registerDevice = asyncHandler(async (req, res) => {
  const data = await service.registerDeviceService({ userId: req.user._id, ...req.body });
  res.status(201).json({ success: true, data });
});
export const getUserDevices = asyncHandler(async (req, res) => {
  const data = await service.getUserDevicesService(req.user._id);
  res.json({ success: true, data });
});
export const removeDevice = asyncHandler(async (req, res) => {
  await service.removeDeviceService(req.params.id, req.user._id);
  res.json({ success: true, message: "Device removed" });
});
