import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  } as any),
});

export const notificationService = {
  async registerForPushNotificationsAsync(): Promise<string | null> {
    // Simülatör/web'de token alınamaz
    if (Platform.OS === 'web') return null;
    if (!Device.isDevice) return null;

    try {
      // İzin kontrolü
      const { status: existing } = await Notifications.getPermissionsAsync();
      let finalStatus = existing;

      if (existing !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') return null;

      // Android kanal oluştur
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Varsayılan',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#8b5cf6',
        });
      }

      // Expo push token al
      const token = (await Notifications.getExpoPushTokenAsync()).data;

      // Sunucuya kaydet
      if (token) {
        await api.post('/user/push-token', { token }).catch(() => {});
      }

      return token;
    } catch {
      return null;
    }
  },

  async scheduleDailyReminder(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🏟️ Lig seni bekliyor!',
          body: 'Bugünkü sorularını çöz, sıralamana bak.',
          sound: true,
        },
        trigger: {
          hour: 20,
          minute: 0,
          repeats: true,
        } as any,
      });
    } catch {}
  },

  async sendLocalNotification(title: string, body: string): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title, body, sound: true },
        trigger: null,
      });
    } catch {}
  },

  async cancelAll(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch {}
  },
};
