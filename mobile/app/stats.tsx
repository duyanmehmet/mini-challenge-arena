import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSettingsStore } from '../src/store/settingsStore';
import { useUserStore } from '../src/store/userStore';
import { Colors } from '../src/constants/colors';
import { CATEGORIES as GAME_MODES } from '../src/constants/categories';
import { LEAGUES } from '../src/constants/leagues';
import { XPBar } from '../src/components/ui/XPBar';
import api from '../src/services/api';

export default function StatsScreen() {
  const { theme } = useSettingsStore();
  const { user, personalBests, badges } = useUserStore();
  const C = Colors[theme];
  const [dailyRank, setDailyRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const league = LEAGUES.find((l) => l.id === user?.currentLeague);

  useEffect(() => {
    api.get('/challenge/today').then((res) => {
      // Günün challenge sırası
      api.get('/leaderboard/my-rank?period=weekly').then((r) => {
        setDailyRank(r.data?.rank ?? null);
      }).catch(() => {});
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (!user) return null;
  const s = styles(C);

  const totalBests = personalBests.reduce((sum, p) => sum + p.score, 0);
  const bestMode = personalBests.reduce((best, p) => (!best || p.score > best.score ? p : best), null as any);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Text style={[s.backText, { color: C.textSecondary }]}>← Geri</Text>
        </TouchableOpacity>
        <Text style={[s.title, { color: C.textPrimary }]}>📊 İstatistikler</Text>

        {/* Profil özeti */}
        <View style={[s.card, { backgroundColor: C.bgSecondary }]}>
          <View style={s.cardRow}>
            <View style={s.stat}>
              <Text style={[s.statNum, { color: C.accentRed }]}>{user.level}</Text>
              <Text style={[s.statLabel, { color: C.textSecondary }]}>Seviye</Text>
            </View>
            <View style={s.stat}>
              <Text style={[s.statNum, { color: C.accentYellow }]}>{user.streakCount}</Text>
              <Text style={[s.statLabel, { color: C.textSecondary }]}>🔥 Seri</Text>
            </View>
            <View style={s.stat}>
              <Text style={[s.statNum, { color: C.accentTeal }]}>{badges.length}</Text>
              <Text style={[s.statLabel, { color: C.textSecondary }]}>Rozet</Text>
            </View>
            <View style={s.stat}>
              <Text style={[s.statNum, { color: C.accentGreen }]}>{league?.icon}</Text>
              <Text style={[s.statLabel, { color: C.textSecondary }]}>{league?.name}</Text>
            </View>
          </View>
          <View style={{ marginTop: 12 }}>
            <XPBar xp={user.xp} level={user.level} />
          </View>
        </View>

        {/* Haftalık sıra */}
        {dailyRank && (
          <View style={[s.rankCard, { backgroundColor: C.accentRed + '15', borderColor: C.accentRed }]}>
            <Text style={[s.rankIcon]}>🏆</Text>
            <View>
              <Text style={[s.rankTitle, { color: C.textPrimary }]}>Bu Hafta #{dailyRank}</Text>
              <Text style={[s.rankSub, { color: C.textSecondary }]}>Haftalık sıralama</Text>
            </View>
            <Text style={[s.weekScore, { color: C.accentYellow }]}>{user.weeklyScore.toLocaleString('tr-TR')}</Text>
          </View>
        )}

        {/* Mod bazlı en yüksek skorlar */}
        <Text style={[s.sectionTitle, { color: C.textPrimary }]}>🎮 Mod Rekorları</Text>
        {GAME_MODES.map((mode) => {
          const pb = personalBests.find((p) => p.mode === mode.id);
          return (
            <View key={mode.id} style={[s.modeRow, { backgroundColor: C.bgSecondary, borderColor: mode.color + '44' }]}>
              <View style={[s.modeIcon, { backgroundColor: mode.color + '22' }]}>
                <Text style={{ fontSize: 20 }}>{mode.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.modeName, { color: C.textPrimary }]}>{mode.shortName}</Text>
                <Text style={[s.modeTag, { color: C.textSecondary }]}>{mode.questionCount}+ soru</Text>
              </View>
              <Text style={[s.modeScore, { color: pb ? C.accentYellow : C.textSecondary }]}>
                {pb ? pb.score.toLocaleString('tr-TR') : '—'}
              </Text>
            </View>
          );
        })}

        {/* Toplam */}
        <View style={[s.totalCard, { backgroundColor: C.bgTertiary }]}>
          <Text style={[s.totalLabel, { color: C.textSecondary }]}>Toplam Rekor Puanı</Text>
          <Text style={[s.totalNum, { color: C.accentYellow }]}>{totalBests.toLocaleString('tr-TR')}</Text>
          {bestMode && (
            <Text style={[s.bestMode, { color: C.textSecondary }]}>
              En iyi mod: {GAME_MODES.find((m) => m.id === bestMode.mode)?.shortName}
            </Text>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  back: { padding: 16, paddingBottom: 4 },
  backText: { fontFamily: 'Nunito-Regular', fontSize: 15 },
  title: { fontSize: 22, fontFamily: 'Nunito-ExtraBold', paddingHorizontal: 16, marginBottom: 12 },
  card: { marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 12 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 24, fontFamily: 'Nunito-ExtraBold' },
  statLabel: { fontSize: 11, fontFamily: 'Nunito-Regular', marginTop: 2 },
  rankCard: { marginHorizontal: 16, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, marginBottom: 16 },
  rankIcon: { fontSize: 28 },
  rankTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 16 },
  rankSub: { fontFamily: 'Nunito-Regular', fontSize: 12 },
  weekScore: { marginLeft: 'auto', fontFamily: 'Nunito-ExtraBold', fontSize: 18 },
  sectionTitle: { paddingHorizontal: 16, fontFamily: 'Nunito-Bold', fontSize: 16, marginBottom: 8 },
  modeRow: { marginHorizontal: 16, marginBottom: 6, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1 },
  modeIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  modeName: { fontFamily: 'Nunito-Bold', fontSize: 14 },
  modeTag: { fontFamily: 'Nunito-Regular', fontSize: 11 },
  modeScore: { fontFamily: 'Nunito-ExtraBold', fontSize: 16 },
  totalCard: { margin: 16, borderRadius: 14, padding: 16, alignItems: 'center' },
  totalLabel: { fontFamily: 'Nunito-Regular', fontSize: 13, marginBottom: 4 },
  totalNum: { fontFamily: 'Nunito-ExtraBold', fontSize: 32 },
  bestMode: { fontFamily: 'Nunito-Regular', fontSize: 12, marginTop: 6 },
});
