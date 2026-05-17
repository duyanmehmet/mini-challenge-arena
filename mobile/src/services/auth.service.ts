import api from "./api";
import { useUserStore } from "../store/userStore";

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    const { user, token } = response.data;
    await useUserStore.getState().setUser(user, token);
    return response.data;
  },

  register: async (username: string, email: string, password: string, avatarId: number = 1) => {
    const response = await api.post("/auth/register", { username, email, password, avatarId });
    const { user, token } = response.data;
    await useUserStore.getState().setUser(user, token);
    return response.data;
  },

  sendVerification: async (email: string) => {
    const response = await api.post("/auth/send-verification", { email });
    return response.data;
  },

  verifyEmail: async (email: string, code: string) => {
    const response = await api.post("/auth/verify-email", { email, code });
    const { user, token } = response.data;
    await useUserStore.getState().setUser(user, token);
    return response.data;
  },

  googleLogin: async (accessToken: string) => {
    const response = await api.post("/auth/google", { accessToken });
    const { user, token } = response.data;
    await useUserStore.getState().setUser(user, token);
    return response.data;
  },

  logout: async () => {
    await useUserStore.getState().logout();
  },
};

