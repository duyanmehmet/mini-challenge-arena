import { useEffect, useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, Animated, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useUserStore } from '../../src/store/userStore';
import { userService } from '../../src/services/user.service';
import { arenaService, type ArenaStatus } from '../../src/services/arena.service';
import { CATEGORIES } from '../../src/constants/categories';
import { Avatar } from '../../src/components/ui/Avatar';

const { width } = Dimensions.get('window');

const BG    = '#0d0d1a';
const CARD  = '#13132a';
const PURP  = '#6c3aed';
const PURP2 = '#8b5cf6';
const TEXT  = '#ffffff';
const MUTED = '#7c7aaa';
const GOLD  = '#f59e0b';
const GREEN = '#10b981';
const CYAN  = '#06b6d4';
const RED   = '#ef4444';
const BLUE  = '#3b82f6';
const PINK  = '#ec4899';

const CARD_W = (width - 48) / 3;
const HOME_CATS = ['economy', 'history', 'science', 'sports'];

// ── Sosyal ticker mesajları ──────────────────────────────────────
const TICKER = [
  '🔥 Ahmet Ş. canlı modda oynuyor',
  '⚔️ Zeynep K. seni geçti — 2.450 puan',
  '🏆 Bugün 12.345 kişi oynadı',
  '💡 Mehmet Y. düello serisini kırdı',
  '⭐ Yeni haftalık sezon başladı!',
  '🎯 Canlı turnuva 21:00\'de başlıyor',
  '🥇 Elif S. bu haftanın lideri',
];

// ── Basınca küçülen kart sarmalayıcısı ──────────────────────────
function PressCard({ onPress, style, children }: {
  onPress: () => void; style?: any; children: React.ReactNode;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, speed: 50, bounciness: 0 }),
      Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 20 }),
    ]).start();
    onPress();
  };
  return (
    <TouchableOpacity onPress={press} activeOpacity={1}>
      <Animated.View style={[{ transform: [{ scale }] }, style]}>{children}</Animated.View>
    </TouchableOpacity>
  );
}

// ── Canlı yeşil nokta (pulse) ────────────────────────────────────
function LiveDot() {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.8, duration: 700, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1,   duration: 700, useNativeDriver: true }),
    ])).start();
  }, []);
  return (
    <View style={{ width: 10, height: 10, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{
        position: 'absolute', width: 10, height: 10, borderRadius: 5,
        backgroundColor: GREEN, opacity: 0.35, transform: [{ scale: pulse }],
      }} />
      <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: GREEN }} />
    </View>
  );
}

// ── Arka plan partikülleri ────────────────────────────────────────
function BgParticle({ x, y, size, delay, color }: {
  x: number; y: number; size: number; delay: number; color: string;
}) {
  const op = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.timing(op, { toValue: 0.5, duration: 2500, useNativeDriver: true }),
      Animated.timing(op, { toValue: 0,   duration: 2500, useNativeDriver: true }),
    ])).start();
  }, []);
  return (
    <Animated.View style={{
      position: 'absolute', left: x, top: y,
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: color, opacity: op,
    }} />
  );
}

// ── Sosyal ticker ─────────────────────────────────────────────────
function SocialTicker() {
  const [idx, setIdx] = useState(0);
  const fadeA = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const timer = setInterval(() => {
      Animated.timing(fadeA, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
        setIdx(i => (i + 1) % TICKER.length);
        Animated.timing(fadeA, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      });
    }, 3500);
    return () => clearInterval(timer);
  }, []);
  return (
    <View style={tick.wrap}>
      <View style={tick.dot} />
      <Animated.Text style={[tick.txt, { opacity: fadeA }]} numberOfLines={1}>
        {TICKER[idx]}
      </Animated.Text>
    </View>
  );
}
const tick = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12, gap: 8 },
  dot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: GREEN },
  txt:  { fontFamily: 'Nunito-Regular', fontSize: 12, color: MUTED, flex: 1 },
});

// ── Ana sayfa ─────────────────────────────────────────────────────
export default function HomeScreen() {
  const { user, dailyTasks, setDailyTasks, setPersonalBests, updateUser, setBadges, token } = useUserStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const xpAnim   = useRef(new Animated.Value(0)).current;

  const xpPct = user ? Math.min(user.xp / (user.level * 500), 1) : 0;
  const [arenaStatus, setArenaStatus] = useState<ArenaStatus | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
    Animated.timing(xpAnim, { toValue: xpPct, duration: 1200, delay: 400, useNativeDriver: false }).start();
    arenaService.getStatus().then(setArenaStatus).catch(() => {});
  }, []);

  useFocusEffect(useCallback(() => {
    if (!user) return;
    userService.getDailyTasks().then(setDailyTasks).catch(() => {});
    userService.getProfile().then(({ user: fresh, personalBests: pbs, badges }) => {
      if (fresh && token) updateUser(fresh);
      if (pbs) setPersonalBests(pbs);
      if (badges) setBadges(badges as string[]);
    }).catch(() => {});
  }, [user?.id]));

  if (!user) return null;

  const tasksTotal = dailyTasks.length || 3;
  const tasksDone  = dailyTasks.filter(t => t.isCompleted).length;
  const showCats   = CATEGORIES.filter(c => HOME_CATS.includes(c.id));

  const xpWidth = xpAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <SafeAreaView style={s.root}>
      {/* Arka plan partikülleri */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <BgParticle x={20}         y={180} size={80} delay={0}    color="#6c3aed" />
        <BgParticle x={width - 80} y={320} size={60} delay={1200} color="#8b5cf6" />
        <BgParticle x={width / 2}  y={500} size={40} delay={600}  color="#3b82f6" />
        <BgParticle x={30}         y={620} size={50} delay={900}  color="#6c3aed" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ── Header ── */}
          <View style={s.header}>
            <TouchableOpacity style={s.userRow} onPress={() => router.push('/(tabs)/profile')}>
              <Avatar avatarId={user.avatarId} size={44} />
              <View style={s.nameBlock}>
                <Text style={s.greeting} numberOfLines={1}>{user.username} 👋</Text>
                <Text style={s.level}>Seviye {user.level}</Text>
                <View style={s.xpBg}>
                  <Animated.View style={[s.xpFill, { width: xpWidth }]} />
                </View>
                <Text style={s.xpTxt}>{user.xp} / {user.level * 500} XP</Text>
              </View>
            </TouchableOpacity>
            <View style={s.badges}>
              {user.streakCount > 0 && (
                <View style={s.streak}><Text style={s.streakTxt}>🔥 {user.streakCount}</Text></View>
              )}
              <View style={s.coins}><Text style={s.coinsTxt}>🪙 {user.coins.toLocaleString('tr-TR')}</Text></View>
            </View>
          </View>

          {/* ── Arena Countdown Kartı ── */}
          {arenaStatus && <ArenaCard status={arenaStatus} onPress={() => router.push('/live' as any)} />}

          {/* ── Sosyal Ticker ── */}
          <SocialTicker />

          {/* ── Bugünün Meydanı (büyük, parlak, hareketli) ── */}
          <FeaturedCard onPress={() => router.push('/challenge' as any)} />

          {/* ── Oyun Modları ── */}
          <View style={s.row3}>
            <RichCard icon="🔴" title="Canlı"     iconBg="#10b981"
              onPress={() => router.push('/live' as any)}>
              <View style={s.liveRow}><LiveDot /><Text style={s.richInfo}>1.245 aktif</Text></View>
              <Text style={s.richMeta}>Ödül: 5.000 🪙</Text>
            </RichCard>
            <RichCard icon="🏆" title="Klasik"    iconBg="#f59e0b"
              onPress={() => router.push('/classic' as any)}>
              <Text style={s.richInfo}>16 kategori</Text>
              <Text style={s.richMeta}>+50 XP bonus</Text>
            </RichCard>
            <RichCard icon="⚔️" title="Düello"   iconBg="#8b5cf6"
              onPress={() => router.push('/duel/lobby' as any)}>
              <Text style={s.richInfo}>234 online</Text>
              <Text style={s.richMeta}>🔥 {user.streakCount || 0} seri</Text>
            </RichCard>
          </View>

          {/* ── Yardımcı Özellikler ── */}
          <View style={s.row3}>
            <RichCard icon="📊" title="İstatistik" iconBg="#06b6d4"
              onPress={() => router.push('/stats' as any)}>
              <Text style={s.richMeta}>Geçmişi gör</Text>
            </RichCard>
            <RichCard icon="📋" title="Görevler"   iconBg="#3b82f6"
              onPress={() => router.push('/tasks' as any)}>
              <View style={s.taskMiniBar}>
                <View style={[s.taskMiniFill, { width: `${(tasksDone / tasksTotal) * 100}%`, backgroundColor: '#3b82f6' }]} />
              </View>
              <Text style={s.richMeta}>{tasksDone}/{tasksTotal} tamam</Text>
            </RichCard>
            <RichCard icon="🎖️" title="Batta Pas" iconBg="#ec4899"
              onPress={() => router.push('/battlepass' as any)}>
              <Text style={s.richInfo}>Sezon 1</Text>
              <Text style={s.richMeta}>Tier {Math.floor(user.xp / 200) + 1}</Text>
            </RichCard>
          </View>

          {/* ── Challenge Banner ── */}
          <ChallengeCard onPress={() => router.push('/challenge' as any)} />

          {/* ── Kategoriler ── */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Kategoriler</Text>
            <TouchableOpacity onPress={() => router.push('/kategoriler' as any)}>
              <Text style={s.sectionLink}>Tümünü Gör ›</Text>
            </TouchableOpacity>
          </View>

          <View style={s.catsRow}>
            {showCats.map(cat => (
              <PressCard
                key={cat.id}
                onPress={() => router.push(`/game/select/${cat.id}` as any)}
                style={[s.catCard, { borderColor: cat.color + '55' }]}
              >
                <View style={[s.catIconBg, { backgroundColor: cat.color + '22' }]}>
                  <Text style={{ fontSize: 24 }}>{cat.icon}</Text>
                </View>
                <Text style={s.catName}>{cat.shortName}</Text>
                <Text style={[s.catCount, { color: cat.color }]}>{cat.questionCount}+</Text>
              </PressCard>
            ))}
          </View>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Büyük Featured Kart (Bugünün Meydanı) ───────────────────────
function FeaturedCard({ onPress }: { onPress: () => void }) {
  const glow  = useRef(new Animated.Value(0.7)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1,   duration: 1600, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0.7, duration: 1600, useNativeDriver: true }),
    ])).start();
  }, []);

  const press = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50, bounciness: 0 }),
      Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 20 }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity onPress={press} activeOpacity={1} style={{ marginHorizontal: 16, marginBottom: 14 }}>
      <Animated.View style={[fc.card, { transform: [{ scale }] }]}>
        {/* Arka plan glow */}
        <View style={fc.bgDark} />
        <Animated.View style={[fc.bgGlow, { opacity: glow }]} />

        {/* İçerik */}
        <View style={fc.left}>
          <View style={fc.badge}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#fbbf24' }} />
            <Text style={fc.badgeTxt}>GÜNLÜK GÖREV</Text>
          </View>
          <Text style={fc.title}>Bugünün{'\n'}Meydanı</Text>
          <Text style={fc.sub}>Challenge'ı tamamla, ödülünü kap!</Text>
          <TouchableOpacity style={fc.btn} onPress={press}>
            <Text style={fc.btnTxt}>▶ Oyna</Text>
          </TouchableOpacity>
        </View>

        {/* Kupa */}
        <AnimatedTrophy />
      </Animated.View>
    </TouchableOpacity>
  );
}

const fc = StyleSheet.create({
  card: { borderRadius: 24, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', minHeight: 140 },
  bgDark: { ...StyleSheet.absoluteFillObject, backgroundColor: '#120b2e' },
  bgGlow: { position: 'absolute', right: -30, top: -40, width: 250, height: 200, borderRadius: 125, backgroundColor: '#5b21b6', opacity: 0.4 },
  left:   { flex: 1, padding: 20, gap: 6, zIndex: 2 },
  badge:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  badgeTxt: { fontFamily: 'Nunito-Bold', fontSize: 10, color: '#fbbf24', letterSpacing: 1 },
  title:  { fontFamily: 'Nunito-ExtraBold', fontSize: 22, color: TEXT, lineHeight: 28 },
  sub:    { fontFamily: 'Nunito-Regular', fontSize: 12, color: '#a78bfa', lineHeight: 18 },
  btn:    { backgroundColor: PURP, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10, alignSelf: 'flex-start', marginTop: 4,
            shadowColor: PURP2, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.6, shadowRadius: 8, elevation: 6 },
  btnTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 14, color: TEXT },
});

// ── Zengin GameCard ───────────────────────────────────────────────
function RichCard({ icon, title, iconBg, onPress, children }: {
  icon: string; title: string; iconBg: string;
  onPress: () => void; children?: React.ReactNode;
}) {
  return (
    <PressCard onPress={onPress} style={s.gameCard}>
      {/* Sadece ikon arka planı renkli — kategori kartlarındaki gibi */}
      <View style={[s.gameIconBg, { backgroundColor: iconBg + '30' }]}>
        <Text style={{ fontSize: 26 }}>{icon}</Text>
      </View>
      <Text style={s.gameTitle}>{title}</Text>
      <View style={{ gap: 2, alignItems: 'center' }}>{children}</View>
    </PressCard>
  );
}

// ── Challenge Banner ──────────────────────────────────────────────
/* ── Arena Countdown Kartı ── */
function ArenaCard({ status, onPress }: { status: ArenaStatus; onPress: () => void }) {
  const glow  = useRef(new Animated.Value(0.6)).current;
  const [secs, setSecs] = useState(status.secondsUntil ?? 0);

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1,   duration: 800, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0.6, duration: 800, useNativeDriver: true }),
    ])).start();
    if (status.phase === 'waiting') {
      const iv = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
      return () => clearInterval(iv);
    }
  }, []);

  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const sec = secs % 60;
  const timeStr = h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

  const isActive = status.phase === 'active';

  return (
    <PressCard onPress={onPress} style={ar.card}>
      <View style={ar.bgDark} />
      <Animated.View style={[ar.bgGlow, { opacity: glow, backgroundColor: isActive ? '#ef4444' : '#f97316' }]} />
      <View style={ar.left}>
        <View style={ar.badge}>
          <Animated.View style={[ar.dot, { opacity: glow, backgroundColor: isActive ? '#ef4444' : '#f97316' }]} />
          <Text style={[ar.badgeTxt, { color: isActive ? '#ef4444' : '#f97316' }]}>
            {isActive ? '🔴 CANLI ARENA AKTIF' : '⚔️ ZEKA ARENASI'}
          </Text>
        </View>
        {isActive ? (
          <>
            <Text style={ar.mainTxt}>Arena Devam Ediyor!</Text>
            <Text style={ar.subTxt}>👥 {status.participants} oyuncu aktif</Text>
          </>
        ) : (
          <>
            <Text style={ar.mainTxt}>Başlıyor: {timeStr}</Text>
            <Text style={ar.subTxt}>Saat {status.nextHourTR}:00 — Yerini al!</Text>
          </>
        )}
        <TouchableOpacity style={[ar.btn, { backgroundColor: isActive ? '#ef4444' : '#f97316' }]} onPress={onPress}>
          <Text style={ar.btnTxt}>{isActive ? '▶ Katıl!' : '🔔 Hatırlat'}</Text>
        </TouchableOpacity>
      </View>
      <Text style={ar.emoji}>⚔️</Text>
    </PressCard>
  );
}

const ar = StyleSheet.create({
  card:    { marginHorizontal: 16, marginBottom: 14, borderRadius: 20, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', minHeight: 110 },
  bgDark:  { ...StyleSheet.absoluteFillObject, backgroundColor: '#110005' },
  bgGlow:  { position: 'absolute', right: -30, top: -30, width: 200, height: 180, borderRadius: 100 },
  left:    { flex: 1, padding: 16, gap: 4, zIndex: 2 },
  badge:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot:     { width: 6, height: 6, borderRadius: 3 },
  badgeTxt:{ fontFamily: 'Nunito-ExtraBold', fontSize: 10, letterSpacing: 1 },
  mainTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 18, color: '#ffffff' },
  subTxt:  { fontFamily: 'Nunito-Regular', fontSize: 12, color: '#9ca3af' },
  btn:     { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7, alignSelf: 'flex-start', marginTop: 4 },
  btnTxt:  { fontFamily: 'Nunito-ExtraBold', fontSize: 12, color: '#fff' },
  emoji:   { fontSize: 56, marginRight: 16, zIndex: 2 },
});

function ChallengeCard({ onPress }: { onPress: () => void }) {
  const glow = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1,   duration: 1800, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0.5, duration: 1800, useNativeDriver: true }),
    ])).start();
  }, []);

  return (
    <PressCard onPress={onPress} style={cc.card}>
      <View style={cc.bgBase} />
      <Animated.View style={[cc.bgGlow, { opacity: glow }]} />
      {[{ t: 8, l: 80 }, { t: 20, l: 130 }, { t: 5, l: 170 }, { t: 35, l: 100 }, { t: 15, l: 210 }, { t: 40, l: 250 }].map((p, i) => (
        <View key={i} style={[cc.star, { top: p.t, left: p.l, width: i % 2 ? 3 : 2, height: i % 2 ? 3 : 2 }]} />
      ))}
      <View style={cc.left}>
        <Text style={cc.title}>Challenge</Text>
        <Text style={cc.sub}>Zorlu rakiplerle yarış,{'\n'}sıralamaya gir!</Text>
        <TouchableOpacity style={cc.btn} onPress={onPress}>
          <Text style={cc.btnTxt}>Katıl</Text>
        </TouchableOpacity>
      </View>
      <View style={cc.figureWrap}>
        <Animated.View style={[cc.aura, { opacity: glow }]} />
        <View style={cc.imgClip}>
          <Image
            source={require('../../assets/images/challenge-figure.png')}
            style={cc.figureImg}
            resizeMode="cover"
          />
        </View>
      </View>
    </PressCard>
  );
}

const cc = StyleSheet.create({
  card:       { marginHorizontal: 16, marginBottom: 16, height: 120, borderRadius: 20, overflow: 'hidden', flexDirection: 'row', alignItems: 'center' },
  bgBase:     { ...StyleSheet.absoluteFillObject, backgroundColor: '#0c0620' },
  bgGlow:     { position: 'absolute', right: -20, top: -30, width: 220, height: 180, borderRadius: 110, backgroundColor: '#5b21b6' },
  bgStars:    { ...StyleSheet.absoluteFillObject },
  star:       { position: 'absolute', borderRadius: 2, backgroundColor: '#c4b5fd', opacity: 0.5 },
  left:       { flex: 1, paddingLeft: 20, paddingVertical: 18, gap: 4, zIndex: 2 },
  title:      { fontFamily: 'Nunito-ExtraBold', fontSize: 18, color: '#ffffff' },
  sub:        { fontFamily: 'Nunito-Regular', fontSize: 11, color: '#c4b5fd', lineHeight: 17 },
  btn:        { backgroundColor: '#6c3aed', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7, alignSelf: 'flex-start', marginTop: 4 },
  btnTxt:     { fontFamily: 'Nunito-ExtraBold', fontSize: 12, color: '#fff' },
  figureWrap: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  aura:       { position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: '#7c3aed', opacity: 0.2 },
  imgClip:    { width: 110, height: 110, overflow: 'hidden', borderRadius: 8 },
  figureImg:  { width: 110, height: 160, top: -10 },
});

// ── Kupa + Yıldızlar ─────────────────────────────────────────────
function StarPop({ size, top, left, right, delay }: { size: number; top?: number; left?: number; right?: number; delay: number }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.timing(a, { toValue: 1,   duration: 600, useNativeDriver: true }),
      Animated.timing(a, { toValue: 0.3, duration: 600, useNativeDriver: true }),
    ])).start();
  }, []);
  return (
    <Animated.Text style={{ position: 'absolute', fontSize: size, top, left, right, opacity: a, transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.2] }) }] }}>⭐</Animated.Text>
  );
}

function AnimatedTrophy() {
  const bounce = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(bounce, { toValue: -7, duration: 900, useNativeDriver: true }),
      Animated.timing(bounce, { toValue: 0,  duration: 900, useNativeDriver: true }),
    ])).start();
  }, []);
  return (
    <View style={{ width: 110, height: 140, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <StarPop size={16} top={0}  left={8}   delay={0}   />
      <StarPop size={11} top={12} right={6}  delay={200} />
      <StarPop size={14} top={-4} left={50}  delay={400} />
      <StarPop size={10} top={40} left={0}   delay={300} />
      <StarPop size={12} bottom={40} right={4} delay={500} />
      <Animated.Text style={{ fontSize: 70, transform: [{ translateY: bounce }] }}>🏆</Animated.Text>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: BG },
  scroll: { paddingBottom: 30 },

  // Header
  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  userRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  nameBlock: { flex: 1, gap: 2 },
  greeting:  { fontFamily: 'Nunito-Bold', fontSize: 15, color: TEXT },
  level:     { fontFamily: 'Nunito-Regular', fontSize: 12, color: MUTED, marginBottom: 4 },
  badges:    { flexDirection: 'row', gap: 8, alignItems: 'center', marginLeft: 8 },
  streak:    { backgroundColor: '#ff4d0022', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  streakTxt: { fontFamily: 'Nunito-Bold', fontSize: 13, color: '#ff6b35' },
  coins:     { backgroundColor: '#f59e0b22', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  coinsTxt:  { fontFamily: 'Nunito-Bold', fontSize: 13, color: GOLD },

  // XP — animasyonlu
  xpBg:   { height: 4, backgroundColor: '#1e1b3a', borderRadius: 2, overflow: 'hidden', width: 140 },
  xpFill: { height: 4, borderRadius: 2, backgroundColor: PURP2 },
  xpTxt:  { fontFamily: 'Nunito-Regular', fontSize: 10, color: MUTED },
  xpWrap: { gap: 4 },

  // 3'lü satır
  row3: { flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 10 },

  // Zengin kart
  gameCard:   { width: CARD_W, borderRadius: 18, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#2e2b5a', gap: 5, backgroundColor: CARD },
  gameGlow:   { position: 'absolute', width: CARD_W, height: CARD_W, borderRadius: CARD_W / 2, top: -20, opacity: 0.06 },
  gameIconBg: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  gameTitle:  { fontFamily: 'Nunito-ExtraBold', fontSize: 12, color: TEXT, textAlign: 'center' },
  liveRow:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  richInfo:   { fontFamily: 'Nunito-Bold', fontSize: 10, textAlign: 'center' },
  richMeta:   { fontFamily: 'Nunito-Regular', fontSize: 9, color: MUTED, textAlign: 'center' },
  taskMiniBar: { width: 50, height: 3, backgroundColor: '#1e1b3a', borderRadius: 2, overflow: 'hidden', marginBottom: 2 },
  taskMiniFill:{ height: 3, borderRadius: 2 },

  // Kategoriler
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10, marginTop: 4 },
  sectionTitle:  { fontFamily: 'Nunito-ExtraBold', fontSize: 17, color: TEXT },
  sectionLink:   { fontFamily: 'Nunito-Regular', fontSize: 13, color: PURP2 },
  catsRow:   { flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 8 },
  catCard:   { flex: 1, borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1.5, backgroundColor: CARD, gap: 5 },
  catIconBg: { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  catName:   { fontFamily: 'Nunito-ExtraBold', fontSize: 11, color: TEXT, textAlign: 'center' },
  catCount:  { fontFamily: 'Nunito-Regular', fontSize: 10, textAlign: 'center' },
});
