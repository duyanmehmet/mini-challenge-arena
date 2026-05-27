import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  theme: 'dark' | 'light';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notificationsEnabled: boolean;
  notificationHour: number;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleSound: () => void;
  toggleVibration: () => void;
  toggleNotifications: () => void;
  setNotificationHour: (hour: number) => void;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: 'dark',
  soundEnabled: true,
  vibrationEnabled: true,
  notificationsEnabled: true,
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

  toggleNotifications: async () => {
    const next = !get().notificationsEnabled;
    set({ notificationsEnabled: next });
    await AsyncStorage.setItem('notificationsEnabled', String(next));
    if (!next) {
      try {
        const Notifications = await import('expo-notifications');
        await Notifications.cancelAllScheduledNotificationsAsync();
      } catch {}
    }
  },

  setNotificationHour: async (hour) => {
    set({ notificationHour: hour });
    await AsyncStorage.setItem('notificationHour', String(hour));
  },

  loadSettings: async () => {
    const [theme, sound, vib, notifHour, notifEnabled] = await Promise.all([
      AsyncStorage.getItem('theme'),
      AsyncStorage.getItem('soundEnabled'),
      AsyncStorage.getItem('vibrationEnabled'),
      AsyncStorage.getItem('notificationHour'),
      AsyncStorage.getItem('notificationsEnabled'),
    ]);
    set({
      theme: (theme as 'dark' | 'light') ?? 'dark',
      soundEnabled: sound !== 'false',
      vibrationEnabled: vib !== 'false',
      notificationsEnabled: notifEnabled !== 'false',
      notificationHour: notifHour ? parseInt(notifHour) : 20,
    });
  },
}));
