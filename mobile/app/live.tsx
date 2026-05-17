import { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Animated, FlatList, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useUserStore } from '../src/store/userStore';
import { useGameStore } from '../src/store/gameStore';
import { socketService } from '../src/services/socket.service';
import { arenaService, type ArenaStatus } from '../src/services/arena.service';
import { CATEGORIES, type CategoryId } from '../src/constants/categories';
import { QuizMode } from '../src/components/game/modes/QuizMode';

const { width } = Dimensions.get('window');

// ── Arena Renk Paleti (enerji/ısı) ───────────────────────────────
const BG     = '#0a0005';
const CARD   = '#1a0a12';
const RED    = '#ef4444';
const ORANGE = '#f97316';
const YELLOW = '#fbbf24';
const TEXT   = '#ffffff';
const MUTED  = '#9ca3af';

type Phase = 'loading' | 'waiting' | 'intro' | 'playing' | 'result';

interface ScoreEntry { username: string; score: number; rank: number; }

// ── Ateş partikülleri ─────────────────────────────────────────────
function FireParticle({ x, delay }: { x: number; delay: number }) {
  const y   = useRef(new Animated.Value(0)).current;
  const op  = useRef(new Animated.Value(0)).current;
  const sc  = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(y,  { toValue: -60, duration: 1400, useNativeDriver: true }),
        Animated.timing(op, { toValue: 1,   duration: 400,  useNativeDriver: true }),
        Animated.timing(sc, { toValue: 1,   duration: 700,  useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(op, { toValue: 0, duration: 1000, useNativeDriver: true }),
        Animated.timing(y,  { toValue: -100, duration: 1000, useNativeDriver: true }),
      ]),
    ])).start();
  }, []);
  return (
    <Animated.Text style={{
      position: 'absolute', fontSize: 18, left: x,
      bottom: 0, opacity: op,
      transform: [{ translateY: y }, { scale: sc }],
    }}>🔥</Animated.Text>
  );
}

// ── Geri sayım (büyük sayı, animasyonlu) ─────────────────────────
function IntroCountdown({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(3);
  const scale = useRef(new Animated.Value(2)).current;
  const op    = useRef(new Animated.Value(0)).current;

  const tick = useCallback((current: number) => {
    scale.setValue(2);
    op.setValue(0);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 12 }),
      Animated.timing(op, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => {
        if (current > 1) {
          setN(current - 1);
          tick(current - 1);
        } else {
          onDone();
        }
      }, 900);
    });
  }, []);

  useEffect(() => { tick(3); }, []);

  return (
    <View style={ic.root}>
      <View style={ic.bg} />
      <Text style={ic.label}>HAZIR OL!</Text>
      <Animated.Text style={[ic.num, { transform: [{ scale }], opacity: op }]}>
        {n}
      </Animated.Text>
      <Text style={ic.sub}>Arena başlıyor...</Text>
    </View>
  );
}
const ic = StyleSheet.create({
  root:  { flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center', gap: 16 },
  bg:    { ...StyleSheet.absoluteFillObject, backgroundColor: '#1a0000' },
  label: { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: ORANGE, letterSpacing: 4 },
  num:   { fontFamily: 'Nunito-ExtraBold', fontSize: 120, color: RED,
           textShadowColor: ORANGE, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 30 },
  sub:   { fontFamily: 'Nunito-Regular', fontSize: 16, color: MUTED },
});

// ── Ana ekran ─────────────────────────────────────────────────────
export default function ArenaScreen() {
  const { user } = useUserStore();
  const { score, startGame, endGame } = useGameStore();

  const [phase,       setPhase]       = useState<Phase>('loading');
  const [status,      setStatus]      = useState<ArenaStatus | null>(null);
  const [arenaId,     setArenaId]     = useState<string | null>(null);
  const [category,    setCategory]    = useState<string>('general');
  const [timeLeft,    setTimeLeft]    = useState(0);
  const [participants,setParticipants]= useState(0);
  const [myScore,     setMyScore]     = useState(0);
  const [liveScores,  setLiveScores]  = useState<ScoreEntry[]>([]);
  const [myRank,      setMyRank]      = useState<number | null>(null);
  const [finalBoard,  setFinalBoard]  = useState<any[]>([]);
  const [countdown,   setCountdown]   = useState(0); // saniye -> arena başlamasına

  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const endCalled = useRef(false);
  const startRef  = useRef(Date.now());

  useEffect(() => {
    loadStatus();
    setupSocket();
    return cleanup;
  }, []);

  useEffect(() => { setMyScore(score); }, [score]);

  // ── Status yükle ───────────────────────────────────────────────
  const loadStatus = async () => {
    try {
      const s = await arenaService.getStatus();
      setStatus(s);
      if (s.phase === 'active' && s.arenaId) {
        setArenaId(s.arenaId);
        setCategory(s.category ?? 'general');
        setTimeLeft(s.secondsLeft ?? 0);
        setParticipants(s.participants ?? 0);
        setPhase('intro');
      } else {
        setCountdown(s.secondsUntil ?? 0);
        setPhase('waiting');
        // Countdown sayacı
        const iv = setInterval(() => {
          setCountdown(c => {
            if (c <= 1) { clearInterval(iv); loadStatus(); return 0; }
            return c - 1;
          });
        }, 1000);
      }
    } catch { setPhase('waiting'); }
  };

  // ── Socket ─────────────────────────────────────────────────────
  const setupSocket = () => {
    const socket = socketService.getSocket();
    if (!socket) return;

    socket.on('arena_started', (data: any) => {
      setArenaId(data.arenaId);
      setCategory(data.category);
      setTimeLeft(data.secondsLeft);
      setPhase('intro');
    });

    socket.on('arena_score_update', (data: { username: string; score: number }) => {
      setLiveScores(prev => {
        const idx = prev.findIndex(e => e.username === data.username);
        const next = idx >= 0
          ? prev.map(e => e.username === data.username ? { ...e, score: data.score } : e)
          : [...prev, { username: data.username, score: data.score, rank: 0 }];
        return next.sort((a, b) => b.score - a.score).map((e, i) => ({ ...e, rank: i + 1 }));
      });
    });
  };

  const cleanup = () => {
    const socket = socketService.getSocket();
    socket?.off('arena_started');
    socket?.off('arena_score_update');
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // ── Arena başla ────────────────────────────────────────────────
  const handleIntroEnd = async () => {
    if (!arenaId) return;
    try {
      await arenaService.join();
      const socket = socketService.getSocket();
      socket?.emit('arena_join', { arenaId });
    } catch {}
    startGame(category as any);
    startRef.current = Date.now();
    setPhase('playing');

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current!); handleEnd(); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  // ── Cevap verilince skoru yayınla ─────────────────────────────
  const handleAnswer = (_correct: boolean, _pts: number, _qIdx: number) => {
    const socket = socketService.getSocket();
    if (socket && arenaId && user) {
      socket.emit('arena_score', { arenaId, score, username: user.username });
    }
  };

  // ── Oyun bitti ─────────────────────────────────────────────────
  const handleEnd = async () => {
    if (endCalled.current) return;
    endCalled.current = true;
    const result = endGame();
    if (!arenaId) { setPhase('result'); return; }
    try {
      await arenaService.submit({
        arenaId, score: result.score,
        correctAnswers: result.maxCombo,
        totalQuestions: 10,
        durationMs: Date.now() - startRef.current,
      });
      const { leaderboard, myRank: rank } = await arenaService.getLeaderboard(arenaId);
      setFinalBoard(leaderboard.slice(0, 20));
      setMyRank(rank);
    } catch {}
    setPhase('result');
  };

  const cat = CATEGORIES.find(c => c.id === category);
  const mins = Math.floor(timeLeft / 60);
  const secs = String(timeLeft % 60).padStart(2, '0');

  // ── INTRO ─────────────────────────────────────────────────────
  if (phase === 'intro') return <IntroCountdown onDone={handleIntroEnd} />;

  // ── OYUN ──────────────────────────────────────────────────────
  if (phase === 'playing') return (
    <SafeAreaView style={s.root}>
      {/* Arena üst bar */}
      <View style={s.arenaBar}>
        <View style={s.livePill}>
          <View style={s.liveDotRed} />
          <Text style={s.livePillTxt}>CANLI ARENA</Text>
        </View>
        <View style={s.timerBox}>
          <Text style={s.timerTxt}>{mins}:{secs}</Text>
        </View>
        <Text style={s.participantsTxt}>👥 {participants}</Text>
      </View>

      {/* Canlı sıralama şeridi */}
      {liveScores.length > 0 && (
        <View style={s.liveStrip}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {liveScores.slice(0, 10).map((e, i) => (
              <View key={e.username} style={[
                s.liveChip,
                e.username === user?.username && s.liveChipMe,
              ]}>
                <Text style={s.liveChipRank}>#{e.rank}</Text>
                <Text style={s.liveChipName} numberOfLines={1}>{e.username}</Text>
                <Text style={s.liveChipScore}>{e.score.toLocaleString('tr-TR')}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <QuizMode
        categoryId={(category as CategoryId) ?? 'general'}
        onEnd={handleEnd}
        onAnswer={handleAnswer}
      />
    </SafeAreaView>
  );

  // ── SONUÇ ──────────────────────────────────────────────────────
  if (phase === 'result') return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.resultScroll}>
        <Text style={s.resultEmoji}>🏆</Text>
        <Text style={s.resultTitle}>Arena Bitti!</Text>
        {myRank && (
          <View style={s.myRankCard}>
            <Text style={s.myRankLabel}>Sıralaman</Text>
            <Text style={s.myRankNum}>#{myRank}</Text>
            <Text style={s.myRankScore}>{myScore.toLocaleString('tr-TR')} puan</Text>
          </View>
        )}
        {finalBoard.length > 0 && (
          <View style={s.lbWrap}>
            <Text style={s.lbTitle}>Sıralama</Text>
            {finalBoard.slice(0, 10).map((e, i) => (
              <View key={i} style={[s.lbRow, e.username === user?.username && s.lbRowMe]}>
                <Text style={s.lbRank}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </Text>
                <Text style={s.lbName}>{e.username}</Text>
                <Text style={s.lbScore}>{e.score.toLocaleString('tr-TR')}</Text>
              </View>
            ))}
          </View>
        )}
        <TouchableOpacity style={s.homeBtn} onPress={() => router.replace('/(tabs)')}>
          <Text style={s.homeBtnTxt}>Ana Sayfaya Dön</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );

  // ── BEKLEME ────────────────────────────────────────────────────
  const nextH = status?.nextHourTR ?? 21;
  const countH = Math.floor(countdown / 3600);
  const countM = Math.floor((countdown % 3600) / 60);
  const countS = countdown % 60;

  return (
    <SafeAreaView style={s.root}>
      {/* Arka plan ateş partikülleri */}
      <View style={s.particleZone} pointerEvents="none">
        {[40, 90, 150, 220, 280, 340].map((x, i) => (
          <FireParticle key={i} x={x} delay={i * 300} />
        ))}
      </View>

      <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
        <Text style={s.backTxt}>← Geri</Text>
      </TouchableOpacity>

      <View style={s.waitCenter}>
        {/* Logo */}
        <View style={s.arenaLogo}>
          <Text style={s.arenaLogoIcon}>⚔️</Text>
          <Text style={s.arenaLogoTxt}>ZEKA ARENASI</Text>
        </View>

        {/* Countdown */}
        <View style={s.countCard}>
          <Text style={s.countLabel}>Sonraki Arena — {nextH}:00</Text>
          <View style={s.countRow}>
            <CountUnit val={countH} label="SA" />
            <Text style={s.countSep}>:</Text>
            <CountUnit val={countM} label="DK" />
            <Text style={s.countSep}>:</Text>
            <CountUnit val={countS} label="SN" />
          </View>
        </View>

        {/* Günlük saatler */}
        <View style={s.scheduleRow}>
          {[13, 18, 21].map(h => (
            <View key={h} style={[s.scheduleChip, h === nextH && s.scheduleChipActive]}>
              <Text style={[s.scheduleTime, h === nextH && { color: ORANGE }]}>{h}:00</Text>
            </View>
          ))}
        </View>

        {/* Kurallar */}
        <View style={s.rulesWrap}>
          {[
            { icon: '👥', text: '1.200+ oyuncu aynı anda' },
            { icon: '⚡', text: 'Hızlı cevap = daha fazla puan' },
            { icon: '📊', text: 'Anlık sıralama takibi' },
            { icon: '🏅', text: 'İlk 100\'e özel ödüller' },
          ].map((r, i) => (
            <View key={i} style={s.ruleRow}>
              <Text style={s.ruleIcon}>{r.icon}</Text>
              <Text style={s.ruleTxt}>{r.text}</Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

function CountUnit({ val, label }: { val: number; label: string }) {
  return (
    <View style={cu.wrap}>
      <Text style={cu.num}>{String(val).padStart(2, '0')}</Text>
      <Text style={cu.label}>{label}</Text>
    </View>
  );
}
const cu = StyleSheet.create({
  wrap:  { alignItems: 'center', minWidth: 60 },
  num:   { fontFamily: 'Nunito-ExtraBold', fontSize: 42, color: ORANGE,
           textShadowColor: RED, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 12 },
  label: { fontFamily: 'Nunito-Bold', fontSize: 11, color: MUTED, letterSpacing: 2 },
});

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  // Bekleme ekranı
  particleZone: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 120 },
  backBtn:  { padding: 16 },
  backTxt:  { fontFamily: 'Nunito-Regular', fontSize: 15, color: MUTED },
  waitCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 20 },

  arenaLogo:    { alignItems: 'center', gap: 6 },
  arenaLogoIcon:{ fontSize: 56 },
  arenaLogoTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 22, color: TEXT, letterSpacing: 4,
                  textShadowColor: RED, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 16 },

  countCard:  { backgroundColor: CARD, borderRadius: 24, padding: 24, alignItems: 'center', gap: 10,
                borderWidth: 1.5, borderColor: RED + '44',
                shadowColor: RED, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 20 },
  countLabel: { fontFamily: 'Nunito-Bold', fontSize: 13, color: MUTED },
  countRow:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  countSep:   { fontFamily: 'Nunito-ExtraBold', fontSize: 36, color: ORANGE, marginBottom: 14 },

  scheduleRow:       { flexDirection: 'row', gap: 10 },
  scheduleChip:      { backgroundColor: CARD, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 10, borderWidth: 1, borderColor: '#2a1a1a' },
  scheduleChipActive:{ borderColor: ORANGE, backgroundColor: ORANGE + '18' },
  scheduleTime:      { fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: MUTED },

  rulesWrap: { backgroundColor: CARD, borderRadius: 20, padding: 18, gap: 12, width: '100%', borderWidth: 1, borderColor: '#1a0a0a' },
  ruleRow:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ruleIcon:  { fontSize: 20 },
  ruleTxt:   { fontFamily: 'Nunito-Regular', fontSize: 14, color: TEXT, flex: 1 },

  // Oyun ekranı
  arenaBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: '#1a0005', borderBottomWidth: 1, borderBottomColor: RED + '44',
  },
  livePill:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: RED + '22', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  liveDotRed:   { width: 8, height: 8, borderRadius: 4, backgroundColor: RED },
  livePillTxt:  { fontFamily: 'Nunito-ExtraBold', fontSize: 11, color: RED, letterSpacing: 1 },
  timerBox:     { backgroundColor: '#2a0010', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4 },
  timerTxt:     { fontFamily: 'Nunito-ExtraBold', fontSize: 18, color: ORANGE },
  participantsTxt: { fontFamily: 'Nunito-Bold', fontSize: 13, color: MUTED },

  liveStrip:  { backgroundColor: '#150008', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#2a0010' },
  liveChip:   { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: CARD, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, marginHorizontal: 4 },
  liveChipMe: { borderWidth: 1, borderColor: ORANGE },
  liveChipRank:  { fontFamily: 'Nunito-Bold', fontSize: 10, color: ORANGE },
  liveChipName:  { fontFamily: 'Nunito-Regular', fontSize: 11, color: TEXT, maxWidth: 60 },
  liveChipScore: { fontFamily: 'Nunito-ExtraBold', fontSize: 11, color: YELLOW },

  // Sonuç
  resultScroll: { alignItems: 'center', padding: 24, gap: 16 },
  resultEmoji:  { fontSize: 72 },
  resultTitle:  { fontFamily: 'Nunito-ExtraBold', fontSize: 28, color: TEXT },
  myRankCard:   { backgroundColor: CARD, borderRadius: 20, padding: 24, alignItems: 'center', width: '100%', borderWidth: 1.5, borderColor: ORANGE + '55' },
  myRankLabel:  { fontFamily: 'Nunito-Regular', fontSize: 14, color: MUTED },
  myRankNum:    { fontFamily: 'Nunito-ExtraBold', fontSize: 56, color: ORANGE },
  myRankScore:  { fontFamily: 'Nunito-Bold', fontSize: 18, color: YELLOW },
  lbWrap:       { width: '100%', gap: 8 },
  lbTitle:      { fontFamily: 'Nunito-ExtraBold', fontSize: 18, color: TEXT },
  lbRow:        { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 14, padding: 14, gap: 10 },
  lbRowMe:      { borderWidth: 1.5, borderColor: ORANGE },
  lbRank:       { fontSize: 22, width: 36 },
  lbName:       { flex: 1, fontFamily: 'Nunito-Bold', fontSize: 14, color: TEXT },
  lbScore:      { fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: YELLOW },
  homeBtn:      { backgroundColor: RED, borderRadius: 16, paddingVertical: 18, width: '100%', alignItems: 'center' },
  homeBtnTxt:   { fontFamily: 'Nunito-ExtraBold', fontSize: 17, color: TEXT },
});
