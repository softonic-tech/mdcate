import client from "./client";

export const createMnemonic = (data) => client.post("/mnemonics", data);
export const getMnemonics = (params) => client.get("/mnemonics", { params });
export const getMnemonic = (id) => client.get(`/mnemonics/${id}`);
export const updateMnemonic = (id, data) => client.put(`/mnemonics/${id}`, data);
export const deleteMnemonic = (id) => client.delete(`/mnemonics/${id}`);
