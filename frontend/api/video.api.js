import API from "./client";

// GET ALL
export const getVideos = () =>
  API.get("/videos");

// GET SINGLE
export const getVideo = (id) =>
  API.get(`/videos/${id}`);

// CREATE (admin)
export const createVideo = (data) =>
  API.post("/videos", data);

// UPDATE (admin)
export const updateVideo = (id, data) =>
  API.put(`/videos/${id}`, data);

// DELETE (admin)
export const deleteVideo = (id) =>
  API.delete(`/videos/${id}`);
