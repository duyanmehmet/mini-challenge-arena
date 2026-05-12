import { useState, useRef } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions } from 'react-native';
import { useGameStore } from '../../../store/gameStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { Colors } from '../../../constants/colors';
import { assetService } from '../../../services/asset.service';
import { ScoreBar } from '../ScoreBar';
import { ComboBar } from '../ComboBar';

const { width } = Dimensions.get('window');
const GOAL_W = width * 0.75;
const GOAL_H = 120;

function getZoneScore(xRatio: number, yRatio: number): number {
  const isTop = yRatio < 0.35;
  const isCorner = xRatio < 0.2 || xRatio > 0.8;
  if (isTop && isCorner) return 100;
  if (isTop) return 75;
  if (isCorner) return 60;
  return 40;
}

interface Props { onEnd: () => void }

export function FootballMode({ onEnd }: Props) {
  const { addScore, incrementCombo, resetCombo, score, combo } = useGameStore();
  const { theme } = useSettingsStore();
  const C = Colors[theme];

  const [shots, setShots] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [isAiming, setIsAiming] = useState(false);
  const touchStart = useRef({ x: 0, y: 0 });
  const MAX_SHOTS = 10;
  const endCalled = useRef(false);

  const handleEnd = () => {
    if (!endCalled.current) { endCalled.current = true; onEnd(); }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => shots < MAX_SHOTS,
    onPanResponderGrant: (e) => {
      setIsAiming(true);
      touchStart.current = { x: e.nativeEvent.locationX, y: e.nativeEvent.locationY };
    },
    onPanResponderRelease: (e) => {
      setIsAiming(false);
      if (shots >= MAX_SHOTS) return;

      const dx = e.nativeEvent.locationX - touchStart.current.x;
      const dy = e.nativeEvent.locationY - touchStart.current.y;
      const power = Math.sqrt(dx * dx + dy * dy);

      if (power < 10) return;

      const keeperLevel = Math.floor(shots / 3);
      const keeperBlock = Math.random() < 0.1 + keeperLevel * 0.07;

      const newShots = shots + 1;
      setShots(newShots);

      if (keeperBlock) {
        assetService.playSound('miss');
        assetService.vibrate([0, 100, 50, 100]);
        resetCombo();
        setResult('🧤 Kaleci kurtardı!');
      } else {
        assetService.playSound('goal');
        assetService.vibrate([0, 50, 30, 80]);
        const goalX = 0.5 + (dx / (width * 0.8)) * 0.5;
        const goalY = 0.5 + (dy / 300) * 0.5;
        const xRatio = Math.max(0, Math.min(1, goalX));
        const yRatio = Math.max(0, Math.min(1, goalY));
        const pts = getZoneScore(xRatio, yRatio);
        addScore(pts);
        incrementCombo();
        setResult(`⚽ +${pts} puan!`);
      }

      if (newShots >= MAX_SHOTS) {
        setTimeout(handleEnd, 1000);
      } else {
        setTimeout(() => setResult(null), 800);
      }
    },
    onPanResponderTerminate: () => setIsAiming(false),
  });

  const s = styles(C);

  return (
    <View style={s.container} {...panResponder.panHandlers}>
      <ScoreBar />
      <ComboBar combo={combo} />
      <View style={s.hud}>
        <Text style={s.shots}>{shots}/{MAX_SHOTS} atış</Text>
      </View>

      <View style={s.goalArea}>
        <View style={s.goalPost}>
          <View style={s.zonesRow}>
            <View style={[s.zone, { backgroundColor: '#e9456030' }]}><Text style={s.zoneText}>100</Text></View>
            <View style={[s.zone, { backgroundColor: '#f0c04030' }]}><Text style={s.zoneText}>75</Text></View>
            <View style={[s.zone, { backgroundColor: '#e9456030' }]}><Text style={s.zoneText}>100</Text></View>
          </View>
          <View style={s.zonesRow}>
            <View style={[s.zone, { backgroundColor: '#4ecdc430' }]}><Text style={s.zoneText}>60</Text></View>
            <View style={[s.zone, { backgroundColor: '#9b59b630' }]}><Text style={s.zoneText}>40</Text></View>
            <View style={[s.zone, { backgroundColor: '#4ecdc430' }]}><Text style={s.zoneText}>60</Text></View>
          </View>
        </View>
      </View>

      {result && (
        <Text style={[s.result, { color: result.includes('kurtardı') ? C.danger : C.success }]}>{result}</Text>
      )}

      <Text style={[s.hint, { color: C.textSecondary }]}>
        {isAiming ? 'Bırak!' : 'Ekrana bas ve sürükle → şut!'}
      </Text>
    </View>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bgPrimary, padding: 20 },
  hud: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  score: { color: C.accentYellow, fontSize: 18, fontFamily: 'Nunito-Bold' },
  shots: { color: C.textPrimary, fontSize: 18, fontFamily: 'Nunito-Bold' },
  combo: { fontSize: 18, fontFamily: 'Nunito-Bold' },
  goalArea: { alignItems: 'center', marginBottom: 24 },
  goalPost: {
    width: GOAL_W, height: GOAL_H, borderWidth: 3,
    borderColor: C.textPrimary, backgroundColor: C.bgSecondary, overflow: 'hidden',
  },
  zonesRow: { flex: 1, flexDirection: 'row' },
  zone: { flex: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: C.border },
  zoneText: { color: C.textSecondary, fontSize: 11, fontFamily: 'Nunito-Bold' },
  result: { textAlign: 'center', fontSize: 24, fontFamily: 'Nunito-ExtraBold', marginBottom: 16 },
  hint: { textAlign: 'center', fontSize: 14, fontFamily: 'Nunito-Regular' },
});
