import client from "./client";

export const createThread = (data) => client.post("/discussion-threads", data);
export const getThreads = (params) => client.get("/discussion-threads", { params });
export const getThread = (id) => client.get(`/discussion-threads/${id}`);
export const deleteThread = (id) => client.delete(`/discussion-threads/${id}`);
