/**
 * Ana Ekran — store bağlantılı, özel navbar yok (tab bar kullanılıyor)
 */
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Dimensions, Animated, Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useUserStore } from '../../src/store/userStore';
import { userService } from '../../src/services/user.service';
import api from '../../src/services/api';
import { Avatar } from '../../src/components/ui/Avatar';
import { Colors } from '../../src/constants/theme';

const { width: W } = Dimensions.get('window');
const LEAGUE_ICONS: Record<string, string> = {
  filiz:'🌱',kaya:'🪨',demir:'🔩',celik:'⚔️',bronz:'🥉',
  gumus:'🥈',altin:'🥇',safir:'🔵',zumrut:'💚',elmas:'💎',
  platin:'🔷',kristal:'🌟',mistik:'🔮',ay:'🌙',gunes:'☀️',
  simsek:'⚡',alev:'🔥',okyanus:'🌊',zirve:'🏔️',kartal:'🦅',
  ejderha:'🐉',galaksi:'🌌',nova:'💫',efsane:'🦄',kral:'👑',
  yildiz:'⭐',meteor:'🌠',zafer:'🏆',elit:'🎯',sampiyon:'🏅',
};
const LEAGUE_COLORS: Record<string, string> = {
  filiz:'#86efac',kaya:'#a8a29e',demir:'#94a3b8',celik:'#64748b',bronz:'#cd7f32',
  gumus:'#9ca3af',altin:'#f59e0b',safir:'#3b82f6',zumrut:'#22c55e',elmas:'#06b6d4',
  platin:'#38bdf8',kristal:'#e2e8f0',mistik:'#a855f7',ay:'#c4b5fd',gunes:'#fbbf24',
  simsek:'#facc15',alev:'#f97316',okyanus:'#0ea5e9',zirve:'#e2e8f0',kartal:'#854d0e',
  ejderha:'#dc2626',galaksi:'#6366f1',nova:'#f0abfc',efsane:'#e879f9',kral:'#fde047',
  yildiz:'#fef08a',meteor:'#fb923c',zafer:'#f59e0b',elit:'#f43f5e',sampiyon:'#a78bfa',
};

// ─── STREAK ALEV ─────────────────────────────────────────────────
const StreakBadge: React.FC<{ count: number }> = ({ count }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const glow  = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(scale, { toValue: 1.16, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(glow,  { toValue: 1,    duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ]),
      Animated.parallel([
        Animated.timing(scale, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(glow,  { toValue: 0, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ]),
    ])).start();
  }, []);
  const bgOp = glow.interpolate({ inputRange: [0, 1], outputRange: [0.05, 0.2] });
  return (
    <View style={s.streakWrap}>
      <Animated.View style={[StyleSheet.absoluteFill, s.streakGlow, { opacity: bgOp }]} />
      <Animated.Text style={[s.streakEmoji, { transform: [{ scale }] }]}>🔥</Animated.Text>
      <Text style={s.streakNum}>{count}</Text>
    </View>
  );
};

// ─── KOİN ────────────────────────────────────────────────────────
const CoinBadge: React.FC<{ amount: number; onPress: () => void }> = ({ amount, onPress }) => {
  const sc = useRef(new Animated.Value(1)).current;
  const [floaters, setFloaters] = useState<{ id: number; val: number }[]>([]);
  const nid = useRef(0);
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
    const id = nid.current++;
    setFloaters(p => [...p, { id, val: Math.floor(Math.random() * 50) + 10 }]);
    Animated.sequence([
      Animated.timing(sc, { toValue: 1.18, duration: 100, useNativeDriver: true }),
      Animated.spring(sc, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setFloaters(p => p.filter(x => x.id !== id)), 1000);
  };
  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8} style={s.coinWrap}>
      <Animated.View style={[s.coinBadge, { transform: [{ scale: sc }] }]}>
        <Text style={s.coinEmoji}>🪙</Text>
        <Text style={s.coinText}>{amount.toLocaleString('tr-TR')}</Text>
        <View style={s.coinPlus}><Text style={s.coinPlusText}>+</Text></View>
      </Animated.View>
      {floaters.map(f => <FloatingNum key={f.id} value={f.val} />)}
    </TouchableOpacity>
  );
};
const FloatingNum: React.FC<{ value: number }> = ({ value }) => {
  const y = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(y, { toValue: -52, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.sequence([Animated.delay(400), Animated.timing(op, { toValue: 0, duration: 500, useNativeDriver: true })]),
    ]).start();
  }, []);
  return <Animated.Text style={[s.floatNum, { transform: [{ translateY: y }], opacity: op }]}>+{value}</Animated.Text>;
};

// ─── ANİMASYONLU KART ────────────────────────────────────────────
const AnimCard: React.FC<{ delay: number; children: React.ReactNode; style?: object; onPress?: () => void }> = ({ delay, children, style, onPress }) => {
  const ty = useRef(new Animated.Value(70)).current;
  const op = useRef(new Animated.Value(0)).current;
  const sc = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(ty, { toValue: 0, duration: 450, delay, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true }),
      Animated.timing(op, { toValue: 1, duration: 320, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  const pressIn  = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Animated.spring(sc, { toValue: 0.95, tension: 80, friction: 7, useNativeDriver: true }).start(); };
  const pressOut = () => Animated.spring(sc, { toValue: 1, tension: 80, friction: 7, useNativeDriver: true }).start();
  return (
    <Animated.View style={[{ transform: [{ translateY: ty }, { scale: sc }], opacity: op }, style]}>
      <TouchableOpacity onPress={onPress} onPressIn={pressIn} onPressOut={pressOut} activeOpacity={1}>{children}</TouchableOpacity>
    </Animated.View>
  );
};

// ─── DÖNEN GLOW HALKA ────────────────────────────────────────────
const GlowRing: React.FC = () => {
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.loop(Animated.timing(rot, { toValue: 1, duration: 4500, easing: Easing.linear, useNativeDriver: true })).start(); }, []);
  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View pointerEvents="none" style={[s.glowRing, { transform: [{ rotate }] }]}>
      <View style={s.glowArc1} /><View style={s.glowArc2} />
    </Animated.View>
  );
};

// ─── KILIC ÇARPIŞMA ───────────────────────────────────────────────
const SwordClash: React.FC = () => {
  const lx = useRef(new Animated.Value(-55)).current;
  const rx = useRef(new Animated.Value(55)).current;
  const sparkSc = useRef(new Animated.Value(0)).current;
  const sparkOp = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = () => {
      lx.setValue(-55); rx.setValue(55); sparkSc.setValue(0); sparkOp.setValue(0);
      Animated.sequence([
        Animated.parallel([
          Animated.timing(lx, { toValue: -3, duration: 340, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }),
          Animated.timing(rx, { toValue: 3,  duration: 340, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.spring(sparkSc, { toValue: 1, tension: 200, friction: 5, useNativeDriver: true }),
          Animated.timing(sparkOp, { toValue: 1, duration: 80, useNativeDriver: true }),
        ]),
        Animated.delay(550),
        Animated.parallel([
          Animated.timing(sparkOp, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(lx, { toValue: -55, duration: 280, easing: Easing.in(Easing.quad), useNativeDriver: true }),
          Animated.timing(rx, { toValue: 55,  duration: 280, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        ]),
        Animated.delay(1100),
      ]).start(loop);
    };
    loop();
  }, []);
  return (
    <View style={s.swordRow}>
      <Animated.Text style={[s.sword, { transform: [{ translateX: lx }, { scaleX: -1 }] }]}>⚔️</Animated.Text>
      <Animated.View style={[s.spark, { transform: [{ scale: sparkSc }], opacity: sparkOp }]}><Text style={{ fontSize: 20 }}>✨</Text></Animated.View>
      <Animated.Text style={[s.sword, { transform: [{ translateX: rx }] }]}>⚔️</Animated.Text>
    </View>
  );
};

// ─── ANA EKRAN ────────────────────────────────────────────────────
export default function HomeScreen() {
  const { user, dailyTasks, setDailyTasks, setPersonalBests, updateUser, setBadges, token } = useUserStore();
  const [ligInfo,    setLigInfo]    = useState<any>(null);
  const [unreadMsgs, setUnreadMsgs] = useState(0);
  const headerOp = useRef(new Animated.Value(0)).current;
  const headerY  = useRef(new Animated.Value(-18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOp, { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.timing(headerY,  { toValue: 0, duration: 380, easing: Easing.out(Easing.quad), useNativeDriver: true }),
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
    api.get('/messages/unread/count').then(r => setUnreadMsgs(r.data?.count ?? 0)).catch(() => {});
  }, [user?.id]));

  if (!user) return null;

  const league      = (user as any).currentLeague ?? 'bronz';
  const leagueColor = LEAGUE_COLORS[league] ?? '#cd7f32';
  const leagueIcon  = LEAGUE_ICONS[league]  ?? '🥉';
  const hearts      = Array.from({ length: 5 }, (_, i) => i < (ligInfo?.hearts ?? 5) ? '❤️' : '🖤');

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <Animated.View style={[s.header, { opacity: headerOp, transform: [{ translateY: headerY }] }]}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
            <View style={s.avatar}>
              <Avatar avatarId={user.avatarId} size={38} />
              <View style={s.lvlBadge}><Text style={s.lvlTxt}>{user.level}</Text></View>
            </View>
          </TouchableOpacity>
          <View style={s.headerRight}>
            {user.streakCount > 0 && <StreakBadge count={user.streakCount} />}
            <CoinBadge amount={user.coins} onPress={() => router.push('/shop' as any)} />
            <TouchableOpacity style={s.msgBtn} onPress={() => router.push('/messages' as any)}>
              <Text style={{ fontSize: 20 }}>💬</Text>
              {unreadMsgs > 0 && (
                <View style={s.msgBadge}><Text style={s.msgBadgeTxt}>{unreadMsgs > 9 ? '9+' : unreadMsgs}</Text></View>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.Text style={[s.sectionTitle, { opacity: headerOp }]}>Oyun Modları</Animated.Text>

        {/* BIG CARDS */}
        <View style={s.bigRow}>
          {/* LİG */}
          <AnimCard delay={80} style={s.halfWrap} onPress={() => router.push('/lig' as any)}>
            <View style={[s.bigCard, { backgroundColor: '#3b1fa3' }]}>
              <GlowRing />
              <View style={[s.ligBadge, { borderColor: leagueColor + '88' }]}>
                <Text>{leagueIcon}</Text>
                <Text style={[s.ligBadgeTxt, { color: leagueColor }]}>{league.charAt(0).toUpperCase() + league.slice(1)}</Text>
              </View>
              <Text style={s.bigCardIcon}>🏟️</Text>
              <Text style={s.bigCardTitle}>Lig</Text>
              <Text style={s.bigCardSub}>{ligInfo?.category?.name ?? 'Haftalık yarış'}</Text>
              {ligInfo && <Text style={s.ligRank}>#{ligInfo.userRank}. sıradasın</Text>}
              <Text style={s.heartsRow}>{hearts.join('')}</Text>
            </View>
          </AnimCard>

          {/* DÜELLO */}
          <AnimCard delay={190} style={s.halfWrap} onPress={() => router.push('/duel/lobby' as any)}>
            <View style={[s.bigCard, { backgroundColor: '#4a1880' }]}>
              <SwordClash />
              <Text style={s.bigCardTitle}>Düello</Text>
              <Text style={s.bigCardSub}>Çark · 1'e 1</Text>
              <View style={s.duelCoinBadge}><Text style={s.duelCoinTxt}>50-2000 🪙</Text></View>
              {user.streakCount > 0 && <Text style={s.duelStreak}>🔥 {user.streakCount} seri</Text>}
            </View>
          </AnimCard>
        </View>

        {/* SMALL CARDS */}
        <View style={s.bigRow}>
          <AnimCard delay={290} style={s.halfWrap} onPress={() => router.push('/challenge' as any)}>
            <View style={s.smallCard}>
              <Text style={s.smallIcon}>🎯</Text>
              <Text style={s.smallTitle}>Challenge</Text>
              <Text style={s.smallSub}>Günlük liderlik</Text>
              <Text style={s.smallXP}>+100 XP</Text>
            </View>
          </AnimCard>
          <AnimCard delay={390} style={s.halfWrap} onPress={() => router.push('/antrenman' as any)}>
            <View style={s.smallCard}>
              <Text style={s.smallIcon}>📚</Text>
              <Text style={s.smallTitle}>Antrenman</Text>
              <Text style={s.smallSub}>Kategori seç</Text>
              <Text style={[s.smallXP, { color: Colors.blue }]}>Serbest oyna</Text>
            </View>
          </AnimCard>
        </View>

        {/* GÜNLÜK GÖREVLER */}
        {dailyTasks && dailyTasks.length > 0 && (
          <>
            <AnimCard delay={470} style={{ marginTop: 20 }}>
              <View style={s.taskHeader}>
                <Text style={s.sectionTitle}>Günlük Görevler</Text>
                <TouchableOpacity onPress={() => router.push('/tasks' as any)}>
                  <Text style={s.tumumBtn}>Tümü ›</Text>
                </TouchableOpacity>
              </View>
            </AnimCard>
            {dailyTasks.slice(0, 2).map((task: any, i: number) => (
              <AnimCard key={task.id ?? i} delay={530 + i * 60} style={{ marginTop: 10 }}>
                <View style={s.taskCard}>
                  <Text style={s.taskIcon}>{task.task_type?.startsWith('play') ? '🎮' : '🎯'}</Text>
                  <View style={s.taskInfo}>
                    <Text style={s.taskTitle} numberOfLines={1}>{task.task_description}</Text>
                    <View style={s.taskBarBg}>
                      <View style={[s.taskBarFill, { width: `${Math.min(((task.current_value ?? 0) / (task.target_value ?? 1)) * 100, 100)}%` as any }]} />
                    </View>
                    <Text style={s.taskProg}>{task.current_value ?? 0} / {task.target_value}</Text>
                  </View>
                  <View style={s.taskXPBadge}><Text style={s.taskXPTxt}>+{task.xp_reward} XP</Text></View>
                </View>
              </AnimCard>
            ))}
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_H = 200;
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 40 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.card, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  lvlBadge: { position: 'absolute', bottom: -4, right: -4, backgroundColor: Colors.purple, borderRadius: 8, paddingHorizontal: 4, paddingVertical: 1 },
  lvlTxt: { color: Colors.white, fontSize: 9, fontWeight: '800' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  streakWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  streakGlow: { backgroundColor: Colors.gold, borderRadius: 20 },
  streakEmoji: { fontSize: 16, marginRight: 3 },
  streakNum: { color: Colors.white, fontWeight: '800', fontSize: 14 },

  coinWrap: { position: 'relative', alignItems: 'center' },
  coinBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#12102a', borderRadius: 18, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1.5, borderColor: Colors.gold, gap: 4 },
  coinEmoji: { fontSize: 14 },
  coinText: { color: Colors.white, fontWeight: '800', fontSize: 12 },
  coinPlus: { width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center' },
  coinPlusText: { color: '#000', fontWeight: '900', fontSize: 12, lineHeight: 16 },
  floatNum: { position: 'absolute', top: -4, color: Colors.gold, fontWeight: '900', fontSize: 13, zIndex: 99 },
  msgBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  msgBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#ef4444', borderRadius: 9, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3, borderWidth: 2, borderColor: Colors.bg },
  msgBadgeTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 9, color: Colors.white },

  sectionTitle: { color: Colors.white, fontSize: 17, fontWeight: '800', marginBottom: 8 },
  bigRow: { flexDirection: 'row', gap: 10, marginTop: 4, marginBottom: 10 },
  halfWrap: { flex: 1 },

  bigCard: { borderRadius: 22, padding: 14, minHeight: CARD_H, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, position: 'relative' },
  bigCardIcon: { fontSize: 32, marginBottom: 5 },
  bigCardTitle: { color: Colors.white, fontSize: 20, fontWeight: '900', marginBottom: 2 },
  bigCardSub: { color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: '600', marginBottom: 6 },

  ligBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(245,158,11,0.18)', borderRadius: 9, paddingHorizontal: 7, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 7, borderWidth: 1 },
  ligBadgeTxt: { fontSize: 9, fontWeight: '800' },
  ligRank: { color: Colors.gold, fontSize: 12, fontWeight: '800', marginBottom: 4 },
  heartsRow: { fontSize: 13, letterSpacing: 1 },

  duelCoinBadge: { backgroundColor: 'rgba(245,158,11,0.18)', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, marginTop: 5, borderWidth: 1, borderColor: Colors.gold, alignSelf: 'center' },
  duelCoinTxt: { color: Colors.gold, fontWeight: '800', fontSize: 11 },
  duelStreak: { color: Colors.white, fontSize: 11, fontWeight: '700', marginTop: 4, textAlign: 'center', opacity: 0.9 },

  smallCard: { backgroundColor: Colors.card, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: Colors.border },
  smallIcon: { fontSize: 28, marginBottom: 6 },
  smallTitle: { color: Colors.white, fontSize: 14, fontWeight: '800', marginBottom: 2 },
  smallSub: { color: Colors.muted, fontSize: 10, fontWeight: '500', marginBottom: 6 },
  smallXP: { color: Colors.gold, fontSize: 11, fontWeight: '800' },

  glowRing: { position: 'absolute', width: 160, height: 160, borderRadius: 80, top: -40, right: -40, alignItems: 'center', justifyContent: 'center' },
  glowArc1: { position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 2.5, borderColor: 'rgba(139,92,246,0.3)', borderTopColor: 'rgba(245,158,11,0.6)' },
  glowArc2: { position: 'absolute', width: 110, height: 110, borderRadius: 55, borderWidth: 1.5, borderColor: 'rgba(139,92,246,0.18)', borderBottomColor: 'rgba(139,92,246,0.4)' },

  swordRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 44, marginBottom: 4, width: '100%' },
  sword: { fontSize: 24 },
  spark: { position: 'absolute', zIndex: 10 },

  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tumumBtn: { color: Colors.purpleLight, fontSize: 13, fontWeight: '700' },
  taskCard: { backgroundColor: Colors.card, borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, gap: 10 },
  taskIcon: { fontSize: 22 },
  taskInfo: { flex: 1 },
  taskTitle: { color: Colors.white, fontSize: 12, fontWeight: '700', marginBottom: 5 },
  taskBarBg: { height: 5, backgroundColor: '#1e1e3a', borderRadius: 3, marginBottom: 3 },
  taskBarFill: { height: 5, backgroundColor: Colors.purple, borderRadius: 3 },
  taskProg: { color: Colors.muted, fontSize: 10 },
  taskXPBadge: { backgroundColor: 'rgba(245,158,11,0.15)', borderRadius: 9, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1, borderColor: Colors.gold },
  taskXPTxt: { color: Colors.gold, fontSize: 10, fontWeight: '800' },
});
