import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, Animated, Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors, AVATARS } from '../../src/constants/theme';

const { width: W, height: H } = Dimensions.get('window');

const ConfettiPiece: React.FC<{ x: number; delay: number; rightSide?: boolean }> = ({ x, delay, rightSide }) => {
  const ty  = useRef(new Animated.Value(-20)).current;
  const tx  = useRef(new Animated.Value(0)).current;
  const rot = useRef(new Animated.Value(0)).current;
  const op  = useRef(new Animated.Value(1)).current;
  const colors = [Colors.gold, Colors.green, Colors.purple, Colors.red, Colors.blue, '#f97316', '#ec4899'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size  = 6 + Math.random() * 7;
  const drift = (rightSide ? 1 : -1) * (10 + Math.random() * 30);
  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(ty,  { toValue: H * 0.75, duration: 1800 + Math.random() * 600, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.timing(tx,  { toValue: drift,    duration: 1800, useNativeDriver: true }),
        Animated.timing(rot, { toValue: 6,        duration: 1800, useNativeDriver: true }),
        Animated.sequence([Animated.delay(1200), Animated.timing(op, { toValue: 0, duration: 600, useNativeDriver: true })]),
      ]),
    ]).start();
  }, []);
  const rotate = rot.interpolate({ inputRange: [0, 6], outputRange: ['0deg', '1080deg'] });
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: x, top: 0, width: size, height: size, backgroundColor: color, borderRadius: size / 4, transform: [{ translateY: ty }, { translateX: tx }, { rotate }], opacity: op, zIndex: 99 }} />
  );
};

export interface RoundResultProps {
  round: number; myCorrect: number; oppCorrect: number;
  myUsername: string; oppUsername: string;
  myAvatar: number; oppAvatar: number;
  winnerId: string; myId: string; onNext: () => void;
}

export const RoundResult: React.FC<RoundResultProps> = ({
  round, myCorrect, oppCorrect,
  myUsername, oppUsername, myAvatar, oppAvatar,
  winnerId, myId, onNext,
}) => {
  const iWon      = winnerId === myId;
  const titleY    = useRef(new Animated.Value(-70)).current;
  const titleOp   = useRef(new Animated.Value(0)).current;
  const cardsScale= useRef(new Animated.Value(0.85)).current;
  const cardsOp   = useRef(new Animated.Value(0)).current;
  const btnY      = useRef(new Animated.Value(40)).current;
  const btnOp     = useRef(new Animated.Value(0)).current;

  const confettiPieces = Array.from({ length: 20 }, (_, i) => ({
    x: iWon ? Math.random() * (W / 2) : W / 2 + Math.random() * (W / 2),
    delay: i * 80, rightSide: !iWon,
  }));

  useEffect(() => {
    Haptics.notificationAsync(iWon ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning);
    Animated.sequence([
      Animated.parallel([
        Animated.spring(titleY,    { toValue: 0, tension: 70, friction: 8, useNativeDriver: true }),
        Animated.timing(titleOp,   { toValue: 1, duration: 250, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(cardsScale,{ toValue: 1, tension: 70, friction: 8, useNativeDriver: true }),
        Animated.timing(cardsOp,   { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(btnOp,     { toValue: 1, duration: 250, delay: 200, useNativeDriver: true }),
        Animated.timing(btnY,      { toValue: 0, duration: 250, delay: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {confettiPieces.map((p, i) => <ConfettiPiece key={i} x={p.x} delay={p.delay} rightSide={p.rightSide} />)}
      <Text style={s.roundTitle}>Tur {round} Sonucu</Text>
      <Animated.View style={[s.winnerBanner, { transform: [{ translateY: titleY }], opacity: titleOp }]}>
        <Text style={s.winnerTxt}>Kazanan {iWon ? myUsername : oppUsername}! 🎉</Text>
      </Animated.View>
      <Animated.View style={[s.duelCards, { transform: [{ scale: cardsScale }], opacity: cardsOp }]}>
        <DuelCard avatar={AVATARS[myAvatar  % AVATARS.length]} username={myUsername}  correct={myCorrect}  wrong={10 - myCorrect}  isWinner={iWon} />
        <View style={s.scoreCenter}>
          <Text style={s.scoreBig}>{myCorrect}</Text>
          <Text style={s.scoreDash}>-</Text>
          <Text style={s.scoreBig}>{oppCorrect}</Text>
        </View>
        <DuelCard avatar={AVATARS[oppAvatar % AVATARS.length]} username={oppUsername} correct={oppCorrect} wrong={10 - oppCorrect} isWinner={!iWon} />
      </Animated.View>
      <Animated.View style={[s.nextBtnWrap, { opacity: btnOp, transform: [{ translateY: btnY }] }]}>
        <TouchableOpacity style={s.nextBtn} onPress={onNext} activeOpacity={0.85}>
          <Text style={s.nextBtnTxt}>Sonraki Tur →</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const DuelCard: React.FC<{ avatar: string; username: string; correct: number; wrong: number; isWinner: boolean }> = ({ avatar, username, correct, wrong, isWinner }) => (
  <View style={[s.duelCard, isWinner && { borderColor: Colors.green, borderWidth: 2.5 }]}>
    <View style={[s.duelAvatar, isWinner && { borderColor: Colors.green }]}>
      <Text style={{ fontSize: 28 }}>{avatar}</Text>
      {isWinner && <View style={s.winnerCrown}><Text style={{ fontSize: 12 }}>👑</Text></View>}
    </View>
    <Text style={s.duelUsername}>{username}</Text>
    <View style={s.duelStats}>
      <Text style={s.duelStatGreen}>✅ {correct}</Text>
      <Text style={s.duelStatRed}>❌ {wrong}</Text>
    </View>
  </View>
);

export interface MatchEndProps {
  myTurWins: number; oppTurWins: number; coinsWon: number;
  myAvatar: number; oppAvatar: number; isWinner: boolean;
  myUsername?: string; oppUsername?: string; onHome: () => void;
}

export const MatchEnd: React.FC<MatchEndProps> = ({
  myTurWins, oppTurWins, coinsWon,
  myAvatar, oppAvatar, isWinner,
  myUsername = 'Sen', oppUsername = 'Rakip', onHome,
}) => {
  const cupScale = useRef(new Animated.Value(0)).current;
  const titleOp  = useRef(new Animated.Value(0)).current;
  const scoreOp  = useRef(new Animated.Value(0)).current;
  const scoreY   = useRef(new Animated.Value(30)).current;
  const btnScale = useRef(new Animated.Value(0.9)).current;
  const btnOp    = useRef(new Animated.Value(0)).current;
  const [coinDisplay, setCoinDisplay] = useState(0);

  useEffect(() => {
    Haptics.notificationAsync(isWinner ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
    Animated.sequence([
      Animated.spring(cupScale, { toValue: 1.3, tension: 60, friction: 5, useNativeDriver: true }),
      Animated.spring(cupScale, { toValue: 1,   tension: 80, friction: 7, useNativeDriver: true }),
    ]).start();
    Animated.parallel([
      Animated.timing(titleOp, { toValue: 1, duration: 400, delay: 300, useNativeDriver: true }),
      Animated.timing(scoreOp, { toValue: 1, duration: 400, delay: 500, useNativeDriver: true }),
      Animated.timing(scoreY,  { toValue: 0, duration: 400, delay: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(btnOp,   { toValue: 1, duration: 300, delay: 700, useNativeDriver: true }),
      Animated.spring(btnScale,{ toValue: 1, tension: 70, friction: 8, delay: 700, useNativeDriver: true }),
    ]).start();
    if (isWinner) {
      const start = Date.now();
      const tick = () => {
        const t = Math.min((Date.now() - start) / 1200, 1);
        setCoinDisplay(Math.floor((1 - Math.pow(1 - t, 3)) * coinsWon));
        if (t < 1) requestAnimationFrame(tick);
      };
      setTimeout(() => requestAnimationFrame(tick), 600);
    }
  }, []);

  const allConfetti = Array.from({ length: 40 }, (_, i) => ({ x: Math.random() * W, delay: i * 50 }));

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {isWinner && allConfetti.map((p, i) => <ConfettiPiece key={i} x={p.x} delay={p.delay} />)}
      <Animated.Text style={[s.cup, { transform: [{ scale: cupScale }] }]}>{isWinner ? '🏆' : '💔'}</Animated.Text>
      <Animated.Text style={[s.matchTitle, { opacity: titleOp }]}>{isWinner ? 'Maç Bitti! 🎉' : 'Maç Bitti'}</Animated.Text>
      <Animated.View style={[s.matchScore, { opacity: scoreOp, transform: [{ translateY: scoreY }] }]}>
        <View style={s.matchPlayer}>
          <View style={[s.matchAvatar, isWinner && { borderColor: Colors.gold, borderWidth: 3 }]}>
            <Text style={{ fontSize: 32 }}>{AVATARS[myAvatar % AVATARS.length]}</Text>
          </View>
          <Text style={s.matchName}>{myUsername}</Text>
        </View>
        <Text style={s.matchScoreNum}>{myTurWins} - {oppTurWins}</Text>
        <View style={s.matchPlayer}>
          <View style={s.matchAvatar}><Text style={{ fontSize: 32 }}>{AVATARS[oppAvatar % AVATARS.length]}</Text></View>
          <Text style={s.matchName}>{oppUsername}</Text>
        </View>
      </Animated.View>
      {isWinner && (
        <Animated.View style={[s.coinWon, { opacity: scoreOp }]}>
          <Text style={s.coinWonTxt}>+{coinDisplay} 🪙</Text>
        </Animated.View>
      )}
      {!isWinner && (
        <Animated.View style={[s.coinLost, { opacity: scoreOp }]}>
          <Text style={s.coinLostTxt}>-{coinsWon} 🪙</Text>
        </Animated.View>
      )}
      <Animated.View style={[s.homeWrap, { opacity: btnOp, transform: [{ scale: btnScale }] }]}>
        <TouchableOpacity style={s.homeBtn} onPress={onHome} activeOpacity={0.85}>
          <Text style={s.homeBtnTxt}>🏠 Ana Sayfa</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

export default RoundResult;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  roundTitle: { color: Colors.muted, fontSize: 16, fontWeight: '800', marginBottom: 16, position: 'absolute', top: 60 },
  winnerBanner: { backgroundColor: Colors.purple, borderRadius: 22, paddingHorizontal: 24, paddingVertical: 12, marginBottom: 24 },
  winnerTxt: { color: Colors.white, fontSize: 17, fontWeight: '900' },
  duelCards: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20, width: '100%' },
  duelCard: { flex: 1, backgroundColor: Colors.card, borderRadius: 20, padding: 16, alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: Colors.border },
  duelAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#1e1e3a', borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  winnerCrown: { position: 'absolute', top: -10, right: -8 },
  duelUsername: { color: Colors.white, fontSize: 13, fontWeight: '800', textAlign: 'center' },
  duelStats: { flexDirection: 'row', gap: 8 },
  duelStatGreen: { color: Colors.green, fontSize: 13, fontWeight: '800' },
  duelStatRed:   { color: Colors.red,   fontSize: 13, fontWeight: '800' },
  scoreCenter: { alignItems: 'center', gap: 2 },
  scoreBig:  { color: Colors.white, fontSize: 32, fontWeight: '900' },
  scoreDash: { color: Colors.muted, fontSize: 20, fontWeight: '700' },
  nextBtnWrap: { width: '100%' },
  nextBtn:  { backgroundColor: Colors.purple, borderRadius: 28, paddingVertical: 18, alignItems: 'center', width: '100%' },
  nextBtnTxt: { color: Colors.white, fontSize: 17, fontWeight: '900' },
  cup: { fontSize: 90, marginBottom: 8 },
  matchTitle: { color: Colors.white, fontSize: 28, fontWeight: '900', marginBottom: 24 },
  matchScore: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  matchPlayer: { alignItems: 'center', gap: 8 },
  matchAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.card, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  matchName: { color: Colors.muted, fontSize: 12, fontWeight: '700' },
  matchScoreNum: { color: Colors.white, fontSize: 44, fontWeight: '900' },
  coinWon:  { backgroundColor: 'rgba(245,158,11,0.2)', borderRadius: 20, paddingHorizontal: 24, paddingVertical: 10, borderWidth: 1.5, borderColor: Colors.gold, marginBottom: 32 },
  coinWonTxt: { color: Colors.gold, fontSize: 24, fontWeight: '900' },
  coinLost: { backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 20, paddingHorizontal: 24, paddingVertical: 10, borderWidth: 1.5, borderColor: Colors.red, marginBottom: 32 },
  coinLostTxt: { color: Colors.red, fontSize: 24, fontWeight: '900' },
  homeWrap: { width: '100%' },
  homeBtn:  { backgroundColor: Colors.purple, borderRadius: 28, paddingVertical: 18, alignItems: 'center' },
  homeBtnTxt: { color: Colors.white, fontSize: 17, fontWeight: '900' },
});
