import client from "./client";

export const getUserPerformance = () => client.get("/performance/me");
export const getAnalytics = () => client.get("/performance/analytics");
export const createPerformance = (data) => client.post("/performance", data);
