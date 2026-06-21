import client from "./client";

export const joinSession = (sessionId) => client.post(`/counseling-participants/${sessionId}/join`);
export const leaveSession = (sessionId) => client.post(`/counseling-participants/${sessionId}/leave`);
export const getParticipants = (sessionId) => client.get(`/counseling-participants/${sessionId}`);
