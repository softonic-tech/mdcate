import client from "./client";

export const getAllSessions = () => client.get("/counseling-sessions");
export const getSessionById = (id) => client.get(`/counseling-sessions/${id}`);
export const createSession = (data) => client.post("/counseling-sessions", data);
export const updateSession = (id, data) => client.put(`/counseling-sessions/${id}`, data);
export const deleteSession = (id) => client.delete(`/counseling-sessions/${id}`);
