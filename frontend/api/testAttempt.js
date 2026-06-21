import API from "./client";

// CREATE ATTEMPT
export const createAttempt = (data) =>
  API.post("/attempts", data);

// GET SINGLE
export const getAttempt = (id) =>
  API.get(`/attempts/${id}`);

// ADMIN — GET ALL
export const getAllAttempts = () =>
  API.get("/attempts");

// DELETE
export const deleteAttempt = (id) =>
  API.delete(`/attempts/${id}`);
