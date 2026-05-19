import { Platform } from 'react-native';

// Test ID'leri — yayına almadan önce gerçek ID ile değiştir
const REWARDED_ID = Platform.select({
  android: 'ca-app-pub-3940256099942544/5224354917', // Google test
  ios:     'ca-app-pub-3940256099942544/1712485313', // Google test
  default: 'ca-app-pub-3940256099942544/5224354917',
});

type RewardCallback = () => void;

export const admobService = {
  async showRewarded(onRewarded: RewardCallback): Promise<boolean> {
    try {
      // react-native-google-mobile-ads kullanımı
      const { RewardedAd, RewardedAdEventType, TestIds } =
        await import('react-native-google-mobile-ads');

      return new Promise((resolve) => {
        const rewarded = RewardedAd.createForAdRequest(
          __DEV__ ? TestIds.REWARDED : (REWARDED_ID ?? TestIds.REWARDED),
          { requestNonPersonalizedAdsOnly: true }
        );

        const unsubscribeLoaded = rewarded.addAdEventListener(
          RewardedAdEventType.LOADED,
          () => { rewarded.show(); }
        );

        const unsubscribeEarned = rewarded.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD,
          () => {
            onRewarded();
            unsubscribeLoaded();
            unsubscribeEarned();
            resolve(true);
          }
        );

        // Kapatılırsa (ödül alınmadan)
        const unsubscribeClosed = rewarded.addAdEventListener(
          'closed' as any,
          () => {
            unsubscribeLoaded();
            unsubscribeEarned();
            unsubscribeClosed();
            resolve(false);
          }
        );

        rewarded.load();
      });
    } catch {
      // Reklam yüklenemezse yine de ödülü ver (dev/test ortamı)
      if (__DEV__) {
        onRewarded();
        return true;
      }
      return false;
    }
  },

  async showInterstitial(): Promise<void> {
    try {
      const { InterstitialAd, AdEventType, TestIds } =
        await import('react-native-google-mobile-ads');

      const interstitial = InterstitialAd.createForAdRequest(
        __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-3940256099942544/1033173712',
      );

      await new Promise<void>((resolve) => {
        const unsub = interstitial.addAdEventListener(AdEventType.LOADED, () => {
          interstitial.show();
          unsub();
          resolve();
        });
        interstitial.load();
        setTimeout(resolve, 5000); // 5 saniye içinde yüklenmezse geç
      });
    } catch {}
  },
};
