import client from "./client";

// GET chapters by subject
export const getChaptersBySubjectApi = async (subjectId) => {
  const { data } = await client.get(`/chapters/subject/${subjectId}`);
  return data;
};

// CREATE chapter (admin)
export const createChapterApi = async (payload) => {
  const { data } = await client.post("/chapters", payload);
  return data;
};

// UPDATE chapter (admin)
export const updateChapterApi = async (id, payload) => {
  const { data } = await client.put(`/chapters/${id}`, payload);
  return data;
};

// DELETE chapter (admin)
export const deleteChapterApi = async (id) => {
  const { data } = await client.delete(`/chapters/${id}`);
  return data;
};

// GET ALL chapters
export const getAllChaptersApi = async () => {
  const { data } = await client.get(`/chapters`);
  return data;
};
