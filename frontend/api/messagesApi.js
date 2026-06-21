import API from "./client";

// CREATE TEXT
export const createTextMessage = (data) =>
  API.post("/discussion/messages/text", data);

// CREATE VOICE
export const createVoiceMessage = (formData) =>
  API.post("/discussion/messages/voice", formData);

// GET THREAD MESSAGES
export const getThreadMessages = (threadId) =>
  API.get(`/discussion/messages/${threadId}`);

// DELETE
export const deleteMessage = (id) =>
  API.delete(`/discussion/messages/${id}`);
