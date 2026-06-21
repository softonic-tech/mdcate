import API from "./client.js";
// Create new message
export const sendContactMessage = (data) => API.post("/", data);

// Get messages
export const getMessages = () => API.get("/");

// Update message status
export const updateMessageStatus = (id, status) =>
  API.put(`/${id}`, { status });

// Delete message
export const deleteMessage = (id) =>
  API.delete(`/${id}`);