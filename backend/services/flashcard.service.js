import Flashcard from "../models/flashcard.model.js";
import ApiError from "../utils/ApiError.js";
import { calculateNextReview } from "../utils/spacedRepetition.js";

export const createFlashcardService = async (data) => {
  return Flashcard.create(data);
};

export const getFlashcardsService = async (userId, filters = {}) => {
  const query = { userId };
  if (filters.subjectId) query.subjectId = filters.subjectId;
  return Flashcard.find(query).populate("subjectId", "name");
};

export const getDueFlashcardsService = async (userId) => {
  return Flashcard.find({
    userId,
    nextReview: { $lte: new Date() },
  })
    .populate("subjectId", "name")
    .sort({ nextReview: 1 })
    .limit(20);
};

export const getFlashcardByIdService = async (id) => {
  const card = await Flashcard.findById(id);
  if (!card) throw ApiError.notFound("Flashcard not found");
  return card;
};

export const updateFlashcardService = async (id, userId, data) => {
  const card = await Flashcard.findOneAndUpdate(
    { _id: id, userId },
    { $set: data },
    { new: true, runValidators: true }
  );

  if (!card) throw ApiError.notFound("Flashcard not found");
  return card;
};

export const reviewFlashcardService = async (id, userId, quality) => {
  const card = await Flashcard.findOne({ _id: id, userId });
  if (!card) throw ApiError.notFound("Flashcard not found");

  if (quality < 0 || quality > 5) {
    throw ApiError.badRequest("Quality must be between 0 and 5");
  }

  const result = calculateNextReview(card, quality);
  card.interval = result.interval;
  card.easeFactor = result.easeFactor;
  card.repetitions = result.repetitions;
  card.nextReview = result.nextReview;

  await card.save();
  return card;
};


export const deleteFlashcardService = async (id, userId) => {
   const card = await Flashcard.findOneAndDelete({ _id: id, userId });
  if (!card) throw ApiError.notFound("Flashcard not found");
};
