import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useSettingsStore } from '../src/store/settingsStore';
import { useUserStore } from '../src/store/userStore';
import { Colors } from '../src/constants/colors';
import { CATEGORIES } from '../src/constants/categories';
import { Avatar } from '../src/components/ui/Avatar';
import api from '../src/services/api';

interface Status {
  score: number | null;
  completed: boolean;
  streak: number;
  rank: number | null;
  xpBonus: number | null;
}

export default function ChallengeScreen() {
  const { theme } = useSettingsStore();
  const { user }  = useUserStore();
  const C = Colors[theme];
  const s = styles(C);

  const [challenge, setChallenge]     = useState<any>(null);
  const [status, setStatus]           = useState<Status | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);

  // İlerleme çubuğu animasyonu
  const progressAnim = useState(new Animated.Value(0))[0];

  // Oyundan dönünce durum yenilenir
  useFocusEffect(useCallback(() => {
    loadAll();
  }, []));

  useEffect(() => {
    if (!challenge || status?.score == null) return;
    const pct = Math.min(status.score / challenge.target_score, 1);
    Animated.timing(progressAnim, { toValue: pct, duration: 900, useNativeDriver: false }).start();
  }, [challenge, status]);

  const loadAll = async () => {
    try {
      const [cRes, stRes, lbRes] = await Promise.all([
        api.get('/challenge/today'),
        api.get('/challenge/my-status'),
        api.get('/challenge/leaderboard'),
      ]);
      setChallenge(cRes.data);
      setStatus(stRes.data);
      setLeaderboard(lbRes.data ?? []);
    } catch {}
    finally { setLoading(false); }
  };

  if (!user) return null;

  const catCfg     = challenge ? CATEGORIES.find((m) => m.id === challenge.mode) : null;
  const catColor   = catCfg?.color ?? C.accentRed;
  const today      = new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });
  const targetXP   = 100;
  const bonusXP    = 25;
  const pct        = challenge && status?.score != null
    ? Math.min((status.score / challenge.target_score) * 100, 100)
    : 0;
  const met        = status?.completed ?? false;

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[s.backIcon, { color: C.textSecondary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[s.pageTitle, { color: C.textPrimary }]}>⚡ Günün Görevi</Text>
        {/* Streak */}
        {status && status.streak > 0 ? (
          <View style={[s.streakBadge, { backgroundColor: '#f0c040' + '22', borderColor: '#f0c040' }]}>
            <Text style={s.streakFire}>🔥</Text>
            <Text style={s.streakCount}>{status.streak}</Text>
          </View>
        ) : <View style={{ width: 56 }} />}
      </View>

      {loading ? (
        <ActivityIndicator color={catColor} style={{ marginTop: 60 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 14 }}>

          {/* Tarih */}
          <Text style={[s.dateText, { color: C.textSecondary }]}>{today}</Text>

          {/* Kategori kartı */}
          {catCfg && (
            <View style={[s.heroCard, { backgroundColor: catColor + '18', borderColor: catColor }]}>
              <Text style={s.heroIcon}>{catCfg.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.heroCategory, { color: C.textSecondary }]}>Bugünün Kategorisi</Text>
                <Text style={[s.heroName, { color: C.textPrimary }]}>{catCfg.name}</Text>
                <Text style={[s.heroDesc, { color: C.textSecondary }]} numberOfLines={2}>{catCfg.description}</Text>
              </View>
            </View>
          )}

          {/* Hedef & İlerleme */}
          <View style={[s.goalCard, { backgroundColor: C.bgSecondary }]}>
            <View style={s.goalHeader}>
              <Text style={[s.goalLabel, { color: C.textSecondary }]}>Hedef Puan</Text>
              <Text style={[s.goalTarget, { color: catColor }]}>
                {challenge?.target_score?.toLocaleString('tr-TR')} puan
              </Text>
            </View>

            {/* Progress bar */}
            <View style={[s.progressTrack, { backgroundColor: C.bgTertiary }]}>
              <Animated.View style={[s.progressFill, {
                backgroundColor: met ? C.success : catColor,
                width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
              }]} />
            </View>

            {/* Puan göstergesi */}
            <View style={s.progressLabels}>
              <Text style={[s.progressLeft, { color: C.textSecondary }]}>
                {status?.score != null ? `${status.score.toLocaleString('tr-TR')} puan` : 'Henüz oynamadın'}
              </Text>
              <Text style={[s.progressRight, { color: C.textSecondary }]}>
                {Math.round(pct)}%
              </Text>
            </View>

            {/* Tamamlanma durumu */}
            {met ? (
              <View style={[s.completedBadge, { backgroundColor: C.success + '22', borderColor: C.success }]}>
                <Text style={[s.completedText, { color: C.success }]}>
                  ✅ Hedefi aştın! +{targetXP} XP kazandın
                </Text>
              </View>
            ) : status?.score != null ? (
              <View style={[s.completedBadge, { backgroundColor: C.accentYellow + '18', borderColor: C.accentYellow }]}>
                <Text style={[s.completedText, { color: C.accentYellow }]}>
                  🎯 {(challenge.target_score - status.score).toLocaleString('tr-TR')} puan daha — hedefi geç!
                </Text>
              </View>
            ) : null}
          </View>

          {/* XP Ödülleri */}
          <View style={[s.rewardRow, { backgroundColor: C.bgSecondary }]}>
            <RewardBox
              icon="⚡"
              label="Oynayınca"
              value={`+${bonusXP} XP`}
              done={status?.score != null}
              color={C.accentTeal}
            />
            <View style={[s.rewardDivider, { backgroundColor: C.border }]} />
            <RewardBox
              icon="🏆"
              label="Hedefi Geçince"
              value={`+${targetXP} XP`}
              done={met}
              color='#f0c040'
            />
            <View style={[s.rewardDivider, { backgroundColor: C.border }]} />
            <RewardBox
              icon="🔥"
              label="Günlük Seri"
              value={`${status?.streak ?? 0} gün`}
              done={(status?.streak ?? 0) > 0}
              color={C.accentRed}
            />
          </View>

          {/* Oyna / Tekrar Oyna butonu */}
          {status?.score == null ? (
            <TouchableOpacity
              style={[s.playBtn, { backgroundColor: catColor }]}
              onPress={() => {
                if (challenge) router.push({
                  pathname: `/game/${challenge.mode}` as any,
                  params: { challengeId: challenge.id },
                });
              }}
            >
              <Text style={s.playBtnText}>▶ Göreve Başla</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[s.playBtn, { backgroundColor: met ? C.success : catColor }]}
              onPress={() => {
                if (challenge) router.push({
                  pathname: `/game/${challenge.mode}` as any,
                  params: { challengeId: challenge.id },
                });
              }}
            >
              <Text style={s.playBtnText}>
                {met ? '🏅 Skoru İyileştir' : '🔄 Tekrar Oyna — Hedefi Geç!'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Sıralama */}
          <Text style={[s.lbTitle, { color: C.textPrimary }]}>🏆 Bugünkü Sıralama</Text>

          {leaderboard.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 32, gap: 8 }}>
              <Text style={{ fontSize: 36 }}>🎯</Text>
              <Text style={[s.emptyText, { color: C.textSecondary }]}>
                Henüz kimse oynamadı.{'\n'}İlk sen ol!
              </Text>
            </View>
          ) : (
            leaderboard.slice(0, 20).map((entry, i) => {
              const isMe = entry.username === user.username;
              const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
              return (
                <View key={i} style={[s.lbRow, {
                  backgroundColor: isMe ? catColor + '18' : C.bgSecondary,
                  borderWidth: isMe ? 1.5 : 0,
                  borderColor: catColor,
                }]}>
                  <View style={s.lbRankBox}>
                    {medal
                      ? <Text style={{ fontSize: 20 }}>{medal}</Text>
                      : <Text style={[s.lbRankNum, { color: C.textSecondary }]}>#{i + 1}</Text>
                    }
                  </View>
                  <Avatar avatarId={entry.avatarId} size={30} />
                  <Text style={[s.lbName, { color: C.textPrimary, fontFamily: isMe ? 'Nunito-Bold' : 'Nunito-Regular' }]} numberOfLines={1}>
                    {entry.username}{isMe ? ' (Sen)' : ''}
                  </Text>
                  <Text style={[s.lbScore, { color: '#f0c040' }]}>
                    {entry.score.toLocaleString('tr-TR')}
                  </Text>
                </View>
              );
            })
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function RewardBox({ icon, label, value, done, color }: {
  icon: string; label: string; value: string; done: boolean; color: string;
}) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 4, paddingVertical: 12 }}>
      <Text style={{ fontSize: done ? 22 : 18, opacity: done ? 1 : 0.4 }}>{icon}</Text>
      <Text style={{ fontFamily: 'Nunito-ExtraBold', fontSize: 13, color: done ? color : '#888' }}>{value}</Text>
      <Text style={{ fontFamily: 'Nunito-Regular', fontSize: 10, color: '#888', textAlign: 'center' }}>{label}</Text>
      {done && <View style={{ width: 20, height: 2, borderRadius: 1, backgroundColor: color }} />}
    </View>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  safe:            { flex: 1, backgroundColor: C.bgPrimary },
  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backIcon:        { fontSize: 22 },
  pageTitle:       { fontFamily: 'Nunito-ExtraBold', fontSize: 18 },
  streakBadge:     { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1.5 },
  streakFire:      { fontSize: 14 },
  streakCount:     { fontFamily: 'Nunito-ExtraBold', fontSize: 14, color: '#f0c040' },
  dateText:        { fontFamily: 'Nunito-Regular', fontSize: 13, textTransform: 'capitalize' },

  // Hero kart
  heroCard:        { borderRadius: 18, borderWidth: 1.5, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  heroIcon:        { fontSize: 52 },
  heroCategory:    { fontFamily: 'Nunito-Regular', fontSize: 11, marginBottom: 2 },
  heroName:        { fontFamily: 'Nunito-ExtraBold', fontSize: 20, marginBottom: 4 },
  heroDesc:        { fontFamily: 'Nunito-Regular', fontSize: 12, lineHeight: 18 },

  // Hedef kartı
  goalCard:        { borderRadius: 16, padding: 16, gap: 10 },
  goalHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  goalLabel:       { fontFamily: 'Nunito-Regular', fontSize: 13 },
  goalTarget:      { fontFamily: 'Nunito-ExtraBold', fontSize: 18 },
  progressTrack:   { height: 10, borderRadius: 5, overflow: 'hidden' },
  progressFill:    { height: '100%', borderRadius: 5 },
  progressLabels:  { flexDirection: 'row', justifyContent: 'space-between' },
  progressLeft:    { fontFamily: 'Nunito-Regular', fontSize: 12 },
  progressRight:   { fontFamily: 'Nunito-Bold', fontSize: 12 },
  completedBadge:  { borderRadius: 10, padding: 10, borderWidth: 1.5, alignItems: 'center' },
  completedText:   { fontFamily: 'Nunito-Bold', fontSize: 13, textAlign: 'center' },

  // Ödül kutusu
  rewardRow:       { borderRadius: 16, flexDirection: 'row', alignItems: 'center' },
  rewardDivider:   { width: 1, height: 50 },

  // Buton
  playBtn:         { borderRadius: 16, padding: 17, alignItems: 'center' },
  playBtnText:     { color: '#fff', fontFamily: 'Nunito-ExtraBold', fontSize: 16 },

  // Leaderboard
  lbTitle:         { fontFamily: 'Nunito-ExtraBold', fontSize: 15, marginTop: 4 },
  lbRow:           { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 10, gap: 10, marginBottom: 6 },
  lbRankBox:       { width: 32, alignItems: 'center' },
  lbRankNum:       { fontFamily: 'Nunito-Bold', fontSize: 13 },
  lbName:          { flex: 1, fontSize: 14 },
  lbScore:         { fontFamily: 'Nunito-ExtraBold', fontSize: 15 },
  emptyText:       { fontFamily: 'Nunito-Regular', fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
