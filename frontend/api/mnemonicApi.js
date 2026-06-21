import axios from "axios";

const API = "http://localhost:5000/api/mnemonics";

export const createMnemonic = (data) =>
  axios.post(API, data);

export const getMnemonics = () =>
  axios.get(API);

export const getMnemonic = (id) =>
  axios.get(`${API}/${id}`);

export const updateMnemonic = (id, data) =>
  axios.put(`${API}/${id}`, data);

export const deleteMnemonic = (id) =>
  axios.delete(`${API}/${id}`);
