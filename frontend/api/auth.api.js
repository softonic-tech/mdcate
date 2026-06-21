import client from "./client";

export const loginApi = (payload) => client.post("/auth/login", payload);

export const signupApi = (payload) => client.post("/auth/signup", payload);

export const getMeApi = () => client.get("/auth/me");

export const logoutApi = () => client.post("/auth/logout");

export const forgotPasswordApi = (email) =>
  client.post("/auth/forgot-password", { email });

export const resetPasswordApi = (token, password) =>
  client.post("/auth/reset-password", { token, password });

export const googleLoginApi = (token) =>
  client.post("/auth/google", { token });

export const facebookLoginApi = (token) =>
  client.post("/auth/facebook", { token });
