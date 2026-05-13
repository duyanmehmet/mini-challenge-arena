import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSettingsStore } from '../src/store/settingsStore';
import { useUserStore } from '../src/store/userStore';
import { Colors } from '../src/constants/colors';
import { CATEGORIES as GAME_MODES } from '../src/constants/categories';
import { Avatar } from '../src/components/ui/Avatar';
import api from '../src/services/api';

export default function ChallengeScreen() {
  const { theme } = useSettingsStore();
  const { user } = useUserStore();
  const C = Colors[theme];
  const [challenge, setChallenge] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [myScore, setMyScore]    = useState<number | null>(null);
  const [loading, setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/challenge/today'),
      api.get('/challenge/leaderboard'),
    ]).then(([c, lb]) => {
      setChallenge(c.data);
      setLeaderboard(lb.data);
      const mine = lb.data.find((e: any) => e.username === user?.username);
      if (mine) setMyScore(mine.score);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (!user) return null;
  const s = styles(C);
  const modeCfg = challenge ? GAME_MODES.find((m) => m.id === challenge.mode) : null;
  const today = new Date().toLocaleDateString('tr-TR', { day:'numeric', month:'long' });

  return (
    <SafeAreaView style={s.safe}>
      <TouchableOpacity onPress={() => router.back()} style={s.back}>
        <Text style={[s.backText, { color: C.textSecondary }]}>← Geri</Text>
      </TouchableOpacity>
      <Text style={[s.title, { color: C.textPrimary }]}>⚡ Günün Challenge'ı</Text>
      <Text style={[s.date, { color: C.textSecondary }]}>{today}</Text>

      {loading ? (
        <ActivityIndicator color={C.accentRed} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Mod kartı */}
          {modeCfg && (
            <View style={[s.modeCard, { backgroundColor: modeCfg.color + '15', borderColor: modeCfg.color }]}>
              <Text style={s.modeEmoji}>{modeCfg.icon}</Text>
              <View>
                <Text style={[s.modeName, { color: C.textPrimary }]}>{modeCfg.name}</Text>
                <Text style={[s.modeTag, { color: C.textSecondary }]}>{modeCfg.description}</Text>
                <Text style={[s.target, { color: modeCfg.color }]}>🎯 Hedef: {challenge?.target_score} puan</Text>
              </View>
            </View>
          )}

          {/* Kendi skoru */}
          {myScore !== null ? (
            <View style={[s.myScore, { backgroundColor: C.success + '15', borderColor: C.success }]}>
              <Text style={[s.myScoreText, { color: C.success }]}>✅ Bu günü oynadın: {myScore.toLocaleString('tr-TR')} puan</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[s.playBtn, { backgroundColor: modeCfg?.color ?? C.accentRed }]}
              onPress={() => {
              if (challenge) router.push({ pathname: `/game/${challenge.mode}` as any, params: { challengeId: challenge.id } });
            }}
            >
              <Text style={s.playBtnText}>▶ Şimdi Oyna — {modeCfg?.shortName}</Text>
            </TouchableOpacity>
          )}

          {/* Liderlik */}
          <Text style={[s.lbTitle, { color: C.textPrimary }]}>🏆 Bugünkü Sıralama</Text>
          {leaderboard.slice(0, 20).map((entry: any, i: number) => (
            <View key={i} style={[s.lbRow, {
              backgroundColor: entry.username === user.username ? C.accentRed + '15' : C.bgSecondary,
              borderColor: entry.username === user.username ? C.accentRed : C.border,
            }]}>
              <Text style={[s.lbRank, { color: i < 3 ? C.accentYellow : C.textSecondary }]}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
              </Text>
              <Avatar avatarId={entry.avatarId} size={32} />
              <Text style={[s.lbName, { color: C.textPrimary }]}>{entry.username}</Text>
              <Text style={[s.lbScore, { color: C.accentYellow }]}>{entry.score.toLocaleString('tr-TR')}</Text>
            </View>
          ))}
          {leaderboard.length === 0 && (
            <Text style={[s.empty, { color: C.textSecondary }]}>Henüz kimse oynamadı. İlk sen ol!</Text>
          )}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  back: { padding: 16, paddingBottom: 4 },
  backText: { fontFamily: 'Nunito-Regular', fontSize: 15 },
  title: { fontSize: 22, fontFamily: 'Nunito-ExtraBold', paddingHorizontal: 16 },
  date: { fontFamily: 'Nunito-Regular', fontSize: 13, paddingHorizontal: 16, marginBottom: 16 },
  modeCard: { marginHorizontal: 16, borderRadius: 16, padding: 16, flexDirection: 'row', gap: 14, borderWidth: 1.5, marginBottom: 12, alignItems: 'center' },
  modeEmoji: { fontSize: 48 },
  modeName: { fontFamily: 'Nunito-ExtraBold', fontSize: 18 },
  modeTag: { fontFamily: 'Nunito-Regular', fontSize: 13, marginBottom: 4 },
  target: { fontFamily: 'Nunito-Bold', fontSize: 14 },
  myScore: { marginHorizontal: 16, borderRadius: 12, padding: 14, borderWidth: 1.5, marginBottom: 12, alignItems: 'center' },
  myScoreText: { fontFamily: 'Nunito-Bold', fontSize: 15 },
  playBtn: { marginHorizontal: 16, borderRadius: 16, padding: 18, alignItems: 'center', marginBottom: 20 },
  playBtnText: { color: '#fff', fontFamily: 'Nunito-ExtraBold', fontSize: 17 },
  lbTitle: { paddingHorizontal: 16, fontFamily: 'Nunito-Bold', fontSize: 16, marginBottom: 8 },
  lbRow: { marginHorizontal: 16, marginBottom: 6, borderRadius: 12, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1 },
  lbRank: { width: 32, fontFamily: 'Nunito-Bold', fontSize: 14, textAlign: 'center' },
  lbName: { flex: 1, fontFamily: 'Nunito-Regular', fontSize: 14 },
  lbScore: { fontFamily: 'Nunito-ExtraBold', fontSize: 15 },
  empty: { textAlign: 'center', fontFamily: 'Nunito-Regular', fontSize: 14, marginTop: 24 },
});
