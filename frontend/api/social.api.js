import client from "./client";  


// 🔵 Google login
export const googleLoginApi = (token) =>
  client.post("/auth/google", { token });

// 🔵 Facebook login
export const facebookLoginApi = (token) =>
  client.post("/auth/facebook", { token });
