import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const TIERS = [
  { tier: 1,  reward: '🪙 50 Coin',    xp: 0,    unlocked: true  },
  { tier: 2,  reward: '✂️ 50:50 x2',  xp: 100,  unlocked: true  },
  { tier: 3,  reward: '🪙 100 Coin',   xp: 250,  unlocked: true  },
  { tier: 4,  reward: '🔀 Değiştir x2',xp: 500,  unlocked: false },
  { tier: 5,  reward: '🪙 150 Coin',   xp: 800,  unlocked: false },
  { tier: 6,  reward: '🦁 Aslan Avatar',xp: 1200, unlocked: false },
  { tier: 7,  reward: '🪙 200 Coin',   xp: 1600, unlocked: false },
  { tier: 8,  reward: '✕ Pas x3',      xp: 2000, unlocked: false },
  { tier: 9,  reward: '🪙 300 Coin',   xp: 2500, unlocked: false },
  { tier: 10, reward: '🦄 Unicorn Avatar',xp: 3000,unlocked: false},
  { tier: 15, reward: '🪙 500 Coin',   xp: 5000, unlocked: false },
  { tier: 20, reward: '🐲 Ejderha Avatar',xp: 7000,unlocked: false},
  { tier: 25, reward: '🪙 750 Coin',   xp: 10000,unlocked: false },
  { tier: 30, reward: '👑 VIP Rozet',  xp: 15000,unlocked: false },
];

export default function BattlePassScreen() {
  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.back}>← Geri</Text>
        </TouchableOpacity>
        <Text style={s.title}>🎫 Battle Pass</Text>
        <View style={{ width: 70 }} />
      </View>

      {/* Sezon banner */}
      <View style={s.seasonCard}>
        <Text style={s.seasonTitle}>🌟 1. Sezon</Text>
        <Text style={s.seasonSub}>Oyna → XP kazan → Ödülleri aç</Text>
        <View style={s.xpBar}>
          <View style={[s.xpFill, { width: '20%' }]} />
        </View>
        <Text style={s.xpTxt}>300 / 1500 XP</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.list}>
        {TIERS.map((t, i) => (
          <View key={i} style={[s.tierCard, t.unlocked && s.tierUnlocked]}>
            <View style={[s.tierBadge, { backgroundColor: t.unlocked ? '#6c3aed' : '#f3f4f6' }]}>
              <Text style={[s.tierNum, { color: t.unlocked ? '#fff' : '#9ca3af' }]}>{t.tier}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.tierReward, { color: t.unlocked ? '#111827' : '#6b7280' }]}>{t.reward}</Text>
              <Text style={s.tierXP}>{t.xp.toLocaleString('tr-TR')} XP</Text>
            </View>
            {t.unlocked
              ? <View style={s.claimedBadge}><Text style={s.claimedTxt}>✓ Açık</Text></View>
              : <View style={s.lockedBadge}><Text style={s.lockedTxt}>🔒</Text></View>
            }
          </View>
        ))}
        <View style={s.infoBox}>
          <Text style={s.infoTxt}>💡 Lig ve antrenman oynayarak XP kazan. Ödüller otomatik açılır.</Text>
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  back:  { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#fff', backgroundColor: '#6c3aed', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, overflow: 'hidden' },
  title: { fontFamily: 'Nunito-ExtraBold', fontSize: 18, color: '#111827' },
  seasonCard: { margin: 16, backgroundColor: '#6c3aed', borderRadius: 20, padding: 18, gap: 6 },
  seasonTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 20, color: '#fff' },
  seasonSub:   { fontFamily: 'Nunito-Regular', fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  xpBar:  { height: 8, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 4, overflow: 'hidden', marginTop: 6 },
  xpFill: { height: 8, backgroundColor: '#fbbf24', borderRadius: 4 },
  xpTxt:  { fontFamily: 'Nunito-Bold', fontSize: 11, color: 'rgba(255,255,255,0.75)', textAlign: 'right' },
  list: { paddingHorizontal: 16, paddingTop: 8, gap: 8 },
  tierCard:     { backgroundColor: '#f9fafb', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#f3f4f6' },
  tierUnlocked: { backgroundColor: '#f5f3ff', borderColor: '#c4b5fd' },
  tierBadge:    { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tierNum:      { fontFamily: 'Nunito-ExtraBold', fontSize: 14 },
  tierReward:   { fontFamily: 'Nunito-Bold', fontSize: 14, marginBottom: 2 },
  tierXP:       { fontFamily: 'Nunito-Regular', fontSize: 11, color: '#9ca3af' },
  claimedBadge: { backgroundColor: '#d1fae5', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  claimedTxt:   { fontFamily: 'Nunito-Bold', fontSize: 11, color: '#059669' },
  lockedBadge:  { backgroundColor: '#f3f4f6', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  lockedTxt:    { fontSize: 14 },
  infoBox: { backgroundColor: '#f9fafb', borderRadius: 14, padding: 14, marginTop: 4 },
  infoTxt: { fontFamily: 'Nunito-Regular', fontSize: 12, color: '#6b7280', textAlign: 'center', lineHeight: 18 },
});
