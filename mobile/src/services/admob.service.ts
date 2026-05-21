import { Platform } from 'react-native';

// Test ID'leri — yayına almadan önce gerçek AdMob ID ile değiştir
const REWARDED_ID = Platform.select({
  android: 'ca-app-pub-3940256099942544/5224354917',
  ios:     'ca-app-pub-3940256099942544/1712485313',
  default: 'ca-app-pub-3940256099942544/5224354917',
});

export const BANNER_ID = Platform.select({
  android: __DEV__ ? 'ca-app-pub-3940256099942544/6300978111' : 'ca-app-pub-XXXX/XXXX',
  ios:     __DEV__ ? 'ca-app-pub-3940256099942544/2934735716' : 'ca-app-pub-XXXX/XXXX',
  default: 'ca-app-pub-3940256099942544/6300978111',
});

// Oyun sayaçları — interstitial göstermek için
const counters: Record<string, number> = {};

function shouldShowInterstitial(key: string, every: number): boolean {
  counters[key] = (counters[key] ?? 0) + 1;
  return counters[key] % every === 0;
}

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

  // Antrenman: her 3 oyunda 1, Lig: her 2 oyunda 1
  async maybeShowInterstitial(mode: 'antrenman' | 'lig', isVip = false): Promise<void> {
    if (isVip) return;
    const every = mode === 'lig' ? 2 : 3;
    if (!shouldShowInterstitial(mode, every)) return;
    await this.showInterstitial();
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
