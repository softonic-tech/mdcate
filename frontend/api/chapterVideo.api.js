import API from "./client";

export const getChapterVideos = (params) => API.get("/chapter-videos", { params });

export const getChapterVideo = (id) => API.get(`/chapter-videos/${id}`);

export const getChapterVideoStream = (id) => API.get(`/chapter-videos/${id}/watch`);
