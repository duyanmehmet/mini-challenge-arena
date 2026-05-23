import { Platform } from 'react-native';

const ADMOB_APP_ID    = 'ca-app-pub-4780904817875688~4613037151';
const BANNER_PROD     = 'ca-app-pub-4780904817875688/8801666394';
const INTERSTITIAL_PROD = 'ca-app-pub-4780904817875688/7329179922';
const REWARDED_PROD   = 'ca-app-pub-4780904817875688/9889414564';

export const BANNER_ID = __DEV__
  ? 'ca-app-pub-3940256099942544/6300978111'
  : BANNER_PROD;

const INTERSTITIAL_ID = __DEV__
  ? 'ca-app-pub-3940256099942544/1033173712'
  : INTERSTITIAL_PROD;

const REWARDED_ID = __DEV__
  ? 'ca-app-pub-3940256099942544/5224354917'
  : REWARDED_PROD;

const counters: Record<string, number> = {};

function shouldShowInterstitial(key: string, every: number): boolean {
  counters[key] = (counters[key] ?? 0) + 1;
  return counters[key] % every === 0;
}

type RewardCallback = () => void;

export const admobService = {
  async showRewarded(onRewarded: RewardCallback): Promise<boolean> {
    try {
      const { RewardedAd, RewardedAdEventType } =
        await import('react-native-google-mobile-ads');

      return new Promise((resolve) => {
        const rewarded = RewardedAd.createForAdRequest(REWARDED_ID, {
          requestNonPersonalizedAdsOnly: true,
        });

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
      if (__DEV__) {
        onRewarded();
        return true;
      }
      return false;
    }
  },

  async maybeShowInterstitial(mode: 'antrenman' | 'lig', isVip = false): Promise<void> {
    if (isVip) return;
    const every = mode === 'lig' ? 2 : 3;
    if (!shouldShowInterstitial(mode, every)) return;
    await this.showInterstitial();
  },

  async showInterstitial(): Promise<void> {
    try {
      const { InterstitialAd, AdEventType } =
        await import('react-native-google-mobile-ads');

      const interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_ID);

      await new Promise<void>((resolve) => {
        const unsub = interstitial.addAdEventListener(AdEventType.LOADED, () => {
          interstitial.show();
          unsub();
          resolve();
        });
        interstitial.load();
        setTimeout(resolve, 5000);
      });
    } catch {}
  },
};
