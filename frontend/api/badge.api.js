import API from "./client";

export const getBadges = () =>
  API.get("/badges");

export const createBadge = (data) =>
  API.post("/badges", data);

export const updateBadge = (id,data) =>
  API.put(`/badges/${id}`, data);

export const deleteBadge = (id) =>
  API.delete(`/badges/${id}`);
