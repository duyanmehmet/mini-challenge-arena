export interface PushNotificationData {
  to: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export const pushService = {
  async send(notifications: PushNotificationData[]): Promise<void> {
    try {
      const { default: Expo } = await import('expo-server-sdk');
      const expo = new Expo();
      const messages = notifications
        .filter(n => Expo.isExpoPushToken(n.to))
        .map(n => ({
          to: n.to,
          sound: 'default' as const,
          title: n.title,
          body: n.body,
          data: n.data ?? {},
        }));
      if (!messages.length) return;
      const chunks = expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        await expo.sendPushNotificationsAsync(chunk).catch(() => {});
      }
    } catch { /* push servisi opsiyonel */ }
  },

  async sendToUser(token: string, title: string, body: string, data?: Record<string, any>): Promise<void> {
    if (!token) return;
    await pushService.send([{ to: token, title, body, data }]);
  },

  async sendDuelInvite(opponentToken: string, challengerName: string, mode: string, duelId: string): Promise<void> {
    await pushService.sendToUser(
      opponentToken,
      "Düello Daveti!",
      `${challengerName} seni düelloya davet etti!`,
      { type: "duel_invite", duelId }
    );
  },
};
