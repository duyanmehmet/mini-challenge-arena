import {
  initConnection,
  endConnection,
  getProducts,
  requestPurchase,
  purchaseErrorListener,
  purchaseUpdatedListener,
  finishTransaction,
  type Product,
  type PurchaseError,
} from 'react-native-iap';
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

let connected = false;

export const iapService = {
  async init(): Promise<boolean> {
    if (connected) return true;
    try {
      await initConnection();
      connected = true;
      return true;
    } catch {
      return false;
    }
  },

  async destroy() {
    if (connected) {
      await endConnection().catch(() => {});
      connected = false;
    }
  },

  async getProducts(): Promise<Product[]> {
    if (!connected) await this.init();
    try {
      return await getProducts({ skus: Object.values(PRODUCT_IDS) });
    } catch {
      return [];
    }
  },

  // Promise döner: resolve(başarı/hata), timeout yoktur, kullanıcı iptal ederse resolve({ success: false })
  purchase(productId: ProductId): Promise<{ success: boolean; coinsAdded: number; error?: string }> {
    return new Promise(async (resolve) => {
      const ok = await this.init();
      if (!ok) return resolve({ success: false, coinsAdded: 0, error: 'IAP bağlantısı kurulamadı.' });

      let updateSub: ReturnType<typeof purchaseUpdatedListener> | null = null;
      let errorSub:  ReturnType<typeof purchaseErrorListener>  | null = null;

      const cleanup = () => { updateSub?.remove(); errorSub?.remove(); };

      updateSub = purchaseUpdatedListener(async (purchase: any) => {
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
          await finishTransaction({ purchase, isConsumable }).catch(() => {});
          resolve({ success: true, coinsAdded: res.data.coinsAdded ?? 0 });
        } catch (err: any) {
          await finishTransaction({ purchase, isConsumable: true }).catch(() => {});
          resolve({ success: false, coinsAdded: 0, error: err?.response?.data?.message ?? 'Doğrulama hatası.' });
        }
      });

      errorSub = purchaseErrorListener((err: PurchaseError) => {
        if ((err as any).productId && (err as any).productId !== productId) return;
        cleanup();
        resolve({
          success: false,
          coinsAdded: 0,
          error: err.code === 'E_USER_CANCELLED' ? 'İptal edildi.' : (err.message ?? 'Satın alma hatası.'),
        });
      });

      requestPurchase({ sku: productId } as any).catch((err: any) => {
        cleanup();
        resolve({ success: false, coinsAdded: 0, error: err?.message ?? 'Satın alma başlatılamadı.' });
      });
    });
  },
};
