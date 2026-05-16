import {
  initConnection,
  endConnection,
  getProducts,
  requestPurchase,
  purchaseErrorListener,
  purchaseUpdatedListener,
  finishTransaction,
  type ProductPurchase,
  type PurchaseError,
} from 'react-native-iap';
import { Platform } from 'react-native';
import api from './api';

// Store console'da tanımlanması gereken ürün ID'leri
const PRODUCT_IDS = {
  coins_100:  Platform.OS === 'ios' ? 'com.zekameydani.coins100'  : 'coins_100',
  coins_500:  Platform.OS === 'ios' ? 'com.zekameydani.coins500'  : 'coins_500',
  coins_1200: Platform.OS === 'ios' ? 'com.zekameydani.coins1200' : 'coins_1200',
  coins_3000: Platform.OS === 'ios' ? 'com.zekameydani.coins3000' : 'coins_3000',
  remove_ads: Platform.OS === 'ios' ? 'com.zekameydani.removeads' : 'remove_ads',
};

let purchaseUpdateSub: ReturnType<typeof purchaseUpdatedListener> | null = null;
let purchaseErrorSub: ReturnType<typeof purchaseErrorListener> | null = null;
let onPurchaseSuccess: ((receipt: string, productId: string) => void) | null = null;
let onPurchaseError: ((err: PurchaseError) => void) | null = null;

export const iapService = {
  async init(): Promise<boolean> {
    try {
      await initConnection();

      purchaseUpdateSub = purchaseUpdatedListener(async (purchase: ProductPurchase) => {
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

  async getProducts() {
    try {
      return await getProducts({ skus: Object.values(PRODUCT_IDS) });
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
    await requestPurchase({ sku });
  },

  destroy() {
    purchaseUpdateSub?.remove();
    purchaseErrorSub?.remove();
    endConnection();
  },
};
