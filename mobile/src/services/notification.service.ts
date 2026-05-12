import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import api from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationService = {
  requestPermission: async (): Promise<boolean> => {
    if (Platform.OS === 'web') return false;
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  },

  registerForPushNotificationsAsync: async (): Promise<string | null> => {
    try {
      const granted = await notificationService.requestPermission();
      if (!granted) return null;
      const token = await Notifications.getExpoPushTokenAsync();
      // Backend'e kaydet (hata olursa sessizce geç)
      api.post('/user/push-token', { token: token.data }).catch(() => {});
      return token.data;
    } catch {
      return null;
    }
  },

  scheduleDailyReminder: async (hour: number = 20): Promise<void> => {
    const granted = await notificationService.requestPermission();
    if (!granted) return;
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Mini Challenge Arena',
        body: 'Gunluk challenge seni bekliyor! Gorevlerini tamamla.',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute: 0,
      },
    });
  },

  sendLocalNotification: async (title: string, body: string): Promise<void> => {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: null,
    });
  },

  cancelAll: async (): Promise<void> => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },
};