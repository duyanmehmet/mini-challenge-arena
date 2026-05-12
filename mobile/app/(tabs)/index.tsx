import { useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
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
  const { user, personalBests, setDailyTasks, setPersonalBests, updateUser, token } = useUserStore();
  const C = Colors[theme];

  useEffect(() => { loadSettings(); }, []);

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
      const { user: fresh, personalBests: pbs } = await userService.getProfile();
      if (fresh && token) updateUser(fresh);
      if (pbs) setPersonalBests(pbs);
    } catch {}
  };

  if (!user) return null;

  const league = LEAGUES.find((l) => l.id === user.currentLeague);
  const s = styles(C);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

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
        <View style={s.actionRow}>
          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: '#f0c040' + '22', borderColor: '#f0c040' }]}
            onPress={() => router.push('/challenge' as any)}
          >
            <Text style={s.actionIcon}>⚡</Text>
            <Text style={[s.actionLabel, { color: '#f0c040' }]}>Günlük{'\n'}Challenge</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: C.accentTeal + '22', borderColor: C.accentTeal }]}
            onPress={() => router.push('/stats' as any)}
          >
            <Text style={s.actionIcon}>📊</Text>
            <Text style={[s.actionLabel, { color: C.accentTeal }]}>İstatistik{'\n'}lerim</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: C.accentPurple + '22', borderColor: C.accentPurple }]}
            onPress={() => router.push('/duel/lobby' as any)}
          >
            <Text style={s.actionIcon}>⚔️</Text>
            <Text style={[s.actionLabel, { color: C.accentPurple }]}>Arkadaşa{'\n'}Düello</Text>
          </TouchableOpacity>
        </View>

        {/* Klasik Tur */}
        <TouchableOpacity
          style={[s.classicBanner, { backgroundColor: '#e94560' }]}
          onPress={() => router.push('/classic' as any)}
          activeOpacity={0.85}
        >
          <Text style={s.classicIcon}>🏆</Text>
          <View>
            <Text style={s.classicTitle}>Klasik Tur</Text>
            <Text style={s.classicSub}>10 soru · 3 can · Karışık kategoriler</Text>
          </View>
          <Text style={{ color: '#fff', fontSize: 22 }}>›</Text>
        </TouchableOpacity>

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
                {cats.map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    cat={cat}
                    C={C}
                    onPress={() => router.push(`/game/select/${cat.id}` as any)}
                  />
                ))}
              </View>
            </View>
          );
        })}

        {/* Günlük Görevler */}
        <DailyTasksSection C={C} s={s} />

      </ScrollView>
    </SafeAreaView>
  );
}

function CategoryCard({ cat, C, onPress }: { cat: CategoryConfig; C: any; onPress: () => void }) {
  return (
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
  classicBanner: { marginHorizontal: 16, marginBottom: 18, borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  classicIcon: { fontSize: 32 },
  classicTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 17, color: '#fff' },
  classicSub: { fontFamily: 'Nunito-Regular', fontSize: 12, color: '#ffffff99' },
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
