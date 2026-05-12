import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useUserStore } from '../../src/store/userStore';
import { Colors } from '../../src/constants/colors';
import { Avatar } from '../../src/components/ui/Avatar';
import { leaderboardService } from '../../src/services/leaderboard.service';

export default function LeaderboardScreen() {
  const { theme } = useSettingsStore();
  const { user } = useUserStore();
  const C = Colors[theme];
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'alltime'>('weekly');
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await leaderboardService.getGlobal(period);
      setEntries(data);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const s = styles(C);


  return (
    <SafeAreaView style={s.safe}>
      <Text style={s.title}>🏆 Liderlik Tablosu</Text>

      {/* Period tabs */}
      <View style={s.tabs}>
        {(['daily', 'weekly', 'alltime'] as const).map((p) => (
          <TouchableOpacity key={p} style={[s.tab, period === p && { backgroundColor: C.accentRed }]} onPress={() => setPeriod(p)}>
            <Text style={[s.tabText, { color: period === p ? '#fff' : C.textSecondary }]}>
              {p === 'daily' ? 'Günlük' : p === 'weekly' ? 'Haftalık' : 'Tüm Zaman'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={entries}
        refreshing={loading}
        onRefresh={fetchLeaderboard}
        keyExtractor={(item, index) => String(item.username + index)}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListEmptyComponent={
          !loading ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🏆</Text>
              <Text style={[s.username, { color: C.textSecondary, textAlign: 'center' }]}>Henüz kimse yok{'\n'}İlk sen ol!</Text>
            </View>
          ) : null
        }

        renderItem={({ item }) => (
          <View style={[s.row, { backgroundColor: C.bgSecondary, borderColor: C.border }]}>
            <Text style={[s.rank, { color: item.rank <= 3 ? C.accentYellow : C.textSecondary }]}>
              {item.rank <= 3 ? ['🥇','🥈','🥉'][item.rank - 1] : `#${item.rank}`}
            </Text>
            <Avatar avatarId={item.avatarId} size={36} />
            <Text style={[s.username, { color: C.textPrimary }]}>{item.username}</Text>
            <Text style={[s.score, { color: C.accentYellow }]}>{item.score.toLocaleString('tr-TR')}</Text>
          </View>
        )}
        ListFooterComponent={
          user ? (
            <View style={[s.myRow, { backgroundColor: C.accentRed + '22', borderColor: C.accentRed }]}>
              <Text style={[s.rank, { color: C.accentRed }]}>Senin Sıran</Text>
              <Avatar avatarId={user.avatarId} size={36} />
              <Text style={[s.username, { color: C.textPrimary }]}>{user.username}</Text>
              <Text style={[s.score, { color: C.accentYellow }]}>{user.weeklyScore.toLocaleString('tr-TR')}</Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  title: { color: C.textPrimary, fontSize: 22, fontFamily: 'Nunito-ExtraBold', padding: 16, paddingBottom: 8 },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  tab: { flex: 1, borderRadius: 20, paddingVertical: 8, alignItems: 'center', backgroundColor: C.bgSecondary },
  tabText: { fontFamily: 'Nunito-SemiBold', fontSize: 13 },
  row: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, gap: 10 },
  rank: { width: 36, textAlign: 'center', fontFamily: 'Nunito-Bold', fontSize: 14 },
  username: { flex: 1, fontFamily: 'Nunito-Regular', fontSize: 14 },
  score: { fontFamily: 'Nunito-Bold', fontSize: 14 },
  myRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12, marginTop: 8, borderWidth: 1.5, gap: 10 },
});
