import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '../store/settingsStore';

const SOUNDS: Record<string, any> = {
  hit:       require('../../assets/sounds/hit.wav'),
  miss:      require('../../assets/sounds/miss.wav'),
  lose:      require('../../assets/sounds/miss.wav'),
  combo:     require('../../assets/sounds/combo.wav'),
  win:       require('../../assets/sounds/win.wav'),
  countdown: require('../../assets/sounds/countdown.wav'),
  goal:      require('../../assets/sounds/goal.wav'),
  levelup:   require('../../assets/sounds/levelup.wav'),
};

const soundCache: Record<string, Audio.Sound> = {};

class AssetService {
  async playSound(name: string) {
    const { soundEnabled } = useSettingsStore.getState();
    if (!soundEnabled) return;

    const asset = SOUNDS[name];
    if (!asset) return;

    try {
      if (soundCache[name]) {
        await soundCache[name].setPositionAsync(0);
        await soundCache[name].playAsync();
        return;
      }
      const { sound } = await Audio.Sound.createAsync(asset, { shouldPlay: true });
      soundCache[name] = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          delete soundCache[name];
          sound.unloadAsync().catch(() => {});
        }
      });
    } catch {}
  }

  vibrate(type: 'success' | 'error' | 'light' | 'medium' | 'heavy' | 'combo' = 'light') {
    const { vibrationEnabled } = useSettingsStore.getState();
    if (!vibrationEnabled) return;
    switch (type) {
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'combo':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 80);
        break;
    }
  }

  getAnimation(name: string) {
    const anims: Record<string, any> = {
      confetti:  require('../../assets/animations/confetti.json'),
      levelup:   require('../../assets/animations/level-up.json'),
      countdown: require('../../assets/animations/countdown.json'),
    };
    try {
      const anim = anims[name];
      if (!anim || !anim.layers || anim.layers.length === 0) return null;
      return anim;
    } catch { return null; }
  }
}

export const assetService = new AssetService();
