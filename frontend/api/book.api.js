
import API from "./client";

// GET BOOKS
export const getBooks = (params) =>
  API.get("/books", { params });

// GET SINGLE BOOK (optional future)
export const getBook = (id) =>
  API.get(`/books/${id}`);

// CREATE BOOK
export const createBook = (data) =>
API.post("/books", data);

// UPDATE BOOK
export const updateBook = (id, data) =>
API.put(`/books/${id}`, data);

// DELETE BOOK
export const deleteBook = (id) =>
API.delete(`/books/${id}`);

// DOWNLOAD BOOK
// export const downloadBook = (id) =>
// API.get(`/books/download/${id}`);

// DOWNLOAD BOOK
export const downloadBook = (id, config = {}) =>
  API.get(`/books/download/${id}`, config); // ✅ responseType will be blob



