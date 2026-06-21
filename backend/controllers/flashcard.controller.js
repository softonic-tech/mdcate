import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/flashcard.service.js";

export const createFlashcard = asyncHandler(async (req, res) => {
  const card = await service.createFlashcardService({ ...req.body, userId: req.user._id });
  res.status(201).json({ success: true, data: card });
});

export const getFlashcards = asyncHandler(async (req, res) => {
  const cards = await service.getFlashcardsService(req.user._id, req.query);
  res.json({ success: true, count: cards.length, data: cards });
});

export const getDueFlashcards = asyncHandler(async (req, res) => {
  const cards = await service.getDueFlashcardsService(req.user._id);
  res.json({ success: true, count: cards.length, data: cards });
});

export const getFlashcard = asyncHandler(async (req, res) => {
  const card = await service.getFlashcardByIdService(req.params.id);
  res.json({ success: true, data: card });
});


export const updateFlashcard = asyncHandler(async (req, res) => {
  const card = await service.updateFlashcardService(
    req.params.id,
    req.user._id,
    req.body
  );

  res.json({ success: true, data: card });
});
export const deleteFlashcard = asyncHandler(async (req, res) => {
  await service.deleteFlashcardService(req.params.id, req.user._id);

  res.json({
    success: true,
    message: "Flashcard deleted",
  });
});

export const reviewFlashcard = asyncHandler(async (req, res) => {
  const card = await service.reviewFlashcardService(req.params.id, req.user._id, req.body.quality);
  res.json({ success: true, data: card });
});


