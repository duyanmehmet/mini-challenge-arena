import { useEffect, useRef, useState, useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { useGameStore } from '../../../store/gameStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { Colors } from '../../../constants/colors';
import { assetService } from '../../../services/asset.service';
import { ScoreBar } from '../ScoreBar';
import { ComboBar } from '../ComboBar';
import { TimerBar } from '../TimerBar';

const { width: SW, height: SH } = Dimensions.get('window');
const LANES      = 3;
const LANE_W     = (SW - 32) / LANES;
const TARGET_H   = 56;
const HIT_ZONE_Y = SH - 220;
const HIT_WINDOW = 70;   // ± piksel hassasiyet

type TargetType = 'normal' | 'bonus' | 'bomb';

interface FallingTarget {
  id: number;
  lane: number;
  type: TargetType;
  y: Animated.Value;
  speed: number;
  scored: boolean;
}

const TYPE_CONFIG: Record<TargetType, { emoji: string; color: string; pts: number }> = {
  normal: { emoji: '●',  color: '#e94560', pts: 10 },
  bonus:  { emoji: '⭐', color: '#f0c040', pts: 30 },
  bomb:   { emoji: '💣', color: '#555577', pts: 0  },
};

interface Props { onEnd: () => void }

export function ReflexMode({ onEnd }: Props) {
  const { addScore, incrementCombo, resetCombo, loseLife, lives, combo } = useGameStore();
  const { theme } = useSettingsStore();
  const C = Colors[theme];

  const [targets, setTargets] = useState<FallingTarget[]>([]);
  const [hitFeedback, setHitFeedback] = useState<{ lane: number; text: string; color: string } | null>(null);
  const [missLane, setMissLane]       = useState<number | null>(null);

  const nextId   = useRef(0);
  const speed    = useRef(2.8);
  const endCalled = useRef(false);
  const gameActive = useRef(true);

  // Hız artışı
  useEffect(() => {
    const t = setInterval(() => {
      speed.current = Math.min(speed.current * 1.08, 8);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  // Hedef spawn
  useEffect(() => {
    const spawnInterval = () => {
      if (!gameActive.current) return;
      const lane = Math.floor(Math.random() * LANES);
      const rand  = Math.random();
      const type: TargetType = rand < 0.65 ? 'normal' : rand < 0.85 ? 'bonus' : 'bomb';
      const y = new Animated.Value(-TARGET_H - 20);
      const id = nextId.current++;

      setTargets((prev) => [...prev, { id, lane, type, y, speed: speed.current, scored: false }]);

      Animated.timing(y, {
        toValue: SH,
        duration: (SH + TARGET_H) / speed.current * 16,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setTargets((prev) => {
            const hit = prev.find((t) => t.id === id);
            if (hit && !hit.scored && hit.type !== 'bomb') {
              // Miss!
              setMissLane(hit.lane);
              setTimeout(() => setMissLane(null), 300);
              resetCombo();
              const dead = loseLife();
              if (dead && !endCalled.current) { endCalled.current = true; onEnd(); }
            }
            return prev.filter((t) => t.id !== id);
          });
        }
      });

      // Rastgele aralık
      const nextDelay = 900 - Math.min(combo * 30, 400);
      setTimeout(spawnInterval, Math.max(nextDelay, 400));
    };

    const t = setTimeout(spawnInterval, 500);
    return () => clearTimeout(t);
  }, []);

  const handleLanePress = useCallback((lane: number) => {
    setTargets((prev) => {
      let hit = false;
      return prev.map((t) => {
        if (hit || t.scored || t.lane !== lane) return t;

        // Y pozisyonunu al
        const yVal = (t.y as any)._value as number;
        const dist = Math.abs(yVal - HIT_ZONE_Y);

        if (dist > HIT_WINDOW) return t;

        hit = true;
        if (t.type === 'bomb') {
          assetService.playSound('miss');
          assetService.vibrate([0, 100, 50, 100]);
          resetCombo();
          setHitFeedback({ lane, text: '💥 Bomba!', color: '#ff4444' });
          const dead = loseLife();
          if (dead && !endCalled.current) { endCalled.current = true; onEnd(); }
          return { ...t, scored: true };
        }

        const cfg = TYPE_CONFIG[t.type];
        const mult = Math.max(1, Math.floor(combo / 3) + 1);
        const pts = cfg.pts * mult;
        addScore(cfg.pts);
        incrementCombo();
        assetService.playSound(t.type === 'bonus' ? 'combo' : 'hit');
        assetService.vibrate(t.type === 'bonus' ? [0, 30, 20, 50] : 25);

        const perfect = dist < 25;
        setHitFeedback({
          lane,
          text: perfect ? `🎯 PERFECT +${pts}` : `+${pts}`,
          color: perfect ? '#f0c040' : cfg.color,
        });
        setTimeout(() => setHitFeedback(null), 600);
        return { ...t, scored: true };
      });
    });
  }, [combo, addScore, incrementCombo, resetCombo, loseLife, onEnd]);

  const s = styles(C);

  return (
    <View style={[s.root, { backgroundColor: C.bgPrimary }]}>
      <ScoreBar />
      <View style={s.timerWrap}>
        <TimerBar duration={30} isPlaying={true} onTimeUp={() => {
          gameActive.current = false;
          if (!endCalled.current) { endCalled.current = true; onEnd(); }
        }} />
      </View>

      {/* Canlar */}
      <View style={s.lives}>
        {[0,1,2].map((i) => <Text key={i} style={[s.heart, { opacity: i < lives ? 1 : 0.2 }]}>❤️</Text>)}
      </View>

      <ComboBar combo={combo} />

      {/* Şeritler */}
      <View style={s.laneArea}>
        {/* Şerit çizgileri */}
        {[1, 2].map((i) => (
          <View key={i} style={[s.laneLine, { left: i * LANE_W + 16, backgroundColor: C.border }]} />
        ))}

        {/* Hit zone çizgisi */}
        <View style={[s.hitZone, { top: HIT_ZONE_Y, backgroundColor: C.accentTeal + '44', borderColor: C.accentTeal }]} />

        {/* Hedefler */}
        {targets.map((t) => !t.scored && (
          <Animated.View
            key={t.id}
            style={[s.targetWrap, {
              left: 16 + t.lane * LANE_W + (LANE_W - TARGET_H) / 2,
              transform: [{ translateY: t.y }],
            }]}
          >
            <View style={[s.target, { backgroundColor: TYPE_CONFIG[t.type].color, borderColor: TYPE_CONFIG[t.type].color + 'aa' }]}>
              <Text style={s.targetEmoji}>{TYPE_CONFIG[t.type].emoji}</Text>
            </View>
          </Animated.View>
        ))}

        {/* Hit feedback */}
        {hitFeedback && (
          <Text style={[s.feedback, {
            left: 16 + hitFeedback.lane * LANE_W,
            width: LANE_W,
            top: HIT_ZONE_Y - 30,
            color: hitFeedback.color,
          }]}>
            {hitFeedback.text}
          </Text>
        )}
      </View>

      {/* Dokunma butonları */}
      <View style={s.buttons}>
        {Array.from({ length: LANES }).map((_, i) => {
          const isMiss = missLane === i;
          return (
            <TouchableOpacity
              key={i}
              style={[s.laneBtn, {
                backgroundColor: isMiss ? C.danger + '44' : C.bgSecondary,
                borderColor: isMiss ? C.danger : C.border,
              }]}
              onPress={() => handleLanePress(i)}
              activeOpacity={0.6}
            >
              <Text style={[s.laneBtnIcon, { color: C.textSecondary }]}>👇</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  root: { flex: 1 },
  timerWrap: { paddingHorizontal: 16, marginVertical: 4 },
  lives: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 4 },
  heart: { fontSize: 20 },
  laneArea: { flex: 1, position: 'relative', overflow: 'hidden' },
  laneLine: { position: 'absolute', top: 0, bottom: 0, width: 1 },
  hitZone: {
    position: 'absolute', left: 16, right: 16, height: TARGET_H + 8,
    borderRadius: 12, borderWidth: 2,
  },
  targetWrap: { position: 'absolute', width: TARGET_H, height: TARGET_H },
  target: {
    width: TARGET_H, height: TARGET_H, borderRadius: TARGET_H / 2,
    alignItems: 'center', justifyContent: 'center', borderWidth: 3,
    elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4, shadowRadius: 5,
  },
  targetEmoji: { fontSize: 26 },
  feedback: {
    position: 'absolute', textAlign: 'center',
    fontFamily: 'Nunito-ExtraBold', fontSize: 18,
  },
  buttons: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  laneBtn: {
    flex: 1, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2,
  },
  laneBtnIcon: { fontSize: 28 },
});