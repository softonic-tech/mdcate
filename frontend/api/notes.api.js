import api from "./client";

export const getNotes = async (params) => {
  const res = await api.get("/notes", { params });
  return res.data;
};

export const getNoteById = async (id) => {
  const res = await api.get(`/notes/${id}`);
  return res.data;
};

export const createNote = async (data) => {
  const res = await api.post(
    "/notes",
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};

export const updateNote = async (id, data) => {
  const res = await api.put(
    `/notes/${id}`,
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};

export const deleteNote = async (id) => {
  const res = await api.delete(`/notes/${id}`);
  return res.data;
};