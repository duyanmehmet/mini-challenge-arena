import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { useGameStore } from '../../../store/gameStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { Colors } from '../../../constants/colors';
import { assetService } from '../../../services/asset.service';
import { ScoreBar } from '../ScoreBar';
import { ComboBar } from '../ComboBar';

const { width: SW } = Dimensions.get('window');
const LANES      = 3;
const LANE_W     = (SW - 32) / LANES;
const ROAD_H     = 420;
const PLAYER_Y   = ROAD_H - 80;
const OBJ_W      = 50;
const OBJ_H      = 56;

type ObjType = 'obstacle' | 'coin' | 'shield' | 'speed';

interface RoadObj {
  id: number;
  lane: number;
  type: ObjType;
  y: Animated.Value;
}

const OBJ_CFG: Record<ObjType, { emoji: string; color: string; label: string }> = {
  obstacle: { emoji: '🧱', color: '#e94560', label: 'Engel'    },
  coin:     { emoji: '🪙', color: '#f0c040', label: '+25 coin' },
  shield:   { emoji: '🛡️', color: '#4ecdc4', label: 'Kalkan!'  },
  speed:    { emoji: '⚡', color: '#9b59b6', label: 'Hız!'     },
};

interface Props { onEnd: () => void }

export function EscapeMode({ onEnd }: Props) {
  const { addScore, incrementCombo, resetCombo, score, combo } = useGameStore();
  const { theme } = useSettingsStore();
  const C = Colors[theme];

  const [playerLane, setPlayerLane] = useState(1);
  const [objects, setObjects]       = useState<RoadObj[]>([]);
  const [elapsed, setElapsed]       = useState(0);
  const [hasShield, setHasShield]   = useState(false);
  const [speedBoost, setSpeedBoost] = useState(false);
  const [feedback, setFeedback]     = useState<{ text: string; color: string } | null>(null);

  const nextId     = useRef(0);
  const speed      = useRef(2.5);
  const endCalled  = useRef(false);
  const shieldRef  = useRef(false);
  const laneRef    = useRef(1);
  const objectsRef = useRef<RoadObj[]>([]);

  // Senkron refs
  useEffect(() => { laneRef.current = playerLane; }, [playerLane]);
  useEffect(() => { objectsRef.current = objects; }, [objects]);
  useEffect(() => { shieldRef.current = hasShield; }, [hasShield]);

  // Elapsed timer
  useEffect(() => {
    const t = setInterval(() => {
      setElapsed((e) => { addScore(2); return e + 1; });
    }, 1000);
    return () => clearInterval(t);
  }, [addScore]);

  // Hız artışı
  useEffect(() => {
    const t = setInterval(() => {
      speed.current = Math.min(speed.current * 1.1, 10);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  // Nesne spawn
  useEffect(() => {
    const spawn = () => {
      if (endCalled.current) return;

      const lane = Math.floor(Math.random() * LANES);
      const rand = Math.random();
      const type: ObjType =
        rand < 0.55 ? 'obstacle' :
        rand < 0.75 ? 'coin' :
        rand < 0.88 ? 'shield' : 'speed';

      const y = new Animated.Value(-OBJ_H - 20);
      const id = nextId.current++;
      const obj: RoadObj = { id, lane, type, y };

      setObjects((prev) => [...prev, obj]);

      const dur = (ROAD_H + OBJ_H + 20) / speed.current * 16;

      Animated.timing(y, {
        toValue: ROAD_H + 20,
        duration: dur,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setObjects((prev) => {
            const hit = prev.find((o) => o.id === id);
            if (hit && hit.type === 'obstacle' && hit.lane === laneRef.current) {
              // Engele çarptı (frame sonu kontrolü)
              handleCollision();
            }
            return prev.filter((o) => o.id !== id);
          });
        }
      });

      // Çarpışma: anlık kontrolde yakalanamayabilir, y değerine bak
      const checkInterval = setInterval(() => {
        if (endCalled.current) { clearInterval(checkInterval); return; }
        const yVal = (y as any)._value as number;
        if (yVal >= PLAYER_Y - OBJ_H / 2 && yVal <= PLAYER_Y + 20) {
          if (obj.lane === laneRef.current) {
            clearInterval(checkInterval);
            setObjects((prev) => prev.filter((o) => o.id !== id));
            (y as any).stopAnimation();
            if (obj.type === 'obstacle') {
              handleCollision();
            } else {
              handlePickup(obj.type);
            }
          }
        }
        if (yVal > ROAD_H + 20) clearInterval(checkInterval);
      }, 50);
    };

    const t = setTimeout(() => {
      spawn();
      const iv = setInterval(() => {
        if (endCalled.current) { clearInterval(iv); return; }
        spawn();
      }, Math.max(900 - elapsed * 5, 500));
      return () => clearInterval(iv);
    }, 800);

    return () => clearTimeout(t);
  }, []);

  const handleCollision = useCallback(() => {
    if (shieldRef.current) {
      setHasShield(false);
      shieldRef.current = false;
      assetService.playSound('miss');
      assetService.vibrate(80);
      showFeedback('🛡️ Kalkan kırıldı!', '#4ecdc4');
      resetCombo();
      return;
    }
    if (endCalled.current) return;
    endCalled.current = true;
    assetService.playSound('miss');
    assetService.vibrate([0, 200, 100, 300]);
    onEnd();
  }, [onEnd, resetCombo]);

  const handlePickup = useCallback((type: ObjType) => {
    if (type === 'coin') {
      addScore(25);
      incrementCombo();
      assetService.playSound('hit');
      assetService.vibrate(30);
      showFeedback('🪙 +25!', '#f0c040');
    } else if (type === 'shield') {
      setHasShield(true);
      shieldRef.current = true;
      assetService.playSound('combo');
      showFeedback('🛡️ Kalkan!', '#4ecdc4');
    } else if (type === 'speed') {
      setSpeedBoost(true);
      addScore(50);
      assetService.playSound('combo');
      showFeedback('⚡ Hız x2!', '#9b59b6');
      setTimeout(() => setSpeedBoost(false), 3000);
    }
  }, [addScore, incrementCombo]);

  const showFeedback = (text: string, color: string) => {
    setFeedback({ text, color });
    setTimeout(() => setFeedback(null), 900);
  };

  const changeLane = (dir: -1 | 0 | 1) => {
    setPlayerLane((l) => {
      const next = Math.max(0, Math.min(LANES - 1, l + dir));
      laneRef.current = next;
      return next;
    });
  };

  const s = styles(C);

  const speedLevel = Math.min(Math.floor((speed.current - 2.5) / 1), 4);
  const speedColors = ['#4ecdc4','#2ecc71','#f0c040','#e67e22','#e94560'];

  return (
    <View style={s.root}>
      <ScoreBar />
      <ComboBar combo={combo} />

      {/* HUD */}
      <View style={s.hud}>
        <Text style={[s.timeText, { color: C.textPrimary }]}>⏱ {elapsed}s</Text>
        {hasShield && <Text style={s.shieldIcon}>🛡️ Kalkan</Text>}
        {speedBoost && <Text style={[s.shieldIcon, { color: '#9b59b6' }]}>⚡ Hız x2</Text>}
        <View style={[s.speedBadge, { backgroundColor: speedColors[speedLevel] + '22', borderColor: speedColors[speedLevel] }]}>
          <Text style={[s.speedText, { color: speedColors[speedLevel] }]}>Lvl {speedLevel + 1}</Text>
        </View>
      </View>

      {/* Yol */}
      <View style={[s.road, { backgroundColor: C.bgSecondary }]}>
        {/* Şerit çizgileri */}
        {[1, 2].map((i) => (
          <View key={i} style={[s.laneLine, { left: 16 + i * LANE_W, backgroundColor: C.border }]} />
        ))}

        {/* Nesneler */}
        {objects.map((o) => (
          <Animated.View key={o.id} style={[s.objWrap, {
            left: 16 + o.lane * LANE_W + (LANE_W - OBJ_W) / 2,
            transform: [{ translateY: o.y }],
          }]}>
            <View style={[s.obj, {
              backgroundColor: OBJ_CFG[o.type].color + '22',
              borderColor: OBJ_CFG[o.type].color,
            }]}>
              <Text style={s.objEmoji}>{OBJ_CFG[o.type].emoji}</Text>
            </View>
          </Animated.View>
        ))}

        {/* Oyuncu */}
        <View style={[s.player, {
          left: 16 + playerLane * LANE_W + (LANE_W - OBJ_W) / 2,
          top: PLAYER_Y,
          borderColor: hasShield ? '#4ecdc4' : '#e94560',
          backgroundColor: hasShield ? '#4ecdc433' : '#e9456022',
        }]}>
          <Text style={s.playerEmoji}>{hasShield ? '🛡️' : '🏃'}</Text>
        </View>

        {/* Feedback */}
        {feedback && (
          <Text style={[s.feedback, { color: feedback.color }]}>{feedback.text}</Text>
        )}
      </View>

      {/* Kontrol Butonları */}
      <View style={s.controls}>
        <TouchableOpacity style={[s.ctrlBtn, { backgroundColor: C.bgSecondary }]} onPress={() => changeLane(-1)}>
          <Text style={s.ctrlText}>◀</Text>
        </TouchableOpacity>
        <View style={[s.ctrlCenter, { backgroundColor: C.bgTertiary }]}>
          <Text style={[s.ctrlHint, { color: C.textSecondary }]}>Şerit değiştir</Text>
        </View>
        <TouchableOpacity style={[s.ctrlBtn, { backgroundColor: C.bgSecondary }]} onPress={() => changeLane(1)}>
          <Text style={s.ctrlText}>▶</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgPrimary },
  hud: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 6, gap: 10 },
  timeText: { fontFamily: 'Nunito-Bold', fontSize: 16 },
  shieldIcon: { fontFamily: 'Nunito-Bold', fontSize: 13, color: '#4ecdc4' },
  speedBadge: { marginLeft: 'auto', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1 },
  speedText: { fontFamily: 'Nunito-ExtraBold', fontSize: 12 },
  road: { height: ROAD_H, position: 'relative', overflow: 'hidden', marginHorizontal: 16, borderRadius: 16, marginBottom: 8 },
  laneLine: { position: 'absolute', top: 0, bottom: 0, width: 1.5 },
  objWrap: { position: 'absolute', width: OBJ_W, height: OBJ_H },
  obj: { width: OBJ_W, height: OBJ_H, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  objEmoji: { fontSize: 28 },
  player: {
    position: 'absolute', width: OBJ_W, height: OBJ_H,
    borderRadius: 14, borderWidth: 2.5,
    alignItems: 'center', justifyContent: 'center',
  },
  playerEmoji: { fontSize: 30 },
  feedback: {
    position: 'absolute', top: PLAYER_Y - 40, alignSelf: 'center',
    fontFamily: 'Nunito-ExtraBold', fontSize: 20, width: '100%', textAlign: 'center',
  },
  controls: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, height: 60 },
  ctrlBtn: { flex: 2, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  ctrlText: { fontSize: 28, color: '#e94560', fontWeight: '900' },
  ctrlCenter: { flex: 3, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  ctrlHint: { fontFamily: 'Nunito-Regular', fontSize: 12 },
});