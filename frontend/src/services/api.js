/**
 * API Service
 * Centralized axios instance for all API calls
 */

import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor to handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Authentication API calls
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getCurrentUser: () => api.get("/auth/me"),
};

// Video API calls
export const videoAPI = {
  uploadVideo: (formData) => {
    return api.post("/videos/upload", formData);
  },
  getUserVideos: (params) => api.get("/videos/my-videos", { params }),
  getVideo: (videoId) => api.get(`/videos/${videoId}`),
  deleteVideo: (videoId) => api.delete(`/videos/${videoId}`),
  getDashboardStats: () => api.get("/videos/dashboard/stats"),
};

// User API calls (Admin only)
export const userAPI = {
  getAllUsers: () => api.get("/users"),
  getUser: (userId) => api.get(`/users/${userId}`),
  updateUserRole: (userId, role) =>
    api.patch(`/users/${userId}/role`, { role }),
  updateUserStatus: (userId, status) =>
    api.patch(`/users/${userId}/status`, { status }),
  deleteUser: (userId) => api.delete(`/users/${userId}`),
};

export default api;
