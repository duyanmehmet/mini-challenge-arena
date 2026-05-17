import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
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

const BG    = '#0d0d1a';
const CARD  = '#13132a';
const PURP  = '#6c3aed';
const PURP2 = '#8b5cf6';
const TEXT  = '#ffffff';
const MUTED = '#7c7aaa';
const GREEN = '#22c55e';
const RED   = '#ef4444';
const GOLD  = '#f59e0b';

const EMOJIS = ['😂', '🔥', '😎', '😡', '🫡', '💀'];

interface OpponentState {
  username: string;
  avatarId: number;
  score: number;
  qIndex: number;
  answered: number;
  lastCorrect: boolean | null;
  duelRank?: number;
}

type Phase = 'waiting' | 'countdown' | 'playing' | 'result';

// ── Confetti parçacıkları ─────────────────────────────────────────
function Confetti() {
  const items = Array.from({ length: 20 }, (_, i) => {
    const x = useRef(new Animated.Value(Math.random() * 360 - 30)).current;
    const y = useRef(new Animated.Value(-20)).current;
    const op = useRef(new Animated.Value(1)).current;
    const colors = ['#f59e0b', '#8b5cf6', '#22c55e', '#ef4444', '#06b6d4'];
    const color = colors[i % colors.length];
    useEffect(() => {
      Animated.parallel([
        Animated.timing(y,  { toValue: 800, duration: 2000 + Math.random() * 1000, useNativeDriver: true }),
        Animated.timing(op, { toValue: 0,   duration: 2500, useNativeDriver: true }),
      ]).start();
    }, []);
    return (
      <Animated.View key={i} style={{
        position: 'absolute', left: Math.random() * 360, top: -20,
        width: 8, height: 8, borderRadius: 2,
        backgroundColor: color, opacity: op,
        transform: [{ translateY: y }],
      }} />
    );
  });
  return <View style={StyleSheet.absoluteFillObject} pointerEvents="none">{items}</View>;
}

export default function DuelGameScreen() {
  const { duelId, cat } = useLocalSearchParams<{ duelId: string; cat: string }>();
  const { user } = useUserStore();
  const { score, startGame, endGame } = useGameStore();

  const [phase,       setPhase]       = useState<Phase>('waiting');
  const [countdown,   setCountdown]   = useState(3);
  const [opponent,    setOpponent]    = useState<OpponentState | null>(null);
  const [sharedPool,  setSharedPool]  = useState<QuizQuestion[] | null>(null);
  const [myScore,     setMyScore]     = useState(0);
  const [result,      setResult]      = useState<'win' | 'lose' | 'draw' | null>(null);
  const [finalScores, setFinalScores] = useState<{ me: number; opp: number } | null>(null);
  const [rankDelta,   setRankDelta]   = useState<number | null>(null);
  const [oppFlash,    setOppFlash]    = useState<{ correct: boolean } | null>(null);
  const [notification,setNotif]      = useState<string | null>(null);
  const [showEmojis,  setShowEmojis] = useState(false);
  const [sentEmoji,   setSentEmoji]  = useState<string | null>(null);
  const [recvEmoji,   setRecvEmoji]  = useState<string | null>(null);
  const [showConfetti,setShowConfetti] = useState(false);

  const oppScaleAnim = useRef(new Animated.Value(1)).current;
  const notifAnim    = useRef(new Animated.Value(0)).current;
  const countAnim    = useRef(new Animated.Value(1)).current;
  const started      = useRef(false);
  const prevOppScore = useRef(0);

  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    socket.on('duel_questions', (data: { questions: QuizQuestion[] | null }) => {
      if (data.questions && data.questions.length > 0) setSharedPool(data.questions);
      startCountdown();
    });

    socket.on('duel_opponent_update', (data: OpponentState) => {
      setOpponent(data);
      // Rakip öne geçti bildirimi
      if (data.score > myScore && data.score > prevOppScore.current) {
        showNotification(`${data.username} öne geçti ↑`);
      }
      prevOppScore.current = data.score;
      // Avatar pulse
      if (data.lastCorrect !== null) {
        setOppFlash({ correct: data.lastCorrect });
        Animated.sequence([
          Animated.spring(oppScaleAnim, { toValue: 1.3, useNativeDriver: true, speed: 50 }),
          Animated.spring(oppScaleAnim, { toValue: 1,   useNativeDriver: true, speed: 20 }),
        ]).start(() => setOppFlash(null));
      }
    });

    socket.on('duel_opponent_joined', (info: { username: string; avatarId: number }) => {
      setOpponent({ ...info, score: 0, qIndex: 0, answered: 0, lastCorrect: null });
    });

    socket.on('duel_finished', (data: { winner: string | 'draw'; myScore: number; oppScore: number }) => {
      endGame();
      setFinalScores({ me: data.myScore, opp: data.oppScore });
      const isWin = data.winner === user?.id;
      const isDraw = data.winner === 'draw';
      const r = isWin ? 'win' : isDraw ? 'draw' : 'lose';
      setResult(r);
      if (isWin) { setRankDelta(+25); setShowConfetti(true); }
      else if (!isDraw) setRankDelta(-15);
      setPhase('result');
      // Rank güncelle
      socket.emit('duel_rank_update', { win: isWin });
    });

    socket.on('duel_opponent_left', () => {
      endGame();
      setResult('win');
      setRankDelta(+25);
      setShowConfetti(true);
      setPhase('result');
      socket.emit('duel_rank_update', { win: true });
    });

    socket.on('duel_emoji', ({ emoji }: { emoji: string }) => {
      setRecvEmoji(emoji);
      setTimeout(() => setRecvEmoji(null), 2500);
    });

    if (!started.current) {
      started.current = true;
      socket.emit('duel_join', { duelId, userId: user?.id, category: cat ?? 'general' });
      startGame((cat ?? 'general') as any);
    }

    return () => {
      socket.off('duel_questions');
      socket.off('duel_opponent_update');
      socket.off('duel_opponent_joined');
      socket.off('duel_finished');
      socket.off('duel_opponent_left');
      socket.off('duel_emoji');
    };
  }, []);

  useEffect(() => {
    setMyScore(score);
    const socket = socketService.getSocket();
    if (socket && duelId && phase === 'playing') {
      socket.emit('duel_update', { duelId, score, userId: user?.id });
    }
  }, [score]);

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

  const showNotification = (txt: string) => {
    setNotif(txt);
    notifAnim.setValue(0);
    Animated.sequence([
      Animated.timing(notifAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(notifAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setNotif(null));
  };

  const handleAnswer = (correct: boolean, pts: number, qIdx: number) => {
    const socket = socketService.getSocket();
    if (socket && duelId) {
      socket.emit('duel_answer', { duelId, userId: user?.id, correct, pts, qIndex: qIdx });
    }
  };

  const handleEnd = () => {
    const socket = socketService.getSocket();
    if (socket && duelId) socket.emit('duel_done', { duelId, userId: user?.id, score });
    endGame();
  };

  const sendEmoji = (emoji: string) => {
    setSentEmoji(emoji);
    setShowEmojis(false);
    const socket = socketService.getSocket();
    socket?.emit('duel_emoji_send', { duelId, emoji });
    setTimeout(() => setSentEmoji(null), 2500);
  };

  // ── GERİ SAYIM ──────────────────────────────────────────────────
  if (phase === 'countdown') return (
    <View style={{ flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.Text style={[ct.num, { transform: [{ scale: countAnim }] }]}>{countdown}</Animated.Text>
      <Text style={ct.sub}>Hazır ol!</Text>
    </View>
  );

  // ── SONUÇ ────────────────────────────────────────────────────────
  if (phase === 'result' && result) {
    const isWin  = result === 'win';
    const isDraw = result === 'draw';
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
        {showConfetti && <Confetti />}
        <ScrollView contentContainerStyle={rs.content}>
          <Text style={rs.emoji}>{isWin ? '🏆' : isDraw ? '🤝' : '😮'}</Text>
          <Text style={[rs.title, { color: isWin ? GOLD : isDraw ? PURP2 : MUTED }]}>
            {isWin ? 'ZAFER!' : isDraw ? 'BERABERELİK' : 'Yakındı!'}
          </Text>
          {isWin && <Text style={rs.winSub}>🔥 Rakibini geçtin!</Text>}
          {!isWin && !isDraw && <Text style={rs.winSub}>Bir dahaki sefere!</Text>}

          {/* Skor kartı */}
          <View style={rs.scoreCard}>
            <View style={rs.scoreRow}>
              <Text style={rs.scoreLabel}>Sen</Text>
              <Text style={[rs.scoreNum, { color: isWin ? GREEN : RED }]}>{finalScores?.me.toLocaleString('tr-TR')}</Text>
            </View>
            <View style={rs.scoreDivider} />
            <View style={rs.scoreRow}>
              <Text style={rs.scoreLabel}>{opponent?.username ?? 'Rakip'}</Text>
              <Text style={[rs.scoreNum, { color: isWin ? RED : GREEN }]}>{finalScores?.opp.toLocaleString('tr-TR')}</Text>
            </View>
          </View>

          {/* Rank değişimi */}
          {rankDelta !== null && (
            <View style={[rs.rankDelta, { borderColor: rankDelta > 0 ? GREEN : RED }]}>
              <Text style={[rs.rankDeltaTxt, { color: rankDelta > 0 ? GREEN : RED }]}>
                {rankDelta > 0 ? `+${rankDelta}` : rankDelta} Rank Puanı
              </Text>
            </View>
          )}

          {/* Butonlar */}
          <TouchableOpacity
            style={rs.rematchBtn}
            onPress={() => router.replace('/duel/lobby' as any)}
          >
            <Text style={rs.rematchTxt}>⚔️ Rövanş İste</Text>
          </TouchableOpacity>
          <TouchableOpacity style={rs.homeBtn} onPress={() => router.replace('/(tabs)')}>
            <Text style={rs.homeTxt}>Ana Sayfaya Dön</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── OYUN ─────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      {/* Canlı Skor Karşılaştırma */}
      <View style={g.scoreHeader}>
        {/* Ben */}
        <View style={g.playerCol}>
          <Avatar avatarId={user?.avatarId ?? 0} size={34} />
          <Text style={g.playerName} numberOfLines={1}>{user?.username ?? 'Sen'}</Text>
          <Text style={[g.playerScore, { color: PURP2 }]}>{myScore.toLocaleString('tr-TR')}</Text>
        </View>

        {/* VS */}
        <View style={g.vsBox}>
          <Text style={g.vsTxt}>⚔️</Text>
          {sentEmoji && <Text style={g.myEmoji}>{sentEmoji}</Text>}
          {recvEmoji && <Text style={g.oppEmoji}>{recvEmoji}</Text>}
        </View>

        {/* Rakip */}
        <View style={[g.playerCol, { alignItems: 'flex-end' }]}>
          <Animated.View style={{ transform: [{ scale: oppScaleAnim }] }}>
            <Avatar avatarId={opponent?.avatarId ?? 1} size={34} />
            {oppFlash && (
              <View style={[g.flashDot, { backgroundColor: oppFlash.correct ? GREEN : RED }]} />
            )}
          </Animated.View>
          <Text style={g.playerName} numberOfLines={1}>{opponent?.username ?? '...'}</Text>
          <Text style={[g.playerScore, { color: opponent && opponent.score > myScore ? RED : MUTED }]}>
            {opponent?.score.toLocaleString('tr-TR') ?? '0'}
          </Text>
        </View>
      </View>

      {/* Bildirim bandı */}
      {notif && (
        <Animated.View style={[g.notifBar, { opacity: notifAnim }]}>
          <Text style={g.notifTxt}>{notif}</Text>
        </Animated.View>
      )}

      {/* Quiz */}
      <QuizMode
        categoryId={(cat ?? 'general') as CategoryId}
        externalPool={sharedPool ?? undefined}
        onEnd={handleEnd}
        onAnswer={handleAnswer}
      />

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

      {/* Bekleme */}
      {phase === 'waiting' && (
        <View style={g.waitOverlay}>
          <Text style={g.waitTxt}>Rakip bekleniyor...</Text>
          {opponent && (
            <Text style={[g.waitTxt, { color: GREEN, marginTop: 8 }]}>
              {opponent.username} bağlandı! Başlıyor...
            </Text>
          )}
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
            <Text style={{ color: MUTED, fontFamily: 'Nunito-Regular' }}>Vazgeç</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const ct = StyleSheet.create({
  num: { fontFamily: 'Nunito-ExtraBold', fontSize: 120, color: '#ffffff',
         textShadowColor: '#8b5cf6', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 30 },
  sub: { fontFamily: 'Nunito-Regular', fontSize: 20, color: '#7c7aaa', marginTop: 8 },
});

const g = StyleSheet.create({
  scoreHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: '#13132a', borderBottomWidth: 1, borderBottomColor: '#2e2b5a',
  },
  playerCol:    { flex: 1, alignItems: 'flex-start', gap: 2 },
  playerName:   { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#ffffff', maxWidth: 100 },
  playerScore:  { fontFamily: 'Nunito-ExtraBold', fontSize: 22 },
  vsBox:        { width: 60, alignItems: 'center', position: 'relative' },
  vsTxt:        { fontSize: 22 },
  myEmoji:      { position: 'absolute', top: -20, left: -10, fontSize: 28 },
  oppEmoji:     { position: 'absolute', top: -20, right: -10, fontSize: 28 },
  flashDot:     { position: 'absolute', top: 0, right: 0, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#0d0d1a' },
  notifBar:     { backgroundColor: '#1a0040', paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center' },
  notifTxt:     { fontFamily: 'Nunito-Bold', fontSize: 13, color: '#a78bfa' },
  emojiToggle:  { position: 'absolute', bottom: 100, right: 16, backgroundColor: '#1a1040', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2e2b5a' },
  emojiBar:     { position: 'absolute', bottom: 150, right: 16, backgroundColor: '#13132a', borderRadius: 20, padding: 10, flexDirection: 'row', gap: 8, borderWidth: 1, borderColor: '#2e2b5a' },
  emojiBtn:     { padding: 4 },
  waitOverlay:  { ...StyleSheet.absoluteFillObject, backgroundColor: '#0d0d1aee', alignItems: 'center', justifyContent: 'center' },
  waitTxt:      { fontFamily: 'Nunito-ExtraBold', fontSize: 20, color: '#ffffff' },
});

const rs = StyleSheet.create({
  content:    { alignItems: 'center', padding: 24, gap: 14 },
  emoji:      { fontSize: 72 },
  title:      { fontFamily: 'Nunito-ExtraBold', fontSize: 32 },
  winSub:     { fontFamily: 'Nunito-Regular', fontSize: 16, color: '#7c7aaa' },
  scoreCard:  { backgroundColor: '#13132a', borderRadius: 20, padding: 20, width: '100%', gap: 12, borderWidth: 1, borderColor: '#2e2b5a' },
  scoreRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreLabel: { fontFamily: 'Nunito-Regular', fontSize: 14, color: '#7c7aaa' },
  scoreNum:   { fontFamily: 'Nunito-ExtraBold', fontSize: 28 },
  scoreDivider: { height: 1, backgroundColor: '#2e2b5a' },
  rankDelta:  { borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 18, paddingVertical: 8 },
  rankDeltaTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 18 },
  rematchBtn: { backgroundColor: '#6c3aed', borderRadius: 16, paddingVertical: 18, width: '100%', alignItems: 'center',
                shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 },
  rematchTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 17, color: '#ffffff' },
  homeBtn:    { backgroundColor: '#13132a', borderRadius: 16, paddingVertical: 16, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#2e2b5a' },
  homeTxt:    { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: '#ffffff' },
});
