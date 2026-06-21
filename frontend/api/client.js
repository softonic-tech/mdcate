import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const client = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // always send httpOnly cookie
  timeout: 15000,
});

// ── Token helpers (localStorage) ──
export const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

export const setToken = (token) => {
  if (typeof window !== "undefined" && token) {
    localStorage.setItem("token", token);
  }
};

export const removeToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
};

// ── Request Interceptor ──
// Attaches Bearer token from localStorage on every request.
// The httpOnly cookie is sent automatically via withCredentials.
// Backend checks Bearer first, falls back to cookie — so both paths work.
client.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (!error.response) {
      return Promise.reject({
        message: "Network error. Please check your connection.",
        status: 0,
      });
    }

    const { status, data } = error.response;
    const message = data?.message || "Something went wrong.";

    // 401 on a non-auth page → clear token, redirect to login
    if (status === 401 && typeof window !== "undefined") {
      removeToken();
      if (!window.location.pathname.startsWith("/auth")) {
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject({ message, status });
  }
);

export default client;
