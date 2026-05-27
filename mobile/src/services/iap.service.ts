import { Platform } from 'react-native';
import api from './api';

// Play Console'da "Managed products" olarak oluşturulacak ID'ler
export const PRODUCT_IDS = {
  coins_500:  'com.minichallengearena.app.coins500',
  coins_1200: 'com.minichallengearena.app.coins1200',
  coins_2500: 'com.minichallengearena.app.coins2500',
  coins_5500: 'com.minichallengearena.app.coins5500',
  remove_ads: 'com.minichallengearena.app.noads',
  vip_30:     'com.minichallengearena.app.vip30',
} as const;

export type ProductId = typeof PRODUCT_IDS[keyof typeof PRODUCT_IDS];

// Dynamic require — Expo Go'da modül yoksa gracefully fail
let iap: any = null;
let IAP_AVAILABLE = false;
try {
  iap = require('react-native-iap');
  IAP_AVAILABLE = true;
} catch {}

let connected = false;

export const iapService = {
  async init(): Promise<boolean> {
    if (!IAP_AVAILABLE) return false;
    if (connected) return true;
    try {
      await iap.initConnection();
      connected = true;
      return true;
    } catch {
      return false;
    }
  },

  async destroy() {
    if (!IAP_AVAILABLE || !connected) return;
    await iap.endConnection().catch(() => {});
    connected = false;
  },

  purchase(productId: ProductId): Promise<{ success: boolean; coinsAdded: number; newBalance?: number; error?: string }> {
    if (!IAP_AVAILABLE) {
      return Promise.resolve({ success: false, coinsAdded: 0, error: 'IAP bu ortamda desteklenmiyor.' });
    }

    return new Promise(async (resolve) => {
      const ok = await this.init();
      if (!ok) return resolve({ success: false, coinsAdded: 0, error: 'IAP bağlantısı kurulamadı.' });

      let updateSub: any = null;
      let errorSub:  any = null;

      const cleanup = () => { updateSub?.remove(); errorSub?.remove(); };

      updateSub = iap.purchaseUpdatedListener(async (purchase: any) => {
        if (purchase.productId !== productId) return;
        cleanup();

        const receipt: string = Platform.OS === 'android'
          ? (purchase.purchaseToken ?? '')
          : (purchase.transactionReceipt ?? '');

        try {
          const res = await api.post('/store/verify-iap', {
            productId,
            receipt,
            platform: Platform.OS,
            transactionId: purchase.transactionId,
          });
          const isConsumable = !productId.includes('noads') && !productId.includes('vip');
          await iap.finishTransaction({ purchase, isConsumable }).catch(() => {});
          resolve({ success: true, coinsAdded: res.data.coinsAdded ?? 0, newBalance: res.data.newBalance });
        } catch (err: any) {
          await iap.finishTransaction({ purchase, isConsumable: true }).catch(() => {});
          resolve({ success: false, coinsAdded: 0, error: err?.response?.data?.message ?? 'Doğrulama hatası.' });
        }
      });

      errorSub = iap.purchaseErrorListener((err: any) => {
        if (err.productId && err.productId !== productId) return;
        cleanup();
        resolve({
          success: false,
          coinsAdded: 0,
          error: err.code === 'E_USER_CANCELLED' ? 'İptal edildi.' : (err.message ?? 'Satın alma hatası.'),
        });
      });

      iap.requestPurchase({ sku: productId }).catch((err: any) => {
        cleanup();
        resolve({ success: false, coinsAdded: 0, error: err?.message ?? 'Satın alma başlatılamadı.' });
      });
    });
  },
};
