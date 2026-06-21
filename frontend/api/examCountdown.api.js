import client from "./client";

export const createExam = (data) => client.post("/exam-countdowns", data);
export const getExams = () => client.get("/exam-countdowns");
export const updateExam = (id, data) => client.put(`/exam-countdowns/${id}`, data);
export const deleteExam = (id) => client.delete(`/exam-countdowns/${id}`);
