import asyncHandler from "../utils/asyncHandler.js";
import {
  getPublicPaymentSettingsService,
  updatePaymentSettingsService,
} from "../services/paymentSettings.service.js";

export const getPublicPaymentSettings = asyncHandler(async (_req, res) => {
  const settings = await getPublicPaymentSettingsService();
  res.json({ success: true, data: settings });
});

export const updatePaymentSettings = asyncHandler(async (req, res) => {
  const settings = await updatePaymentSettingsService(req.body);
  res.json({ success: true, data: settings });
});
