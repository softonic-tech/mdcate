import client from "./client";

// DOWNLOAD
export const downloadContent = (data) =>
  client.post("/offline/download", data);

// GET
export const getOfflineContent = () =>
  client.get("/offline/content");

// DELETE
export const deleteOfflineContent = (id) =>
  client.delete(`/offline/content/${id}`);
