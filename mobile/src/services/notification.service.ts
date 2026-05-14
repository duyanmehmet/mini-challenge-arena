// expo-notifications Expo Go'da SDK 53+ çalışmaz — stub servis
// Gerçek build (development build / EAS build) için aktif edilebilir

export const notificationService = {
  registerForPushNotificationsAsync: async (): Promise<string | null> => null,
  scheduleDailyReminder: async (): Promise<void> => {},
  sendLocalNotification: async (_title: string, _body: string): Promise<void> => {},
  cancelAll: async (): Promise<void> => {},
};
