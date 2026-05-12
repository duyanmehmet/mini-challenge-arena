import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useGameStore } from '../../../store/gameStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { Colors } from '../../../constants/colors';
import type { CategoryId } from '../../../constants/categories';
import type { QuizQuestion } from '../../../types/quiz';
import { getShuffledQuestions } from '../../../data/questions/index';
import { ENGLISH_WORDS, getDistractors } from '../../../constants/englishWords';
import { WORD_HINTS } from '../../../utils/wordHints';
import { TimerBar } from '../TimerBar';
import { ScoreBar } from '../ScoreBar';
import { ComboBar } from '../ComboBar';
import { assetService } from '../../../services/asset.service';

const DURATION = 60;
const BASE_PTS = 10;

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildEnglishPool(): QuizQuestion[] {
  return shuffle(ENGLISH_WORDS).map((word) => {
    const distractors = getDistractors(word, ENGLISH_WORDS, 3);
    const choices = shuffle([word.turkish, ...distractors]);
    return { q: word.english, a: choices, c: choices.indexOf(word.turkish) };
  });
}

function buildTurkishPool(): QuizQuestion[] {
  const entries = Object.entries(WORD_HINTS);
  const allWords = Object.keys(WORD_HINTS);
  return shuffle(entries).map(([word, definition]) => {
    const distractors = shuffle(allWords.filter((w) => w !== word)).slice(0, 3);
    const choices = shuffle([word, ...distractors]);
    return { q: `"${definition}"`, a: choices, c: choices.indexOf(word) };
  });
}

interface Jokers { half: boolean; skip: boolean; time: boolean }

interface Props {
  categoryId: CategoryId;
  onEnd: () => void;
  /** Dışarıdan soru havuzu verilirse (Klasik Tur / Düello) */
  externalPool?: QuizQuestion[];
  /** Kaç can hakkı — varsayılan sonsuz (timer modu) */
  lives?: number;
  onLifeLost?: () => void;
}

export function QuizMode({ categoryId, onEnd, externalPool, lives: initialLives, onLifeLost }: Props) {
  const { addScore, combo } = useGameStore();
  const { theme } = useSettingsStore();
  const C = Colors[theme];

  const [pool] = useState<QuizQuestion[]>(() => {
    if (externalPool) return externalPool;
    if (categoryId === 'english') return buildEnglishPool();
    if (categoryId === 'turkish') return buildTurkishPool();
    return getShuffledQuestions(categoryId);
  });

  const [qIndex, setQIndex] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; correct: boolean } | null>(null);
  const [streak, setStreak] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [lives, setLives] = useState(initialLives ?? 999);
  const [jokers, setJokers] = useState<Jokers>({ half: true, skip: true, time: true });
  // 50/50: indeksleri elimine edilen yanlış şıklar
  const [eliminated, setEliminated] = useState<number[]>([]);
  const [timerKey, setTimerKey] = useState(0); // timer reset için

  const endCalled = useRef(false);
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(1)).current;

  const isLiveMode = initialLives !== undefined;
  const isLanguageMode = ['english', 'german', 'french', 'arabic', 'spanish'].includes(categoryId);
  const isTurkishMode = categoryId === 'turkish';

  const current = pool[qIndex];

  const nextQuestion = () => {
    setEliminated([]);
    Animated.sequence([
      Animated.timing(cardAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(cardAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    const next = qIndex + 1;
    if (isLiveMode && next >= pool.length) {
      if (!endCalled.current) { endCalled.current = true; onEnd(); }
      return;
    }
    setQIndex(next % pool.length);
  };

  const handleChoice = (choiceIndex: number) => {
    if (!current || feedback || eliminated.includes(choiceIndex)) return;

    const isCorrect = choiceIndex === current.c;
    const streakBonus = streak >= 5 ? 2 : streak >= 3 ? 1.5 : 1;
    const pts = Math.round(BASE_PTS * streakBonus);

    if (isCorrect) {
      addScore(pts);
      assetService.playSound('hit');
      assetService.vibrate(40);
      setStreak((s) => s + 1);
      setFeedback({ text: `✅ Doğru! +${pts} puan`, correct: true });
    } else {
      assetService.playSound('miss');
      assetService.vibrate([0, 80]);
      setStreak(0);
      const newLives = lives - 1;
      setLives(newLives);
      onLifeLost?.();
      setFeedback({ text: `❌ Yanlış! Cevap: "${current.a[current.c]}"`, correct: false });
      if (isLiveMode && newLives <= 0) {
        Animated.sequence([
          Animated.timing(feedbackAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
          Animated.delay(900),
        ]).start(() => {
          if (!endCalled.current) { endCalled.current = true; onEnd(); }
        });
        return;
      }
    }

    setAnswered((n) => n + 1);

    Animated.sequence([
      Animated.timing(feedbackAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.delay(850),
      Animated.timing(feedbackAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setFeedback(null);
      nextQuestion();
    });
  };

  // ── Jokerler ──────────────────────────────────────────────────────────
  const useHalf = () => {
    if (!jokers.half || !current || feedback) return;
    const wrongs = current.a
      .map((_, i) => i)
      .filter((i) => i !== current.c && !eliminated.includes(i));
    const toElim = shuffle(wrongs).slice(0, 2);
    setEliminated(toElim);
    setJokers((j) => ({ ...j, half: false }));
  };

  const useSkip = () => {
    if (!jokers.skip || feedback) return;
    setJokers((j) => ({ ...j, skip: false }));
    setAnswered((n) => n + 1);
    nextQuestion();
  };

  const useTime = () => {
    if (!jokers.time || feedback) return;
    setJokers((j) => ({ ...j, time: false }));
    setTimerKey((k) => k + 1); // timer'ı sıfırla
  };

  const s = styles(C);

  if (!current) return null;

  const questionLabel = isLanguageMode
    ? 'Bu kelimenin Türkçesi nedir?'
    : isTurkishMode
    ? 'Bu tanım hangi kelimeye ait?'
    : '';

  return (
    <View style={s.container}>
      <ScoreBar />

      {/* Timer — sadece timer modunda */}
      {!isLiveMode && (
        <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
          <TimerBar
            key={timerKey}
            duration={60}
            isPlaying={true}
            onTimeUp={() => {
              if (!endCalled.current) { endCalled.current = true; onEnd(); }
            }}
          />
        </View>
      )}

      <ComboBar combo={combo} />

      {/* Üst satır: seri + can + soru sayısı */}
      <View style={s.statsRow}>
        {streak >= 3 && (
          <View style={[s.badge, { backgroundColor: '#f0c040' + '22', borderColor: '#f0c040' }]}>
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

      {/* Soru kartı */}
      <Animated.View style={[s.questionCard, { backgroundColor: C.bgSecondary, opacity: cardAnim }]}>
        {questionLabel ? (
          <Text style={[s.questionLabel, { color: C.textSecondary }]}>{questionLabel}</Text>
        ) : null}
        <Text
          style={[isLanguageMode ? s.bigQuestion : s.normalQuestion, { color: C.textPrimary }]}
          numberOfLines={4}
        >
          {current.q}
        </Text>
      </Animated.View>

      {/* Geri bildirim */}
      {feedback && (
        <Animated.View style={[
          s.feedbackBox,
          { backgroundColor: feedback.correct ? C.success + '22' : C.danger + '22', opacity: feedbackAnim },
        ]}>
          <Text style={[s.feedbackText, { color: feedback.correct ? C.success : C.danger }]}>
            {feedback.text}
          </Text>
        </Animated.View>
      )}

      {/* 4 şık */}
      <View style={s.choicesGrid}>
        {current.a.map((choice, i) => {
          const isElim = eliminated.includes(i);
          return (
            <TouchableOpacity
              key={i}
              style={[
                s.choiceBtn,
                {
                  backgroundColor: isElim ? C.bgTertiary : C.bgSecondary,
                  borderColor: isElim ? C.bgTertiary : C.border,
                  opacity: isElim ? 0.3 : 1,
                },
              ]}
              onPress={() => handleChoice(i)}
              activeOpacity={isElim ? 1 : 0.7}
              disabled={isElim}
            >
              <Text style={[s.choiceText, { color: C.textPrimary }]} numberOfLines={3}>
                {isElim ? '' : choice}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Jokerler */}
      <View style={s.jokerRow}>
        <TouchableOpacity
          style={[s.jokerBtn, { opacity: jokers.half ? 1 : 0.3, backgroundColor: C.bgSecondary, borderColor: '#e74c3c' }]}
          onPress={useHalf}
          disabled={!jokers.half}
        >
          <Text style={s.jokerIcon}>✂️</Text>
          <Text style={[s.jokerLabel, { color: '#e74c3c' }]}>50/50</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.jokerBtn, { opacity: jokers.skip ? 1 : 0.3, backgroundColor: C.bgSecondary, borderColor: '#3498db' }]}
          onPress={useSkip}
          disabled={!jokers.skip}
        >
          <Text style={s.jokerIcon}>⏭️</Text>
          <Text style={[s.jokerLabel, { color: '#3498db' }]}>Geç</Text>
        </TouchableOpacity>

        {!isLiveMode && (
          <TouchableOpacity
            style={[s.jokerBtn, { opacity: jokers.time ? 1 : 0.3, backgroundColor: C.bgSecondary, borderColor: '#2ecc71' }]}
            onPress={useTime}
            disabled={!jokers.time}
          >
            <Text style={s.jokerIcon}>⏱️</Text>
            <Text style={[s.jokerLabel, { color: '#2ecc71' }]}>+60s</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bgPrimary, paddingHorizontal: 16 },
  statsRow: { flexDirection: 'row', gap: 8, marginVertical: 8, flexWrap: 'wrap' },
  badge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  badgeText: { fontFamily: 'Nunito-Bold', fontSize: 12 },
  questionCard: {
    borderRadius: 20, padding: 22, alignItems: 'center', marginBottom: 12,
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8,
    minHeight: 120, justifyContent: 'center',
  },
  questionLabel: { fontFamily: 'Nunito-Regular', fontSize: 12, marginBottom: 8 },
  bigQuestion: { fontFamily: 'Nunito-ExtraBold', fontSize: 34, textAlign: 'center', letterSpacing: 1 },
  normalQuestion: { fontFamily: 'Nunito-Bold', fontSize: 16, textAlign: 'center', lineHeight: 24 },
  feedbackBox: { borderRadius: 12, padding: 10, alignItems: 'center', marginBottom: 8 },
  feedbackText: { fontFamily: 'Nunito-Bold', fontSize: 14, textAlign: 'center' },
  choicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  choiceBtn: {
    width: '47%', borderRadius: 14, padding: 14, alignItems: 'center',
    justifyContent: 'center', borderWidth: 1.5, minHeight: 60,
  },
  choiceText: { fontFamily: 'Nunito-Bold', fontSize: 13, textAlign: 'center' },
  jokerRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginTop: 4 },
  jokerBtn: {
    flex: 1, borderRadius: 14, paddingVertical: 10, alignItems: 'center', borderWidth: 1.5,
  },
  jokerIcon: { fontSize: 18, marginBottom: 2 },
  jokerLabel: { fontFamily: 'Nunito-Bold', fontSize: 11 },
});
