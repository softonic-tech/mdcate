import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/highYieldFact.service.js";
import { generateAutoHighYield } from "../services/highYield.auto.service.js";

export const generateAutoFacts = asyncHandler(async (req, res) => {

  const data = await generateAutoHighYield();

  res.json({
    success: true,
    message: "Auto High Yield generated",
    count: data.length,
    data,
  });
});
export const createFact = asyncHandler(async (req, res) => {
  const data = await service.createFact(req.body);
  res.status(201).json({ success: true, data });
});

export const getFacts = asyncHandler(async (req, res) => {
  const data = await service.getFacts(req.query);
  res.json({ success: true, data });
});

export const getExamBooster = asyncHandler(async (req, res) => {
  const data = await service.getExamBoosterFacts();
  res.json({ success: true, data });
});

export const getDailyFacts = asyncHandler(async (req, res) => {
  const data = await service.getDailyFacts();
  res.json({ success: true, data });
});

export const updateFact = asyncHandler(async (req, res) => {
  const data = await service.updateFact(req.params.id, req.body);

  res.json({
    success: true,
    data,
  });
});

export const deleteFact = asyncHandler(async (req, res) => {
  await service.deleteFact(req.params.id);

  res.json({
    success: true,
    message: "Fact deleted successfully",
  });
});