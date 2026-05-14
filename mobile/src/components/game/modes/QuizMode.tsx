import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useGameStore } from '../../../store/gameStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { Colors } from '../../../constants/colors';
import type { CategoryId } from '../../../constants/categories';
import type { QuizQuestion } from '../../../types/quiz';
import { getShuffledQuestions } from '../../../data/questions/index';
import { assetService } from '../../../services/asset.service';
import { TimerBar } from '../TimerBar';
import { ScoreBar } from '../ScoreBar';
import { ComboBar } from '../ComboBar';

/** Cevap hızına göre puan hesapla (0-15 saniye içinde) */
function speedScore(elapsedMs: number): number {
  const s = elapsedMs / 1000;
  if (s <= 2)  return 30;
  if (s <= 4)  return 25;
  if (s <= 6)  return 20;
  if (s <= 9)  return 15;
  if (s <= 12) return 10;
  return 6;
}

const QUESTION_TIME = 15; // saniye / soru
const SESSION_TIME  = 60; // genel süre (timer modu)

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

interface Jokers { half: boolean; skip: boolean; time: boolean }

export interface Props {
  categoryId: CategoryId;
  onEnd: () => void;
  externalPool?: QuizQuestion[];
  lives?: number;
  onLifeLost?: () => void;
  /** Düello modunda rakibin seçimini yayınlamak için */
  onAnswer?: (correct: boolean, pts: number, qIndex: number) => void;
}

export function QuizMode({ categoryId, onEnd, externalPool, lives: initialLives, onLifeLost, onAnswer }: Props) {
  const { addScore, combo } = useGameStore();
  const { theme } = useSettingsStore();
  const C = Colors[theme];

  const [pool] = useState<QuizQuestion[]>(() => {
    if (externalPool) return externalPool;
    // Kolaydan zora sırala, aynı zorluk içinde karıştır
    const raw = getShuffledQuestions(categoryId);
    return [...raw].sort((a, b) => (a.d ?? 2) - (b.d ?? 2));
  });

  const [qIndex, setQIndex]     = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; correct: boolean } | null>(null);
  const [streak, setStreak]     = useState(0);
  const [answered, setAnswered] = useState(0);
  const [lives, setLives]       = useState(initialLives ?? 999);
  const [jokers, setJokers]     = useState<Jokers>({ half: true, skip: true, time: true });
  const [eliminated, setElim]   = useState<number[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null); // seçilen şık highlight için
  const [sessionKey, setSessionKey] = useState(0); // session timer reset
  // Hız ölçümü
  const [qTimeLeft, setQTimeLeft] = useState(QUESTION_TIME);
  const qStartRef = useRef(Date.now());
  const qTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const endCalled    = useRef(false);
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const cardAnim     = useRef(new Animated.Value(1)).current;
  const cardSlide    = useRef(new Animated.Value(0)).current; // sağdan slide için
  const timerAnim    = useRef(new Animated.Value(1)).current;

  const isLiveMode = initialLives !== undefined;
  const current    = pool[qIndex];

  // ── Soru başına 15 sn sayaç — qIndex değişince yeniden başlar ────────
  useEffect(() => {
    qStartRef.current = Date.now();
    setQTimeLeft(QUESTION_TIME);
    timerAnim.setValue(1);
    Animated.timing(timerAnim, { toValue: 0, duration: QUESTION_TIME * 1000, useNativeDriver: false }).start();

    qTimerRef.current = setInterval(() => {
      setQTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(qTimerRef.current!);
          handleTimeOut();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (qTimerRef.current) clearInterval(qTimerRef.current);
      timerAnim.stopAnimation();
    };
  }, [qIndex]); // sadece soru değişince yenile

  const stopQTimer = () => {
    if (qTimerRef.current) clearInterval(qTimerRef.current);
  };

  const handleTimeOut = () => {
    if (feedback || endCalled.current) return;
    assetService.playSound('miss');
    assetService.vibrate([0, 60]);
    setStreak(0);
    const newLives = lives - 1;
    if (isLiveMode) {
      setLives(newLives);
      onLifeLost?.();
    }
    setFeedback({ text: `⏰ Süre doldu! Cevap: "${current?.a[current.c]}"`, correct: false });
    onAnswer?.(false, 0, qIndex);
    setAnswered((n) => n + 1);
    animateFeedback(() => {
      setFeedback(null);
      if (isLiveMode && newLives <= 0) {
        if (!endCalled.current) { endCalled.current = true; onEnd(); }
      } else {
        nextQuestion();
      }
    });
  };

  const nextQuestion = () => {
    setElim([]);
    setSelectedIdx(null);
    // Mevcut kart sola çıkar, yeni kart sağdan gelir
    cardSlide.setValue(0);
    Animated.sequence([
      // Hızlıca sola çık
      Animated.parallel([
        Animated.timing(cardAnim,  { toValue: 0,    duration: 120, useNativeDriver: true }),
        Animated.timing(cardSlide, { toValue: -60,  duration: 120, useNativeDriver: true }),
      ]),
      // Sağdan pozisyona al
      Animated.timing(cardSlide, { toValue: 40, duration: 0, useNativeDriver: true }),
      // İçeri süz
      Animated.parallel([
        Animated.timing(cardAnim,  { toValue: 1,   duration: 220, useNativeDriver: true }),
        Animated.spring(cardSlide, { toValue: 0, tension: 80, friction: 9, useNativeDriver: true }),
      ]),
    ]).start();
    const next = qIndex + 1;
    if (isLiveMode && next >= pool.length) {
      if (!endCalled.current) { endCalled.current = true; onEnd(); }
      return;
    }
    setQIndex(next % pool.length);
  };

  const animateFeedback = (cb: () => void, hasExplanation = false) => {
    const delay = hasExplanation ? 1800 : 800;
    Animated.sequence([
      Animated.timing(feedbackAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.delay(delay),
      Animated.timing(feedbackAnim, { toValue: 0, duration: 130, useNativeDriver: true }),
    ]).start(cb);
  };

  const handleChoice = (choiceIdx: number) => {
    if (!current || feedback || eliminated.includes(choiceIdx)) return;
    stopQTimer();
    setSelectedIdx(choiceIdx);

    const elapsed   = Date.now() - qStartRef.current;
    const isCorrect = choiceIdx === current.c;
    const streakBonus = streak >= 5 ? 1.5 : streak >= 3 ? 1.25 : 1;
    const pts = isCorrect ? Math.round(speedScore(elapsed) * streakBonus) : 0;

    const hasExpl = !!current.e;

    if (isCorrect) {
      addScore(pts);
      assetService.playSound('hit');
      assetService.vibrate(40);
      setStreak((s) => s + 1);
      const timeLabel = elapsed < 3000 ? ' ⚡Süper hızlı!' : elapsed < 6000 ? ' 🔥Hızlı!' : '';
      setFeedback({ text: `✅ Doğru! +${pts} puan${timeLabel}`, correct: true });
    } else {
      assetService.playSound('miss');
      assetService.vibrate([0, 80]);
      setStreak(0);
      const newLives = lives - 1;
      if (isLiveMode) { setLives(newLives); onLifeLost?.(); }
      setFeedback({ text: `❌ Yanlış! Cevap: "${current.a[current.c]}"`, correct: false });
      if (isLiveMode && newLives <= 0) {
        onAnswer?.(false, 0, qIndex);
        setAnswered((n) => n + 1);
        animateFeedback(() => { if (!endCalled.current) { endCalled.current = true; onEnd(); } }, hasExpl);
        return;
      }
    }

    onAnswer?.(isCorrect, pts, qIndex);
    setAnswered((n) => n + 1);
    animateFeedback(() => { setFeedback(null); nextQuestion(); }, hasExpl);
  };

  // ── Jokerler ──────────────────────────────────────────────────────────
  const useHalf = () => {
    if (!jokers.half || !current || feedback) return;
    const wrongs = current.a.map((_, i) => i).filter((i) => i !== current.c && !eliminated.includes(i));
    setElim(shuffle(wrongs).slice(0, 2));
    setJokers((j) => ({ ...j, half: false }));
  };

  const useSkip = () => {
    if (!jokers.skip || feedback) return;
    stopQTimer();
    setJokers((j) => ({ ...j, skip: false }));
    setAnswered((n) => n + 1);
    nextQuestion();
  };

  const useTime = () => {
    if (!jokers.time || feedback) return;
    setJokers((j) => ({ ...j, time: false }));
    setSessionKey((k) => k + 1);
  };

  const s = styles(C);

  if (!current) return null;

  const timerColor = timerAnim.interpolate({
    inputRange: [0, 0.33, 1],
    outputRange: ['#e74c3c', '#f0c040', '#2ecc71'],
  });

  return (
    <View style={s.container}>
      <ScoreBar showLives={isLiveMode} />

      {/* Session timer (timer modu) */}
      {!isLiveMode && (
        <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
          <TimerBar
            key={sessionKey}
            duration={SESSION_TIME}
            isPlaying={true}
            onTimeUp={() => { if (!endCalled.current) { endCalled.current = true; onEnd(); } }}
          />
        </View>
      )}

      <ComboBar combo={combo} />

      {/* Soru sayacı + can + seri */}
      <View style={s.statsRow}>
        {streak >= 3 && (
          <View style={[s.badge, { backgroundColor: '#f0c04033', borderColor: '#f0c040' }]}>
            <Text style={[s.badgeText, { color: '#f0c040' }]}>🔥 {streak} seri</Text>
          </View>
        )}
        {isLiveMode && (
          <View style={[s.badge, { backgroundColor: C.danger + '22', borderColor: C.danger }]}>
            <Text style={[s.badgeText, { color: C.danger }]}>{'❤️'.repeat(Math.max(lives, 0))}</Text>
          </View>
        )}
        <View style={[s.badge, { backgroundColor: C.bgTertiary, borderColor: C.border }]}>
          <Text style={[s.badgeText, { color: C.textSecondary }]}>
            {isLiveMode ? `${qIndex + 1}/${pool.length}` : `${answered} soru`}
          </Text>
        </View>
      </View>

      {/* Hız sayacı — soru başına 15 saniye */}
      <View style={s.qTimerRow}>
        <Animated.View style={[s.qTimerBar, { flex: timerAnim as any, backgroundColor: timerColor as any }]} />
        <Text style={[s.qTimerLabel, { color: C.textSecondary }]}>{qTimeLeft}s</Text>
      </View>

      {/* Soru kartı — sağdan slide animasyonu */}
      <Animated.View style={[s.questionCard, { backgroundColor: C.bgSecondary, opacity: cardAnim, transform: [{ translateX: cardSlide }] }]}>
        <Text style={[s.normalQuestion, { color: C.textPrimary }]} numberOfLines={5}>
          {current.q}
        </Text>
      </Animated.View>

      {/* Geri bildirim + Açıklama */}
      {feedback && (
        <Animated.View style={[
          s.feedbackBox,
          { backgroundColor: feedback.correct ? C.success + '22' : C.danger + '22', opacity: feedbackAnim },
        ]}>
          <Text style={[s.feedbackText, { color: feedback.correct ? C.success : C.danger }]}>
            {feedback.text}
          </Text>
          {current.e ? (
            <Text style={[s.explanationText, { color: C.textPrimary }]}>
              💡 {current.e}
            </Text>
          ) : null}
        </Animated.View>
      )}

      {/* 4 şık */}
      <View style={s.choicesGrid}>
        {current.a.map((choice, i) => {
          const isElim    = eliminated.includes(i);
          const isCorrect = i === current.c;
          const isSelected = i === selectedIdx;

          // Feedback gösterilirken renkleri uygula
          let bg          = C.bgSecondary;
          let border      = C.border;
          let textColor   = C.textPrimary;

          if (feedback && !isElim) {
            if (isCorrect) {
              bg     = C.success + '33';
              border = C.success;
              textColor = C.success;
            } else if (isSelected) {
              bg     = C.danger + '33';
              border = C.danger;
              textColor = C.danger;
            }
          }

          return (
            <TouchableOpacity
              key={i}
              style={[s.choiceBtn, {
                backgroundColor: isElim ? C.bgTertiary : bg,
                borderColor: isElim ? C.bgTertiary : border,
                opacity: isElim ? 0.25 : 1,
              }]}
              onPress={() => handleChoice(i)}
              disabled={isElim || !!feedback}
              activeOpacity={0.75}
            >
              <Text style={[s.choiceText, { color: isElim ? 'transparent' : textColor }]} numberOfLines={3}>
                {choice}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Jokerler */}
      <View style={s.jokerRow}>
        <JokerBtn icon="✂️" label="50/50"  color="#e74c3c" active={jokers.half} onPress={useHalf} />
        <JokerBtn icon="⏭️" label="Geç"   color="#3498db" active={jokers.skip} onPress={useSkip} />
        {!isLiveMode && (
          <JokerBtn icon="⏱️" label="+60s" color="#2ecc71" active={jokers.time} onPress={useTime} />
        )}
      </View>
    </View>
  );
}

function JokerBtn({ icon, label, color, active, onPress }: {
  icon: string; label: string; color: string; active: boolean; onPress: () => void;
}) {
  const { theme } = useSettingsStore();
  const C = Colors[theme];
  return (
    <TouchableOpacity
      style={[jStyle.btn, { backgroundColor: C.bgSecondary, borderColor: color, opacity: active ? 1 : 0.3 }]}
      onPress={onPress}
      disabled={!active}
    >
      <Text style={jStyle.icon}>{icon}</Text>
      <Text style={[jStyle.label, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const jStyle = StyleSheet.create({
  btn: { flex: 1, borderRadius: 14, paddingVertical: 10, alignItems: 'center', borderWidth: 1.5 },
  icon: { fontSize: 18, marginBottom: 2 },
  label: { fontFamily: 'Nunito-Bold', fontSize: 11 },
});

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bgPrimary, paddingHorizontal: 16 },
  statsRow: { flexDirection: 'row', gap: 8, marginVertical: 6, flexWrap: 'wrap' },
  badge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  badgeText: { fontFamily: 'Nunito-Bold', fontSize: 12 },
  qTimerRow: { flexDirection: 'row', alignItems: 'center', height: 8, borderRadius: 4, backgroundColor: C.bgTertiary, marginBottom: 10, overflow: 'hidden' },
  qTimerBar: { height: '100%', borderRadius: 4 },
  qTimerLabel: { fontFamily: 'Nunito-Bold', fontSize: 11, position: 'absolute', right: 4 },
  questionCard: {
    borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 10,
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6,
    minHeight: 110, justifyContent: 'center',
  },
  normalQuestion: { fontFamily: 'Nunito-Bold', fontSize: 16, textAlign: 'center', lineHeight: 24 },
  feedbackBox: { borderRadius: 12, padding: 12, alignItems: 'center', marginBottom: 8, gap: 6 },
  feedbackText: { fontFamily: 'Nunito-Bold', fontSize: 13, textAlign: 'center' },
  explanationText: { fontFamily: 'Nunito-Regular', fontSize: 12, textAlign: 'center', lineHeight: 18, paddingHorizontal: 4 },
  choicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  choiceBtn: { width: '47%', borderRadius: 14, padding: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, minHeight: 58 },
  choiceText: { fontFamily: 'Nunito-Bold', fontSize: 13, textAlign: 'center' },
  jokerRow: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
});
