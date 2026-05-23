import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useUserStore } from '../src/store/userStore';
import { CATEGORIES as GAME_MODES } from '../src/constants/categories';
import { userService } from '../src/services/user.service';

const BG    = '#ffffff';
const PURP  = '#6c3aed';
const PURP2 = '#8b5cf6';
const TEXT  = '#111827';
const MUTED = '#9ca3af';
const GOLD  = '#f59e0b';

const LEAGUE_ICONS: Record<string, string> = {
  filiz:'🌱',kaya:'🪨',demir:'🔩',celik:'⚔️',bronz:'🥉',
  gumus:'🥈',altin:'🥇',safir:'🔵',zumrut:'💚',elmas:'💎',
  platin:'🔷',kristal:'🌟',mistik:'🔮',ay:'🌙',gunes:'☀️',
  simsek:'⚡',alev:'🔥',okyanus:'🌊',zirve:'🏔️',kartal:'🦅',
  ejderha:'🐉',galaksi:'🌌',nova:'💫',efsane:'🦄',kral:'👑',
  yildiz:'⭐',meteor:'🌠',zafer:'🏆',elit:'🎯',sampiyon:'🏅',
};

interface Stats {
  totalGames: number;
  totalDuels: number;
  winRate: number;
  streakCount: number;
  maxStreak: number;
  weeklyScore: number;
}

export default function StatsScreen() {
  const { user, personalBests, badges } = useUserStore();
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.getStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  const xpNeeded = user.level * 500;
  const xpPct    = Math.min(user.xp / xpNeeded, 1);
  const totalBestScore = personalBests.reduce((sum, p) => sum + p.score, 0);
  const bestMode = personalBests.reduce((best, p) => (!best || p.score > best.score ? p : best), null as any);

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtnWrap}>
          <Text style={s.backBtn}>← Geri</Text>
        </TouchableOpacity>
        <Text style={s.title}>📊 İstatistikler</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Profil özet kartı */}
        <View style={s.profileCard}>
          <View style={s.profileRow}>
            <View style={s.bigStat}>
              <Text style={[s.bigNum, { color: PURP }]}>{user.level}</Text>
              <Text style={s.bigLabel}>Seviye</Text>
            </View>
            <View style={s.bigStat}>
              <Text style={[s.bigNum, { color: '#f97316' }]}>{user.streakCount}</Text>
              <Text style={s.bigLabel}>🔥 Seri</Text>
            </View>
            <View style={s.bigStat}>
              <Text style={[s.bigNum, { color: GOLD }]}>{badges.length}</Text>
              <Text style={s.bigLabel}>Rozet</Text>
            </View>
            <View style={s.bigStat}>
              <Text style={{ fontSize: 26 }}>{LEAGUE_ICONS[user.currentLeague ?? 'bronz'] ?? '🥉'}</Text>
              <Text style={s.bigLabel}>Lig</Text>
            </View>
          </View>
          {/* XP bar */}
          <View style={{ marginTop: 14 }}>
            <View style={s.xpBg}>
              <View style={[s.xpFill, { width: `${xpPct * 100}%` as any }]} />
            </View>
            <Text style={s.xpTxt}>{user.xp.toLocaleString('tr-TR')} / {xpNeeded.toLocaleString('tr-TR')} XP</Text>
          </View>
        </View>

        {/* Oyun istatistikleri */}
        {loading ? (
          <View style={s.loadingWrap}><ActivityIndicator color={PURP2} /></View>
        ) : stats && (
          <View style={s.statsGrid}>
            <StatCard icon="🎮" label="Toplam Oyun" value={stats.totalGames.toLocaleString('tr-TR')} color="#06b6d4" />
            <StatCard icon="⚔️" label="Düello" value={stats.totalDuels.toLocaleString('tr-TR')} color="#8b5cf6" />
            <StatCard icon="🏆" label="Kazanma Oranı" value={`%${stats.winRate}`} color="#22c55e" />
            <StatCard icon="📅" label="Max Seri" value={`${stats.maxStreak} gün`} color="#f97316" />
            <StatCard icon="⭐" label="Haftalık Puan" value={stats.weeklyScore.toLocaleString('tr-TR')} color={GOLD} />
            <StatCard icon="🎖️" label="Toplam Rekor" value={totalBestScore.toLocaleString('tr-TR')} color={PURP} />
          </View>
        )}

        {/* En iyi mod */}
        {bestMode && (
          <View style={s.bestModeCard}>
            <Text style={s.sectionTitle}>🥇 En İyi Mod</Text>
            {(() => {
              const m = GAME_MODES.find(x => x.id === bestMode.mode);
              return (
                <View style={[s.bestModeRow, { borderColor: (m?.color ?? PURP) + '40' }]}>
                  <View style={[s.modeIconBg, { backgroundColor: (m?.color ?? PURP) + '20' }]}>
                    <Text style={{ fontSize: 28 }}>{m?.icon ?? '🎮'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.modeNameTxt}>{m?.name ?? bestMode.mode}</Text>
                  </View>
                  <Text style={[s.modeScore, { color: GOLD }]}>{bestMode.score.toLocaleString('tr-TR')}</Text>
                </View>
              );
            })()}
          </View>
        )}

        {/* Mod rekorları */}
        <Text style={[s.sectionTitle, { paddingHorizontal: 20, marginTop: 8 }]}>🎮 Mod Rekorları</Text>
        <View style={s.modesWrap}>
          {GAME_MODES.map(mode => {
            const pb = personalBests.find(p => p.mode === mode.id);
            return (
              <View key={mode.id} style={[s.modeRow, { borderLeftColor: mode.color }]}>
                <View style={[s.modeIconSm, { backgroundColor: mode.color + '18' }]}>
                  <Text style={{ fontSize: 18 }}>{mode.icon}</Text>
                </View>
                <Text style={s.modeRowName} numberOfLines={1}>{mode.shortName}</Text>
                <Text style={[s.modeRowScore, { color: pb ? GOLD : MUTED }]}>
                  {pb ? pb.score.toLocaleString('tr-TR') : '—'}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <View style={[s.statCard, { borderTopColor: color }]}>
      <Text style={{ fontSize: 22, marginBottom: 4 }}>{icon}</Text>
      <Text style={[s.statCardNum, { color }]}>{value}</Text>
      <Text style={s.statCardLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: BG },
  scroll: { paddingBottom: 20 },

  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  backBtnWrap: {},
  backBtn:     { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#fff', backgroundColor: PURP, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, overflow: 'hidden' },
  title:       { fontFamily: 'Nunito-ExtraBold', fontSize: 20, color: TEXT },

  // Profil kartı
  profileCard: {
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: '#f3f4f6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  profileRow: { flexDirection: 'row', justifyContent: 'space-around' },
  bigStat:    { alignItems: 'center', gap: 4 },
  bigNum:     { fontFamily: 'Nunito-ExtraBold', fontSize: 28 },
  bigLabel:   { fontFamily: 'Nunito-Regular', fontSize: 12, color: MUTED },
  xpBg:       { height: 7, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden' },
  xpFill:     { height: 7, backgroundColor: PURP2, borderRadius: 4 },
  xpTxt:      { fontFamily: 'Nunito-Regular', fontSize: 11, color: MUTED, textAlign: 'right', marginTop: 4 },

  loadingWrap: { alignItems: 'center', padding: 20 },

  // İstatistik grid
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, gap: 10, marginBottom: 16,
  },
  statCard: {
    width: '30%', flexGrow: 1,
    backgroundColor: '#fff', borderRadius: 16, padding: 14,
    alignItems: 'center', borderTopWidth: 3,
    borderWidth: 1, borderColor: '#f3f4f6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  statCardNum:   { fontFamily: 'Nunito-ExtraBold', fontSize: 18, marginBottom: 2 },
  statCardLabel: { fontFamily: 'Nunito-Regular', fontSize: 11, color: MUTED, textAlign: 'center' },

  // En iyi mod
  bestModeCard: {
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: '#fff', borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: '#f3f4f6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  bestModeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginTop: 10, borderRadius: 14, borderWidth: 1.5, padding: 12,
  },
  modeIconBg:  { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  modeNameTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: TEXT },
  modeCatTxt:  { fontFamily: 'Nunito-Regular', fontSize: 12, color: MUTED, marginTop: 2 },
  modeScore:   { fontFamily: 'Nunito-ExtraBold', fontSize: 20 },

  sectionTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 17, color: TEXT, marginBottom: 10 },

  // Mod rekorları listesi
  modesWrap: { paddingHorizontal: 16, gap: 7 },
  modeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: '#f3f4f6', borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1,
  },
  modeIconSm:   { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modeRowName:  { flex: 1, fontFamily: 'Nunito-Bold', fontSize: 14, color: TEXT },
  modeRowScore: { fontFamily: 'Nunito-ExtraBold', fontSize: 15 },
});
