import { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSettingsStore } from '../src/store/settingsStore';
import { useUserStore } from '../src/store/userStore';
import { useGameStore } from '../src/store/gameStore';
import { Colors } from '../src/constants/colors';
import { socketService } from '../src/services/socket.service';
import { CATEGORIES } from '../src/constants/categories';
import { QuizMode } from '../src/components/game/modes/QuizMode';
import type { CategoryId } from '../src/constants/categories';
import api from '../src/services/api';

type Phase = 'lobby' | 'countdown' | 'playing' | 'result';

interface LiveStatus {
  status: 'none' | 'scheduled' | 'active';
  scheduledAt?: string;
  category?: string;
  participantCount?: number;
}

interface LeaderEntry {
  username: string;
  avatar_id: number;
  score: number;
  correct_answers: number;
  duration_ms: number;
}

export default function LiveTournamentScreen() {
  const { theme } = useSettingsStore();
  const { user } = useUserStore();
  const { score, startGame, endGame } = useGameStore();
  const C = Colors[theme];

  const [status, setStatus]       = useState<LiveStatus>({ status: 'none' });
  const [phase, setPhase]           = useState<Phase>('lobby');
  const [countdown, setCountdown]   = useState(3);
  const [tournamentId, setTournId]  = useState<number | null>(null);
  const [category, setCategory]     = useState<string>('general');
  const [serverQuestions, setServerQuestions] = useState<any[] | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [myScore, setMyScore]     = useState(0);
  const [participantCount, setParticipantCount] = useState(0);
  const [loading, setLoading]     = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft]   = useState(300);

  const startRef = useRef(Date.now());
  const endCalled = useRef(false);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadStatus();
    setupSocket();
    return () => cleanup();
  }, []);

  useEffect(() => {
    setMyScore(score);
  }, [score]);

  const loadStatus = async () => {
    try {
      const res = await api.get('/live/status');
      setStatus(res.data);
      if (res.data.participantCount) setParticipantCount(res.data.participantCount);
    } catch {} finally { setLoading(false); }
  };

  const setupSocket = () => {
    const socket = socketService.getSocket();
    if (!socket) return;

    socket.on('live_tournament_start', (data: { tournamentId: number; category: string; durationSeconds: number; questions?: any[] }) => {
      setTournId(data.tournamentId);
      setCategory(data.category);
      setTimeLeft(data.durationSeconds);
      setStatus({ status: 'active', category: data.category });
      if (data.questions?.length) setServerQuestions(data.questions);
      startCountdown();
    });

    socket.on('live_participant_count', (count: number) => setParticipantCount(count));

    socket.on('live_tournament_end', (data: { tournamentId: number; top3: LeaderEntry[] }) => {
      if (phase !== 'result') {
        endGame();
        setLeaderboard(data.top3);
        setPhase('result');
      }
    });
  };

  const cleanup = () => {
    const socket = socketService.getSocket();
    socket?.off('live_tournament_start');
    socket?.off('live_participant_count');
    socket?.off('live_tournament_end');
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const startCountdown = () => {
    setPhase('countdown');
    let c = 3;
    const iv = setInterval(() => {
      c--;
      setCountdown(c);
      if (c === 0) {
        clearInterval(iv);
        startGame((category as any) ?? 'general');
        setPhase('playing');
        startRef.current = Date.now();
        timerRef.current = setInterval(() => {
          setTimeLeft((t) => {
            if (t <= 1) { clearInterval(timerRef.current!); handleEnd(); return 0; }
            return t - 1;
          });
        }, 1000);
      }
    }, 1000);
  };

  const handleEnd = async () => {
    if (endCalled.current) return;
    endCalled.current = true;
    const result = endGame();
    if (submitted || !tournamentId) { setPhase('result'); return; }
    setSubmitted(true);
    try {
      await api.post('/live/submit', {
        tournamentId,
        score: result.score,
        correctAnswers: result.maxCombo, // proxy
        totalQuestions: 10,
        durationMs: Date.now() - startRef.current,
      });
      const lb = await api.get(`/live/leaderboard/${tournamentId}`);
      setLeaderboard(lb.data);
    } catch {}
    setPhase('result');
  };

  const cat = CATEGORIES.find((c) => c.id === category);
  const s = styles(C);

  // ── Yükleniyor ─────────────────────────────────────────────────────────
  if (loading) return (
    <SafeAreaView style={s.safe}>
      <ActivityIndicator color={C.accentTeal} style={{ marginTop: 60 }} />
    </SafeAreaView>
  );

  // ── Geri Sayım ────────────────────────────────────────────────────────
  if (phase === 'countdown') return (
    <SafeAreaView style={s.safe}>
      <View style={s.centerBox}>
        <Text style={[s.countdownNum, { color: '#e94560' }]}>{countdown}</Text>
        <Text style={[s.countdownSub, { color: C.textSecondary }]}>Hazır ol!</Text>
      </View>
    </SafeAreaView>
  );

  // ── Oyun ──────────────────────────────────────────────────────────────
  if (phase === 'playing') return (
    <SafeAreaView style={[s.safe, { backgroundColor: C.bgPrimary }]}>
      <View style={s.liveHeader}>
        <View style={[s.liveBadge, { backgroundColor: '#e94560' }]}>
          <Text style={s.liveDot}>🔴 CANLI</Text>
        </View>
        <Text style={[s.liveTimer, { color: C.textPrimary }]}>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</Text>
        <Text style={[s.liveParticipants, { color: C.textSecondary }]}>👥 {participantCount}</Text>
      </View>
      <QuizMode
        categoryId={(category as CategoryId) ?? 'general'}
        externalPool={serverQuestions ?? undefined}
        onEnd={handleEnd}
      />
    </SafeAreaView>
  );

  // ── Sonuç ─────────────────────────────────────────────────────────────
  if (phase === 'result') return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.resultContent}>
        <Text style={{ fontSize: 60, textAlign: 'center', marginBottom: 8 }}>🏆</Text>
        <Text style={[s.resultTitle, { color: C.textPrimary }]}>Yarışma Bitti!</Text>
        <View style={[s.myScoreCard, { backgroundColor: C.bgSecondary }]}>
          <Text style={[s.myScoreLabel, { color: C.textSecondary }]}>Puanın</Text>
          <Text style={[s.myScoreVal, { color: '#f0c040' }]}>{myScore.toLocaleString('tr-TR')}</Text>
        </View>
        {leaderboard.length > 0 && (
          <>
            <Text style={[s.lbTitle, { color: C.textPrimary }]}>🥇 Liderler</Text>
            {leaderboard.map((entry, i) => (
              <View key={i} style={[s.lbRow, { backgroundColor: C.bgSecondary }]}>
                <Text style={[s.lbRank, { color: i === 0 ? '#f0c040' : i === 1 ? '#aaa' : '#cd7f32' }]}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                </Text>
                <Text style={[s.lbName, { color: C.textPrimary }]}>{entry.username}</Text>
                <Text style={[s.lbScore, { color: C.accentTeal }]}>{entry.score.toLocaleString('tr-TR')}</Text>
              </View>
            ))}
          </>
        )}
        <TouchableOpacity style={[s.homeBtn, { backgroundColor: '#e94560' }]} onPress={() => router.replace('/(tabs)')}>
          <Text style={s.homeBtnText}>🏠 Ana Menüye Dön</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );

  // ── Lobi (bekle) ──────────────────────────────────────────────────────
  const scheduledDate = status.scheduledAt ? new Date(status.scheduledAt) : null;

  return (
    <SafeAreaView style={s.safe}>
      <TouchableOpacity onPress={() => router.back()} style={s.back}>
        <Text style={[s.backText, { color: C.textSecondary }]}>← Geri</Text>
      </TouchableOpacity>

      <View style={s.centerBox}>
        <Text style={{ fontSize: 72 }}>🏟️</Text>
        <Text style={[s.lobbyTitle, { color: C.textPrimary }]}>Günlük Canlı Yarışma</Text>

        {status.status === 'active' ? (
          <>
            <View style={[s.activeBadge, { backgroundColor: '#e9456020', borderColor: '#e94560' }]}>
              <Text style={{ color: '#e94560', fontFamily: 'Nunito-ExtraBold', fontSize: 16 }}>🔴 Şu an aktif!</Text>
            </View>
            {cat && <Text style={[s.lobbyCategory, { color: cat.color }]}>{cat.icon} {cat.name} kategorisi</Text>}
            <Text style={[s.lobbySub, { color: C.textSecondary }]}>👥 {participantCount} katılımcı</Text>
            <TouchableOpacity style={[s.joinBtn, { backgroundColor: '#e94560' }]} onPress={startCountdown}>
              <Text style={s.joinBtnText}>▶ Katıl!</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={[s.lobbyTime, { color: C.textPrimary }]}>Her gece saat <Text style={{ color: '#e94560' }}>21:00</Text>'de</Text>
            {scheduledDate && (
              <Text style={[s.lobbySub, { color: C.textSecondary }]}>
                Sonraki: {scheduledDate.toLocaleDateString('tr-TR', { weekday: 'long', hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
            <View style={[s.rulesCard, { backgroundColor: C.bgSecondary }]}>
              {[
                '🏆 Herkes aynı anda aynı soruları cevaplar',
                '⚡ Hızlı cevap daha fazla puan kazandırır',
                '📊 Anlık sıralama tablonu takip et',
                '🥇 İlk 3\'e özel coin ödülü',
              ].map((r, i) => (
                <Text key={i} style={[s.ruleText, { color: C.textPrimary }]}>{r}</Text>
              ))}
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  back: { padding: 16 },
  backText: { fontFamily: 'Nunito-Regular', fontSize: 15 },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 14 },
  countdownNum: { fontFamily: 'Nunito-ExtraBold', fontSize: 120, lineHeight: 130 },
  countdownSub: { fontFamily: 'Nunito-Regular', fontSize: 20 },
  liveHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: C.bgSecondary, borderBottomWidth: 1, borderBottomColor: C.border },
  liveBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  liveDot: { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#fff' },
  liveTimer: { fontFamily: 'Nunito-ExtraBold', fontSize: 18 },
  liveParticipants: { fontFamily: 'Nunito-Regular', fontSize: 13 },
  resultContent: { padding: 24, alignItems: 'center', gap: 14 },
  resultTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 26 },
  myScoreCard: { width: '100%', borderRadius: 16, padding: 20, alignItems: 'center' },
  myScoreLabel: { fontFamily: 'Nunito-Regular', fontSize: 13 },
  myScoreVal: { fontFamily: 'Nunito-ExtraBold', fontSize: 40 },
  lbTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 18, alignSelf: 'flex-start' },
  lbRow: { width: '100%', flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, gap: 10 },
  lbRank: { fontSize: 24, width: 32 },
  lbName: { flex: 1, fontFamily: 'Nunito-Bold', fontSize: 15 },
  lbScore: { fontFamily: 'Nunito-ExtraBold', fontSize: 16 },
  homeBtn: { width: '100%', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 8 },
  homeBtnText: { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: '#fff' },
  lobbyTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 24, textAlign: 'center' },
  lobbyTime: { fontFamily: 'Nunito-Bold', fontSize: 18 },
  lobbyCategory: { fontFamily: 'Nunito-ExtraBold', fontSize: 20 },
  lobbySub: { fontFamily: 'Nunito-Regular', fontSize: 14 },
  activeBadge: { borderRadius: 16, paddingHorizontal: 18, paddingVertical: 10, borderWidth: 2 },
  joinBtn: { width: '100%', borderRadius: 16, padding: 18, alignItems: 'center' },
  joinBtnText: { fontFamily: 'Nunito-ExtraBold', fontSize: 18, color: '#fff' },
  rulesCard: { width: '100%', borderRadius: 18, padding: 18, gap: 10 },
  ruleText: { fontFamily: 'Nunito-Regular', fontSize: 14 },
});
