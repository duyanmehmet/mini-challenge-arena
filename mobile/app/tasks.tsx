import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
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

const TASK_ICONS: Record<string, string> = {
  play_count:     '🎮',
  score_any:      '⭐',
  score_history:  '🏺',
  score_science:  '🔬',
  score_sports:   '⚽',
  score_geography:'🌍',
  score_cinema:   '🎬',
  score_general:  '💡',
  score_turkey:   '🇹🇷',
  score_economy:  '📈',
  score_art:      '🎨',
  score_medical:  '🩺',
  score_license:  '🚗',
  score_kids:     '🧒',
  word_count:     '📝',
};

export default function TasksScreen() {
  const [tasks,   setTasks]   = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    setError(false);
    api.get('/daily-tasks/today')
      .then(r => {
        setTasks(r.data ?? []);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []));

  const completedCount = tasks.filter(t => t.is_completed).length;
  const allDone = tasks.length > 0 && completedCount === tasks.length;

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.back}>← Geri</Text>
        </TouchableOpacity>
        <Text style={s.title}>Günlük Görevler</Text>
        <View style={{ width: 70 }} />
      </View>

      {/* Özet */}
      <View style={s.summaryBar}>
        <Text style={s.summaryTxt}>
          {allDone ? '🎉 Tüm görevleri tamamladın!' : `${completedCount}/${tasks.length} tamamlandı`}
        </Text>
        <View style={s.track}>
          <View style={[s.trackFill, {
            width: tasks.length ? `${(completedCount / tasks.length) * 100}%` as any : '0%',
            backgroundColor: allDone ? '#22c55e' : '#6c3aed',
          }]} />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color="#6c3aed" size="large" style={{ marginTop: 60 }} />
      ) : error ? (
        <View style={s.emptyWrap}>
          <Text style={{ fontSize: 48 }}>⚠️</Text>
          <Text style={s.emptyTitle}>Bağlantı Hatası</Text>
          <Text style={s.emptySub}>Backend'e bağlanılamadı. Sunucunun çalıştığından emin ol.</Text>
        </View>
      ) : tasks.length === 0 ? (
        <View style={s.emptyWrap}>
          <Text style={{ fontSize: 48 }}>📋</Text>
          <Text style={s.emptyTitle}>Görev Bulunamadı</Text>
          <Text style={s.emptySub}>Görevler yüklenemedi. Çıkıp tekrar gir.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>
          {tasks.map(task => {
            const pct  = Math.min((task.current_value / task.target_value) * 100, 100);
            const icon = TASK_ICONS[task.task_type] ?? '🎯';
            return (
              <View key={task.id ?? task.task_type} style={[s.card, task.is_completed && s.cardDone]}>
                <View style={s.cardTop}>
                  <View style={[s.iconWrap, { backgroundColor: task.is_completed ? '#d1fae5' : '#ede9fe' }]}>
                    <Text style={{ fontSize: 22 }}>{task.is_completed ? '✅' : icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.desc, task.is_completed && { color: '#6b7280' }]} numberOfLines={2}>
                      {task.task_description}
                    </Text>
                    <View style={s.barBg}>
                      <View style={[s.barFill, {
                        width: `${pct}%` as any,
                        backgroundColor: task.is_completed ? '#22c55e' : '#6c3aed',
                      }]} />
                    </View>
                    <Text style={s.progress}>
                      {task.current_value.toLocaleString('tr-TR')} / {task.target_value.toLocaleString('tr-TR')}
                    </Text>
                  </View>
                </View>

                <View style={s.rewards}>
                  <View style={s.rewardChip}>
                    <Text style={s.rewardTxt}>🪙 +{task.coin_reward}</Text>
                  </View>
                  <View style={[s.rewardChip, { backgroundColor: '#e0f2fe' }]}>
                    <Text style={[s.rewardTxt, { color: '#0284c7' }]}>⚡ +{task.xp_reward} XP</Text>
                  </View>
                  {task.is_completed && (
                    <View style={[s.rewardChip, { backgroundColor: '#d1fae5' }]}>
                      <Text style={[s.rewardTxt, { color: '#059669' }]}>Tamamlandı ✓</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}

          <View style={s.infoBox}>
            <Text style={s.infoTxt}>
              💡 Görevler her gün sıfırlanır. Lig, Antrenman ve Challenge oynayarak görevleri tamamla!
            </Text>
          </View>
          <View style={{ height: 20 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#ffffff' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  back:   { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#fff', backgroundColor: '#6c3aed', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, overflow: 'hidden' },
  title:  { fontFamily: 'Nunito-ExtraBold', fontSize: 18, color: '#111827' },

  summaryBar: { paddingHorizontal: 16, paddingVertical: 12, gap: 8, backgroundColor: '#f9fafb', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  summaryTxt: { fontFamily: 'Nunito-Bold', fontSize: 13, color: '#374151' },
  track:      { height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, overflow: 'hidden' },
  trackFill:  { height: 6, borderRadius: 3 },

  list: { padding: 16, gap: 12 },

  emptyWrap:  { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32 },
  emptyTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 18, color: '#111827' },
  emptySub:   { fontFamily: 'Nunito-Regular', fontSize: 14, color: '#9ca3af', textAlign: 'center', lineHeight: 22 },

  card: { backgroundColor: '#fff', borderRadius: 18, padding: 14, gap: 12, borderWidth: 1, borderColor: '#f3f4f6', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  cardDone: { borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' },

  cardTop:  { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  iconWrap: { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  desc:     { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#111827', marginBottom: 8, lineHeight: 20 },
  barBg:    { height: 6, backgroundColor: '#f3f4f6', borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  barFill:  { height: 6, borderRadius: 3 },
  progress: { fontFamily: 'Nunito-Regular', fontSize: 11, color: '#9ca3af' },

  rewards:    { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  rewardChip: { backgroundColor: '#fef9c3', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  rewardTxt:  { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#d97706' },

  infoBox: { backgroundColor: '#f9fafb', borderRadius: 14, padding: 14, marginTop: 4 },
  infoTxt: { fontFamily: 'Nunito-Regular', fontSize: 12, color: '#6b7280', textAlign: 'center', lineHeight: 18 },
});
