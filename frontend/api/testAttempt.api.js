import client from "./client";

export const createAttempt = (data) => client.post("/test-attempts", data);
export const getMyAttempts = () => client.get("/test-attempts/me");
export const getAttempt = (id) => client.get(`/test-attempts/${id}`);
export const getAllAttempts = () => client.get("/test-attempts");
export const deleteAttempt = (id) => client.delete(`/test-attempts/${id}`);
