import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useSettingsStore } from '../src/store/settingsStore';
import { Colors } from '../src/constants/colors';
import api from '../src/services/api';

interface DailyTask {
  id: string;
  task_description: string;
  task_type: string;
  current_value: number;
  target_value: number;
  coin_reward: number;
  xp_reward: number;
  is_completed: boolean;
}

export default function TasksScreen() {
  const { theme } = useSettingsStore();
  const C = Colors[theme];
  const s = styles(C);

  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    api.get('/daily-tasks/today')
      .then(r => setTasks(r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []));

  const completedCount = tasks.filter(t => t.is_completed).length;
  const allDone = tasks.length > 0 && completedCount === tasks.length;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={[s.back, { color: C.textSecondary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[s.title, { color: C.textPrimary }]}>📋 Günlük Görevler</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Özet */}
      <View style={[s.summaryBar, { backgroundColor: C.bgSecondary }]}>
        <Text style={[s.summaryText, { color: C.textSecondary }]}>
          {allDone ? '🎉 Tüm görevleri tamamladın!' : `${completedCount}/${tasks.length} tamamlandı`}
        </Text>
        <View style={[s.progressTrack, { backgroundColor: C.bgTertiary }]}>
          <View style={[s.progressFill, {
            backgroundColor: allDone ? C.success : C.accentTeal,
            width: tasks.length ? `${(completedCount / tasks.length) * 100}%` : '0%',
          }]} />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={C.accentTeal} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} showsVerticalScrollIndicator={false}>
          {tasks.map((task) => {
            const pct = Math.min((task.current_value / task.target_value) * 100, 100);
            return (
              <View key={task.id} style={[s.card, {
                backgroundColor: C.bgSecondary,
                borderColor: task.is_completed ? C.success : C.border,
                borderWidth: task.is_completed ? 1.5 : 1,
                opacity: task.is_completed ? 0.75 : 1,
              }]}>
                <View style={s.cardTop}>
                  <Text style={[s.cardDesc, { color: C.textPrimary }]}>
                    {task.is_completed ? '✅ ' : '🎯 '}{task.task_description}
                  </Text>
                </View>

                {/* Progress bar */}
                <View style={[s.bar, { backgroundColor: C.bgTertiary }]}>
                  <View style={[s.barFill, {
                    width: `${pct}%`,
                    backgroundColor: task.is_completed ? C.success : C.accentTeal,
                  }]} />
                </View>
                <View style={s.cardBottom}>
                  <Text style={[s.progress, { color: C.textSecondary }]}>
                    {task.current_value.toLocaleString('tr-TR')} / {task.target_value.toLocaleString('tr-TR')}
                  </Text>
                  <View style={s.rewards}>
                    <Text style={[s.reward, { color: '#f0c040' }]}>🪙 +{task.coin_reward}</Text>
                    <Text style={[s.reward, { color: C.accentTeal }]}>⚡ +{task.xp_reward} XP</Text>
                  </View>
                </View>
              </View>
            );
          })}

          {tasks.length === 0 && (
            <View style={{ alignItems: 'center', marginTop: 60, gap: 12 }}>
              <Text style={{ fontSize: 48 }}>📋</Text>
              <Text style={[s.cardDesc, { color: C.textSecondary, textAlign: 'center' }]}>
                Görevler yüklenemedi.{'\n'}İnternet bağlantını kontrol et.
              </Text>
            </View>
          )}

          <View style={[s.infoBox, { backgroundColor: C.bgSecondary }]}>
            <Text style={[s.infoText, { color: C.textSecondary }]}>
              💡 Görevler her gün sıfırlanır. Kategorileri oynayarak görevleri tamamla ve ödüllerini kazan!
            </Text>
          </View>
          <View style={{ height: 20 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  safe:         { flex: 1, backgroundColor: C.bgPrimary },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  back:         { fontSize: 22 },
  title:        { fontFamily: 'Nunito-ExtraBold', fontSize: 18 },
  summaryBar:   { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  summaryText:  { fontFamily: 'Nunito-Bold', fontSize: 13 },
  progressTrack:{ height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  card:         { borderRadius: 16, padding: 16, gap: 10 },
  cardTop:      { flexDirection: 'row', alignItems: 'flex-start' },
  cardDesc:     { fontFamily: 'Nunito-Bold', fontSize: 14, flex: 1, lineHeight: 20 },
  bar:          { height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill:      { height: '100%', borderRadius: 4 },
  cardBottom:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progress:     { fontFamily: 'Nunito-Regular', fontSize: 12 },
  rewards:      { flexDirection: 'row', gap: 10 },
  reward:       { fontFamily: 'Nunito-Bold', fontSize: 13 },
  infoBox:      { borderRadius: 14, padding: 14 },
  infoText:     { fontFamily: 'Nunito-Regular', fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
