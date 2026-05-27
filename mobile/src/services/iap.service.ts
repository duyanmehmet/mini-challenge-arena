import {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  purchaseErrorListener,
  purchaseUpdatedListener,
  finishTransaction,
  // type ProductPurchase,
  type PurchaseError,
} from 'react-native-iap';
import { Platform } from 'react-native';
import api from './api';

// Play Console'da bu ID'lerle ürün oluşturulmalı (Managed products)
export const PRODUCT_IDS = {
  coins_500:  'com.minichallengearena.app.coins500',
  coins_1200: 'com.minichallengearena.app.coins1200',
  coins_2500: 'com.minichallengearena.app.coins2500',
  coins_5500: 'com.minichallengearena.app.coins5500',
  remove_ads: 'com.minichallengearena.app.noads',
  vip_30:     'com.minichallengearena.app.vip30',
};

let purchaseUpdateSub: ReturnType<typeof purchaseUpdatedListener> | null = null;
let purchaseErrorSub: ReturnType<typeof purchaseErrorListener> | null = null;
let onPurchaseSuccess: ((receipt: string, productId: string) => void) | null = null;
let onPurchaseError: ((err: PurchaseError) => void) | null = null;

export const iapService = {
  async init(): Promise<boolean> {
    try {
      await initConnection();

      purchaseUpdateSub = purchaseUpdatedListener(async (purchase: any) => {
        const receipt = purchase.transactionReceipt ?? purchase.purchaseToken ?? '';
        if (receipt) {
          try {
            // Backend'e receipt gönder — doğrulama ve coin ekleme
            await api.post('/store/verify-iap', {
              productId: purchase.productId,
              receipt,
              platform: Platform.OS,
              transactionId: purchase.transactionId,
            });
            await finishTransaction({ purchase, isConsumable: true });
            onPurchaseSuccess?.(receipt, purchase.productId);
          } catch {
            onPurchaseError?.({ code: 'E_VERIFY', message: 'Satın alma doğrulanamadı.' } as any);
          }
        }
      });

      purchaseErrorSub = purchaseErrorListener((err: PurchaseError) => {
        onPurchaseError?.(err);
      });

      return true;
    } catch {
      return false;
    }
  },

  async fetchProducts() {
    try {
      return await fetchProducts({ skus: Object.values(PRODUCT_IDS) });
    } catch {
      return [];
    }
  },

  async purchaseProduct(
    packId: keyof typeof PRODUCT_IDS,
    onSuccess: (receipt: string, productId: string) => void,
    onError: (err: PurchaseError) => void,
  ): Promise<void> {
    onPurchaseSuccess = onSuccess;
    onPurchaseError = onError;
    const sku = PRODUCT_IDS[packId];
    await requestPurchase({ sku } as any);
  },

  destroy() {
    purchaseUpdateSub?.remove();
    purchaseErrorSub?.remove();
    endConnection();
  },
};
