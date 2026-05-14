import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSettingsStore } from '../src/store/settingsStore';
import { useGameStore } from '../src/store/gameStore';
import { useUserStore } from '../src/store/userStore';
import { Colors } from '../src/constants/colors';
import { CATEGORIES, type CategoryId } from '../src/constants/categories';
import { getRandomMixedQuestions } from '../src/data/questions/index';
import type { QuizQuestion } from '../src/types/quiz';
import { QuizMode } from '../src/components/game/modes/QuizMode';
import { gameService } from '../src/services/game.service';

const TOTAL_QUESTIONS = 10;
const MAX_LIVES = 3;

function buildPool(): Array<QuizQuestion & { categoryId: CategoryId }> {
  return getRandomMixedQuestions(TOTAL_QUESTIONS);
}

type Phase = 'intro' | 'playing' | 'result';

export default function ClassicTourScreen() {
  const { theme } = useSettingsStore();
  const { startGame, endGame } = useGameStore();
  const { addXP, addCoins, updateUser } = useUserStore();
  const C = Colors[theme];

  const [phase, setPhase]     = useState<Phase>('intro');
  const [pool]                = useState(buildPool);
  const [currentQ, setCurrentQ] = useState(0); // UI için — kategori rozetini güncellemek
  const [correctCount, setCorrectCount] = useState(0);
  const [finalScore, setFinalScore]   = useState(0);
  const [droppedAt, setDroppedAt]     = useState<number | null>(null);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,  duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleStart = () => {
    startGame('general');
    setPhase('playing');
  };

  // QuizMode her cevaptan sonra burayı çağırır
  const handleAnswer = (correct: boolean, _pts: number, qIdx: number) => {
    setCurrentQ(qIdx + 1); // bir sonraki soruya geç (badge için)
    if (correct) setCorrectCount((n) => n + 1);
    else shake();
  };

  const handleEnd = () => {
    const result = endGame();
    const finalPts = result.score;
    setFinalScore(finalPts);
    // currentQ = kaçıncı soruda bitirildi (0-indexed → +1)
    const dropped = currentQ < TOTAL_QUESTIONS - 1 ? currentQ + 1 : null;
    setDroppedAt(dropped);
    setPhase('result');

    // XP & coin
    const xp = 15 + (dropped === null ? 20 : 0); // turu tamamlarsa bonus
    addXP(xp);
    addCoins(Math.floor(finalPts / 80) + 5);

    // Backend'e kaydet
    gameService.submitResult({
      mode: 'general',
      score: finalPts,
      duration_seconds: Math.floor(result.durationSeconds),
      combo_max: result.maxCombo,
    }).then((res) => {
      if (res?.streakCount !== undefined) updateUser({ streakCount: res.streakCount });
      if (res?.newLevel) updateUser({ level: res.newLevel });
    }).catch(() => {});
  };

  const s = styles(C);
  const catCfg = pool[Math.min(currentQ, pool.length - 1)]
    ? CATEGORIES.find((c) => c.id === pool[Math.min(currentQ, pool.length - 1)].categoryId)
    : null;

  // ── Intro ───────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <SafeAreaView style={s.safe}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Text style={[s.backText, { color: C.textSecondary }]}>← Geri</Text>
        </TouchableOpacity>
        <View style={s.center}>
          <Text style={s.bigEmoji}>🏆</Text>
          <Text style={[s.title, { color: C.textPrimary }]}>Klasik Tur</Text>
          <Text style={[s.subtitle, { color: C.textSecondary }]}>
            10 soru · 3 can · Karışık kategoriler
          </Text>
          <View style={[s.rulesCard, { backgroundColor: C.bgSecondary }]}>
            {[
              '🎯 10 soruda en yüksek skoru yap',
              '❤️ 3 can hakkın var — yanlış = 1 can',
              '✂️ 50/50 ve Geç jokerlerini kullan',
              '⚡ Hızlı cevap daha fazla puan kazandırır',
              '📂 Her sorunun kategorisi gösterilir',
            ].map((rule, i) => (
              <Text key={i} style={[s.ruleText, { color: C.textPrimary }]}>{rule}</Text>
            ))}
          </View>
          <TouchableOpacity style={[s.startBtn, { backgroundColor: '#e94560' }]} onPress={handleStart}>
            <Text style={s.startText}>▶ Başla!</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Sonuç ───────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const pct   = Math.round((correctCount / TOTAL_QUESTIONS) * 100);
    const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '👏' : pct >= 40 ? '🙂' : '😅';
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <Text style={s.bigEmoji}>{emoji}</Text>
          <Text style={[s.title, { color: C.textPrimary }]}>
            {droppedAt ? `${droppedAt}. Soruda Düştün!` : 'Turu Tamamladın!'}
          </Text>
          <View style={[s.rulesCard, { backgroundColor: C.bgSecondary }]}>
            <ResultRow label="Toplam Puan"   value={finalScore.toLocaleString('tr-TR')} color='#f0c040' />
            <ResultRow label="Doğru Cevap"   value={`${correctCount} / ${TOTAL_QUESTIONS}`} color={C.success} />
            <ResultRow label="Başarı Oranı"  value={`%${pct}`} color={C.accentTeal} />
            {droppedAt && <ResultRow label="Düştüğün Soru" value={`${droppedAt}. Soru`} color={C.danger} />}
          </View>
          <TouchableOpacity
            style={[s.startBtn, { backgroundColor: '#e94560' }]}
            onPress={() => router.replace('/classic' as any)}
          >
            <Text style={s.startText}>🔄 Tekrar Oyna</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.startBtn, { backgroundColor: C.bgSecondary, marginTop: 10 }]}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={[s.startText, { color: C.textPrimary }]}>🏠 Ana Menü</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Oyun ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[s.safe, { backgroundColor: C.bgPrimary }]}>
      {/* Kategori rozeti + Can */}
      <Animated.View style={[s.gameTopBar, { transform: [{ translateX: shakeAnim }] }]}>
        {catCfg ? (
          <View style={[s.catBadge, { backgroundColor: catCfg.color + '22', borderColor: catCfg.color }]}>
            <Text style={s.catBadgeIcon}>{catCfg.icon}</Text>
            <Text style={[s.catBadgeName, { color: catCfg.color }]}>{catCfg.name}</Text>
          </View>
        ) : <View />}
        <Text style={[s.qCounter, { color: C.textSecondary }]}>
          {Math.min(currentQ + 1, TOTAL_QUESTIONS)}/{TOTAL_QUESTIONS}
        </Text>
      </Animated.View>

      {/* Tüm pool tek seferde verilir — QuizMode can takibi yapar */}
      <QuizMode
        categoryId={pool[0]?.categoryId ?? 'general'}
        externalPool={pool}
        lives={MAX_LIVES}
        onEnd={handleEnd}
        onAnswer={handleAnswer}
      />
    </SafeAreaView>
  );
}

function ResultRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
      <Text style={{ fontFamily: 'Nunito-Regular', fontSize: 14, color: '#888' }}>{label}</Text>
      <Text style={{ fontFamily: 'Nunito-ExtraBold', fontSize: 16, color }}>{value}</Text>
    </View>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  back: { padding: 16 },
  backText: { fontFamily: 'Nunito-Regular', fontSize: 15 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 12 },
  bigEmoji: { fontSize: 72 },
  title: { fontFamily: 'Nunito-ExtraBold', fontSize: 26, textAlign: 'center' },
  subtitle: { fontFamily: 'Nunito-Regular', fontSize: 14, textAlign: 'center' },
  rulesCard: { width: '100%', borderRadius: 20, padding: 20, gap: 10 },
  ruleText: { fontFamily: 'Nunito-Regular', fontSize: 14, lineHeight: 22 },
  startBtn: { width: '100%', borderRadius: 16, padding: 18, alignItems: 'center' },
  startText: { fontFamily: 'Nunito-ExtraBold', fontSize: 18, color: '#fff' },
  gameTopBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  catBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1.5 },
  catBadgeIcon: { fontSize: 16 },
  catBadgeName: { fontFamily: 'Nunito-Bold', fontSize: 13 },
  qCounter: { fontFamily: 'Nunito-Bold', fontSize: 14 },
});
