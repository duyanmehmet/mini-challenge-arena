/**
 * Çark Düello — SpinWheel bileşeni
 * app/duel/wheel.tsx
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, Animated, Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors, AVATARS } from '../../src/constants/theme';

const { width: W } = Dimensions.get('window');
const WHEEL_SIZE    = Math.min(W - 40, 320);
const RADIUS        = WHEEL_SIZE / 2;
const SEGMENT_COUNT = 8;
const DEG_PER_SEG   = 360 / SEGMENT_COUNT;

const SEGMENTS = [
  { id: 'history',  icon: '🏺', label: 'Tarih',    color: '#7c3aed' },
  { id: 'science',  icon: '🔬', label: 'Bilim',    color: '#0891b2' },
  { id: 'sports',   icon: '⚽', label: 'Spor',     color: '#16a34a' },
  { id: 'geography',icon: '🌍', label: 'Coğrafya', color: '#b45309' },
  { id: 'cinema',   icon: '🎬', label: 'Sinema',   color: '#be185d' },
  { id: 'general',  icon: '💡', label: 'Genel',    color: '#6c3aed' },
  { id: 'turkey',   icon: '🇹🇷', label: 'Türkiye', color: '#dc2626' },
  { id: 'double',   icon: '⭐', label: '2X Puan',  color: '#d97706' },
];

export interface SpinWheelProps {
  targetSegment: number;
  onSpinComplete: (categoryId: string) => void;
  round: number;
  totalRounds?: number;
  myWins: number;
  oppWins: number;
  myAvatar: number;
  oppAvatar: number;
  myUsername?: string;
  oppUsername?: string;
}

export const SpinWheel: React.FC<SpinWheelProps> = ({
  targetSegment, onSpinComplete,
  round, totalRounds = 3,
  myWins, oppWins,
  myAvatar, oppAvatar,
  myUsername = 'Sen', oppUsername = 'Rakip',
}) => {
  const rotation    = useRef(new Animated.Value(0)).current;
  const [spinning,  setSpinning]  = useState(false);
  const [settled,   setSettled]   = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showBanner,  setShowBanner]  = useState(false);
  const bannerY   = useRef(new Animated.Value(-80)).current;
  const bannerOp  = useRef(new Animated.Value(0)).current;
  const selectedScale = useRef(new Animated.Value(1)).current;
  const glowOp    = useRef(new Animated.Value(0)).current;
  const pointerBounce = useRef(new Animated.Value(0)).current;

  const iconPositions = SEGMENTS.map((_, i) => {
    const angle = ((i * DEG_PER_SEG) - 90 + DEG_PER_SEG / 2) * (Math.PI / 180);
    const r = RADIUS * 0.72;
    return { x: RADIUS + r * Math.cos(angle) - 18, y: RADIUS + r * Math.sin(angle) - 18 };
  });

  const spin = () => {
    if (spinning || settled) return;
    setSpinning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Animated.loop(Animated.sequence([
      Animated.timing(pointerBounce, { toValue: -8, duration: 100, useNativeDriver: true }),
      Animated.timing(pointerBounce, { toValue: 0,  duration: 100, useNativeDriver: true }),
    ])).start();

    const targetAngle = 5 * 360 + (360 - targetSegment * DEG_PER_SEG);
    rotation.setValue(0);

    Animated.timing(rotation, { toValue: targetAngle, duration: 3000, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(() => {
      setSpinning(false); setSettled(true); setSelectedIdx(targetSegment);
      pointerBounce.stopAnimation(); pointerBounce.setValue(0);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      Animated.sequence([
        Animated.spring(selectedScale, { toValue: 1.25, tension: 80, friction: 6, useNativeDriver: true }),
        Animated.spring(selectedScale, { toValue: 1.1,  tension: 80, friction: 7, useNativeDriver: true }),
      ]).start();
      Animated.loop(Animated.sequence([
        Animated.timing(glowOp, { toValue: 1,   duration: 500, useNativeDriver: true }),
        Animated.timing(glowOp, { toValue: 0.3, duration: 500, useNativeDriver: true }),
      ])).start();

      setShowBanner(true);
      Animated.sequence([
        Animated.parallel([
          Animated.spring(bannerY, { toValue: 0, tension: 70, friction: 8, useNativeDriver: true }),
          Animated.timing(bannerOp, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]),
        Animated.delay(1600),
        Animated.parallel([
          Animated.timing(bannerY,  { toValue: -80, duration: 300, useNativeDriver: true }),
          Animated.timing(bannerOp, { toValue: 0,   duration: 300, useNativeDriver: true }),
        ]),
      ]).start();

      setTimeout(() => onSpinComplete(SEGMENTS[targetSegment].id), 2200);
    });
  };

  const rotate = rotation.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'], extrapolate: 'extend' });

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {showBanner && (
        <Animated.View style={[s.banner, { transform: [{ translateY: bannerY }], opacity: bannerOp }]}>
          <Text style={s.bannerTxt}>🎯 KATEGORİ BELİRLENDİ!</Text>
          {selectedIdx !== null && <Text style={s.bannerSub}>{SEGMENTS[selectedIdx].icon} {SEGMENTS[selectedIdx].label}</Text>}
        </Animated.View>
      )}

      <View style={s.roundRow}>
        {Array.from({ length: totalRounds }, (_, i) => (
          <View key={i} style={[s.roundDot, i < round - 1 && { backgroundColor: Colors.purple }, i === round - 1 && { backgroundColor: Colors.gold }]} />
        ))}
      </View>
      <Text style={s.roundLabel}>Tur {round}/{totalRounds}</Text>

      <View style={s.playersRow}>
        <PlayerCard avatar={AVATARS[myAvatar  % AVATARS.length]} username={myUsername}  wins={myWins}  isMe />
        <Text style={s.vsText}>VS</Text>
        <PlayerCard avatar={AVATARS[oppAvatar % AVATARS.length]} username={oppUsername} wins={oppWins} />
      </View>

      <View style={s.wheelWrap}>
        <Animated.View style={[s.pointer, { transform: [{ translateY: pointerBounce }] }]}>
          <View style={s.pointerTriangle} />
        </Animated.View>

        <Animated.View style={[s.wheel, { transform: [{ rotate }] }]}>
          {SEGMENTS.map((seg, i) => {
            const startAngle = i * DEG_PER_SEG;
            return (
              <View key={i} style={[s.segment, { transform: [{ rotate: `${startAngle}deg` }], backgroundColor: seg.color }]} />
            );
          })}
          {SEGMENTS.map((_, i) => (
            <View key={`l${i}`} style={[s.dividerLine, { transform: [{ rotate: `${i * DEG_PER_SEG}deg` }] }]} />
          ))}
          <View style={s.centerCircle}><Text style={{ fontSize: 22 }}>⚔️</Text></View>
          {SEGMENTS.map((seg, i) => {
            const pos = iconPositions[i];
            return (
              <View key={`ic${i}`} style={[s.segIcon, { left: pos.x, top: pos.y }]}>
                <Text style={s.segIconEmoji}>{seg.icon}</Text>
                <Text style={s.segIconLabel}>{seg.label}</Text>
              </View>
            );
          })}
        </Animated.View>

        {settled && selectedIdx !== null && (
          <Animated.View pointerEvents="none" style={[s.glowOverlay, { opacity: glowOp }]} />
        )}
      </View>

      <TouchableOpacity style={[s.spinBtn, spinning && { opacity: 0.5 }]} onPress={spin} disabled={spinning || settled} activeOpacity={0.85}>
        <Text style={s.spinBtnTxt}>
          {spinning ? 'Dönüyor...' : settled ? `${SEGMENTS[targetSegment].icon} ${SEGMENTS[targetSegment].label}` : 'ÇARKI ÇEVİR'}
        </Text>
      </TouchableOpacity>

      <View style={s.livesRow}>
        {Array.from({ length: 5 }, (_, i) => <Text key={i} style={{ fontSize: 22 }}>{i < 3 ? '❤️' : '🖤'}</Text>)}
      </View>
    </SafeAreaView>
  );
};

const PlayerCard: React.FC<{ avatar: string; username: string; wins: number; isMe?: boolean }> = ({ avatar, username, wins, isMe }) => (
  <View style={s.playerCard}>
    <View style={[s.playerAvatar, isMe && { borderColor: Colors.purple }]}>
      <Text style={{ fontSize: 28 }}>{avatar}</Text>
    </View>
    <Text style={s.playerName}>{username}</Text>
    <View style={s.playerWins}>
      {Array.from({ length: wins }, (_, i) => <Text key={i} style={{ fontSize: 14 }}>⭐</Text>)}
      {Array.from({ length: 3 - wins }, (_, i) => <Text key={i} style={{ fontSize: 14, opacity: 0.3 }}>☆</Text>)}
    </View>
    <Text style={[s.playerWinNum, { color: isMe ? Colors.purpleLight : Colors.white }]}>{wins}</Text>
  </View>
);

export default SpinWheel;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center' },
  banner: { position: 'absolute', top: 90, zIndex: 99, backgroundColor: Colors.purple, borderRadius: 20, paddingHorizontal: 24, paddingVertical: 12, alignItems: 'center' },
  bannerTxt: { color: Colors.white, fontSize: 16, fontWeight: '900' },
  bannerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '700', marginTop: 2 },
  roundRow: { flexDirection: 'row', gap: 10, marginTop: 16, marginBottom: 4 },
  roundDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.border },
  roundLabel: { color: Colors.muted, fontSize: 12, fontWeight: '800', marginBottom: 10 },
  playersRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20, marginBottom: 16 },
  playerCard: { alignItems: 'center', gap: 4, flex: 1 },
  playerAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.card, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  playerName: { color: Colors.white, fontSize: 12, fontWeight: '800' },
  playerWins: { flexDirection: 'row', gap: 2 },
  playerWinNum: { fontSize: 20, fontWeight: '900' },
  vsText: { color: Colors.muted, fontSize: 16, fontWeight: '900', flex: 0.5, textAlign: 'center' },
  wheelWrap: { width: WHEEL_SIZE + 20, height: WHEEL_SIZE + 20, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  pointer: { position: 'absolute', top: 0, zIndex: 10, alignItems: 'center' },
  pointerTriangle: { width: 0, height: 0, borderLeftWidth: 12, borderRightWidth: 12, borderBottomWidth: 24, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: Colors.gold },
  wheel: { width: WHEEL_SIZE, height: WHEEL_SIZE, borderRadius: WHEEL_SIZE / 2, overflow: 'hidden', borderWidth: 4, borderColor: Colors.gold, position: 'relative', backgroundColor: Colors.purple },
  segment: { position: 'absolute', width: RADIUS, height: 2, left: RADIUS, top: RADIUS - 1, transformOrigin: 'left center' },
  dividerLine: { position: 'absolute', width: RADIUS, height: 2, backgroundColor: 'rgba(255,255,255,0.3)', left: RADIUS, top: RADIUS - 1, transformOrigin: 'left center' },
  centerCircle: { position: 'absolute', width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.bg, top: RADIUS - 28, left: RADIUS - 28, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: Colors.gold, zIndex: 5 },
  segIcon: { position: 'absolute', width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  segIconEmoji: { fontSize: 18 },
  segIconLabel: { color: Colors.white, fontSize: 7, fontWeight: '800', textAlign: 'center' },
  glowOverlay: { position: 'absolute', width: WHEEL_SIZE + 20, height: WHEEL_SIZE + 20, borderRadius: (WHEEL_SIZE + 20) / 2, backgroundColor: Colors.gold, zIndex: -1 },
  spinBtn: { backgroundColor: Colors.purple, borderRadius: 30, paddingVertical: 16, paddingHorizontal: 40, marginTop: 18, minWidth: 220, alignItems: 'center' },
  spinBtnTxt: { color: Colors.white, fontSize: 16, fontWeight: '900' },
  livesRow: { flexDirection: 'row', gap: 4, marginTop: 16 },
});
