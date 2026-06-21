import client from "./client";

export const getMcqsApi = (params) => client.get("/questions", { params });
export const getRandomMcqs = (params) => client.get("/questions/random", { params });
export const getMcqApi = (id) => client.get(`/questions/${id}`);
export const createMcqApi = (payload) => client.post("/questions", payload);
export const bulkCreateMcqs = (questions) => client.post("/questions/bulk", { questions });
export const updateMcqApi = (id, payload) => client.put(`/questions/${id}`, payload);
export const deleteMcqApi = (id) => client.delete(`/questions/${id}`);
