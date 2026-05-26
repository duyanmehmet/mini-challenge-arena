import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import api from './api';

const PROJECT_ID =
  Constants.expoConfig?.extra?.eas?.projectId ??
  '1823d58c-2bc7-4048-9b0c-ce92cb28977d';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  } as any),
});

export const notificationService = {
  async registerForPushNotificationsAsync(): Promise<string | null> {
    if (Platform.OS === 'web') return null;
    if (!Device.isDevice) return null;

    try {
      const { status: existing } = await Notifications.getPermissionsAsync();
      let finalStatus = existing;

      if (existing !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') return null;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Varsayılan',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#8b5cf6',
          enableVibrate: true,
        });
        await Notifications.setNotificationChannelAsync('duel', {
          name: 'Düello Davetleri',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 500, 200, 500],
          lightColor: '#ef4444',
        });
        await Notifications.setNotificationChannelAsync('streak', {
          name: 'Seri Hatırlatıcı',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#f59e0b',
        });
      }

      // projectId zorunlu — verilmezse EAS build'de token alınamaz
      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId: PROJECT_ID });
      const token = tokenData.data;

      if (token) {
        await api.post('/user/push-token', { token }).catch(() => {});
      }

      return token;
    } catch (err) {
      console.warn('[Push] Token alınamadı:', err);
      return null;
    }
  },

  async scheduleDailyReminder(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Günlük saat 20:00 hatırlatıcı
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🏟️ Lig seni bekliyor!',
          body: 'Bugünkü sorularını çöz, sıralamana bak.',
          sound: true,
          data: { type: 'daily_reminder' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 20,
          minute: 0,
        },
      });

      // Pazartesi saat 09:00 — yeni lig haftası bildirimi
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔄 Yeni Lig Haftası Başladı!',
          body: 'Ligler sıfırlandı. Hemen oyna, zirvede başla!',
          sound: true,
          data: { type: 'weekly_reset' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: 2, // Pazartesi (1=Pazar, 2=Pazartesi)
          hour: 9,
          minute: 0,
        },
      });
    } catch (err) {
      console.warn('[Push] Zamanlama hatası:', err);
    }
  },

  async sendLocalNotification(title: string, body: string, data?: Record<string, any>): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title, body, sound: true, data: data ?? {} },
        trigger: null,
      });
    } catch {}
  },

  // Seri kırılma uyarısı — oyun içinden çağrılır
  async scheduleStreakWarning(currentStreak: number): Promise<void> {
    if (currentStreak < 2) return;
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔥 Serinini kaybetme!',
          body: `${currentStreak} günlük seriniz var. Bugün oynamayı unutma!`,
          sound: true,
          data: { type: 'streak_warning' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 18 * 60 * 60, // 18 saat sonra (gece uyarısı)
          repeats: false,
        },
      });
    } catch {}
  },

  async cancelAll(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch {}
  },
};
