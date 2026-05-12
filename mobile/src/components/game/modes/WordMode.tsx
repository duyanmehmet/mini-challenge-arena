import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useGameStore } from '../../../store/gameStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { Colors } from '../../../constants/colors';
import { WORD_HINTS } from '../../../utils/wordHints';
import { TimerBar } from '../TimerBar';
import { ScoreBar } from '../ScoreBar';
import { ComboBar } from '../ComboBar';
import { assetService } from '../../../services/asset.service';

const DURATION = 60;
const BASE_POINTS = 15;

// Tüm sözlükten soru havuzu oluştur
const ALL_ENTRIES = Object.entries(WORD_HINTS); // [word, definition][]
const ALL_WORDS = Object.keys(WORD_HINTS);

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

interface Question {
  word: string;
  definition: string;
  choices: string[]; // 4 kelime seçeneği
}

function buildQuestion(usedWords: Set<string>): Question | null {
  const remaining = ALL_ENTRIES.filter(([w]) => !usedWords.has(w));
  if (remaining.length === 0) return null;

  const [word, definition] = remaining[Math.floor(Math.random() * remaining.length)];

  // 3 yanlış seçenek — aynı havuzdan
  const distractors = shuffle(ALL_WORDS.filter((w) => w !== word)).slice(0, 3);
  const choices = shuffle([word, ...distractors]);

  return { word, definition, choices };
}

interface Props { onEnd: () => void }

export function WordMode({ onEnd }: Props) {
  const { addScore, combo } = useGameStore();
  const { theme } = useSettingsStore();
  const C = Colors[theme];

  const usedWords = useRef(new Set<string>());
  const endCalled = useRef(false);

  const [current, setCurrent] = useState<Question | null>(() => buildQuestion(usedWords.current));
  const [feedback, setFeedback] = useState<{ text: string; correct: boolean } | null>(null);
  const [streak, setStreak] = useState(0);
  const [answered, setAnswered] = useState(0);

  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(1)).current;

  const nextQuestion = (word: string) => {
    usedWords.current.add(word);
    Animated.sequence([
      Animated.timing(cardAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(cardAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setCurrent(buildQuestion(usedWords.current));
  };

  const handleChoice = (choice: string) => {
    if (!current || feedback) return;

    const isCorrect = choice === current.word;
    const streakBonus = streak >= 4 ? 2 : streak >= 2 ? 1.5 : 1;
    const pts = Math.round(BASE_POINTS * streakBonus);

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
      setFeedback({ text: `❌ Yanlış! Cevap: "${current.word}"`, correct: false });
    }

    setAnswered((n) => n + 1);

    Animated.sequence([
      Animated.timing(feedbackAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.delay(900),
      Animated.timing(feedbackAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setFeedback(null);
      nextQuestion(current.word);
    });
  };

  const s = styles(C);

  if (!current) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[s.emptyText, { color: C.textSecondary }]}>Tüm kelimeler bitti! 🎉</Text>
      </View>
    );
  }

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
        {streak >= 2 && (
          <View style={[s.badge, { backgroundColor: '#f0c040' + '22', borderColor: '#f0c040' }]}>
            <Text style={[s.badgeText, { color: '#f0c040' }]}>🔥 {streak} seri</Text>
          </View>
        )}
        <View style={[s.badge, { backgroundColor: C.bgTertiary, borderColor: C.border }]}>
          <Text style={[s.badgeText, { color: C.textSecondary }]}>{answered} soru</Text>
        </View>
      </View>

      {/* Tanım kartı */}
      <Animated.View style={[s.definitionCard, { backgroundColor: C.bgSecondary, opacity: cardAnim }]}>
        <Text style={[s.questionLabel, { color: C.textSecondary }]}>Bu tanım hangi kelimeye ait?</Text>
        <Text style={[s.definitionText, { color: C.textPrimary }]}>"{current.definition}"</Text>
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

      {/* Seçenek butonları */}
      <View style={s.choicesGrid}>
        {current.choices.map((choice, i) => (
          <TouchableOpacity
            key={i}
            style={[s.choiceBtn, { backgroundColor: C.bgSecondary, borderColor: C.border }]}
            onPress={() => handleChoice(choice)}
            activeOpacity={0.7}
          >
            <Text style={[s.choiceText, { color: C.textPrimary }]}>{choice}</Text>
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
  definitionCard: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    minHeight: 140,
    justifyContent: 'center',
  },
  questionLabel: { fontFamily: 'Nunito-Regular', fontSize: 13, marginBottom: 14 },
  definitionText: { fontFamily: 'Nunito-Bold', fontSize: 18, textAlign: 'center', lineHeight: 28 },
  feedbackBox: { borderRadius: 12, padding: 12, alignItems: 'center', marginBottom: 10 },
  feedbackText: { fontFamily: 'Nunito-Bold', fontSize: 15, textAlign: 'center' },
  choicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  choiceBtn: {
    width: '47%',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    minHeight: 64,
  },
  choiceText: { fontFamily: 'Nunito-ExtraBold', fontSize: 16, textAlign: 'center', letterSpacing: 0.5 },
  emptyText: { fontFamily: 'Nunito-Bold', fontSize: 16 },
});
