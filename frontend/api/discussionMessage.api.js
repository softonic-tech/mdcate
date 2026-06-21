import client from "./client";

export const createTextMessage = (data) => client.post("/discussion-messages/text", data);
export const createVoiceMessage = (formData) =>
  client.post("/discussion-messages/voice", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const getThreadMessages = (threadId) => client.get(`/discussion-messages/${threadId}`);
export const deleteMessage = (id) => client.delete(`/discussion-messages/${id}`);
