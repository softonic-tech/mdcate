import client from "./client";

export const createContactMessage = (data) => client.post("/contact", data);
export const getContactMessages = () => client.get("/contact/messages");
export const updateContactMessage = (id, data) => client.put(`/contact/${id}/respond`, data);
export const deleteContactMessage = (id) => client.delete(`/contact/${id}`);
