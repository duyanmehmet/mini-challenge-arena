import { useEffect, useRef, useState, useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { useGameStore } from '../../../store/gameStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { Colors } from '../../../constants/colors';
import { assetService } from '../../../services/asset.service';
import { TimerBar } from '../TimerBar';
import { ComboBar } from '../ComboBar';
import { ScoreBar } from '../ScoreBar';

const { width, height } = Dimensions.get('window');
const TARGET_SIZE = 64;
const GAME_AREA = { top: 120, bottom: height - 200 };

type TargetType = 'normal' | 'bonus' | 'trap';

interface Target {
  id: number;
  x: number;
  y: number;
  type: TargetType;
}

function randomTarget(id: number): Target {
  const rand = Math.random();
  const type: TargetType = rand < 0.7 ? 'normal' : rand < 0.9 ? 'bonus' : 'trap';
  return {
    id,
    x: Math.random() * (width - TARGET_SIZE - 20) + 10,
    y: Math.random() * (GAME_AREA.bottom - GAME_AREA.top - TARGET_SIZE) + GAME_AREA.top,
    type,
  };
}

interface Props { onEnd: () => void }

export function ReflexMode({ onEnd }: Props) {
  const { addScore, incrementCombo, resetCombo, loseLife, lives, combo, score } = useGameStore();
  const { theme } = useSettingsStore();
  const C = Colors[theme];

  const [targets, setTargets] = useState<Target[]>([]);
  const nextId = useRef(0);
  const endCalled = useRef(false);

  const [isPlaying, setIsPlaying] = useState(true);

  const spawnTarget = useCallback(() => {
    setTargets((prev) => {
      if (prev.length >= 4) return prev;
      return [...prev, randomTarget(nextId.current++)];
    });
  }, []);

  const removeTarget = useCallback((id: number) => {
    setTargets((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const t = setInterval(spawnTarget, 800);
    return () => clearInterval(t);
  }, [spawnTarget]);

  const handleHit = (target: Target) => {
    removeTarget(target.id);
    if (target.type === 'trap') {
      assetService.playSound('miss');
      assetService.vibrate(100);
      resetCombo();

      const dead = loseLife();
      if (dead && !endCalled.current) { endCalled.current = true; onEnd(); }
      return;
    }
    assetService.playSound('hit');
    const pts = target.type === 'bonus' ? 25 : 10;
    addScore(pts);
    incrementCombo();
  };

  return (
    <View style={[s.container, { backgroundColor: C.bgPrimary }]}>
      <ScoreBar />
      
      <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
        <TimerBar 
          duration={30} 
          isPlaying={isPlaying} 
          onTimeUp={() => {
            if (!endCalled.current) {
              endCalled.current = true;
              onEnd();
            }
          }} 
        />
      </View>

      <ComboBar combo={combo} />

      {/* Hedefler */}
      {targets.map((t) => (
        <TouchableOpacity
          key={t.id}
          style={[s.target, {
            left: t.x, top: t.y,
            backgroundColor: t.type === 'normal' ? C.accentRed : t.type === 'bonus' ? C.accentYellow : '#666',
          }]}
          onPress={() => handleHit(t)}
          activeOpacity={0.7}
        >
          <Text style={s.targetText}>
            {t.type === 'normal' ? '●' : t.type === 'bonus' ? '⭐' : '☠️'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  hud: { paddingHorizontal: 20, paddingTop: 10, gap: 8 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  score: { fontSize: 24, fontFamily: 'Nunito-ExtraBold' },
  lives: { flexDirection: 'row', gap: 4 },
  comboContainer: { marginTop: 10 },
  target: {
    position: 'absolute', width: TARGET_SIZE, height: TARGET_SIZE,
    borderRadius: TARGET_SIZE / 2, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 8,
  },
  targetText: { fontSize: 28 },
});
