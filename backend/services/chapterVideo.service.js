import ChapterVideo from "../models/chapterVideo.model.js";
import Chapter from "../models/chapter.model.js";
import Book from "../models/book.model.js";
import ApiError from "../utils/ApiError.js";
import { paginate, paginatedResponse } from "../utils/pagination.js";

const populateFields = "title name board";

const validateRelations = async ({ subjectId, chapterId, bookId }) => {
  const chapter = await Chapter.findById(chapterId);
  if (!chapter) throw ApiError.notFound("Chapter not found");
  if (String(chapter.subjectId) !== String(subjectId)) {
    throw ApiError.badRequest("Chapter does not belong to the selected subject");
  }

  if (bookId) {
    const book = await Book.findById(bookId);
    if (!book) throw ApiError.notFound("Book not found");
    if (String(book.subjectId) !== String(subjectId)) {
      throw ApiError.badRequest("Book does not belong to the selected subject");
    }
  }

  return chapter;
};

export const createChapterVideoService = async (data) => {
  await validateRelations(data);

  if (!data.videoUrl?.trim()) {
    throw ApiError.badRequest("videoUrl is required");
  }

  return ChapterVideo.create({
    ...data,
    videoUrl: data.videoUrl.trim(),
  });
};

export const getChapterVideosService = async (filters = {}, { includeUnpublished = false } = {}) => {
  const query = {};
  if (!includeUnpublished) query.isPublished = true;
  if (filters.subjectId) query.subjectId = filters.subjectId;
  if (filters.chapterId) query.chapterId = filters.chapterId;
  if (filters.bookId) query.bookId = filters.bookId;

  const { page, limit, skip } = paginate(filters);
  const [data, total] = await Promise.all([
    ChapterVideo.find(query)
      .populate("subjectId", populateFields)
      .populate("chapterId", "name")
      .populate("bookId", "title board")
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ChapterVideo.countDocuments(query),
  ]);

  return paginatedResponse(data, total, page, limit);
};

export const getChapterVideoByIdService = async (id, { includeUnpublished = false } = {}) => {
  const query = { _id: id };
  if (!includeUnpublished) query.isPublished = true;

  const video = await ChapterVideo.findOne(query)
    .populate("subjectId", populateFields)
    .populate("chapterId", "name")
    .populate("bookId", "title board");

  if (!video) throw ApiError.notFound("Chapter video not found");
  return video;
};

export const updateChapterVideoService = async (id, data) => {
  if (data.subjectId || data.chapterId || data.bookId) {
    const existing = await ChapterVideo.findById(id);
    if (!existing) throw ApiError.notFound("Chapter video not found");

    await validateRelations({
      subjectId: data.subjectId || existing.subjectId,
      chapterId: data.chapterId || existing.chapterId,
      bookId: data.bookId ?? existing.bookId,
    });
  }

  const video = await ChapterVideo.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  })
    .populate("subjectId", populateFields)
    .populate("chapterId", "name")
    .populate("bookId", "title board");

  if (!video) throw ApiError.notFound("Chapter video not found");
  return video;
};

export const deleteChapterVideoService = async (id) => {
  const video = await ChapterVideo.findByIdAndDelete(id);
  if (!video) throw ApiError.notFound("Chapter video not found");
};
