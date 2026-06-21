import client from "./client";

export const getChallenges = (params) => client.get("/challenges", { params });
export const getChallenge = (id) => client.get(`/challenges/${id}`);
export const createChallenge = (data) => client.post("/challenges", data);
export const updateChallenge = (id, data) => client.put(`/challenges/${id}`, data);
export const deleteChallenge = (id) => client.delete(`/challenges/${id}`);
