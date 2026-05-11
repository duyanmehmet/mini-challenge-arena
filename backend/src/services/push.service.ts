import Expo, { ExpoPushMessage } from "expo-server-sdk";

const expo = new Expo();

export interface PushNotificationData {
  to: string;      // Expo push token
  title: string;
  body: string;
  data?: Record<string, any>;
}

export const pushService = {
  async send(notifications: PushNotificationData[]): Promise<void> {
    const messages: ExpoPushMessage[] = notifications
      .filter((n) => Expo.isExpoPushToken(n.to))
      .map((n) => ({
        to: n.to,
        sound: "default" as const,
        title: n.title,
        body: n.body,
        data: n.data ?? {},
      }));

    if (!messages.length) return;

    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
      } catch (err) {
        console.error("[Push] Gönderim hatası:", err);
      }
    }
  },

  async sendToUser(token: string, title: string, body: string, data?: Record<string, any>): Promise<void> {
    if (!token || !Expo.isExpoPushToken(token)) return;
    await pushService.send([{ to: token, title, body, data }]);
  },

  async sendDuelInvite(opponentToken: string, challengerName: string, mode: string, duelId: string): Promise<void> {
    await pushService.sendToUser(
      opponentToken,
      "Duello Daveti!",
      `${challengerName} seni ${mode} modunda duelloya davet etti!`,
      { type: "duel_invite", duelId }
    );
  },
};