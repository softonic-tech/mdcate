import client from "./client";

export const saveStudyPlan = (data) =>
  client.post("/study-plans", data);

export const getStudyPlan = () =>
  client.get("/study-plans");

export const updateStudyPlan = (id, data) =>
  client.put(`/study-plans/${id}`, data);

export const deleteStudyPlan = (id) =>
  client.delete(`/study-plans/${id}`);