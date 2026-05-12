import { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { useGameStore } from '../../../store/gameStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { Colors } from '../../../constants/colors';
import { useTimer } from '../../../hooks/useTimer';
import { ScoreBar } from '../ScoreBar';
import { ComboBar } from '../ComboBar';
import { assetService } from '../../../services/asset.service';

const { width } = Dimensions.get('window');

const ROUNDS_CONFIG = [
  { count: 9, timeMs: 5000, reward: 100 },
  { count: 16, timeMs: 4000, reward: 200 },
  { count: 25, timeMs: 3000, reward: 350 },
  { count: 36, timeMs: 3000, reward: 500 },
];

const SHAPES = ['●', '■', '▲'];
const COLORS = ['#e94560', '#4ecdc4', '#f0c040', '#9b59b6', '#2ecc71'];

type DiffType = 'color' | 'shape' | 'size';

function generateItems(count: number, round: number) {
  const baseShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const baseColor = COLORS[Math.floor(Math.random() * COLORS.length)];
  const baseSize = 22;

  const diffType: DiffType = (['color', 'shape', 'size'] as DiffType[])[round % 3];
  const diffIndex = Math.floor(Math.random() * count);

  return Array.from({ length: count }, (_, i) => {
    const isDifferent = i === diffIndex;
    let shape = baseShape;
    let color = baseColor;
    let size = baseSize;

    if (isDifferent) {
      if (diffType === 'color') {
        color = COLORS.find((c) => c !== baseColor) ?? '#fff';
      } else if (diffType === 'shape') {
        shape = SHAPES.find((s) => s !== baseShape) ?? '◆';
      } else {
        size = baseSize + 10;
      }
    }
    return { id: i, shape, color, size, isDifferent };
  });
}

interface Props { onEnd: () => void }

export function AttentionMode({ onEnd }: Props) {
  const { addScore, score } = useGameStore();
  const { theme } = useSettingsStore();
  const C = Colors[theme];

  const [round, setRound] = useState(0);
  const cfg = ROUNDS_CONFIG[Math.min(round, ROUNDS_CONFIG.length - 1)];
  const [items, setItems] = useState(() => generateItems(cfg.count, 0));
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const endCalled = useRef(false);

  const { seconds: timeLeft, startTimer, pauseTimer, resetTimer } = useTimer({
    initialSeconds: cfg.timeMs / 1000,
    onTimeUp: () => {
      if (!endCalled.current && result === null) {
        endCalled.current = true;
        onEnd();
      }
    }
  });


  useEffect(() => {
    const newCfg = ROUNDS_CONFIG[Math.min(round, ROUNDS_CONFIG.length - 1)];
    setItems(generateItems(newCfg.count, round));
    resetTimer(newCfg.timeMs / 1000);
    setResult(null);
    startTimer();
  }, [round]);

  const handlePress = (isDifferent: boolean) => {
    if (result !== null) return;
    if (isDifferent) {
      const reward = ROUNDS_CONFIG[Math.min(round, ROUNDS_CONFIG.length - 1)].reward;
      addScore(reward);
      assetService.playSound('hit');
      assetService.vibrate(50);
      setResult('correct');
      pauseTimer();
      setTimeout(() => setRound((r) => r + 1), 600);
    } else {
      assetService.playSound('miss');
      assetService.vibrate([0, 100, 50, 100]);
      setResult('wrong');
      pauseTimer();
      setTimeout(() => {
        if (!endCalled.current) {
          endCalled.current = true;
          onEnd();
        }
      }, 800);
    }
  };

  const cols = Math.round(Math.sqrt(cfg.count));
  const itemSize = (width - 40) / cols - 6;
  const s = styles(C);

  return (
    <View style={s.container}>
      <ScoreBar />
      <ComboBar combo={0} />
      <View style={s.hud}>
        <Text style={s.round}>Tur {round + 1}</Text>
        <Text style={[s.time, { color: timeLeft <= 2 ? C.danger : C.textPrimary }]}>{timeLeft}s</Text>
      </View>

      {result && (
        <Text style={[s.result, { color: result === 'correct' ? C.success : C.danger }]}>
          {result === 'correct' ? '✅ Doğru!' : '❌ Yanlış!'}
        </Text>
      )}

      <View style={[s.grid, { width: width - 40 }]}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[s.item, { width: itemSize, height: itemSize }]}
            onPress={() => handlePress(item.isDifferent)}
            activeOpacity={0.7}
          >
            <Text style={{ color: item.color, fontSize: item.size }}>{item.shape}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bgPrimary, padding: 20, alignItems: 'center' },
  hud: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 12 },
  score: { color: C.accentYellow, fontSize: 18, fontFamily: 'Nunito-Bold' },
  round: { color: C.textPrimary, fontSize: 18, fontFamily: 'Nunito-Bold' },
  time: { fontSize: 18, fontFamily: 'Nunito-Bold' },
  result: { fontSize: 24, fontFamily: 'Nunito-ExtraBold', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  item: { alignItems: 'center', justifyContent: 'center' },
});
