export const BANNER_ID: string | null = null;

const counters: Record<string, number> = {};

function shouldShowInterstitial(key: string, every: number): boolean {
  counters[key] = (counters[key] ?? 0) + 1;
  return counters[key] % every === 0;
}

type RewardCallback = () => void;

export const admobService = {
  async showRewarded(onRewarded: RewardCallback): Promise<boolean> {
    if (__DEV__) {
      onRewarded();
      return true;
    }
    return false;
  },

  async maybeShowInterstitial(mode: 'antrenman' | 'lig', isVip = false): Promise<void> {
    if (isVip) return;
    const every = mode === 'lig' ? 2 : 3;
    if (!shouldShowInterstitial(mode, every)) return;
    await this.showInterstitial();
  },

  async showInterstitial(): Promise<void> {},
};
