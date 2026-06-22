import API from "./client";

export const getVideos = () => API.get("/videos");

export const getVideo = (id) => API.get(`/videos/${id}`);

export const createVideo = (data) => API.post("/videos", data);

export const reprocessVideo = (id) => API.post(`/videos/${id}/reprocess`);

export const updateVideo = (id, data) => API.put(`/videos/${id}`, data);

export const deleteVideo = (id) => API.delete(`/videos/${id}`);
