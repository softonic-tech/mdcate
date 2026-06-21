import API from "./axiosInstance";

// Admin creates exam
export const createExam = (data) => API.post("/exams", data);

// Get all exams (students)
export const getExams = () => API.get("/exams");

// Admin update exam
export const updateExam = (id, data) => API.put(`/exams/${id}`, data);

// Admin delete exam
export const deleteExam = (id) => API.delete(`/exams/${id}`);