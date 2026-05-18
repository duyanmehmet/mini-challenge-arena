import { useEffect, useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useUserStore } from '../../src/store/userStore';
import { userService } from '../../src/services/user.service';
import api from '../../src/services/api';
import { Avatar } from '../../src/components/ui/Avatar';

const BG    = '#0d0d1a';
const CARD  = '#13132a';
const PURP  = '#6c3aed';
const PURP2 = '#8b5cf6';
const TEXT  = '#ffffff';
const MUTED = '#7c7aaa';
const GOLD  = '#f59e0b';
const BORDER= '#2e2b5a';

const LEAGUE_ICONS: Record<string, string> = {
  iron: '⚙️', bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '🔷', diamond: '💎', champion: '👑',
};
const LEAGUE_COLORS: Record<string, string> = {
  iron: '#71717a', bronze: '#cd7f32', silver: '#9ca3af', gold: '#f59e0b', platinum: '#38bdf8', diamond: '#06b6d4', champion: '#a78bfa',
};

// ── Basınca küçülen wrapper ───────────────────────────────────────────
function PressCard({ onPress, style, children }: {
  onPress: () => void; style?: any; children: React.ReactNode;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 50, bounciness: 0 }),
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

export default function HomeScreen() {
  const { user, dailyTasks, setDailyTasks, setPersonalBests, updateUser, setBadges, token } = useUserStore();
  const { width } = useWindowDimensions();

  // Responsive kırılma noktaları
  const isTablet  = width >= 768;
  const isDesktop = width >= 1024;
  const pad       = isTablet ? 24 : 16;
  const cardGap   = isTablet ? 14 : 10;

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const xpAnim    = useRef(new Animated.Value(0)).current;

  const [ligInfo, setLigInfo] = useState<any>(null);

  const xpPct = user ? Math.min(user.xp / (user.level * 500), 1) : 0;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
    Animated.timing(xpAnim, { toValue: xpPct, duration: 1200, delay: 400, useNativeDriver: false }).start();
  }, []);

  useFocusEffect(useCallback(() => {
    if (!user) return;
    userService.getDailyTasks().then(setDailyTasks).catch(() => {});
    userService.getProfile().then(({ user: fresh, personalBests: pbs, badges }) => {
      if (fresh && token) updateUser(fresh);
      if (pbs) setPersonalBests(pbs);
      if (badges) setBadges(badges as string[]);
    }).catch(() => {});
    // Lig bilgisi
    api.get('/lig/current').then(r => setLigInfo(r.data)).catch(() => {});
  }, [user?.id]));

  if (!user) return null;

  const xpWidth = xpAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const league  = (user as any).currentLeague ?? 'bronze';

  // Tablet/Desktop'ta 4 mod yan yana, telefonda 2+2
  const bigCardMinH  = isTablet ? 220 : 180;
  const bigFontTitle = isTablet ? 26 : 22;
  const smallFontT   = isTablet ? 17 : 15;
  const avatarSize   = isTablet ? 56 : 44;
  const maxW         = isDesktop ? 800 : undefined;

  return (
    <SafeAreaView style={s.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scroll, maxW ? { alignSelf: 'center', width: '100%', maxWidth: maxW } : undefined]}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ── Header ── */}
          <View style={[s.header, { paddingHorizontal: pad }]}>
            <TouchableOpacity style={s.userRow} onPress={() => router.push('/(tabs)/profile')}>
              <Avatar avatarId={user.avatarId} size={avatarSize} />
              <View style={s.nameBlock}>
                <Text style={[s.greeting, isTablet && { fontSize: 18 }]} numberOfLines={1}>{user.username} 👋</Text>
                <Text style={s.level}>Seviye {user.level}</Text>
                <View style={[s.xpBg, isTablet && { width: 200 }]}>
                  <Animated.View style={[s.xpFill, { width: xpWidth }]} />
                </View>
                <Text style={s.xpTxt}>{user.xp} / {user.level * 500} XP</Text>
              </View>
            </TouchableOpacity>
            <View style={s.headerRight}>
              {user.streakCount > 0 && (
                <View style={s.streak}><Text style={s.streakTxt}>🔥 {user.streakCount}</Text></View>
              )}
              {/* Coin + mağaza butonu */}
              <TouchableOpacity style={s.coinBtn} onPress={() => router.push('/shop' as any)}>
                <Text style={s.coinsTxt}>🪙 {user.coins.toLocaleString('tr-TR')}</Text>
                <View style={s.plusIcon}><Text style={s.plusTxt}>+</Text></View>
              </TouchableOpacity>
              {/* Mesaj butonu */}
              <TouchableOpacity style={s.msgBtn} onPress={() => router.push('/messages' as any)}>
                <Text style={{ fontSize: 20 }}>💬</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Bölüm başlığı ── */}
          <View style={[s.sectionHeader, { paddingHorizontal: pad }]}>
            <Text style={[s.sectionTitle, isTablet && { fontSize: 20 }]}>Oyun Modları</Text>
          </View>

          {/* ── Tablet/Desktop: 4 kart yan yana ── */}
          {isTablet ? (
            <View style={[s.bigRow, { paddingHorizontal: pad, gap: cardGap }]}>
              {/* LİG */}
              <PressCard onPress={() => router.push('/lig' as any)} style={[s.ligCard, { flex: 1, minHeight: bigCardMinH }]}>
                <View style={s.ligBg} />
                <View style={s.ligGlow} />
                <View style={s.ligContent}>
                  <View style={s.ligTopRow}>
                    <Text style={[s.ligIcon, { fontSize: 32 }]}>🏟️</Text>
                    <View style={[s.leagueBadge, { borderColor: (LEAGUE_COLORS[league] ?? '#cd7f32') + '88' }]}>
                      <Text style={{ fontSize: 14 }}>{LEAGUE_ICONS[league] ?? '🥉'}</Text>
                      <Text style={[s.leagueName, { color: LEAGUE_COLORS[league] ?? '#cd7f32', fontSize: 13 }]}>
                        {league.charAt(0).toUpperCase() + league.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <Text style={[s.ligTitle, { fontSize: bigFontTitle }]}>Lig</Text>
                  <Text style={s.ligSub}>{ligInfo ? `Bu hafta: ${ligInfo.category?.name ?? '—'}` : 'Haftalık yarış'}</Text>
                  {ligInfo && <Text style={[s.ligRank, { color: GOLD }]}>#{ligInfo.userRank}. sırada</Text>}
                  <View style={s.ligLives}>
                    {[0, 1, 2].map(i => (
                      <Text key={i} style={{ fontSize: 16, opacity: i < (ligInfo?.livesLeft ?? 3) ? 1 : 0.25 }}>❤️</Text>
                    ))}
                  </View>
                </View>
              </PressCard>

              {/* DÜELLO */}
              <PressCard onPress={() => router.push('/duel/lobby' as any)} style={[s.duelCard, { flex: 1, minHeight: bigCardMinH }]}>
                <View style={s.duelBg} />
                <View style={s.duelGlow} />
                <View style={s.duelContent}>
                  <Text style={[s.duelIcon, { fontSize: 36 }]}>⚔️</Text>
                  <Text style={[s.duelTitle, { fontSize: bigFontTitle }]}>Düello</Text>
                  <Text style={s.duelSub}>Çark · 1'e 1</Text>
                  <View style={s.duelStakes}>
                    <Text style={[s.stakeLabel, { fontSize: 13 }]}>50-2000</Text>
                    <Text style={s.stakeIcon}>🪙</Text>
                  </View>
                </View>
              </PressCard>

              {/* CHALLENGE */}
              <PressCard onPress={() => router.push('/challenge' as any)} style={[s.smallCard, { flex: 1, minHeight: bigCardMinH, justifyContent: 'center' }]}>
                <View style={[s.smallIconBg, { backgroundColor: '#f59e0b22', width: 60, height: 60, borderRadius: 18 }]}>
                  <Text style={{ fontSize: 30 }}>🏆</Text>
                </View>
                <Text style={[s.smallTitle, { fontSize: smallFontT }]}>Challenge</Text>
                <Text style={s.smallSub}>Günlük liderlik</Text>
                <Text style={[s.smallBadge, { color: GOLD }]}>+100 XP</Text>
              </PressCard>

              {/* ANTRENMAN */}
              <PressCard onPress={() => router.push('/antrenman' as any)} style={[s.smallCard, { flex: 1, minHeight: bigCardMinH, justifyContent: 'center' }]}>
                <View style={[s.smallIconBg, { backgroundColor: '#06b6d422', width: 60, height: 60, borderRadius: 18 }]}>
                  <Text style={{ fontSize: 30 }}>📚</Text>
                </View>
                <Text style={[s.smallTitle, { fontSize: smallFontT }]}>Antrenman</Text>
                <Text style={s.smallSub}>Kategori seç</Text>
                <Text style={[s.smallBadge, { color: '#06b6d4' }]}>Serbest oyna</Text>
              </PressCard>
            </View>
          ) : (
            /* ── Telefon: 2 büyük + 2 küçük ── */
            <>
              <View style={[s.bigRow, { paddingHorizontal: pad, gap: cardGap }]}>
                {/* LİG */}
                <PressCard onPress={() => router.push('/lig' as any)} style={[s.ligCard, { minHeight: bigCardMinH }]}>
                  <View style={s.ligBg} />
                  <View style={s.ligGlow} />
                  <View style={s.ligContent}>
                    <View style={s.ligTopRow}>
                      <Text style={s.ligIcon}>🏟️</Text>
                      <View style={[s.leagueBadge, { borderColor: (LEAGUE_COLORS[league] ?? '#cd7f32') + '88' }]}>
                        <Text style={{ fontSize: 12 }}>{LEAGUE_ICONS[league] ?? '🥉'}</Text>
                        <Text style={[s.leagueName, { color: LEAGUE_COLORS[league] ?? '#cd7f32' }]}>
                          {league.charAt(0).toUpperCase() + league.slice(1)}
                        </Text>
                      </View>
                    </View>
                    <Text style={s.ligTitle}>Lig</Text>
                    <Text style={s.ligSub}>{ligInfo ? `Bu hafta: ${ligInfo.category?.name ?? '—'}` : 'Haftalık yarış'}</Text>
                    {ligInfo && <Text style={[s.ligRank, { color: GOLD }]}>#{ligInfo.userRank}. sırada</Text>}
                    <View style={s.ligLives}>
                      {[0, 1, 2].map(i => (
                        <Text key={i} style={{ fontSize: 14, opacity: i < (ligInfo?.livesLeft ?? 3) ? 1 : 0.25 }}>❤️</Text>
                      ))}
                    </View>
                  </View>
                </PressCard>

                {/* DÜELLO */}
                <PressCard onPress={() => router.push('/duel/lobby' as any)} style={[s.duelCard, { minHeight: bigCardMinH }]}>
                  <View style={s.duelBg} />
                  <View style={s.duelGlow} />
                  <View style={s.duelContent}>
                    <Text style={s.duelIcon}>⚔️</Text>
                    <Text style={s.duelTitle}>Düello</Text>
                    <Text style={s.duelSub}>Çark · 1'e 1</Text>
                    <View style={s.duelStakes}>
                      <Text style={s.stakeLabel}>50-2000</Text>
                      <Text style={s.stakeIcon}>🪙</Text>
                    </View>
                    {user.streakCount > 0 && (
                      <Text style={[s.duelStreak, { color: '#f97316' }]}>🔥 {user.streakCount} seri</Text>
                    )}
                  </View>
                </PressCard>
              </View>

              <View style={[s.smallRow, { paddingHorizontal: pad, gap: cardGap }]}>
                <PressCard onPress={() => router.push('/challenge' as any)} style={s.smallCard}>
                  <View style={[s.smallIconBg, { backgroundColor: '#f59e0b22' }]}>
                    <Text style={{ fontSize: 26 }}>🏆</Text>
                  </View>
                  <Text style={s.smallTitle}>Challenge</Text>
                  <Text style={s.smallSub}>Günlük liderlik</Text>
                  <Text style={[s.smallBadge, { color: GOLD }]}>+100 XP</Text>
                </PressCard>

                <PressCard onPress={() => router.push('/antrenman' as any)} style={s.smallCard}>
                  <View style={[s.smallIconBg, { backgroundColor: '#06b6d422' }]}>
                    <Text style={{ fontSize: 26 }}>📚</Text>
                  </View>
                  <Text style={s.smallTitle}>Antrenman</Text>
                  <Text style={s.smallSub}>Kategori seç</Text>
                  <Text style={[s.smallBadge, { color: '#06b6d4' }]}>Serbest oyna</Text>
                </PressCard>
              </View>
            </>
          )}

          {/* ── Günlük görevler ── */}
          {dailyTasks && dailyTasks.length > 0 && (
            <>
              <View style={[s.sectionHeader, { paddingHorizontal: pad }]}>
                <Text style={[s.sectionTitle, isTablet && { fontSize: 20 }]}>Günlük Görevler</Text>
                <TouchableOpacity onPress={() => router.push('/tasks' as any)}>
                  <Text style={s.sectionLink}>Tümü ›</Text>
                </TouchableOpacity>
              </View>
              {dailyTasks.slice(0, isTablet ? 3 : 2).map((task: any, idx: number) => {
                const pct = Math.min(((task.current_value ?? 0) / (task.target_value ?? 1)) * 100, 100);
                const taskIcon = task.task_type?.startsWith('score_history') ? '🏺'
                  : task.task_type?.startsWith('score_science') ? '🔬'
                  : task.task_type?.startsWith('score_sports') ? '⚽'
                  : task.task_type?.startsWith('score_geo') ? '🌍'
                  : task.task_type?.startsWith('score_cinema') ? '🎬'
                  : task.task_type?.startsWith('score_turkey') ? '🇹🇷'
                  : task.task_type?.startsWith('score_economy') ? '📈'
                  : task.task_type?.startsWith('score_art') ? '🎨'
                  : task.task_type?.startsWith('score_medical') ? '🩺'
                  : task.task_type?.startsWith('score_license') ? '🚗'
                  : task.task_type?.startsWith('score_kids') ? '🧒'
                  : task.task_type?.startsWith('play_') ? '🎮'
                  : '🎯';
                return (
                  <View key={task.id ?? idx} style={[s.taskRow, { marginHorizontal: pad }]}>
                    <Text style={{ fontSize: 20 }}>{taskIcon}</Text>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={s.taskTitle} numberOfLines={1}>{task.task_description}</Text>
                      <View style={s.taskProgBg}>
                        <View style={[s.taskProgFill, { width: `${pct}%` }]} />
                      </View>
                      <Text style={[s.taskXpTxt, { color: task.is_completed ? '#22c55e' : MUTED }]}>
                        {task.is_completed ? '✅ Tamamlandı' : `${task.current_value ?? 0} / ${task.target_value}`}
                      </Text>
                    </View>
                    <Text style={s.taskReward}>+{task.xp_reward} XP</Text>
                  </View>
                );
              })}
            </>
          )}

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: BG },
  scroll: { paddingBottom: 40 },

  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, paddingBottom: 10 },
  userRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  nameBlock: { flex: 1, gap: 2 },
  greeting:  { fontFamily: 'Nunito-Bold', fontSize: 15, color: TEXT },
  level:     { fontFamily: 'Nunito-Regular', fontSize: 12, color: MUTED, marginBottom: 4 },
  headerRight: { flexDirection: 'row', gap: 6, alignItems: 'center', marginLeft: 6 },
  streak:    { backgroundColor: '#ff4d0022', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  streakTxt: { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#ff6b35' },
  coinBtn:   { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: GOLD + '22', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 5, borderWidth: 1, borderColor: GOLD + '44' },
  coinsTxt:  { fontFamily: 'Nunito-Bold', fontSize: 12, color: GOLD },
  plusIcon:  { backgroundColor: GOLD, borderRadius: 8, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  plusTxt:   { fontFamily: 'Nunito-ExtraBold', fontSize: 11, color: '#000', lineHeight: 16 },
  msgBtn:    { backgroundColor: PURP + '22', borderRadius: 10, width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: PURP + '44' },

  xpBg:   { height: 4, backgroundColor: '#1e1b3a', borderRadius: 2, overflow: 'hidden', width: 130 },
  xpFill: { height: 4, borderRadius: 2, backgroundColor: PURP2 },
  xpTxt:  { fontFamily: 'Nunito-Regular', fontSize: 10, color: MUTED },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 4 },
  sectionTitle:  { fontFamily: 'Nunito-ExtraBold', fontSize: 17, color: TEXT },
  sectionLink:   { fontFamily: 'Nunito-Regular', fontSize: 13, color: PURP2 },

  // Büyük iki kart
  bigRow:  { flexDirection: 'row', marginBottom: 10 },

  // Lig kartı — overflow:hidden KALDIRILDI (içeriği kırpıyordu)
  ligCard: { flex: 1.2, borderRadius: 22, minHeight: 200 },
  ligBg:   { ...StyleSheet.absoluteFillObject, backgroundColor: '#0a0520', borderRadius: 22 },
  ligGlow: { position: 'absolute', right: -30, top: -30, width: 180, height: 160, borderRadius: 90, backgroundColor: '#4c1d95', opacity: 0.5 },
  ligContent:  { padding: 14, zIndex: 2, gap: 5 },
  ligTopRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ligIcon:     { fontSize: 28 },
  leagueBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 10, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  leagueName:  { fontFamily: 'Nunito-Bold', fontSize: 11 },
  ligTitle:    { fontFamily: 'Nunito-ExtraBold', fontSize: 22, color: TEXT, marginTop: 4 },
  ligSub:      { fontFamily: 'Nunito-Regular', fontSize: 11, color: '#a78bfa' },
  ligRank:     { fontFamily: 'Nunito-ExtraBold', fontSize: 13 },
  ligLives:    { flexDirection: 'row', gap: 4, marginTop: 4, paddingBottom: 4 },

  // Düello kartı — overflow:hidden KALDIRILDI
  duelCard: { flex: 1, borderRadius: 22, minHeight: 200 },
  duelBg:   { ...StyleSheet.absoluteFillObject, backgroundColor: '#0d0520', borderRadius: 22 },
  duelGlow: { position: 'absolute', left: -20, bottom: -20, width: 160, height: 140, borderRadius: 80, backgroundColor: '#7c3aed', opacity: 0.4 },
  duelContent: { flex: 1, padding: 16, zIndex: 2, alignItems: 'flex-start' },
  duelIcon:    { fontSize: 32 },
  duelTitle:   { fontFamily: 'Nunito-ExtraBold', fontSize: 22, color: TEXT, marginTop: 8 },
  duelSub:     { fontFamily: 'Nunito-Regular', fontSize: 11, color: '#a78bfa' },
  duelStakes:  { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 8, backgroundColor: GOLD + '20', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  stakeLabel:  { fontFamily: 'Nunito-Bold', fontSize: 12, color: GOLD },
  stakeIcon:   { fontSize: 12 },
  duelStreak:  { fontFamily: 'Nunito-Bold', fontSize: 11, marginTop: 4 },

  // Küçük iki kart
  smallRow:  { flexDirection: 'row', marginBottom: 20 },
  smallCard: { flex: 1, borderRadius: 18, backgroundColor: CARD, padding: 14, borderWidth: 1, borderColor: BORDER, gap: 4 },
  smallIconBg: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  smallTitle:  { fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: TEXT },
  smallSub:    { fontFamily: 'Nunito-Regular', fontSize: 11, color: MUTED },
  smallBadge:  { fontFamily: 'Nunito-Bold', fontSize: 11, marginTop: 2 },

  // Görevler
  taskRow:      { marginBottom: 8, backgroundColor: CARD, borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  taskTitle:    { fontFamily: 'Nunito-Bold', fontSize: 13, color: TEXT, marginBottom: 4 },
  taskXpTxt:    { fontFamily: 'Nunito-Regular', fontSize: 10, marginTop: 3 },
  taskProgBg:   { height: 4, backgroundColor: '#1e1b3a', borderRadius: 2, overflow: 'hidden' },
  taskProgFill: { height: 4, backgroundColor: PURP2, borderRadius: 2 },
  taskReward:   { fontFamily: 'Nunito-Bold', fontSize: 12, color: GOLD, marginLeft: 10 },
});
