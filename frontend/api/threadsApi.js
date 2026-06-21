import API from "./client";

// CREATE
export const createThread = (data) =>
  API.post("/threads", data);

// GET ALL
export const getThreads = (params) =>
  API.get("/threads", { params });

// GET SINGLE
export const getThread = (id) =>
  API.get(`/threads/${id}`);

// DELETE
export const deleteThread = (id) =>
  API.delete(`/threads/${id}`);
