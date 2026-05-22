import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useGameStore } from '../../../store/gameStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { Colors } from '../../../constants/colors';
import { ENGLISH_WORDS, getDistractors, type EnglishWord } from '../../../constants/englishWords';
import { TimerBar } from '../TimerBar';
import { ScoreBar } from '../ScoreBar';
import { ComboBar } from '../ComboBar';
import { assetService } from '../../../services/asset.service';

const DURATION = 60;
const POINTS_BY_LEVEL = { 1: 10, 2: 20, 3: 35 };

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildQuestion(pool: EnglishWord[]): { word: EnglishWord; choices: string[] } | null {
  if (pool.length === 0) return null;
  const word = pool[Math.floor(Math.random() * pool.length)];
  const distractors = getDistractors(word, ENGLISH_WORDS, 3);
  const choices = shuffle([word.turkish, ...distractors]);
  return { word, choices };
}

interface Props { onEnd: () => void }

export function EnglishMode({ onEnd }: Props) {
  const { addScore, score, combo } = useGameStore();
  const { theme } = useSettingsStore();
  const C = Colors[theme];

  const [pool] = useState(() => shuffle(ENGLISH_WORDS));
  const [usedIdx, setUsedIdx] = useState(0);
  const [current, setCurrent] = useState<{ word: EnglishWord; choices: string[] } | null>(
    () => buildQuestion(ENGLISH_WORDS)
  );
  const [feedback, setFeedback] = useState<{ text: string; correct: boolean } | null>(null);
  const [streak, setStreak] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const endCalled = useRef(false);
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(1)).current;

  const nextQuestion = (nextIdx: number) => {
    Animated.sequence([
      Animated.timing(cardAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(cardAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    const remaining = pool.slice(nextIdx);
    const q = buildQuestion(remaining.length > 0 ? remaining : ENGLISH_WORDS);
    setCurrent(q);
    setUsedIdx(nextIdx);
  };

  const handleChoice = (choice: string) => {
    if (!current || feedback) return;
    const isCorrect = choice === current.word.turkish;
    const pts = POINTS_BY_LEVEL[current.word.level];

    if (isCorrect) {
      const bonus = streak >= 4 ? 2 : streak >= 2 ? 1.5 : 1;
      addScore(Math.round(pts * bonus));
      assetService.playSound('hit');
      assetService.vibrate('medium');
      setStreak((s) => s + 1);
      setFeedback({ text: `✅ Doğru! +${Math.round(pts * bonus)} puan`, correct: true });
    } else {
      assetService.playSound('miss');
      assetService.vibrate('heavy');
      setStreak(0);
      setFeedback({ text: `❌ Yanlış! Doğru: "${current.word.turkish}"`, correct: false });
    }

    setTotalAnswered((n) => n + 1);

    Animated.sequence([
      Animated.timing(feedbackAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.delay(800),
      Animated.timing(feedbackAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setFeedback(null);
      nextQuestion(usedIdx + 1);
    });
  };

  const s = styles(C);

  if (!current) return null;

  const levelLabel = current.word.level === 1 ? 'Kolay' : current.word.level === 2 ? 'Orta' : 'Zor';
  const levelColor = current.word.level === 1 ? C.success : current.word.level === 2 ? '#f0c040' : C.accentRed;

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
        <View style={[s.statBadge, { backgroundColor: levelColor + '22', borderColor: levelColor }]}>
          <Text style={[s.statText, { color: levelColor }]}>{levelLabel}</Text>
        </View>
        {streak >= 2 && (
          <View style={[s.statBadge, { backgroundColor: C.accentYellow + '22', borderColor: C.accentYellow }]}>
            <Text style={[s.statText, { color: C.accentYellow }]}>🔥 {streak} seri</Text>
          </View>
        )}
        <View style={[s.statBadge, { backgroundColor: C.bgTertiary }]}>
          <Text style={[s.statText, { color: C.textSecondary }]}>{totalAnswered} cevap</Text>
        </View>
      </View>

      {/* Kelime kartı */}
      <Animated.View style={[s.wordCard, { backgroundColor: C.bgSecondary, opacity: cardAnim }]}>
        <Text style={[s.wordLabel, { color: C.textSecondary }]}>Bu kelimenin Türkçesi nedir?</Text>
        <Text style={[s.englishWord, { color: C.textPrimary }]}>{current.word.english}</Text>
        <Text style={[s.levelPts, { color: levelColor }]}>
          {POINTS_BY_LEVEL[current.word.level]} puan
        </Text>
      </Animated.View>

      {/* Geri bildirim */}
      {feedback && (
        <Animated.View style={[
          s.feedbackBox,
          {
            backgroundColor: feedback.correct ? C.success + '22' : C.danger + '22',
            opacity: feedbackAnim,
          }
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
            <Text style={[s.choiceText, { color: C.textPrimary }]} numberOfLines={2}>
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
  statsRow: { flexDirection: 'row', gap: 8, marginVertical: 10, flexWrap: 'wrap' },
  statBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  statText: { fontFamily: 'Nunito-Bold', fontSize: 12 },
  wordCard: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  wordLabel: { fontFamily: 'Nunito-Regular', fontSize: 13, marginBottom: 12 },
  englishWord: { fontFamily: 'Nunito-ExtraBold', fontSize: 38, textAlign: 'center', letterSpacing: 1 },
  levelPts: { fontFamily: 'Nunito-Bold', fontSize: 13, marginTop: 10 },
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
    minHeight: 70,
  },
  choiceText: { fontFamily: 'Nunito-Bold', fontSize: 15, textAlign: 'center' },
});
