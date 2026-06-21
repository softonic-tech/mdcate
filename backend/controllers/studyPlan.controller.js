import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/studyPlan.service.js";

// CREATE
export const createStudyPlan = asyncHandler(async (req, res) => {
  const plan = await service.createStudyPlanService(req.user._id, req.body);

  res.status(201).json({
    success: true,
    data: plan,
  });
});

// GET
export const getStudyPlan = asyncHandler(async (req, res) => {
  const plans = await service.getMyStudyPlansService(req.user._id);

  res.json({
    success: true,
    data: plans,
  });
});

// UPDATE
export const updateStudyPlan = asyncHandler(async (req, res) => {
  const plan = await service.updateStudyPlan(
    req.user._id,
    req.params.id,
    req.body
  );

  res.json({
    success: true,
    data: plan,
  });
});

// DELETE
export const deleteStudyPlan = asyncHandler(async (req, res) => {
  await service.deleteStudyPlan(req.user._id, req.params.id);

  res.json({
    success: true,
    message: "Study plan deleted",
  });
});