import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, Modal, Alert } from 'react-native';
import { useGameStore } from '../../../store/gameStore';
import { useUserStore } from '../../../store/userStore';
import type { CategoryId } from '../../../constants/categories';
import type { QuizQuestion } from '../../../types/quiz';
import { getProgressiveQuestions } from '../../../data/questions/index';
import { seenQuestionsService } from '../../../services/seenQuestionsService';
import { assetService } from '../../../services/asset.service';

const { width } = Dimensions.get('window');

const BG      = '#ffffff';
const CARD    = '#ffffff';
const BORDER  = '#e5e7eb';
const PURP    = '#6c3aed';
const GREEN   = '#22c55e';
const RED     = '#ef4444';
const TEXT    = '#111827';
const MUTED   = '#9ca3af';
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
  questionCount?: number; // Kaç soru sonra bitsin (antrenman modu için)
  onLifeLost?: () => void;
  onAnswer?: (correct: boolean, pts: number, qIndex: number, answerIdx?: number) => void;
  onTimerTick?: (secondsLeft: number) => void;
  onPause?: () => void;
  catIcon?: string;
}

export function QuizMode({ categoryId, onEnd, externalPool, lives: initialLives, questionCount, onLifeLost, onAnswer, onTimerTick, onPause, catIcon }: Props) {
  const { addScore, score, combo } = useGameStore();
  const { categoryPlayCounts, jokers, useJoker, addJoker, addCoins, user } = useUserStore();

  const [buyModal, setBuyModal] = useState<{ type: 'fifty'|'change'|'pass'; price: number; label: string; emoji: string } | null>(null);

  const JOKER_PRICES = { fifty: 40, change: 30, pass: 20 };
  const JOKER_LABELS = { fifty: '50:50', change: 'Değiştir', pass: 'Pas' };
  const JOKER_EMOJIS = { fifty: '✂️', change: '🔀', pass: '✕' };

  const [pool, setPool]         = useState<QuizQuestion[]>([]);
  const [poolReady, setPoolReady] = useState(false);

  useEffect(() => {
    if (externalPool) { setPool(externalPool); setPoolReady(true); return; }
    const count = questionCount ?? (initialLives !== undefined ? 10 : 60);
    getProgressiveQuestions(categoryId, count).then(qs => {
      setPool(qs);
      setPoolReady(true);
    });
  }, []);

  const [qIndex, setQIndex]           = useState(0);
  const [feedback, setFeedback]       = useState<{ correct: boolean; explanation?: string } | null>(null);
  const [streak, setStreak]           = useState(0);
  const [answered, setAnswered]       = useState(0);
  const [lives, setLives]             = useState(initialLives ?? 999);
  const [jokersUsed, setJokersUsed]   = useState<Jokers>({ half: false, skip: false, time: false });
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

  const finishGame = () => {
    if (endCalled.current) return;
    endCalled.current = true;
    seenQuestionsService.markBatchAsSeen(categoryId, pool);
    onEnd();
  };

  // Session timer (genel süre)
  useEffect(() => {
    if (isLiveMode || !poolReady) return;
    sesTimerRef.current = setInterval(() => {
      setSessionLeft(t => {
        if (t <= 1) {
          clearInterval(sesTimerRef.current!);
          if (!endCalled.current) {
            endCalled.current = true;
            seenQuestionsService.markBatchAsSeen(categoryId, pool);
            onEnd();
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(sesTimerRef.current!);
  }, [poolReady]);

  // Soru sayacı
  useEffect(() => {
    if (!poolReady || !pool[qIndex]) return;
    qStartRef.current = Date.now();
    setQTimeLeft(QUESTION_TIME);
    timerAnim.setValue(1);
    Animated.timing(timerAnim, { toValue: 0, duration: QUESTION_TIME * 1000, useNativeDriver: false }).start();

    qTimerRef.current = setInterval(() => {
      setQTimeLeft(t => {
        const next = t <= 1 ? 0 : t - 1;
        onTimerTick?.(next);
        if (next === 0) { clearInterval(qTimerRef.current!); handleTimeOut(); }
        return next;
      });
    }, 1000);

    return () => { if (qTimerRef.current) clearInterval(qTimerRef.current); timerAnim.stopAnimation(); };
  }, [qIndex, poolReady]);

  const stopQTimer = () => { if (qTimerRef.current) clearInterval(qTimerRef.current); };

  const handleTimeOut = () => {
    if (feedback || endCalled.current) return;
    assetService.playSound('miss');
    assetService.vibrate('error');
    setStreak(0);
    const newLives = lives - 1;
    if (isLiveMode) { setLives(newLives); onLifeLost?.(); }
    setFeedback({ correct: false, explanation: current?.e });
    onAnswer?.(false, 0, qIndex);
    setAnswered(n => n + 1);
    setTimeout(() => {
      setFeedback(null);
      if (isLiveMode && newLives <= 0) {
        finishGame();
      } else { nextQuestion(); }
    }, 2500); // Süre dolunca 2.5sn bekle
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
      finishGame();
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
      assetService.vibrate(streak >= 3 ? 'combo' : 'success');
      setStreak(s => s + 1);
    } else {
      assetService.playSound('miss');
      assetService.vibrate('error');
      setStreak(0);
      const newLives = lives - 1;
      if (isLiveMode) { setLives(newLives); onLifeLost?.(); }
    }

    setFeedback({ correct: isCorrect, explanation: current.e });
    onAnswer?.(isCorrect, pts, qIndex, choiceIdx);
    setAnswered(n => n + 1);

    setTimeout(() => {
      setFeedback(null);
      if (isLiveMode && !isCorrect && lives - 1 <= 0) {
        finishGame();
      } else { nextQuestion(); }
    }, isCorrect ? 1800 : 2500); // Doğru: 1.8sn, Yanlış: 2.5sn
  };

  const openBuyOrUse = (type: 'fifty'|'change'|'pass', used: boolean, action: () => void) => {
    if (used || feedback) return;
    if ((jokers[type] ?? 0) > 0) {
      action();
    } else {
      // Joker yok → satın alma modal aç
      setBuyModal({
        type,
        price: JOKER_PRICES[type],
        label: JOKER_LABELS[type],
        emoji: JOKER_EMOJIS[type],
      });
    }
  };

  const confirmBuyJoker = () => {
    if (!buyModal) return;
    if ((user?.coins ?? 0) < buyModal.price) {
      setBuyModal(null);
      Alert.alert('Yetersiz Coin', `${buyModal.label} için ${buyModal.price} 🪙 gerekiyor.`);
      return;
    }
    addCoins(-buyModal.price);
    addJoker(buyModal.type, 1);
    // Satın alındı, hemen kullan
    const type = buyModal.type;
    setBuyModal(null);
    if (type === 'fifty') { triggerHalf(); }
    else if (type === 'change') { triggerChange(); }
    else if (type === 'pass') { triggerPass(); }
  };

  const triggerHalf = () => {
    if (jokersUsed.half || !current) return;
    useJoker('fifty');
    const wrongs = current.a.map((_, i) => i).filter(i => i !== current.c && !eliminated.includes(i));
    setElim(shuffle(wrongs).slice(0, 2));
    setJokersUsed(j => ({ ...j, half: true }));
  };

  const triggerChange = () => {
    if (jokersUsed.time) return;
    useJoker('change');
    stopQTimer();
    setJokersUsed(j => ({ ...j, time: true }));
    nextQuestion();
  };

  const triggerPass = () => {
    if (jokersUsed.skip) return;
    useJoker('pass');
    stopQTimer();
    setJokersUsed(j => ({ ...j, skip: true }));
    setAnswered(n => n + 1);
    nextQuestion();
  };

  const useHalf  = () => openBuyOrUse('fifty',  jokersUsed.half, triggerHalf);
  const useTime  = () => openBuyOrUse('change', jokersUsed.time, triggerChange);
  const useSkip  = () => openBuyOrUse('pass',   jokersUsed.skip, triggerPass);

  if (!poolReady) {
    return (
      <View style={[s.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontFamily: 'Nunito-Bold', fontSize: 15, color: MUTED }}>Sorular hazırlanıyor…</Text>
      </View>
    );
  }

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
        <View style={s.topRow}>
          <Text style={s.catIconTxt}>{catIcon ?? '🎮'}</Text>
          <Text style={s.soruTxt}>Soru {qIndex + 1} / {total}</Text>
          {/* Can ikonları — sadece lig modunda (antrenman 999 can = sonsuz, gösterme) */}
          {isLiveMode && initialLives !== 999 && (
            <View style={s.livesRow}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Text key={i} style={{ fontSize: 15, opacity: i < lives ? 1 : 0.18 }}>❤️</Text>
              ))}
            </View>
          )}
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

          let bg       = '#ffffff';
          let border   = '#e5e7eb';
          let textClr  = '#111827';
          let letterBg = '#f3f4f6';
          let letterClr= '#6b7280';

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
                backgroundColor: isElim ? '#f9fafb' : bg,
                borderColor: isElim ? '#e5e7eb' : border,
                opacity: isElim ? 0.4 : 1,
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
        <JokerBtn emoji="✂️" label="50:50"   count={jokers.fifty  ?? 0} used={jokersUsed.half} color="#ef4444" price={40}  onPress={useHalf} />
        <JokerBtn emoji="🔀" label="Değiştir" count={jokers.change ?? 0} used={jokersUsed.time} color="#6c3aed" price={30}  onPress={useTime} />
        <JokerBtn emoji="✕"  label="Pas"      count={jokers.pass   ?? 0} used={jokersUsed.skip} color="#7c7aaa" price={20}  onPress={useSkip} />
      </View>

      {/* Joker Satın Alma Modal */}
      <Modal visible={!!buyModal} transparent animationType="fade">
        <View style={s.buyOverlay}>
          <View style={s.buySheet}>
            <Text style={s.buyEmoji}>{buyModal?.emoji}</Text>
            <Text style={s.buyTitle}>{buyModal?.label} Joker</Text>
            <Text style={s.buySub}>Joker stokun bitti. Şimdi satın alıp kullan!</Text>
            <View style={s.buyPriceRow}>
              <Text style={s.buyPrice}>{buyModal?.price} 🪙</Text>
              <Text style={s.buyBalance}>Bakiye: {(user?.coins ?? 0).toLocaleString('tr-TR')} 🪙</Text>
            </View>
            <View style={s.buyBtns}>
              <TouchableOpacity style={s.buyCancelBtn} onPress={() => setBuyModal(null)}>
                <Text style={s.buyCancelTxt}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.buyConfirmBtn} onPress={confirmBuyJoker}>
                <Text style={s.buyConfirmTxt}>Satın Al & Kullan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

function JokerBtn({ emoji, label, used, color, count, price, onPress }: {
  emoji: string; label: string; used: boolean; color: string; count: number; price: number; onPress: () => void;
}) {
  const hasStock = count > 0;
  return (
    <TouchableOpacity
      style={[js.btn, { borderColor: used ? '#e5e7eb' : (hasStock ? color : color + '66') }]}
      onPress={onPress}
      disabled={used}
      activeOpacity={0.75}
    >
      {/* Stok sayısı — sağ üst köşede badge */}
      {!used && (
        <View style={[js.stockBadge, { backgroundColor: hasStock ? color : '#fbbf24' }]}>
          <Text style={js.stockTxt}>{hasStock ? count : `${price}🪙`}</Text>
        </View>
      )}
      {used && (
        <View style={[js.stockBadge, { backgroundColor: '#22c55e' }]}>
          <Text style={js.stockTxt}>✓</Text>
        </View>
      )}
      <Text style={[js.emoji, { opacity: used ? 0.3 : 1 }]}>{emoji}</Text>
      <Text style={[js.label, { color: used ? '#9ca3af' : color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const js = StyleSheet.create({
  btn:        { flex: 1, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1.5, borderColor: '#e5e7eb', paddingVertical: 10, alignItems: 'center', gap: 3 },
  emoji:      { fontSize: 20 },
  label:      { fontFamily: 'Nunito-Bold', fontSize: 11 },
  stockBadge: {
    position: 'absolute', top: -7, right: -7,
    minWidth: 20, height: 20, borderRadius: 10,
    backgroundColor: '#22c55e',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5, borderColor: '#fff',
    zIndex: 1,
  },
  stockTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 10, color: '#fff' },
});

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff', paddingHorizontal: 16 },

  // Üst bar
  topBar: { paddingTop: 10, marginBottom: 6 },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  catIconTxt: { fontSize: 20 },
  soruTxt: { fontFamily: 'Nunito-Bold', fontSize: 13, color: '#9ca3af', flex: 1 },
  puanTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: '#111827' },
  pauseBtn:  { backgroundColor: '#f3f4f6', padding: 7, borderRadius: 20, marginLeft: 4 },
  livesRow:  { flexDirection: 'row', gap: 2, alignItems: 'center' },
  progressBg:   { height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: 4, backgroundColor: PURP, borderRadius: 2 },

  // Süre çubuğu
  qTimerBg: {
    height: 8, backgroundColor: '#f3f4f6', borderRadius: 4,
    overflow: 'hidden', marginBottom: 16, flexDirection: 'row',
  },
  qTimerFill: { height: 8, borderRadius: 4 },
  qTimerNum: {
    position: 'absolute', right: 6, top: -4,
    fontFamily: 'Nunito-Bold', fontSize: 10, color: '#9ca3af',
  },

  // Soru
  questionBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 20, padding: 22,
    marginBottom: 12,
    borderWidth: 1, borderColor: '#e5e7eb',
    minHeight: 90, justifyContent: 'center',
    alignItems: 'center',
  },
  questionTxt: {
    fontFamily: 'Nunito-ExtraBold',
    fontSize: 17, color: '#111827',
    textAlign: 'center', lineHeight: 26,
  },
  vayBeBadge: {
    backgroundColor: '#fff7ed', borderRadius: 20, borderWidth: 1, borderColor: '#fed7aa',
    paddingHorizontal: 12, paddingVertical: 3, marginBottom: 10, alignSelf: 'center',
  },
  vayBeTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 12, color: '#ea580c' },

  // Açıklama
  explBox: {
    backgroundColor: '#ede9fe', borderRadius: 14,
    padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#c4b5fd',
  },
  explTxt: { fontFamily: 'Nunito-Regular', fontSize: 13, color: '#7c3aed', textAlign: 'center', lineHeight: 20 },

  // Seçenekler
  options: { gap: 10, marginBottom: 14 },
  optionBtn: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16, borderWidth: 1.5, borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    paddingVertical: 16, paddingHorizontal: 14,
    gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  letter: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  letterTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: '#6b7280' },
  optionTxt: { fontFamily: 'Nunito-Bold', fontSize: 15, flex: 1, color: '#111827' },

  // Jokerler
  jokers: { flexDirection: 'row', gap: 10, paddingTop: 8, overflow: 'visible' },

  // Satın alma modal
  buyOverlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 },
  buySheet:    { backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '100%', alignItems: 'center', gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 12 },
  buyEmoji:    { fontSize: 48 },
  buyTitle:    { fontFamily: 'Nunito-ExtraBold', fontSize: 20, color: '#111827' },
  buySub:      { fontFamily: 'Nunito-Regular', fontSize: 13, color: '#9ca3af', textAlign: 'center' },
  buyPriceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', backgroundColor: '#f9fafb', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, marginTop: 4 },
  buyPrice:    { fontFamily: 'Nunito-ExtraBold', fontSize: 20, color: '#6c3aed' },
  buyBalance:  { fontFamily: 'Nunito-Regular', fontSize: 12, color: '#9ca3af' },
  buyBtns:     { flexDirection: 'row', gap: 10, width: '100%', marginTop: 4 },
  buyCancelBtn:  { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  buyCancelTxt:  { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#6b7280' },
  buyConfirmBtn: { flex: 2, backgroundColor: '#6c3aed', borderRadius: 14, paddingVertical: 14, alignItems: 'center', shadowColor: '#6c3aed', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 5 },
  buyConfirmTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: '#fff' },
});
