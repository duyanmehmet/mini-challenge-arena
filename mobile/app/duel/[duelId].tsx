import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useUserStore } from '../../src/store/userStore';
import { useGameStore } from '../../src/store/gameStore';
import { Colors } from '../../src/constants/colors';
import { socketService } from '../../src/services/socket.service';
import { QuizMode } from '../../src/components/game/modes/QuizMode';
import type { CategoryId } from '../../src/constants/categories';
import { Avatar } from '../../src/components/ui/Avatar';
import type { QuizQuestion } from '../../src/types/quiz';

interface OpponentState {
  username: string;
  avatarId: number;
  score: number;
  qIndex: number;    // kaçıncı soruda
  answered: number;
  lastCorrect: boolean | null;
}

type Phase = 'waiting' | 'countdown' | 'playing' | 'result';

export default function DuelGameScreen() {
  const { duelId, cat } = useLocalSearchParams<{ duelId: string; cat: string }>();
  const { theme } = useSettingsStore();
  const { user } = useUserStore();
  const { score, startGame, endGame } = useGameStore();
  const C = Colors[theme];

  const [phase, setPhase]         = useState<Phase>('waiting');
  const [countdown, setCountdown] = useState(3);
  const [opponent, setOpponent]   = useState<OpponentState | null>(null);
  const [sharedPool, setSharedPool] = useState<QuizQuestion[] | null>(null);
  const [myScore, setMyScore]     = useState(0);
  const [result, setResult]       = useState<'win' | 'lose' | 'draw' | null>(null);
  const [finalScores, setFinalScores] = useState<{ me: number; opp: number } | null>(null);

  const opponentScaleAnim = useRef(new Animated.Value(1)).current;
  const started = useRef(false);

  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    // Sunucu her iki oyuncuya aynı soru havuzunu gönderir
    socket.on('duel_questions', (data: { questions: QuizQuestion[] }) => {
      setSharedPool(data.questions);
      startCountdown();
    });

    // Rakibin canlı durumu
    socket.on('duel_opponent_update', (data: OpponentState) => {
      setOpponent(data);
      Animated.sequence([
        Animated.timing(opponentScaleAnim, { toValue: 1.2, duration: 120, useNativeDriver: true }),
        Animated.timing(opponentScaleAnim, { toValue: 1,   duration: 120, useNativeDriver: true }),
      ]).start();
    });

    // Rakip bağlandı
    socket.on('duel_opponent_joined', (info: { username: string; avatarId: number }) => {
      setOpponent({ ...info, score: 0, qIndex: 0, answered: 0, lastCorrect: null });
    });

    // Düello bitti
    socket.on('duel_finished', (data: { winner: string | 'draw'; myScore: number; oppScore: number }) => {
      endGame();
      setFinalScores({ me: data.myScore, opp: data.oppScore });
      setResult(data.winner === user?.id ? 'win' : data.winner === 'draw' ? 'draw' : 'lose');
      setPhase('result');
    });

    // Rakip bağlantıyı kesti
    socket.on('duel_opponent_left', () => {
      endGame();
      setResult('win');
      setFinalScores({ me: score, opp: opponent?.score ?? 0 });
      setPhase('result');
    });

    // Düelloya katıl — kategori ve kullanıcı bilgisiyle
    if (!started.current) {
      started.current = true;
      socket.emit('duel_join', { duelId, userId: user?.id, category: cat ?? 'general' });
      startGame((cat ?? 'general') as any);
    }

    return () => {
      socket.off('duel_questions');
      socket.off('duel_opponent_update');
      socket.off('duel_opponent_joined');
      socket.off('duel_finished');
      socket.off('duel_opponent_left');
    };
  }, []);

  // Score değişince rakibe bildir
  useEffect(() => {
    setMyScore(score);
    const socket = socketService.getSocket();
    if (socket && duelId && phase === 'playing') {
      socket.emit('duel_update', { duelId, score, userId: user?.id });
    }
  }, [score]);

  const startCountdown = () => {
    setPhase('countdown');
    let c = 3;
    const iv = setInterval(() => {
      c--;
      setCountdown(c);
      if (c === 0) { clearInterval(iv); setPhase('playing'); }
    }, 1000);
  };

  const handleAnswer = (correct: boolean, pts: number, qIdx: number) => {
    const socket = socketService.getSocket();
    if (socket && duelId) {
      socket.emit('duel_answer', { duelId, userId: user?.id, correct, pts, qIndex: qIdx });
    }
  };

  const handleEnd = () => {
    const socket = socketService.getSocket();
    if (socket && duelId) socket.emit('duel_done', { duelId, userId: user?.id, score });
    endGame();
    // Sonuç sunucudan gelecek — duel_finished eventi
  };

  const s = styles(C);

  // ── Bekleme ────────────────────────────────────────────────────────────
  if (phase === 'waiting') {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.centerBox}>
          <Text style={{ fontSize: 60 }}>⚔️</Text>
          <Text style={[s.waitTitle, { color: C.textPrimary }]}>Rakip bekleniyor...</Text>
          {opponent && (
            <View style={[s.opponentChip, { backgroundColor: C.bgSecondary }]}>
              <Avatar avatarId={opponent.avatarId} size={36} />
              <Text style={[s.opponentName, { color: C.textPrimary }]}>{opponent.username} bağlandı!</Text>
            </View>
          )}
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 24 }}>
            <Text style={{ color: C.textSecondary, fontFamily: 'Nunito-Regular' }}>Vazgeç</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Geri sayım ─────────────────────────────────────────────────────────
  if (phase === 'countdown') {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.centerBox}>
          <Text style={[s.countdownNum, { color: C.accentRed ?? '#e94560' }]}>{countdown}</Text>
          <Text style={[s.countdownLabel, { color: C.textSecondary }]}>Hazır ol!</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Sonuç ──────────────────────────────────────────────────────────────
  if (phase === 'result' && result) {
    const emoji = result === 'win' ? '🏆' : result === 'draw' ? '🤝' : '😢';
    const msg   = result === 'win' ? 'Kazandın!' : result === 'draw' ? 'Berabere!' : 'Kaybettin!';
    const color = result === 'win' ? '#f0c040' : result === 'draw' ? C.accentTeal : C.danger;
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.centerBox}>
          <Text style={{ fontSize: 80, marginBottom: 12 }}>{emoji}</Text>
          <Text style={[s.resultTitle, { color }]}>{msg}</Text>
          <View style={[s.resultCard, { backgroundColor: C.bgSecondary }]}>
            <ScoreRow label={user?.username ?? 'Sen'} score={finalScores?.me ?? myScore} color={C.accentTeal} />
            <ScoreRow label={opponent?.username ?? 'Rakip'} score={finalScores?.opp ?? (opponent?.score ?? 0)} color={C.danger} />
          </View>
          <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#8e44ad' }]} onPress={() => router.replace('/duel/lobby' as any)}>
            <Text style={s.actionText}>⚔️ Tekrar Düello</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionBtn, { backgroundColor: C.bgSecondary, marginTop: 10 }]} onPress={() => router.replace('/(tabs)')}>
            <Text style={[s.actionText, { color: C.textPrimary }]}>🏠 Ana Menü</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Oyun ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[s.safe, { backgroundColor: C.bgPrimary }]}>
      {/* Canlı skor karşılaştırma */}
      <View style={s.scoreHeader}>
        {/* Ben */}
        <View style={s.playerCol}>
          <Avatar avatarId={user?.avatarId ?? 0} size={32} />
          <Text style={[s.playerName, { color: C.textPrimary }]} numberOfLines={1}>
            {user?.username ?? 'Sen'}
          </Text>
          <Text style={[s.playerScore, { color: C.accentTeal }]}>{myScore}</Text>
        </View>

        <Text style={[s.vs, { color: C.textSecondary }]}>VS</Text>

        {/* Rakip */}
        <View style={[s.playerCol, { alignItems: 'flex-end' }]}>
          <Avatar avatarId={opponent?.avatarId ?? 1} size={32} />
          <Text style={[s.playerName, { color: C.textPrimary }]} numberOfLines={1}>
            {opponent?.username ?? '...'}
          </Text>
          <Animated.Text style={[s.playerScore, { color: C.danger, transform: [{ scale: opponentScaleAnim }] }]}>
            {opponent?.score ?? 0}
          </Animated.Text>
        </View>
      </View>

      {/* Rakibin soru ilerlemesi */}
      {opponent && (
        <View style={[s.oppProgress, { backgroundColor: C.bgSecondary }]}>
          <Text style={[s.oppProgressText, { color: C.textSecondary }]}>
            {opponent.username}: {opponent.answered}. soru
            {opponent.lastCorrect === true ? ' ✅' : opponent.lastCorrect === false ? ' ❌' : ''}
          </Text>
        </View>
      )}

      {/* Quiz */}
      <QuizMode
        categoryId={(cat ?? 'general') as CategoryId}
        externalPool={sharedPool ?? undefined}
        onEnd={handleEnd}
        onAnswer={handleAnswer}
      />
    </SafeAreaView>
  );
}

function ScoreRow({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
      <Text style={{ fontFamily: 'Nunito-Regular', fontSize: 14, color: '#888' }}>{label}</Text>
      <Text style={{ fontFamily: 'Nunito-ExtraBold', fontSize: 20, color }}>{score.toLocaleString('tr-TR')}</Text>
    </View>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  waitTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 22 },
  opponentChip: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 16, padding: 12, marginTop: 8 },
  opponentName: { fontFamily: 'Nunito-Bold', fontSize: 15 },
  countdownNum: { fontFamily: 'Nunito-ExtraBold', fontSize: 100, lineHeight: 110 },
  countdownLabel: { fontFamily: 'Nunito-Regular', fontSize: 18 },
  scoreHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: C.bgSecondary, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  playerCol: { flex: 1, alignItems: 'flex-start', gap: 2 },
  playerName: { fontFamily: 'Nunito-Bold', fontSize: 12, maxWidth: 110 },
  playerScore: { fontFamily: 'Nunito-ExtraBold', fontSize: 24 },
  vs: { fontFamily: 'Nunito-ExtraBold', fontSize: 16, marginHorizontal: 8 },
  oppProgress: { paddingHorizontal: 16, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: C.border },
  oppProgressText: { fontFamily: 'Nunito-Regular', fontSize: 12 },
  resultTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 30, marginBottom: 20 },
  resultCard: { width: '100%', borderRadius: 20, padding: 20, marginBottom: 16 },
  actionBtn: { width: '100%', borderRadius: 16, padding: 18, alignItems: 'center' },
  actionText: { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: '#fff' },
});
