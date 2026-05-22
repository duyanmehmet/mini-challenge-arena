import { useCallback } from 'react';
import { iapService } from '../services/iap.service';

export function useIAP() {
  const purchaseCoins = useCallback((packId: 'coins_100' | 'coins_500' | 'coins_1000') => {
    return (iapService as any).purchaseCoins?.(packId);
  }, []);

  const removeAds = useCallback(() => (iapService as any).removeAds?.(), []);

  return { purchaseCoins, removeAds };
}
