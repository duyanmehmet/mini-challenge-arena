import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, PanResponder } from 'react-native';
import { useGameStore } from '../../../store/gameStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { Colors } from '../../../constants/colors';
import { useTimer } from '../../../hooks/useTimer';
import { ScoreBar } from '../ScoreBar';
import { ComboBar } from '../ComboBar';
import { assetService } from '../../../services/asset.service';

const { width, height: screenH } = Dimensions.get('window');
const GAME_H = screenH - 200;
const PLAYER_SIZE = 24;
const OBSTACLE_W = 60;

interface Obstacle {
  id: number;
  x: number;
  y: number;
  isBonus: boolean;
}

interface Props { onEnd: () => void }

export function EscapeMode({ onEnd }: Props) {
  const { addScore, score } = useGameStore();
  const { theme } = useSettingsStore();
  const C = Colors[theme];

  const [playerX, setPlayerX] = useState(width / 2 - PLAYER_SIZE / 2);
  const [playerY, setPlayerY] = useState(GAME_H - 80);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [alive, setAlive] = useState(true);

  const nextId = useRef(0);
  const speedRef = useRef(3);
  const endCalled = useRef(false);
  const playerRef = useRef({ x: width / 2, y: GAME_H - 80 });

  const { seconds: elapsed, startTimer, pauseTimer } = useTimer({
    initialSeconds: 0,
    countUp: true,
    autoStart: true
  });

  const handleEnd = useCallback(() => {
    if (!endCalled.current) {
      endCalled.current = true;
      setAlive(false);
      pauseTimer();
      onEnd();
    }
  }, [pauseTimer, onEnd]);

  // Score ticker
  useEffect(() => {
    if (!alive) return;
    const t = setInterval(() => {
      addScore(1);
    }, 1000);
    return () => clearInterval(t);
  }, [alive, addScore]);

  // Speed up every 10s
  useEffect(() => {
    if (elapsed > 0 && elapsed % 10 === 0) {
      speedRef.current = Math.min(speedRef.current * 1.15, 15);
    }
  }, [elapsed]);

  // Spawn obstacles
  useEffect(() => {
    if (!alive) return;
    const t = setInterval(() => {
      const isBonus = Math.random() < 0.15;
      setObstacles((obs) => [...obs, {
        id: nextId.current++,
        x: Math.random() * (width - OBSTACLE_W),
        y: -40,
        isBonus,
      }]);
    }, 1200);
    return () => clearInterval(t);
  }, [alive]);

  // Move obstacles + collision
  useEffect(() => {
    if (!alive) return;
    const t = setInterval(() => {
      setObstacles((obs) => {
        const updated = obs
          .map((o) => ({ ...o, y: o.y + speedRef.current }))
          .filter((o) => o.y < GAME_H + 40);

        const px = playerRef.current.x;
        const py = playerRef.current.y;

        for (const o of updated) {
          const dx = Math.abs(px - (o.x + OBSTACLE_W / 2));
          const dy = Math.abs(py - (o.y + 20));
          if (dx < PLAYER_SIZE + OBSTACLE_W / 2 && dy < PLAYER_SIZE + 20) {
            if (o.isBonus) {
              addScore(50);
              assetService.playSound('combo');
              assetService.vibrate(30);
              return updated.filter((ob) => ob.id !== o.id);
            } else {
              assetService.playSound('miss');
              assetService.vibrate([0, 200, 100, 200]);
              handleEnd();
              return [];
            }
          }
        }
        return updated;
      });
    }, 30);
    return () => clearInterval(t);
  }, [alive, handleEnd, addScore]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => alive,
    onPanResponderMove: (e) => {
      const newX = Math.max(0, Math.min(width - PLAYER_SIZE * 2, e.nativeEvent.pageX - PLAYER_SIZE));
      setPlayerX(newX);
      playerRef.current.x = newX + PLAYER_SIZE;
    },
  });

  const s = styles(C);

  // Hız rengini hesapla
  const speedLevel = Math.min(Math.floor((speedRef.current - 3) / 2), 4);
  const speedColors = ['#4ecdc4','#2ecc71','#f0c040','#e67e22','#e94560'];
  const speedColor = speedColors[speedLevel] ?? '#e94560';

  return (
    <View style={s.container} {...panResponder.panHandlers}>
      <ScoreBar />
      <ComboBar combo={0} />
      <View style={s.hud}>
        <View style={s.statBox}>
          <Text style={[s.statLabel, { color: C.textSecondary }]}>SÜRE</Text>
          <Text style={[s.statVal, { color: C.textPrimary }]}>{elapsed}s</Text>
        </View>
        <View style={[s.speedMeter, { backgroundColor: speedColor + '22', borderColor: speedColor }]}>
          <Text style={[s.speedText, { color: speedColor }]}>💨 {speedRef.current.toFixed(1)}x</Text>
        </View>
        <View style={s.statBox}>
          <Text style={[s.statLabel, { color: C.textSecondary }]}>HEDEF</Text>
          <Text style={[s.statVal, { color: C.accentYellow }]}>60s</Text>
        </View>
      </View>

      {/* Zemin çizgisi */}
      <View style={[s.groundLine, { backgroundColor: C.border }]} />

      {/* Oyun alanı */}
      <View style={[s.gameArea, { height: GAME_H }]}>
        {/* Oyuncu — koşan karakter */}
        <View style={[s.player, { left: playerX, top: playerY }]}>
          <Text style={s.playerEmoji}>🏃</Text>
          {/* Gölge */}
          <View style={[s.shadow, { backgroundColor: C.textSecondary + '33' }]} />
        </View>

        {/* Engeller */}
        {obstacles.map((o) => (
          <View key={o.id} style={[
            s.obstacle,
            {
              left: o.x, top: o.y,
              backgroundColor: o.isBonus ? C.accentYellow + '22' : C.danger + '11',
              borderColor: o.isBonus ? C.accentYellow : C.danger,
            }
          ]}>
            <Text style={s.obstacleEmoji}>{o.isBonus ? '⭐' : '🧱'}</Text>
          </View>
        ))}
      </View>

      <Text style={[s.hint, { color: C.textSecondary }]}>
        👆 Parmağını sürükle → engelleri aş!
      </Text>
    </View>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bgPrimary },
  hud: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  statBox: { alignItems: 'center' },
  statLabel: { fontSize: 10, fontFamily: 'Nunito-SemiBold', letterSpacing: 1 },
  statVal: { fontSize: 20, fontFamily: 'Nunito-ExtraBold' },
  speedMeter: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1.5 },
  speedText: { fontFamily: 'Nunito-ExtraBold', fontSize: 15 },
  groundLine: { height: 1, marginHorizontal: 16, marginBottom: 4 },
  gameArea: { flex: 1, overflow: 'hidden', position: 'relative' },
  player: { position: 'absolute', alignItems: 'center' },
  playerEmoji: { fontSize: 32 },
  shadow: { width: 24, height: 6, borderRadius: 12, marginTop: -4 },
  obstacle: {
    position: 'absolute', width: OBSTACLE_W, height: 44,
    borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2,
  },
  obstacleEmoji: { fontSize: 22 },
  hint: { textAlign: 'center', paddingBottom: 12, fontFamily: 'Nunito-Regular', fontSize: 12 },
});
