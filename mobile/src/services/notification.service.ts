import * as Notifications from 'expo-notifications';
import { Platform, Alert, Linking } from 'react-native';
import api from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationService = {
  requestPermission: async (): Promise<boolean> => {
    if (Platform.OS === 'web') return false;
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    if (existing === 'denied') return false;

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      // Kullanıcıya ayarlardan açması için yönlendirme
      Alert.alert(
        '📱 Bildirim İzni',
        'Canlı yarışma ve günlük hatırlatma bildirimleri almak için izin ver. Ayarlar\'dan açabilirsin.',
        [
          { text: 'Sonra', style: 'cancel' },
          { text: 'Ayarları Aç', onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }
    return true;
  },

  registerForPushNotificationsAsync: async (): Promise<string | null> => {
    try {
      const granted = await notificationService.requestPermission();
      if (!granted) return null;
      const token = await Notifications.getExpoPushTokenAsync();
      api.post('/user/push-token', { token: token.data }).catch(() => {});
      return token.data;
    } catch {
      return null;
    }
  },

  scheduleDailyReminder: async (): Promise<void> => {
    const granted = await notificationService.requestPermission();
    if (!granted) return;
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Sabah hatırlatması — 09:00
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '☀️ Günaydın!',
        body: 'Bugünkü görevlerin seni bekliyor. Hadi oyna! 🎯',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 9,
        minute: 0,
      },
    });

    // Akşam 20:45 — canlı yarışma hatırlatması
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🏟️ Canlı Yarışma 15 Dakika Sonra!',
        body: 'Saat 21:00\'de herkes aynı anda yarışıyor. Hazır mısın? ⚡',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 20,
        minute: 45,
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
