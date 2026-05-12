import { Audio } from 'expo-av';
import { Vibration } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';

const SOUNDS: Record<string, any> = {
  hit:       require('../../assets/sounds/hit.mp3'),
  miss:      require('../../assets/sounds/miss.mp3'),
  combo:     require('../../assets/sounds/combo.mp3'),
  win:       require('../../assets/sounds/win.mp3'),
  countdown: require('../../assets/sounds/countdown.mp3'),
  goal:      require('../../assets/sounds/goal.mp3'),
  levelup:   require('../../assets/sounds/levelup.mp3'),
};

class AssetService {
  async playSound(name: string) {
    const { soundEnabled } = useSettingsStore.getState();
    if (!soundEnabled) return;
    
    try {
      const soundAsset = SOUNDS[name];
      if (!soundAsset) return;

      const { sound } = await Audio.Sound.createAsync(soundAsset);
      await sound.playAsync();
      
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          await sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Sound play error:', error);
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
    return anims[name] ?? null;
  }
}

export const assetService = new AssetService();
