import api from './api';

export interface Product {
  id: string;
  label: string;
  coins: number;
  amount: number;   // coins ile aynı — store.tsx uyumluluğu için
  price: string;
  popular?: boolean;
}

export const storeService = {
  getPackages: async () => {
    const res = await api.get('/store/packages');
    return res.data;
  },

  purchaseCoins: async (packageId: string) => {
    const res = await api.post('/store/purchase', { packageId, receipt: `mock_${Date.now()}` });
    return res.data;
  },

  spendCoins: async (amount: number, item: string) => {
    const res = await api.post('/store/spend', { amount, item });
    return res.data;
  },

  unlockAvatar: async (avatarId: number, cost: number = 0) => {
    const res = await api.post('/store/spend', { amount: cost, item: `avatar_${avatarId}` });
    return res.data;
  },

  // Alias
  getProducts: async (): Promise<Product[]> => {
    const res = await api.get('/store/packages');
    return res.data;
  },
};