import db from '../database';
import { Server as SocketServer } from 'socket.io';

const CATEGORIES = ['general', 'history', 'geography', 'science', 'art', 'cinema', 'sports', 'turkey'];
const TOURNAMENT_HOUR = 21; // 21:00 Türkiye saati (UTC+3 = 18:00 UTC)

export class LiveTournamentService {
  private io: SocketServer;
  private cronHandle: ReturnType<typeof setInterval> | null = null;
  private activeRoomTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(io: SocketServer) {
    this.io = io;
  }

  start() {
    // Her dakika kontrol et
    this.cronHandle = setInterval(() => this.tick(), 60 * 1000);
    this.tick(); // İlk kontrolü hemen yap
    console.log('[LiveTournament] Scheduler started — daily at 21:00 TR');
  }

  stop() {
    if (this.cronHandle) clearInterval(this.cronHandle);
    if (this.activeRoomTimer) clearTimeout(this.activeRoomTimer);
  }

  private async tick() {
    const now = new Date();
    // UTC+3 → Türkiye saati
    const trHour   = (now.getUTCHours() + 3) % 24;
    const trMinute = now.getUTCMinutes();

    // Saat tam 21:00 TR
    if (trHour === TOURNAMENT_HOUR && trMinute === 0) {
      await this.createAndStartTournament();
    }

    // Yaklaşan yarışmayı bildir (20:45 ve 20:55)
    if (trHour === TOURNAMENT_HOUR - 1 && (trMinute === 45 || trMinute === 55)) {
      const remaining = trMinute === 45 ? 15 : 5;
      this.io.emit('live_tournament_soon', {
        message: `🏆 Canlı Yarışma ${remaining} dakika sonra başlıyor! Hazırlan!`,
        minutesLeft: remaining,
      });
    }
  }

  private async createAndStartTournament() {
    try {
      // Aynı gün için zaten yarışma var mı?
      const today = new Date().toISOString().split('T')[0];
      const existing = await db('live_tournaments')
        .whereRaw(`DATE(scheduled_at) = ?`, [today])
        .first();
      if (existing) return;

      // Rastgele kategori seç
      const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

      const [id] = await db('live_tournaments').insert({
        category,
        status: 'active',
        scheduled_at: new Date().toISOString(),
        duration_seconds: 300, // 5 dakika oynama süresi
      }).returning('id');

      const tournamentId = id?.id ?? id;

      // Tüm bağlı kullanıcılara duyur
      this.io.emit('live_tournament_start', {
        tournamentId,
        category,
        message: `🏆 Canlı Yarışma başladı! Kategori: ${category} — 5 dakikan var!`,
        durationSeconds: 300,
      });

      console.log(`[LiveTournament] Started: #${tournamentId} — ${category}`);

      // 5 dakika sonra kapat
      this.activeRoomTimer = setTimeout(async () => {
        await this.closeTournament(tournamentId, category);
      }, 5 * 60 * 1000);

    } catch (err) {
      console.error('[LiveTournament] Error starting:', err);
    }
  }

  private async closeTournament(tournamentId: number, category: string) {
    try {
      await db('live_tournaments').where({ id: tournamentId }).update({ status: 'finished' });

      // İlk 3 kişi
      const top3 = await db('live_scores as ls')
        .join('users as u', 'ls.user_id', 'u.id')
        .where('ls.tournament_id', tournamentId)
        .orderBy([{ column: 'ls.score', order: 'desc' }, { column: 'ls.duration_ms', order: 'asc' }])
        .limit(3)
        .select('u.username', 'ls.score', 'ls.user_id');

      // Ödüller
      const rewards = [200, 100, 50];
      for (let i = 0; i < top3.length; i++) {
        await db('users').where({ id: (top3[i] as any).user_id }).increment({ coins: rewards[i] });
      }

      this.io.emit('live_tournament_end', {
        tournamentId,
        category,
        top3: top3.map((w, i) => ({ rank: i + 1, username: w.username, score: w.score })),
        message: '🏆 Canlı Yarışma bitti! Sonuçlar açıklandı.',
      });

      console.log(`[LiveTournament] Closed: #${tournamentId}`);
    } catch (err) {
      console.error('[LiveTournament] Error closing:', err);
    }
  }
}
