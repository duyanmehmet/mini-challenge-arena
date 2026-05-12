// import { AdMobInterstitial, AdMobBanner, AdMobRewarded } from 'expo-ads-admob';

export const admobService = {
  async init() {
    // console.log('AdMob Initialized');
  },

  async showInterstitial() {
    // try {
    //   await AdMobInterstitial.setAdUnitID('ca-app-pub-3940256099942544/1033173712'); // Test ID
    //   await AdMobInterstitial.requestAdAsync();
    //   await AdMobInterstitial.showAdAsync();
    // } catch (e) {
    //   console.log('Ad interstitial error:', e);
    // }
    console.log('Mock Interstitial shown');
  },

  async showRewarded() {
    // await AdMobRewarded.setAdUnitID('ca-app-pub-3940256099942544/5224354917'); // Test ID
    // await AdMobRewarded.requestAdAsync();
    // await AdMobRewarded.showAdAsync();
    console.log('Mock Rewarded shown');
  }
};
