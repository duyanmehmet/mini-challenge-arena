import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Dimensions, Animated, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useUserStore } from '../../src/store/userStore';
import { userService } from '../../src/services/user.service';
import api from '../../src/services/api';
import { Avatar } from '../../src/components/ui/Avatar';

const { width: W } = Dimensions.get('window');

const LEAGUE_ICONS: Record<string,string> = {
  filiz:'🌱',kaya:'🪨',demir:'🔩',celik:'⚔️',bronz:'🥉',
  gumus:'🥈',altin:'🥇',safir:'🔵',zumrut:'💚',elmas:'💎',
  platin:'🔷',kristal:'🌟',mistik:'🔮',ay:'🌙',gunes:'☀️',
  simsek:'⚡',alev:'🔥',okyanus:'🌊',zirve:'🏔️',kartal:'🦅',
  ejderha:'🐉',galaksi:'🌌',nova:'💫',efsane:'🦄',kral:'👑',
  yildiz:'⭐',meteor:'🌠',zafer:'🏆',elit:'🎯',sampiyon:'🏅',
};
const LEAGUE_COLORS: Record<string,string> = {
  filiz:'#86efac',kaya:'#a8a29e',demir:'#94a3b8',celik:'#64748b',bronz:'#cd7f32',
  gumus:'#9ca3af',altin:'#f59e0b',safir:'#3b82f6',zumrut:'#22c55e',elmas:'#06b6d4',
  platin:'#38bdf8',kristal:'#e2e8f0',mistik:'#a855f7',ay:'#c4b5fd',gunes:'#fbbf24',
  simsek:'#facc15',alev:'#f97316',okyanus:'#0ea5e9',zirve:'#e2e8f0',kartal:'#854d0e',
  ejderha:'#dc2626',galaksi:'#6366f1',nova:'#f0abfc',efsane:'#e879f9',kral:'#fde047',
  yildiz:'#fef08a',meteor:'#fb923c',zafer:'#f59e0b',elit:'#f43f5e',sampiyon:'#a78bfa',
};
const LEAGUE_NAMES: Record<string,string> = {
  filiz:'Filiz',kaya:'Kaya',demir:'Demir',celik:'Çelik',bronz:'Bronz',
  gumus:'Gümüş',altin:'Altın',safir:'Safir',zumrut:'Zümrüt',elmas:'Elmas',
  platin:'Platin',kristal:'Kristal',mistik:'Mistik',ay:'Ay',gunes:'Güneş',
  simsek:'Şimşek',alev:'Alev',okyanus:'Okyanus',zirve:'Zirve',kartal:'Kartal',
  ejderha:'Ejderha',galaksi:'Galaksi',nova:'Nova',efsane:'Efsane',kral:'Kral',
  yildiz:'Yıldız',meteor:'Meteor',zafer:'Zafer',elit:'Elit',sampiyon:'Şampiyon',
};

// ─── STREAK ───────────────────────────────────────────────────────
function StreakBadge({ count }: { count: number }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(scale, { toValue: 1.18, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1,    duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();
  }, []);
  return (
    <View style={s.statChip}>
      <Animated.Text style={[{ fontSize: 16 }, { transform: [{ scale }] }]}>🔥</Animated.Text>
      <Text style={s.statNum}>{count}</Text>
    </View>
  );
}

// ─── COIN ─────────────────────────────────────────────────────────
function CoinBadge({ amount, onPress }: { amount: number; onPress: () => void }) {
  const sc = useRef(new Animated.Value(1)).current;
  const [floaters, setFloaters] = useState<number[]>([]);
  const nid = useRef(0);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
    const id = nid.current++;
    setFloaters(p => [...p, id]);
    Animated.sequence([
      Animated.timing(sc, { toValue: 1.2, duration: 80, useNativeDriver: true }),
      Animated.spring(sc, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setFloaters(p => p.filter(x => x !== id)), 900);
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
      <Animated.View style={[s.coinChip, { transform: [{ scale: sc }] }]}>
        <Text style={{ fontSize: 14 }}>🪙</Text>
        <Text style={s.coinNum}>{amount.toLocaleString('tr-TR')}</Text>
        <View style={s.coinPlus}><Text style={{ fontSize: 11, color: '#000', fontWeight: '900', lineHeight: 16 }}>+</Text></View>
      </Animated.View>
      {floaters.map(id => <FloatNum key={id} />)}
    </TouchableOpacity>
  );
}

function FloatNum() {
  const y = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(y,  { toValue: -50, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.sequence([Animated.delay(400), Animated.timing(op, { toValue: 0, duration: 500, useNativeDriver: true })]),
    ]).start();
  }, []);
  return <Animated.Text style={[s.floatNum, { transform: [{ translateY: y }], opacity: op }]}>+💰</Animated.Text>;
}

// ─── ANIMASYONLU KART ─────────────────────────────────────────────
function AnimCard({ delay, children, style, onPress }: { delay: number; children: React.ReactNode; style?: object; onPress?: () => void }) {
  const ty = useRef(new Animated.Value(60)).current;
  const op = useRef(new Animated.Value(0)).current;
  const sc = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(ty, { toValue: 0, duration: 450, delay, easing: Easing.out(Easing.back(1.1)), useNativeDriver: true }),
      Animated.timing(op, { toValue: 1, duration: 350, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[{ transform: [{ translateY: ty }, { scale: sc }], opacity: op }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => Animated.spring(sc, { toValue: 0.96, tension: 80, friction: 7, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(sc, { toValue: 1,    tension: 80, friction: 7, useNativeDriver: true }).start()}
        activeOpacity={1}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── DÖNEN GLOW ───────────────────────────────────────────────────
function GlowRing() {
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.loop(Animated.timing(rot, { toValue: 1, duration: 4000, easing: Easing.linear, useNativeDriver: true })).start(); }, []);
  const rotate = rot.interpolate({ inputRange: [0,1], outputRange: ['0deg','360deg'] });
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', transform: [{ rotate }] }]}>
      <View style={s.glowCircle} />
    </Animated.View>
  );
}

// ─── KILIÇ ────────────────────────────────────────────────────────
function SwordClash() {
  const lx = useRef(new Animated.Value(-50)).current;
  const rx = useRef(new Animated.Value(50)).current;
  const sp = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = () => {
      lx.setValue(-50); rx.setValue(50); sp.setValue(0);
      Animated.sequence([
        Animated.parallel([
          Animated.timing(lx, { toValue: -4, duration: 300, easing: Easing.out(Easing.back(2)), useNativeDriver: true }),
          Animated.timing(rx, { toValue: 4,  duration: 300, easing: Easing.out(Easing.back(2)), useNativeDriver: true }),
        ]),
        Animated.spring(sp, { toValue: 1, tension: 250, friction: 5, useNativeDriver: true }),
        Animated.delay(600),
        Animated.parallel([
          Animated.timing(lx, { toValue: -50, duration: 250, useNativeDriver: true }),
          Animated.timing(rx, { toValue: 50,  duration: 250, useNativeDriver: true }),
          Animated.timing(sp, { toValue: 0,   duration: 200, useNativeDriver: true }),
        ]),
        Animated.delay(1000),
      ]).start(loop);
    };
    loop();
  }, []);
  return (
    <View style={s.swordRow}>
      <Animated.Text style={{ fontSize: 28, transform: [{ translateX: lx }, { scaleX: -1 }] }}>⚔️</Animated.Text>
      <Animated.Text style={[{ fontSize: 22, position: 'absolute' }, { transform: [{ scale: sp }], opacity: sp }]}>✨</Animated.Text>
      <Animated.Text style={{ fontSize: 28, transform: [{ translateX: rx }] }}>⚔️</Animated.Text>
    </View>
  );
}

// ─── ANA EKRAN ────────────────────────────────────────────────────
export default function HomeScreen() {
  const { user, dailyTasks, setDailyTasks, setPersonalBests, updateUser, setBadges, token } = useUserStore();
  const [ligInfo, setLigInfo] = useState<any>(null);
  const [unread,  setUnread]  = useState(0);
  const headerOp = useRef(new Animated.Value(0)).current;
  const headerY  = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOp, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(headerY,  { toValue: 0, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, []);

  useFocusEffect(useCallback(() => {
    if (!user) return;
    userService.getDailyTasks().then(setDailyTasks).catch(() => {});
    userService.getProfile().then(({ user: fresh, personalBests: pbs, badges }) => {
      if (fresh && token) updateUser(fresh);
      if (pbs) setPersonalBests(pbs);
      if (badges) setBadges(badges as string[]);
    }).catch(() => {});
    api.get('/lig/current').then(r => setLigInfo(r.data)).catch(() => {});
    api.get('/messages/unread/count').then(r => setUnread(r.data?.count ?? 0)).catch(() => {});
  }, [user?.id]));

  if (!user) return null;

  const league  = (user as any).currentLeague ?? 'bronz';
  const lgColor = LEAGUE_COLORS[league] ?? '#cd7f32';
  const lgIcon  = LEAGUE_ICONS[league]  ?? '🥉';
  const lgName  = LEAGUE_NAMES[league]  ?? 'Bronz';
  const hearts  = Array.from({ length: 5 }, (_, i) => i < (ligInfo?.hearts ?? 5) ? '❤️' : '🖤');

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── HEADER ── */}
        <Animated.View style={[s.header, { opacity: headerOp, transform: [{ translateY: headerY }] }]}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={s.avatarBtn}>
            <Avatar avatarId={user.avatarId} size={42} />
            <View style={s.lvlBadge}><Text style={s.lvlTxt}>{user.level}</Text></View>
          </TouchableOpacity>
          <View style={s.headerRight}>
            {user.streakCount > 0 && <StreakBadge count={user.streakCount} />}
            <CoinBadge amount={user.coins} onPress={() => router.push('/shop' as any)} />
            <TouchableOpacity style={s.msgBtn} onPress={() => router.push('/messages' as any)}>
              <Text style={{ fontSize: 20 }}>💬</Text>
              {unread > 0 && <View style={s.badge}><Text style={s.badgeTxt}>{unread > 9 ? '9+' : unread}</Text></View>}
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Text style={s.sectionLabel}>Oyun Modları</Text>

        {/* ── BIG CARDS ── */}
        <View style={s.bigRow}>
          {/* LİG */}
          <AnimCard delay={60} style={{ flex: 1.1 }} onPress={() => router.push('/lig' as any)}>
            <LinearGradient colors={['#5b21b6','#3b0764','#1e0a42']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.bigCard}>
              <GlowRing />
              {/* Lig rozeti */}
              <View style={[s.ligRozetRow]}>
                <View style={[s.ligRozet, { borderColor: lgColor + '99' }]}>
                  <Text style={{ fontSize: 11 }}>{lgIcon}</Text>
                  <Text style={[s.ligRozetTxt, { color: lgColor }]}>{lgName}</Text>
                </View>
              </View>
              {/* Kupa */}
              <Text style={s.bigIcon}>🏆</Text>
              <Text style={s.bigTitle}>Lig</Text>
              <Text style={s.bigSub}>{ligInfo?.category?.name ?? 'Haftalık yarış'}</Text>
              {ligInfo && <Text style={s.ligRankTxt}>#{ligInfo.userRank}. sıradasın</Text>}
              <Text style={s.heartsStr}>{hearts.join('')}</Text>
            </LinearGradient>
          </AnimCard>

          {/* DÜELLO */}
          <AnimCard delay={160} style={{ flex: 1 }} onPress={() => router.push('/duel/lobby' as any)}>
            <LinearGradient colors={['#6d28d9','#4c1d95','#2e1065']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.bigCard}>
              <SwordClash />
              <Text style={s.bigTitle}>Düello</Text>
              <Text style={s.bigSub}>Çark · 1'e 1</Text>
              <View style={s.coinRow}>
                <Text style={s.coinRowTxt}>50-2000 🪙</Text>
              </View>
              {user.streakCount > 0 && <Text style={s.duelStreakTxt}>🔥 {user.streakCount} seri</Text>}
            </LinearGradient>
          </AnimCard>
        </View>

        {/* ── SMALL CARDS ── */}
        <View style={s.smallRow}>
          <AnimCard delay={240} style={{ flex: 1 }} onPress={() => router.push('/challenge' as any)}>
            <LinearGradient colors={['#1c1c3a','#13132a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.smallCard}>
              <Text style={s.smallIcon}>🎯</Text>
              <Text style={s.smallTitle}>Challenge</Text>
              <Text style={s.smallSub}>Günlük liderlik</Text>
              <Text style={s.smallXP}>+100 XP</Text>
            </LinearGradient>
          </AnimCard>
          <AnimCard delay={310} style={{ flex: 1 }} onPress={() => router.push('/antrenman' as any)}>
            <LinearGradient colors={['#0a2a2a','#13132a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.smallCard}>
              <Text style={s.smallIcon}>📚</Text>
              <Text style={s.smallTitle}>Antrenman</Text>
              <Text style={s.smallSub}>Kategori seç</Text>
              <Text style={[s.smallXP, { color: '#06b6d4' }]}>Serbest oyna</Text>
            </LinearGradient>
          </AnimCard>
        </View>

        {/* ── GÜNLÜK GÖREVLER ── */}
        {dailyTasks && dailyTasks.length > 0 && (
          <>
            <View style={s.taskHeaderRow}>
              <Text style={s.sectionLabel}>Günlük Görevler</Text>
              <TouchableOpacity onPress={() => router.push('/tasks' as any)}>
                <Text style={s.tumumTxt}>Tümü ›</Text>
              </TouchableOpacity>
            </View>

            {dailyTasks.slice(0, 2).map((task: any, i: number) => {
              const taskIcon = task.task_type?.startsWith('play_') ? '🎮'
                : task.task_type?.includes('history') ? '🏺'
                : task.task_type?.includes('science') ? '🔬'
                : task.task_type?.includes('sports')  ? '⚽'
                : '🎯';
              const pct = task.target_value > 0 ? Math.min(((task.current_value ?? 0) / task.target_value) * 100, 100) : 0;
              return (
                <AnimCard key={task.id ?? i} delay={360 + i * 60}>
                  <View style={s.taskCard}>
                    <Text style={{ fontSize: 24 }}>{taskIcon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.taskTitle} numberOfLines={1}>{task.task_description ?? 'Görev'}</Text>
                      <View style={s.taskBarBg}>
                        <View style={[s.taskBarFill, { width: `${pct}%` as any }]} />
                      </View>
                      <Text style={s.taskProg}>{task.current_value ?? 0} / {task.target_value}</Text>
                    </View>
                    <View style={s.xpBadge}><Text style={s.xpBadgeTxt}>+{task.xp_reward} XP</Text></View>
                  </View>
                </AnimCard>
              );
            })}
          </>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#0d0d1a' },
  scroll: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 20 },

  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  avatarBtn:  { position: 'relative' },
  lvlBadge:   { position: 'absolute', bottom: -3, right: -3, backgroundColor: '#6c3aed', borderRadius: 8, paddingHorizontal: 4, paddingVertical: 1, borderWidth: 1.5, borderColor: '#0d0d1a' },
  lvlTxt:     { color: '#fff', fontSize: 9, fontWeight: '900' },
  headerRight:{ flexDirection: 'row', alignItems: 'center', gap: 8 },

  statChip:   { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#1a1030', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: '#2e2b5a' },
  statNum:    { color: '#fff', fontWeight: '900', fontSize: 14 },

  coinChip:   { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#1a1008', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1.5, borderColor: '#f59e0b88' },
  coinNum:    { color: '#fff', fontSize: 13, fontWeight: '900' },
  coinPlus:   { width: 16, height: 16, borderRadius: 8, backgroundColor: '#f59e0b', alignItems: 'center', justifyContent: 'center' },
  floatNum:   { position: 'absolute', top: -10, left: 20, color: '#f59e0b', fontSize: 13, fontWeight: '900', zIndex: 99 },

  msgBtn:     { width: 38, height: 38, borderRadius: 19, backgroundColor: '#13132a', borderWidth: 1, borderColor: '#2e2b5a', alignItems: 'center', justifyContent: 'center' },
  badge:      { position: 'absolute', top: -4, right: -4, backgroundColor: '#ef4444', borderRadius: 9, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3, borderWidth: 2, borderColor: '#0d0d1a' },
  badgeTxt:   { color: '#fff', fontSize: 9, fontWeight: '900' },

  sectionLabel: { color: '#fff', fontSize: 17, fontWeight: '900', marginBottom: 10 },

  bigRow:   { flexDirection: 'row', gap: 10, marginBottom: 10 },
  bigCard:  { borderRadius: 22, padding: 16, minHeight: 200, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },

  // Glow
  glowCircle: { width: 180, height: 180, borderRadius: 90, borderWidth: 2.5, borderColor: 'transparent', borderTopColor: 'rgba(245,158,11,0.5)', borderRightColor: 'rgba(139,92,246,0.3)' },

  // Lig card
  ligRozetRow: { marginBottom: 6 },
  ligRozet:   { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: 8, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 3, alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.3)' },
  ligRozetTxt:{ fontSize: 10, fontWeight: '800' },
  bigIcon:    { fontSize: 36, marginBottom: 4 },
  bigTitle:   { color: '#fff', fontSize: 22, fontWeight: '900', marginBottom: 2 },
  bigSub:     { color: 'rgba(255,255,255,0.55)', fontSize: 11, marginBottom: 6 },
  ligRankTxt: { color: '#f59e0b', fontSize: 12, fontWeight: '800', marginBottom: 4 },
  heartsStr:  { fontSize: 14, letterSpacing: 2 },

  // Düello card
  swordRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 48, marginBottom: 4 },
  coinRow:    { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245,158,11,0.18)', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'center', borderWidth: 1, borderColor: 'rgba(245,158,11,0.4)', marginTop: 6 },
  coinRowTxt: { color: '#f59e0b', fontSize: 11, fontWeight: '800' },
  duelStreakTxt:{ color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 4, textAlign: 'center' },

  // Small cards
  smallRow:  { flexDirection: 'row', gap: 10, marginBottom: 22 },
  smallCard: { borderRadius: 18, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  smallIcon: { fontSize: 28, marginBottom: 8 },
  smallTitle:{ color: '#fff', fontSize: 14, fontWeight: '900', marginBottom: 2 },
  smallSub:  { color: '#7c7aaa', fontSize: 10, marginBottom: 8 },
  smallXP:   { color: '#f59e0b', fontSize: 11, fontWeight: '800' },

  // Tasks
  taskHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  tumumTxt:   { color: '#8b5cf6', fontSize: 13, fontWeight: '700' },
  taskCard:   { backgroundColor: '#13132a', borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#2e2b5a', marginBottom: 8 },
  taskTitle:  { color: '#fff', fontSize: 12, fontWeight: '700', marginBottom: 5 },
  taskBarBg:  { height: 5, backgroundColor: '#1e1b3a', borderRadius: 3, marginBottom: 3 },
  taskBarFill:{ height: 5, backgroundColor: '#6c3aed', borderRadius: 3 },
  taskProg:   { color: '#7c7aaa', fontSize: 10 },
  xpBadge:    { backgroundColor: 'rgba(245,158,11,0.15)', borderRadius: 9, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(245,158,11,0.4)' },
  xpBadgeTxt: { color: '#f59e0b', fontSize: 10, fontWeight: '800' },
});
