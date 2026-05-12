import { useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useUserStore } from '../../src/store/userStore';
import { Colors } from '../../src/constants/colors';
import { GAME_MODES } from '../../src/constants/gameModes';
import { LEAGUES } from '../../src/constants/leagues';
import { ModeCard } from '../../src/components/shared/ModeCard';
import { Avatar } from '../../src/components/ui/Avatar';
import { XPBar } from '../../src/components/ui/XPBar';
import { CoinDisplay } from '../../src/components/ui/CoinDisplay';

import { userService } from '../../src/services/user.service';

export default function HomeScreen() {
  const { theme, loadSettings } = useSettingsStore();
  const { user, personalBests, setDailyTasks, setPersonalBests, updateUser, token } = useUserStore();
  const C = Colors[theme];

  useEffect(() => {
    loadSettings();
  }, []);

  // Oyun sonrası geri dönünce profil + görevler yenile
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      fetchTasks();
      refreshProfile();
    }, [user?.id])
  );

  const fetchTasks = async () => {
    try {
      const tasks = await userService.getDailyTasks();
      setDailyTasks(tasks);
    } catch {}
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

  const handleModePress = (modeId: string) => {
    router.push(`/game/select/${modeId}` as any);
  };

  const s = styles(C);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Üst Bar */}
        <View style={s.topBar}>
          <TouchableOpacity style={s.userInfo} onPress={() => router.push('/(tabs)/profile')}>
            <Avatar avatarId={user.avatarId} size={40} />
            <View style={s.userText}>
              <Text style={s.username}>{user.username}</Text>
              <Text style={s.levelText}>Seviye {user.level} • {league?.icon} {league?.name}</Text>
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
          <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#f0c040' + '22', borderColor: '#f0c040' }]} onPress={() => router.push('/challenge' as any)}>
            <Text style={s.actionIcon}>⚡</Text>
            <Text style={[s.actionLabel, { color: '#f0c040' }]}>Günün{'\n'}Challenge'ı</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionBtn, { backgroundColor: C.accentTeal + '22', borderColor: C.accentTeal }]} onPress={() => router.push('/stats' as any)}>
            <Text style={s.actionIcon}>📊</Text>
            <Text style={[s.actionLabel, { color: C.accentTeal }]}>İstatistik{'\n'}lerim</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionBtn, { backgroundColor: C.accentPurple + '22', borderColor: C.accentPurple }]} onPress={() => router.push('/(tabs)/friends' as any)}>
            <Text style={s.actionIcon}>⚔️</Text>
            <Text style={[s.actionLabel, { color: C.accentPurple }]}>Arkadaşa{'\n'}Düello</Text>
          </TouchableOpacity>
        </View>

        {/* Başlık + Hızlı Oyna */}
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Oyun Modları</Text>
            <Text style={[s.headerSub, { color: C.textSecondary }]}>Bir mod seç ve oynamaya başla!</Text>
          </View>
          <TouchableOpacity
            style={[s.quickPlay, { backgroundColor: C.accentRed }]}
            onPress={() => {
              const random = GAME_MODES[Math.floor(Math.random() * GAME_MODES.length)];
              handleModePress(random.id);
            }}
          >
            <Text style={s.quickPlayIcon}>⚡</Text>
            <Text style={s.quickPlayText}>Şansıma</Text>
          </TouchableOpacity>
        </View>

        {/* Mod Kartları — 2 sütun */}
        <View style={s.modesGrid}>
          {GAME_MODES.map((mode) => {
            const pb = personalBests.find((p) => p.mode === mode.id);
            return (
              <ModeCard
                key={mode.id}
                mode={mode}
                personalBest={pb?.score}
                onPress={() => handleModePress(mode.id)}
              />
            );
          })}
        </View>

        {/* Günlük Görevler Özeti */}
        <DailyTasksSection C={C} s={s} />

      </ScrollView>
    </SafeAreaView>
  );
}

function DailyTasksSection({ C, s }: any) {
  const { dailyTasks } = useUserStore();
  const done = dailyTasks.filter((t) => t.isCompleted).length;

  return (
    <View style={s.section}>
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>📋 Günlük Görevler</Text>
        <Text style={[s.sectionSub, { color: C.textSecondary }]}>{done}/{dailyTasks.length} tamamlandı</Text>
      </View>

      {dailyTasks.length === 0 ? (
        <Text style={[s.emptyText, { color: C.textSecondary }]}>Görevler yükleniyor...</Text>
      ) : (
        dailyTasks.slice(0, 3).map((task, i) => (
          <View key={i} style={[s.taskRow, { backgroundColor: C.bgSecondary, borderColor: C.border }]}>
            <Text style={{ fontSize: 18 }}>{task.isCompleted ? '✅' : '⭕'}</Text>
            <View style={{ flex: 1, marginHorizontal: 10 }}>
              <Text style={[s.taskDesc, { color: C.textPrimary }]}>{task.description}</Text>
              <View style={[s.taskProgress, { backgroundColor: C.bgTertiary }]}>
                <View style={[
                  s.taskFill,
                  {
                    width: `${Math.min(task.currentValue / task.targetValue, 1) * 100}%`,
                    backgroundColor: task.isCompleted ? C.success : C.accentTeal,
                  }
                ]} />
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
  userText: {},
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  streakText: { fontFamily: 'Nunito-Bold', fontSize: 13 },
  username: { color: C.textPrimary, fontFamily: 'Nunito-Bold', fontSize: 15 },
  levelText: { color: C.textSecondary, fontFamily: 'Nunito-Regular', fontSize: 12 },
  xpSection: { paddingHorizontal: 16, marginBottom: 10 },
  actionRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 14 },
  actionBtn: { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1.5 },
  actionIcon: { fontSize: 24, marginBottom: 4 },
  actionLabel: { fontSize: 11, fontFamily: 'Nunito-Bold', textAlign: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  headerTitle: { color: C.textPrimary, fontFamily: 'Nunito-ExtraBold', fontSize: 20 },
  headerSub: { fontFamily: 'Nunito-Regular', fontSize: 12, marginTop: 2 },
  quickPlay: { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center' },
  quickPlayIcon: { fontSize: 20, marginBottom: 2 },
  quickPlayText: { color: '#fff', fontFamily: 'Nunito-Bold', fontSize: 11 },
  modesGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 6, marginBottom: 8 },
  section: { paddingHorizontal: 16, marginTop: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { color: C.textPrimary, fontFamily: 'Nunito-Bold', fontSize: 16 },
  sectionSub: { fontFamily: 'Nunito-Regular', fontSize: 13 },
  emptyText: { fontSize: 14, fontFamily: 'Nunito-Regular' },
  taskRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1 },
  taskDesc: { fontFamily: 'Nunito-Regular', fontSize: 13, marginBottom: 4 },
  taskProgress: { height: 4, borderRadius: 2, overflow: 'hidden' },
  taskFill: { height: '100%', borderRadius: 2 },
  taskReward: { fontFamily: 'Nunito-Bold', fontSize: 13 },
});
