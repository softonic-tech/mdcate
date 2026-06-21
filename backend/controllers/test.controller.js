import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/test.service.js";

export const createTest = asyncHandler(async (req, res) => {
  const test = await service.createTestService(req.body);
  res.status(201).json({ success: true, data: test });
});

export const generateAdaptiveTest = asyncHandler(async (req, res) => {
  const test = await service.generateAdaptiveTestService({
    userId: req.user._id,
    subjectId: req.body.subjectId,
    count: req.body.count,
  });
  res.status(201).json({ success: true, data: test });
});

export const getTests = asyncHandler(async (req, res) => {
  const tests = await service.getTestsService(req.query);
  res.json({ success: true, count: tests.length, data: tests });
});

export const getTest = asyncHandler(async (req, res) => {
  const test = await service.getTestByIdService(req.params.id);
  res.json({ success: true, data: test });
});

export const updateTest = asyncHandler(async (req, res) => {
  const test = await service.updateTestService(req.params.id, req.body);
  res.json({ success: true, data: test });
});

export const deleteTest = asyncHandler(async (req, res) => {
  await service.deleteTestService(req.params.id);
  res.json({ success: true, message: "Test deleted" });
});
