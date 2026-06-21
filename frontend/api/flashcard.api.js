import client from "./client";

export const createFlashcard = (data) => client.post("/flashcards", data);
export const getFlashcards = (params) => client.get("/flashcards", { params });
export const getDueFlashcards = () => client.get("/flashcards/due");
export const getFlashcard = (id) => client.get(`/flashcards/${id}`);
export const updateFlashcard = (id, data) => client.put(`/flashcards/${id}`, data);
export const reviewFlashcard = (id, quality) => client.post(`/flashcards/${id}/review`, { quality });
export const deleteFlashcard = (id) => client.delete(`/flashcards/${id}`);
