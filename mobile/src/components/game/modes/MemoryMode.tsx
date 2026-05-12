import { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useGameStore } from '../../../store/gameStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { Colors } from '../../../constants/colors';
import { assetService } from '../../../services/asset.service';
import { ScoreBar } from '../ScoreBar';
import { ComboBar } from '../ComboBar';

const SHAPES = [
  { id: 'red_circle',    label: '🔴', color: '#e94560' },
  { id: 'blue_square',  label: '🟦', color: '#4ecdc4' },
  { id: 'green_tri',    label: '🟢', color: '#2ecc71' },
  { id: 'yellow_star',  label: '⭐', color: '#f0c040' },
  { id: 'purple_diam',  label: '💜', color: '#9b59b6' },
];

const ROUNDS = [
  { count: 3, showMs: 2000, reward: 100 },
  { count: 4, showMs: 1500, reward: 200 },
  { count: 5, showMs: 1500, reward: 350 },
  { count: 6, showMs: 1000, reward: 500 },
];

function generateSequence(count: number) {
  return Array.from({ length: count }, () => SHAPES[Math.floor(Math.random() * SHAPES.length)]);
}

interface Props { onEnd: () => void }

type Phase = 'show' | 'input' | 'result' | 'countdown';

export function MemoryMode({ onEnd }: Props) {
  const { addScore, score } = useGameStore();
  const { theme } = useSettingsStore();
  const C = Colors[theme];

  const [round, setRound] = useState(0);
  const [sequence, setSequence] = useState(() => generateSequence(3));
  const [phase, setPhase] = useState<Phase>('show');
  const [showIdx, setShowIdx] = useState(0);
  const [inputSeq, setInputSeq] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const endCalled = useRef(false);

  const roundCfg = ROUNDS[Math.min(round, ROUNDS.length - 1)];

  // Gösterim fazı
  useEffect(() => {
    if (phase !== 'show') return;
    if (showIdx >= sequence.length) {
      const t = setTimeout(() => { setPhase('input'); }, 400);
      return () => clearTimeout(t);
    }
    assetService.playSound('hit'); // Her gösterimde ses çal
    const t = setTimeout(() => setShowIdx((i) => i + 1), roundCfg.showMs / sequence.length);
    return () => clearTimeout(t);
  }, [phase, showIdx, sequence]);

  const handleInput = (shapeId: string) => {
    if (phase !== 'input') return;
    const next = [...inputSeq, shapeId];
    const idx = next.length - 1;

    if (sequence[idx].id !== shapeId) {
      assetService.playSound('miss');
      setPhase('result');
      setSuccess(false);
      setTimeout(() => { if (!endCalled.current) { endCalled.current = true; onEnd(); } }, 1500);
      return;
    }

    assetService.playSound('hit');
    assetService.vibrate(40);
    if (next.length === sequence.length) {
      addScore(roundCfg.reward);
      assetService.playSound('combo');
      assetService.vibrate([0, 50, 30, 80]);
      setSuccess(true);
      setPhase('countdown');
      const nextRound = round + 1;
      const nextSeq = generateSequence(ROUNDS[Math.min(nextRound, ROUNDS.length - 1)].count + Math.max(0, nextRound - ROUNDS.length + 1));
      let count = 3;
      setCountdown(count);
      const tick = setInterval(() => {
        count--;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(tick);
          setRound(nextRound);
          setSequence(nextSeq);
          setShowIdx(0);
          setInputSeq([]);
          setPhase('show');
        }
      }, 800);
    } else {
      setInputSeq(next);
    }
  };

  const s = styles(C);
  const currentShape = phase === 'show' && showIdx < sequence.length ? sequence[showIdx] : null;

  return (
    <View style={s.container}>
      <ScoreBar />
      <ComboBar combo={0} />
      <View style={s.hud}>
        <Text style={s.round}>Tur {round + 1}</Text>
        <Text style={s.progress}>{inputSeq.length}/{sequence.length}</Text>
      </View>

      <View style={s.display}>
        {phase === 'show' && currentShape ? (
          <Text style={s.bigShape}>{currentShape.label}</Text>
        ) : phase === 'countdown' ? (
          <View style={{ alignItems: 'center' }}>
            <Text style={[s.resultText, { color: C.accentTeal }]}>✅ Doğru!</Text>
            <Text style={[s.bigShape, { color: C.accentYellow }]}>{countdown}</Text>
          </View>
        ) : phase === 'result' ? (
          <Text style={[s.resultText, { color: success ? C.success : C.danger }]}>
            {success ? '✅ Doğru!' : '❌ Yanlış!'}
          </Text>
        ) : (
          <Text style={[s.hint, { color: C.textSecondary }]}>Diziyi tekrarla!</Text>
        )}
      </View>

      <View style={s.inputRow}>
        {sequence.map((_, i) => (
          <View key={i} style={[s.dot, {
            backgroundColor: i < inputSeq.length ? C.accentTeal : C.bgTertiary,
          }]} />
        ))}
      </View>

      <View style={s.buttons}>
        {SHAPES.map((shape) => (
          <TouchableOpacity
            key={shape.id}
            style={[s.shapeBtn, { backgroundColor: shape.color + '33', borderColor: shape.color }]}
            onPress={() => handleInput(shape.id)}
            disabled={phase !== 'input'}
            activeOpacity={0.7}
          >
            <Text style={s.shapeBtnText}>{shape.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bgPrimary, padding: 20 },
  hud: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  score: { color: C.accentYellow, fontSize: 18, fontFamily: 'Nunito-Bold' },
  round: { color: C.textPrimary, fontSize: 18, fontFamily: 'Nunito-Bold' },
  progress: { color: C.accentTeal, fontSize: 18, fontFamily: 'Nunito-Bold' },
  display: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bigShape: { fontSize: 120 },
  hint: { fontSize: 20, fontFamily: 'Nunito-Regular' },
  resultText: { fontSize: 32, fontFamily: 'Nunito-ExtraBold' },
  inputRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 20 },
  shapeBtn: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  shapeBtnText: { fontSize: 32 },
});
