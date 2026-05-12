import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useUserStore } from '../../src/store/userStore';
import { useGameStore } from '../../src/store/gameStore';
import { Colors } from '../../src/constants/colors';
import { socketService } from '../../src/services/socket.service';
import { QuizMode } from '../../src/components/game/modes/QuizMode';
import type { CategoryId } from '../../src/constants/categories';
import { Avatar } from '../../src/components/ui/Avatar';

interface OpponentState {
  username: string;
  avatarId: number;
  score: number;
  answered: number;
}

export default function DuelGameScreen() {
  const { duelId, cat } = useLocalSearchParams<{ duelId: string; cat: string }>();
  const { theme } = useSettingsStore();
  const { user } = useUserStore();
  const { score, startGame, endGame } = useGameStore();
  const C = Colors[theme];

  const [opponent, setOpponent] = useState<OpponentState | null>(null);
  const [myScore, setMyScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null);

  const scoreAnim = useRef(new Animated.Value(1)).current;
  const started = useRef(false);

  useEffect(() => {
    if (!started.current) {
      started.current = true;
      startGame((cat ?? 'general') as any);
    }

    const socket = socketService.getSocket();
    if (!socket) return;

    // Rakibin skor güncellemesi
    socket.on('duel_score_update', (data: { userId: string; score: number; answered: number }) => {
      if (data.userId !== user?.id) {
        setOpponent((o) => o ? { ...o, score: data.score, answered: data.answered } : o);
      }
    });

    // Rakip bağlandı
    socket.on('duel_opponent_info', (data: OpponentState) => {
      setOpponent(data);
    });

    // Düello bitti
    socket.on('duel_finished', (data: { winner: string; scores: Record<string, number> }) => {
      const result = endGame();
      if (data.winner === user?.id) setResult('win');
      else if (data.winner === 'draw') setResult('draw');
      else setResult('lose');
      setFinished(true);
    });

    // Rakip ayrıldı
    socket.on('duel_opponent_left', () => {
      setResult('win');
      endGame();
      setFinished(true);
    });

    return () => {
      socket.off('duel_score_update');
      socket.off('duel_opponent_info');
      socket.off('duel_finished');
      socket.off('duel_opponent_left');
    };
  }, []);

  // Her puan değişiminde rakibe bildir
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket || !duelId) return;
    socket.emit('duel_score', { duelId, score });
    setMyScore(score);

    Animated.sequence([
      Animated.timing(scoreAnim, { toValue: 1.3, duration: 120, useNativeDriver: true }),
      Animated.timing(scoreAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  }, [score]);

  const handleEnd = () => {
    const socket = socketService.getSocket();
    if (socket && duelId) socket.emit('duel_end', { duelId, score });
    if (!finished) {
      endGame();
      setFinished(true);
    }
  };

  const s = styles(C);

  // ── Sonuç ekranı ────────────────────────────────────────────────────────
  if (finished && result) {
    const emoji = result === 'win' ? '🏆' : result === 'draw' ? '🤝' : '😢';
    const msg   = result === 'win' ? 'Kazandın!' : result === 'draw' ? 'Berabere!' : 'Kaybettin!';
    const color = result === 'win' ? '#f0c040' : result === 'draw' ? C.accentTeal : C.danger;

    return (
      <SafeAreaView style={s.safe}>
        <View style={s.resultCenter}>
          <Text style={{ fontSize: 80, marginBottom: 12 }}>{emoji}</Text>
          <Text style={[s.resultTitle, { color }]}>{msg}</Text>
          <View style={[s.resultCard, { backgroundColor: C.bgSecondary }]}>
            <ScoreLine label={user?.username ?? 'Sen'} score={myScore} color={C.accentTeal} />
            <ScoreLine label={opponent?.username ?? 'Rakip'} score={opponent?.score ?? 0} color={C.danger} />
          </View>
          <View style={{ gap: 10, width: '100%', marginTop: 8 }}>
            <TouchableOpacity
              style={[s.actionBtn, { backgroundColor: '#8e44ad' }]}
              onPress={() => router.replace('/duel/lobby' as any)}
            >
              <Text style={s.actionBtnText}>⚔️ Tekrar Düello</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.actionBtn, { backgroundColor: C.bgSecondary }]}
              onPress={() => router.replace('/(tabs)')}
            >
              <Text style={[s.actionBtnText, { color: C.textPrimary }]}>🏠 Ana Menü</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Oyun ekranı ─────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[s.safe, { backgroundColor: C.bgPrimary }]}>
      {/* Skor karşılaştırma */}
      <View style={s.scoreBar}>
        {/* Sen */}
        <View style={s.playerBox}>
          <Avatar avatarId={user?.avatarId ?? 0} size={36} />
          <Text style={[s.playerName, { color: C.textPrimary }]} numberOfLines={1}>
            {user?.username ?? 'Sen'}
          </Text>
          <Animated.Text style={[s.playerScore, { color: C.accentTeal, transform: [{ scale: scoreAnim }] }]}>
            {myScore}
          </Animated.Text>
        </View>

        <Text style={[s.vsText, { color: C.textSecondary }]}>VS</Text>

        {/* Rakip */}
        <View style={[s.playerBox, { alignItems: 'flex-end' }]}>
          <Avatar avatarId={opponent?.avatarId ?? 1} size={36} />
          <Text style={[s.playerName, { color: C.textPrimary }]} numberOfLines={1}>
            {opponent?.username ?? 'Bekleniyor...'}
          </Text>
          <Text style={[s.playerScore, { color: C.accentRed }]}>
            {opponent?.score ?? 0}
          </Text>
        </View>
      </View>

      {/* Quiz */}
      <QuizMode categoryId={(cat ?? 'general') as CategoryId} onEnd={handleEnd} />
    </SafeAreaView>
  );
}

function ScoreLine({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
      <Text style={{ fontFamily: 'Nunito-Regular', fontSize: 14, color: '#888' }}>{label}</Text>
      <Text style={{ fontFamily: 'Nunito-ExtraBold', fontSize: 18, color }}>{score.toLocaleString('tr-TR')}</Text>
    </View>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  scoreBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: C.bgSecondary, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  playerBox: { flex: 1, alignItems: 'flex-start', gap: 2 },
  playerName: { fontFamily: 'Nunito-Bold', fontSize: 12, maxWidth: 100 },
  playerScore: { fontFamily: 'Nunito-ExtraBold', fontSize: 22 },
  vsText: { fontFamily: 'Nunito-ExtraBold', fontSize: 18, marginHorizontal: 8 },
  resultCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  resultTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 32, marginBottom: 24 },
  resultCard: { width: '100%', borderRadius: 20, padding: 20, marginBottom: 16 },
  actionBtn: { borderRadius: 16, padding: 18, alignItems: 'center' },
  actionBtnText: { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: '#fff' },
});
