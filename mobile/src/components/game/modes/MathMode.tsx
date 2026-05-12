import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useGameStore } from '../../../store/gameStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { Colors } from '../../../constants/colors';
import { assetService } from '../../../services/asset.service';
import { ScoreBar } from '../ScoreBar';
import { TimerBar } from '../TimerBar';

type Op = '+' | '-' | '×';

function generateQuestion(level: number): { a: number; b: number; op: Op; answer: number } {
  const ops: Op[] = level < 3 ? ['+', '-'] : level < 6 ? ['+', '-', '×'] : ['+', '-', '×'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a = 0, b = 0, answer = 0;

  if (op === '+') {
    a = Math.floor(Math.random() * (10 + level * 5)) + 1;
    b = Math.floor(Math.random() * (10 + level * 5)) + 1;
    answer = a + b;
  } else if (op === '-') {
    a = Math.floor(Math.random() * (20 + level * 5)) + 10;
    b = Math.floor(Math.random() * a) + 1;
    answer = a - b;
  } else {
    a = Math.floor(Math.random() * (3 + level)) + 2;
    b = Math.floor(Math.random() * (3 + level)) + 2;
    answer = a * b;
  }
  return { a, b, op, answer };
}

function generateChoices(correct: number, level: number): number[] {
  const spread = Math.max(3, Math.floor(correct * 0.3));
  const choices = new Set<number>([correct]);
  while (choices.size < 4) {
    const offset = Math.floor(Math.random() * spread * 2) - spread;
    if (offset !== 0) choices.add(correct + offset);
  }
  return [...choices].sort(() => Math.random() - 0.5);
}

interface Props { onEnd: () => void }

export function MathMode({ onEnd }: Props) {
  const { addScore, incrementCombo, resetCombo, score, combo } = useGameStore();
  const { theme } = useSettingsStore();
  const C = Colors[theme];

  const [level, setLevel]       = useState(1);
  const [question, setQuestion] = useState(() => generateQuestion(1));
  const [choices, setChoices]   = useState<number[]>([]);
  const [answered, setAnswered] = useState<number | null>(null);
  const [correct, setCorrect]   = useState<number | null>(null);
  const [streak, setStreak]     = useState(0);
  const [totalQ, setTotalQ]     = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const endCalled = useRef(false);

  useEffect(() => {
    newQuestion(level);
  }, []);

  const newQuestion = (lvl: number) => {
    const q = generateQuestion(lvl);
    setQuestion(q);
    setChoices(generateChoices(q.answer, lvl));
    setAnswered(null);
    setCorrect(null);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.9, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  };

  const handleAnswer = (choice: number) => {
    if (answered !== null) return;
    setAnswered(choice);
    setCorrect(question.answer);
    setTotalQ((n) => n + 1);

    const isCorrect = choice === question.answer;

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      incrementCombo();
      const pts = 10 + level * 5 + Math.min(combo * 3, 30);
      addScore(pts);
      assetService.playSound('hit');
      assetService.vibrate(30);
      const newLevel = Math.min(10, Math.floor(totalQ / 5) + 1);
      setLevel(newLevel);
    } else {
      setStreak(0);
      resetCombo();
      assetService.playSound('miss');
      assetService.vibrate([0, 80, 40, 80]);
    }

    setTimeout(() => newQuestion(level), isCorrect ? 600 : 1000);
  };

  const s = styles(C);

  return (
    <View style={s.root}>
      <ScoreBar />
      <View style={s.timerWrap}>
        <TimerBar duration={30} isPlaying={true} onTimeUp={() => {
          if (!endCalled.current) { endCalled.current = true; onEnd(); }
        }} />
      </View>

      <View style={s.meta}>
        <View style={[s.levelBadge, { backgroundColor: C.bgSecondary }]}>
          <Text style={[s.levelText, { color: C.accentTeal }]}>Seviye {level}</Text>
        </View>
        {streak >= 3 && (
          <Text style={[s.streakText, { color: C.accentYellow }]}>🔥 {streak} seri!</Text>
        )}
        <Text style={[s.comboText, { color: C.textSecondary }]}>{totalQ} soru</Text>
      </View>

      {/* Soru */}
      <Animated.View style={[s.questionCard, { backgroundColor: C.bgSecondary, transform: [{ scale: scaleAnim }] }]}>
        <Text style={[s.question, { color: C.textPrimary }]}>
          {question.a} {question.op} {question.b} = ?
        </Text>
      </Animated.View>

      {/* Seçenekler */}
      <View style={s.choices}>
        {choices.map((choice, i) => {
          let bg = C.bgSecondary;
          let border = C.border;
          if (answered !== null) {
            if (choice === question.answer) { bg = C.success + '33'; border = C.success; }
            else if (choice === answered)   { bg = C.danger + '33';  border = C.danger;  }
          }
          return (
            <TouchableOpacity
              key={i}
              style={[s.choiceBtn, { backgroundColor: bg, borderColor: border }]}
              onPress={() => handleAnswer(choice)}
              activeOpacity={0.75}
              disabled={answered !== null}
            >
              <Text style={[s.choiceText, {
                color: answered !== null && choice === question.answer ? C.success :
                       answered === choice && choice !== question.answer ? C.danger :
                       C.textPrimary,
              }]}>{choice}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[s.hint, { color: C.textSecondary }]}>
        💡 Hızlı cevapla, daha fazla kazan!
      </Text>
    </View>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgPrimary },
  timerWrap: { paddingHorizontal: 16, marginVertical: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16, gap: 10 },
  levelBadge: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 },
  levelText: { fontFamily: 'Nunito-ExtraBold', fontSize: 14 },
  streakText: { fontFamily: 'Nunito-Bold', fontSize: 14 },
  comboText: { fontFamily: 'Nunito-Regular', fontSize: 13, marginLeft: 'auto' },
  questionCard: {
    marginHorizontal: 24, borderRadius: 24, padding: 36,
    alignItems: 'center', marginBottom: 28,
    elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 8,
  },
  question: { fontSize: 48, fontFamily: 'Nunito-ExtraBold' },
  choices: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12 },
  choiceBtn: {
    width: '46%', borderRadius: 18, padding: 20,
    alignItems: 'center', borderWidth: 2,
  },
  choiceText: { fontSize: 32, fontFamily: 'Nunito-ExtraBold' },
  hint: { textAlign: 'center', marginTop: 20, fontFamily: 'Nunito-Regular', fontSize: 12 },
});