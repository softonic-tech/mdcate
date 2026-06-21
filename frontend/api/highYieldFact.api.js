import client from "./client";

// GET all facts (filter support)
export const getHighYieldFacts = (params) =>
  client.get("/high-yield-facts", { params }).then(res => res.data);

// GET single fact
export const getHighYieldFact = (id) =>
  client.get(`/high-yield-facts/${id}`).then(res => res.data);

// CREATE (admin)
export const createHighYieldFact = (data) =>
  client.post("/high-yield-facts", data).then(res => res.data);

// UPDATE (admin)
export const updateHighYieldFact = (id, data) =>
  client.put(`/high-yield-facts/${id}`, data).then(res => res.data);

// DELETE (admin)
export const deleteHighYieldFact = (id) =>
  client.delete(`/high-yield-facts/${id}`).then(res => res.data);