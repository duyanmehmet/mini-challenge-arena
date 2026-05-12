import { useCallback } from 'react';
import { useUserStore } from '../store/userStore';
import { admobService } from '../services/admob.service';

export function useAds() {
  const { addCoins } = useUserStore();

  const showInterstitial = useCallback(async () => {
    await admobService.showInterstitial();
  }, []);

  const watchForCoins = useCallback(async (amount: number = 50) => {
    await admobService.showRewarded();
    addCoins(amount);
  }, [addCoins]);

  return { showInterstitial, watchForCoins };
}