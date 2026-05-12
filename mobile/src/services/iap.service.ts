// import * as InAppPurchases from 'expo-in-app-purchases';

export const iapService = {
  async init() {
    // await InAppPurchases.connectAsync();
  },

  async purchaseCoins(packId: 'coins_100' | 'coins_500' | 'coins_1000') {
    // try {
    //   await InAppPurchases.getProductsAsync([packId]);
    //   await InAppPurchases.purchaseItemAsync(packId);
    // } catch (e) {
    //   console.log('Purchase error:', e);
    // }
    console.log(`Mock Purchase for ${packId}`);
  },

  async removeAds() {
    console.log('Mock Remove Ads purchase');
  }
};
