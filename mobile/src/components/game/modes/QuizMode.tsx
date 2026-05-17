import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { useGameStore } from '../../../store/gameStore';
import { useUserStore } from '../../../store/userStore';
import type { CategoryId } from '../../../constants/categories';
import type { QuizQuestion } from '../../../types/quiz';
import { getAdaptiveQuestions } from '../../../data/questions/index';
import { assetService } from '../../../services/asset.service';

const { width } = Dimensions.get('window');

const BG      = '#0d0d1a';
const CARD    = '#13132a';
const BORDER  = '#2e2b5a';
const PURP    = '#6c3aed';
const GREEN   = '#22c55e';
const RED     = '#ef4444';
const TEXT    = '#ffffff';
const MUTED   = '#7c7aaa';
const LETTERS = ['A', 'B', 'C', 'D'];

function speedScore(elapsedMs: number): number {
  const s = elapsedMs / 1000;
  if (s <= 2)  return 30;
  if (s <= 4)  return 25;
  if (s <= 6)  return 20;
  if (s <= 9)  return 15;
  if (s <= 12) return 10;
  return 6;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const QUESTION_TIME = 15;
const SESSION_TIME  = 60;

interface Jokers { half: boolean; skip: boolean; time: boolean }

export interface Props {
  categoryId: CategoryId;
  onEnd: () => void;
  externalPool?: QuizQuestion[];
  lives?: number;
  onLifeLost?: () => void;
  onAnswer?: (correct: boolean, pts: number, qIndex: number) => void;
  onPause?: () => void;
  catIcon?: string;
}

export function QuizMode({ categoryId, onEnd, externalPool, lives: initialLives, onLifeLost, onAnswer, onPause, catIcon }: Props) {
  const { addScore, score, combo } = useGameStore();
  const { categoryPlayCounts } = useUserStore();

  const [pool] = useState<QuizQuestion[]>(() => {
    if (externalPool) return externalPool;
    const playCount = categoryPlayCounts[categoryId] ?? 0;
    return getAdaptiveQuestions(categoryId, playCount);
  });

  const [qIndex, setQIndex]           = useState(0);
  const [feedback, setFeedback]       = useState<{ correct: boolean; explanation?: string } | null>(null);
  const [streak, setStreak]           = useState(0);
  const [answered, setAnswered]       = useState(0);
  const [lives, setLives]             = useState(initialLives ?? 999);
  const [jokers, setJokers]           = useState<Jokers>({ half: true, skip: true, time: true });
  const [eliminated, setElim]         = useState<number[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [qTimeLeft, setQTimeLeft]     = useState(QUESTION_TIME);
  const [sessionLeft, setSessionLeft] = useState(SESSION_TIME);

  const qStartRef  = useRef(Date.now());
  const qTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const sesTimerRef= useRef<ReturnType<typeof setInterval> | null>(null);
  const endCalled  = useRef(false);
  const cardAnim   = useRef(new Animated.Value(1)).current;
  const cardSlide  = useRef(new Animated.Value(0)).current;
  const timerAnim  = useRef(new Animated.Value(1)).current;

  const isLiveMode = initialLives !== undefined;
  const current    = pool[qIndex];
  const total      = isLiveMode ? pool.length : 10;

  // Session timer (genel süre)
  useEffect(() => {
    if (isLiveMode) return;
    sesTimerRef.current = setInterval(() => {
      setSessionLeft(t => {
        if (t <= 1) {
          clearInterval(sesTimerRef.current!);
          if (!endCalled.current) { endCalled.current = true; onEnd(); }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(sesTimerRef.current!);
  }, []);

  // Soru sayacı
  useEffect(() => {
    qStartRef.current = Date.now();
    setQTimeLeft(QUESTION_TIME);
    timerAnim.setValue(1);
    Animated.timing(timerAnim, { toValue: 0, duration: QUESTION_TIME * 1000, useNativeDriver: false }).start();

    qTimerRef.current = setInterval(() => {
      setQTimeLeft(t => {
        if (t <= 1) { clearInterval(qTimerRef.current!); handleTimeOut(); return 0; }
        return t - 1;
      });
    }, 1000);

    return () => { if (qTimerRef.current) clearInterval(qTimerRef.current); timerAnim.stopAnimation(); };
  }, [qIndex]);

  const stopQTimer = () => { if (qTimerRef.current) clearInterval(qTimerRef.current); };

  const handleTimeOut = () => {
    if (feedback || endCalled.current) return;
    assetService.playSound('miss');
    setStreak(0);
    const newLives = lives - 1;
    if (isLiveMode) { setLives(newLives); onLifeLost?.(); }
    setFeedback({ correct: false, explanation: current?.e });
    onAnswer?.(false, 0, qIndex);
    setAnswered(n => n + 1);
    setTimeout(() => {
      setFeedback(null);
      if (isLiveMode && newLives <= 0) {
        if (!endCalled.current) { endCalled.current = true; onEnd(); }
      } else { nextQuestion(); }
    }, 1500);
  };

  const nextQuestion = () => {
    setElim([]);
    setSelectedIdx(null);
    cardSlide.setValue(0);
    Animated.sequence([
      Animated.parallel([
        Animated.timing(cardAnim,  { toValue: 0,   duration: 120, useNativeDriver: true }),
        Animated.timing(cardSlide, { toValue: -50, duration: 120, useNativeDriver: true }),
      ]),
      Animated.timing(cardSlide, { toValue: 40, duration: 0, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(cardAnim,  { toValue: 1,  duration: 200, useNativeDriver: true }),
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

  const handleChoice = (choiceIdx: number) => {
    if (!current || feedback || eliminated.includes(choiceIdx)) return;
    stopQTimer();
    setSelectedIdx(choiceIdx);

    const elapsed    = Date.now() - qStartRef.current;
    const isCorrect  = choiceIdx === current.c;
    const streakBonus = streak >= 5 ? 1.5 : streak >= 3 ? 1.25 : 1;
    const pts = isCorrect ? Math.round(speedScore(elapsed) * streakBonus) : 0;

    if (isCorrect) {
      addScore(pts);
      assetService.playSound('hit');
      assetService.vibrate(40);
      setStreak(s => s + 1);
    } else {
      assetService.playSound('miss');
      assetService.vibrate([0, 80]);
      setStreak(0);
      const newLives = lives - 1;
      if (isLiveMode) { setLives(newLives); onLifeLost?.(); }
    }

    setFeedback({ correct: isCorrect, explanation: current.e });
    onAnswer?.(isCorrect, pts, qIndex);
    setAnswered(n => n + 1);

    setTimeout(() => {
      setFeedback(null);
      if (isLiveMode && !isCorrect && lives - 1 <= 0) {
        if (!endCalled.current) { endCalled.current = true; onEnd(); }
      } else { nextQuestion(); }
    }, isCorrect ? 1000 : 1500);
  };

  const useHalf = () => {
    if (!jokers.half || !current || feedback) return;
    const wrongs = current.a.map((_, i) => i).filter(i => i !== current.c && !eliminated.includes(i));
    setElim(shuffle(wrongs).slice(0, 2));
    setJokers(j => ({ ...j, half: false }));
  };

  const useSkip = () => {
    if (!jokers.skip || feedback) return;
    stopQTimer();
    setJokers(j => ({ ...j, skip: false }));
    setAnswered(n => n + 1);
    nextQuestion();
  };

  const useTime = () => {
    if (!jokers.time || feedback) return;
    setJokers(j => ({ ...j, time: false }));
    setSessionLeft(t => Math.min(t + 60, SESSION_TIME * 2));
  };

  if (!current) return null;

  const timerWidth = timerAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const timerColor = timerAnim.interpolate({
    inputRange: [0, 0.33, 1],
    outputRange: ['#ef4444', '#f59e0b', '#22c55e'],
  });

  const progressPct = Math.min((qIndex + 1) / total, 1);

  return (
    <View style={s.root}>

      {/* ── Üst bar ── */}
      <View style={s.topBar}>
        {/* Kategori ikon + Soru No + Puan + Pause */}
        <View style={s.topRow}>
          <Text style={s.catIconTxt}>{catIcon ?? '🎮'}</Text>
          <Text style={s.soruTxt}>Soru {qIndex + 1} / {total}</Text>
          <Text style={s.puanTxt}>Puan: {score.toLocaleString('tr-TR')}</Text>
          {onPause && (
            <TouchableOpacity style={s.pauseBtn} onPress={onPause}>
              <Text style={{ fontSize: 18 }}>⏸</Text>
            </TouchableOpacity>
          )}
        </View>
        {/* Soru progress bar */}
        <View style={s.progressBg}>
          <View style={[s.progressFill, { width: `${progressPct * 100}%` }]} />
        </View>
      </View>

      {/* ── Süre çubuğu ── */}
      <View style={s.qTimerBg}>
        <Animated.View style={[s.qTimerFill, { width: timerWidth as any, backgroundColor: timerColor as any }]} />
        <Text style={s.qTimerNum}>{qTimeLeft}s</Text>
      </View>

      {/* ── Soru ── */}
      <Animated.View style={[s.questionBox, { opacity: cardAnim, transform: [{ translateX: cardSlide }] }]}>
        <Text style={s.questionTxt}>{current.q}</Text>
      </Animated.View>

      {/* ── Açıklama (feedback sonrası) ── */}
      {feedback && current.e ? (
        <View style={[s.explBox, { borderColor: feedback.correct ? GREEN + '55' : RED + '55' }]}>
          <Text style={s.explTxt}>💡 {current.e}</Text>
        </View>
      ) : null}

      {/* ── Seçenekler ── */}
      <View style={s.options}>
        {current.a.map((choice, i) => {
          const isElim     = eliminated.includes(i);
          const isCorrect  = i === current.c;
          const isSelected = i === selectedIdx;

          let bg       = CARD;
          let border   = BORDER;
          let textClr  = TEXT;
          let letterBg = '#1e1b3a';
          let letterClr= MUTED;

          if (feedback && !isElim) {
            if (isCorrect) {
              bg = GREEN + '22'; border = GREEN;
              textClr = GREEN; letterBg = GREEN; letterClr = '#fff';
            } else if (isSelected) {
              bg = RED + '22'; border = RED;
              textClr = RED; letterBg = RED; letterClr = '#fff';
            }
          }

          return (
            <TouchableOpacity
              key={i}
              style={[s.optionBtn, {
                backgroundColor: isElim ? '#0d0d1a' : bg,
                borderColor: isElim ? BORDER : border,
                opacity: isElim ? 0.3 : 1,
              }]}
              onPress={() => handleChoice(i)}
              disabled={isElim || !!feedback}
              activeOpacity={0.8}
            >
              <View style={[s.letter, { backgroundColor: letterBg }]}>
                <Text style={[s.letterTxt, { color: letterClr }]}>{LETTERS[i]}</Text>
              </View>
              <Text style={[s.optionTxt, { color: isElim ? '#444' : textClr }]} numberOfLines={2}>
                {choice}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Jokerler ── */}
      <View style={s.jokers}>
        <JokerBtn
          emoji="✂️" label="50:50"
          active={jokers.half} color="#ef4444"
          onPress={useHalf}
        />
        <JokerBtn
          emoji="🔄" label="Çek"
          active={jokers.time} color="#6c3aed"
          onPress={useTime}
        />
        <JokerBtn
          emoji="✕" label="Pas"
          active={jokers.skip} color="#7c7aaa"
          onPress={useSkip}
        />
      </View>

    </View>
  );
}

function JokerBtn({ emoji, label, active, color, onPress }: {
  emoji: string; label: string; active: boolean; color: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[js.btn, { borderColor: active ? color : '#2e2b5a', opacity: active ? 1 : 0.35 }]}
      onPress={onPress}
      disabled={!active}
      activeOpacity={0.75}
    >
      <Text style={js.emoji}>{emoji}</Text>
      <Text style={[js.label, { color: active ? color : MUTED }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const js = StyleSheet.create({
  btn:   { flex: 1, backgroundColor: CARD, borderRadius: 14, borderWidth: 1.5, paddingVertical: 12, alignItems: 'center', gap: 4 },
  emoji: { fontSize: 20 },
  label: { fontFamily: 'Nunito-Bold', fontSize: 12 },
});

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG, paddingHorizontal: 16 },

  // Üst bar
  topBar: { paddingTop: 10, marginBottom: 6 },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  catIconTxt: { fontSize: 20 },
  soruTxt: { fontFamily: 'Nunito-Bold', fontSize: 13, color: MUTED, flex: 1 },
  puanTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: TEXT },
  pauseBtn: { backgroundColor: '#1e1b3a', padding: 7, borderRadius: 20, marginLeft: 4 },
  progressBg:   { height: 4, backgroundColor: '#1e1b3a', borderRadius: 2, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: 4, backgroundColor: PURP, borderRadius: 2 },

  // Süre çubuğu
  qTimerBg: {
    height: 8, backgroundColor: '#1e1b3a', borderRadius: 4,
    overflow: 'hidden', marginBottom: 16, flexDirection: 'row',
  },
  qTimerFill: { height: 8, borderRadius: 4 },
  qTimerNum: {
    position: 'absolute', right: 6, top: -4,
    fontFamily: 'Nunito-Bold', fontSize: 10, color: MUTED,
  },

  // Soru
  questionBox: {
    backgroundColor: CARD,
    borderRadius: 20, padding: 22,
    marginBottom: 12,
    borderWidth: 1, borderColor: BORDER,
    minHeight: 90, justifyContent: 'center',
  },
  questionTxt: {
    fontFamily: 'Nunito-ExtraBold',
    fontSize: 17, color: TEXT,
    textAlign: 'center', lineHeight: 26,
  },

  // Açıklama
  explBox: {
    backgroundColor: '#1a1a35', borderRadius: 14,
    padding: 12, marginBottom: 10, borderWidth: 1,
  },
  explTxt: { fontFamily: 'Nunito-Regular', fontSize: 13, color: '#c4b5fd', textAlign: 'center', lineHeight: 20 },

  // Seçenekler
  options: { gap: 10, marginBottom: 14 },
  optionBtn: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16, borderWidth: 1.5,
    paddingVertical: 16, paddingHorizontal: 14,
    gap: 12,
  },
  letter: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  letterTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 15 },
  optionTxt: { fontFamily: 'Nunito-Bold', fontSize: 15, flex: 1 },

  // Jokerler
  jokers: { flexDirection: 'row', gap: 10 },
});
