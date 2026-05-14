import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import api from './api';

// Expo Go'da push notifications çalışmaz — try/catch ile güvenli hale getir
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch {}

export const notificationService = {
  registerForPushNotificationsAsync: async (): Promise<string | null> => {
    if (Platform.OS === 'web') return null;
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') return null;
      }
      const token = await Notifications.getExpoPushTokenAsync();
      api.post('/user/push-token', { token: token.data }).catch(() => {});
      return token.data;
    } catch {
      return null;
    }
  },

  scheduleDailyReminder: async (): Promise<void> => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') return;

      await Notifications.cancelAllScheduledNotificationsAsync();

      await Notifications.scheduleNotificationAsync({
        content: { title: '☀️ Günaydın!', body: 'Bugünkü görevlerin seni bekliyor! 🎯', sound: true },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 9, minute: 0,
        },
      });

      await Notifications.scheduleNotificationAsync({
        content: { title: '🏟️ Canlı Yarışma 15 Dakika Sonra!', body: 'Saat 21:00\'de herkes yarışıyor. Hazır mısın? ⚡', sound: true },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 20, minute: 45,
        },
      });
    } catch {}
  },

  sendLocalNotification: async (title: string, body: string): Promise<void> => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title, body, sound: true },
        trigger: null,
      });
    } catch {}
  },

  cancelAll: async (): Promise<void> => {
    try { await Notifications.cancelAllScheduledNotificationsAsync(); } catch {}
  },
};
