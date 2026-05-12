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

// İngilizce kategorisi için soru üret
function buildEnglishPool(): QuizQuestion[] {
  return shuffle(ENGLISH_WORDS).map((word) => {
    const distractors = getDistractors(word, ENGLISH_WORDS, 3);
    return {
      q: word.english,
      a: shuffle([word.turkish, ...distractors]),
      c: 0, // c aşağıda doğru şekilde hesaplanır
      _correct: word.turkish,
    } as any;
  }).map((item: any) => ({
    q: item.q,
    a: item.a,
    c: (item.a as string[]).indexOf(item._correct),
  }));
}

// Türkçe sözlük kategorisi için soru üret
function buildTurkishPool(): QuizQuestion[] {
  const entries = Object.entries(WORD_HINTS);
  const allWords = Object.keys(WORD_HINTS);
  return shuffle(entries).map(([word, definition]) => {
    const distractors = shuffle(allWords.filter((w) => w !== word)).slice(0, 3);
    const choices = shuffle([word, ...distractors]);
    return {
      q: `"${definition}"`,
      a: choices,
      c: choices.indexOf(word),
    };
  });
}

interface Props {
  categoryId: CategoryId;
  onEnd: () => void;
}

export function QuizMode({ categoryId, onEnd }: Props) {
  const { addScore, combo } = useGameStore();
  const { theme } = useSettingsStore();
  const C = Colors[theme];

  const [pool] = useState<QuizQuestion[]>(() => {
    if (categoryId === 'english') return buildEnglishPool();
    if (categoryId === 'turkish') return buildTurkishPool();
    return getShuffledQuestions(categoryId);
  });

  const [qIndex, setQIndex] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; correct: boolean } | null>(null);
  const [streak, setStreak] = useState(0);
  const [answered, setAnswered] = useState(0);
  const endCalled = useRef(false);

  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(1)).current;

  const current = pool[qIndex];

  const isLanguageMode = ['english', 'german', 'french', 'arabic', 'spanish'].includes(categoryId);
  const isTurkishMode = categoryId === 'turkish';

  const nextQuestion = () => {
    Animated.sequence([
      Animated.timing(cardAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(cardAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setQIndex((i) => (i + 1) % pool.length);
  };

  const handleChoice = (choiceIndex: number) => {
    if (!current || feedback) return;

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
      setFeedback({ text: `❌ Yanlış! Cevap: "${current.a[current.c]}"`, correct: false });
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

  const s = styles(C);

  if (!current) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[s.emptyText, { color: C.textSecondary }]}>Tüm sorular bitti! 🎉</Text>
      </View>
    );
  }

  const questionLabel = isLanguageMode
    ? 'Bu kelimenin Türkçesi nedir?'
    : isTurkishMode
    ? 'Bu tanım hangi kelimeye ait?'
    : '';

  return (
    <View style={s.container}>
      <ScoreBar />
      <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
        <TimerBar
          duration={DURATION}
          isPlaying={true}
          onTimeUp={() => {
            if (!endCalled.current) {
              endCalled.current = true;
              onEnd();
            }
          }}
        />
      </View>
      <ComboBar combo={combo} />

      {/* İstatistik satırı */}
      <View style={s.statsRow}>
        {streak >= 3 && (
          <View style={[s.badge, { backgroundColor: '#f0c040' + '22', borderColor: '#f0c040' }]}>
            <Text style={[s.badgeText, { color: '#f0c040' }]}>🔥 {streak} seri</Text>
          </View>
        )}
        <View style={[s.badge, { backgroundColor: C.bgTertiary, borderColor: C.border }]}>
          <Text style={[s.badgeText, { color: C.textSecondary }]}>{answered} soru</Text>
        </View>
      </View>

      {/* Soru kartı */}
      <Animated.View style={[s.questionCard, { backgroundColor: C.bgSecondary, opacity: cardAnim }]}>
        {questionLabel ? (
          <Text style={[s.questionLabel, { color: C.textSecondary }]}>{questionLabel}</Text>
        ) : null}
        <Text
          style={[
            isLanguageMode ? s.bigQuestion : s.normalQuestion,
            { color: C.textPrimary },
          ]}
          numberOfLines={4}
        >
          {current.q}
        </Text>
      </Animated.View>

      {/* Geri bildirim */}
      {feedback && (
        <Animated.View style={[
          s.feedbackBox,
          {
            backgroundColor: feedback.correct ? C.success + '22' : C.danger + '22',
            opacity: feedbackAnim,
          },
        ]}>
          <Text style={[s.feedbackText, { color: feedback.correct ? C.success : C.danger }]}>
            {feedback.text}
          </Text>
        </Animated.View>
      )}

      {/* 4 şık */}
      <View style={s.choicesGrid}>
        {current.a.map((choice, i) => (
          <TouchableOpacity
            key={i}
            style={[s.choiceBtn, { backgroundColor: C.bgSecondary, borderColor: C.border }]}
            onPress={() => handleChoice(i)}
            activeOpacity={0.7}
          >
            <Text style={[s.choiceText, { color: C.textPrimary }]} numberOfLines={3}>
              {choice}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bgPrimary, paddingHorizontal: 16 },
  statsRow: { flexDirection: 'row', gap: 8, marginVertical: 10 },
  badge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  badgeText: { fontFamily: 'Nunito-Bold', fontSize: 12 },
  questionCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    minHeight: 130,
    justifyContent: 'center',
  },
  questionLabel: { fontFamily: 'Nunito-Regular', fontSize: 12, marginBottom: 10 },
  bigQuestion: { fontFamily: 'Nunito-ExtraBold', fontSize: 36, textAlign: 'center', letterSpacing: 1 },
  normalQuestion: { fontFamily: 'Nunito-Bold', fontSize: 17, textAlign: 'center', lineHeight: 26 },
  feedbackBox: { borderRadius: 12, padding: 12, alignItems: 'center', marginBottom: 10 },
  feedbackText: { fontFamily: 'Nunito-Bold', fontSize: 14, textAlign: 'center' },
  choicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  choiceBtn: {
    width: '47%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    minHeight: 64,
  },
  choiceText: { fontFamily: 'Nunito-Bold', fontSize: 14, textAlign: 'center' },
  emptyText: { fontFamily: 'Nunito-Bold', fontSize: 16 },
});
