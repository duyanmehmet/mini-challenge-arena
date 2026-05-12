import { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, PanResponder, Dimensions,
  Animated, TouchableOpacity,
} from 'react-native';
import { useGameStore } from '../../../store/gameStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { Colors } from '../../../constants/colors';
import { assetService } from '../../../services/asset.service';
import { ScoreBar } from '../ScoreBar';
import { ComboBar } from '../ComboBar';

const { width: SW } = Dimensions.get('window');
const GOAL_W  = SW - 48;
const GOAL_H  = 160;
const MAX_SHOTS = 10;
const BALL_R = 20;
const KEEPER_W = 48;
const KEEPER_H = 52;

// --- Kaleci AI seviyesi ---
function keeperSpeed(combo: number): number {
  if (combo < 3) return 0.25;
  if (combo < 6) return 0.45;
  if (combo < 9) return 0.65;
  return 0.80;
}

function keeperReactionDelay(combo: number): number {
  if (combo < 3) return 350;
  if (combo < 6) return 220;
  if (combo < 9) return 120;
  return 60;
}

// --- Bölge puanları ---
function zoneScore(normX: number, normY: number): { pts: number; label: string } {
  const isTop    = normY < 0.32;
  const isCorner = normX < 0.18 || normX > 0.82;
  const isMid    = normX > 0.38 && normX < 0.62;
  if (isTop && isCorner) return { pts: 100, label: '🔥 Üst Köşe!' };
  if (isTop && !isMid)   return { pts: 75,  label: '⚡ Üst!' };
  if (isTop && isMid)    return { pts: 65,  label: '🎯 Üst Orta' };
  if (isCorner)          return { pts: 60,  label: '📐 Alt Köşe' };
  if (isMid)             return { pts: 35,  label: '⚽ Alt Orta' };
  return                        { pts: 45,  label: '✅ Gol!' };
}

interface Props { onEnd: () => void }

export function FootballMode({ onEnd }: Props) {
  const { addScore, incrementCombo, resetCombo, score, combo } = useGameStore();
  const { theme } = useSettingsStore();
  const C = Colors[theme];

  const [shots, setShots]       = useState(0);
  const [result, setResult]     = useState<{ text: string; color: string } | null>(null);
  const [isAiming, setIsAiming] = useState(false);
  const [power, setPower]       = useState(0);
  const [aimAngle, setAimAngle] = useState(0);   // -1 sol, 0 orta, 1 sağ
  const [streak, setStreak]     = useState(0);   // ardışık gol sayısı
  const [showZone, setShowZone] = useState(false);

  const ballX    = useRef(new Animated.Value(SW / 2 - BALL_R)).current;
  const ballY    = useRef(new Animated.Value(500)).current;
  const ballScale= useRef(new Animated.Value(1)).current;
  const keeperX  = useRef(new Animated.Value(GOAL_W / 2 - KEEPER_W / 2)).current;
  const keeperAnim = useRef(new Animated.Value(0)).current; // sallanma
  const powAnim  = useRef(new Animated.Value(0)).current;

  const endCalled    = useRef(false);
  const shooting     = useRef(false);
  const touchStart   = useRef({ x: 0, y: 0, time: 0 });

  // Kalecinin başlangıç konumu rastgele
  useEffect(() => {
    keeperX.setValue(Math.random() * (GOAL_W - KEEPER_W));
    // Kaleci hafifçe sallanıyor
    Animated.loop(
      Animated.sequence([
        Animated.timing(keeperAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(keeperAnim, { toValue: -1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const resetBall = useCallback(() => {
    ballX.setValue(SW / 2 - BALL_R);
    ballY.setValue(500);
    ballScale.setValue(1);
    shooting.current = false;
    setPower(0);
    setAimAngle(0);
  }, []);

  const shoot = useCallback((dx: number, dy: number, swipeSpeed: number) => {
    if (shooting.current) return;
    shooting.current = true;

    const newShots = shots + 1;
    setShots(newShots);
    setIsAiming(false);

    // Normalizasyon: dx/dy → kale içi hedef koordinatı
    const normX = Math.max(0, Math.min(1, 0.5 + (dx / (SW * 0.5)) * 0.5));
    const normY = Math.max(0, Math.min(1, 0.5 - (dy / 400) * 0.6));
    const shotPower = Math.min(1, swipeSpeed / 1200);

    // Top hedef konumunu hesapla
    const targetX = 24 + normX * (GOAL_W - BALL_R * 2);
    const targetY = 80 + normY * (GOAL_H - BALL_R * 2);

    // Kaleci hareket et (yapay zeka)
    const delay = keeperReactionDelay(combo);
    setTimeout(() => {
      const spd = keeperSpeed(combo);
      const keeperTarget = normX * (GOAL_W - KEEPER_W);
      Animated.timing(keeperX, {
        toValue: keeperTarget,
        duration: 800 * (1 - spd),
        useNativeDriver: false,
      }).start();
    }, delay);

    // Top animasyonu
    Animated.parallel([
      Animated.timing(ballX, { toValue: targetX, duration: 450, useNativeDriver: false }),
      Animated.timing(ballY, { toValue: targetY, duration: 450, useNativeDriver: false }),
      Animated.timing(ballScale, { toValue: 0.55, duration: 450, useNativeDriver: true }),
    ]).start(() => {
      // Kalecinin pozisyonunu al ve gol olup olmadığını hesapla
      keeperX.stopAnimation((kx) => {
        const ballCenterX = targetX + BALL_R;
        const keeperCenter = kx + KEEPER_W / 2;
        const dist = Math.abs(ballCenterX - keeperCenter);

        // Kurtarma mesafesi kombo'ya göre değişiyor
        const catchRadius = 32 + keeperSpeed(combo) * 28;
        const isGoal = dist > catchRadius || normY > 0.85;

        if (isGoal) {
          const zone = zoneScore(normX, normY);
          const multiplier = streak >= 3 ? 2 : streak >= 2 ? 1.5 : 1;
          const total = Math.round(zone.pts * (1 + combo * 0.15) * multiplier);
          addScore(total);
          incrementCombo();
          setStreak((s) => s + 1);
          assetService.playSound('goal');
          assetService.vibrate([0, 40, 20, 60]);
          setResult({ text: `⚽ ${zone.label} +${total}`, color: C.success });
        } else {
          resetCombo();
          setStreak(0);
          assetService.playSound('miss');
          assetService.vibrate([0, 80, 40, 80]);
          setResult({ text: '🧤 Kaleci kurtardı!', color: C.danger });
        }

        if (newShots >= MAX_SHOTS) {
          setTimeout(() => { if (!endCalled.current) { endCalled.current = true; onEnd(); } }, 1200);
        } else {
          setTimeout(() => { setResult(null); resetBall(); }, 1000);
        }
      });
    });
  }, [shots, combo, streak, addScore, incrementCombo, resetCombo, resetBall, onEnd, C]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !shooting.current && shots < MAX_SHOTS,
    onPanResponderGrant: (e) => {
      touchStart.current = {
        x: e.nativeEvent.pageX,
        y: e.nativeEvent.pageY,
        time: Date.now(),
      };
      setIsAiming(true);
      setPower(0);
    },
    onPanResponderMove: (e) => {
      const dx = e.nativeEvent.pageX - touchStart.current.x;
      const dy = e.nativeEvent.pageY - touchStart.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const p = Math.min(dist / 200, 1);
      setPower(p);
      setAimAngle(dx / 150);
    },
    onPanResponderRelease: (e) => {
      const dx = e.nativeEvent.pageX - touchStart.current.x;
      const dy = e.nativeEvent.pageY - touchStart.current.y;
      const dt = Date.now() - touchStart.current.time;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = dist / (dt / 1000);

      if (dist < 15) {
        // Çok kısa dokunuş — iptal
        setIsAiming(false);
        return;
      }
      shoot(-dx, -dy, speed);
    },
    onPanResponderTerminate: () => { setIsAiming(false); setPower(0); },
  });

  const s = styles(C);

  const shotsLeft = MAX_SHOTS - shots;
  const comboBonus = combo >= 2 ? `x${combo} Combo!` : '';
  const streakBonus = streak >= 3 ? ' 🔥 Seri!' : streak >= 2 ? ' ✨ Güzel!' : '';

  return (
    <View style={s.root} {...panResponder.panHandlers}>
      <ScoreBar />
      <ComboBar combo={combo} />

      {/* Üst bilgi */}
      <View style={s.info}>
        <View style={s.shotCounter}>
          {Array.from({ length: MAX_SHOTS }).map((_, i) => (
            <View key={i} style={[
              s.shotDot,
              { backgroundColor: i < shots ? (i < shots - 1 ? C.accentTeal : C.accentRed) : C.bgTertiary }
            ]} />
          ))}
        </View>
        <Text style={[s.shotsText, { color: C.textSecondary }]}>{shotsLeft} atış kaldı</Text>
      </View>

      {/* Combo + seri bonus */}
      {(comboBonus || streakBonus) ? (
        <Text style={[s.bonusText, { color: C.accentYellow }]}>
          {comboBonus}{streakBonus}
        </Text>
      ) : null}

      {/* KALE */}
      <View style={s.goalArea}>
        {/* Arka ağ */}
        <View style={[s.net, { borderColor: C.border }]}>
          {/* Yatay ağ çizgileri */}
          {[0.25, 0.5, 0.75].map((r) => (
            <View key={r} style={[s.netH, { top: `${r * 100}%`, borderColor: C.border }]} />
          ))}
          {/* Dikey ağ çizgileri */}
          {[0.2, 0.4, 0.6, 0.8].map((r) => (
            <View key={r} style={[s.netV, { left: `${r * 100}%`, borderColor: C.border }]} />
          ))}

          {/* Bölge etiketleri (hedefleme yardımı) */}
          {showZone && (
            <>
              <View style={[s.zoneBox, s.zoneTopLeft,  { borderColor: '#ff0000aa' }]}><Text style={s.zoneLabel}>100</Text></View>
              <View style={[s.zoneBox, s.zoneTop,      { borderColor: '#ff880088' }]}><Text style={s.zoneLabel}>65</Text></View>
              <View style={[s.zoneBox, s.zoneTopRight, { borderColor: '#ff0000aa' }]}><Text style={s.zoneLabel}>100</Text></View>
              <View style={[s.zoneBox, s.zoneMidLeft,  { borderColor: '#ffff0066' }]}><Text style={s.zoneLabel}>60</Text></View>
              <View style={[s.zoneBox, s.zoneMid,      { borderColor: '#00ff0044' }]}><Text style={s.zoneLabel}>35</Text></View>
              <View style={[s.zoneBox, s.zoneMidRight, { borderColor: '#ffff0066' }]}><Text style={s.zoneLabel}>60</Text></View>
            </>
          )}
        </View>

        {/* Direkler */}
        <View style={[s.post, s.postLeft,  { backgroundColor: '#ddd' }]} />
        <View style={[s.post, s.postRight, { backgroundColor: '#ddd' }]} />
        <View style={[s.crossbar, { backgroundColor: '#ddd' }]} />

        {/* Kaleci */}
        <Animated.View style={[s.keeper, {
          left: keeperX,
          transform: [{ translateX: keeperAnim.interpolate({ inputRange: [-1, 1], outputRange: [-4, 4] }) }],
        }]}>
          <Text style={s.keeperEmoji}>🧤</Text>
          {/* Kaleci seviye göstergesi */}
          <View style={[s.keeperLevel, { backgroundColor: keeperSpeed(combo) > 0.6 ? C.danger : keeperSpeed(combo) > 0.4 ? C.warning : C.success }]} />
        </Animated.View>

        {/* Top */}
        <Animated.View style={[s.ball, { left: ballX, top: ballY, transform: [{ scale: ballScale }] }]}>
          <Text style={s.ballEmoji}>⚽</Text>
        </Animated.View>
      </View>

      {/* Güç metresi */}
      <View style={s.powerArea}>
        {isAiming && (
          <>
            <Text style={[s.powerLabel, { color: C.textSecondary }]}>
              {power < 0.3 ? '🟢 Hafif' : power < 0.65 ? '🟡 Orta' : '🔴 Güçlü'}
              {aimAngle < -0.3 ? ' ← Sol' : aimAngle > 0.3 ? ' → Sağ' : ' ↑ Orta'}
            </Text>
            <View style={[s.powerTrack, { backgroundColor: C.bgTertiary }]}>
              <View style={[s.powerFill, {
                width: `${power * 100}%`,
                backgroundColor: power < 0.3 ? C.success : power < 0.65 ? C.warning : C.danger,
              }]} />
            </View>
          </>
        )}
      </View>

      {/* Sonuç */}
      {result && (
        <View style={[s.resultBox, { backgroundColor: result.color + '22' }]}>
          <Text style={[s.resultText, { color: result.color }]}>{result.text}</Text>
        </View>
      )}

      {/* Talimat + bölge göster */}
      <View style={s.footer}>
        <Text style={[s.hint, { color: C.textSecondary }]}>
          {isAiming ? '✋ Bırak → Şut!' : '👇 Sürükle → Şut yap!'}
        </Text>
        <TouchableOpacity onPress={() => setShowZone((v) => !v)} style={[s.zoneToggle, { backgroundColor: C.bgSecondary }]}>
          <Text style={[s.zoneToggleText, { color: C.textSecondary }]}>{showZone ? '🙈' : '🎯'} Bölge</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const POST_W = 6;

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgPrimary, paddingTop: 4 },

  info: { alignItems: 'center', paddingHorizontal: 24, marginBottom: 4 },
  shotCounter: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  shotDot: { width: 18, height: 8, borderRadius: 4 },
  shotsText: { fontSize: 12, fontFamily: 'Nunito-Regular' },
  bonusText: { textAlign: 'center', fontFamily: 'Nunito-ExtraBold', fontSize: 15, marginBottom: 4 },

  goalArea: {
    alignSelf: 'center',
    width: SW - 48,
    height: GOAL_H + POST_W,
    marginBottom: 12,
    position: 'relative',
    overflow: 'visible',
  },

  net: {
    position: 'absolute',
    left: POST_W / 2, top: POST_W / 2,
    width: SW - 48 - POST_W,
    height: GOAL_H - POST_W,
    borderWidth: 0,
    backgroundColor: '#ffffff08',
    overflow: 'hidden',
  },
  netH: { position: 'absolute', left: 0, right: 0, height: 1, borderTopWidth: 1, borderStyle: 'dashed' },
  netV: { position: 'absolute', top: 0, bottom: 0, width: 1, borderLeftWidth: 1, borderStyle: 'dashed' },

  zoneBox: { position: 'absolute', borderWidth: 1.5, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  zoneLabel: { color: '#fff', fontSize: 10, fontFamily: 'Nunito-ExtraBold' },
  zoneTopLeft:  { left: 0,    top: 0,       width: '20%', height: '35%' },
  zoneTop:      { left: '20%',top: 0,       width: '60%', height: '35%' },
  zoneTopRight: { right: 0,   top: 0,       width: '20%', height: '35%' },
  zoneMidLeft:  { left: 0,    bottom: 0,    width: '20%', height: '65%' },
  zoneMid:      { left: '20%',bottom: 0,    width: '60%', height: '65%' },
  zoneMidRight: { right: 0,   bottom: 0,    width: '20%', height: '65%' },

  post: { position: 'absolute', width: POST_W, height: GOAL_H, borderRadius: 3 },
  postLeft:  { left: 0,               top: 0 },
  postRight: { right: 0,              top: 0 },
  crossbar: { position: 'absolute', left: 0, right: 0, top: 0, height: POST_W, borderRadius: 3 },

  keeper: {
    position: 'absolute',
    bottom: 0, width: KEEPER_W, height: KEEPER_H,
    alignItems: 'center', justifyContent: 'flex-end',
  },
  keeperEmoji: { fontSize: 38 },
  keeperLevel: { width: 28, height: 4, borderRadius: 2, marginTop: 2 },

  ball: {
    position: 'absolute',
    width: BALL_R * 2, height: BALL_R * 2,
    alignItems: 'center', justifyContent: 'center',
  },
  ballEmoji: { fontSize: BALL_R * 1.6 },

  powerArea: { paddingHorizontal: 24, height: 44, justifyContent: 'center' },
  powerLabel: { fontFamily: 'Nunito-Bold', fontSize: 13, marginBottom: 6, textAlign: 'center' },
  powerTrack: { height: 10, borderRadius: 5, overflow: 'hidden' },
  powerFill: { height: '100%', borderRadius: 5 },

  resultBox: { marginHorizontal: 24, borderRadius: 14, padding: 12, alignItems: 'center', marginBottom: 8 },
  resultText: { fontFamily: 'Nunito-ExtraBold', fontSize: 18 },

  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24 },
  hint: { fontFamily: 'Nunito-Regular', fontSize: 13 },
  zoneToggle: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  zoneToggleText: { fontFamily: 'Nunito-Bold', fontSize: 12 },
});