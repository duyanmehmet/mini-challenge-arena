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
  const itemSize = (width - 48) / cols - 5;
  const s = styles(C);

  // Timer bar rengi
  const timerColor = timeLeft <= 2 ? C.danger : timeLeft <= 4 ? C.warning : C.accentTeal;

  return (
    <View style={s.container}>
      <ScoreBar />
      <ComboBar combo={0} />

      {/* HUD */}
      <View style={s.hud}>
        <View style={s.roundBadge}>
          <Text style={s.roundLabel}>TUR</Text>
          <Text style={[s.roundNum, { color: C.accentTeal }]}>{round + 1}</Text>
        </View>

        {/* Zamanlayıcı bar */}
        <View style={s.timerWrap}>
          <View style={[s.timerTrack, { backgroundColor: C.bgTertiary }]}>
            <View style={[s.timerFill, { width: `${(timeLeft / (cfg.timeMs / 1000)) * 100}%`, backgroundColor: timerColor }]} />
          </View>
          <Text style={[s.timerText, { color: timerColor }]}>{timeLeft}s</Text>
        </View>
      </View>

      {/* Sonuç banner */}
      {result && (
        <View style={[s.resultBanner, { backgroundColor: result === 'correct' ? C.success + '22' : C.danger + '22' }]}>
          <Text style={[s.resultText, { color: result === 'correct' ? C.success : C.danger }]}>
            {result === 'correct' ? '✅ Doğru!' : '❌ Yanlış!'}
          </Text>
        </View>
      )}

      <Text style={[s.hint, { color: C.textSecondary }]}>Farklı olanı bul ve dokun!</Text>

      <View style={[s.grid, { width: width - 40 }]}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[s.item, { width: itemSize, height: itemSize, backgroundColor: C.bgSecondary, borderRadius: itemSize * 0.2 }]}
            onPress={() => handlePress(item.isDifferent)}
            activeOpacity={0.6}
          >
            <Text style={{ color: item.color, fontSize: Math.min(item.size, itemSize * 0.6) }}>{item.shape}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bgPrimary, paddingHorizontal: 20, alignItems: 'center' },
  hud: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginVertical: 8 },
  roundBadge: { alignItems: 'center', backgroundColor: C.bgSecondary, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6 },
  roundLabel: { color: C.textSecondary, fontSize: 10, fontFamily: 'Nunito-Bold', letterSpacing: 1 },
  roundNum: { fontSize: 22, fontFamily: 'Nunito-ExtraBold' },
  timerWrap: { flex: 1, marginLeft: 12, alignItems: 'flex-end' },
  timerTrack: { width: '100%', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 4 },
  timerFill: { height: '100%', borderRadius: 4 },
  timerText: { fontFamily: 'Nunito-ExtraBold', fontSize: 16 },
  resultBanner: { width: '100%', borderRadius: 12, padding: 8, alignItems: 'center', marginBottom: 6 },
  resultText: { fontSize: 20, fontFamily: 'Nunito-ExtraBold' },
  hint: { fontFamily: 'Nunito-Regular', fontSize: 12, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center' },
  item: { alignItems: 'center', justifyContent: 'center' },
});
