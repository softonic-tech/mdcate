import client from "./client";

export const createChallengeAttempt = (data) => client.post("/challenge-attempts", data);
export const getMyChallengeAttempts = () => client.get("/challenge-attempts/me");
export const getAllChallengeAttempts = () => client.get("/challenge-attempts/all");
