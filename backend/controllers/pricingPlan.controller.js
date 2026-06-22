import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/pricingPlan.service.js";

export const getPublicPlans = asyncHandler(async (_req, res) => {
  const plans = await service.getActivePlansService();
  res.json({ success: true, data: plans });
});

export const getAllPlans = asyncHandler(async (_req, res) => {
  const plans = await service.getAllPlansService();
  res.json({ success: true, data: plans });
});

export const getPlanById = asyncHandler(async (req, res) => {
  const plan = await service.getPlanByIdService(req.params.id);
  res.json({ success: true, data: plan });
});

export const createPlan = asyncHandler(async (req, res) => {
  const plan = await service.createPlanService(req.body);
  res.status(201).json({ success: true, data: plan });
});

export const updatePlan = asyncHandler(async (req, res) => {
  const plan = await service.updatePlanService(req.params.id, req.body);
  res.json({ success: true, data: plan });
});

export const deletePlan = asyncHandler(async (req, res) => {
  await service.deletePlanService(req.params.id);
  res.json({ success: true, message: "Plan deleted" });
});
