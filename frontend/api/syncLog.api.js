import client from "./client";

export const createSyncLog = (data) => client.post("/sync-logs", data);
export const getUserSyncLogs = () => client.get("/sync-logs");
