import client from "./client";

export const getTestsApi = (params) => client.get("/tests", { params });
export const getTestApi = (id) => client.get(`/tests/${id}`);
export const createTestApi = (payload) => client.post("/tests", payload);
export const generateAdaptiveTest = (data) => client.post("/tests/adaptive", data);
export const updateTestApi = (id, payload) => client.put(`/tests/${id}`, payload);
export const deleteTestApi = (id) => client.delete(`/tests/${id}`);
