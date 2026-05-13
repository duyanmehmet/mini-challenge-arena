import { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSettingsStore } from '../src/store/settingsStore';
import { useUserStore } from '../src/store/userStore';
import { Colors } from '../src/constants/colors';
import api from '../src/services/api';

interface BPTier {
  tier: number;
  xpRequired: number;
  reward: string;
  rewardType: 'coins' | 'avatar' | 'badge' | 'title';
  claimed: boolean;
}

interface BPData {
  seasonXp: number;
  currentTier: number;
  tiers: BPTier[];
  seasonName: string;
  seasonEndsAt: string;
}

const REWARD_ICONS: Record<string, string> = {
  coins: '🪙',
  avatar: '🎭',
  badge: '🏅',
  title: '👑',
};

export default function BattlePassScreen() {
  const { theme } = useSettingsStore();
  const { user, addCoins } = useUserStore();
  const C = Colors[theme];

  const [data, setData]     = useState<BPData | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<number | null>(null);

  useEffect(() => { loadBP(); }, []);

  const loadBP = async () => {
    try {
      const res = await api.get('/battlepass/status');
      setData(res.data);
    } catch {
      // Backend yoksa demo data göster
      setData(generateDemoData());
    } finally { setLoading(false); }
  };

  const handleClaim = async (tier: number) => {
    setClaiming(tier);
    try {
      const res = await api.post('/battlepass/claim', { tier });
      if (res.data.coins) addCoins(res.data.coins);
      Alert.alert('🎉 Ödül Alındı!', res.data.message ?? 'Ödülün hesabına eklendi.');
      loadBP();
    } catch (e: any) {
      Alert.alert('Hata', e.response?.data?.message ?? 'Ödül alınamadı.');
    } finally { setClaiming(null); }
  };

  const s = styles(C);

  if (loading) return (
    <SafeAreaView style={s.safe}>
      <ActivityIndicator color={C.accentPurple} style={{ marginTop: 60 }} />
    </SafeAreaView>
  );

  if (!data) return null;

  const progressPct = data.tiers.length
    ? Math.min((data.currentTier / data.tiers.length) * 100, 100)
    : 0;

  const daysLeft = data.seasonEndsAt
    ? Math.max(0, Math.ceil((new Date(data.seasonEndsAt).getTime() - Date.now()) / 86400000))
    : 0;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[s.back, { color: C.textSecondary }]}>← Geri</Text>
        </TouchableOpacity>
        <Text style={[s.title, { color: C.textPrimary }]}>⭐ Battle Pass</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Sezon kartı */}
        <View style={[s.seasonCard, { backgroundColor: C.accentPurple + '22', borderColor: C.accentPurple }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={[s.seasonName, { color: C.accentPurple }]}>{data.seasonName}</Text>
              <Text style={[s.seasonSub, { color: C.textSecondary }]}>{daysLeft} gün kaldı</Text>
            </View>
            <View style={[s.tierBadge, { backgroundColor: C.accentPurple }]}>
              <Text style={s.tierBadgeText}>Tier {data.currentTier}</Text>
            </View>
          </View>

          {/* İlerleme çubuğu */}
          <View style={{ marginTop: 14 }}>
            <View style={[s.progressBg, { backgroundColor: C.bgTertiary }]}>
              <View style={[s.progressFill, { width: `${progressPct}%` as any, backgroundColor: C.accentPurple }]} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={[s.progressLabel, { color: C.textSecondary }]}>{data.seasonXp.toLocaleString()} XP</Text>
              <Text style={[s.progressLabel, { color: C.textSecondary }]}>
                {data.tiers[data.currentTier]?.xpRequired.toLocaleString() ?? '—'} XP (sonraki tier)
              </Text>
            </View>
          </View>
        </View>

        {/* Tier listesi */}
        <Text style={[s.sectionTitle, { color: C.textPrimary }]}>Ödüller</Text>
        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          {data.tiers.map((tier) => {
            const isUnlocked = data.currentTier >= tier.tier;
            const canClaim   = isUnlocked && !tier.claimed;
            const icon       = REWARD_ICONS[tier.rewardType] ?? '🎁';

            return (
              <View
                key={tier.tier}
                style={[
                  s.tierRow,
                  {
                    backgroundColor: tier.claimed ? C.bgTertiary : C.bgSecondary,
                    borderColor: canClaim ? C.accentPurple : tier.claimed ? C.bgTertiary : C.border,
                    borderWidth: canClaim ? 2 : 1,
                    opacity: isUnlocked ? 1 : 0.5,
                  },
                ]}
              >
                {/* Tier numarası */}
                <View style={[s.tierNum, { backgroundColor: isUnlocked ? C.accentPurple : C.bgTertiary }]}>
                  <Text style={[s.tierNumText, { color: isUnlocked ? '#fff' : C.textSecondary }]}>
                    {tier.claimed ? '✓' : String(tier.tier)}
                  </Text>
                </View>

                {/* İkon + Ödül */}
                <Text style={s.rewardIcon}>{icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[s.rewardText, { color: isUnlocked ? C.textPrimary : C.textSecondary }]}>
                    {tier.reward}
                  </Text>
                  <Text style={[s.xpReq, { color: C.textSecondary }]}>{tier.xpRequired.toLocaleString()} XP</Text>
                </View>

                {/* Claim butonu */}
                {canClaim && (
                  <TouchableOpacity
                    style={[s.claimBtn, { backgroundColor: C.accentPurple }]}
                    onPress={() => handleClaim(tier.tier)}
                    disabled={claiming === tier.tier}
                  >
                    {claiming === tier.tier
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <Text style={s.claimBtnText}>Al</Text>}
                  </TouchableOpacity>
                )}
                {tier.claimed && (
                  <Text style={[s.claimedText, { color: C.success }]}>✅ Alındı</Text>
                )}
                {!isUnlocked && (
                  <Text style={[s.lockedText, { color: C.textSecondary }]}>🔒</Text>
                )}
              </View>
            );
          })}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function generateDemoData(): BPData {
  return {
    seasonName: 'Sezon 1 — Başlangıç',
    seasonXp: 350,
    currentTier: 3,
    seasonEndsAt: new Date(Date.now() + 20 * 86400000).toISOString(),
    tiers: [
      { tier: 1,  xpRequired: 0,    reward: '50 Coin',              rewardType: 'coins',  claimed: true  },
      { tier: 2,  xpRequired: 100,  reward: '100 Coin',             rewardType: 'coins',  claimed: true  },
      { tier: 3,  xpRequired: 200,  reward: 'Özel Avatar: Kahraman',rewardType: 'avatar', claimed: false },
      { tier: 4,  xpRequired: 350,  reward: '150 Coin',             rewardType: 'coins',  claimed: false },
      { tier: 5,  xpRequired: 500,  reward: '"Bilge" Unvanı',       rewardType: 'title',  claimed: false },
      { tier: 6,  xpRequired: 700,  reward: '200 Coin',             rewardType: 'coins',  claimed: false },
      { tier: 7,  xpRequired: 900,  reward: 'Özel Rozet: Yıldız',   rewardType: 'badge',  claimed: false },
      { tier: 8,  xpRequired: 1200, reward: '300 Coin',             rewardType: 'coins',  claimed: false },
      { tier: 9,  xpRequired: 1500, reward: 'Özel Avatar: Kral',    rewardType: 'avatar', claimed: false },
      { tier: 10, xpRequired: 2000, reward: '"Efsane" Unvanı + 500 Coin', rewardType: 'title', claimed: false },
    ],
  };
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  back: { fontFamily: 'Nunito-Regular', fontSize: 15 },
  title: { fontFamily: 'Nunito-ExtraBold', fontSize: 20 },
  seasonCard: { margin: 16, borderRadius: 18, padding: 18, borderWidth: 1.5 },
  seasonName: { fontFamily: 'Nunito-ExtraBold', fontSize: 20 },
  seasonSub: { fontFamily: 'Nunito-Regular', fontSize: 13, marginTop: 2 },
  tierBadge: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  tierBadgeText: { fontFamily: 'Nunito-ExtraBold', fontSize: 13, color: '#fff' },
  progressBg: { height: 10, borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5 },
  progressLabel: { fontFamily: 'Nunito-Regular', fontSize: 11 },
  sectionTitle: { fontFamily: 'Nunito-Bold', fontSize: 16, paddingHorizontal: 16, marginBottom: 8, marginTop: 4 },
  tierRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, gap: 10 },
  tierNum: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  tierNumText: { fontFamily: 'Nunito-ExtraBold', fontSize: 14 },
  rewardIcon: { fontSize: 24 },
  rewardText: { fontFamily: 'Nunito-Bold', fontSize: 14 },
  xpReq: { fontFamily: 'Nunito-Regular', fontSize: 11, marginTop: 2 },
  claimBtn: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  claimBtnText: { fontFamily: 'Nunito-ExtraBold', fontSize: 13, color: '#fff' },
  claimedText: { fontFamily: 'Nunito-Bold', fontSize: 13 },
  lockedText: { fontSize: 18 },
});
