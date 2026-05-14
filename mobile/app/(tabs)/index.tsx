import { useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useUserStore } from '../../src/store/userStore';
import { Colors } from '../../src/constants/colors';
import { CATEGORIES, CATEGORY_GROUPS, getCategoriesByGroup, type CategoryConfig } from '../../src/constants/categories';
import { LEAGUES } from '../../src/constants/leagues';
import { Avatar } from '../../src/components/ui/Avatar';
import { XPBar } from '../../src/components/ui/XPBar';
import { CoinDisplay } from '../../src/components/ui/CoinDisplay';
import { userService } from '../../src/services/user.service';

export default function HomeScreen() {
  const { theme, loadSettings } = useSettingsStore();
  const { user, personalBests, setDailyTasks, setPersonalBests, updateUser, setBadges, token } = useUserStore();
  const C = Colors[theme];

  // Sayfa açılış animasyonu
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const slideAnim   = useRef(new Animated.Value(30)).current;

  useEffect(() => { loadSettings(); }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      fetchTasks();
      refreshProfile();
    }, [user?.id])
  );

  const fetchTasks = async () => {
    try { const tasks = await userService.getDailyTasks(); setDailyTasks(tasks); } catch {}
  };

  const refreshProfile = async () => {
    try {
      const { user: fresh, personalBests: pbs, badges } = await userService.getProfile();
      if (fresh && token) updateUser(fresh);
      if (pbs) setPersonalBests(pbs);
      if (badges) setBadges(badges as string[]);
    } catch {}
  };

  if (!user) return null;

  const league = LEAGUES.find((l) => l.id === user.currentLeague);
  const s = styles(C);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {/* Üst Bar */}
        <View style={s.topBar}>
          <TouchableOpacity style={s.userInfo} onPress={() => router.push('/(tabs)/profile')}>
            <Avatar avatarId={user.avatarId} size={40} />
            <View>
              <Text style={[s.username, { color: C.textPrimary }]}>{user.username}</Text>
              <Text style={[s.levelText, { color: C.textSecondary }]}>
                Seviye {user.level} • {league?.icon} {league?.name}
              </Text>
            </View>
          </TouchableOpacity>
          <View style={s.topRight}>
            {user.streakCount > 0 && (
              <View style={[s.streakBadge, { backgroundColor: C.accentRed + '22' }]}>
                <Text style={[s.streakText, { color: C.accentRed }]}>🔥 {user.streakCount}</Text>
              </View>
            )}
            <CoinDisplay amount={user.coins} />
          </View>
        </View>

        {/* XP Bar */}
        <View style={s.xpSection}>
          <XPBar xp={user.xp} level={user.level} />
        </View>

        {/* Hızlı Aksiyonlar */}
        {/* Satır 1: Oyun modları */}
        <View style={s.actionRow}>
          <ActionBtn icon="🏆" label="Klasik Tur" color="#e94560" onPress={() => router.push('/classic' as any)} />
          <ActionBtn icon="🔴" label="Canlı" color="#8e44ad" onPress={() => router.push('/live' as any)} />
          <ActionBtn icon="⚔️" label="Düello" color={C.accentPurple} onPress={() => router.push('/duel/lobby' as any)} />
        </View>

        {/* Satır 2: Özellikler */}
        <View style={[s.actionRow, { marginTop: -4 }]}>
          <ActionBtn icon="📊" label="İstatistik" color={C.accentTeal} onPress={() => router.push('/stats' as any)} />
          <ActionBtn icon="🛡️" label="Klan" color={C.accentTeal} onPress={() => router.push('/clan' as any)} />
          <ActionBtn icon="⭐" label="Battle Pass" color="#f0c040" onPress={() => router.push('/battlepass' as any)} />
          <ActionBtn icon="⚡" label="Challenge" color="#f0c040" onPress={() => router.push('/challenge' as any)} />
        </View>

        {/* Kategoriler — gruplu */}
        {CATEGORY_GROUPS.map((group) => {
          const cats = getCategoriesByGroup(group.id);
          return (
            <View key={group.id} style={s.groupSection}>
              <View style={s.groupHeader}>
                <Text style={s.groupIcon}>{group.icon}</Text>
                <Text style={[s.groupTitle, { color: C.textPrimary }]}>{group.label}</Text>
              </View>
              <View style={s.catsGrid}>
                {cats.map((cat, idx) => (
                  <CategoryCard
                    key={cat.id}
                    cat={cat}
                    C={C}
                    index={idx}
                    onPress={() => router.push(`/game/select/${cat.id}` as any)}
                  />
                ))}
              </View>
            </View>
          );
        })}

        {/* Günlük Görevler */}
        <DailyTasksSection C={C} s={s} />

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CategoryCard({ cat, C, onPress, index = 0 }: { cat: CategoryConfig; C: any; onPress: () => void; index?: number }) {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = index * 40; // stagger — her kart 40ms sonra başlar
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 280, delay, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 70, friction: 8, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles(C).catCard, { borderColor: cat.color + '55', backgroundColor: C.bgSecondary }]}
        onPress={onPress}
        activeOpacity={0.75}
      >
        <View style={[styles(C).catIconBg, { backgroundColor: cat.color + '22' }]}>
          <Text style={styles(C).catIcon}>{cat.icon}</Text>
        </View>
        <Text style={[styles(C).catName, { color: C.textPrimary }]} numberOfLines={2}>
          {cat.name}
        </Text>
        <Text style={[styles(C).catTag, { color: cat.color }]} numberOfLines={1}>
          {cat.questionCount}+ soru
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function DailyTasksSection({ C, s }: any) {
  const { dailyTasks } = useUserStore();
  const done = dailyTasks.filter((t) => t.isCompleted).length;

  return (
    <View style={s.section}>
      <View style={s.sectionHeader}>
        <Text style={[s.sectionTitle, { color: C.textPrimary }]}>📋 Günlük Görevler</Text>
        <Text style={[s.sectionSub, { color: C.textSecondary }]}>{done}/{dailyTasks.length} tamamlandı</Text>
      </View>
      {dailyTasks.length === 0 ? (
        <Text style={[s.emptyText, { color: C.textSecondary }]}>Görevler yükleniyor...</Text>
      ) : (
        dailyTasks.slice(0, 3).map((task: any, i: number) => (
          <View key={i} style={[s.taskRow, { backgroundColor: C.bgSecondary, borderColor: C.border }]}>
            <Text style={{ fontSize: 18 }}>{task.isCompleted ? '✅' : '⭕'}</Text>
            <View style={{ flex: 1, marginHorizontal: 10 }}>
              <Text style={[s.taskDesc, { color: C.textPrimary }]}>{task.description}</Text>
              <View style={[s.taskProgress, { backgroundColor: C.bgTertiary }]}>
                <View style={[s.taskFill, {
                  width: `${Math.min(task.currentValue / task.targetValue, 1) * 100}%`,
                  backgroundColor: task.isCompleted ? C.success : C.accentTeal,
                }]} />
              </View>
            </View>
            <Text style={[s.taskReward, { color: C.accentYellow }]}>🪙{task.coinReward}</Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  scroll: { flex: 1 },
  content: { paddingBottom: 24 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 8 },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  streakBadge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  streakText: { fontFamily: 'Nunito-Bold', fontSize: 13 },
  username: { fontFamily: 'Nunito-Bold', fontSize: 15 },
  levelText: { fontFamily: 'Nunito-Regular', fontSize: 12 },
  xpSection: { paddingHorizontal: 16, marginBottom: 10 },
  actionRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 16 },
  actionBtn: { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1.5 },
  actionIcon: { fontSize: 24, marginBottom: 4 },
  actionLabel: { fontSize: 11, fontFamily: 'Nunito-Bold', textAlign: 'center' },
  quickRow: { flexDirection: 'row', marginHorizontal: 16, gap: 10, marginBottom: 18 },
  quickCard: { flex: 1, borderRadius: 18, padding: 16, alignItems: 'center', gap: 4 },
  quickIcon: { fontSize: 30, marginBottom: 2 },
  quickTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 14, color: '#fff', textAlign: 'center' },
  quickSub: { fontFamily: 'Nunito-Regular', fontSize: 11, color: '#ffffff99', textAlign: 'center' },
  actionBtnInner: { flex: 1, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1.5 },
  actionIconInner: { fontSize: 20, marginBottom: 2 },
  actionLabelInner: { fontSize: 10, fontFamily: 'Nunito-Bold', textAlign: 'center' },
  // Grup
  groupSection: { marginBottom: 8 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10, gap: 8 },
  groupIcon: { fontSize: 20 },
  groupTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 17 },
  catsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10, gap: 10 },
  // Kategori kartı
  catCard: { width: '29%', borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1.5, minWidth: 100 },
  catIconBg: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  catIcon: { fontSize: 26 },
  catName: { fontFamily: 'Nunito-Bold', fontSize: 12, textAlign: 'center', marginBottom: 2 },
  catTag: { fontFamily: 'Nunito-Regular', fontSize: 10, textAlign: 'center' },
  // Görevler
  section: { paddingHorizontal: 16, marginTop: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontFamily: 'Nunito-Bold', fontSize: 16 },
  sectionSub: { fontFamily: 'Nunito-Regular', fontSize: 13 },
  emptyText: { fontSize: 14, fontFamily: 'Nunito-Regular' },
  taskRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1 },
  taskDesc: { fontFamily: 'Nunito-Regular', fontSize: 13, marginBottom: 4 },
  taskProgress: { height: 4, borderRadius: 2, overflow: 'hidden' },
  taskFill: { height: '100%', borderRadius: 2 },
  taskReward: { fontFamily: 'Nunito-Bold', fontSize: 13 },
});

function ActionBtn({ icon, label, color, onPress }: {
  icon: string; label: string; color: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[{
        flex: 1, borderRadius: 12, padding: 10, alignItems: 'center',
        borderWidth: 1.5, backgroundColor: color + '18', borderColor: color,
      }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={{ fontSize: 20, marginBottom: 2 }}>{icon}</Text>
      <Text style={{ fontSize: 10, fontFamily: 'Nunito-Bold', color, textAlign: 'center' }}>{label}</Text>
    </TouchableOpacity>
  );
}
