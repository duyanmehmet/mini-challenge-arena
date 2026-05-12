import { useEffect, useRef, useState, useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { useGameStore } from '../../../store/gameStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { Colors } from '../../../constants/colors';
import { assetService } from '../../../services/asset.service';
import { TimerBar } from '../TimerBar';
import { ComboBar } from '../ComboBar';
import { ScoreBar } from '../ScoreBar';

const { width, height } = Dimensions.get('window');
const TARGET_SIZE = 68;
const GAME_AREA = { top: 160, bottom: height - 180 };

type TargetType = 'normal' | 'bonus' | 'trap';

interface Target {
  id: number;
  x: number;
  y: number;
  type: TargetType;
  scale: Animated.Value;
}

function randomTarget(id: number): Target {
  const rand = Math.random();
  const type: TargetType = rand < 0.68 ? 'normal' : rand < 0.88 ? 'bonus' : 'trap';
  return {
    id,
    x: Math.random() * (width - TARGET_SIZE - 24) + 12,
    y: Math.random() * (GAME_AREA.bottom - GAME_AREA.top - TARGET_SIZE) + GAME_AREA.top,
    type,
    scale: new Animated.Value(0),
  };
}

const TARGET_CONFIG = {
  normal: { bg: '#e94560', border: '#ff6b7a', emoji: '🎯', pts: 10 },
  bonus:  { bg: '#f0c040', border: '#ffd966', emoji: '⭐', pts: 25 },
  trap:   { bg: '#444466', border: '#666688', emoji: '💀', pts: 0  },
};

interface Props { onEnd: () => void }

export function ReflexMode({ onEnd }: Props) {
  const { addScore, incrementCombo, resetCombo, loseLife, lives, combo } = useGameStore();
  const { theme } = useSettingsStore();
  const C = Colors[theme];

  const [targets, setTargets] = useState<Target[]>([]);
  const [floats, setFloats] = useState<{ id: number; text: string; x: number; y: number; anim: Animated.Value }[]>([]);
  const nextId = useRef(0);
  const endCalled = useRef(false);
  const floatId = useRef(0);

  const spawnTarget = useCallback(() => {
    setTargets((prev) => {
      if (prev.length >= 5) return prev;
      const t = randomTarget(nextId.current++);
      // Pop-in animasyon
      Animated.spring(t.scale, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }).start();
      return [...prev, t];
    });
  }, []);

  const removeTarget = useCallback((id: number) => {
    setTargets((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showFloat = (text: string, x: number, y: number) => {
    const id = floatId.current++;
    const anim = new Animated.Value(0);
    setFloats((f) => [...f, { id, text, x, y, anim }]);
    Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }).start(() => {
      setFloats((f) => f.filter((fl) => fl.id !== id));
    });
  };

  useEffect(() => {
    const t = setInterval(spawnTarget, 700);
    return () => clearInterval(t);
  }, [spawnTarget]);

  const handleHit = (target: Target) => {
    removeTarget(target.id);
    if (target.type === 'trap') {
      assetService.playSound('miss');
      assetService.vibrate([0, 80, 40, 120]);
      resetCombo();
      showFloat('-CAN', target.x + 16, target.y);
      const dead = loseLife();
      if (dead && !endCalled.current) { endCalled.current = true; onEnd(); }
      return;
    }
    assetService.playSound(target.type === 'bonus' ? 'combo' : 'hit');
    assetService.vibrate(30);
    const cfg = TARGET_CONFIG[target.type];
    const multiplier = Math.max(1, Math.floor(combo / 3) + 1);
    const total = cfg.pts * multiplier;
    addScore(cfg.pts);
    incrementCombo();
    showFloat(`+${total}`, target.x + 16, target.y);
  };

  const comboColor = combo >= 8 ? '#ff4444' : combo >= 5 ? C.accentYellow : combo >= 3 ? C.accentTeal : C.textSecondary;

  return (
    <View style={[s.container, { backgroundColor: C.bgPrimary }]}>
      <ScoreBar />

      <View style={s.hudRow}>
        {/* Canlar */}
        <View style={s.lives}>
          {[0, 1, 2].map((i) => (
            <Text key={i} style={[s.heart, { opacity: i < lives ? 1 : 0.2 }]}>❤️</Text>
          ))}
        </View>
        {combo >= 3 && (
          <View style={[s.comboPill, { backgroundColor: comboColor + '33', borderColor: comboColor }]}>
            <Text style={[s.comboText, { color: comboColor }]}>🔥 x{combo}</Text>
          </View>
        )}
      </View>

      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <TimerBar
          duration={30}
          isPlaying={true}
          onTimeUp={() => {
            if (!endCalled.current) { endCalled.current = true; onEnd(); }
          }}
        />
      </View>

      <ComboBar combo={combo} />

      {targets.map((t) => {
        const cfg = TARGET_CONFIG[t.type];
        return (
          <TouchableOpacity
            key={t.id}
            style={[s.targetWrap, { left: t.x, top: t.y }]}
            onPress={() => handleHit(t)}
            activeOpacity={0.8}
          >
            <Animated.View style={[s.target, {
              backgroundColor: cfg.bg,
              borderColor: cfg.border,
              transform: [{ scale: t.scale }],
            }]}>
              <Text style={s.targetEmoji}>{cfg.emoji}</Text>
            </Animated.View>
          </TouchableOpacity>
        );
      })}

      {floats.map((f) => (
        <Animated.Text
          key={f.id}
          style={[s.float, {
            left: f.x, top: f.y,
            color: f.text.startsWith('-') ? C.danger : C.accentYellow,
            opacity: f.anim,
            transform: [{ translateY: f.anim.interpolate({ inputRange: [0, 1], outputRange: [0, -50] }) }],
          }]}
        >
          {f.text}
        </Animated.Text>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  hudRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  lives: { flexDirection: 'row', gap: 4 },
  heart: { fontSize: 22 },
  comboPill: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  comboText: { fontFamily: 'Nunito-ExtraBold', fontSize: 14 },
  targetWrap: { position: 'absolute' },
  target: {
    width: TARGET_SIZE, height: TARGET_SIZE, borderRadius: TARGET_SIZE / 2,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 10,
  },
  targetEmoji: { fontSize: 30 },
  float: { position: 'absolute', fontFamily: 'Nunito-ExtraBold', fontSize: 20, pointerEvents: 'none' } as any,
});