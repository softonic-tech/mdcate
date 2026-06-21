import client from "./client"; // axios instance

// GET all subjects (public)
export const getSubjectsApi = async () => {
  const { data } = await client.get("/subjects");
  return data;
};

// CREATE subject (admin)
export const createSubjectApi = async (payload) => {
  const { data } = await client.post("/subjects", payload);
  return data;
};

// UPDATE subject (admin)
export const updateSubjectApi = async (id, payload) => {
  const { data } = await client.put(`/subjects/${id}`, payload);
  return data;
};

// DELETE subject (admin)
export const deleteSubjectApi = async (id) => {
  const { data } = await client.delete(`/subjects/${id}`);
  return data;
};
