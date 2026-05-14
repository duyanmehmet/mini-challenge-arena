import { Audio } from 'expo-av';
import { Vibration } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';

// Ses dosyaları placeholder olduğunda crash olmasın — try/catch ile sarıldı
const loadSound = (path: any) => {
  try { return path; } catch { return null; }
};

const SOUNDS: Record<string, any> = {
  hit:       loadSound(require('../../assets/sounds/hit.mp3')),
  miss:      loadSound(require('../../assets/sounds/miss.mp3')),
  combo:     loadSound(require('../../assets/sounds/combo.mp3')),
  win:       loadSound(require('../../assets/sounds/win.mp3')),
  countdown: loadSound(require('../../assets/sounds/countdown.mp3')),
  goal:      loadSound(require('../../assets/sounds/goal.mp3')),
  levelup:   loadSound(require('../../assets/sounds/levelup.mp3')),
};

// Yüklenmiş ses nesnelerini cache'le (performans için)
const soundCache: Record<string, Audio.Sound> = {};

class AssetService {
  async playSound(name: string) {
    const { soundEnabled } = useSettingsStore.getState();
    if (!soundEnabled) return;

    const soundAsset = SOUNDS[name];
    if (!soundAsset) return;

    try {
      // Cache'de varsa yeniden kullan
      if (soundCache[name]) {
        await soundCache[name].setPositionAsync(0);
        await soundCache[name].playAsync();
        return;
      }

      const { sound } = await Audio.Sound.createAsync(soundAsset, { shouldPlay: true });
      soundCache[name] = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          // Cache'den çıkarma — sonraki çağrıda yeniden yüklensin
          delete soundCache[name];
          sound.unloadAsync().catch(() => {});
        }
      });
    } catch {
      // Hatalı/boş ses dosyasında sessizce devam et
    }
  }

  vibrate(pattern: number | number[] = 50) {
    const { vibrationEnabled } = useSettingsStore.getState();
    if (!vibrationEnabled) return;
    Vibration.vibrate(pattern);
  }

  getAnimation(name: string) {
    const anims: Record<string, any> = {
      confetti:  require('../../assets/animations/confetti.json'),
      levelup:   require('../../assets/animations/level-up.json'),
      countdown: require('../../assets/animations/countdown.json'),
    };
    try {
      const anim = anims[name];
      // Boş/placeholder animasyonsa (layers dizisi yoksa) null döndür
      if (!anim || !anim.layers || anim.layers.length === 0) return null;
      return anim;
    } catch { return null; }
  }
}

export const assetService = new AssetService();
