import Book from "../models/book.model.js";
import ApiError from "../utils/ApiError.js";
import { paginate, paginatedResponse } from "../utils/pagination.js";

export const createBookService = async (data) => {
  return Book.create(data);
};

export const getBooksService = async (filters) => {
  const query = {};
  if (filters.subjectId) query.subjectId = filters.subjectId;
  if (filters.board) query.board = filters.board;
  if (filters.search) {
    query.title = { $regex: filters.search, $options: "i" };
  }

  const { page, limit, skip } = paginate(filters);
  const [data, total] = await Promise.all([
    Book.find(query)
      .populate("subjectId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Book.countDocuments(query),
  ]);

  return paginatedResponse(data, total, page, limit);
};

export const getBookByIdService = async (id) => {
  const book = await Book.findById(id).populate("subjectId", "name");
  if (!book) throw ApiError.notFound("Book not found");
  return book;
};

export const updateBookService = async (id, data) => {
  const book = await Book.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!book) throw ApiError.notFound("Book not found");
  return book;
};

export const deleteBookService = async (id) => {
  const book = await Book.findByIdAndDelete(id);
  if (!book) throw ApiError.notFound("Book not found");
};

export const incrementDownload = async (id) => {
  await Book.findByIdAndUpdate(id, { $inc: { downloads: 1 } });
};
