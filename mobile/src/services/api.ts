import axios from 'axios';
import { useUserStore } from '../store/userStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://mini-challenge-arena-production.up.railway.app/v1';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 saniye timeout
  headers: { 'Content-Type': 'application/json' },
});

// Token ekle
api.interceptors.request.use(
  (config) => {
    const token = useUserStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Hata yönetimi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token süresi dolmuş → logout
    if (error.response?.status === 401) {
      useUserStore.getState().logout();
      return Promise.reject(error);
    }

    // Ağ hatası — kullanıcı dostu mesaj ekle
    if (!error.response) {
      error.userMessage = 'İnternet bağlantısı yok veya sunucu yanıt vermiyor.';
    } else if (error.response.status >= 500) {
      error.userMessage = 'Sunucu hatası, lütfen tekrar dene.';
    } else {
      error.userMessage = error.response?.data?.message ?? 'Bir hata oluştu.';
    }

    return Promise.reject(error);
  }
);

export default api;
