import { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
  Dimensions, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useUserStore } from '../../src/store/userStore';
import { useGameStore } from '../../src/store/gameStore';
import { socketService } from '../../src/services/socket.service';
import { QuizMode } from '../../src/components/game/modes/QuizMode';
import { Avatar } from '../../src/components/ui/Avatar';
import type { CategoryId } from '../../src/constants/categories';
import type { QuizQuestion } from '../../src/types/quiz';
import { getRank } from './lobby';
import { assetService } from '../../src/services/asset.service';
import { admobService } from '../../src/services/admob.service';

const { width } = Dimensions.get('window');

const BG    = '#ffffff';
const CARD  = '#f9fafb';
const PURP  = '#6c3aed';
const PURP2 = '#8b5cf6';
const TEXT  = '#111827';
const MUTED = '#9ca3af';
const GREEN = '#22c55e';
const RED   = '#ef4444';
const GOLD  = '#f59e0b';
const BORDER= '#e5e7eb';

// ── Çark segmentleri ─────────────────────────────────────────────────
const WHEEL_SEGS = [
  { id: 'history',   label: 'Tarih',    icon: '🏺', color: '#c0392b' },
  { id: 'science',   label: 'Bilim',    icon: '🔬', color: '#2980b9' },
  { id: 'sports',    label: 'Spor',     icon: '⚽', color: '#16a085' },
  { id: 'geography', label: 'Coğrafya', icon: '🌍', color: '#27ae60' },
  { id: 'cinema',    label: 'Sinema',   icon: '🎬', color: '#e91e8c' },
  { id: 'general',   label: 'Genel',    icon: '💡', color: '#8e44ad' },
  { id: 'turkey',    label: 'Türkiye',  icon: '🇹🇷', color: '#dc2626' },
  { id: 'economy',   label: 'Ekonomi',  icon: '📈', color: '#2ecc71' },
  { id: 'fun',       label: 'Eğlence',  icon: '🎉', color: '#f97316' },
  { id: '2x',        label: '2X PUAN',  icon: '⭐', color: '#f59e0b' },
  { id: 'joker',     label: 'JOKER',    icon: '🃏', color: '#7c3aed' },
];
const WHEEL_SIZE   = width - 80;
const WHEEL_RADIUS = WHEEL_SIZE / 2;

// ── Confetti ──────────────────────────────────────────────────────────
const CONFETTI_COLORS = ['#f59e0b', '#8b5cf6', '#22c55e', '#ef4444', '#06b6d4', '#f97316'];
const CONFETTI_COUNT  = 24;

function Confetti() {
  const anims = useRef(
    Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
      y:     new Animated.Value(-20),
      op:    new Animated.Value(1),
      rot:   new Animated.Value(0),
      x:     Math.random() * width,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      big:   i % 3 === 0,
      round: i % 2 === 0,
    }))
  ).current;

  useEffect(() => {
    anims.forEach(a => {
      Animated.parallel([
        Animated.timing(a.y,   { toValue: 900, duration: 2200 + Math.random() * 800, useNativeDriver: true }),
        Animated.timing(a.op,  { toValue: 0,   duration: 2600, useNativeDriver: true }),
        Animated.timing(a.rot, { toValue: 1,   duration: 1200, useNativeDriver: true }),
      ]).start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {anims.map((a, i) => (
        <Animated.View key={i} style={{
          position: 'absolute', left: a.x, top: -20,
          width: a.big ? 10 : 7, height: a.big ? 10 : 7,
          borderRadius: a.round ? 5 : 2,
          backgroundColor: a.color, opacity: a.op,
          transform: [
            { translateY: a.y },
            { rotate: a.rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
          ],
        }} />
      ))}
    </View>
  );
}

// ── Çark bileşeni ─────────────────────────────────────────────────────
function SpinWheel({ targetIndex, onSpinComplete }: { targetIndex: number; onSpinComplete: () => void }) {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Hedef segmente döndür: çark 3 tam tur + hedef açısı
    const segAngle  = 360 / WHEEL_SEGS.length;
    // Pointer yukarıda, segment 0 sağda başlıyor → offset hesapla
    const targetDeg = 360 - (targetIndex * segAngle) - segAngle / 2;
    const totalDeg  = 1080 + targetDeg; // 3 tam tur

    Animated.sequence([
      Animated.timing(spinAnim, {
        toValue: totalDeg,
        duration: 2600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.timing(glowAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      onSpinComplete();
    });
  }, []);

  const rotate = spinAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
    extrapolate: 'extend',
  });

  return (
    <View style={wh.container}>
      {/* Pointer (ok) */}
      <View style={wh.pointer} />

      {/* Dönen çark */}
      <Animated.View style={[wh.wheel, { transform: [{ rotate }] }]}>
        {/* Dış halka */}
        <View style={wh.outerRing} />

        {/* Segment ikonları */}
        {WHEEL_SEGS.map((seg, i) => {
          const angle  = (2 * Math.PI / WHEEL_SEGS.length) * i - Math.PI / 2;
          const r      = WHEEL_RADIUS * 0.62;
          const x      = WHEEL_RADIUS + Math.cos(angle) * r;
          const y      = WHEEL_RADIUS + Math.sin(angle) * r;
          return (
            <View key={seg.id} style={[wh.segItem, { left: x - 24, top: y - 24, backgroundColor: seg.color + '33', borderColor: seg.color + '66' }]}>
              <Text style={wh.segIcon}>{seg.icon}</Text>
            </View>
          );
        })}

        {/* Merkez */}
        <View style={wh.center}>
          <Text style={wh.centerTxt}>⭕</Text>
        </View>
      </Animated.View>

      {/* Seçilen segment etiketi (spin bittikten sonra) */}
      <Animated.View style={[wh.selectedLabel, { opacity: glowAnim }]}>
        <Text style={[wh.selectedIcon]}>{WHEEL_SEGS[targetIndex]?.icon}</Text>
        <Text style={[wh.selectedName, { color: WHEEL_SEGS[targetIndex]?.color ?? TEXT }]}>
          {WHEEL_SEGS[targetIndex]?.label}
        </Text>
      </Animated.View>
    </View>
  );
}

const wh = StyleSheet.create({
  container:     { alignItems: 'center', justifyContent: 'center', paddingBottom: 16 },
  wheel:         { width: WHEEL_SIZE, height: WHEEL_SIZE, borderRadius: WHEEL_RADIUS, backgroundColor: '#0d0820' },
  outerRing:     { position: 'absolute', width: WHEEL_SIZE, height: WHEEL_SIZE, borderRadius: WHEEL_RADIUS, borderWidth: 3, borderColor: '#6c3aed55' },
  pointer:       { width: 0, height: 0, borderLeftWidth: 12, borderRightWidth: 12, borderBottomWidth: 24, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#f59e0b', marginBottom: 8 },
  segItem:       { position: 'absolute', width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  segIcon:       { fontSize: 22 },
  center:        { position: 'absolute', left: WHEEL_RADIUS - 22, top: WHEEL_RADIUS - 22, width: 44, height: 44, borderRadius: 22, backgroundColor: '#1e1b3a', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: PURP2 },
  centerTxt:     { fontSize: 22 },
  selectedLabel: { alignItems: 'center', marginTop: 12, gap: 4 },
  selectedIcon:  { fontSize: 40 },
  selectedName:  { fontFamily: 'Nunito-ExtraBold', fontSize: 20 },
});

// ── Ana bileşen ───────────────────────────────────────────────────────
const EMOJIS = ['😂', '🔥', '😎', '😡', '🫡', '💀'];

type Phase = 'waiting' | 'wheel' | 'countdown' | 'playing' | 'round_result' | 'match_result';

interface RoundStartData {
  round: number;
  totalRounds: number;
  segmentId: string;
  segmentIndex: number;
  category: string;
  is2x: boolean;
  questions: QuizQuestion[];
}

interface RoundEndData {
  round: number;
  winnerId: string | 'draw';
  p1: { userId: string; correct: number };
  p2: { userId: string; correct: number };
  roundWins: [number, number];
}

interface MatchResultData {
  winnerId: string | 'draw';
  roundWins: [number, number];
  coinsWon: number;
  stake: number;
}

export default function DuelGameScreen() {
  const { duelId, stake: stakeParam } = useLocalSearchParams<{ duelId: string; stake?: string }>();
  const stake = parseInt(stakeParam ?? '50', 10);
  const { user }               = useUserStore();
  const { score, startGame, endGame } = useGameStore();

  const [phase,          setPhase]         = useState<Phase>('waiting');
  const [countdown,      setCountdown]     = useState(3);
  const [opponent,       setOpponent]      = useState<{ username: string; avatarId: number } | null>(null);
  const [currentRound,   setCurrentRound]  = useState<RoundStartData | null>(null);
  const [roundResult,    setRoundResult]   = useState<RoundEndData | null>(null);
  const [matchResult,    setMatchResult]   = useState<MatchResultData | null>(null);
  const [myRoundWins,    setMyRoundWins]   = useState(0);
  const [oppRoundWins,   setOppRoundWins]  = useState(0);
  const [spinDone,       setSpinDone]      = useState(false);
  const [oppFlash,       setOppFlash]      = useState<boolean | null>(null);
  const [oppAnswerLetter,setOppAnswerLetter] = useState<string | null>(null);
  const [qTimeLeft,      setQTimeLeft]     = useState(15);
  const [showEmojis,     setShowEmojis]    = useState(false);
  const [sentEmoji,      setSentEmoji]     = useState<string | null>(null);
  const [recvEmoji,      setRecvEmoji]     = useState<string | null>(null);
  const [showConfetti,   setShowConfetti]  = useState(false);
  const [notification,   setNotif]         = useState<string | null>(null);

  const notifAnim    = useRef(new Animated.Value(0)).current;
  const oppScaleAnim = useRef(new Animated.Value(1)).current;
  const countAnim    = useRef(new Animated.Value(1)).current;
  const started      = useRef(false);

  const showNotification = useCallback((txt: string) => {
    setNotif(txt);
    notifAnim.setValue(0);
    Animated.sequence([
      Animated.timing(notifAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(notifAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setNotif(null));
  }, []);

  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    socket.on('duel_opponent_joined', (info: { username: string; avatarId: number }) => {
      setOpponent(info);
    });

    socket.on('duel_round_start', (data: RoundStartData) => {
      setCurrentRound(data);
      setSpinDone(false);
      setQTimeLeft(15);
      setPhase('wheel');
      startGame(data.category as any);
    });

    socket.on('duel_opponent_answer', ({ correct, answerIdx }: { correct: boolean; answered: number; answerIdx?: number | null }) => {
      setOppFlash(correct);
      if (answerIdx != null) {
        const letter = ['A', 'B', 'C', 'D'][answerIdx] ?? null;
        setOppAnswerLetter(letter);
        setTimeout(() => setOppAnswerLetter(null), 3000);
      }
      Animated.sequence([
        Animated.spring(oppScaleAnim, { toValue: 1.3, useNativeDriver: true, speed: 50 }),
        Animated.spring(oppScaleAnim, { toValue: 1,   useNativeDriver: true, speed: 20 }),
      ]).start(() => setOppFlash(null));
    });

    socket.on('duel_round_end', (data: RoundEndData) => {
      endGame();
      setRoundResult(data);
      // Tur kazananını belirle
      const myP = data.p1.userId === user?.id ? data.p1 : data.p2;
      const oppP = data.p1.userId !== user?.id ? data.p1 : data.p2;
      setMyRoundWins(data.p1.userId === user?.id ? data.roundWins[0] : data.roundWins[1]);
      setOppRoundWins(data.p1.userId !== user?.id ? data.roundWins[0] : data.roundWins[1]);
      const iWon = data.winnerId === user?.id;
      if (iWon) { assetService.playSound('hit'); showNotification(`Tur ${data.round} → SEN KAZANDIN! 🎉`); }
      else if (data.winnerId === 'draw') showNotification(`Tur ${data.round} → BERABERLİK`);
      else showNotification(`Tur ${data.round} → Rakip kazandı`);
      setPhase('round_result');
    });

    socket.on('duel_match_result', (data: MatchResultData) => {
      setMatchResult(data);
      const isWin = data.winnerId === user?.id;
      if (isWin) { setShowConfetti(true); assetService.playSound('hit'); }
      setPhase('match_result');
      admobService.maybeShowInterstitial('duel').catch(() => {});
    });

    socket.on('duel_opponent_left', () => {
      setMatchResult({ winnerId: user?.id ?? '', roundWins: [myRoundWins, oppRoundWins], coinsWon: stake * 2 - Math.floor(stake * 0.1), stake });
      setShowConfetti(true);
      setPhase('match_result');
    });

    socket.on('duel_emoji', ({ emoji }: { emoji: string }) => {
      setRecvEmoji(emoji);
      setTimeout(() => setRecvEmoji(null), 2500);
    });

    socket.on('duel_cancelled', ({ reason }: { reason: string }) => {
      alert(reason);
      router.replace('/(tabs)');
    });

    if (!started.current) {
      started.current = true;
      socket.emit('duel_join', { duelId, userId: user?.id, stake });
    }

    return () => {
      ['duel_opponent_joined','duel_round_start','duel_opponent_answer','duel_round_end','duel_match_result','duel_opponent_left','duel_emoji','duel_cancelled'].forEach(e => socket.off(e));
    };
  }, []);

  const handleAnswer = (correct: boolean, pts: number, qIndex: number, answerIdx?: number) => {
    const socket = socketService.getSocket();
    socket?.emit('duel_round_answer', { duelId, userId: user?.id, correct, answerIdx: answerIdx ?? null });
  };

  const handleRoundEnd = () => {
    const socket = socketService.getSocket();
    socket?.emit('duel_round_answer', { duelId, userId: user?.id, correct: false });
    endGame();
  };

  const sendEmoji = (emoji: string) => {
    setSentEmoji(emoji);
    setShowEmojis(false);
    socketService.getSocket()?.emit('duel_emoji_send', { duelId, emoji });
    setTimeout(() => setSentEmoji(null), 2500);
  };

  // ── Geri sayım faz ──────────────────────────────────────────────
  const startCountdown = () => {
    setPhase('countdown');
    let c = 3;
    const iv = setInterval(() => {
      c--;
      setCountdown(c);
      countAnim.setValue(1.5);
      Animated.spring(countAnim, { toValue: 1, useNativeDriver: true, speed: 30 }).start();
      if (c === 0) { clearInterval(iv); setPhase('playing'); }
    }, 1000);
  };

  // ── FAZ: Bekleme ─────────────────────────────────────────────────
  if (phase === 'waiting') return (
    <View style={{ flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <Text style={{ fontSize: 48 }}>⚔️</Text>
      <Text style={[ph.title, { color: PURP2 }]}>Rakip bekleniyor...</Text>
      {opponent && <Text style={[ph.sub, { color: GREEN }]}>{opponent.username} bağlandı!</Text>}
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={[ph.sub, { color: MUTED }]}>Vazgeç</Text>
      </TouchableOpacity>
    </View>
  );

  // ── FAZ: Çark ────────────────────────────────────────────────────
  if (phase === 'wheel' && currentRound) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <View style={ph.roundHeader}>
        <Text style={ph.roundNum}>TUR {currentRound.round} / {currentRound.totalRounds}</Text>
        <View style={ph.roundWins}>
          <Text style={ph.roundWinNum}>{myRoundWins} — {oppRoundWins}</Text>
        </View>
      </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}>
        <Text style={ph.wheelTitle}>Kategori belirleniyor...</Text>
        <SpinWheel
          targetIndex={currentRound.segmentIndex}
          onSpinComplete={() => {
            setSpinDone(true);
            setTimeout(startCountdown, 1200);
          }}
        />
        {currentRound.is2x && spinDone && (
          <View style={ph.x2badge}>
            <Text style={ph.x2txt}>⭐ 2X PUAN TURU!</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );

  // ── FAZ: Geri sayım ──────────────────────────────────────────────
  if (phase === 'countdown') return (
    <View style={{ flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={[ph.sub, { color: MUTED, marginBottom: 12 }]}>{currentRound?.category} soruları geliyor</Text>
      <Animated.Text style={[ph.countNum, { transform: [{ scale: countAnim }] }]}>{countdown}</Animated.Text>
      <Text style={ph.sub}>Hazır ol!</Text>
    </View>
  );

  // ── FAZ: Tur Sonucu ───────────────────────────────────────────────
  if (phase === 'round_result' && roundResult) {
    const myId = user?.id;
    const myP  = roundResult.p1.userId === myId ? roundResult.p1 : roundResult.p2;
    const oppP = roundResult.p1.userId !== myId ? roundResult.p1 : roundResult.p2;
    const iWon = roundResult.winnerId === myId;
    const isDraw = roundResult.winnerId === 'draw';
    return (
      <View style={{ flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
        <Text style={{ fontSize: 52 }}>{iWon ? '🎉' : isDraw ? '🤝' : '😮'}</Text>
        <Text style={[ph.title, { color: iWon ? GREEN : isDraw ? PURP2 : RED }]}>
          {iWon ? 'TUR KAZANDIN!' : isDraw ? 'BERABERLİK' : 'TUR KAYBETTİN'}
        </Text>
        <View style={ph.roundScoreCard}>
          <Text style={ph.roundScoreTxt}>Sen: {myP.correct} doğru</Text>
          <Text style={ph.roundScoreDivider}>·</Text>
          <Text style={ph.roundScoreTxt}>Rakip: {oppP.correct} doğru</Text>
        </View>
        <View style={ph.roundWinsRow}>
          <Text style={[ph.bigWinNum, { color: iWon || myRoundWins > oppRoundWins ? GREEN : MUTED }]}>{myRoundWins}</Text>
          <Text style={ph.winDash}>—</Text>
          <Text style={[ph.bigWinNum, { color: !iWon && !isDraw ? GREEN : MUTED }]}>{oppRoundWins}</Text>
        </View>
        <Text style={[ph.sub, { color: MUTED }]}>Sonraki tur geliyor...</Text>
      </View>
    );
  }

  // ── FAZ: Maç Sonucu ───────────────────────────────────────────────
  if (phase === 'match_result' && matchResult) {
    const isWin  = matchResult.winnerId === user?.id;
    const isDraw = matchResult.winnerId === 'draw';
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
        {showConfetti && <Confetti />}
        <ScrollView contentContainerStyle={rs.content}>
          <Text style={rs.emoji}>{isWin ? '🏆' : isDraw ? '🤝' : '😮'}</Text>
          <Text style={[rs.title, { color: isWin ? GOLD : isDraw ? PURP2 : MUTED }]}>
            {isWin ? 'ZAFER!' : isDraw ? 'BERABERLİK' : 'Yakındı!'}
          </Text>

          {/* Tur skoru */}
          <View style={rs.turCard}>
            <Text style={rs.turTitle}>Tur Skoru</Text>
            <View style={rs.turRow}>
              <Text style={[rs.turNum, { color: isWin ? GREEN : RED }]}>{matchResult.roundWins[0]}</Text>
              <Text style={rs.turDash}>—</Text>
              <Text style={[rs.turNum, { color: isWin ? RED : GREEN }]}>{matchResult.roundWins[1]}</Text>
            </View>
          </View>

          {/* Coin sonucu */}
          <View style={[rs.coinCard, { borderColor: isWin ? GOLD + '66' : RED + '44' }]}>
            {isWin ? (
              <>
                <Text style={rs.coinIcon}>🪙</Text>
                <View>
                  <Text style={[rs.coinTxt, { color: GOLD }]}>+{matchResult.coinsWon.toLocaleString('tr-TR')} Coin Kazandın!</Text>
                  <Text style={rs.coinSub}>Bahis: {matchResult.stake} 🪙</Text>
                </View>
              </>
            ) : isDraw ? (
              <>
                <Text style={rs.coinIcon}>🤝</Text>
                <Text style={[rs.coinTxt, { color: PURP2 }]}>Coinin iade edildi</Text>
              </>
            ) : (
              <>
                <Text style={rs.coinIcon}>💸</Text>
                <View>
                  <Text style={[rs.coinTxt, { color: RED }]}>-{matchResult.stake} Coin Kaybettin</Text>
                  <Text style={rs.coinSub}>Bahis: {matchResult.stake} 🪙</Text>
                </View>
              </>
            )}
          </View>

          <TouchableOpacity style={rs.rematchBtn} onPress={() => router.replace('/duel/lobby' as any)}>
            <Text style={rs.rematchTxt}>⚔️ Tekrar Oyna</Text>
          </TouchableOpacity>
          <TouchableOpacity style={rs.homeBtn} onPress={() => router.replace('/(tabs)')}>
            <Text style={rs.homeTxt}>Ana Sayfaya Dön</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── FAZ: Oynuyor ─────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      {/* Skor başlığı */}
      <View style={g.scoreHeader}>
        <View style={g.playerCol}>
          <Avatar avatarId={user?.avatarId ?? 0} size={34} />
          <Text style={g.playerName} numberOfLines={1}>{user?.username ?? 'Sen'}</Text>
          <Text style={[g.turWins, { color: PURP2 }]}>{myRoundWins} tur</Text>
        </View>

        <View style={g.vsBox}>
          <Text style={g.roundLabel}>TUR {currentRound?.round ?? '?'}/3</Text>
          <View style={[g.timerCircle, {
            borderColor: qTimeLeft <= 5 ? RED : qTimeLeft <= 10 ? GOLD : PURP2,
            backgroundColor: qTimeLeft <= 5 ? RED + '18' : qTimeLeft <= 10 ? GOLD + '18' : PURP2 + '12',
          }]}>
            <Text style={[g.timerNum, { color: qTimeLeft <= 5 ? RED : qTimeLeft <= 10 ? GOLD : PURP2 }]}>
              {qTimeLeft}
            </Text>
          </View>
          {sentEmoji && <Text style={g.myEmoji}>{sentEmoji}</Text>}
          {recvEmoji && <Text style={g.oppEmoji}>{recvEmoji}</Text>}
        </View>

        <View style={[g.playerCol, { alignItems: 'flex-end' }]}>
          <Animated.View style={{ transform: [{ scale: oppScaleAnim }] }}>
            <Avatar avatarId={opponent?.avatarId ?? 1} size={34} />
            {oppFlash !== null && (
              <View style={[g.flashDot, { backgroundColor: oppFlash ? GREEN : RED }]} />
            )}
          </Animated.View>
          <Text style={g.playerName} numberOfLines={1}>{opponent?.username ?? '...'}</Text>
          <Text style={[g.turWins, { color: MUTED }]}>{oppRoundWins} tur</Text>
          {oppAnswerLetter && (
            <View style={[g.oppAnswerBadge, { backgroundColor: oppFlash === false ? RED + '22' : oppFlash ? GREEN + '22' : '#f3f4f6' }]}>
              <Text style={[g.oppAnswerTxt, { color: oppFlash === false ? RED : oppFlash ? GREEN : MUTED }]}>
                {oppFlash === false ? '✗' : oppFlash ? '✓' : ''} {oppAnswerLetter}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Kategori badge */}
      {currentRound && (
        <View style={g.catBadge}>
          <Text style={g.catIcon}>{WHEEL_SEGS.find(s => s.id === currentRound.segmentId)?.icon ?? '❓'}</Text>
          <Text style={g.catName}>{WHEEL_SEGS.find(s => s.id === currentRound.segmentId)?.label ?? currentRound.category}</Text>
          {currentRound.is2x && <View style={g.x2mini}><Text style={g.x2miniTxt}>2X</Text></View>}
        </View>
      )}

      {/* Bildirim */}
      {notification && (
        <Animated.View style={[g.notifBar, { opacity: notifAnim }]}>
          <Text style={g.notifTxt}>{notification}</Text>
        </Animated.View>
      )}

      {/* Quiz */}
      {currentRound && (
        <QuizMode
          categoryId={currentRound.category as CategoryId}
          externalPool={currentRound.questions}
          lives={3}
          onEnd={handleRoundEnd}
          onAnswer={handleAnswer}
          onTimerTick={setQTimeLeft}
        />
      )}

      {/* Emoji butonu */}
      <TouchableOpacity style={g.emojiToggle} onPress={() => setShowEmojis(v => !v)}>
        <Text style={{ fontSize: 22 }}>😊</Text>
      </TouchableOpacity>
      {showEmojis && (
        <View style={g.emojiBar}>
          {EMOJIS.map(e => (
            <TouchableOpacity key={e} onPress={() => sendEmoji(e)} style={g.emojiBtn}>
              <Text style={{ fontSize: 26 }}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

const ph = StyleSheet.create({
  title:    { fontFamily: 'Nunito-ExtraBold', fontSize: 26, color: TEXT },
  sub:      { fontFamily: 'Nunito-Regular', fontSize: 16, color: MUTED },
  countNum: { fontFamily: 'Nunito-ExtraBold', fontSize: 110, color: TEXT, textShadowColor: PURP2, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 30 },
  wheelTitle:   { fontFamily: 'Nunito-ExtraBold', fontSize: 18, color: MUTED, marginBottom: 16 },
  roundHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 10 },
  roundNum:     { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: MUTED },
  roundWins:    { backgroundColor: PURP + '30', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6 },
  roundWinNum:  { fontFamily: 'Nunito-ExtraBold', fontSize: 18, color: PURP2 },
  x2badge:      { backgroundColor: '#f59e0b22', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: '#f59e0b55' },
  x2txt:        { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: GOLD },
  roundScoreCard:  { flexDirection: 'row', gap: 10, backgroundColor: CARD, borderRadius: 16, paddingHorizontal: 20, paddingVertical: 14, borderWidth: 1, borderColor: BORDER },
  roundScoreTxt:   { fontFamily: 'Nunito-Bold', fontSize: 15, color: TEXT },
  roundScoreDivider: { fontFamily: 'Nunito-Regular', color: MUTED, fontSize: 15 },
  roundWinsRow:  { flexDirection: 'row', alignItems: 'center', gap: 16 },
  bigWinNum:     { fontFamily: 'Nunito-ExtraBold', fontSize: 48 },
  winDash:       { fontFamily: 'Nunito-Regular', fontSize: 28, color: MUTED },
});

const g = StyleSheet.create({
  scoreHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: BORDER },
  playerCol:   { flex: 1, alignItems: 'flex-start', gap: 2 },
  playerName:  { fontFamily: 'Nunito-Bold', fontSize: 12, color: TEXT, maxWidth: 100 },
  turWins:     { fontFamily: 'Nunito-ExtraBold', fontSize: 16 },
  vsBox:       { width: 72, alignItems: 'center', gap: 3 },
  roundLabel:  { fontFamily: 'Nunito-Bold', fontSize: 10, color: MUTED },
  timerCircle: { width: 46, height: 46, borderRadius: 23, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  timerNum:    { fontFamily: 'Nunito-ExtraBold', fontSize: 20 },
  myEmoji:     { position: 'absolute', top: -20, left: -10, fontSize: 28 },
  oppEmoji:    { position: 'absolute', top: -20, right: -10, fontSize: 28 },
  flashDot:    { position: 'absolute', top: 0, right: 0, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: BG },
  catBadge:    { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f5f3ff' },
  catIcon:     { fontSize: 16 },
  catName:     { fontFamily: 'Nunito-Bold', fontSize: 13, color: '#4c1d95' },
  x2mini:      { backgroundColor: GOLD + '33', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: GOLD + '66' },
  x2miniTxt:   { fontFamily: 'Nunito-ExtraBold', fontSize: 10, color: GOLD },
  notifBar:    { backgroundColor: '#ede9fe', paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center' },
  notifTxt:    { fontFamily: 'Nunito-Bold', fontSize: 13, color: '#7c3aed' },
  oppAnswerBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 2 },
  oppAnswerTxt:   { fontFamily: 'Nunito-ExtraBold', fontSize: 12 },
  emojiToggle: { position: 'absolute', bottom: 100, right: 16, backgroundColor: '#6c3aed', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', shadowColor: '#6c3aed', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 5 },
  emojiBar:    { position: 'absolute', bottom: 154, right: 16, backgroundColor: '#fff', borderRadius: 20, padding: 10, flexDirection: 'row', gap: 8, borderWidth: 1, borderColor: '#e5e7eb', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 8 },
  emojiBtn:    { padding: 4 },
});

const rs = StyleSheet.create({
  content:    { alignItems: 'center', padding: 24, gap: 16 },
  emoji:      { fontSize: 72 },
  title:      { fontFamily: 'Nunito-ExtraBold', fontSize: 34 },
  turCard:    { backgroundColor: CARD, borderRadius: 20, padding: 20, width: '100%', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: BORDER },
  turTitle:   { fontFamily: 'Nunito-Regular', fontSize: 13, color: MUTED },
  turRow:     { flexDirection: 'row', alignItems: 'center', gap: 20 },
  turNum:     { fontFamily: 'Nunito-ExtraBold', fontSize: 48 },
  turDash:    { fontFamily: 'Nunito-Regular', fontSize: 28, color: MUTED },
  coinCard:   { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: CARD, borderRadius: 18, padding: 18, width: '100%', borderWidth: 1.5 },
  coinIcon:   { fontSize: 32 },
  coinTxt:    { fontFamily: 'Nunito-ExtraBold', fontSize: 18 },
  coinSub:    { fontFamily: 'Nunito-Regular', fontSize: 12, color: MUTED, marginTop: 2 },
  rematchBtn: { backgroundColor: PURP, borderRadius: 16, paddingVertical: 18, width: '100%', alignItems: 'center', shadowColor: PURP2, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 },
  rematchTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 17, color: TEXT },
  homeBtn:    { backgroundColor: CARD, borderRadius: 16, paddingVertical: 16, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  homeTxt:    { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: TEXT },
});
