// expo-notifications Expo Go'da SDK 53+ çalışmaz — stub servis
// Gerçek build (EAS Build) için bu dosyayı aktif implementasyonla değiştir

export const notificationService = {
  registerForPushNotificationsAsync: async (): Promise<string | null> => null,
  scheduleDailyReminder: async (): Promise<void> => {},
  sendLocalNotification: async (_title: string, _body: string): Promise<void> => {},
  cancelAll: async (): Promise<void> => {},
};
