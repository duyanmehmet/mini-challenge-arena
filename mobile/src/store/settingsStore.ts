import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  theme: 'dark' | 'light';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notificationHour: number;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleSound: () => void;
  toggleVibration: () => void;
  setNotificationHour: (hour: number) => void;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: 'dark',
  soundEnabled: true,
  vibrationEnabled: true,
  notificationHour: 20,

  setTheme: async (theme) => {
    set({ theme });
    await AsyncStorage.setItem('theme', theme);
  },

  toggleSound: async () => {
    const next = !get().soundEnabled;
    set({ soundEnabled: next });
    await AsyncStorage.setItem('soundEnabled', String(next));
  },

  toggleVibration: async () => {
    const next = !get().vibrationEnabled;
    set({ vibrationEnabled: next });
    await AsyncStorage.setItem('vibrationEnabled', String(next));
  },

  setNotificationHour: async (hour) => {
    set({ notificationHour: hour });
    await AsyncStorage.setItem('notificationHour', String(hour));
  },

  loadSettings: async () => {
    const [theme, sound, vib, notifHour] = await Promise.all([
      AsyncStorage.getItem('theme'),
      AsyncStorage.getItem('soundEnabled'),
      AsyncStorage.getItem('vibrationEnabled'),
      AsyncStorage.getItem('notificationHour'),
    ]);
    set({
      theme: (theme as 'dark' | 'light') ?? 'dark',
      soundEnabled: sound !== 'false',
      vibrationEnabled: vib !== 'false',
      notificationHour: notifHour ? parseInt(notifHour) : 20,
    });
  },
}));
