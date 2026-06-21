import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/mnemonic.service.js";

export const createMnemonic = asyncHandler(async (req, res) => {
  const data = await service.createMnemonic({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, data });
});
export const getMnemonics = asyncHandler(async (req, res) => {
  const data = await service.getAllMnemonics(req.query);
  res.json({ success: true, count: data.length, data });
});
export const getMnemonic = asyncHandler(async (req, res) => {
  const data = await service.getMnemonicById(req.params.id);
  res.json({ success: true, data });
});
export const updateMnemonic = asyncHandler(async (req, res) => {
  const data = await service.updateMnemonic(req.params.id, req.body);
  res.json({ success: true, data });
});
export const deleteMnemonic = asyncHandler(async (req, res) => {
  await service.deleteMnemonic(req.params.id);
  res.json({ success: true, message: "Mnemonic deleted" });
});
