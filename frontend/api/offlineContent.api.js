import client from "./client";

export const downloadContent = (data) => client.post("/offline-content/download", data);
export const getOfflineContent = () => client.get("/offline-content");
export const deleteOfflineContent = (id) => client.delete(`/offline-content/${id}`);
