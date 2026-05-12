import axios from "axios";
import { useUserStore } from "../store/userStore";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.103:3000/v1";


const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = useUserStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized (logout)
      useUserStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
