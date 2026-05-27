let MobileAds: any = null;
let InterstitialAd: any = null;
let RewardedAd: any = null;
let RewardedAdEventType: any = null;
let AdEventType: any = null;
let _BannerAd: any = null;
let _BannerAdSize: any = null;

try {
  const ads = require('react-native-google-mobile-ads');
  MobileAds         = ads.default;
  InterstitialAd    = ads.InterstitialAd;
  RewardedAd        = ads.RewardedAd;
  RewardedAdEventType = ads.RewardedAdEventType;
  AdEventType       = ads.AdEventType;
  _BannerAd         = ads.BannerAd;
  _BannerAdSize     = ads.BannerAdSize;
  MobileAds?.().initialize().catch(() => {});
} catch {}

export { _BannerAd as BannerAd, _BannerAdSize as BannerAdSize };

const IS_DEV = __DEV__;
const ADS_AVAILABLE = !!InterstitialAd;

export const BANNER_ID: string | null = ADS_AVAILABLE
  ? (IS_DEV
      ? 'ca-app-pub-3940256099942544/6300978111'
      : 'ca-app-pub-4780904817875688/8801666394')
  : null;

const INTERSTITIAL_ID = IS_DEV
  ? 'ca-app-pub-3940256099942544/1033173712'
  : 'ca-app-pub-4780904817875688/7329179922';

const REWARDED_ID = IS_DEV
  ? 'ca-app-pub-3940256099942544/5224354917'
  : 'ca-app-pub-4780904817875688/9889414564';

const counters: Record<string, number> = {};

function shouldShowInterstitial(key: string, every: number): boolean {
  counters[key] = (counters[key] ?? 0) + 1;
  return counters[key] % every === 0;
}

type RewardCallback = () => void;

export const admobService = {
  async showRewarded(onRewarded: RewardCallback): Promise<boolean> {
    if (!ADS_AVAILABLE) {
      if (IS_DEV) { onRewarded(); return true; }
      return false;
    }
    return new Promise((resolve) => {
      try {
        const rewarded = RewardedAd.createForAdRequest(REWARDED_ID);
        const unsubLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
          rewarded.show();
        });
        const unsubEarned = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
          onRewarded();
          unsubLoaded(); unsubEarned();
          resolve(true);
        });
        const unsubError = rewarded.addAdEventListener(AdEventType.ERROR, () => {
          unsubLoaded(); unsubEarned(); unsubError();
          resolve(false);
        });
        const unsubClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
          unsubClosed(); resolve(false);
        });
        rewarded.load();
      } catch { resolve(false); }
    });
  },

  async maybeShowInterstitial(mode: 'antrenman' | 'lig' | 'duel', isVip = false): Promise<void> {
    if (!ADS_AVAILABLE || isVip) return;
    const every = mode === 'lig' ? 2 : mode === 'duel' ? 2 : 3;
    if (!shouldShowInterstitial(mode, every)) return;
    await this.showInterstitial();
  },

  async showInterstitial(): Promise<void> {
    if (!ADS_AVAILABLE) return;
    return new Promise((resolve) => {
      try {
        const interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_ID);
        const unsubLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
          interstitial.show(); unsubLoaded();
        });
        const unsubClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
          unsubClosed(); resolve();
        });
        const unsubError = interstitial.addAdEventListener(AdEventType.ERROR, () => {
          unsubError(); resolve();
        });
        interstitial.load();
      } catch { resolve(); }
    });
  },
};
